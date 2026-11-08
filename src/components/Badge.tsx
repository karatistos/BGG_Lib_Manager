import React from 'react';
import { WeightBracket } from '../types/bgg';
import { Users, Clock, Star, Trophy, Layers, Languages } from 'lucide-react';

export const WeightBadge: React.FC<{ weight: number; bracket?: WeightBracket; showLabel?: boolean }> = ({
  weight,
  showLabel = false,
}) => {
  if (weight <= 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
        N/A Wgt
      </span>
    );
  }

  let colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30';
  let label = 'Light';

  if (weight >= 3.25) {
    colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-500/30';
    label = 'Heavy';
  } else if (weight >= 2.5) {
    colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-500/30';
    label = 'Med-Heavy';
  } else if (weight >= 1.8) {
    colorClasses = 'bg-sky-950/80 text-sky-300 border-sky-500/30';
    label = 'Med-Light';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${colorClasses} tracking-tight`}
      title={`BGG Complexity Weight: ${weight.toFixed(2)} / 5.00 (${label})`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{weight.toFixed(2)}</span>
      {showLabel && <span className="opacity-75 font-normal ml-0.5">({label})</span>}
    </span>
  );
};

export const PlayerBadge: React.FC<{
  min: number;
  max: number;
  best?: number[];
  targetCount?: number | null;
}> = ({ min, max, best = [], targetCount = null }) => {
  const isBestMatch = targetCount !== null && best.includes(targetCount);
  const playerRange = min === max ? `${min}` : `${min}–${max}`;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
        isBestMatch
          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-sm shadow-amber-500/20 font-semibold'
          : 'bg-slate-800/90 text-slate-300 border-slate-700'
      }`}
      title={best.length > 0 ? `Best with: ${best.join(', ')} players` : undefined}
    >
      <Users className="w-3 h-3 opacity-70" />
      <span>{playerRange}</span>
      {best.length > 0 && (
        <span className="text-[10px] text-amber-400 ml-0.5 flex items-center gap-0.5">
          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
          {best.join(',')}
        </span>
      )}
    </span>
  );
};

export const DurationBadge: React.FC<{ time: number; min?: number; max?: number }> = ({
  time,
  min,
  max,
}) => {
  if (time <= 0 && (!min || min <= 0)) {
    return null;
  }

  let display = `${time}m`;
  if (min && max && min !== max) {
    display = `${min}–${max}m`;
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700"
      title={`Playing time: ${display}`}
    >
      <Clock className="w-3 h-3 opacity-70" />
      <span>{display}</span>
    </span>
  );
};

export const RankBadge: React.FC<{ rank: number | null }> = ({ rank }) => {
  if (!rank || rank <= 0) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
        Unranked
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold border ${
        rank <= 100
          ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
          : rank <= 500
          ? 'bg-violet-950/70 text-violet-300 border-violet-500/30'
          : 'bg-slate-800/80 text-slate-300 border-slate-700'
      }`}
      title={`Overall BGG Rank #${rank}`}
    >
      <Trophy className="w-3 h-3 opacity-75" />
      <span>#{rank}</span>
    </span>
  );
};

export const TypeBadge: React.FC<{ type: 'standalone' | 'expansion' }> = ({ type }) => {
  if (type === 'expansion') {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/30">
        <Layers className="w-2.5 h-2.5" />
        Exp
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800/60 text-slate-400 border border-slate-700/40">
      Base
    </span>
  );
};

export const LanguageBadge: React.FC<{ level: number; fullText?: string }> = ({ level, fullText }) => {
  if (level === 0) return null;

  const configs: Record<number, { label: string; style: string }> = {
    1: { label: 'No text', style: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' },
    2: { label: 'Low text', style: 'bg-teal-950/80 text-teal-300 border-teal-500/30' },
    3: { label: 'Moderate text', style: 'bg-amber-950/80 text-amber-300 border-amber-500/30' },
    4: { label: 'High text', style: 'bg-orange-950/80 text-orange-300 border-orange-500/30' },
    5: { label: 'Unplayable', style: 'bg-rose-950/80 text-rose-300 border-rose-500/30' },
  };

  const config = configs[level] || configs[1];

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${config.style}`}
      title={fullText || config.label}
    >
      <Languages className="w-2.5 h-2.5 opacity-70" />
      <span>{config.label}</span>
    </span>
  );
};

