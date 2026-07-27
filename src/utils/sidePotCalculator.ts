import { Player, Pot } from '../types/poker';

export function calculatePots(players: Player[]): Pot[] {
  // Get all players who invested chips into this hand
  const activeInvestors = players.filter((p) => p.totalInvestedThisHand > 0);

  if (activeInvestors.length === 0) {
    return [{ id: 'main', amount: 0, eligiblePlayerIds: [], isMain: true }];
  }

  // Get unique investment levels sorted ascending
  const levels = Array.from(
    new Set(activeInvestors.map((p) => p.totalInvestedThisHand))
  ).sort((a, b) => a - b);

  const pots: Pot[] = [];
  let previousLevel = 0;

  for (let i = 0; i < levels.length; i++) {
    const currentLevel = levels[i];
    const levelDiff = currentLevel - previousLevel;

    if (levelDiff <= 0) continue;

    // Contribution to this pot level from each player who invested at least currentLevel
    let potAmount = 0;
    const eligiblePlayerIds: string[] = [];

    for (const player of activeInvestors) {
      if (player.totalInvestedThisHand >= currentLevel) {
        potAmount += levelDiff;
        // Non-folded players eligible to win this pot level
        if (!player.isFolded) {
          eligiblePlayerIds.push(player.id);
        }
      } else if (player.totalInvestedThisHand > previousLevel) {
        // Partial contribution
        potAmount += player.totalInvestedThisHand - previousLevel;
      }
    }

    if (potAmount > 0) {
      pots.push({
        id: `pot_${i}`,
        amount: potAmount,
        eligiblePlayerIds,
        isMain: i === 0,
      });
    }

    previousLevel = currentLevel;
  }

  // Consolidate pots that have identical eligible player lists if desired,
  // or return cleaned list. If no eligible non-folded players in a side pot, assign to last active fold non-contributor.
  if (pots.length === 0) {
    return [{ id: 'main', amount: 0, eligiblePlayerIds: [], isMain: true }];
  }

  return pots;
}
