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

export function parseBggCsv(csvContent: string): GameRecord[] {
  const result = Papa.parse<Record<string, string>>(csvContent.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false, // Parse strings first to avoid NaN/null surprises
  });

  if (result.errors && result.errors.length > 0) {
    console.warn('CSV Parse Warnings:', result.errors.slice(0, 5));
  }

  const records: GameRecord[] = [];

  for (const row of result.data) {
    const name = (row.objectname || row.originalname || '').trim();
    if (!name) continue;

    const id = parseInt(row.objectid || '0', 10);
    const year = parseInt(row.yearpublished || '0', 10) || null;
    const rawType = (row.itemtype || '').toLowerCase();
    const type: ItemType = rawType.includes('expansion') ? 'expansion' : 'standalone';

    const rankRaw = parseInt(row.rank || '0', 10);
    const rank = rankRaw > 0 ? rankRaw : null;

    const rating = parseFloat(row.average || '0') || 0;
    const geekRating = parseFloat(row.baverage || '0') || 0;
    const weight = parseFloat(row.avgweight || '0') || 0;

    const minPlayers = parseInt(row.minplayers || '1', 10) || 1;
    const maxPlayers = parseInt(row.maxplayers || String(minPlayers), 10) || minPlayers;

    const bestPlayers = parsePlayerList(row.bggbestplayers);
    const recPlayers = parsePlayerList(row.bggrecplayers);

    const playTime = parseInt(row.playingtime || '0', 10) || 0;
    const minPlayTime = parseInt(row.minplaytime || '0', 10) || playTime;
    const maxPlayTime = parseInt(row.maxplaytime || '0', 10) || playTime;

    const comment = (row.comment || '').trim();
    const privateComment = (row.privatecomment || '').trim();
    const invLocation = (row.invlocation || '').trim();
    const age = (row.bggrecagerange || '').trim();
    const languageDependence = (row.bgglanguagedependence || '').trim();
    const numOwned = parseInt(row.numowned || '0', 10) || 0;
    const originalName = (row.originalname || '').trim();

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

