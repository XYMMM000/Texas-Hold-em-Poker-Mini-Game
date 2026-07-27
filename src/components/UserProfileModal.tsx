import React, { useState } from 'react';
import { User, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import {
  User as UserIcon,
  LogOut,
  X,
  ShieldCheck,
  Coins,
  Trophy,
  Check,
  Edit2,
  Cloud,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatChips } from '../utils/cardUtils';
import { GameStats } from '../types/poker';

interface UserProfileModalProps {
  user: User;
  userChips: number;
  stats: GameStats;
  unlockedCount: number;
  onClose: () => void;
  onProfileUpdated?: (newDisplayName: string, newAvatar?: string) => void;
}

const AVATAR_OPTIONS = ['😎', '🕶️', '🤠', '🎩', '👑', '🦈', '🤖', '🦊', '🦁', '🐉'];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  userChips,
  stats,
  unlockedCount,
  onClose,
  onProfileUpdated,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName || 'Poker Player');
  const [selectedAvatar, setSelectedAvatar] = useState('😎');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });

        // Also update in firestore document
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          displayName: displayName.trim(),
          avatar: selectedAvatar,
        });
      }

      if (onProfileUpdated) {
        onProfileUpdated(displayName.trim(), selectedAvatar);
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-3xl p-6 shadow-2xl text-slate-100 relative overflow-hidden">
        {/* Header background glow */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-sky-500/15 via-emerald-500/5 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-slate-100">
                USER PROFILE & CLOUD SAVE
              </h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Cloud Sync Active</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Info */}
        <div className="my-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                {user.photoURL || selectedAvatar}
              </div>
              <div>
                {!isEditing ? (
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-slate-100">
                      {displayName}
                    </h4>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-slate-500 hover:text-amber-400 rounded transition"
                      title="Edit Display Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="p-1 bg-emerald-600 text-slate-950 rounded font-bold hover:bg-emerald-500 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 truncate max-w-[200px]">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400 flex items-center justify-end gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Bankroll</span>
              </div>
              <div className="text-lg font-mono font-black text-emerald-400">
                {formatChips(userChips)}
              </div>
            </div>
          </div>

          {/* Avatar selector if editing */}
          {isEditing && (
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-[10px] font-bold text-slate-400 mb-1">
                Select Table Avatar Emoji:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedAvatar(emoji)}
                    className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition ${
                      selectedAvatar === emoji
                        ? 'bg-amber-500/20 border border-amber-400 scale-110'
                        : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Hands</div>
              <div className="text-sm font-mono font-bold text-slate-200">
                {stats.handsWon} / {stats.handsPlayed}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Profit</div>
              <div
                className={`text-sm font-mono font-bold ${
                  stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {stats.totalProfit >= 0 ? '+' : ''}
                {formatChips(stats.totalProfit)}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Badges</div>
              <div className="text-sm font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                {unlockedCount}
              </div>
            </div>
          </div>
        </div>

        {/* Sync Reassurance */}
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 flex items-start gap-2.5 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            Your poker bankroll, stats, and unlocked achievements automatically backup to Firestore whenever you finish a hand.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 relative z-10 pt-2 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="py-2.5 px-4 bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800/80 text-slate-300 hover:text-rose-300 font-bold rounded-2xl transition flex items-center gap-2 text-xs"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl transition text-xs shadow-md"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
