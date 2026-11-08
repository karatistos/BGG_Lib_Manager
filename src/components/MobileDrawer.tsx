import React, { useRef } from 'react';
import {
  CollectionMetrics,
  GameRecord,
  LibraryScope,
  SortField,
  SortOrder,
  UserProfile,
  ViewMode,
} from '../types/bgg';
import { isSuperAdmin } from '../services/communityStorage';
import {
  X,
  User,
  Globe,
  Dices,
  CalendarDays,
  Users,
  BarChart3,
  RefreshCw,
  Upload,
  RotateCcw,
  ArrowLeft,
  Layers,
  Gauge,
  Star,
  Clock,
  Trophy,
  LayoutGrid,
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
  Crown,
  ChevronRight,
  LogIn,
  LogOut,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  activeLibraryUser: UserProfile | null;
  libraryScope: LibraryScope;
  onLibraryScopeChange: (scope: LibraryScope) => void;
  metrics: CollectionMetrics;
  onSelectGame: (game: GameRecord) => void;
  onOpenAuthModal: () => void;
  onOpenCommunityModal: (tab?: 'members' | 'messages') => void;
  onOpenMeetingModal: () => void;
  onOpenRandomModal: () => void;
  onOpenAnalyticsModal: () => void;
  onOpenSyncModal: () => void;
  cachedCount: number;
  upcomingMeetingsCount: number;
  messagesCount: number;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderToggle: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFileUpload: (file: File) => void;
  isCustomLoaded: boolean;
  onResetDefault: () => void;
  onReturnToMyLibrary: () => void;
  groupGamesCount: number;
  onLogout: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeLibraryUser,
  libraryScope,
  onLibraryScopeChange,
  metrics,
  onSelectGame,
  onOpenAuthModal,
  onOpenCommunityModal,
  onOpenMeetingModal,
  onOpenRandomModal,
  onOpenAnalyticsModal,
  onOpenSyncModal,
  cachedCount,
  upcomingMeetingsCount,
  messagesCount,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderToggle,
  viewMode,
  onViewModeChange,
  onFileUpload,
  isCustomLoaded,
  onResetDefault,
  onReturnToMyLibrary,
  groupGamesCount,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isGuest = currentUser.id === 'guest';
  const isAdmin = isSuperAdmin(currentUser);

  if (!isOpen) return null;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
      onClose();
    }
  };

  const handleAction = (cb: () => void) => {
    cb();
    onClose();
  };

  const standalonePercent =
    metrics.totalCount > 0
      ? Math.round((metrics.standaloneCount / metrics.totalCount) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer from right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Dices className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white">Club Dashboard & Menu</h2>
                <p className="text-[11px] text-slate-400">Piedecuesta Board Game Club</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* 1. User Profile Snippet */}
            {isGuest ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-orange-950/30 border border-orange-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-extrabold text-sm shadow-md shrink-0">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Guest Explorer</div>
                    <div className="text-[11px] text-slate-400">Read-Only club collection access</div>
                  </div>
                </div>
                <button
                  onClick={() => handleAction(onOpenAuthModal)}
                  className="w-full py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In / Create Club Account</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${currentUser.avatarColor} flex items-center justify-center font-extrabold text-sm shadow-md shrink-0`}
                    >
                      {currentUser.displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5 truncate">
                        <span>{currentUser.displayName}</span>
                        {isAdmin && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5 shrink-0">
                            <Crown className="w-2.5 h-2.5" /> Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">@{currentUser.username}</div>
                    </div>
                  </div>
                </div>

                {/* Profile actions row */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                  <button
                    onClick={() => handleAction(onOpenAuthModal)}
                    className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all text-center"
                  >
                    Manage Profile
                  </button>
                  <button
                    onClick={() => handleAction(onLogout)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Library Scope Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Viewing Collection Scope
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    onLibraryScopeChange('user');
                    onClose();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    libraryScope === 'user'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Library</span>
                </button>
                <button
                  onClick={() => {
                    onLibraryScopeChange('group');
                    onClose();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    libraryScope === 'group'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Club Super ({groupGamesCount})</span>
                </button>
              </div>
            </div>

            {/* 3. Primary Club Action Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Club Tools & Activities
              </label>
              <div className="grid grid-cols-1 gap-2">
                {/* Pick Game */}
                <button
                  onClick={() => handleAction(onOpenRandomModal)}
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 border border-orange-500/30 text-white transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500 text-white shadow-sm">
                      <Dices className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Pick Game for Tonight</div>
                      <div className="text-[11px] text-slate-400">Random game matching group player count</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Game Nights Meetups */}
                <button
                  onClick={() => handleAction(onOpenMeetingModal)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Game Night Meetups</span>
                        {upcomingMeetingsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                            {upcomingMeetingsCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">Propose games, set hour & confirm RSVP</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Group Members & Chat */}
                <button
                  onClick={() => handleAction(() => onOpenCommunityModal('members'))}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Group Members & Chat</span>
                        {messagesCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                            {messagesCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">Browse shared libraries & group talk</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Shelf Insights & Analytics */}
                <button
                  onClick={() => handleAction(onOpenAnalyticsModal)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Shelf Insights & Charts</div>
                      <div className="text-[11px] text-slate-400">Weight breakdown & player distributions</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Sync BGG Box Art */}
                <button
                  onClick={() => handleAction(onOpenSyncModal)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Sync BGG Box Art & Data</span>
                        {cachedCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                            {cachedCount}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">Enrich box thumbnails & mechanics</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* 4. Upper Info / Collection Pulse Metrics Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Collection Stats Pulse
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {libraryScope === 'group' ? 'Entire Club' : 'Active Shelf'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Total Count */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Total Games</span>
                    <Layers className="w-3 h-3 text-orange-400" />
                  </div>
                  <div className="text-lg font-extrabold text-white font-mono">
                    {metrics.totalCount}
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    {standalonePercent}% base • {100 - standalonePercent}% exp
                  </div>
                </div>

                {/* Avg Weight */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Avg Weight</span>
                    <Gauge className="w-3 h-3 text-sky-400" />
                  </div>
                  <div className="text-lg font-extrabold text-sky-300 font-mono">
                    {metrics.avgWeight.toFixed(2)}
                    <span className="text-[10px] text-slate-500 font-normal ml-0.5">/5</span>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    {metrics.avgWeight < 2.2 ? 'Lightweight' : metrics.avgWeight < 3.2 ? 'Medium' : 'Heavy Euro'}
                  </div>
                </div>

                {/* Community Rating */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Community Rating</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="text-lg font-extrabold text-amber-300 font-mono">
                    {metrics.avgRating.toFixed(2)}★
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">BGG average score</div>
                </div>

                {/* Session Duration */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span>Typical Session</span>
                    <Clock className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div className="text-lg font-extrabold text-emerald-300 font-mono">
                    {metrics.medianPlayTime}
                    <span className="text-[10px] text-slate-500 font-normal ml-0.5">min</span>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">Median game length</div>
                </div>
              </div>

              {/* Top Ranked Game Highlight */}
              {metrics.topRankedGame && (
                <div
                  onClick={() => {
                    onSelectGame(metrics.topRankedGame!);
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-500/60 cursor-pointer flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">Top Ranked in Shelf</div>
                      <div className="text-xs font-bold text-amber-200 truncate">
                        {metrics.topRankedGame.name}
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 shrink-0">
                    #{metrics.topRankedGame.rank}
                  </span>
                </div>
              )}
            </div>

            {/* 5. View Mode & Sort Preferences */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Display & Sorting
              </label>

              {/* View Mode Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onViewModeChange('grid')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
                    viewMode === 'grid'
                      ? 'bg-orange-500 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid Cards</span>
                </button>
                <button
                  onClick={() => onViewModeChange('table')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
                    viewMode === 'table'
                      ? 'bg-orange-500 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Dense Table</span>
                </button>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Sort by:</span>
                  <select
                    value={sortField}
                    onChange={(e) => onSortFieldChange(e.target.value as SortField)}
                    className="bg-transparent border-none text-xs font-bold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="rank" className="bg-slate-900">BGG Rank</option>
                    <option value="name" className="bg-slate-900">Title</option>
                    <option value="rating" className="bg-slate-900">User Rating</option>
                    <option value="geekRating" className="bg-slate-900">Geek Rating</option>
                    <option value="weight" className="bg-slate-900">Complexity</option>
                    <option value="playTime" className="bg-slate-900">Duration</option>
                    <option value="year" className="bg-slate-900">Year</option>
                  </select>
                </div>

                <button
                  onClick={onSortOrderToggle}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-orange-400 hover:bg-slate-850"
                  title="Toggle order"
                >
                  {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 6. CSV Management & Back Actions */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Collection Data & CSV
              </label>

              <div className="space-y-2">
                {isGuest ? (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    🔒 Log in with your club profile to upload and manage personal collection CSVs.
                  </div>
                ) : (
                  <>
                    {(!activeLibraryUser || activeLibraryUser.id === currentUser.id) && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200"
                        >
                          <Upload className="w-3.5 h-3.5 text-orange-400" />
                          <span>Import Custom CSV Collection</span>
                        </button>
                      </>
                    )}

                    {isCustomLoaded && (!activeLibraryUser || activeLibraryUser.id === currentUser.id) && (
                      <button
                        onClick={() => handleAction(onResetDefault)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-300"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset to Bundled Collection.csv</span>
                      </button>
                    )}

                    {activeLibraryUser && activeLibraryUser.id !== currentUser.id && (
                      <button
                        onClick={() => handleAction(onReturnToMyLibrary)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-md"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Return to My Personal Library</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
