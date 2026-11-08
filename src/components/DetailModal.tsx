import React, { useState, useEffect, useRef } from 'react';
import { GameRecord } from '../types/bgg';
import { WeightBadge, RankBadge, TypeBadge, PlayerBadge, DurationBadge, LanguageBadge } from './Badge';
import { ProceduralCover } from './ProceduralCover';
import {
  AttachedFile,
  getAttachedFiles,
  saveAttachedFile,
  deleteAttachedFile,
  downloadAttachedFile,
  openAttachedFileInNewTab,
} from '../services/fileStorage';
import { getPersonalAnnotation, savePersonalAnnotation } from '../services/annotationsStorage';
import {
  X,
  ExternalLink,
  Users,
  Clock,
  Star,
  Tag,
  Layers,
  FileText,
  FileUp,
  Trash2,
  Download,
  BookOpen,
  Edit3,
  CheckCircle2,
  Sparkles,
  MapPin,
  ChevronRight,
  Info,
} from 'lucide-react';

interface DetailModalProps {
  game: GameRecord | null;
  onClose: () => void;
  onSelectMechanic: (mechanic: string) => void;
  allGames: GameRecord[];
  onSelectGame: (game: GameRecord) => void;
}

type TabType = 'overview' | 'expansions' | 'guides' | 'annotations';

export const DetailModal: React.FC<DetailModalProps> = ({
  game,
  onClose,
  onSelectMechanic,
  allGames,
  onSelectGame,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [annotation, setAnnotation] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<any>(null);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Load files and annotations when game changes
  useEffect(() => {
    if (game) {
      setActiveTab('overview');
      setAnnotation(getPersonalAnnotation(game.id));
      getAttachedFiles(game.id).then(setAttachedFiles);
    }
  }, [game?.id]);

  if (!game) return null;

  // Detect base game & expansions relationship
  const cleanTitle = game.name.split(':')[0].trim().toLowerCase();
  
  // Potential parent base game (if this is an expansion)
  const isExpansion = game.type === 'expansion';
  const parentBaseGame = isExpansion
    ? allGames.find((g) => g.type === 'standalone' && g.name.toLowerCase().startsWith(cleanTitle))
    : null;

  // Potential expansions (if this is a base game or looking for sibling expansions)
  const relatedExpansions = allGames.filter(
    (g) => g.id !== game.id && g.type === 'expansion' && g.name.toLowerCase().startsWith(cleanTitle)
  );

  // Handling annotation input with autosave
  const handleAnnotationChange = (text: string) => {
    setAnnotation(text);
    setSaveStatus('Saving...');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      savePersonalAnnotation(game.id, text);
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 600);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const saved = await saveAttachedFile(game.id, file);
      setAttachedFiles((prev) => [saved, ...prev]);
    } catch (err) {
      console.error(err);
      alert('Failed to save file attachment.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Delete this attached reference file?')) {
      await deleteAttachedFile(fileId);
      setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const weightPercent = Math.max(0, Math.min(100, ((game.weight - 1) / 4) * 100));

  // Quick insertion helpers for personal annotations
  const insertTemplate = (prefix: string) => {
    const updated = annotation ? `${annotation}\n\n${prefix}: ` : `${prefix}: `;
    handleAnnotationChange(updated);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5 md:p-8">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Expansive Centered Modal */}
      <div className="relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/95 border-b border-slate-800 backdrop-blur shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <RankBadge rank={game.rank} />
            <TypeBadge type={game.type} />
            <h2 className="text-lg md:text-xl font-bold text-white truncate" title={game.name}>
              {game.name}
            </h2>
            {game.year && (
              <span className="text-xs font-mono text-slate-400 shrink-0">
                ({game.year})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={`https://boardgamegeek.com/boardgame/${game.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-md shadow-orange-500/20"
              title="Open official BoardGameGeek page"
            >
              <span>View on BGG</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Overview & BGG Details</span>
          </button>

          <button
            onClick={() => setActiveTab('expansions')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'expansions'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>
              {isExpansion ? 'Base Game & Sister Expansions' : `Expansions (${relatedExpansions.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guides')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guides'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Guides & Files ({attachedFiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('annotations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'annotations'
                ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>My Annotations {annotation && '•'}</span>
          </button>
        </div>

        {/* Modal Scrollable Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Hero Cover & Core Specs (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl relative">
                <ProceduralCover
                  id={game.id}
                  name={game.name}
                  weightBracket={game.weightBracket}
                  thumbnailUrl={game.image || game.thumbnail}
                  className="w-full h-full text-base"
                />
              </div>

              {/* Ratings Box */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white font-mono">
                      {game.rating > 0 ? game.rating.toFixed(2) : '-'}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Community Rating
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-white font-mono">
                      {game.geekRating > 0 ? game.geekRating.toFixed(2) : '-'}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Geek Rating
                    </div>
                  </div>
                </div>
              </div>

              {/* Complexity Weight Meter */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-orange-400" />
                    Complexity Weight
                  </span>
                  <WeightBadge weight={game.weight} bracket={game.weightBracket} showLabel />
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
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

              {/* Core Details Grid */}
              <div className="space-y-2 text-xs text-slate-300 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Players
                  </span>
                  <PlayerBadge min={game.minPlayers} max={game.maxPlayers} best={game.bestPlayers} />
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Playing Time
                  </span>
                  <DurationBadge time={game.playTime} min={game.minPlayTime} max={game.maxPlayTime} />
                </div>

                {game.languageLevel > 0 && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-400">Language</span>
                    <LanguageBadge level={game.languageLevel} fullText={game.languageDependence} />
                  </div>
                )}

                {game.age && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Suggested Age</span>
                    <span className="font-mono text-slate-200">{game.age}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Tab Content Canvas (8 cols) */}
            <div className="lg:col-span-8 min-w-0">
              {/* TAB 1: OVERVIEW & BGG DESCRIPTION */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Player Count Recommendation Matrix */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-orange-400" />
                        Player Count Recommendations
                      </span>
                      <span className="text-slate-400 text-xs">
                        Official: {game.minPlayers}–{game.maxPlayers} players
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((count) => {
                        const isBest = game.bestPlayers.includes(count);
                        const isRec = game.recPlayers.includes(count);
                        const isOfficial = count >= game.minPlayers && count <= game.maxPlayers;

                        let statusClass = 'bg-slate-900 text-slate-600 border-slate-800/80';
                        let tag = '—';

                        if (isBest) {
                          statusClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold';
                          tag = '★ Best';
                        } else if (isRec) {
                          statusClass = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                          tag = 'Rec';
                        } else if (isOfficial) {
                          statusClass = 'bg-slate-800/80 text-slate-300 border-slate-700';
                          tag = 'Supported';
                        }

                        return (
                          <div
                            key={count}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${statusClass}`}
                          >
                            <span className="text-sm font-mono">{count}P</span>
                            <span className="text-[10px] mt-0.5 truncate">{tag}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Official BGG Game Description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                      Game Description
                    </h4>
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-300 leading-relaxed max-h-72 overflow-y-auto space-y-3 prose prose-invert prose-sm max-w-none">
                      {/* BGG descriptions often contain simple HTML like <br /> or <p> */}
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            (game as any).description ||
                            (game as any).shortDescription ||
                            'No description available yet.',
                        }}
                      />
                    </div>
                  </div>

                  {/* Mechanics & Categories Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-purple-400" />
                        Mechanics & Categories
                      </span>
                      <span className="text-[10px] text-slate-400">Click to filter library</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {game.mechanics &&
                        game.mechanics.map((m) => (
                          <button
                            key={m}
                            onClick={() => onSelectMechanic(m)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-800/60 text-purple-300 border border-purple-500/30 transition-all"
                          >
                            {m}
                          </button>
                        ))}
                      {game.categories &&
                        game.categories.map((c) => (
                          <span
                            key={c}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {c}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Storage Location & Original Notes */}
                  {(game.invLocation || game.comment) && (
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-orange-500/20 flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold text-orange-300">
                          Storage & CSV Location: {game.invLocation || 'Default Shelf'}
                        </div>
                        {game.comment && (
                          <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">
                            {game.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EXPANSIONS & BASE GAME RELATIONSHIP */}
              {activeTab === 'expansions' && (
                <div className="space-y-5">
                  {/* If this is an expansion, show Parent Base Game */}
                  {isExpansion && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                        Parent Base Game
                      </span>
                      {parentBaseGame ? (
                        <div
                          onClick={() => onSelectGame(parentBaseGame)}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/40 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-950">
                              <ProceduralCover
                                id={parentBaseGame.id}
                                name={parentBaseGame.name}
                                weightBracket={parentBaseGame.weightBracket}
                                thumbnailUrl={parentBaseGame.thumbnail}
                                className="w-full h-full text-[10px]"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-white group-hover:text-purple-300 transition-colors">
                                {parentBaseGame.name}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Base Game ({parentBaseGame.year}) • Rank #{parentBaseGame.rank || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                            <span>Inspect Base</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-400">
                          Base game not found in your collection (or named independently).
                        </div>
                      )}
                    </div>
                  )}

                  {/* Related Expansions list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {isExpansion ? 'Sister Expansions in Collection' : 'Owned Expansions'} ({relatedExpansions.length})
                      </span>
                    </div>

                    {relatedExpansions.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {relatedExpansions.map((exp) => (
                          <div
                            key={exp.id}
                            onClick={() => onSelectGame(exp)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all group"
                          >
                            <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                              <ProceduralCover
                                id={exp.id}
                                name={exp.name}
                                weightBracket={exp.weightBracket}
                                thumbnailUrl={exp.thumbnail}
                                className="w-full h-full text-[10px]"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-sm text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                                {exp.name}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                <span>{exp.year || 'Exp'}</span>
                                <span>•</span>
                                <WeightBadge weight={exp.weight} bracket={exp.weightBracket} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-xs text-slate-500">
                        No expansions for this title found in your current CSV collection.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: GUIDES & REFERENCE FILES */}
              {activeTab === 'guides' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Personal Guides, Rulebooks & References</span>
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Attach PDFs, cheat sheets, or player aid images for quick offline access during game night.
                      </p>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
                    >
                      <FileUp className="w-4 h-4" />
                      <span>{isUploading ? 'Saving...' : 'Attach File'}</span>
                    </button>
                  </div>

                  {/* List of Attached Files */}
                  {attachedFiles.length > 0 ? (
                    <div className="space-y-2">
                      {attachedFiles.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-200 truncate">
                                {f.name}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {(f.size / 1024).toFixed(1)} KB • Added {new Date(f.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => openAttachedFileInNewTab(f)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                              title="Open in new browser tab"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => downloadAttachedFile(f)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Download to computer"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(f.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Remove attachment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-10 text-center bg-slate-950/40 rounded-2xl border-2 border-dashed border-slate-800 hover:border-sky-500/40 cursor-pointer transition-colors space-y-2"
                    >
                      <FileUp className="w-8 h-8 text-slate-500 mx-auto" />
                      <div className="text-xs font-semibold text-slate-300">
                        No reference guides attached yet
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Click here to attach a rulebook PDF, setup cheat sheet, or player aid image.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PERSONAL ANNOTATIONS */}
              {activeTab === 'annotations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Personal Notes & Annotations</span>
                        {saveStatus && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-normal">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {saveStatus}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Private notes auto-save in your browser.
                      </p>
                    </div>

                    {/* Quick Template Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => insertTemplate('Setup Tip')}
                        className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        + Setup
                      </button>
                      <button
                        onClick={() => insertTemplate('House Rule')}
                        className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        + House Rule
                      </button>
                      <button
                        onClick={() => insertTemplate('Card Sleeves')}
                        className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        + Sleeves
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={annotation}
                    onChange={(e) => handleAnnotationChange(e.target.value)}
                    placeholder="Type your personal setup notes, house rules, card sleeving info, or playgroup records here..."
                    className="w-full h-64 p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 font-sans leading-relaxed resize-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
