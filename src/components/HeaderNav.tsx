import React from 'react';
import { Volume2, VolumeX, Settings, History, HelpCircle, BarChart3, Coins, RotateCcw, CheckCircle2, Trophy } from 'lucide-react';
import { formatChips } from '../utils/cardUtils';

interface HeaderNavProps {
  userChips: number;
  smallBlind: number;
  bigBlind: number;
  handNumber: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onOpenAchievements?: () => void;
  unlockedAchievementsCount?: number;
  onRebuyChips: () => void;
  onNewGame?: () => void;
  isSaved?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  userChips,
  smallBlind,
  bigBlind,
  handNumber,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenStats,
  onOpenRules,
  onOpenHistory,
  onOpenAchievements,
  unlockedAchievementsCount = 0,
  onRebuyChips,
  onNewGame,
  isSaved = true,
}) => {
  return (
    <header className="w-full bg-slate-950/90 border-b border-slate-800 backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-3 text-slate-100 z-30 select-none">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 border border-emerald-300 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-emerald-500/20">
          ♠
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-100 flex items-center gap-2">
            TEXAS HOLD'EM
          </h1>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
            <span>Hand #{handNumber}</span>
            <span>•</span>
            <span className="text-amber-400">
              Blinds: {formatChips(smallBlind)} / {formatChips(bigBlind)}
            </span>
          </div>
        </div>
      </div>

      {/* User Balance & Saved Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-inner">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold text-emerald-400">
            {formatChips(userChips)}
          </span>
          {isSaved && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-sans font-medium text-emerald-400/80 border-l border-slate-800 pl-2 ml-1" title="Game Progress Saved">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Saved
            </span>
          )}
        </div>

        {userChips < bigBlind && (
          <button
            onClick={onRebuyChips}
            className="px-2.5 py-1 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow transition"
          >
            Rebuy
          </button>
        )}
      </div>

      {/* Quick Action Icons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {onNewGame && (
          <button
            onClick={onNewGame}
            title="Start New Game"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition flex items-center gap-1 text-xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline font-semibold text-[11px]">New Game</span>
          </button>
        )}

        {onOpenAchievements && (
          <button
            onClick={onOpenAchievements}
            title="Achievements & Badges"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-300 transition relative"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            {unlockedAchievementsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] flex items-center justify-center border border-slate-950">
                {unlockedAchievementsCount}
              </span>
            )}
          </button>
        )}

        <button
          onClick={onOpenHistory}
          title="Hand History"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          <History className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenStats}
          title="Statistics"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenRules}
          title="Poker Rules"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
        </button>

        <button
          onClick={onOpenSettings}
          title="Game Settings"
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};


