import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../types/poker';
import { getRankLabel, getSuitSymbol, isRedSuit } from '../utils/cardUtils';

interface CardViewProps {
  card?: Card;
  hidden?: boolean;
  highlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  delay?: number;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  hidden = false,
  highlighted = false,
  size = 'md',
  className = '',
  delay = 0,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-14 text-xs rounded-md',
    md: 'w-14 h-20 text-sm rounded-lg sm:w-16 sm:h-24 sm:text-base',
    lg: 'w-20 h-28 text-base rounded-xl sm:w-24 sm:h-36 sm:text-lg',
  };

  const suitIconSizes = {
    sm: 'text-base',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-4xl sm:text-5xl',
  };

  if (hidden || !card) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay }}
        className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 border-2 border-indigo-400/40 shadow-lg relative flex items-center justify-center overflow-hidden select-none ${className}`}
      >
        {/* Patterned Card Back */}
        <div className="absolute inset-1 rounded bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center">
          <div className="w-full h-full opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:8px_8px]" />
          <div className="absolute inset-auto w-6 h-8 sm:w-8 sm:h-12 border border-indigo-400/40 rounded flex items-center justify-center text-indigo-300 font-bold text-xs sm:text-sm">
            ♠
          </div>
        </div>
      </motion.div>
    );
  }

  const red = isRedSuit(card.suit);
  const colorClass = red ? 'text-rose-600' : 'text-slate-900';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.35, delay }}
      className={`${sizeClasses[size]} bg-white border ${
        highlighted
          ? 'border-amber-400 ring-4 ring-amber-400/50 shadow-xl shadow-amber-500/30 -translate-y-2'
          : 'border-slate-300 shadow-md hover:shadow-lg'
      } relative flex flex-col justify-between p-1 sm:p-1.5 overflow-hidden select-none transition-all ${colorClass} ${className}`}
    >
      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-center leading-none self-start">
        <span className="font-extrabold tracking-tighter">{getRankLabel(card.rank)}</span>
        <span className="text-xs sm:text-sm">{getSuitSymbol(card.suit)}</span>
      </div>

      {/* Center Large Suit Symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${suitIconSizes[size]} opacity-90 pointer-events-none`}>
        {getSuitSymbol(card.suit)}
      </div>

      {/* Bottom Right Rank & Suit (Inverted) */}
      <div className="flex flex-col items-center leading-none self-end rotate-180">
        <span className="font-extrabold tracking-tighter">{getRankLabel(card.rank)}</span>
        <span className="text-xs sm:text-sm">{getSuitSymbol(card.suit)}</span>
      </div>
    </motion.div>
  );
};
