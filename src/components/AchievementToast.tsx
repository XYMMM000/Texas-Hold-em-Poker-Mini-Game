import React, { useEffect } from 'react';
import { Achievement, BadgeTier } from '../types/poker';
import {
  Trophy,
  Award,
  Crown,
  Coins,
  Flame,
  Zap,
  Sparkles,
  EyeOff,
  Swords,
  Shield,
  Crosshair,
  X,
} from 'lucide-react';

interface AchievementToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy,
  Award,
  Crown,
  Coins,
  Flame,
  Zap,
  Sparkles,
  EyeOff,
  Swords,
  Shield,
  Crosshair,
};

const TIER_STYLING: Record<
  BadgeTier,
  {
    border: string;
    glow: string;
    badgeBg: string;
    textAccent: string;
    label: string;
  }
> = {
  bronze: {
    border: 'border-amber-700/80',
    glow: 'shadow-amber-900/30',
    badgeBg: 'from-amber-800 to-amber-950 text-amber-300 border-amber-600/60',
    textAccent: 'text-amber-400',
    label: 'BRONZE BADGE',
  },
  silver: {
    border: 'border-slate-500/80',
    glow: 'shadow-slate-500/20',
    badgeBg: 'from-slate-600 to-slate-900 text-slate-200 border-slate-400/60',
    textAccent: 'text-slate-300',
    label: 'SILVER BADGE',
  },
  gold: {
    border: 'border-yellow-500/90',
    glow: 'shadow-yellow-500/30',
    badgeBg: 'from-yellow-600 to-amber-900 text-yellow-200 border-yellow-400/80',
    textAccent: 'text-yellow-400',
    label: 'GOLD BADGE',
  },
  diamond: {
    border: 'border-cyan-400/90',
    glow: 'shadow-cyan-500/40',
    badgeBg: 'from-cyan-600 via-sky-700 to-indigo-950 text-cyan-200 border-cyan-300',
    textAccent: 'text-cyan-300',
    label: 'DIAMOND BADGE',
  },
};

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const IconComponent = ICON_MAP[achievement.iconName] || Trophy;
  const style = TIER_STYLING[achievement.badgeTier] || TIER_STYLING.bronze;

  return (
    <div
      onClick={onDismiss}
      className={`group cursor-pointer pointer-events-auto flex items-center gap-3 bg-slate-950/95 border ${style.border} ${style.glow} shadow-2xl rounded-2xl p-3.5 max-w-sm w-full backdrop-blur-xl animate-slideInRight hover:scale-[1.02] transition-transform duration-200 relative overflow-hidden`}
    >
      {/* Glossy Steam Overlay Highlight */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-transparent pointer-events-none" />

      {/* Steam Badge Icon Frame */}
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-b ${style.badgeBg} border flex items-center justify-center shrink-0 shadow-lg relative`}
      >
        <IconComponent className="w-6 h-6 animate-pulse" />
        <span className="absolute -bottom-1 -right-1 text-[9px] font-black bg-slate-950 px-1 py-0.2 rounded border border-slate-700 text-amber-300">
          +{achievement.xpPoints}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black tracking-wider text-amber-400 uppercase">
            ACHIEVEMENT UNLOCKED!
          </span>
          <span className="text-[9px] text-slate-500">•</span>
          <span className={`text-[9px] font-mono font-bold ${style.textAccent}`}>
            {style.label}
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-100 truncate mt-0.5">
          {achievement.title}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 leading-tight mt-0.5">
          {achievement.description}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800/60 transition shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
