import React, { useState, useMemo, useEffect, useCallback } from 'react';
import defaultCsvContent from '../collection.csv?raw';
import defaultCoversData from './data/bggCovers.json';
import { GameRecord, FilterState, ViewMode, SortField, SortOrder } from './types/bgg';
import { parseBggCsv } from './services/csvParser';
import {
  getCustomCsv,
  saveCustomCsv,
  clearCustomCsv,
  getCachedMetadataMap,
} from './services/storage';
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
import { SlidersHorizontal } from 'lucide-react';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  itemType: 'standalone', // Clarification #3: Default to standalone, with toggle for expansions / all
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

export const App: React.FC = () => {
  const [csvRaw, setCsvRaw] = useState<string>(() => {
    return getCustomCsv() || defaultCsvContent;
  });
  const [isCustomLoaded, setIsCustomLoaded] = useState<boolean>(() => !!getCustomCsv());
  const [metadataVersion, setMetadataVersion] = useState<number>(0);

  // Parse and enrich base games
  const rawGames = useMemo<GameRecord[]>(() => {
    const parsed = parseBggCsv(csvRaw);
    const cachedMap = getCachedMetadataMap();

    // Enrich with static BGG data, cached BGG metadata or seeded curated data
    return parsed.map((game) => {
      const staticCover = (defaultCoversData as Record<string, any>)[game.id];
      const cached = cachedMap[game.id] || staticCover;
      const seed = CURATED_MECHANICS_SEED[game.id];

      const thumbnail = cached?.thumbnail || seed?.thumbnail || game.thumbnail;
      const image = cached?.image || game.image;
      const description = cached?.description || game.description;
      const shortDescription = cached?.shortDescription || game.shortDescription;
      const mechanics = (cached?.mechanics && cached.mechanics.length > 0)
        ? cached.mechanics
        : (seed?.mechanics || game.mechanics || []);
      const categories = (cached?.categories && cached.categories.length > 0)
        ? cached.categories
        : (seed?.categories || game.categories || []);

      return {
        ...game,
        thumbnail,
        image,
        description,
        shortDescription,
        mechanics,
        categories,
      };
    });
  }, [csvRaw, metadataVersion]);

  // Extract all unique mechanics across the loaded games
  const availableMechanics = useMemo(() => {
    const map: Record<string, number> = {};
    for (const g of rawGames) {
      if (g.mechanics) {
        for (const m of g.mechanics) {
          map[m] = (map[m] || 0) + 1;
        }
      }
    }
    return Object.keys(map).sort((a, b) => map[b] - map[a]);
  }, [rawGames]);

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
    return filterAndSortGames(rawGames, filters, sortField, sortOrder);
  }, [rawGames, filters, sortField, sortOrder]);

  // Overall collection metrics (computed from current filtered set or full collection)
  const collectionMetrics = useMemo(() => {
    return computeCollectionMetrics(rawGames);
  }, [rawGames]);

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
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const records = parseBggCsv(content);
        if (records.length > 0) {
          saveCustomCsv(content);
          setCsvRaw(content);
          setIsCustomLoaded(true);
          return;
        }
      }
      alert('Could not detect valid game records in this CSV. Please make sure it contains game names or is exported from BoardGameGeek.');
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
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
  }, []);

  const cachedMetadataMap = getCachedMetadataMap();
  const cachedCount = Object.keys(cachedMetadataMap).length;

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
      />

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
            {filteredGames.length} of {rawGames.length} games
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
        allGames={rawGames}
        onSelectGame={(g) => setSelectedGame(g)}
      />

      {/* 4. Game Night Picker (Dice roll with in-modal group filters) */}
      <RandomGameModal
        allGames={rawGames}
        isOpen={isRandomModalOpen}
        onClose={() => setIsRandomModalOpen(false)}
        onSelectGame={(g) => setSelectedGame(g)}
        initialPlayerCount={filters.playerCount}
        initialOnlyBest={filters.onlyBestPlayers}
      />

      {/* 5. Collection Shelf Analytics Modal */}
      <AnalyticsModal
        games={rawGames}
        metrics={collectionMetrics}
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        onFilterByPlayerCount={(p) => handleFilterChange({ playerCount: p })}
        onFilterByWeight={(w) => handleFilterChange({ weightBrackets: [w] })}
        onFilterByMechanic={handleSelectMechanic}
      />

      {/* 6. BGG Box Art & Mechanics Sync Dialog */}
      <BggSyncModal
        games={rawGames}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncComplete={handleSyncComplete}
      />
    </div>
  );
};
export default App;
