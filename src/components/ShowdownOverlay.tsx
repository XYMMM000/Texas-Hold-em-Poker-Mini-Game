import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Pot } from '../types/poker';
import { formatChips } from '../utils/cardUtils';
import { Trophy, ArrowRight } from 'lucide-react';

interface ShowdownOverlayProps {
  pots: Pot[];
  onNextHand: () => void;
  userWon: boolean;
}

export const ShowdownOverlay: React.FC<ShowdownOverlayProps> = ({
  pots,
  onNextHand,
  userWon,
}) => {
  // Trigger confetti if user won a pot
  useEffect(() => {
    if (userWon) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    }
  }, [userWon]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center text-slate-100 relative overflow-hidden"
        >
          {/* Header Trophy */}
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
            <Trophy className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-black text-amber-300 tracking-tight mb-1">
            {userWon ? 'YOU WON THE POT!' : 'HAND COMPLETE'}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Pots distributed to best active poker hand(s)
          </p>

          {/* Pot Breakdown List */}
          <div className="flex flex-col gap-3 mb-6 text-left">
            {pots.map((pot, idx) => (
              <div
                key={pot.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between text-xs font-mono font-semibold text-amber-400">
                  <span>{pot.isMain ? 'Main Pot' : `Side Pot #${idx}`}</span>
                  <span>{formatChips(pot.amount)}</span>
                </div>

                {pot.winners && pot.winners.length > 0 ? (
                  pot.winners.map((winner, wIdx) => (
                    <div
                      key={wIdx}
                      className="flex items-center justify-between text-xs text-slate-200 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">{winner.name}</span>
                        {winner.handDesc && (
                          <span className="text-[11px] text-slate-400 italic">
                            ({winner.handDesc})
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-amber-300">
                        +{formatChips(winner.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 italic">No eligible winners</div>
                )}
              </div>
            ))}
          </div>

          {/* Next Hand Button */}
          <button
            onClick={onNextHand}
            className="w-full py-4 px-6 rounded-2xl font-black text-base bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>START NEXT HAND</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
