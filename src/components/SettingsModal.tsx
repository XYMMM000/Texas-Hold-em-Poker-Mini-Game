import React from 'react';
import { GameSettings } from '../types/poker';
import { X, Users, Sliders, Volume2, Eye } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetBankroll: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetBankroll,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            GAME SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 text-xs">
          {/* Table Size (2 to 6 Players) */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Table Size (Players at table): {settings.numPlayers}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => onUpdateSettings({ numPlayers: num })}
                  className={`py-2 rounded-xl font-bold border transition ${
                    settings.numPlayers === num
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Game Speed */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-slate-300">AI Action Speed</label>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => onUpdateSettings({ gameSpeed: speed })}
                  className={`py-2 rounded-xl font-bold uppercase border transition ${
                    settings.gameSpeed === speed
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                Sound Effects
              </span>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Show Win Equity & Hand Helper
              </span>
              <input
                type="checkbox"
                checked={settings.showOdds}
                onChange={(e) => onUpdateSettings({ showOdds: e.target.checked })}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Reset Bankroll */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                onResetBankroll();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl font-bold bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 transition"
            >
              Reset Chips & Bankroll ($1,000)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
