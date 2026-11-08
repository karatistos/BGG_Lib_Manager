import React from 'react';
import { CollectionMetrics, GameRecord } from '../types/bgg';
import { Layers, Gauge, Star, Clock, Trophy, Puzzle } from 'lucide-react';

interface MetricsBarProps {
  metrics: CollectionMetrics;
  onSelectGame: (game: GameRecord) => void;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics, onSelectGame }) => {
  const standalonePercent =
    metrics.totalCount > 0
      ? Math.round((metrics.standaloneCount / metrics.totalCount) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Total Collection & Ratio */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">Collection</span>
          <Layers className="w-3.5 h-3.5 text-orange-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-white font-mono">
            {metrics.totalCount}
            <span className="text-xs font-normal text-slate-400 ml-1">items</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
            <span>{standalonePercent}% base</span>
            <span>•</span>
            <span>{100 - standalonePercent}% exp</span>
          </div>
        </div>
      </div>

      {/* 2. Average Weight */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">Avg Complexity</span>
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-sky-300 font-mono">
            {metrics.avgWeight.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {metrics.avgWeight < 2.0
              ? 'Lightweight collection'
              : metrics.avgWeight < 3.0
              ? 'Moderate / accessible'
              : 'Heavy enthusiast collection'}
          </div>
        </div>
      </div>

      {/* 3. Average Rating */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">Community Avg</span>
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-amber-300 font-mono">
            {metrics.avgRating.toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1">★</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            BGG average score
          </div>
        </div>
      </div>

      {/* 4. Median Play Time */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">Typical Session</span>
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-emerald-300 font-mono">
            {metrics.medianPlayTime}
            <span className="text-xs font-normal text-slate-400 ml-1">mins</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Median playing duration
          </div>
        </div>
      </div>

      {/* 5. Highest Ranked Game */}
      <div
        onClick={() => metrics.topRankedGame && onSelectGame(metrics.topRankedGame)}
        className={`p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm transition-all ${
          metrics.topRankedGame
            ? 'cursor-pointer hover:border-amber-500/50 hover:bg-slate-850'
            : ''
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">Top Ranked</span>
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="mt-1 truncate">
          <div className="text-sm font-bold text-slate-100 truncate">
            {metrics.topRankedGame ? metrics.topRankedGame.name : 'N/A'}
          </div>
          <div className="text-[10px] text-amber-400 font-mono mt-1">
            {metrics.topRankedGame?.rank
              ? `Rank #${metrics.topRankedGame.rank}`
              : 'Unranked'}
          </div>
        </div>
      </div>

      {/* 6. Mechanics Tagged */}
      <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span className="font-medium">Mechanics</span>
          <Puzzle className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="mt-1">
          <div className="text-xl font-extrabold text-purple-300 font-mono">
            {Object.keys(metrics.mechanicsDistribution).length}
            <span className="text-xs font-normal text-slate-400 ml-1">types</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Covered across library
          </div>
        </div>
      </div>
    </div>
  );
};

