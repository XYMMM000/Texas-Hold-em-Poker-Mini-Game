import React, { useState } from 'react';
import { SavedGameState } from '../types/poker';
import { Coins, Play, RotateCcw, Trophy, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatChips } from '../utils/cardUtils';

interface ContinueGameModalProps {
  savedState: SavedGameState;
  onContinue: () => void;
  onStartNewGame: () => void;
}

export const ContinueGameModal: React.FC<ContinueGameModalProps> = ({
  savedState,
  onContinue,
  onStartNewGame,
}) => {
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  const savedDate = savedState.savedAt
    ? new Date(savedState.savedAt).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const userWonHands = savedState.stats?.handsWon || 0;
  const handsPlayed = savedState.stats?.handsPlayed || 0;
  const totalProfit = savedState.stats?.totalProfit || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-6 shadow-2xl text-slate-100 relative">
        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto mb-3 shadow-lg shadow-amber-500/10">
            <Coins className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-amber-300 tracking-tight flex items-center justify-center gap-2">
            WELCOME BACK
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            We found a saved poker game session from your browser.
          </p>
        </div>

        {/* Saved Session Stats Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Your Chip Balance</span>
            </div>
            <div className="text-xl font-mono font-black text-emerald-400">
              {formatChips(savedState.userChips)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Hands Record</span>
              </div>
              <div className="font-mono font-bold text-slate-200">
                {userWonHands} / {handsPlayed} won
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-slate-400 flex items-center gap-1 mb-0.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Saved At</span>
              </div>
              <div className="font-mono font-semibold text-slate-300 truncate">
                {savedDate}
              </div>
            </div>
          </div>

          {totalProfit !== 0 && (
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <span className="text-slate-400">Career Net Profit:</span>
              <span
                className={`font-mono font-bold ${
                  totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalProfit >= 0 ? '+' : ''}
                {formatChips(totalProfit)}
              </span>
            </div>
          )}
        </div>

        {/* Action Choice or Confirmation */}
        {!showNewGameConfirm ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={onContinue}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 transition flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              CONTINUE SAVED GAME ({formatChips(savedState.userChips)})
            </button>

            <button
              onClick={() => setShowNewGameConfirm(true)}
              className="w-full py-3 px-4 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-bold rounded-2xl transition flex items-center justify-center gap-2 text-xs"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              Start New Game (Reset)
            </button>
          </div>
        ) : (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Are you sure? This will reset your bankroll to default $1,000!
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowNewGameConfirm(false)}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={onStartNewGame}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow transition"
              >
                Confirm New Game
              </button>
            </div>
          </div>
        )}

        {/* Footer Auto-Save reassurance */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Your chip balance and stats auto-save after every hand.</span>
        </div>
      </div>
    </div>
  );
};
