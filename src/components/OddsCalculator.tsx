import React, { useMemo } from 'react';
import { Card, GameStage } from '../types/poker';
import { calculateWinEquity, evaluateBestHand } from '../utils/handEvaluator';
import { Lightbulb, Percent, ShieldAlert } from 'lucide-react';

interface OddsCalculatorProps {
  userCards: Card[];
  communityCards: Card[];
  numActiveOpponents: number;
  stage: GameStage;
  enabled: boolean;
}

export const OddsCalculator: React.FC<OddsCalculatorProps> = ({
  userCards,
  communityCards,
  numActiveOpponents,
  stage,
  enabled,
}) => {
  if (!enabled || userCards.length < 2) return null;

  // Calculate hand equity using Monte Carlo simulation
  const equity = useMemo(() => {
    if (stage === 'SHOWDOWN' || stage === 'HAND_OVER' || numActiveOpponents <= 0) {
      return { winChance: 100, tieChance: 0, lossChance: 0 };
    }
    return calculateWinEquity(userCards, communityCards, numActiveOpponents, 300);
  }, [userCards, communityCards, numActiveOpponents, stage]);

  // Evaluate current best hand made so far
  const currentEvaluation = useMemo(() => {
    if (userCards.length + communityCards.length < 5) return null;
    return evaluateBestHand([...userCards, ...communityCards]);
  }, [userCards, communityCards]);

  // Generate tactical advice
  const getTacticalAdvice = () => {
    const winRate = equity.winChance;
    if (winRate >= 75) {
      return 'Monster hand! Value bet or slow-play to build a massive pot.';
    }
    if (winRate >= 50) {
      return 'Strong hand. Raise or call with confidence.';
    }
    if (winRate >= 30) {
      return 'Decent potential or draw. Call if pot odds are favorable.';
    }
    return 'Weak hand. Be cautious against heavy bets or consider folding.';
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl text-slate-200 select-none">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Current Made Hand */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Current Hand
            </div>
            <div className="text-xs font-bold text-emerald-300">
              {currentEvaluation ? currentEvaluation.description : 'Awaiting Flop'}
            </div>
          </div>
        </div>

        {/* Equity Bar */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between text-xs font-mono font-semibold mb-1">
            <span className="text-slate-400">Win Chance</span>
            <span className="text-emerald-400">{equity.winChance}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${equity.winChance}%` }}
            />
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${equity.tieChance}%` }}
            />
            <div
              className="h-full bg-rose-900 transition-all duration-300"
              style={{ width: `${equity.lossChance}%` }}
            />
          </div>
        </div>

        {/* Tactical Advice */}
        <div className="flex items-center gap-2 max-w-xs text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1.5 rounded-xl">
          <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
          <span className="leading-tight text-[11px]">{getTacticalAdvice()}</span>
        </div>
      </div>
    </div>
  );
};
