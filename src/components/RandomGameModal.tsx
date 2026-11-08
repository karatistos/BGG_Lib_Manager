import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GameRecord } from '../types/bgg';
import { ProceduralCover } from './ProceduralCover';
import { WeightBadge, PlayerBadge, DurationBadge, RankBadge, TypeBadge, LanguageBadge } from './Badge';
import {
  Dices,
  ExternalLink,
  X,
  Sparkles,
  Users,
  Clock,
  Gauge,
  Languages,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RandomGameModalProps {
  allGames: GameRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: GameRecord) => void;
  initialPlayerCount?: number | null;
  initialOnlyBest?: boolean;
}

export const RandomGameModal: React.FC<RandomGameModalProps> = ({
  allGames,
  isOpen,
  onClose,
  onSelectGame,
  initialPlayerCount = null,
  initialOnlyBest = false,
}) => {
  // In-modal group filters
  const [playerCount, setPlayerCount] = useState<number | null>(initialPlayerCount);
  const [onlyBest, setOnlyBest] = useState<boolean>(initialOnlyBest);
  const [maxTime, setMaxTime] = useState<number | null>(null); // null means any
  const [weightCategory, setWeightCategory] = useState<'all' | 'light' | 'medium' | 'heavy'>('all');
  const [languageNeutralOnly, setLanguageNeutralOnly] = useState<boolean>(false);
  const [standaloneOnly, setStandaloneOnly] = useState<boolean>(true);
  const [showOptions, setShowOptions] = useState<boolean>(true);

  const [selectedGame, setSelectedGame] = useState<GameRecord | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const rollIntervalRef = useRef<any>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      setPlayerCount(initialPlayerCount);
      setOnlyBest(initialOnlyBest);
      setSelectedGame(null);
    }
  }, [isOpen, initialPlayerCount, initialOnlyBest]);

  // Compute matching games in real time based on modal group options
  const matchingGames = useMemo(() => {
    return allGames.filter((game) => {
      // 1. Standalone vs Expansions
      if (standaloneOnly && game.type !== 'standalone') return false;

      // 2. Player Count
      if (playerCount !== null) {
        if (onlyBest) {
          if (!game.bestPlayers.includes(playerCount)) return false;
        } else {
          const inRange = playerCount >= game.minPlayers && playerCount <= game.maxPlayers;
          const inRec = game.recPlayers.includes(playerCount);
          if (!inRange && !inRec) return false;
        }
      }

      // 3. Max Duration
      if (maxTime !== null && game.playTime > maxTime && game.playTime !== 0) {
        return false;
      }

      // 4. Complexity Weight
      if (weightCategory !== 'all') {
        if (weightCategory === 'light' && game.weight >= 2.0) return false;
        if (weightCategory === 'medium' && (game.weight < 2.0 || game.weight > 3.25)) return false;
        if (weightCategory === 'heavy' && game.weight <= 3.25) return false;
      }

      // 5. Language Neutral
      if (languageNeutralOnly) {
        if (game.languageLevel > 2) return false;
      }

      return true;
    });
  }, [allGames, standaloneOnly, playerCount, onlyBest, maxTime, weightCategory, languageNeutralOnly]);

  // Trigger roll animation
  const roll = () => {
    if (matchingGames.length === 0) return;
    setIsRolling(true);

    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    let count = 0;
    const maxSteps = 16;
    rollIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * matchingGames.length);
      setSelectedGame(matchingGames[randomIndex]);
      count++;
      if (count >= maxSteps) {
        clearInterval(rollIntervalRef.current);
        setIsRolling(false);
      }
    }, 70);
  };

  // Roll on first open if matches exist
  useEffect(() => {
    if (isOpen && matchingGames.length > 0 && !selectedGame && !isRolling) {
      roll();
    }
  }, [isOpen, matchingGames.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-orange-500/30 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-md shadow-orange-500/25">
              <Dices className={`w-5 h-5 ${isRolling ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2 leading-none">
                <span>Game Night Picker</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure your game group & roll what to play tonight
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

        {/* Group Preferences Toggle Panel */}
        <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-orange-400 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
              <span>Group Criteria</span>
              {showOptions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Live Matches Counter */}
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-full font-semibold border ${
                matchingGames.length > 0
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
              }`}
            >
              {matchingGames.length} games match
            </span>
          </div>

          {showOptions && (
            <div className="space-y-3 pt-1 text-xs text-slate-300 border-t border-slate-850">
              {/* 1. Players */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-orange-400" /> Players Tonight
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-amber-300">
                    <input
                      type="checkbox"
                      checked={onlyBest}
                      onChange={(e) => setOnlyBest(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                    />
                    <span>★ Only "Best with"</span>
                  </label>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-9 gap-1">
                  <button
                    onClick={() => setPlayerCount(null)}
                    className={`py-1 rounded-md text-[11px] font-semibold border transition-all ${
                      playerCount === null
                        ? 'bg-slate-700 text-white border-slate-600'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    Any
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPlayerCount(c)}
                      className={`py-1 rounded-md text-[11px] font-semibold border transition-all ${
                        playerCount === c
                          ? 'bg-orange-500 text-white border-orange-400 font-bold shadow-sm shadow-orange-500/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {c}P
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Duration / Max Time */}
              <div className="space-y-1.5">
                <span className="font-medium text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" /> Max Duration
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1">
                  {[
                    { label: 'Any Time', value: null },
                    { label: '≤30m Quick', value: 30 },
                    { label: '≤60m Mid', value: 60 },
                    { label: '≤90m', value: 90 },
                    { label: '≤120m', value: 120 },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={() => setMaxTime(t.value)}
                      className={`py-1 px-1.5 rounded-md text-[11px] font-medium border text-center truncate transition-all ${
                        maxTime === t.value
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 font-bold'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Complexity & Toggles Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Weight Category */}
                <div className="space-y-1">
                  <span className="font-medium text-slate-400 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-sky-400" /> Complexity
                  </span>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { id: 'all' as const, label: 'Any' },
                      { id: 'light' as const, label: 'Light' },
                      { id: 'medium' as const, label: 'Mid' },
                      { id: 'heavy' as const, label: 'Heavy' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        onClick={() => setWeightCategory(w.id)}
                        className={`py-1 rounded text-[11px] font-medium border transition-all ${
                          weightCategory === w.id
                            ? 'bg-sky-950 text-sky-300 border-sky-500/50 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Preferences Toggles */}
                <div className="flex flex-col justify-end space-y-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={languageNeutralOnly}
                      onChange={(e) => setLanguageNeutralOnly(e.target.checked)}
                      className="rounded border-slate-700 text-teal-500 focus:ring-teal-500/30"
                    />
                    <Languages className="w-3 h-3 text-teal-400" />
                    <span>Language Neutral only (Levels 1–2)</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={standaloneOnly}
                      onChange={(e) => setStandaloneOnly(e.target.checked)}
                      className="rounded border-slate-700 text-orange-500 focus:ring-orange-500/30"
                    />
                    <span>Standalone base games only</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Game Card Showcase */}
        {selectedGame ? (
          <div
            className={`p-4 rounded-2xl bg-slate-950 border transition-all duration-300 ${
              isRolling
                ? 'border-orange-500/50 opacity-70 scale-[0.98]'
                : 'border-slate-800 shadow-xl'
            }`}
          >
            <div className="flex gap-4 items-start">
              <div className="w-28 sm:w-32 h-36 sm:h-40 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-800 shadow-lg">
                <ProceduralCover
                  id={selectedGame.id}
                  name={selectedGame.name}
                  weightBracket={selectedGame.weightBracket}
                  thumbnailUrl={selectedGame.image || selectedGame.thumbnail}
                  className="w-full h-full text-xs"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1.5">
                  <RankBadge rank={selectedGame.rank} />
                  <TypeBadge type={selectedGame.type} />
                </div>

                <div>
                  <h4 className="font-extrabold text-base sm:text-lg text-white leading-tight line-clamp-2" title={selectedGame.name}>
                    {selectedGame.name}
                  </h4>
                  {selectedGame.year && (
                    <span className="text-xs font-mono text-slate-400">
                      Release Year {selectedGame.year}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <WeightBadge weight={selectedGame.weight} bracket={selectedGame.weightBracket} />
                  <PlayerBadge
                    min={selectedGame.minPlayers}
                    max={selectedGame.maxPlayers}
                    best={selectedGame.bestPlayers}
                    targetCount={playerCount}
                  />
                  <DurationBadge
                    time={selectedGame.playTime}
                    min={selectedGame.minPlayTime}
                    max={selectedGame.maxPlayTime}
                  />
                  {selectedGame.languageLevel > 0 && (
                    <LanguageBadge level={selectedGame.languageLevel} />
                  )}
                </div>

                {selectedGame.mechanics && selectedGame.mechanics.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 overflow-hidden max-h-6">
                    {selectedGame.mechanics.slice(0, 3).map((m) => (
                      <span
                        key={m}
                        className="text-[10px] px-2 py-0.5 rounded bg-purple-950/50 text-purple-300 border border-purple-500/30 truncate max-w-[130px]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs space-y-1">
            <p className="font-semibold text-slate-300">No games match this exact group combination</p>
            <p className="text-[11px] text-slate-500">Try relaxing the max duration or complexity filters above.</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={roll}
            disabled={isRolling || matchingGames.length === 0}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-white shadow-lg shadow-orange-500/25 transition-all"
          >
            <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{selectedGame ? 'Roll Again' : 'Roll for Game Night'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {selectedGame && (
              <>
                <a
                  href={`https://boardgamegeek.com/boardgame/${selectedGame.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  <span>BGG</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    onSelectGame(selectedGame);
                    onClose();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all border border-slate-700"
                >
                  View Details
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
