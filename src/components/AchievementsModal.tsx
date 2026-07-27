import React, { useState } from 'react';
import { Achievement, BadgeTier } from '../types/poker';
import { ACHIEVEMENTS } from '../utils/achievements';
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
  Lock,
  Check,
  Medal,
} from 'lucide-react';

interface AchievementsModalProps {
  unlockedRecords: Record<string, { unlockedAt: string; progress: number }>;
  onClose: () => void;
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

const TIER_COLORS: Record<
  BadgeTier,
  {
    bg: string;
    border: string;
    text: string;
    badgeLabel: string;
  }
> = {
  bronze: {
    bg: 'from-amber-950/60 to-slate-900',
    border: 'border-amber-700/60',
    text: 'text-amber-400',
    badgeLabel: 'Bronze',
  },
  silver: {
    bg: 'from-slate-800/80 to-slate-900',
    border: 'border-slate-500/60',
    text: 'text-slate-300',
    badgeLabel: 'Silver',
  },
  gold: {
    bg: 'from-amber-900/60 via-yellow-950/40 to-slate-900',
    border: 'border-yellow-500/60',
    text: 'text-yellow-400',
    badgeLabel: 'Gold',
  },
  diamond: {
    bg: 'from-cyan-950/70 via-indigo-950/50 to-slate-900',
    border: 'border-cyan-400/70',
    text: 'text-cyan-300',
    badgeLabel: 'Diamond',
  },
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  unlockedRecords,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = ACHIEVEMENTS.filter(
    (a) => unlockedRecords[a.id] && unlockedRecords[a.id].unlockedAt
  ).length;

  const totalXP = ACHIEVEMENTS.reduce((acc, a) => {
    return unlockedRecords[a.id]?.unlockedAt ? acc + a.xpPoints : acc;
  }, 0);

  const completionPercentage = Math.round(
    (unlockedCount / ACHIEVEMENTS.length) * 100
  );

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    const isUnlocked = Boolean(unlockedRecords[a.id]?.unlockedAt);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-3xl p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Steam Header Background Glow */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/10 via-sky-500/5 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-sky-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-100 flex items-center gap-2">
                STEAM ACHIEVEMENTS & BADGES
              </h2>
              <p className="text-xs text-slate-400">
                Unlock badges and earn XP as you play Poker hands!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Stats Bar */}
        <div className="my-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 relative z-10">
          <div className="flex items-center justify-between mb-2 text-xs">
            <div className="flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-200">
                {unlockedCount} of {ACHIEVEMENTS.length} Unlocked
              </span>
              <span className="text-slate-500">({completionPercentage}%)</span>
            </div>
            <div className="font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2.5 py-0.5 rounded-lg text-[11px]">
              {totalXP} XP EARNED
            </div>
          </div>

          {/* Steam Styled Bar */}
          <div className="w-full h-3 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 relative z-10">
          {(['all', 'unlocked', 'locked'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                filter === t
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t} {t === 'all' ? `(${ACHIEVEMENTS.length})` : t === 'unlocked' ? `(${unlockedCount})` : `(${ACHIEVEMENTS.length - unlockedCount})`}
            </button>
          ))}
        </div>

        {/* Achievement Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 relative z-10">
          {filteredAchievements.map((ach) => {
            const userRec = unlockedRecords[ach.id];
            const isUnlocked = Boolean(userRec?.unlockedAt);
            const IconComponent = ICON_MAP[ach.iconName] || Trophy;
            const tierStyle = TIER_COLORS[ach.badgeTier];

            const unlockedDateStr = isUnlocked && userRec.unlockedAt
              ? new Date(userRec.unlockedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : null;

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center gap-3.5 ${
                  isUnlocked
                    ? `bg-gradient-to-r ${tierStyle.bg} ${tierStyle.border} shadow-lg`
                    : 'bg-slate-950/50 border-slate-800/80 opacity-70 hover:opacity-90'
                }`}
              >
                {/* Badge Emblem Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border relative ${
                    isUnlocked
                      ? `bg-slate-900 ${tierStyle.border} ${tierStyle.text} shadow-md`
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}
                >
                  {isUnlocked ? (
                    <IconComponent className="w-6 h-6" />
                  ) : ach.secret ? (
                    <Lock className="w-5 h-5 text-slate-600" />
                  ) : (
                    <IconComponent className="w-6 h-6 opacity-40" />
                  )}

                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border border-slate-900">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold truncate ${
                        isUnlocked ? 'text-slate-100' : 'text-slate-400'
                      }`}
                    >
                      {ach.secret && !isUnlocked ? 'Secret Achievement' : ach.title}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-950/80 border-amber-700/80 text-amber-300'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      +{ach.xpPoints} XP
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                    {ach.secret && !isUnlocked
                      ? 'Keep playing to discover this secret achievement!'
                      : ach.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 mt-2 text-[10px]">
                    <span className={`font-semibold ${tierStyle.text}`}>
                      {tierStyle.badgeLabel} Badge
                    </span>

                    {isUnlocked && unlockedDateStr && (
                      <span className="text-emerald-400 font-medium">
                        Unlocked on {unlockedDateStr}
                      </span>
                    )}

                    {!isUnlocked && ach.maxProgress > 1 && !ach.secret && (
                      <span className="text-slate-500 font-mono">
                        Progress: {userRec?.progress || 0} / {ach.maxProgress}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAchievements.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No achievements match this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
