import React, { useState, useEffect } from 'react';
import { Player } from '../types/poker';
import { formatChips } from '../utils/cardUtils';

interface ControlPanelProps {
  userPlayer: Player;
  isUserTurn: boolean;
  currentHighestBet: number;
  minRaiseAmount: number;
  totalPotAmount: number;
  bigBlind: number;
  onFold: () => void;
  onCheck: () => void;
  onCall: (amount: number) => void;
  onRaise: (amount: number) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  userPlayer,
  isUserTurn,
  currentHighestBet,
  minRaiseAmount,
  totalPotAmount,
  bigBlind,
  onFold,
  onCheck,
  onCall,
  onRaise,
}) => {
  const amountToCall = currentHighestBet - userPlayer.currentBet;
  const canCheck = amountToCall === 0;
  const maxAvailableChips = userPlayer.chips;

  // Calculate default raise amount
  const defaultRaise = Math.min(
    Math.max(minRaiseAmount, currentHighestBet + bigBlind),
    maxAvailableChips
  );

  const [raiseAmount, setRaiseAmount] = useState<number>(defaultRaise);

  // Sync state when variables change
  useEffect(() => {
    setRaiseAmount(
      Math.min(
        Math.max(minRaiseAmount, currentHighestBet + bigBlind),
        maxAvailableChips
      )
    );
  }, [minRaiseAmount, currentHighestBet, bigBlind, maxAvailableChips]);

  if (userPlayer.isFolded || userPlayer.isAllIn) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-center text-slate-400 text-sm font-medium">
        {userPlayer.isFolded
          ? 'You folded this hand. Waiting for round to complete...'
          : 'You are ALL-IN! Watching the action unfold...'}
      </div>
    );
  }

  // Quick preset handlers
  const handleSetPreset = (fraction: number) => {
    let target = Math.round(totalPotAmount * fraction);
    if (fraction === 100) target = maxAvailableChips; // All in
    target = Math.max(target, minRaiseAmount);
    target = Math.min(target, maxAvailableChips);
    setRaiseAmount(target);
  };

  return (
    <div
      className={`w-full max-w-3xl mx-auto p-3 sm:p-4 rounded-2xl border transition-all shadow-2xl backdrop-blur-xl ${
        isUserTurn
          ? 'bg-slate-900/95 border-emerald-500/60 ring-2 ring-emerald-500/30'
          : 'bg-slate-950/80 border-slate-800 opacity-60 pointer-events-none'
      }`}
    >
      {/* Top Slider & Quick Preset Buttons */}
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-300">
          <span>Raise Preset</span>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400">$</span>
            <input
              type="number"
              value={raiseAmount}
              min={minRaiseAmount}
              max={maxAvailableChips}
              onChange={(e) => {
                const val = parseInt(e.target.value) || minRaiseAmount;
                setRaiseAmount(Math.min(Math.max(val, minRaiseAmount), maxAvailableChips));
              }}
              className="w-20 bg-transparent text-amber-400 font-bold font-mono focus:outline-none text-right"
            />
          </div>
        </div>

        {/* Raise Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400">{formatChips(minRaiseAmount)}</span>
          <input
            type="range"
            min={minRaiseAmount}
            max={maxAvailableChips}
            step={bigBlind}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="flex-1 accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-slate-400">{formatChips(maxAvailableChips)}</span>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          <button
            onClick={() => setRaiseAmount(minRaiseAmount)}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Min
          </button>
          <button
            onClick={() => handleSetPreset(0.5)}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            1/2 Pot
          </button>
          <button
            onClick={() => handleSetPreset(0.75)}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            3/4 Pot
          </button>
          <button
            onClick={() => handleSetPreset(1.0)}
            className="py-1 px-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            Pot
          </button>
          <button
            onClick={() => handleSetPreset(100)}
            className="py-1 px-2 text-xs font-bold rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-700 transition"
          >
            All-In
          </button>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Fold Button */}
        <button
          onClick={onFold}
          className="py-3 px-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white border border-rose-500/50 shadow-lg shadow-rose-950/50 active:scale-95 transition"
        >
          FOLD
        </button>

        {/* Check or Call Button */}
        {canCheck ? (
          <button
            onClick={onCheck}
            className="py-3 px-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-sky-700 to-sky-600 hover:from-sky-600 hover:to-sky-500 text-white border border-sky-500/50 shadow-lg shadow-sky-950/50 active:scale-95 transition"
          >
            CHECK
          </button>
        ) : (
          <button
            onClick={() => onCall(amountToCall)}
            className="py-3 px-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white border border-emerald-500/50 shadow-lg shadow-emerald-950/50 active:scale-95 transition flex flex-col items-center justify-center leading-tight"
          >
            <span>CALL</span>
            <span className="text-xs font-mono font-normal opacity-90">
              {formatChips(Math.min(amountToCall, maxAvailableChips))}
            </span>
          </button>
        )}

        {/* Bet / Raise Button */}
        <button
          onClick={() => onRaise(raiseAmount)}
          className="py-3 px-4 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 border border-amber-300 shadow-lg shadow-amber-950/50 active:scale-95 transition flex flex-col items-center justify-center leading-tight"
        >
          <span>{currentHighestBet > 0 ? 'RAISE TO' : 'BET'}</span>
          <span className="text-xs font-mono font-bold">
            {formatChips(raiseAmount)}
          </span>
        </button>
      </div>
    </div>
  );
};
