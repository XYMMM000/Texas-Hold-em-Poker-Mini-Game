import { Achievement, GameStats, Player, Card, HandRank } from '../types/poker';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    title: 'First Blood',
    description: 'Win your very first hand of poker.',
    iconName: 'Trophy',
    badgeTier: 'bronze',
    maxProgress: 1,
    xpPoints: 50,
  },
  {
    id: 'card_shark',
    title: 'Card Shark',
    description: 'Win 10 total hands against the table.',
    iconName: 'Award',
    badgeTier: 'bronze',
    maxProgress: 10,
    xpPoints: 100,
  },
  {
    id: 'poker_legend',
    title: 'Poker Legend',
    description: 'Dominate the felt and win 50 hands total.',
    iconName: 'Crown',
    badgeTier: 'gold',
    maxProgress: 50,
    xpPoints: 300,
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Build your chip stack up to $2,500.',
    iconName: 'Coins',
    badgeTier: 'silver',
    maxProgress: 2500,
    xpPoints: 100,
  },
  {
    id: 'casino_magnate',
    title: 'Casino Magnate',
    description: 'Amass a total bankroll of $10,000.',
    iconName: 'Flame',
    badgeTier: 'gold',
    maxProgress: 10000,
    xpPoints: 250,
  },
  {
    id: 'the_whale',
    title: 'Casino Whale',
    description: 'Reach a legendary bankroll of $50,000.',
    iconName: 'Zap',
    badgeTier: 'diamond',
    maxProgress: 50000,
    xpPoints: 500,
  },
  {
    id: 'pocket_rockets',
    title: 'Pocket Rockets',
    description: 'Get dealt Pocket Aces (A-A) in your hole cards.',
    iconName: 'Sparkles',
    badgeTier: 'gold',
    maxProgress: 1,
    xpPoints: 150,
  },
  {
    id: 'bluff_master',
    title: 'Bluff Master',
    description: 'Force every opponent to fold and scoop the pot without showing.',
    iconName: 'EyeOff',
    badgeTier: 'silver',
    maxProgress: 1,
    xpPoints: 100,
  },
  {
    id: 'all_in_hero',
    title: 'All-In Hero',
    description: 'Risk it all and win a pot after going All-In.',
    iconName: 'Swords',
    badgeTier: 'silver',
    maxProgress: 1,
    xpPoints: 150,
  },
  {
    id: 'monster_hand',
    title: 'Monster Hand',
    description: 'Win a hand with a Full House or Four of a Kind.',
    iconName: 'Shield',
    badgeTier: 'gold',
    maxProgress: 1,
    xpPoints: 200,
  },
  {
    id: 'royal_standard',
    title: 'Royal Standard',
    description: 'Hit a Straight Flush or Royal Flush at showdown.',
    iconName: 'Crown',
    badgeTier: 'diamond',
    maxProgress: 1,
    secret: true,
    xpPoints: 500,
  },
  {
    id: 'pot_collector',
    title: 'Pot Collector',
    description: 'Win a single pot worth $1,000 or more.',
    iconName: 'Crosshair',
    badgeTier: 'bronze',
    maxProgress: 1000,
    xpPoints: 100,
  },
  {
    id: 'king_of_the_hill',
    title: 'King of the Hill',
    description: 'Win a massive single pot worth $5,000 or more.',
    iconName: 'Sparkles',
    badgeTier: 'gold',
    maxProgress: 5000,
    xpPoints: 300,
  },
  {
    id: 'phoenix_rising',
    title: 'Phoenix Rising',
    description: 'Rebuy chips after going broke and win a hand.',
    iconName: 'Flame',
    badgeTier: 'silver',
    maxProgress: 1,
    xpPoints: 150,
  },
  {
    id: 'table_veteran',
    title: 'Table Veteran',
    description: 'Play 25 total hands at the table.',
    iconName: 'Award',
    badgeTier: 'bronze',
    maxProgress: 25,
    xpPoints: 100,
  },
  {
    id: 'the_grinder',
    title: 'The Grinder',
    description: 'Play 100 total hands in your poker career.',
    iconName: 'Trophy',
    badgeTier: 'silver',
    maxProgress: 100,
    xpPoints: 250,
  },
];

export interface AchievementCheckContext {
  stats: GameStats;
  userChips: number;
  userCards?: Card[];
  lastHandWonByUser?: boolean;
  lastPotWonAmount?: number;
  lastHandWasShowdown?: boolean;
  lastHandWonDesc?: string;
  lastHandUserWasAllIn?: boolean;
  lastHandEveryoneFolded?: boolean;
  hasReboughtBefore?: boolean;
  bestHandRank?: HandRank;
}

export function evaluateAchievements(
  currentUnlocked: Record<string, { unlockedAt: string; progress: number }>,
  ctx: AchievementCheckContext
): {
  updatedUnlocked: Record<string, { unlockedAt: string; progress: number }>;
  newlyUnlocked: Achievement[];
} {
  const updatedUnlocked = { ...currentUnlocked };
  const newlyUnlocked: Achievement[] = [];
  const nowStr = new Date().toISOString();

  const unlock = (achId: string, currentVal = 1) => {
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!ach) return;

    const existing = updatedUnlocked[achId];
    if (existing && existing.unlockedAt) return; // Already unlocked

    if (currentVal >= ach.maxProgress) {
      updatedUnlocked[achId] = { unlockedAt: nowStr, progress: ach.maxProgress };
      newlyUnlocked.push(ach);
    } else {
      updatedUnlocked[achId] = { unlockedAt: null, progress: Math.max(existing?.progress || 0, currentVal) };
    }
  };

  // 1. Hands Won checks
  if (ctx.stats.handsWon >= 1) unlock('first_win', 1);
  if (ctx.stats.handsWon >= 10) unlock('card_shark', ctx.stats.handsWon);
  if (ctx.stats.handsWon >= 50) unlock('poker_legend', ctx.stats.handsWon);

  // 2. Chip Bankroll checks
  if (ctx.userChips >= 2500) unlock('high_roller', ctx.userChips);
  if (ctx.userChips >= 10000) unlock('casino_magnate', ctx.userChips);
  if (ctx.userChips >= 50000) unlock('the_whale', ctx.userChips);

  // 3. Hands Played checks
  if (ctx.stats.handsPlayed >= 25) unlock('table_veteran', ctx.stats.handsPlayed);
  if (ctx.stats.handsPlayed >= 100) unlock('the_grinder', ctx.stats.handsPlayed);

  // 4. Pocket Rockets check
  if (ctx.userCards && ctx.userCards.length === 2) {
    if (ctx.userCards[0].rank === 14 && ctx.userCards[1].rank === 14) {
      unlock('pocket_rockets', 1);
    }
  }

  // 5. Specific Hand Win Context checks
  if (ctx.lastHandWonByUser) {
    // Bluff Master
    if (ctx.lastHandEveryoneFolded) {
      unlock('bluff_master', 1);
    }

    // All-In Hero
    if (ctx.lastHandUserWasAllIn) {
      unlock('all_in_hero', 1);
    }

    // Phoenix Rising
    if (ctx.hasReboughtBefore) {
      unlock('phoenix_rising', 1);
    }

    // Pots
    if (ctx.lastPotWonAmount && ctx.lastPotWonAmount >= 1000) {
      unlock('pot_collector', ctx.lastPotWonAmount);
    }
    if (ctx.lastPotWonAmount && ctx.lastPotWonAmount >= 5000) {
      unlock('king_of_the_hill', ctx.lastPotWonAmount);
    }

    // Hand Ranks
    if (ctx.bestHandRank) {
      if (ctx.bestHandRank === HandRank.FULL_HOUSE || ctx.bestHandRank === HandRank.FOUR_OF_A_KIND) {
        unlock('monster_hand', 1);
      }
      if (ctx.bestHandRank === HandRank.STRAIGHT_FLUSH || ctx.bestHandRank === HandRank.ROYAL_FLUSH) {
        unlock('royal_standard', 1);
      }
    }
  }

  return { updatedUnlocked, newlyUnlocked };
}
