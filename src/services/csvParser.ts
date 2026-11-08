import Papa from 'papaparse';
import { GameRecord, ItemType, WeightBracket } from '../types/bgg';

export function getWeightBracket(weight: number): WeightBracket {
  if (weight <= 0) return 'light';
  if (weight < 1.8) return 'light';
  if (weight < 2.5) return 'medium-light';
  if (weight < 3.25) return 'medium-heavy';
  return 'heavy';
}

export function getLanguageLevel(str: string): number {
  const s = str.toLowerCase();
  if (s.includes('no necessary')) return 1;
  if (s.includes('some necessary')) return 2;
  if (s.includes('moderate')) return 3;
  if (s.includes('extensive')) return 4;
  if (s.includes('unplayable')) return 5;
  return 0; // Unspecified
}

function parsePlayerList(str: string | undefined): number[] {
  if (!str) return [];
  const cleaned = str.replace(/[+–-]/g, ' ').trim();
  const tokens = cleaned.split(/[,;\s]+/);
  const nums = tokens
    .map(t => parseInt(t, 10))
    .filter(n => !isNaN(n) && n > 0 && n <= 100);
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

function getField(row: Record<string, string>, ...keys: string[]): string {
  // 1. Direct key match
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
      return String(row[k]).trim();
    }
  }

  // 2. Normalized case-insensitive & punctuation-insensitive match
  const rowCleanMap = new Map<string, string>();
  for (const [k, v] of Object.entries(row)) {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    rowCleanMap.set(cleanKey, v ? String(v).trim() : '');
  }

  for (const k of keys) {
    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = rowCleanMap.get(cleanK);
    if (found) return found;
  }

  return '';
}

export function parseBggCsv(csvContent: string): GameRecord[] {
  const result = Papa.parse<Record<string, string>>(csvContent.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
  });

  if (result.errors && result.errors.length > 0) {
    console.warn('CSV Parse Warnings:', result.errors.slice(0, 5));
  }

  const records: GameRecord[] = [];

  for (const row of result.data) {
    const name = getField(row, 'objectname', 'originalname', 'name', 'title', 'game');
    if (!name) continue;

    const id = parseInt(getField(row, 'objectid', 'id', 'gameid', 'collid', 'itemid') || '0', 10);
    const yearRaw = parseInt(getField(row, 'yearpublished', 'year', 'year_published') || '0', 10);
    const year = yearRaw > 0 ? yearRaw : null;

    const rawType = getField(row, 'itemtype', 'subtype', 'objecttype', 'type').toLowerCase();
    const type: ItemType = rawType.includes('expansion') ? 'expansion' : 'standalone';

    const rankRaw = parseInt(getField(row, 'rank', 'bggrank', 'overallrank') || '0', 10);
    const rank = rankRaw > 0 ? rankRaw : null;

    const rating = parseFloat(getField(row, 'average', 'rating', 'userrating') || '0') || 0;
    const geekRating = parseFloat(getField(row, 'baverage', 'geekrating', 'bayesaverage') || '0') || 0;
    const weight = parseFloat(getField(row, 'avgweight', 'weight', 'complexity') || '0') || 0;

    const minPlayers = parseInt(getField(row, 'minplayers', 'min_players', 'players_min') || '1', 10) || 1;
    const maxPlayers = parseInt(getField(row, 'maxplayers', 'max_players', 'players_max') || String(minPlayers), 10) || minPlayers;

    const bestPlayers = parsePlayerList(getField(row, 'bggbestplayers', 'bestplayers', 'best_players'));
    const recPlayers = parsePlayerList(getField(row, 'bggrecplayers', 'recplayers', 'recommended_players'));

    const playTime = parseInt(getField(row, 'playingtime', 'playtime', 'duration', 'time') || '0', 10) || 0;
    const minPlayTime = parseInt(getField(row, 'minplaytime', 'min_play_time') || '0', 10) || playTime;
    const maxPlayTime = parseInt(getField(row, 'maxplaytime', 'max_play_time') || '0', 10) || playTime;

    const comment = getField(row, 'comment', 'notes', 'usercomment');
    const privateComment = getField(row, 'privatecomment', 'privatenotes');
    const invLocation = getField(row, 'invlocation', 'location', 'shelf', 'storage');
    const age = getField(row, 'bggrecagerange', 'age', 'minage');
    const languageDependence = getField(row, 'bgglanguagedependence', 'languagedependence', 'language');
    const numOwned = parseInt(getField(row, 'numowned', 'owned') || '0', 10) || 0;
    const originalName = getField(row, 'originalname', 'altname') || name;

    const searchTokens = `${name} ${originalName} ${comment} ${invLocation} ${year || ''}`.toLowerCase();

    records.push({
      id,
      name,
      originalName,
      year,
      type,
      rank,
      rating,
      geekRating,
      weight,
      weightBracket: getWeightBracket(weight),
      minPlayers,
      maxPlayers,
      bestPlayers,
      recPlayers,
      playTime,
      minPlayTime,
      maxPlayTime,
      age,
      languageDependence,
      languageLevel: getLanguageLevel(languageDependence),
      numOwned,
      comment,
      privateComment,
      invLocation,
      searchTokens,
    });
  }

  return records;
}
