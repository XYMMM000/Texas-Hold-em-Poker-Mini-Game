import { Card, HandEvaluation, HandRank, Rank } from '../types/poker';
import { getRankLabel, getSuitSymbol } from './cardUtils';

// Combinations helper (choose 5 out of cards length)
function get5CardCombinations(cards: Card[]): Card[][] {
  const combinations: Card[][] = [];

  function k_combinations(set: Card[], k: number, start: number, initialCombination: Card[]) {
    if (k === 0) {
      combinations.push(initialCombination);
      return;
    }
    for (let i = start; i <= set.length - k; i++) {
      k_combinations(set, k - 1, i + 1, [...initialCombination, set[i]]);
    }
  }

  k_combinations(cards, 5, 0, []);
  return combinations;
}

// Evaluate exact 5-card hand
export function evaluate5CardHand(cards: Card[]): HandEvaluation {
  if (cards.length !== 5) {
    throw new Error('evaluate5CardHand requires exactly 5 cards');
  }

  // Sort descending by rank
  const sorted = [...cards].sort((a, b) => b.rank - a.rank);

  const isFlush = sorted.every((c) => c.suit === sorted[0].suit);

  // Check straight
  let isStraight = false;
  let straightHighRank = 0;

  if (
    sorted[0].rank - sorted[1].rank === 1 &&
    sorted[1].rank - sorted[2].rank === 1 &&
    sorted[2].rank - sorted[3].rank === 1 &&
    sorted[3].rank - sorted[4].rank === 1
  ) {
    isStraight = true;
    straightHighRank = sorted[0].rank;
  } else if (
    sorted[0].rank === 14 &&
    sorted[1].rank === 5 &&
    sorted[2].rank === 4 &&
    sorted[3].rank === 3 &&
    sorted[4].rank === 2
  ) {
    // Ace low straight (A-2-3-4-5)
    isStraight = true;
    straightHighRank = 5;
  }

  // Rank counts
  const rankCounts: Map<Rank, number> = new Map();
  for (const c of sorted) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) || 0) + 1);
  }

  const countsArray = Array.from(rankCounts.entries()).map(([rank, count]) => ({
    rank: Number(rank) as Rank,
    count,
  }));

  // Sort countsArray: primary by count desc, secondary by rank desc
  countsArray.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return b.rank - a.rank;
  });

  // Calculate score base: HandRank * 10^10 + rank weight components
  // To allow unambiguous comparison
  let handRank: HandRank;
  let rankName = '';
  let description = '';
  let score = 0;

  if (isStraight && isFlush) {
    if (straightHighRank === 14) {
      handRank = HandRank.ROYAL_FLUSH;
      rankName = 'Royal Flush';
      description = `Royal Flush in ${sorted[0].suit}`;
      score = 10000000000 + 14;
    } else {
      handRank = HandRank.STRAIGHT_FLUSH;
      rankName = 'Straight Flush';
      description = `Straight Flush, ${getRankLabel(straightHighRank as Rank)} High`;
      score = 9000000000 + straightHighRank;
    }
  } else if (countsArray[0].count === 4) {
    handRank = HandRank.FOUR_OF_A_KIND;
    rankName = 'Four of a Kind';
    const quadRank = countsArray[0].rank;
    const kicker = countsArray[1].rank;
    description = `Four of a Kind, ${getRankLabel(quadRank)}s`;
    score = 8000000000 + quadRank * 100 + kicker;
  } else if (countsArray[0].count === 3 && countsArray[1].count === 2) {
    handRank = HandRank.FULL_HOUSE;
    rankName = 'Full House';
    const tripsRank = countsArray[0].rank;
    const pairRank = countsArray[1].rank;
    description = `Full House, ${getRankLabel(tripsRank)}s full of ${getRankLabel(pairRank)}s`;
    score = 7000000000 + tripsRank * 100 + pairRank;
  } else if (isFlush) {
    handRank = HandRank.FLUSH;
    rankName = 'Flush';
    description = `Flush, ${getRankLabel(sorted[0].rank)} High`;
    score =
      6000000000 +
      sorted[0].rank * 1000000 +
      sorted[1].rank * 10000 +
      sorted[2].rank * 100 +
      sorted[3].rank * 10 +
      sorted[4].rank;
  } else if (isStraight) {
    handRank = HandRank.STRAIGHT;
    rankName = 'Straight';
    description = `Straight, ${getRankLabel(straightHighRank as Rank)} High`;
    score = 5000000000 + straightHighRank;
  } else if (countsArray[0].count === 3) {
    handRank = HandRank.THREE_OF_A_KIND;
    rankName = 'Three of a Kind';
    const tripsRank = countsArray[0].rank;
    const k1 = countsArray[1].rank;
    const k2 = countsArray[2].rank;
    description = `Three of a Kind, ${getRankLabel(tripsRank)}s`;
    score = 4000000000 + tripsRank * 10000 + k1 * 100 + k2;
  } else if (countsArray[0].count === 2 && countsArray[1].count === 2) {
    handRank = HandRank.TWO_PAIR;
    rankName = 'Two Pair';
    const highPair = countsArray[0].rank;
    const lowPair = countsArray[1].rank;
    const kicker = countsArray[2].rank;
    description = `Two Pair, ${getRankLabel(highPair)}s and ${getRankLabel(lowPair)}s`;
    score = 3000000000 + highPair * 10000 + lowPair * 100 + kicker;
  } else if (countsArray[0].count === 2) {
    handRank = HandRank.ONE_PAIR;
    rankName = 'One Pair';
    const pairRank = countsArray[0].rank;
    const k1 = countsArray[1].rank;
    const k2 = countsArray[2].rank;
    const k3 = countsArray[3].rank;
    description = `Pair of ${getRankLabel(pairRank)}s`;
    score = 2000000000 + pairRank * 1000000 + k1 * 10000 + k2 * 100 + k3;
  } else {
    handRank = HandRank.HIGH_CARD;
    rankName = 'High Card';
    description = `High Card, ${getRankLabel(sorted[0].rank)}`;
    score =
      1000000000 +
      sorted[0].rank * 1000000 +
      sorted[1].rank * 10000 +
      sorted[2].rank * 100 +
      sorted[3].rank * 10 +
      sorted[4].rank;
  }

  return {
    rank: handRank,
    score,
    description,
    bestFive: sorted,
    rankName,
  };
}

// Evaluate best 5-card hand out of 5, 6, or 7 cards
export function evaluateBestHand(cards: Card[]): HandEvaluation {
  if (cards.length < 5) {
    throw new Error('Evaluating hand requires at least 5 cards');
  }

  if (cards.length === 5) {
    return evaluate5CardHand(cards);
  }

  const combinations = get5CardCombinations(cards);
  let bestEval: HandEvaluation | null = null;

  for (const combo of combinations) {
    const currentEval = evaluate5CardHand(combo);
    if (!bestEval || currentEval.score > bestEval.score) {
      bestEval = currentEval;
    }
  }

  return bestEval!;
}

// Compare two hand evaluations: returns positive if A > B, negative if A < B, 0 if tie
export function compareEvaluations(a: HandEvaluation, b: HandEvaluation): number {
  return a.score - b.score;
}

// Quick Monte Carlo simulation for player win probability %
export function calculateWinEquity(
  holeCards: Card[],
  communityCards: Card[],
  numOpponents: number,
  simulations: number = 400
): { winChance: number; tieChance: number; lossChance: number } {
  if (holeCards.length < 2) {
    return { winChance: 0, tieChance: 0, lossChance: 100 };
  }

  // Create full deck minus known cards
  const knownCardIds = new Set([
    ...holeCards.map((c) => c.id),
    ...communityCards.map((c) => c.id),
  ]);

  const SUITS: Card['suit'][] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const RANKS: Card['rank'][] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const id = `${rank}_of_${suit}`;
      if (!knownCardIds.has(id)) {
        deck.push({ suit, rank, id });
      }
    }
  }

  let wins = 0;
  let ties = 0;
  let losses = 0;

  const cardsToDeal = 5 - communityCards.length;

  for (let sim = 0; sim < simulations; sim++) {
    // Fisher-Yates shuffle remaining deck copy
    const simDeck = [...deck];
    for (let i = simDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [simDeck[i], simDeck[j]] = [simDeck[j], simDeck[i]];
    }

    let deckIdx = 0;

    // Deal remaining community cards
    const simCommunity = [...communityCards];
    for (let c = 0; c < cardsToDeal; c++) {
      simCommunity.push(simDeck[deckIdx++]);
    }

    // Evaluate user hand
    const myBest = evaluateBestHand([...holeCards, ...simCommunity]);

    let iWon = true;
    let iTied = false;

    // Deal opponent hands
    for (let opp = 0; opp < numOpponents; opp++) {
      const oppHole = [simDeck[deckIdx++], simDeck[deckIdx++]];
      const oppBest = evaluateBestHand([...oppHole, ...simCommunity]);

      if (oppBest.score > myBest.score) {
        iWon = false;
        iTied = false;
        break;
      } else if (oppBest.score === myBest.score) {
        iTied = true;
      }
    }

    if (iWon && !iTied) {
      wins++;
    } else if (iTied) {
      ties++;
    } else {
      losses++;
    }
  }

  return {
    winChance: Math.round((wins / simulations) * 100),
    tieChance: Math.round((ties / simulations) * 100),
    lossChance: Math.round((losses / simulations) * 100),
  };
}
