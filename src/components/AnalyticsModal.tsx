import React from 'react';
import { GameRecord, CollectionMetrics, WeightBracket } from '../types/bgg';
import {
  BarChart3,
  X,
  Users,
  Gauge,
  Puzzle,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AnalyticsModalProps {
  games: GameRecord[];
  metrics: CollectionMetrics;
  isOpen: boolean;
  onClose: () => void;
  onFilterByPlayerCount: (count: number) => void;
  onFilterByWeight: (bracket: WeightBracket) => void;
  onFilterByMechanic: (mechanic: string) => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  games,
  metrics,
  isOpen,
  onClose,
  onFilterByPlayerCount,
  onFilterByWeight,
  onFilterByMechanic,
}) => {
  if (!isOpen) return null;

  // 1. Player Count Stats (1 to 8+)
  const playerStats: { count: number; total: number; best: number }[] = [];
  for (let p = 1; p <= 8; p++) {
    let total = 0;
    let best = 0;
    for (const g of games) {
      if (p >= g.minPlayers && p <= g.maxPlayers) total++;
      if (g.bestPlayers.includes(p)) best++;
    }
    playerStats.push({ count: p, total, best });
  }
  const maxPlayerTotal = Math.max(...playerStats.map((p) => p.total), 1);

  // 2. Weight Bracket Distribution
  const weightDist: Record<WeightBracket, number> = {
    light: 0,
    'medium-light': 0,
    'medium-heavy': 0,
    heavy: 0,
  };
  for (const g of games) {
    if (g.weight > 0) {
      weightDist[g.weightBracket]++;
    }
  }
  const maxWeightCount = Math.max(...Object.values(weightDist), 1);

  // 3. Top 8 Mechanics
  const topMechanics = Object.entries(metrics.mechanicsDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxMechanicCount = topMechanics.length > 0 ? topMechanics[0][1] : 1;

  // 4. Decades Distribution
  const decadeCounts: Record<string, number> = {
    '2020s': 0,
    '2010s': 0,
    '2000s': 0,
    '1990s': 0,
    'Vintage (<1990)': 0,
  };
  for (const g of games) {
    if (!g.year) continue;
    if (g.year >= 2020) decadeCounts['2020s']++;
    else if (g.year >= 2010) decadeCounts['2010s']++;
    else if (g.year >= 2000) decadeCounts['2000s']++;
    else if (g.year >= 1990) decadeCounts['1990s']++;
    else decadeCounts['Vintage (<1990)']++;
  }
  const maxDecade = Math.max(...Object.values(decadeCounts), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>Collection Shelf Analytics</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                Visual analysis across your {games.length} board games (click any bar to filter)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Charts Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Player Count Distribution Chart */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" />
                Player Count Coverage & "Best At" Stars
              </span>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-700 inline-block" /> Supported
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> ★ Best
                </span>
              </div>
            </div>

            <div className="grid grid-cols-8 gap-2 pt-2 items-end h-36">
              {playerStats.map((stat) => {
                const totalHeight = Math.round((stat.total / maxPlayerTotal) * 100);
                const bestHeight = stat.total > 0 ? Math.round((stat.best / stat.total) * 100) : 0;

                return (
                  <div
                    key={stat.count}
                    onClick={() => {
                      onFilterByPlayerCount(stat.count);
                      onClose();
                    }}
                    className="flex flex-col items-center justify-end h-full group cursor-pointer"
                    title={`${stat.count} Players: ${stat.total} supported games (${stat.best} best)`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {stat.total}
                    </span>

                    <div className="w-full max-w-[28px] bg-slate-800 rounded-t-md overflow-hidden flex flex-col justify-end group-hover:ring-1 group-hover:ring-orange-400 transition-all"
                      style={{ height: `${Math.max(6, totalHeight)}%` }}
                    >
                      {/* Best portion in gold */}
                      <div
                        className="w-full bg-amber-500 transition-all"
                        style={{ height: `${bestHeight}%` }}
                      />
                    </div>

                    <span className="text-xs font-bold font-mono text-slate-300 mt-2 group-hover:text-orange-400">
                      {stat.count}P
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. Complexity Weight Distribution */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-sky-400" />
                Complexity Weight Breakdown
              </span>

              <div className="space-y-2.5 pt-1">
                {[
                  { bracket: 'light' as WeightBracket, label: 'Light (<1.8)', count: weightDist.light, color: 'bg-emerald-500' },
                  { bracket: 'medium-light' as WeightBracket, label: 'Med-Light (1.8–2.5)', count: weightDist['medium-light'], color: 'bg-sky-500' },
                  { bracket: 'medium-heavy' as WeightBracket, label: 'Med-Heavy (2.5–3.25)', count: weightDist['medium-heavy'], color: 'bg-amber-500' },
                  { bracket: 'heavy' as WeightBracket, label: 'Heavy (>3.25)', count: weightDist.heavy, color: 'bg-rose-500' },
                ].map((item) => {
                  const percent = Math.round((item.count / maxWeightCount) * 100);
                  return (
                    <div
                      key={item.bracket}
                      onClick={() => {
                        onFilterByWeight(item.bracket);
                        onClose();
                      }}
                      className="group cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                        <span className="font-mono text-slate-400 group-hover:text-slate-200">
                          {item.count} games
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all group-hover:brightness-125`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Publication Eras */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                Publication Eras
              </span>

              <div className="space-y-2.5 pt-1">
                {Object.entries(decadeCounts).map(([decade, count]) => {
                  const percent = Math.round((count / maxDecade) * 100);
                  return (
                    <div key={decade} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{decade}</span>
                        <span className="font-mono text-slate-400">{count} games</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Top 8 Game Mechanics in Library */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Puzzle className="w-4 h-4 text-amber-400" />
              Most Frequent Mechanics in Your Collection
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {topMechanics.map(([mechanic, count]) => {
                const percent = Math.round((count / maxMechanicCount) * 100);
                return (
                  <div
                    key={mechanic}
                    onClick={() => {
                      onFilterByMechanic(mechanic);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all group space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-200 font-medium group-hover:text-amber-300 truncate">
                        {mechanic}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px] shrink-0">
                        {count} games
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500 group-hover:bg-amber-400 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

