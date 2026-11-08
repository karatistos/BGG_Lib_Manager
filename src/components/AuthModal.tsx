import React, { useState } from 'react';
import { UserProfile } from '../types/bgg';
import {
  getAllUsers,
  createUser,
  saveUser,
  setCurrentUserId,
  hashPassword,
  verifyPassword,
  getClubEntryKey,
  setClubEntryKey,
  deleteUserByAdmin,
  resetUserPasswordByAdmin,
  isSuperAdmin,
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
  Shield,
  Trash2,
  Crown,
  Key,
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
  const isAdmin = isSuperAdmin(currentUser);
  const [tab, setTab] = useState<'profile' | 'switch' | 'new' | 'admin'>('profile');
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
  const [clubEntryKeyInput, setClubEntryKeyInput] = useState('');
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Super Admin panel state
  const [adminClubKey, setAdminClubKey] = useState<string>(getClubEntryKey());
  const [clubKeySaveSuccess, setClubKeySaveSuccess] = useState(false);
  const [resetPinUserId, setResetPinUserId] = useState<string | null>(null);
  const [resetPinValue, setResetPinValue] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

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

    // Validate Anti-Flood Registration Key
    const currentClubKey = getClubEntryKey().trim();
    if (clubEntryKeyInput.trim().toUpperCase() !== currentClubKey.toUpperCase()) {
      setRegisterError(`Invalid Club Registration Key. Please ask the club administrator for the entry key.`);
      return;
    }

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
    setClubEntryKeyInput('');
    onClose();
  };

  const handleSaveAdminClubKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminClubKey.trim()) return;
    setClubEntryKey(adminClubKey.trim());
    setClubKeySaveSuccess(true);
    setTimeout(() => setClubKeySaveSuccess(false), 2500);
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete profile "${name}" and all their associated files?`)) {
      const success = deleteUserByAdmin(userId);
      if (success) {
        setUsers(getAllUsers());
      }
    }
  };

  const handleResetPinSubmit = async (userId: string) => {
    if (!resetPinValue.trim()) return;
    await resetUserPasswordByAdmin(userId, resetPinValue.trim());
    setResetPinUserId(null);
    setResetPinValue('');
    setResetSuccessMessage('Password reset successfully!');
    setUsers(getAllUsers());
    setTimeout(() => setResetSuccessMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl ${currentUser.avatarColor} flex items-center justify-center font-bold text-sm shadow-md`}
            >
              {currentUser.displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-white text-base">User Account & Security</h3>
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-orange-400" /> Super Admin
                  </span>
                )}
              </div>
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
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setTab('profile');
              setTargetUser(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all shrink-0 ${
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
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all shrink-0 ${
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
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              tab === 'new'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setTab('admin');
                setTargetUser(null);
              }}
              className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                tab === 'admin'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}
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
                placeholder={
                  currentUser.passwordHash
                    ? 'Change PIN/Password (leave empty to keep current)'
                    : 'Set a new PIN/Password...'
                }
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
                    ? 'Other group members can explore your collection in the Club Super Library in Read-Only mode. They cannot edit your library or notes.'
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
                    const isUserAdmin = isSuperAdmin(u);
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
                          <div
                            className={`w-8 h-8 rounded-lg ${u.avatarColor} flex items-center justify-center font-bold text-xs`}
                          >
                            {u.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold flex items-center gap-1.5">
                              <span>{u.displayName}</span>
                              {isUserAdmin && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-0.5">
                                  <Crown className="w-2.5 h-2.5" /> Super Admin
                                </span>
                              )}
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
              <form
                onSubmit={handleConfirmSwitch}
                className="p-4 rounded-xl bg-slate-950 border border-orange-500/30 space-y-4 animate-in fade-in duration-200"
              >
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
                    {isSuperAdmin(targetUser) ? (
                      <span>🛡️ Super Admin Master Key required</span>
                    ) : (
                      <span>💡 Demo profiles default PIN: <strong className="text-slate-400">1234</strong></span>
                    )}
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
              Create a protected profile. A Club Invitation Key is required to prevent flood abuse.
            </p>

            {/* Anti-Flood Entry Key */}
            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-1.5">
              <label className="text-xs font-bold text-orange-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-orange-400" />
                <span>Club Invitation / Entry Key *</span>
              </label>
              <input
                type="text"
                value={clubEntryKeyInput}
                onChange={(e) => setClubEntryKeyInput(e.target.value)}
                placeholder="Enter club invitation key..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 uppercase font-mono tracking-wider"
                required
              />
              <p className="text-[11px] text-slate-400">
                Obtain this key from the club organizer (Carlos M.) to register your profile.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="e.g. juan_boardgames"
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
                placeholder="e.g. Juan P."
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
                placeholder="e.g. juan_bgg"
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

        {/* TAB 4: SUPER ADMIN CONTROL PANEL (Only for isSuperAdmin) */}
        {tab === 'admin' && isAdmin && (
          <div className="space-y-5">
            {/* Club Registration Entry Key Management */}
            <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Club Anti-Flood Registration Key
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                New users must provide this key to create an account. Change it anytime to prevent spam.
              </p>
              <form onSubmit={handleSaveAdminClubKey} className="flex gap-2">
                <input
                  type="text"
                  value={adminClubKey}
                  onChange={(e) => setAdminClubKey(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm font-mono uppercase text-white focus:outline-none focus:border-rose-500"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Update Key</span>
                </button>
              </form>
              {clubKeySaveSuccess && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Check className="w-4 h-4" /> Registration key updated successfully!
                </span>
              )}
            </div>

            {/* Profile Management Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Club Member Profiles ({users.length})
                </h4>
                {resetSuccessMessage && (
                  <span className="text-xs text-emerald-400 font-semibold">{resetSuccessMessage}</span>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isTargetAdmin = isSuperAdmin(u);
                  const isCurrent = u.id === currentUser.id;

                  return (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg ${u.avatarColor} flex items-center justify-center font-bold text-xs shrink-0`}
                        >
                          {u.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{u.displayName}</span>
                            {isTargetAdmin && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Admin
                              </span>
                            )}
                            {u.isPublic ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300">
                                Public
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300">
                                Private
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">@{u.username}</div>
                        </div>
                      </div>

                      {/* Admin Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {resetPinUserId === u.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in">
                            <input
                              type="password"
                              value={resetPinValue}
                              onChange={(e) => setResetPinValue(e.target.value)}
                              placeholder="New PIN..."
                              className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono"
                              autoFocus
                            />
                            <button
                              onClick={() => handleResetPinSubmit(u.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setResetPinUserId(null);
                                setResetPinValue('');
                              }}
                              className="px-1.5 py-1 text-slate-400 hover:text-white text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setResetPinUserId(u.id);
                              setResetPinValue('');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
                            title="Reset this user's password"
                          >
                            Reset PIN
                          </button>
                        )}

                        {!isTargetAdmin && !isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.displayName)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/50 border border-rose-500/30 transition-colors"
                            title="Delete this profile and clear files"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
