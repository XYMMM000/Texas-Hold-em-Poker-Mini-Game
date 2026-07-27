import React from 'react';
import { Card, GameStage, Player, Pot } from '../types/poker';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';

interface PokerTableProps {
  players: Player[];
  activePlayerIndex: number;
  communityCards: Card[];
  pots: Pot[];
  totalPotAmount: number;
  stage: GameStage;
  winningCardIds?: Set<string>;
  showAllCards?: boolean;
}

// Seat positions around the oval table based on total players (2 to 6)
const SEAT_POSITIONS: Record<number, string[]> = {
  2: [
    'bottom-2 left-1/2 -translate-x-1/2', // User
    'top-2 left-1/2 -translate-x-1/2',    // Heads-up Bot
  ],
  3: [
    'bottom-2 left-1/2 -translate-x-1/2',  // User
    'top-12 left-8',                        // Bot 1
    'top-12 right-8',                       // Bot 2
  ],
  4: [
    'bottom-2 left-1/2 -translate-x-1/2',  // User
    'top-1/2 left-2 -translate-y-1/2',     // Bot 1 (Left)
    'top-2 left-1/2 -translate-x-1/2',     // Bot 2 (Top)
    'top-1/2 right-2 -translate-y-1/2',    // Bot 3 (Right)
  ],
  5: [
    'bottom-2 left-1/2 -translate-x-1/2',  // User
    'bottom-20 left-4',                    // Bot 1
    'top-6 left-12',                       // Bot 2
    'top-6 right-12',                      // Bot 3
    'bottom-20 right-4',                   // Bot 4
  ],
  6: [
    'bottom-2 left-1/2 -translate-x-1/2',  // User (Bottom Center)
    'bottom-16 left-4 sm:left-8',          // Bot 1 (Bottom Left)
    'top-10 left-8 sm:left-16',            // Bot 2 (Top Left)
    'top-2 left-1/2 -translate-x-1/2',     // Bot 3 (Top Center)
    'top-10 right-8 sm:right-16',          // Bot 4 (Top Right)
    'bottom-16 right-4 sm:right-8',        // Bot 5 (Bottom Right)
  ],
};

export const PokerTable: React.FC<PokerTableProps> = ({
  players,
  activePlayerIndex,
  communityCards,
  pots,
  totalPotAmount,
  stage,
  winningCardIds,
  showAllCards = false,
}) => {
  const numPlayers = players.length;
  const positions = SEAT_POSITIONS[numPlayers] || SEAT_POSITIONS[6];

  return (
    <div className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-[16/9] mx-auto my-2 p-4 flex items-center justify-center select-none">
      {/* Oval Felt Table Outer Ring */}
      <div className="absolute inset-4 sm:inset-6 rounded-[120px] sm:rounded-[180px] bg-gradient-to-b from-amber-900 via-amber-950 to-amber-950 border-8 sm:border-[14px] border-amber-900/90 shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Felt Inner Canvas */}
        <div className="absolute inset-2 sm:inset-3 rounded-[110px] sm:rounded-[165px] bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950 border-2 border-emerald-500/30 shadow-inner flex flex-col items-center justify-center">
          {/* Subtle Felt Texture Lines */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15)_0%,rgba(6,78,59,0.8)_100%)]" />
          
          {/* Center Table Oval Ring Graphic */}
          <div className="absolute inset-10 sm:inset-16 rounded-[80px] sm:rounded-[120px] border border-emerald-400/20 pointer-events-none" />

          {/* Center Community Cards & Pot Stage */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            <PotDisplay pots={pots} totalPotAmount={totalPotAmount} />
            <CommunityCards
              cards={communityCards}
              stage={stage}
              winningCardIds={winningCardIds}
            />
          </div>
        </div>
      </div>

      {/* Render Player Seats */}
      {players.map((player, idx) => (
        <PlayerSeat
          key={player.id}
          player={player}
          isCurrentTurn={idx === activePlayerIndex && stage !== 'SHOWDOWN' && stage !== 'HAND_OVER'}
          showCards={showAllCards}
          positionClass={positions[idx] || 'bottom-0 left-1/2 -translate-x-1/2'}
          winningHandCardIds={winningCardIds}
        />
      ))}
    </div>
  );
};
