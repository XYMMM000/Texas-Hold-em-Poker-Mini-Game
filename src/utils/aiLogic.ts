import { Card, GameStage, PlayStyle, Player } from '../types/poker';
import { evaluateBestHand } from './handEvaluator';

export interface AIAction {
  action: 'fold' | 'check' | 'call' | 'raise';
  amount?: number;
  comment?: string;
}

// Pre-flop hole cards relative strength score (0 to 100)
export function getPreFlopStrength(cards: Card[]): number {
  if (cards.length < 2) return 0;

  const [c1, c2] = cards;
  const r1 = c1.rank;
  const r2 = c2.rank;
  const isPair = r1 === r2;
  const isSuited = c1.suit === c2.suit;
  const highRank = Math.max(r1, r2);
  const lowRank = Math.min(r1, r2);
  const gap = highRank - lowRank;

  if (isPair) {
    // Pairs: Pocket AA is 95, 22 is 50
    return 50 + ((highRank - 2) / 12) * 45;
  }

  let score = ((highRank + lowRank) / 28) * 40; // Base score on ranks

  if (isSuited) score += 12; // Suited bonus
  if (gap === 1) score += 10; // Connector
  else if (gap === 2) score += 6; // One-gapper
  else if (gap > 4) score -= 8;

  if (highRank >= 10 && lowRank >= 10) score += 15; // High broadway cards

  return Math.min(Math.max(Math.round(score), 10), 98);
}

// Get bot comment based on style and action
function generateBotComment(
  action: 'fold' | 'check' | 'call' | 'raise',
  style: PlayStyle,
  strength: number
): string | undefined {
  // Random chance to talk (35% of turns)
  if (Math.random() > 0.4) return undefined;

  const comments: Record<string, string[]> = {
    fold: [
      "Too rich for my blood.",
      "Not risking my stack on this.",
      "I'll catch you next hand.",
      "Good bet, take it.",
      "Folder's regret is better than gambler's debt!",
    ],
    check: [
      "Let's see a free card.",
      "Checking to you.",
      "Knock knock.",
      "Keeping it friendly.",
      "Just feeling it out.",
    ],
    call: [
      "I'll buy a ticket to see that.",
      "Fair price, I call.",
      "Let's see what you've got.",
      "I'm keeping you honest.",
      "Count me in.",
    ],
    raise: [
      "Time to put some chips in!",
      "I'm feeling lucky here.",
      "Let's raise the stakes!",
      "Pay up if you want to play.",
      "No cheap cards at this table!",
      "All aboard the hype train!",
    ],
  };

  const pool = comments[action];
  if (!pool || pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function decideAIAction(
  player: Player,
  communityCards: Card[],
  currentHighestBet: number,
  minRaiseAmount: number,
  potTotal: number,
  stage: GameStage
): AIAction {
  const amountToCall = currentHighestBet - player.currentBet;
  const canCheck = amountToCall === 0;

  // Calculate hand strength score (0 - 100)
  let handStrength = 0;
  if (stage === 'PRE_FLOP') {
    handStrength = getPreFlopStrength(player.cards);
  } else {
    const evalResult = evaluateBestHand([...player.cards, ...communityCards]);
    // Map HandRank enum (1 to 10) to strength score 20-100
    handStrength = (evalResult.rank / 10) * 80 + (evalResult.score % 100) / 5;
  }

  // Adjust style threshold
  let aggroBonus = 0;
  let foldThreshold = 35;

  switch (player.playStyle) {
    case 'maniac':
      aggroBonus = 30;
      foldThreshold = 15;
      break;
    case 'loose_aggressive':
      aggroBonus = 20;
      foldThreshold = 25;
      break;
    case 'tight_aggressive':
      aggroBonus = 15;
      foldThreshold = 45;
      break;
    case 'loose_passive':
      aggroBonus = -10;
      foldThreshold = 20;
      break;
    case 'tight_passive':
      aggroBonus = -20;
      foldThreshold = 50;
      break;
  }

  const effectiveStrength = handStrength + aggroBonus;

  // Pot odds calculation
  const potOdds = amountToCall / (potTotal + amountToCall || 1);

  // DECISION MATRIX
  // 1. Should raise?
  const shouldRaise =
    effectiveStrength > 70 ||
    (player.playStyle === 'maniac' && Math.random() < 0.4) ||
    (canCheck && effectiveStrength > 50 && Math.random() < 0.6);

  if (shouldRaise && player.chips > amountToCall) {
    const availableChips = player.chips;
    let raiseSize = minRaiseAmount;

    // Scale raise size based on strength and stack
    if (effectiveStrength > 85 || player.playStyle === 'maniac') {
      const potFraction = Math.max(Math.round(potTotal * 0.75), minRaiseAmount);
      raiseSize = Math.min(potFraction, availableChips);
    } else {
      raiseSize = Math.min(minRaiseAmount, availableChips);
    }

    // Ensure raise meets minimum requirement or all-in
    raiseSize = Math.max(raiseSize, amountToCall + (minRaiseAmount - amountToCall));
    raiseSize = Math.min(raiseSize, availableChips);

    if (raiseSize > amountToCall) {
      return {
        action: 'raise',
        amount: raiseSize,
        comment: generateBotComment('raise', player.playStyle, handStrength),
      };
    }
  }

  // 2. Can Check?
  if (canCheck) {
    return {
      action: 'check',
      comment: generateBotComment('check', player.playStyle, handStrength),
    };
  }

  // 3. Call vs Fold
  const shouldCall =
    effectiveStrength >= foldThreshold ||
    potOdds < 0.25 ||
    (player.playStyle === 'calling_station' && Math.random() < 0.85);

  if (shouldCall && player.chips >= amountToCall) {
    return {
      action: 'call',
      amount: Math.min(amountToCall, player.chips),
      comment: generateBotComment('call', player.playStyle, handStrength),
    };
  }

  // If chips < amountToCall, call puts them all-in
  if (player.chips < amountToCall) {
    if (effectiveStrength > foldThreshold || player.playStyle === 'maniac') {
      return {
        action: 'call',
        amount: player.chips,
        comment: "All-in! Let's ride!",
      };
    }
  }

  // Default: Fold
  return {
    action: 'fold',
    comment: generateBotComment('fold', player.playStyle, handStrength),
  };
}
