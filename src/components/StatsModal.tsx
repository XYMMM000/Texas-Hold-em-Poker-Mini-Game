import React from 'react';
import { GameStats } from '../types/poker';
import { X, BarChart3, Trophy, Flame, Coins, Zap } from 'lucide-react';
import { formatChips } from '../utils/cardUtils';

interface StatsModalProps {
  stats: GameStats;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const winRate = stats.handsPlayed > 0 ? Math.round((stats.handsWon / stats.handsPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            CAREER STATISTICS
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Hands Played
            </div>
            <div className="text-xl font-mono font-bold text-slate-100">{stats.handsPlayed}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              Hands Won
            </div>
            <div className="text-xl font-mono font-bold text-emerald-400">
              {stats.handsWon} <span className="text-xs font-normal text-slate-400">({winRate}%)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-sky-400" />
              Total Profit / Loss
            </div>
            <div
              className={`text-xl font-mono font-bold ${
                stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats.totalProfit >= 0 ? '+' : ''}
              {formatChips(stats.totalProfit)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              Biggest Pot Won
            </div>
            <div className="text-xl font-mono font-bold text-amber-400">
              {formatChips(stats.biggestWin)}
            </div>
          </div>
        </div>

        {/* Best Hand Record */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1 text-xs">
          <span className="text-slate-400">Best Hand Ever Achieved:</span>
          <span className="font-bold text-amber-300 text-sm">{stats.bestHandEver || 'None yet'}</span>
        </div>
      </div>
    </div>
  );
};
