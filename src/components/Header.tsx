import React, { useRef, useEffect } from 'react';
import { ViewMode, SortField, SortOrder, UserProfile, LibraryScope } from '../types/bgg';
import {
  Search,
  LayoutGrid,
  Table as TableIcon,
  ArrowUp,
  ArrowDown,
  Upload,
  RefreshCw,
  X,
  Dices,
  RotateCcw,
  BarChart3,
  Users,
  CalendarDays,
  ArrowLeft,
  Globe,
  User,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortFieldChange: (field: SortField) => void;
  onSortOrderToggle: () => void;
  onOpenSyncModal: () => void;
  onOpenRandomModal: () => void;
  onOpenAnalyticsModal: () => void;
  onFileUpload: (file: File) => void;
  isCustomLoaded: boolean;
  onResetDefault: () => void;
  cachedCount: number;
  currentUser: UserProfile;
  onOpenAuthModal: () => void;
  onOpenCommunityModal: (tab?: 'members' | 'messages') => void;
  onOpenMeetingModal: () => void;
  activeLibraryUser: UserProfile | null;
  onReturnToMyLibrary: () => void;
  upcomingMeetingsCount: number;
  messagesCount: number;
  libraryScope: LibraryScope;
  onLibraryScopeChange: (scope: LibraryScope) => void;
  groupGamesCount: number;
  onOpenMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortFieldChange,
  onSortOrderToggle,
  onOpenSyncModal,
  onOpenRandomModal,
  onOpenAnalyticsModal,
  onFileUpload,
  isCustomLoaded,
  onResetDefault,
  cachedCount,
  currentUser,
  onOpenAuthModal,
  onOpenCommunityModal,
  onOpenMeetingModal,
  activeLibraryUser,
  onReturnToMyLibrary,
  upcomingMeetingsCount,
  messagesCount,
  libraryScope,
  onLibraryScopeChange,
  groupGamesCount,
  onOpenMobileDrawer,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = '';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand & Mobile Actions Row */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 shrink-0">
              <Dices className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>BGG Explorer</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  CLUB
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">
                Instant search & club collections
              </p>
            </div>
          </div>

          {/* Smartphone-Only Controls: Fast Scope + Menu Drawer Button */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Quick Scope Switcher */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold">
              <button
                onClick={() => onLibraryScopeChange('user')}
                className={`px-2 py-1 rounded-md transition-all ${
                  libraryScope === 'user'
                    ? 'bg-orange-500 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="My Library"
              >
                Mine
              </button>
              <button
                onClick={() => onLibraryScopeChange('group')}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                  libraryScope === 'group'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Club Super Library"
              >
                <span>Club</span>
                {groupGamesCount > 0 && (
                  <span className="text-[9px] font-mono opacity-80">({groupGamesCount})</span>
                )}
              </button>
            </div>

            {/* Mobile View Toggle */}
            <button
              onClick={() => onViewModeChange(viewMode === 'grid' ? 'table' : 'grid')}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              title={viewMode === 'grid' ? 'Switch to Table' : 'Switch to Grid'}
            >
              {viewMode === 'grid' ? <TableIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>

            {/* Lateral Deployable Panel Trigger Button with Notification Dot */}
            <button
              onClick={onOpenMobileDrawer}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white transition-all shadow-sm"
              title="Open Club Tools & Menu Drawer"
            >
              <Menu className="w-4 h-4 text-orange-400" />
              {(upcomingMeetingsCount > 0 || messagesCount > 0) && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Desktop Scope Switcher (hidden on mobile, visible on md+) */}
        <div className="hidden md:flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => onLibraryScopeChange('user')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              libraryScope === 'user'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Browse and manage your personal collection"
          >
            <User className="w-3.5 h-3.5" />
            <span>My Library</span>
          </button>
          <button
            onClick={() => onLibraryScopeChange('group')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              libraryScope === 'group'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Browse all games shared across the entire club"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Club Super Library</span>
            {groupGamesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-mono">
                {groupGamesCount}
              </span>
            )}
          </button>
        </div>

        {/* Global Search Bar (Center) */}
        <div className="relative w-full md:max-w-md lg:max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search titles, mechanics, tags, comments... (Ctrl+K)"
            className="w-full pl-9 pr-16 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-100 placeholder-slate-500 transition-all outline-none"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-2 flex items-center px-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute inset-y-0 right-2.5 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800 border border-slate-700 rounded">
                ⌘K
              </kbd>
            </div>
          )}
        </div>

        {/* Desktop Action Controls & View Options (hidden on mobile, in drawer instead) */}
        <div className="hidden md:flex items-center gap-2 w-full md:w-auto justify-end overflow-x-auto pb-1 md:pb-0">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400 pl-1.5 font-medium hidden lg:inline">Sort:</span>
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as SortField)}
              className="bg-transparent border-none text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer py-1 pl-1"
            >
              <option value="rank" className="bg-slate-900">BGG Rank</option>
              <option value="name" className="bg-slate-900">Title</option>
              <option value="rating" className="bg-slate-900">User Rating</option>
              <option value="geekRating" className="bg-slate-900">Geek Rating</option>
              <option value="weight" className="bg-slate-900">Complexity Weight</option>
              <option value="playTime" className="bg-slate-900">Duration</option>
              <option value="year" className="bg-slate-900">Release Year</option>
            </select>
            <button
              onClick={onSortOrderToggle}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending (click for Descending)' : 'Descending (click for Ascending)'}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-orange-400" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-orange-400" />
              )}
            </button>
          </div>

          {/* Desktop View Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Game Night Picker Button */}
          <button
            onClick={onOpenRandomModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-orange-500/20 transition-all shrink-0"
            title="Pick a random game from your current filtered list for game night"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Pick Game</span>
          </button>

          {/* Collection Analytics / Shelf Insights */}
          <button
            onClick={onOpenAnalyticsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all shrink-0"
            title="Open collection visual charts & shelf insights"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Insights</span>
          </button>

          {/* BGG Box Art & Mechanics Sync Modal Trigger */}
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-500/30 transition-all shrink-0"
            title="Fetch box art and mechanics from BoardGameGeek"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline">Sync BGG</span>
            {cachedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-500 text-white">
                {cachedCount}
              </span>
            )}
          </button>

          {/* Game Night Meetups Button */}
          <button
            onClick={onOpenMeetingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-700 transition-all shrink-0 relative"
            title="View scheduled game night meetups & confirm attendance"
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden lg:inline">Game Nights</span>
            {upcomingMeetingsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                {upcomingMeetingsCount}
              </span>
            )}
          </button>

          {/* Group Members & Chat Button */}
          <button
            onClick={() => onOpenCommunityModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-700 transition-all shrink-0 relative"
            title="View group members directory & in-app chat"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline">Group</span>
            {messagesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                {messagesCount}
              </span>
            )}
          </button>

          {/* User Account / Profile Dropdown Trigger */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700/80 transition-all shrink-0 group"
            title={`Logged in as ${currentUser.displayName}. Click to switch user or edit profile.`}
          >
            <div
              className={`w-6 h-6 rounded-lg ${currentUser.avatarColor} flex items-center justify-center font-bold text-[10px] shadow-sm`}
            >
              {currentUser.displayName.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-white max-w-[100px] truncate hidden sm:inline">
              {currentUser.displayName}
            </span>
          </button>

          {/* CSV File Upload Trigger */}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 transition-all shrink-0"
                title="Upload custom collection.csv export"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden xl:inline">Import CSV</span>
              </button>
            </>
          )}

          {/* Reset custom CSV if uploaded */}
          {isCustomLoaded && (!activeLibraryUser || activeLibraryUser.id === currentUser.id) && (
            <button
              onClick={onResetDefault}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 transition-all shrink-0"
              title="Reset back to bundled collection.csv"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden xl:inline">Reset Default</span>
            </button>
          )}

          {/* If viewing another user's library, show Back to My Library button */}
          {activeLibraryUser && activeLibraryUser.id !== currentUser.id && (
            <button
              onClick={onReturnToMyLibrary}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md transition-all shrink-0"
              title="Return to your personal library"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Library</span>
            </button>
          )}

          {/* Quick Menu Button for Desktop as well */}
          <button
            onClick={onOpenMobileDrawer}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all ml-1"
            title="Open Deployable Overview Panel"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
