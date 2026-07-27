import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player } from '../types/poker';
import { CardView } from './CardView';
import { formatChips } from '../utils/cardUtils';

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  showCards?: boolean;
  positionClass: string; // Tailored layout coordinates on oval felt
  winningHandCardIds?: Set<string>;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  showCards = false,
  positionClass,
  winningHandCardIds,
}) => {
  const isFolded = player.isFolded;
  const isAllIn = player.isAllIn;

  // Action badge color mapping
  const getActionColor = (action?: string) => {
    if (!action) return 'bg-slate-800 text-slate-200';
    const lower = action.toLowerCase();
    if (lower.includes('fold')) return 'bg-rose-950/80 text-rose-300 border-rose-800';
    if (lower.includes('check')) return 'bg-sky-950/80 text-sky-300 border-sky-800';
    if (lower.includes('call')) return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    if (lower.includes('raise') || lower.includes('bet')) return 'bg-amber-950/80 text-amber-300 border-amber-800';
    if (lower.includes('all-in')) return 'bg-purple-950/80 text-purple-300 border-purple-800 ring-2 ring-purple-500/50';
    return 'bg-slate-800 text-slate-200 border-slate-700';
  };

  return (
    <div className={`absolute flex flex-col items-center ${positionClass} z-10 select-none`}>
      {/* Speech / Comment Bubble */}
      <AnimatePresence>
        {player.comment && !isFolded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -top-10 bg-slate-900/95 text-slate-100 text-xs px-3 py-1 rounded-full border border-emerald-500/40 shadow-xl whitespace-nowrap max-w-[180px] truncate z-30"
          >
            "{player.comment}"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Area */}
      <div className="relative flex -space-x-4 mb-1">
        {player.cards.length > 0 ? (
          player.cards.map((card, idx) => {
            const isHighlighted = winningHandCardIds ? winningHandCardIds.has(card.id) : false;
            const canSee = player.isUser || showCards || player.showCards;
            return (
              <CardView
                key={card.id || idx}
                card={card}
                hidden={!canSee && !isFolded}
                highlighted={isHighlighted}
                size="md"
                delay={idx * 0.1}
                className={isFolded ? 'opacity-30 grayscale scale-90' : ''}
              />
            );
          })
        ) : (
          <div className="h-20 w-24 border border-dashed border-emerald-600/30 rounded-lg flex items-center justify-center text-emerald-500/20 text-xs">
            Waiting
          </div>
        )}
      </div>

      {/* Player Badge Container */}
      <div
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md transition-all shadow-xl ${
          isCurrentTurn
            ? 'bg-slate-900/95 border-emerald-400 ring-4 ring-emerald-500/40 shadow-emerald-500/20 scale-105'
            : isFolded
            ? 'bg-slate-950/70 border-slate-800 opacity-50'
            : isAllIn
            ? 'bg-purple-950/90 border-purple-400 ring-2 ring-purple-500/40'
            : 'bg-slate-900/90 border-slate-700/80'
        }`}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-lg overflow-hidden shadow-inner">
            {player.avatar}
          </div>

          {/* Active Turn Pulse Ring */}
          {isCurrentTurn && (
            <span className="absolute -inset-1 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
          )}

          {/* Dealer Button */}
          {player.isDealer && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full border border-amber-200 flex items-center justify-center shadow-md">
              D
            </span>
          )}

          {/* Small Blind / Big Blind Indicator if not dealer */}
          {!player.isDealer && player.isSmallBlind && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-sky-500 text-white font-bold text-[9px] rounded-full border border-sky-300 flex items-center justify-center shadow-md">
              SB
            </span>
          )}
          {!player.isDealer && player.isBigBlind && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-white font-bold text-[9px] rounded-full border border-indigo-300 flex items-center justify-center shadow-md">
              BB
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-[70px]">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-100 truncate max-w-[80px]">
              {player.name}
            </span>
            {player.isUser && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                YOU
              </span>
            )}
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {formatChips(player.chips)}
          </span>
        </div>
      </div>

      {/* Action Status Badge */}
      <AnimatePresence>
        {player.lastAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`mt-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border shadow-md ${getActionColor(
              player.lastAction
            )}`}
          >
            {player.lastAction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips Placed on Felt in Front of Player */}
      {player.currentBet > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -bottom-7 bg-amber-500/90 text-slate-950 font-mono font-black text-xs px-2.5 py-0.5 rounded-full border border-amber-300 shadow-lg flex items-center gap-1 z-20"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-amber-200 border border-slate-900" />
          {formatChips(player.currentBet)}
        </motion.div>
      )}
    </div>
  );
};
