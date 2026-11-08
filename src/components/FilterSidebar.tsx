import React, { useState } from 'react';
import { FilterState, WeightBracket } from '../types/bgg';
import {
  Users,
  Gauge,
  Clock,
  Puzzle,
  RotateCcw,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  Languages,
} from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableMechanics: string[];
}

const POPULAR_MECHANICS = [
  'Deck Building',
  'Worker Placement',
  'Hand Management',
  'Card Drafting',
  'Set Collection',
  'Tile Placement',
  'Area Majority',
  'Variable Player Powers',
  'Cooperative Game',
  'Dice Rolling',
  'Engine Building',
  'Trick-taking',
];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableMechanics,
}) => {
  const [mechanicSearch, setMechanicSearch] = useState('');
  const [expandMechanics, setExpandMechanics] = useState(false);

  // Count active filters
  let activeCount = 0;
  if (filters.itemType !== 'standalone') activeCount++;
  if (filters.playerCount !== null) activeCount++;
  if (filters.onlyBestPlayers) activeCount++;
  if (filters.weightBrackets.length > 0) activeCount++;
  if (filters.weightRange[0] > 1.0 || filters.weightRange[1] < 5.0) activeCount++;
  if (filters.durationBracket !== 'all') activeCount++;
  if (filters.selectedMechanics.length > 0) activeCount += filters.selectedMechanics.length;
  if (filters.languageLevels.length > 0) activeCount += filters.languageLevels.length;
  if (filters.commentQuery.trim() !== '') activeCount++;

  const toggleWeightBracket = (bracket: WeightBracket) => {
    const current = filters.weightBrackets;
    const exists = current.includes(bracket);
    const updated = exists ? current.filter((b) => b !== bracket) : [...current, bracket];
    onFilterChange({ weightBrackets: updated });
  };

  const toggleLanguageLevel = (level: number) => {
    const current = filters.languageLevels;
    const exists = current.includes(level);
    const updated = exists ? current.filter((l) => l !== level) : [...current, level];
    onFilterChange({ languageLevels: updated });
  };

  const toggleMechanic = (mechanic: string) => {
    const current = filters.selectedMechanics;
    const exists = current.includes(mechanic);
    const updated = exists ? current.filter((m) => m !== mechanic) : [...current, mechanic];
    onFilterChange({ selectedMechanics: updated });
  };

  const filteredMechanics = availableMechanics
    .filter((m) => m.toLowerCase().includes(mechanicSearch.toLowerCase()))
    .slice(0, 15);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-6 text-slate-200">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white">Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500 text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 1. Item Type Toggle */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Item Type
        </label>
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => onFilterChange({ itemType: 'standalone' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              filters.itemType === 'standalone'
                ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            Standalone
          </button>
          <button
            onClick={() => onFilterChange({ itemType: 'expansion' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              filters.itemType === 'expansion'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            Expansions
          </button>
          <button
            onClick={() => onFilterChange({ itemType: 'all' })}
            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
              filters.itemType === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            All Items
          </button>
        </div>
      </div>

      {/* 2. Player Count & 'Best At' */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-orange-400" />
            Player Count
          </label>
          {filters.playerCount !== null && (
            <button
              onClick={() => onFilterChange({ playerCount: null, onlyBestPlayers: false })}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => onFilterChange({ playerCount: null })}
            className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filters.playerCount === null
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Any
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => (
            <button
              key={count}
              onClick={() => onFilterChange({ playerCount: count })}
              className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filters.playerCount === count
                  ? 'bg-orange-500 text-white border-orange-400 shadow-sm shadow-orange-500/30'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {count}P
            </button>
          ))}
        </div>

        {/* 'Only Best' Checkbox */}
        <label
          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
            filters.onlyBestPlayers
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
          }`}
        >
          <input
            type="checkbox"
            checked={filters.onlyBestPlayers}
            onChange={(e) => onFilterChange({ onlyBestPlayers: e.target.checked })}
            className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
          />
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Only rated "Best with {filters.playerCount ? `${filters.playerCount}P` : 'selected'}"
          </span>
        </label>
      </div>

      {/* 3. Weight / Complexity */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-sky-400" />
          Complexity Weight
        </label>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'light' as WeightBracket, label: 'Light (<1.8)', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/30' },
            { id: 'medium-light' as WeightBracket, label: 'Med-Light (1.8–2.5)', color: 'border-sky-500/40 text-sky-300 bg-sky-950/30' },
            { id: 'medium-heavy' as WeightBracket, label: 'Med-Heavy (2.5–3.25)', color: 'border-amber-500/40 text-amber-300 bg-amber-950/30' },
            { id: 'heavy' as WeightBracket, label: 'Heavy (>3.25)', color: 'border-rose-500/40 text-rose-300 bg-rose-950/30' },
          ].map((b) => {
            const isSelected = filters.weightBrackets.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleWeightBracket(b.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left truncate transition-all ${
                  isSelected
                    ? `${b.color} font-bold ring-1 ring-current`
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Play Time */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          Duration / Play Time
        </label>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: 'all' as const, label: 'Any Duration' },
            { id: 'quick' as const, label: '≤30m Quick' },
            { id: 'mid' as const, label: '31–60m Mid' },
            { id: 'main' as const, label: '61–120m Main Event' },
            { id: 'epic' as const, label: '>120m Epic' },
          ].map((d) => (
            <button
              key={d.id}
              onClick={() => onFilterChange({ durationBracket: d.id })}
              className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-left truncate transition-all ${
                filters.durationBracket === d.id
                  ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/50 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Game Mechanics (User Requirement #4) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Puzzle className="w-3.5 h-3.5 text-purple-400" />
            Game Mechanics
          </label>
          {filters.selectedMechanics.length > 0 && (
            <button
              onClick={() => onFilterChange({ selectedMechanics: [] })}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Clear ({filters.selectedMechanics.length})
            </button>
          )}
        </div>

        {/* Selected Mechanics Active Badges */}
        {filters.selectedMechanics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {filters.selectedMechanics.map((m) => (
              <span
                key={m}
                onClick={() => toggleMechanic(m)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40 cursor-pointer hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40 transition-colors"
                title="Click to remove"
              >
                <span>{m}</span>
                <span className="text-[10px] ml-0.5">×</span>
              </span>
            ))}
          </div>
        )}

        {/* Search & browse mechanics */}
        {expandMechanics && (
          <input
            type="text"
            value={mechanicSearch}
            onChange={(e) => setMechanicSearch(e.target.value)}
            placeholder="Search mechanics (e.g. drafting, worker)..."
            className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500"
          />
        )}

        {/* Mechanics chips */}
        <div className="flex flex-wrap gap-1 max-h-48 overflow-y-auto">
          {(expandMechanics ? filteredMechanics : POPULAR_MECHANICS).map((m) => {
            const isSelected = filters.selectedMechanics.includes(m);
            return (
              <button
                key={m}
                onClick={() => toggleMechanic(m)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-400 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* Search all mechanics toggle */}
        <button
          onClick={() => setExpandMechanics(!expandMechanics)}
          className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium pt-1"
        >
          <span>{expandMechanics ? 'Show fewer mechanics' : 'Browse more mechanics'}</span>
          {expandMechanics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* 6. Language Dependence Filter */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-teal-400" />
            Language Dependence
          </label>
          {filters.languageLevels.length > 0 && (
            <button
              onClick={() => onFilterChange({ languageLevels: [] })}
              className="text-[11px] text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick preset button: Language Neutral */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              const isOnlyNeutral =
                filters.languageLevels.length === 2 &&
                filters.languageLevels.includes(1) &&
                filters.languageLevels.includes(2);
              onFilterChange({ languageLevels: isOnlyNeutral ? [] : [1, 2] });
            }}
            className={`w-full py-1 px-2 rounded-lg text-[11px] font-semibold border transition-all ${
              filters.languageLevels.length === 2 &&
              filters.languageLevels.includes(1) &&
              filters.languageLevels.includes(2)
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850'
            }`}
          >
            🌿 Language Neutral Only (Levels 1–2)
          </button>
        </div>

        {/* Level pills */}
        <div className="grid grid-cols-1 gap-1">
          {[
            { level: 1, label: '1. No in-game text', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40' },
            { level: 2, label: '2. Low / Small text', color: 'border-teal-500/40 text-teal-300 bg-teal-950/40' },
            { level: 3, label: '3. Moderate in-game text', color: 'border-amber-500/40 text-amber-300 bg-amber-950/40' },
            { level: 4, label: '4. High / Extensive text', color: 'border-orange-500/40 text-orange-300 bg-orange-950/40' },
            { level: 5, label: '5. Unplayable in another lang', color: 'border-rose-500/40 text-rose-300 bg-rose-950/40' },
          ].map((item) => {
            const isSelected = filters.languageLevels.includes(item.level);
            return (
              <button
                key={item.level}
                onClick={() => toggleLanguageLevel(item.level)}
                className={`py-1 px-2 rounded-lg text-xs font-medium border text-left truncate transition-all ${
                  isSelected
                    ? `${item.color} font-bold ring-1 ring-current`
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. Storage Location / Notes Filter */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-orange-400" />
          Storage Location / Tag
        </label>
        <input
          type="text"
          value={filters.commentQuery}
          onChange={(e) => onFilterChange({ commentQuery: e.target.value })}
          placeholder="e.g. Kallax, Closet, Shelf..."
          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500"
        />
      </div>
    </div>
  );
};
