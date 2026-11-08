import React, { useEffect } from 'react';
import { GameRecord } from '../types/bgg';
import { WeightBadge, RankBadge, TypeBadge, LanguageBadge } from './Badge';
import { ProceduralCover } from './ProceduralCover';
import {
  X,
  ExternalLink,
  Users,
  Clock,
  Star,
  MapPin,
  Tag,
  Info,
  Calendar,
  Layers,
  Languages,
} from 'lucide-react';

interface DetailDrawerProps {
  game: GameRecord | null;
  onClose: () => void;
  onSelectMechanic: (mechanic: string) => void;
  allGames: GameRecord[];
  onSelectGame: (game: GameRecord) => void;
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  game,
  onClose,
  onSelectMechanic,
  allGames,
  onSelectGame,
}) => {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!game) return null;

  // Weight percentage on a 1.0 to 5.0 scale
  const weightPercent = Math.max(0, Math.min(100, ((game.weight - 1) / 4) * 100));

  // Find related expansions or base game if any
  const baseName = game.name.split(':')[0].trim();
  const relatedGames = allGames.filter(
    (g) => g.id !== game.id && g.name.toLowerCase().startsWith(baseName.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-slate-950/90 border-b border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2">
            <RankBadge rank={game.rank} />
            <TypeBadge type={game.type} />
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://boardgamegeek.com/boardgame/${game.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-md shadow-orange-500/20"
              title="Open Game Page on BoardGameGeek"
            >
              <span>View on BGG</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6">
          {/* Main Cover & Title Banner */}
          <div className="flex gap-4 items-start">
            <div className="w-28 h-36 rounded-xl overflow-hidden shadow-lg border border-slate-800 shrink-0 bg-slate-950">
              <ProceduralCover
                id={game.id}
                name={game.name}
                weightBracket={game.weightBracket}
                thumbnailUrl={game.image || game.thumbnail}
                className="w-full h-full text-sm"
              />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <h2 className="text-xl font-bold text-white leading-tight">
                {game.name}
              </h2>
              {game.originalName && game.originalName !== game.name && (
                <p className="text-xs text-slate-400 italic truncate">
                  Original: {game.originalName}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                {game.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {game.year}
                  </span>
                )}
                {game.age && (
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    Age {game.age}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-400">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  ID #{game.id}
                </span>
              </div>

              {/* Ratings Bar */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100">
                      {game.rating > 0 ? game.rating.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      User Rating
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-100">
                      {game.geekRating > 0 ? game.geekRating.toFixed(2) : 'N/A'}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Geek Rating
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Complexity Weight Meter */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-orange-400" />
                Complexity Weight
              </span>
              <WeightBadge weight={game.weight} bracket={game.weightBracket} showLabel />
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
                style={{ width: `${Math.max(5, weightPercent)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.0 Light</span>
              <span>2.5 Medium</span>
              <span>5.0 Heavy</span>
            </div>
          </div>

          {/* Player Count Recommendation Matrix */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-orange-400" />
                Player Count Recommendations
              </span>
              <span className="text-slate-400 text-xs">
                Official: {game.minPlayers}–{game.maxPlayers} players
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => {
                const isBest = game.bestPlayers.includes(count);
                const isRec = game.recPlayers.includes(count);
                const isOfficial = count >= game.minPlayers && count <= game.maxPlayers;

                let statusClass = 'bg-slate-800/40 text-slate-600 border-slate-800';
                let tag = '';

                if (isBest) {
                  statusClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                  tag = '★ Best';
                } else if (isRec) {
                  statusClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                  tag = 'Rec';
                } else if (isOfficial) {
                  statusClass = 'bg-slate-800 text-slate-300 border-slate-700';
                  tag = 'Ok';
                }

                return (
                  <div
                    key={count}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${statusClass}`}
                  >
                    <span className="text-sm font-mono">{count}P</span>
                    <span className="text-[9px] mt-0.5 truncate">{tag || '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration & Language Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-400 shrink-0" />
              <div>
                <div className="text-[11px] text-slate-400">Play Time</div>
                <div className="text-sm font-semibold text-slate-200">
                  {game.playTime > 0 ? `${game.playTime} minutes` : 'Not specified'}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <Languages className="w-5 h-5 text-teal-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Language Dependence</span>
                  {game.languageLevel > 0 && <LanguageBadge level={game.languageLevel} />}
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate mt-0.5" title={game.languageDependence}>
                  {game.languageDependence || 'No text required'}
                </div>
              </div>
            </div>
          </div>

          {/* Mechanics & Categories Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-orange-400" />
                Game Mechanics
              </span>
              <span className="text-[10px] text-slate-400">Click to filter</span>
            </div>

            {game.mechanics && game.mechanics.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {game.mechanics.map((m) => (
                  <button
                    key={m}
                    onClick={() => onSelectMechanic(m)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/40 text-slate-300 border border-slate-700 transition-all"
                  >
                    {m}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No mechanics synced yet. Use the "Sync BGG" button in the top bar to fetch full mechanics.
              </p>
            )}
          </div>

          {/* User Notes, Storage & Inventory */}
          {(game.comment || game.invLocation || game.privateComment) && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-orange-500/20 space-y-2">
              <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Your Storage Location & Notes
              </span>
              {game.invLocation && (
                <div className="text-xs text-slate-200">
                  <span className="text-slate-400">Location:</span> {game.invLocation}
                </div>
              )}
              {game.comment && (
                <div className="text-xs text-slate-300 whitespace-pre-wrap bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  {game.comment}
                </div>
              )}
              {game.privateComment && (
                <div className="text-xs text-slate-400 italic">
                  Private: {game.privateComment}
                </div>
              )}
            </div>
          )}

          {/* Related Games / Expansions */}
          {relatedGames.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400">
                Related Items in Collection ({relatedGames.length})
              </span>
              <div className="space-y-1.5">
                {relatedGames.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectGame(rel)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 cursor-pointer border border-slate-700/60 transition-colors text-xs"
                  >
                    <span className="font-medium text-slate-200 truncate">{rel.name}</span>
                    <TypeBadge type={rel.type} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

