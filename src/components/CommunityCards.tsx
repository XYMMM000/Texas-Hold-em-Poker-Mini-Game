import React from 'react';
import { Card, GameStage } from '../types/poker';
import { CardView } from './CardView';

interface CommunityCardsProps {
  cards: Card[];
  stage: GameStage;
  winningCardIds?: Set<string>;
}

export const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  stage,
  winningCardIds,
}) => {
  const getStageTitle = () => {
    switch (stage) {
      case 'PRE_FLOP':
        return 'Pre-Flop';
      case 'FLOP':
        return 'The Flop';
      case 'TURN':
        return 'The Turn';
      case 'RIVER':
        return 'The River';
      case 'SHOWDOWN':
        return 'Showdown';
      case 'HAND_OVER':
        return 'Hand Over';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center my-2">
      {/* Cards Board */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 p-2 sm:p-3 bg-emerald-950/60 rounded-2xl border border-emerald-500/30 backdrop-blur-md shadow-2xl">
        {[0, 1, 2, 3, 4].map((index) => {
          const card = cards[index];
          const isHighlighted = card && winningCardIds ? winningCardIds.has(card.id) : false;

          return card ? (
            <CardView
              key={card.id || index}
              card={card}
              size="md"
              highlighted={isHighlighted}
              delay={index * 0.08}
            />
          ) : (
            <div
              key={index}
              className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 border-dashed border-emerald-700/40 bg-emerald-900/20 flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-600/30" />
            </div>
          );
        })}
      </div>

      {/* Stage Badge */}
      <div className="mt-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold tracking-wider uppercase shadow-inner">
        {getStageTitle()}
      </div>
    </div>
  );
};
