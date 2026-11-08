import React, { useState, useMemo, useEffect, useCallback } from 'react';
import defaultCsvContent from '../collection.csv?raw';
import defaultCoversData from './data/bggCovers.json';
import {
  GameRecord,
  FilterState,
  ViewMode,
  SortField,
  SortOrder,
  UserProfile,
  LibraryScope,
} from './types/bgg';
import { parseBggCsv } from './services/csvParser';
import {
  getCustomCsv,
  saveCustomCsv,
  clearCustomCsv,
  getCachedMetadataMap,
} from './services/storage';
import {
  getCurrentUser,
  getUserCsv,
  saveUserCsv,
  getAllMeetings,
  getAllMessages,
  getAllUsers,
} from './services/communityStorage';
import { CURATED_MECHANICS_SEED } from './services/bggApi';
import { filterAndSortGames, computeCollectionMetrics } from './services/searchFilter';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { FilterSidebar } from './components/FilterSidebar';
import { CardGrid } from './components/CardGrid';
import { DenseTable } from './components/DenseTable';
import { DetailModal } from './components/DetailModal';
import { BggSyncModal } from './components/BggSyncModal';
import { RandomGameModal } from './components/RandomGameModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { AuthModal } from './components/AuthModal';
import { CommunityModal } from './components/CommunityModal';
import { MeetingModal } from './components/MeetingModal';
import { SlidersHorizontal, Lock, ArrowLeft, Globe } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  itemType: 'standalone', // Default to standalone, with toggle for expansions / all
  playerCount: null,
  onlyBestPlayers: false,
  weightBrackets: [],
  weightRange: [1.0, 5.0],
  durationRange: [0, 360],
  durationBracket: 'all',
  selectedMechanics: [],
  selectedCategory: '',
  languageLevels: [],
  commentQuery: '',
  yearRange: [1950, 2030],
};

function enrichGameRecord(
  game: GameRecord,
  cachedMap: Record<number, any>,
  owner?: { userId: string; userName: string; avatarColor: string }
): GameRecord {
  const staticCover = (defaultCoversData as Record<string, any>)[game.id];
  const cached = cachedMap[game.id] || staticCover;
  const seed = CURATED_MECHANICS_SEED[game.id];

  const thumbnail = cached?.thumbnail || seed?.thumbnail || game.thumbnail;
  const image = cached?.image || game.image;
  const description = cached?.description || game.description;
  const shortDescription = cached?.shortDescription || game.shortDescription;
  const mechanics =
    cached?.mechanics && cached.mechanics.length > 0
      ? cached.mechanics
      : seed?.mechanics || game.mechanics || [];
  const categories =
    cached?.categories && cached.categories.length > 0
      ? cached.categories
      : seed?.categories || game.categories || [];

  return {
    ...game,
    thumbnail,
    image,
    description,
    shortDescription,
    mechanics,
    categories,
    owners: owner ? [owner] : game.owners || [],
  };
}

export const App: React.FC = () => {
  // Current user & active library session
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getCurrentUser());
  const [activeLibraryUser, setActiveLibraryUser] = useState<UserProfile | null>(null);
  const [libraryScope, setLibraryScope] = useState<LibraryScope>('user');

  // Community & Meeting & Auth Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [communityTab, setCommunityTab] = useState<'members' | 'messages'>('members');
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  const [csvRaw, setCsvRaw] = useState<string>(() => {
    return getUserCsv(currentUser.id) || getCustomCsv() || defaultCsvContent;
  });
  const [isCustomLoaded, setIsCustomLoaded] = useState<boolean>(() => {
    return !!(getUserCsv(currentUser.id) || getCustomCsv());
  });
  const [metadataVersion, setMetadataVersion] = useState<number>(0);

  // Update loaded CSV when switching user or switching library
  const handleUserChange = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveLibraryUser(null);
    setLibraryScope('user');
    const userSaved = getUserCsv(user.id);
    if (userSaved) {
      setCsvRaw(userSaved);
      setIsCustomLoaded(true);
    } else {
      setCsvRaw(defaultCsvContent);
      setIsCustomLoaded(false);
    }
  };

  const handleBrowseUserLibrary = (user: UserProfile) => {
    setLibraryScope('user');
    if (user.id === currentUser.id) {
      setActiveLibraryUser(null);
      const userSaved = getUserCsv(user.id);
      setCsvRaw(userSaved || defaultCsvContent);
      setIsCustomLoaded(!!userSaved);
    } else {
      setActiveLibraryUser(user);
      const targetCsv = getUserCsv(user.id) || defaultCsvContent;
      setCsvRaw(targetCsv);
      setIsCustomLoaded(false);
    }
  };

  const handleReturnToMyLibrary = () => {
    setActiveLibraryUser(null);
    setLibraryScope('user');
    const myCsv = getUserCsv(currentUser.id) || getCustomCsv() || defaultCsvContent;
    setCsvRaw(myCsv);
    setIsCustomLoaded(!!(getUserCsv(currentUser.id) || getCustomCsv()));
  };

  // 1. Single User Collection (enriched with active owner)
  const userGames = useMemo<GameRecord[]>(() => {
    const parsed = parseBggCsv(csvRaw);
    const cachedMap = getCachedMetadataMap();
    const activeUser = activeLibraryUser || currentUser;
    const ownerEntry = {
      userId: activeUser.id,
      userName: activeUser.displayName,
      avatarColor: activeUser.avatarColor,
    };

    return parsed.map((game) => enrichGameRecord(game, cachedMap, ownerEntry));
  }, [csvRaw, metadataVersion, activeLibraryUser, currentUser]);

  // 2. Club Super Library: Aggregated games from all public members with merged owner tags
  const groupGames = useMemo<GameRecord[]>(() => {
    const cachedMap = getCachedMetadataMap();
    const allPublicUsers = getAllUsers().filter((u) => u.isPublic);
    const masterMap = new Map<string | number, GameRecord>();

    for (const user of allPublicUsers) {
      const userRaw =
        getUserCsv(user.id) ||
        (user.id === 'user_admin' || user.id === 'user_host' ? defaultCsvContent : null);
      if (!userRaw) continue;

      const parsed = parseBggCsv(userRaw);
      const ownerEntry = {
        userId: user.id,
        userName: user.displayName,
        avatarColor: user.avatarColor,
      };

      for (const rawGame of parsed) {
        const enriched = enrichGameRecord(rawGame, cachedMap, ownerEntry);
        const key = enriched.id > 0 ? enriched.id : enriched.name.toLowerCase().trim();

        if (masterMap.has(key)) {
          const existing = masterMap.get(key)!;
          const alreadyHasOwner = existing.owners?.some((o) => o.userId === user.id);
          if (!alreadyHasOwner) {
            existing.owners = [...(existing.owners || []), ownerEntry];
          }
          if (!existing.thumbnail && enriched.thumbnail) existing.thumbnail = enriched.thumbnail;
          if (!existing.description && enriched.description) existing.description = enriched.description;
        } else {
          masterMap.set(key, { ...enriched });
        }
      }
    }

    return Array.from(masterMap.values());
  }, [metadataVersion, csvRaw]);

  // Active games set depending on library scope
  const activeGames = useMemo(() => {
    return libraryScope === 'group' ? groupGames : userGames;
  }, [libraryScope, groupGames, userGames]);

  // Extract all unique mechanics across the active loaded games
  const availableMechanics = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of activeGames) {
      if (g.mechanics) {
        for (const m of g.mechanics) {
          map[m] = (map[m] || 0) + 1;
        }
      }
    }
    return Object.keys(map).sort((a, b) => map[b] - map[a]);
  }, [activeGames]);

  // UI state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter and sort execution
  const filteredGames = useMemo(() => {
    return filterAndSortGames(activeGames, filters, sortField, sortOrder);
  }, [activeGames, filters, sortField, sortOrder]);

  // Overall collection metrics
  const collectionMetrics = useMemo(() => {
    return computeCollectionMetrics(activeGames);
  }, [activeGames]);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const handleSelectMechanic = useCallback((mechanic: string) => {
    setFilters((prev) => {
      if (prev.selectedMechanics.includes(mechanic)) return prev;
      return {
        ...prev,
        selectedMechanics: [...prev.selectedMechanics, mechanic],
      };
    });
  }, []);

  const handleSortFieldChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'name' || field === 'rank' ? 'asc' : 'desc');
    }
  };

  const handleFileUpload = (file: File) => {
    if (activeLibraryUser && activeLibraryUser.id !== currentUser.id) {
      alert(
        `You are currently browsing ${activeLibraryUser.displayName}'s library in Read-Only mode. Switch back to your library to upload custom files.`
      );
      return;
    }
    if (libraryScope === 'group') {
      alert(
        'Switch to "My Library" to upload files to your personal collection.'
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const records = parseBggCsv(content);
        if (records.length > 0) {
          saveUserCsv(currentUser.id, content);
          saveCustomCsv(content);
          setCsvRaw(content);
          setIsCustomLoaded(true);
          return;
        }
      }
      alert(
        'Could not detect valid game records in this CSV. Please make sure it contains game names or is exported from BoardGameGeek.'
      );
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    saveUserCsv(currentUser.id, '');
    clearCustomCsv();
    setCsvRaw(defaultCsvContent);
    setIsCustomLoaded(false);
  };

  const handleSyncComplete = () => {
    setMetadataVersion((v) => v + 1);
  };

  // Drag-and-drop file ingestion support
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (file && file.name.endsWith('.csv')) {
        handleFileUpload(file);
      }
    };
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [activeLibraryUser, currentUser, libraryScope]);

  const cachedMetadataMap = getCachedMetadataMap();
  const cachedCount = Object.keys(cachedMetadataMap).length;
  const isReadOnlyLibrary = activeLibraryUser !== null && activeLibraryUser.id !== currentUser.id;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* 1. Header Toolbar */}
      <Header
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sortField={sortField}
        sortOrder={sortOrder}
        onSortFieldChange={handleSortFieldChange}
        onSortOrderToggle={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenRandomModal={() => setIsRandomModalOpen(true)}
        onOpenAnalyticsModal={() => setIsAnalyticsOpen(true)}
        onFileUpload={handleFileUpload}
        isCustomLoaded={isCustomLoaded}
        onResetDefault={handleResetDefault}
        cachedCount={cachedCount}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenCommunityModal={(tab = 'members') => {
          setCommunityTab(tab);
          setIsCommunityModalOpen(true);
        }}
        onOpenMeetingModal={() => setIsMeetingModalOpen(true)}
        activeLibraryUser={activeLibraryUser}
        onReturnToMyLibrary={handleReturnToMyLibrary}
        upcomingMeetingsCount={getAllMeetings().length}
        messagesCount={getAllMessages().length}
        libraryScope={libraryScope}
        onLibraryScopeChange={(scope) => {
          setLibraryScope(scope);
          if (scope === 'group') {
            setActiveLibraryUser(null);
          }
        }}
        groupGamesCount={groupGames.length}
      />

      {/* Club Super Library Banner */}
      {libraryScope === 'group' && (
        <div className="bg-emerald-950/70 border-b border-emerald-500/30 px-4 py-2.5 backdrop-blur-md animate-in slide-in-from-top-1 duration-200">
          <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-200">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Club Super Collection</strong> ({groupGames.length} unique titles across public members) • Combined library from all shared club members. Cards display owner chips showing who owns each copy.
              </span>
            </div>
            <button
              onClick={() => setLibraryScope('user')}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Library</span>
            </button>
          </div>
        </div>
      )}

      {/* Read-Only Banner when browsing another member's library */}
      {libraryScope === 'user' && isReadOnlyLibrary && activeLibraryUser && (
        <div className="bg-amber-950/70 border-b border-amber-500/30 px-4 py-2.5 backdrop-blur-md animate-in slide-in-from-top-1 duration-200">
          <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Viewing <strong>{activeLibraryUser.displayName}'s Collection</strong> ({userGames.length} games) •{' '}
                <span className="text-amber-300 font-semibold">🔒 Read-Only</span> — You can browse, filter, and view rulebooks/notes, but cannot edit this library.
              </span>
            </div>
            <button
              onClick={handleReturnToMyLibrary}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to My Library</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Content Container */}
      <main className="max-w-[1700px] w-full mx-auto px-4 py-5 flex-1 space-y-5">
        {/* Collection Pulse / Metrics Summary Bar */}
        <MetricsBar
          metrics={collectionMetrics}
          onSelectGame={(g) => setSelectedGame(g)}
        />

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-400" />
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Filters & Facets'}</span>
          </button>
          <span className="text-xs text-slate-400">
            {filteredGames.length} of {activeGames.length} games
          </span>
        </div>

        {/* Dual Pane Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">
          {/* Left Sidebar Filters */}
          <aside
            className={`lg:block ${
              mobileFilterOpen ? 'block' : 'hidden'
            } lg:col-span-1 space-y-4`}
          >
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              availableMechanics={availableMechanics}
            />
          </aside>

          {/* Right Main Canvas: Card Grid or Dense Table */}
          <section className="lg:col-span-3 xl:col-span-4 min-w-0">
            {viewMode === 'grid' ? (
              <CardGrid
                games={filteredGames}
                targetPlayerCount={filters.playerCount}
                onSelectGame={(g) => setSelectedGame(g)}
                onSelectMechanic={handleSelectMechanic}
                onResetFilters={handleResetFilters}
              />
            ) : (
              <DenseTable
                games={filteredGames}
                sortField={sortField}
                sortOrder={sortOrder}
                onSortChange={handleSortFieldChange}
                onSelectGame={(g) => setSelectedGame(g)}
                targetPlayerCount={filters.playerCount}
              />
            )}
          </section>
        </div>
      </main>

      {/* 3. Centered Large Game Detail Modal */}
      <DetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onSelectMechanic={handleSelectMechanic}
        allGames={activeGames}
        onSelectGame={(g) => setSelectedGame(g)}
        isReadOnly={libraryScope === 'user' && isReadOnlyLibrary}
        ownerName={activeLibraryUser?.displayName || currentUser.displayName}
      />

      {/* 4. Game Night Picker (Dice roll with in-modal group filters) */}
      <RandomGameModal
        allGames={activeGames}
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
        onSelectGame={(g) => setSelectedGame(g)}
        initialPlayerCount={filters.playerCount}
        initialOnlyBest={filters.onlyBestPlayers}
      />

      {/* 5. Collection Shelf Analytics Modal */}
      <AnalyticsModal
        games={activeGames}
        metrics={collectionMetrics}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        onFilterByPlayerCount={(p) => handleFilterChange({ playerCount: p })}
        onFilterByWeight={(w) => handleFilterChange({ weightBrackets: [w] })}
        onFilterByMechanic={handleSelectMechanic}
      />

      {/* 6. BGG Box Art & Mechanics Sync Dialog */}
      <BggSyncModal
        games={activeGames}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={handleSyncComplete}
      />

      {/* 7. User Authentication & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />

      {/* 8. Game Group Community Directory & Messages Hub */}
      <CommunityModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        currentUser={currentUser}
        allGames={activeGames}
        onBrowseUserLibrary={handleBrowseUserLibrary}
        initialTab={communityTab}
      />

      {/* 9. Game Night Meetup Scheduler & RSVPs Modal */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        currentUser={currentUser}
        allGames={activeGames}
      />
    </div>
  );
};
export default App;
