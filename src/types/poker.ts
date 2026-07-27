export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export enum HandRank {
  HIGH_CARD = 1,
  ONE_PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10,
}

export interface HandEvaluation {
  rank: HandRank;
  score: number; // Unique numerical score for exact comparison
  description: string;
  bestFive: Card[];
  rankName: string;
}

export type PlayStyle = 
  | 'tight_passive' 
  | 'tight_aggressive' 
  | 'loose_passive' 
  | 'loose_aggressive' 
  | 'maniac'
  | 'calling_station';

export interface Player {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  currentBet: number;
  totalInvestedThisHand: number;
  cards: Card[];
  isFolded: boolean;
  isAllIn: boolean;
  isUser: boolean;
  playStyle: PlayStyle;
  lastAction?: string;
  comment?: string;
  showCards?: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  hasActedThisRound: boolean;
}

export type GameStage = 'PRE_FLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN' | 'HAND_OVER';

export interface Pot {
  id: string;
  amount: number;
  eligiblePlayerIds: string[];
  isMain: boolean;
  winners?: { playerId: string; amount: number; handDesc?: string }[];
}

export interface GameStats {
  handsPlayed: number;
  handsWon: number;
  totalProfit: number;
  biggestWin: number;
  bestHandEver: string;
  totalChipsBet: number;
}

export interface GameSettings {
  numPlayers: number; // 2 to 6
  smallBlind: number;
  bigBlind: number;
  blindIncreaseInterval: number; // Hands until blind level up (0 = off)
  soundEnabled: boolean;
  showOdds: boolean;
  handAdviceEnabled: boolean;
  gameSpeed: 'slow' | 'normal' | 'fast'; // Affects AI delay
  startingChips: number;
}

export interface HandHistoryRecord {
  id: number;
  timestamp: string;
  communityCards: Card[];
  potTotal: number;
  winners: { name: string; amount: number; handDesc?: string }[];
  userHand?: Card[];
  userWon: boolean;
  userNetProfit: number;
}

export interface SavedGameState {
  userChips: number;
  players: {
    id: string;
    name: string;
    avatar: string;
    chips: number;
    playStyle: PlayStyle;
    isUser: boolean;
  }[];
  stats: GameStats;
  settings: GameSettings;
  handNumber: number;
  handHistory: HandHistoryRecord[];
  savedAt: string;
  unlockedAchievements?: Record<string, { unlockedAt: string; progress: number }>;
}

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badgeTier: BadgeTier;
  maxProgress: number;
  secret?: boolean;
  xpPoints: number;
}

export interface UserAchievementProgress {
  id: string;
  unlockedAt: string | null;
  progress: number;
}

