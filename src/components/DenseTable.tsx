import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  VisibilityState,
} from '@tanstack/react-table';
import { GameRecord, SortField, SortOrder } from '../types/bgg';
import { WeightBadge, PlayerBadge, DurationBadge, RankBadge, TypeBadge, LanguageBadge } from './Badge';
import { ProceduralCover } from './ProceduralCover';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  SlidersHorizontal,
  Star,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface DenseTableProps {
  games: GameRecord[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField) => void;
  onSelectGame: (game: GameRecord) => void;
  targetPlayerCount: number | null;
}

export const DenseTable: React.FC<DenseTableProps> = ({
  games,
  sortField,
  sortOrder,
  onSortChange,
  onSelectGame,
  targetPlayerCount,
}) => {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    thumbnail: true,
    rank: true,
    name: true,
    type: true,
    rating: true,
    weight: true,
    players: true,
    playTime: true,
    language: true,
    mechanics: true,
    location: true,
  });

  const [showColMenu, setShowColMenu] = useState(false);

  const columns = useMemo<ColumnDef<GameRecord>[]>(
    () => [
      {
        id: 'rank',
        header: '#',
        accessorKey: 'rank',
        cell: (info) => <RankBadge rank={info.getValue() as number | null} />,
        size: 70,
      },
      {
        id: 'thumbnail',
        header: '',
        accessorKey: 'id',
        cell: ({ row }) => (
          <div className="w-9 h-9 rounded overflow-hidden shrink-0">
            <ProceduralCover
              id={row.original.id}
              name={row.original.name}
              weightBracket={row.original.weightBracket}
              thumbnailUrl={row.original.thumbnail}
              className="w-full h-full text-[10px]"
            />
          </div>
        ),
        size: 45,
      },
      {
        id: 'name',
        header: 'Title',
        accessorKey: 'name',
        cell: ({ row }) => (
          <div className="flex items-center justify-between gap-2 py-0.5 group/cell">
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1">
                {row.original.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {row.original.year ? `${row.original.year}` : 'Year N/A'}
              </span>
            </div>
            <a
              href={`https://boardgamegeek.com/boardgame/${row.original.id}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-orange-500/20 text-slate-500 hover:text-orange-400 transition-all opacity-0 group-hover:opacity-100 shrink-0"
              title="Open on BoardGameGeek"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ),
      },
      {
        id: 'type',
        header: 'Type',
        accessorKey: 'type',
        cell: (info) => <TypeBadge type={info.getValue() as any} />,
        size: 75,
      },
      {
        id: 'rating',
        header: 'Rating',
        accessorKey: 'rating',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 font-mono text-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-slate-200">
              {row.original.rating > 0 ? row.original.rating.toFixed(1) : '-'}
            </span>
            {row.original.geekRating > 0 && (
              <span className="text-[10px] text-slate-400">
                ({row.original.geekRating.toFixed(1)})
              </span>
            )}
          </div>
        ),
        size: 110,
      },
      {
        id: 'weight',
        header: 'Weight',
        accessorKey: 'weight',
        cell: ({ row }) => (
          <WeightBadge weight={row.original.weight} bracket={row.original.weightBracket} />
        ),
        size: 90,
      },
      {
        id: 'players',
        header: 'Players',
        accessorKey: 'minPlayers',
        cell: ({ row }) => (
          <PlayerBadge
            min={row.original.minPlayers}
            max={row.original.maxPlayers}
            best={row.original.bestPlayers}
            targetCount={targetPlayerCount}
          />
        ),
        size: 130,
      },
      {
        id: 'playTime',
        header: 'Time',
        accessorKey: 'playTime',
        cell: ({ row }) => (
          <DurationBadge
            time={row.original.playTime}
            min={row.original.minPlayTime}
            max={row.original.maxPlayTime}
          />
        ),
        size: 90,
      },
      {
        id: 'language',
        header: 'Language',
        accessorKey: 'languageLevel',
        cell: ({ row }) => (
          <LanguageBadge
            level={row.original.languageLevel}
            fullText={row.original.languageDependence}
          />
        ),
        size: 110,
      },
      {
        id: 'mechanics',
        header: 'Mechanics',
        accessorKey: 'mechanics',
        cell: ({ row }) => {
          const list = row.original.mechanics || [];
          if (list.length === 0) return <span className="text-slate-600 text-xs">-</span>;
          return (
            <div className="flex flex-wrap gap-1 max-w-[220px]">
              {list.slice(0, 2).map((m) => (
                <span
                  key={m}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 truncate max-w-[100px]"
                >
                  {m}
                </span>
              ))}
              {list.length > 2 && (
                <span className="text-[10px] text-slate-400">+{list.length - 2}</span>
              )}
            </div>
          );
        },
      },
      {
        id: 'location',
        header: 'Location / Notes',
        accessorKey: 'comment',
        cell: ({ row }) => {
          const text = row.original.invLocation || row.original.comment;
          if (!text) return <span className="text-slate-600 text-xs">-</span>;
          return (
            <div className="flex items-center gap-1 text-xs text-slate-400 max-w-[180px] truncate" title={text}>
              <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
              <span className="truncate">{text}</span>
            </div>
          );
        },
      },
    ],
    [targetPlayerCount]
  );

  const table = useReactTable({
    data: games,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-orange-400 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-orange-400 ml-1 inline" />
    );
  };

  const mapColToSortField: Record<string, SortField | null> = {
    rank: 'rank',
    name: 'name',
    rating: 'rating',
    weight: 'weight',
    players: 'minPlayers',
    playTime: 'playTime',
  };

  return (
    <div className="space-y-3">
      {/* Table Toolbar: Column visibility */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-semibold text-slate-200">{games.length}</span> items
        </div>

        <div className="relative">
          <button
            onClick={() => setShowColMenu(!showColMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
            <span>Columns</span>
          </button>

          {showColMenu && (
            <div className="absolute right-0 mt-1 w-48 p-2 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-30 space-y-1">
              <div className="font-semibold text-slate-300 pb-1 mb-1 border-b border-slate-800 flex items-center justify-between">
                <span>Toggle Columns</span>
                <Eye className="w-3.5 h-3.5 text-slate-400" />
              </div>
              {table.getAllLeafColumns().map((column) => {
                if (column.id === 'name') return null; // Always keep name
                return (
                  <label
                    key={column.id}
                    className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-slate-800 cursor-pointer capitalize text-xs text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                      className="rounded border-slate-700 text-orange-500 focus:ring-orange-500/30"
                    />
                    <span>{column.id}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-950/90 text-slate-300 border-b border-slate-800 sticky top-0 z-10 backdrop-blur">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sortKey = mapColToSortField[header.id];
                  const isClickable = !!sortKey;

                  return (
                    <th
                      key={header.id}
                      onClick={() => isClickable && sortKey && onSortChange(sortKey)}
                      className={`px-3 py-2.5 font-semibold text-slate-400 uppercase tracking-wider text-[11px] select-none ${
                        isClickable ? 'cursor-pointer hover:text-slate-200 hover:bg-slate-800/40' : ''
                      }`}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      <div className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortKey && getSortIcon(sortKey)}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onSelectGame(row.original)}
                className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-slate-300 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

