import React from 'react';
import { HandHistoryRecord } from '../types/poker';
import { X, History } from 'lucide-react';
import { formatCardString, formatChips } from '../utils/cardUtils';

interface HandHistoryModalProps {
  history: HandHistoryRecord[];
  onClose: () => void;
}

export const HandHistoryModal: React.FC<HandHistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 relative custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
            <History className="w-5 h-5" />
            RECENT HAND HISTORY
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm italic">
            No completed hands recorded yet. Play a hand to see history!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.slice().reverse().map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2 text-xs"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="font-bold text-slate-300">Hand #{record.id}</span>
                  <span className="text-[11px] text-slate-500">{record.timestamp}</span>
                </div>

                {/* Community cards */}
                <div className="flex items-center gap-1">
                  <span className="text-slate-400 mr-1">Board:</span>
                  {record.communityCards.length > 0 ? (
                    record.communityCards.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-amber-300 font-bold">
                        {formatCardString(c)}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-600 italic">None</span>
                  )}
                </div>

                {/* Winners & Net profit */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <div className="flex flex-col">
                    <span className="text-slate-400">Winner(s):</span>
                    <span className="font-semibold text-emerald-400">
                      {record.winners.map((w) => `${w.name} (${formatChips(w.amount)})`).join(', ')}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-slate-400">Your Result:</div>
                    <div
                      className={`font-mono font-bold ${
                        record.userNetProfit > 0
                          ? 'text-emerald-400'
                          : record.userNetProfit < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {record.userNetProfit > 0 ? '+' : ''}
                      {formatChips(record.userNetProfit)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
