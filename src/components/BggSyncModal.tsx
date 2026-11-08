import React, { useState } from 'react';
import { GameRecord } from '../types/bgg';
import { fetchBggMetadataBatch } from '../services/bggApi';
import { getCachedMetadataMap } from '../services/storage';
import { RefreshCw, CheckCircle2, AlertCircle, X, Image as ImageIcon, Puzzle } from 'lucide-react';

interface BggSyncModalProps {
  games: GameRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete: () => void;
}

export const BggSyncModal: React.FC<BggSyncModalProps> = ({
  games,
  isOpen,
  onClose,
  onSyncComplete,
}) => {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const cachedMap = getCachedMetadataMap();
  const cachedCount = Object.keys(cachedMap).length;
  const uncachedGames = games.filter((g) => g.id > 0 && (!cachedMap[g.id] || !cachedMap[g.id].thumbnail));

  const startSync = async () => {
    if (uncachedGames.length === 0) return;
    setSyncing(true);
    setErrorMsg(null);
    setProgress({ completed: 0, total: uncachedGames.length });

    try {
      const ids = uncachedGames.map((g) => g.id);
      await fetchBggMetadataBatch(ids, (completed, total) => {
        setProgress({ completed, total });
      });
      onSyncComplete();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Sync paused or reached limit. You can click Start Sync again to resume.');
    } finally {
      setSyncing(false);
    }
  };

  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">BGG Box Art & Mechanics Sync</h3>
              <p className="text-xs text-slate-400">Enrich your collection from BoardGameGeek</p>
            </div>
          </div>
          {!syncing && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sync Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-sky-400" />
            <div>
              <div className="text-sm font-bold text-white">{cachedCount}</div>
              <div className="text-[10px] text-slate-400">Items Cached</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
            <Puzzle className="w-5 h-5 text-purple-400" />
            <div>
              <div className="text-sm font-bold text-white">{uncachedGames.length}</div>
              <div className="text-[10px] text-slate-400">Items Pending</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          This fetches official box thumbnails and game mechanics (e.g. Deck Building, Worker Placement)
          using BGG’s public XML API. Data is safely cached in your browser so it persists across sessions.
        </p>

        {/* Progress Display */}
        {syncing && (
          <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Fetching from BGG API...</span>
              <span className="font-mono text-orange-400 font-bold">{percent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400 text-right font-mono">
              {progress.completed} of {progress.total} games
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          {!syncing && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={startSync}
            disabled={syncing || uncachedGames.length === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 disabled:text-slate-500 text-white shadow-lg shadow-orange-500/20 transition-all"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing ({percent}%)...</span>
              </>
            ) : uncachedGames.length === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>All Synced</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Start Sync ({uncachedGames.length} games)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

