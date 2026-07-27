import { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';

import {
  Achievement,
  Card,
  GameSettings,
  GameStage,
  GameStats,
  HandHistoryRecord,
  Player,
  Pot,
  SavedGameState,
} from './types/poker';
import { createDeck } from './utils/cardUtils';
import { evaluateBestHand } from './utils/handEvaluator';
import { calculatePots } from './utils/sidePotCalculator';
import { decideAIAction } from './utils/aiLogic';
import { soundEffects } from './utils/soundEffects';
import { ACHIEVEMENTS, evaluateAchievements, AchievementCheckContext } from './utils/achievements';

import { HeaderNav } from './components/HeaderNav';
import { PokerTable } from './components/PokerTable';
import { ControlPanel } from './components/ControlPanel';
import { OddsCalculator } from './components/OddsCalculator';
import { ShowdownOverlay } from './components/ShowdownOverlay';
import { SettingsModal } from './components/SettingsModal';
import { StatsModal } from './components/StatsModal';
import { RulesModal } from './components/RulesModal';
import { HandHistoryModal } from './components/HandHistoryModal';
import { ContinueGameModal } from './components/ContinueGameModal';
import { AchievementToast } from './components/AchievementToast';
import { AchievementsModal } from './components/AchievementsModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';

const SAVE_STORAGE_KEY = 'poker_saved_game_v1';

const BOT_PRESETS: Omit<Player, 'id' | 'chips' | 'cards' | 'currentBet' | 'totalInvestedThisHand' | 'isFolded' | 'isAllIn' | 'isDealer' | 'isSmallBlind' | 'isBigBlind' | 'hasActedThisRound'>[] = [
  { name: 'Slick Rick', avatar: '🕶️', playStyle: 'loose_aggressive', isUser: false },
  { name: 'Prof. Poker', avatar: '🎓', playStyle: 'tight_aggressive', isUser: false },
  { name: 'Lucky Lucy', avatar: '🎰', playStyle: 'maniac', isUser: false },
  { name: 'Calm Charlie', avatar: '☕', playStyle: 'tight_passive', isUser: false },
  { name: 'Calling Cathy', avatar: '📞', playStyle: 'calling_station', isUser: false },
];

export default function App() {
  // Game Settings
  const [settings, setSettings] = useState<GameSettings>({
    numPlayers: 6,
    smallBlind: 10,
    bigBlind: 20,
    blindIncreaseInterval: 10,
    soundEnabled: true,
    showOdds: true,
    handAdviceEnabled: true,
    gameSpeed: 'normal',
    startingChips: 1000,
  });

  // Game Stats
  const [stats, setStats] = useState<GameStats>({
    handsPlayed: 0,
    handsWon: 0,
    totalProfit: 0,
    biggestWin: 0,
    bestHandEver: '',
    totalChipsBet: 0,
  });

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  // User Auth & Firebase State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Achievements & Toasts State
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    Record<string, { unlockedAt: string; progress: number }>
  >({});
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [activeToast, setActiveToast] = useState<Achievement | null>(null);
  const hasReboughtBefore = useRef(false);

  // Core Game State
  const [handNumber, setHandNumber] = useState(1);
  const [deck, setDeck] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [stage, setStage] = useState<GameStage>('HAND_OVER');
  const [dealerIndex, setDealerIndex] = useState(0);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [currentHighestBet, setCurrentHighestBet] = useState(0);
  const [minRaiseAmount, setMinRaiseAmount] = useState(0);
  const [pots, setPots] = useState<Pot[]>([]);
  const [winningCardIds, setWinningCardIds] = useState<Set<string>>(new Set());
  const [handHistory, setHandHistory] = useState<HandHistoryRecord[]>([]);
  const [userWonHand, setUserWonHand] = useState(false);

  // Refs to track execution locks
  const isProcessingAITurn = useRef(false);
  const hasStartedFirstHand = useRef(false);
  const hasResolvedShowdown = useRef(false);

  // Initialize Players
  const [players, setPlayers] = useState<Player[]>(() => {
    const user: Player = {
      id: 'user',
      name: 'You',
      avatar: '🧔',
      chips: 1000,
      currentBet: 0,
      totalInvestedThisHand: 0,
      cards: [],
      isFolded: false,
      isAllIn: false,
      isUser: true,
      playStyle: 'tight_aggressive',
      isDealer: true,
      isSmallBlind: false,
      isBigBlind: false,
      hasActedThisRound: false,
    };

    const bots: Player[] = BOT_PRESETS.slice(0, 5).map((preset, idx) => ({
      ...preset,
      id: `bot_${idx + 1}`,
      chips: 1000,
      currentBet: 0,
      totalInvestedThisHand: 0,
      cards: [],
      isFolded: false,
      isAllIn: false,
      isDealer: false,
      isSmallBlind: false,
      isBigBlind: false,
      hasActedThisRound: false,
    }));

    return [user, ...bots];
  });

  // Keep sound effects synchronized
  useEffect(() => {
    soundEffects.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Adjust player count if settings change
  useEffect(() => {
    setPlayers((prev) => {
      if (prev.length === settings.numPlayers) return prev;
      const user = prev.find((p) => p.isUser) || prev[0];
      const existingBots = prev.filter((p) => !p.isUser);

      const neededBots = settings.numPlayers - 1;
      let updatedBots = [...existingBots];

      if (updatedBots.length < neededBots) {
        // Add more bots
        for (let i = updatedBots.length; i < neededBots; i++) {
          const preset = BOT_PRESETS[i % BOT_PRESETS.length];
          updatedBots.push({
            ...preset,
            id: `bot_${i + 1}`,
            chips: settings.startingChips,
            currentBet: 0,
            totalInvestedThisHand: 0,
            cards: [],
            isFolded: false,
            isAllIn: false,
            isDealer: false,
            isSmallBlind: false,
            isBigBlind: false,
            hasActedThisRound: false,
          });
        }
      } else {
        updatedBots = updatedBots.slice(0, neededBots);
      }

      return [user, ...updatedBots];
    });
  }, [settings.numPlayers, settings.startingChips]);

  // Calculate total pot amount
  const totalPotAmount = pots.reduce((acc, p) => acc + p.amount, 0) +
    players.reduce((acc, p) => acc + p.currentBet, 0);

  // Process Steam Toast Queue
  useEffect(() => {
    if (!activeToast && toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setActiveToast(nextToast);
      setToastQueue((prev) => prev.slice(1));
    }
  }, [activeToast, toastQueue]);

  // Achievement Check & Unlock Helper
  const checkAndApplyAchievements = useCallback(
    (ctx: AchievementCheckContext) => {
      setUnlockedAchievements((prevUnlocked) => {
        const { updatedUnlocked, newlyUnlocked } = evaluateAchievements(prevUnlocked, ctx);

        if (newlyUnlocked.length > 0) {
          if (settings.soundEnabled) {
            soundEffects.playAchievementUnlock();
          }
          setToastQueue((prevQueue) => [...prevQueue, ...newlyUnlocked]);
        }

        return updatedUnlocked;
      });
    },
    [settings.soundEnabled]
  );

  // Save Game State
  const [savedGameState, setSavedGameState] = useState<SavedGameState | null>(null);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [isGameInitialized, setIsGameInitialized] = useState(false);

  // START A NEW HAND
  const startNewHand = useCallback((customPlayers?: Player[]) => {
    const currentPlayers = customPlayers || players;
    const newDeck = createDeck();
    let deckIdx = 0;

    // Filter out busted players or top them up for AI
    const nextDealerIdx = (dealerIndex + 1) % currentPlayers.length;
    const sbIdx = (nextDealerIdx + 1) % currentPlayers.length;
    const bbIdx = (nextDealerIdx + 2) % currentPlayers.length;

    const sbAmount = settings.smallBlind;
    const bbAmount = settings.bigBlind;

    // Reset player states & post blinds
    const updatedPlayers = currentPlayers.map((p, idx) => {
      // Auto top up bots if broke
      let currentChips = p.chips;
      if (!p.isUser && currentChips < bbAmount) {
        currentChips = settings.startingChips;
      }

      const isDealer = idx === nextDealerIdx;
      const isSmallBlind = idx === sbIdx;
      const isBigBlind = idx === bbIdx;

      let postedBet = 0;
      if (isSmallBlind) postedBet = Math.min(sbAmount, currentChips);
      if (isBigBlind) postedBet = Math.min(bbAmount, currentChips);

      // Deal 2 cards
      const holeCards = [newDeck[deckIdx++], newDeck[deckIdx++]];

      return {
        ...p,
        chips: currentChips - postedBet,
        currentBet: postedBet,
        totalInvestedThisHand: postedBet,
        cards: holeCards,
        isFolded: currentChips <= 0,
        isAllIn: currentChips > 0 && currentChips === postedBet,
        isDealer,
        isSmallBlind,
        isBigBlind,
        hasActedThisRound: false,
        lastAction: isSmallBlind ? `SB $${postedBet}` : isBigBlind ? `BB $${postedBet}` : undefined,
        comment: undefined,
        showCards: false,
      };
    });

    setDealerIndex(nextDealerIdx);
    setDeck(newDeck.slice(deckIdx));
    setCommunityCards([]);
    setStage('PRE_FLOP');
    setCurrentHighestBet(bbAmount);
    setMinRaiseAmount(bbAmount * 2);
    setPots([]);
    setWinningCardIds(new Set());
    setUserWonHand(false);
    hasResolvedShowdown.current = false;

    // Active turn starts after Big Blind (UTG)
    const firstToActIdx = (bbIdx + 1) % updatedPlayers.length;
    setActivePlayerIndex(firstToActIdx);
    setPlayers(updatedPlayers);

    if (settings.soundEnabled) {
      soundEffects.playCardDeal();
    }

    const userP = updatedPlayers.find((p) => p.isUser);
    checkAndApplyAchievements({
      stats,
      userChips: userP ? userP.chips : 1000,
      userCards: userP?.cards,
    });
  }, [dealerIndex, players, settings, stats, checkAndApplyAchievements]);

  // Check for saved game on initial launch
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_STORAGE_KEY);
      if (raw) {
        const parsed: SavedGameState = JSON.parse(raw);
        if (parsed && typeof parsed.userChips === 'number' && parsed.userChips >= 0) {
          if (parsed.unlockedAchievements) {
            setUnlockedAchievements(parsed.unlockedAchievements);
          }
          setSavedGameState(parsed);
          setShowContinueModal(true);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved game:', e);
    }

    // No valid saved game found -> initialize new game
    setIsGameInitialized(true);
    hasStartedFirstHand.current = true;
    startNewHand();
  }, []);

  // Handler: Continue Saved Game
  const handleContinueGame = useCallback(() => {
    if (savedGameState) {
      if (savedGameState.settings) setSettings(savedGameState.settings);
      if (savedGameState.stats) setStats(savedGameState.stats);
      if (savedGameState.handNumber) setHandNumber(savedGameState.handNumber);
      if (savedGameState.handHistory) setHandHistory(savedGameState.handHistory);
      if (savedGameState.unlockedAchievements) {
        setUnlockedAchievements(savedGameState.unlockedAchievements);
      }

      let restoredPlayers = players;
      if (savedGameState.players && savedGameState.players.length > 0) {
        restoredPlayers = players.map((p) => {
          const savedP = savedGameState.players.find(
            (sp) => sp.id === p.id || (p.isUser && sp.isUser)
          );
          if (savedP && typeof savedP.chips === 'number') {
            return { ...p, chips: savedP.chips };
          }
          return p;
        });
        setPlayers(restoredPlayers);
      }

      setShowContinueModal(false);
      setIsGameInitialized(true);
      hasStartedFirstHand.current = true;
      startNewHand(restoredPlayers);
    }
  }, [savedGameState, players, startNewHand]);

  // Handler: Start New Game
  const handleStartNewGame = useCallback(() => {
    const startingChips = settings.startingChips || 1000;
    setHandNumber(1);
    setStats({
      handsPlayed: 0,
      handsWon: 0,
      totalProfit: 0,
      biggestWin: 0,
      bestHandEver: '',
      totalChipsBet: 0,
    });
    setHandHistory([]);
    const resetPlayers = players.map((p) => ({
      ...p,
      chips: startingChips,
      currentBet: 0,
      totalInvestedThisHand: 0,
      isFolded: false,
      isAllIn: false,
    }));
    setPlayers(resetPlayers);

    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear saved game:', e);
    }

    setShowContinueModal(false);
    setSavedGameState(null);
    setIsGameInitialized(true);
    hasStartedFirstHand.current = true;
    startNewHand(resetPlayers);
  }, [settings.startingChips, players, startNewHand]);

  // Auth observer & Cloud Data Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (typeof data.userChips === 'number') {
              setPlayers((prev) =>
                prev.map((p) =>
                  p.isUser
                    ? {
                        ...p,
                        chips: data.userChips,
                        name: user.displayName || p.name,
                      }
                    : p
                )
              );
            }
            if (data.stats) setStats(data.stats);
            if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements);
            if (data.settings) setSettings(data.settings);
            if (data.handHistory) setHandHistory(data.handHistory);
            if (data.handNumber) setHandNumber(data.handNumber);
          } else {
            // First time login - set up document
            const uPlayer = players.find((p) => p.isUser);
            await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Poker Player',
              userChips: uPlayer ? uPlayer.chips : 1000,
              stats,
              settings,
              unlockedAchievements,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error('Error fetching Firestore user data:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-save game state to localStorage & Firestore
  useEffect(() => {
    if (!isGameInitialized) return;

    const user = players.find((p) => p.isUser);
    const userChips = user ? user.chips : 1000;

    const saveData: SavedGameState = {
      userChips,
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        chips: p.chips,
        playStyle: p.playStyle,
        isUser: p.isUser,
      })),
      stats,
      settings,
      handNumber,
      handHistory,
      savedAt: new Date().toISOString(),
      unlockedAchievements,
    };

    try {
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
    } catch (err) {
      console.error('Error auto-saving game:', err);
    }

    // Sync to Firestore if logged in
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        setDoc(
          userDocRef,
          {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'Poker Player',
            userChips,
            stats,
            settings,
            unlockedAchievements,
            handNumber,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error('Error syncing to Firestore:', err);
      }
    }
  }, [players, stats, settings, handNumber, handHistory, isGameInitialized, unlockedAchievements, currentUser]);

  // ADVANCE TO NEXT STAGE OR SHOWDOWN
  const advanceStage = useCallback(() => {
    // Collect all bets into pots
    const updatedPlayers = players.map((p) => ({
      ...p,
      currentBet: 0,
      hasActedThisRound: false,
      lastAction: undefined,
    }));

    const computedPots = calculatePots(players);
    setPots(computedPots);

    let nextStage: GameStage = stage;
    let newCommunity = [...communityCards];
    let deckCopy = [...deck];

    if (stage === 'PRE_FLOP') {
      nextStage = 'FLOP';
      newCommunity = [deckCopy[0], deckCopy[1], deckCopy[2]];
      deckCopy = deckCopy.slice(3);
    } else if (stage === 'FLOP') {
      nextStage = 'TURN';
      newCommunity.push(deckCopy[0]);
      deckCopy = deckCopy.slice(1);
    } else if (stage === 'TURN') {
      nextStage = 'RIVER';
      newCommunity.push(deckCopy[0]);
      deckCopy = deckCopy.slice(1);
    } else if (stage === 'RIVER') {
      nextStage = 'SHOWDOWN';
    }

    setDeck(deckCopy);
    setCommunityCards(newCommunity);
    setStage(nextStage);
    setCurrentHighestBet(0);
    setMinRaiseAmount(settings.bigBlind);

    // Set first active non-folded player left of dealer to act
    let nextIdx = (dealerIndex + 1) % updatedPlayers.length;
    let attempts = 0;
    while ((updatedPlayers[nextIdx].isFolded || updatedPlayers[nextIdx].isAllIn) && attempts < updatedPlayers.length) {
      nextIdx = (nextIdx + 1) % updatedPlayers.length;
      attempts++;
    }
    setActivePlayerIndex(nextIdx);
    setPlayers(updatedPlayers);

    if (settings.soundEnabled && nextStage !== 'SHOWDOWN') {
      soundEffects.playCardDeal();
    }
  }, [players, stage, communityCards, deck, dealerIndex, settings.bigBlind, settings.soundEnabled]);

  // RESOLVE SHOWDOWN & DISTRIBUTE POTS
  const resolveShowdown = useCallback(() => {
    // Check if hand ended by everyone folding (winners already assigned in handlePlayerAction)
    if (pots.length > 0 && pots[0].winners && pots[0].winners.length > 0 && pots[0].winners[0].handDesc === 'Everyone Folded') {
      const user = players.find((p) => p.isUser);
      const userWonAny = userWonHand;
      const userInvested = user ? user.totalInvestedThisHand : 0;
      const potTotal = pots.reduce((acc, p) => acc + p.amount, 0);
      const userProfit = userWonAny ? potTotal - userInvested : -userInvested;

      setPlayers((prev) => prev.map((p) => ({ ...p, showCards: true })));

      setStats((prev) => ({
        ...prev,
        handsPlayed: prev.handsPlayed + 1,
        handsWon: prev.handsWon + (userWonAny ? 1 : 0),
        totalProfit: prev.totalProfit + userProfit,
        biggestWin: Math.max(prev.biggestWin, userWonAny ? userProfit : 0),
        totalChipsBet: prev.totalChipsBet + userInvested,
      }));

      const winnersList = pots.flatMap((pot) =>
        pot.winners ? pot.winners.map((w) => ({ name: w.name, amount: w.amount, handDesc: w.handDesc })) : []
      );

      setHandHistory((prev) => [
        ...prev,
        {
          id: handNumber,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          communityCards,
          potTotal,
          winners: winnersList,
          userHand: user?.cards,
          userWon: userWonAny,
          userNetProfit: userProfit,
        },
      ]);

      if (settings.soundEnabled) {
        if (userWonAny) soundEffects.playWin();
        else soundEffects.playChipClick();
      }

      checkAndApplyAchievements({
        stats: {
          ...stats,
          handsPlayed: stats.handsPlayed + 1,
          handsWon: stats.handsWon + (userWonAny ? 1 : 0),
        },
        userChips: user ? user.chips + (userWonAny ? potTotal : 0) : 1000,
        userCards: user?.cards,
        lastHandWonByUser: userWonAny,
        lastPotWonAmount: potTotal,
        lastHandEveryoneFolded: true,
        lastHandUserWasAllIn: user?.isAllIn,
        hasReboughtBefore: hasReboughtBefore.current,
      });

      return;
    }

    const activePlayers = players.filter((p) => !p.isFolded);
    const finalPots = calculatePots(players);

    let userWonAny = false;
    let userProfit = 0;
    const user = players.find((p) => p.isUser);
    const userInvested = user ? user.totalInvestedThisHand : 0;

    const winningCardsSet = new Set<string>();

    const updatedPots = finalPots.map((pot) => {
      if (pot.amount <= 0) return pot;

      const eligible = activePlayers.filter((p) => pot.eligiblePlayerIds.includes(p.id));
      if (eligible.length === 0) return pot;

      // Evaluate best hand for eligible players
      const evaluated = eligible.map((player) => {
        const bestHand = evaluateBestHand([...player.cards, ...communityCards]);
        return { player, bestHand };
      });

      // Find highest hand score
      evaluated.sort((a, b) => b.bestHand.score - a.bestHand.score);
      const topScore = evaluated[0].bestHand.score;
      const winners = evaluated.filter((item) => item.bestHand.score === topScore);

      const splitAmount = Math.floor(pot.amount / winners.length);

      // Collect winning card IDs
      winners.forEach((w) => {
        w.bestHand.bestFive.forEach((c) => winningCardsSet.add(c.id));
      });

      const winnerRecords = winners.map((w) => {
        if (w.player.isUser) userWonAny = true;
        return {
          playerId: w.player.id,
          amount: splitAmount,
          handDesc: w.bestHand.description,
        };
      });

      return {
        ...pot,
        winners: winnerRecords.map((r) => ({
          playerId: r.playerId,
          amount: r.amount,
          handDesc: r.handDesc,
          name: players.find((p) => p.id === r.playerId)?.name || 'Player',
        })),
      };
    });

    // Payout chips to winners
    const updatedPlayers = players.map((p) => {
      let winShare = 0;
      updatedPots.forEach((pot) => {
        if (pot.winners) {
          const record = pot.winners.find((w) => w.playerId === p.id);
          if (record) winShare += record.amount;
        }
      });

      if (p.isUser) {
        userProfit = winShare - userInvested;
      }

      return {
        ...p,
        chips: p.chips + winShare,
        showCards: true, // Reveal cards at showdown
      };
    });

    setPots(updatedPots);
    setPlayers(updatedPlayers);
    setWinningCardIds(winningCardsSet);
    setUserWonHand(userWonAny);

    if (settings.soundEnabled) {
      if (userWonAny) soundEffects.playWin();
      else soundEffects.playChipClick();
    }

    // Update Career Stats
    setStats((prev) => {
      const bestEval = user && user.cards.length > 0 && communityCards.length >= 3
        ? evaluateBestHand([...user.cards, ...communityCards]).description
        : prev.bestHandEver;

      return {
        handsPlayed: prev.handsPlayed + 1,
        handsWon: prev.handsWon + (userWonAny ? 1 : 0),
        totalProfit: prev.totalProfit + userProfit,
        biggestWin: Math.max(prev.biggestWin, userWonAny ? userProfit : 0),
        bestHandEver: bestEval || prev.bestHandEver,
        totalChipsBet: prev.totalChipsBet + userInvested,
      };
    });

    // Add to Hand History
    const winnersList = updatedPots.flatMap((pot) =>
      pot.winners ? pot.winners.map((w) => ({ name: w.name, amount: w.amount, handDesc: w.handDesc })) : []
    );

    setHandHistory((prev) => [
      ...prev,
      {
        id: handNumber,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        communityCards,
        potTotal: totalPotAmount,
        winners: winnersList,
        userHand: user?.cards,
        userWon: userWonAny,
        userNetProfit: userProfit,
      },
    ]);

    // Check Showdown Achievements
    const userEval = user && user.cards.length > 0 && communityCards.length >= 3
      ? evaluateBestHand([...user.cards, ...communityCards])
      : undefined;

    checkAndApplyAchievements({
      stats: {
        ...stats,
        handsPlayed: stats.handsPlayed + 1,
        handsWon: stats.handsWon + (userWonAny ? 1 : 0),
      },
      userChips: user ? user.chips + userProfit + userInvested : 1000,
      userCards: user?.cards,
      lastHandWonByUser: userWonAny,
      lastPotWonAmount: totalPotAmount,
      lastHandWasShowdown: true,
      lastHandUserWasAllIn: user?.isAllIn,
      hasReboughtBefore: hasReboughtBefore.current,
      bestHandRank: userEval?.rank,
    });
  }, [players, communityCards, settings.soundEnabled, handNumber, totalPotAmount, pots, userWonHand, stats, checkAndApplyAchievements]);

  // Trigger Showdown resolution when stage changes to SHOWDOWN
  useEffect(() => {
    if (stage === 'SHOWDOWN') {
      if (!hasResolvedShowdown.current) {
        hasResolvedShowdown.current = true;
        resolveShowdown();
      }
    } else {
      hasResolvedShowdown.current = false;
    }
  }, [stage, resolveShowdown]);

  // PLAYER ACTION HANDLERS
  const handlePlayerAction = useCallback((
    action: 'fold' | 'check' | 'call' | 'raise',
    raiseAmount?: number
  ) => {
    setPlayers((prevPlayers) => {
      const currentP = prevPlayers[activePlayerIndex];
      if (!currentP) return prevPlayers;

      let updatedChips = currentP.chips;
      let updatedBet = currentP.currentBet;
      let updatedTotalInvested = currentP.totalInvestedThisHand;
      let isFolded = currentP.isFolded;
      let isAllIn = currentP.isAllIn;
      let lastActionStr = '';

      if (action === 'fold') {
        isFolded = true;
        lastActionStr = 'FOLD';
        if (settings.soundEnabled) soundEffects.playFold();
      } else if (action === 'check') {
        lastActionStr = 'CHECK';
        if (settings.soundEnabled) soundEffects.playCheckKnock();
      } else if (action === 'call') {
        const callNeeded = currentHighestBet - currentP.currentBet;
        const actualCall = Math.min(callNeeded, currentP.chips);

        updatedChips -= actualCall;
        updatedBet += actualCall;
        updatedTotalInvested += actualCall;
        if (updatedChips === 0) isAllIn = true;
        lastActionStr = `CALL $${actualCall}`;
        if (settings.soundEnabled) soundEffects.playChipClick();
      } else if (action === 'raise') {
        const targetRaise = raiseAmount || minRaiseAmount;
        const addedBet = targetRaise - currentP.currentBet;
        const actualBet = Math.min(addedBet, currentP.chips);

        updatedChips -= actualBet;
        updatedBet += actualBet;
        updatedTotalInvested += actualBet;
        if (updatedChips === 0) isAllIn = true;
        lastActionStr = `RAISE $${updatedBet}`;

        setCurrentHighestBet(updatedBet);
        setMinRaiseAmount(updatedBet + settings.bigBlind);

        if (settings.soundEnabled) soundEffects.playRaise();
      }

      const updated = [...prevPlayers];
      updated[activePlayerIndex] = {
        ...currentP,
        chips: updatedChips,
        currentBet: updatedBet,
        totalInvestedThisHand: updatedTotalInvested,
        isFolded,
        isAllIn,
        hasActedThisRound: true,
        lastAction: lastActionStr,
      };

      return updated;
    });

    // Check if round complete or advance to next player
    setTimeout(() => {
      setPlayers((latestPlayers) => {
        const activeUnfolded = latestPlayers.filter((p) => !p.isFolded);

        // 1. If only 1 player remains unfolded -> Hand Over immediately!
        if (activeUnfolded.length === 1) {
          const soleWinner = activeUnfolded[0];
          const potTotal = latestPlayers.reduce((sum, p) => sum + p.currentBet, 0) +
            pots.reduce((sum, p) => sum + p.amount, 0);

          const finalPlayers = latestPlayers.map((p) =>
            p.id === soleWinner.id ? { ...p, chips: p.chips + potTotal, currentBet: 0 } : { ...p, currentBet: 0 }
          );

          setStage('SHOWDOWN');
          setPots([
            {
              id: 'main',
              amount: potTotal,
              eligiblePlayerIds: [soleWinner.id],
              isMain: true,
              winners: [{ playerId: soleWinner.id, amount: potTotal, name: soleWinner.name, handDesc: 'Everyone Folded' }],
            },
          ]);
          setUserWonHand(soleWinner.isUser);
          return finalPlayers;
        }

        // 2. Check if all active non-all-in players have matched highest bet and acted
        const nonFoldedNonAllIn = activeUnfolded.filter((p) => !p.isAllIn);
        const highestBet = Math.max(...latestPlayers.map((p) => p.currentBet));

        const roundComplete =
          nonFoldedNonAllIn.length === 0 ||
          nonFoldedNonAllIn.every((p) => p.hasActedThisRound && p.currentBet === highestBet);

        if (roundComplete) {
          if (stage === 'RIVER') {
            setStage('SHOWDOWN');
          } else {
            advanceStage();
          }
        } else {
          // Find next active player
          let nextIdx = (activePlayerIndex + 1) % latestPlayers.length;
          while (latestPlayers[nextIdx].isFolded || latestPlayers[nextIdx].isAllIn) {
            nextIdx = (nextIdx + 1) % latestPlayers.length;
          }
          setActivePlayerIndex(nextIdx);
        }

        return latestPlayers;
      });
    }, 100);
  }, [activePlayerIndex, currentHighestBet, minRaiseAmount, pots, settings.bigBlind, settings.soundEnabled, stage, advanceStage]);

  // AI TURN AUTOMATION LOOP
  useEffect(() => {
    if (stage === 'SHOWDOWN' || stage === 'HAND_OVER') return;

    const activeP = players[activePlayerIndex];
    if (!activeP || activeP.isUser || activeP.isFolded || activeP.isAllIn) return;

    if (isProcessingAITurn.current) return;
    isProcessingAITurn.current = true;

    const speedDelays = { slow: 2000, normal: 1200, fast: 600 };
    const delay = speedDelays[settings.gameSpeed];

    const timer = setTimeout(() => {
      const decision = decideAIAction(
        activeP,
        communityCards,
        currentHighestBet,
        minRaiseAmount,
        totalPotAmount,
        stage
      );

      // Attach comment if present
      if (decision.comment) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === activeP.id ? { ...p, comment: decision.comment } : p))
        );
      }

      handlePlayerAction(decision.action, decision.amount);
      isProcessingAITurn.current = false;
    }, delay);

    return () => {
      clearTimeout(timer);
      isProcessingAITurn.current = false;
    };
  }, [activePlayerIndex, stage, players, communityCards, currentHighestBet, minRaiseAmount, totalPotAmount, settings.gameSpeed, handlePlayerAction]);

  // Rebuy handler
  const handleRebuy = () => {
    hasReboughtBefore.current = true;
    setPlayers((prev) =>
      prev.map((p) => (p.isUser ? { ...p, chips: p.chips + 1000 } : p))
    );
    if (settings.soundEnabled) soundEffects.playWin();
  };

  const userPlayer = players.find((p) => p.isUser) || players[0];
  const activeOpponentsCount = players.filter((p) => !p.isUser && !p.isFolded).length;
  const unlockedCount = (
    Object.values(unlockedAchievements) as { unlockedAt: string | null; progress: number }[]
  ).filter((a) => Boolean(a?.unlockedAt)).length;

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Top Header Navigation */}
      <HeaderNav
        userChips={userPlayer.chips}
        smallBlind={settings.smallBlind}
        bigBlind={settings.bigBlind}
        handNumber={handNumber}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        unlockedAchievementsCount={unlockedCount}
        onRebuyChips={handleRebuy}
        onNewGame={handleStartNewGame}
        isSaved={isGameInitialized}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Felt Poker Table Area */}
      <main className="flex-1 flex flex-col justify-center px-2 sm:px-4 py-2">
        <PokerTable
          players={players}
          activePlayerIndex={activePlayerIndex}
          communityCards={communityCards}
          pots={pots}
          totalPotAmount={totalPotAmount}
          stage={stage}
          winningCardIds={winningCardIds}
          showAllCards={stage === 'SHOWDOWN'}
        />

        {/* Odds & Tactical Advice Widget */}
        {settings.showOdds && stage !== 'SHOWDOWN' && stage !== 'HAND_OVER' && (
          <OddsCalculator
            userCards={userPlayer.cards}
            communityCards={communityCards}
            numActiveOpponents={activeOpponentsCount}
            stage={stage}
            enabled={settings.showOdds}
          />
        )}

        {/* User Control Panel */}
        {stage !== 'SHOWDOWN' && stage !== 'HAND_OVER' && (
          <ControlPanel
            userPlayer={userPlayer}
            isUserTurn={activePlayerIndex === 0}
            currentHighestBet={currentHighestBet}
            minRaiseAmount={minRaiseAmount}
            totalPotAmount={totalPotAmount}
            bigBlind={settings.bigBlind}
            onFold={() => handlePlayerAction('fold')}
            onCheck={() => handlePlayerAction('check')}
            onCall={(amt) => handlePlayerAction('call', amt)}
            onRaise={(amt) => handlePlayerAction('raise', amt)}
          />
        )}
      </main>

      {/* Showdown Payout Overlay */}
      {stage === 'SHOWDOWN' && (
        <ShowdownOverlay
          pots={pots}
          userWon={userWonHand}
          onNextHand={() => {
            setHandNumber((h) => h + 1);
            startNewHand();
          }}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
          onResetBankroll={() => {
            setPlayers((prev) =>
              prev.map((p) => ({ ...p, chips: settings.startingChips }))
            );
          }}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Stats Modal */}
      {isStatsOpen && (
        <StatsModal stats={stats} onClose={() => setIsStatsOpen(false)} />
      )}

      {/* Rules Modal */}
      {isRulesOpen && (
        <RulesModal onClose={() => setIsRulesOpen(false)} />
      )}

      {/* Hand History Modal */}
      {isHistoryOpen && (
        <HandHistoryModal history={handHistory} onClose={() => setIsHistoryOpen(false)} />
      )}

      {/* Achievements Modal */}
      {isAchievementsOpen && (
        <AchievementsModal
          unlockedRecords={unlockedAchievements}
          onClose={() => setIsAchievementsOpen(false)}
        />
      )}

      {/* Continue Saved Game Modal */}
      {showContinueModal && savedGameState && (
        <ContinueGameModal
          savedState={savedGameState}
          onContinue={handleContinueGame}
          onStartNewGame={handleStartNewGame}
        />
      )}

      {/* User Login Auth Modal */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* User Profile & Account Modal */}
      {isProfileOpen && currentUser && (
        <UserProfileModal
          user={currentUser}
          userChips={userPlayer.chips}
          stats={stats}
          unlockedCount={unlockedCount}
          onClose={() => setIsProfileOpen(false)}
          onProfileUpdated={(newName) => {
            setPlayers((prev) =>
              prev.map((p) => (p.isUser ? { ...p, name: newName } : p))
            );
          }}
        />
      )}

      {/* Steam-Style Achievement Toast Floating Notification */}
      <div className="fixed bottom-5 right-5 z-50 pointer-events-none flex flex-col gap-2">
        {activeToast && (
          <AchievementToast
            achievement={activeToast}
            onDismiss={() => setActiveToast(null)}
          />
        )}
      </div>
    </div>
  );
}
