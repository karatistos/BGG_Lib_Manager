import React from 'react';
import { GameRecord } from '../types/bgg';
import { WeightBadge, PlayerBadge, DurationBadge, RankBadge, TypeBadge, LanguageBadge } from './Badge';
import { ProceduralCover } from './ProceduralCover';
import { Star, MapPin, Tag, ExternalLink, Users } from 'lucide-react';

interface GameCardProps {
  game: GameRecord;
  targetPlayerCount?: number | null;
  onSelect: (game: GameRecord) => void;
  onSelectMechanic?: (mechanic: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  targetPlayerCount,
  onSelect,
  onSelectMechanic,
}) => {
  return (
    <div
      onClick={() => onSelect(game)}
      className="group relative flex flex-col bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-orange-500/50 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer"
    >
      {/* Card Header Media */}
      <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden border-b border-slate-800/80">
        <ProceduralCover
          id={game.id}
          name={game.name}
          weightBracket={game.weightBracket}
          thumbnailUrl={game.thumbnail}
          className="w-full h-full"
        />

        {/* Floating Rank & Type Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
          <RankBadge rank={game.rank} />
          <TypeBadge type={game.type} />
        </div>

        {/* Floating Rating Pill */}
        {game.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-950/90 text-amber-300 border border-amber-500/30 backdrop-blur-md z-20 shadow-sm">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{game.rating.toFixed(1)}</span>
            {game.geekRating > 0 && (
              <span className="text-[10px] text-slate-400 font-normal">
                ({game.geekRating.toFixed(1)})
              </span>
            )}
          </div>
        )}

        {/* Floating Quick BGG Page Link Button */}
        <a
          href={`https://boardgamegeek.com/boardgame/${game.id}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-950/85 hover:bg-orange-500 text-slate-300 hover:text-white border border-slate-700/60 transition-all opacity-0 group-hover:opacity-100 z-20 backdrop-blur text-[11px] font-semibold shadow-md"
          title="Open official BoardGameGeek listing in new tab"
        >
          <span>BGG</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
        {/* Title and Year */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3
              className="font-bold text-sm text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1"
              title={game.name}
            >
              {game.name}
            </h3>
            {game.year && (
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {game.year}
              </span>
            )}
          </div>

          {/* Quick Metrics Chips Row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <WeightBadge weight={game.weight} bracket={game.weightBracket} />
            <PlayerBadge
              min={game.minPlayers}
              max={game.maxPlayers}
              best={game.bestPlayers}
              targetCount={targetPlayerCount}
            />
            <DurationBadge
              time={game.playTime}
              min={game.minPlayTime}
              max={game.maxPlayTime}
            />
            {game.languageLevel > 0 && (
              <LanguageBadge level={game.languageLevel} fullText={game.languageDependence} />
            )}
          </div>
        </div>

        {/* Footer Area: Mechanics / Location */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
          {/* Mechanics preview */}
          {game.mechanics && game.mechanics.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 overflow-hidden max-h-5">
              {game.mechanics.slice(0, 2).map((m) => (
                <button
                  key={m}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectMechanic) onSelectMechanic(m);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <Tag className="w-2.5 h-2.5 opacity-60" />
                  <span className="truncate max-w-[120px]">{m}</span>
                </button>
              ))}
              {game.mechanics.length > 2 && (
                <span className="text-[10px] text-slate-400">
                  +{game.mechanics.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Location / Note indicator */}
          {(game.invLocation || game.comment) && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
              <MapPin className="w-3 h-3 text-orange-400/80 shrink-0" />
              <span className="truncate">
                {game.invLocation || game.comment}
              </span>
            </div>
          )}

          {/* Club Owners indicator */}
          {game.owners && game.owners.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-800/40 text-[11px]">
              <Users className="w-3 h-3 text-orange-400 shrink-0" />
              <div className="flex items-center -space-x-1 overflow-hidden shrink-0">
                {game.owners.map((owner) => (
                  <span
                    key={owner.userId}
                    title={`${owner.userName} has this copy`}
                    className={`w-4 h-4 rounded-full ${owner.avatarColor} border border-slate-900 flex items-center justify-center text-[8px] font-bold`}
                  >
                    {owner.userName.slice(0, 1).toUpperCase()}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-300 truncate">
                {game.owners.map((o) => o.userName.replace(/\s*\(.*?\)/g, '')).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

