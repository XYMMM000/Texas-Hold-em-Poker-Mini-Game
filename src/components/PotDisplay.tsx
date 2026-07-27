import React from 'react';
import { motion } from 'motion/react';
import { Pot } from '../types/poker';
import { formatChips } from '../utils/cardUtils';

interface PotDisplayProps {
  pots: Pot[];
  totalPotAmount: number;
}

export const PotDisplay: React.FC<PotDisplayProps> = ({ pots, totalPotAmount }) => {
  if (totalPotAmount <= 0) return null;

  return (
    <div className="flex flex-col items-center justify-center my-1 z-10 select-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 rounded-full border border-amber-400/50 backdrop-blur-md shadow-lg shadow-amber-500/10"
      >
        {/* Chip Graphic Icon */}
        <div className="flex -space-x-1">
          <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-200 shadow-sm" />
          <div className="w-4 h-4 rounded-full bg-rose-500 border border-rose-200 shadow-sm" />
          <div className="w-4 h-4 rounded-full bg-indigo-500 border border-indigo-200 shadow-sm" />
        </div>

        {/* Total Pot Label */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase tracking-wider font-semibold text-amber-200/90">
            Total Pot:
          </span>
          <span className="text-base sm:text-lg font-mono font-black text-amber-300">
            {formatChips(totalPotAmount)}
          </span>
        </div>
      </motion.div>

      {/* Side Pots breakdown if multi-way all-in */}
      {pots.length > 1 && (
        <div className="flex items-center gap-2 mt-1">
          {pots.map((pot, idx) => (
            <span
              key={pot.id}
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300/80 border border-amber-500/20"
            >
              {pot.isMain ? 'Main Pot' : `Side ${idx}`}: {formatChips(pot.amount)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
