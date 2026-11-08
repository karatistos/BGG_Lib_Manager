import React, { useState, useEffect } from 'react';
import { GameRecord } from '../types/bgg';
import { GameCard } from './GameCard';
import { ChevronLeft, ChevronRight, PackageSearch, RotateCcw } from 'lucide-react';

interface CardGridProps {
  games: GameRecord[];
  targetPlayerCount: number | null;
  onSelectGame: (game: GameRecord) => void;
  onSelectMechanic: (mechanic: string) => void;
  onResetFilters: () => void;
}

const PAGE_SIZE_OPTIONS = [24, 48, 96];

export const CardGrid: React.FC<CardGridProps> = ({
  games,
  targetPlayerCount,
  onSelectGame,
  onSelectMechanic,
  onResetFilters,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);

  // Reset to page 1 whenever games array reference changes
  useEffect(() => {
    setCurrentPage(1);
  }, [games.length]);

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl my-8">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <PackageSearch className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">No board games match your filters</h3>
        <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">
          Try expanding player counts, widening the complexity bracket, or clearing the search terms.
        </p>
        <button
          onClick={onResetFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors shadow-lg shadow-orange-500/20"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All Filters
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(games.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, games.length);
  const currentGames = games.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Top Pagination Bar & Counter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div>
          Showing <span className="font-semibold text-slate-200">{startIndex + 1}</span>–
          <span className="font-semibold text-slate-200">{endIndex}</span> of{' '}
          <span className="font-semibold text-slate-200">{games.length}</span> games
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span>Per page:</span>
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setPageSize(opt);
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded ${
                  pageSize === opt
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {currentGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            targetPlayerCount={targetPlayerCount}
            onSelect={onSelectGame}
            onSelectMechanic={onSelectMechanic}
          />
        ))}
      </div>

      {/* Bottom Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium text-slate-200"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <div className="text-xs text-slate-400 font-mono">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-medium text-slate-200"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

