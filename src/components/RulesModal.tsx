import React from 'react';
import { X, HelpCircle, Flame } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const handRanks = [
    { name: 'Royal Flush', cards: 'A♠ K♠ Q♠ J♠ 10♠', desc: 'A, K, Q, J, 10 of the same suit. The highest poker hand.' },
    { name: 'Straight Flush', cards: '9♥ 8♥ 7♥ 6♥ 5♥', desc: '5 consecutive cards of the same suit.' },
    { name: 'Four of a Kind', cards: 'Q♣ Q♦ Q♠ Q♥ 7♠', desc: '4 cards of the same rank.' },
    { name: 'Full House', cards: 'J♠ J♥ J♦ 8♣ 8♠', desc: '3 of a kind plus a pair.' },
    { name: 'Flush', cards: 'A♦ J♦ 8♦ 4♦ 2♦', desc: 'Any 5 cards of the same suit.' },
    { name: 'Straight', cards: '10♠ 9♦ 8♣ 7♥ 6♠', desc: '5 consecutive cards of any suit.' },
    { name: 'Three of a Kind', cards: '9♠ 9♥ 9♦ K♣ 4♠', desc: '3 cards of the same rank.' },
    { name: 'Two Pair', cards: 'K♠ K♦ 5♥ 5♣ A♠', desc: 'Two different pairs.' },
    { name: 'One Pair', cards: 'A♠ A♥ J♦ 8♣ 3♠', desc: 'Two cards of the same rank.' },
    { name: 'High Card', cards: 'A♠ K♦ 9♣ 7♥ 2♠', desc: 'Highest single card when no pair is made.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-slate-100 relative custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 sticky top-0 bg-slate-900 z-10">
          <h2 className="text-xl font-black text-amber-300 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            TEXAS HOLD'EM RULES & HAND RANKS
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Rules Overview */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex flex-col gap-2">
          <div className="font-bold text-amber-400 flex items-center gap-1.5 text-sm">
            <Flame className="w-4 h-4" />
            Game Overview
          </div>
          <p>
            1. <strong>Deal:</strong> Each player receives 2 private hole cards.
          </p>
          <p>
            2. <strong>Betting Rounds:</strong> 4 betting rounds take place: <strong>Pre-Flop</strong>, <strong>Flop</strong> (3 cards), <strong>Turn</strong> (1 card), and <strong>River</strong> (1 card).
          </p>
          <p>
            3. <strong>Showdown:</strong> Remaining players make their best 5-card poker hand using any combination of their 2 hole cards and 5 community cards.
          </p>
        </div>

        {/* Hand Rankings */}
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Hand Rankings (Highest to Lowest)
        </h3>

        <div className="flex flex-col gap-2.5">
          {handRanks.map((hr, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-bold text-emerald-400 flex items-center gap-2">
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">
                    #{idx + 1}
                  </span>
                  {hr.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{hr.desc}</div>
              </div>

              <div className="font-mono font-bold text-xs bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-xl text-amber-300 tracking-wider shrink-0">
                {hr.cards}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
