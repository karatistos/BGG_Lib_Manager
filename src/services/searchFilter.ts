import { GameRecord, FilterState, SortField, SortOrder, CollectionMetrics } from '../types/bgg';

export function filterAndSortGames(
  games: GameRecord[],
  filters: FilterState,
  sortField: SortField,
  sortOrder: SortOrder
): GameRecord[] {
  const queryTokens = filters.searchQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const commentTokens = filters.commentQuery
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const filtered = games.filter((game) => {
    // 1. Item Type Filter
    if (filters.itemType !== 'all') {
      if (game.type !== filters.itemType) return false;
    }

    // 2. Global Fuzzy Text Search
    if (queryTokens.length > 0) {
      const matchAll = queryTokens.every((token) => {
        // match name, comments, or tagged mechanics
        if (game.searchTokens.includes(token)) return true;
        if (game.mechanics && game.mechanics.some((m) => m.toLowerCase().includes(token))) return true;
        if (game.categories && game.categories.some((c) => c.toLowerCase().includes(token))) return true;
        return false;
      });
      if (!matchAll) return false;
    }

    // 3. Comment / Storage Location specific search
    if (commentTokens.length > 0) {
      const commentSearchSpace = `${game.comment} ${game.privateComment} ${game.invLocation}`.toLowerCase();
      const matchComment = commentTokens.every((token) => commentSearchSpace.includes(token));
      if (!matchComment) return false;
    }

    // 4. Player Count Filter
    if (filters.playerCount !== null) {
      const count = filters.playerCount;
      if (filters.onlyBestPlayers) {
        if (!game.bestPlayers.includes(count)) {
          return false;
        }
      } else {
        // Standard range check
        const inRange = count >= game.minPlayers && count <= game.maxPlayers;
        const inRec = game.recPlayers.includes(count);
        if (!inRange && !inRec) return false;
      }
    }

    // 5. Weight / Complexity Filter
    if (filters.weightBrackets.length > 0) {
      if (!filters.weightBrackets.includes(game.weightBracket)) {
        return false;
      }
    }
    if (filters.weightRange[0] > 1.0 || filters.weightRange[1] < 5.0) {
      if (game.weight < filters.weightRange[0] || game.weight > filters.weightRange[1]) {
        return false;
      }
    }

    // 6. Play Time / Duration Bracket
    if (filters.durationBracket !== 'all') {
      const time = game.playTime;
      switch (filters.durationBracket) {
        case 'quick':
          if (time > 30 && time !== 0) return false;
          break;
        case 'mid':
          if (time <= 30 || time > 60) return false;
          break;
        case 'main':
          if (time <= 60 || time > 120) return false;
          break;
        case 'epic':
          if (time <= 120) return false;
          break;
      }
    }

    // 7. Mechanics Multi-Select
    if (filters.selectedMechanics.length > 0) {
      if (!game.mechanics || game.mechanics.length === 0) return false;
      const hasAllMechanics = filters.selectedMechanics.every((m) =>
        game.mechanics?.includes(m)
      );
      if (!hasAllMechanics) return false;
    }

    // 8. Category Filter
    if (filters.selectedCategory) {
      if (!game.categories || !game.categories.includes(filters.selectedCategory)) {
        return false;
      }
    }

    // 9. Language Dependence Filter
    if (filters.languageLevels.length > 0) {
      if (!filters.languageLevels.includes(game.languageLevel)) {
        return false;
      }
    }

    // 10. Year Filter
    if (filters.yearRange[0] > 1950 || filters.yearRange[1] < 2030) {
      if (game.year !== null && game.year > 0 && (game.year < filters.yearRange[0] || game.year > filters.yearRange[1])) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case 'rank': {
        // null/0 ranks go to the bottom
        const rankA = a.rank ?? 999999;
        const rankB = b.rank ?? 999999;
        comparison = rankA - rankB;
        break;
      }
      case 'name':
        comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        break;
      case 'rating':
        comparison = a.rating - b.rating;
        break;
      case 'geekRating':
        comparison = a.geekRating - b.geekRating;
        break;
      case 'weight':
        comparison = a.weight - b.weight;
        break;
      case 'playTime':
        comparison = a.playTime - b.playTime;
        break;
      case 'year': {
        const yearA = a.year ?? 0;
        const yearB = b.year ?? 0;
        comparison = yearA - yearB;
        break;
      }
      case 'minPlayers':
        comparison = a.minPlayers - b.minPlayers;
        break;
      case 'maxPlayers':
        comparison = a.maxPlayers - b.maxPlayers;
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export function computeCollectionMetrics(games: GameRecord[]): CollectionMetrics {
  const totalCount = games.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      standaloneCount: 0,
      expansionCount: 0,
      avgWeight: 0,
      avgRating: 0,
      medianPlayTime: 0,
      topRankedGame: null,
      mechanicsDistribution: {},
      playerCountCoverage: {},
    };
  }

  let standaloneCount = 0;
  let expansionCount = 0;
  let totalWeight = 0;
  let totalRating = 0;
  let weightCount = 0;
  const playTimes: number[] = [];
  const mechanicsDistribution: Record<string, number> = {};
  const playerCountCoverage: Record<number, number> = {};
  let topRankedGame: GameRecord | null = null;
  let lowestRank = 999999;

  for (const g of games) {
    if (g.type === 'standalone') standaloneCount++;
    else expansionCount++;

    if (g.weight > 0) {
      totalWeight += g.weight;
      weightCount++;
    }

    if (g.rating > 0) {
      totalRating += g.rating;
    }

    if (g.playTime > 0) {
      playTimes.push(g.playTime);
    }

    if (g.rank && g.rank > 0 && g.rank < lowestRank) {
      lowestRank = g.rank;
      topRankedGame = g;
    }

    // Mechanics tally
    if (g.mechanics) {
      for (const m of g.mechanics) {
        mechanicsDistribution[m] = (mechanicsDistribution[m] || 0) + 1;
      }
    }

    // Player coverage tally
    for (let p = g.minPlayers; p <= Math.min(g.maxPlayers, 10); p++) {
      playerCountCoverage[p] = (playerCountCoverage[p] || 0) + 1;
    }
  }

  playTimes.sort((a, b) => a - b);
  const midIndex = Math.floor(playTimes.length / 2);
  const medianPlayTime = playTimes.length > 0 ? playTimes[midIndex] : 0;

  return {
    totalCount,
    standaloneCount,
    expansionCount,
    avgWeight: weightCount > 0 ? parseFloat((totalWeight / weightCount).toFixed(2)) : 0,
    avgRating: totalCount > 0 ? parseFloat((totalRating / totalCount).toFixed(2)) : 0,
    medianPlayTime,
    topRankedGame,
    mechanicsDistribution,
    playerCountCoverage,
  };
}

