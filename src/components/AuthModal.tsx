import React, { useState } from 'react';
import { UserProfile } from '../types/bgg';
import {
  getAllUsers,
  createUser,
  saveUser,
  setCurrentUserId,
  hashPassword,
  verifyPassword,
} from '../services/communityStorage';
import {
  X,
  UserPlus,
  Check,
  Globe,
  Lock,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [tab, setTab] = useState<'profile' | 'switch' | 'new'>('profile');
  const [users, setUsers] = useState<UserProfile[]>(getAllUsers());

  // Edit current profile state
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [bggUsername, setBggUsername] = useState(currentUser.bggUsername || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [isPublic, setIsPublic] = useState(currentUser.isPublic);
  const [newPassword, setNewPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Switch user auth state
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [switchPin, setSwitchPin] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // New user registration state
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newBggUsername, setNewBggUsername] = useState('');
  const [newAccountPin, setNewAccountPin] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    let passwordHash = currentUser.passwordHash;
    if (newPassword.trim()) {
      passwordHash = await hashPassword(newPassword.trim());
    }

    const updated: UserProfile = {
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      bggUsername: bggUsername.trim() || undefined,
      bio: bio.trim() || undefined,
      isPublic,
      passwordHash,
    };
    saveUser(updated);
    onUserChange(updated);
    setUsers(getAllUsers());
    setNewPassword('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handlePromptSwitch = (user: UserProfile) => {
    if (user.id === currentUser.id) return;
    setTargetUser(user);
    setSwitchPin('');
    setSwitchError(null);
  };

  const handleConfirmSwitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;

    if (!targetUser.passwordHash) {
      // User has no password protection, switch directly
      performSwitch(targetUser);
      return;
    }

    setIsVerifying(true);
    setSwitchError(null);
    try {
      const isValid = await verifyPassword(switchPin, targetUser.passwordHash);
      if (isValid) {
        performSwitch(targetUser);
      } else {
        setSwitchError('Incorrect PIN/Password for this profile.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const performSwitch = (user: UserProfile) => {
    setCurrentUserId(user.id);
    onUserChange(user);
    setDisplayName(user.displayName);
    setBggUsername(user.bggUsername || '');
    setBio(user.bio || '');
    setIsPublic(user.isPublic);
    setTargetUser(null);
    onClose();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    if (!newUsername.trim()) return;

    if (!newAccountPin.trim()) {
      setRegisterError('Please set a PIN or password to protect your account.');
      return;
    }

    const passwordHash = await hashPassword(newAccountPin.trim());
    const user = createUser(
      newUsername,
      newDisplayName || newUsername,
      newBggUsername,
      passwordHash
    );
    onUserChange(user);
    setUsers(getAllUsers());
    setNewUsername('');
    setNewDisplayName('');
    setNewBggUsername('');
    setNewAccountPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl ${currentUser.avatarColor} flex items-center justify-center font-bold text-sm shadow-md`}>
              {currentUser.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">User Account & Security</h3>
              <p className="text-xs text-slate-400">Password protection & library permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('profile');
              setTargetUser(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              tab === 'profile'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Profile
          </button>
          <button
            onClick={() => {
              setTab('switch');
              setTargetUser(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              tab === 'switch'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch User ({users.length})
          </button>
          <button
            onClick={() => {
              setTab('new');
              setTargetUser(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'new'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* TAB 1: EDIT PROFILE & SECURITY */}
        {tab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Carlos M. (Host)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                BoardGameGeek (BGG) Username <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={bggUsername}
                onChange={(e) => setBggUsername(e.target.value)}
                placeholder="e.g. karatistos"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Short Bio / Gaming Taste</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Love heavy economic Euros, engine building, and cooperative campaigns."
                rows={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            {/* Password Protection Section */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Profile Password / PIN Protection</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Prevents other users from switching into your profile or modifying your files.
              </p>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={currentUser.passwordHash ? 'Change PIN/Password (leave empty to keep current)' : 'Set a new PIN/Password...'}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Sharing Permission Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="pt-0.5">
                {isPublic ? (
                  <Globe className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Lock className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Share collection with group</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {isPublic
                    ? 'Other group members can explore your collection and view attached guides in Read-Only mode. They cannot edit your library or notes.'
                    : 'Your collection is private to your account.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" /> Profile & security saved!
                </span>
              ) : (
                <div />
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: SWITCH USER WITH PASSWORD AUTHENTICATION */}
        {tab === 'switch' && (
          <div className="space-y-3">
            {!targetUser ? (
              <>
                <p className="text-xs text-slate-400">
                  Select a profile to switch accounts. Password-protected profiles will prompt for their PIN.
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {users.map((u) => {
                    const isActive = u.id === currentUser.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => handlePromptSwitch(u)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isActive
                            ? 'bg-orange-500/10 border-orange-500 text-white'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${u.avatarColor} flex items-center justify-center font-bold text-xs`}>
                            {u.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{u.displayName}</span>
                              {isActive && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-500 text-white font-mono">
                                  Current
                                </span>
                              )}
                              {u.passwordHash && (
                                <span title="Password protected">
                                  <Lock className="w-3 h-3 text-slate-400" />
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">@{u.username}</div>
                          </div>
                        </div>
                        {!isActive && <ArrowRight className="w-4 h-4 opacity-50" />}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* Inline Password Challenge Prompt */
              <form onSubmit={handleConfirmSwitch} className="p-4 rounded-xl bg-slate-950 border border-orange-500/30 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-white">
                      Enter PIN for {targetUser.displayName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTargetUser(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Back to List
                  </button>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="password"
                    value={switchPin}
                    onChange={(e) => setSwitchPin(e.target.value)}
                    placeholder="Enter PIN / Password..."
                    autoFocus
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 font-mono tracking-widest text-center"
                    required
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>💡 Demo profiles default PIN: <strong className="text-slate-400">1234</strong></span>
                  </div>
                </div>

                {switchError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{switchError}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetUser(null)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying || !switchPin.trim()}
                    className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                  >
                    {isVerifying ? 'Verifying...' : 'Unlock & Switch'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: CREATE ACCOUNT */}
        {tab === 'new' && (
          <form onSubmit={handleCreateUser} className="space-y-4">
            <p className="text-xs text-slate-400">
              Create a password-protected profile so only you can modify your collection, rulebook attachments, and private annotations.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. mateo_boardgames"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="e.g. Mateo D."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                BoardGameGeek Username <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={newBggUsername}
                onChange={(e) => setNewBggUsername(e.target.value)}
                placeholder="e.g. mateo_bgg"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-400" />
                <span>Account Password / PIN</span>
              </label>
              <input
                type="password"
                value={newAccountPin}
                onChange={(e) => setNewAccountPin(e.target.value)}
                placeholder="Set 4-digit PIN or password..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 font-mono"
                required
              />
              <p className="text-[11px] text-slate-500">
                You will need this PIN to log in and manage your library.
              </p>
            </div>

            {registerError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{registerError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Protected Account & Log In</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
