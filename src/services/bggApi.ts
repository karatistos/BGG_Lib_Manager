import { EnrichedMetadata, updateCachedMetadataBatch, getCachedMetadataMap } from './storage';

// Curated instant mechanics cache for popular games in collection so offline works immediately
export const CURATED_MECHANICS_SEED: Record<number, { mechanics: string[]; categories: string[]; thumbnail?: string }> = {
  316377: { // 7 Wonders (2nd ed)
    mechanics: ['Card Drafting', 'Set Collection', 'Simultaneous Action Selection', 'Hand Management'],
    categories: ['Ancient', 'Card Game', 'City Building', 'Civilization'],
    thumbnail: 'https://cf.geekdo-images.com/39_WzD4Y7n-vYg7k6l0eYg__thumb/img/9w3Lg8Vj9V2vM0zW5j8d_6Y4Y9U=/fit-in/200x150/filters:strip_icc()/pic5649931.jpg'
  },
  357726: { // 51st State: Ultimate Edition
    mechanics: ['Engine Building', 'Drafting', 'Card Play Conflict', 'Variable Player Powers', 'Hand Management'],
    categories: ['Card Game', 'Post-Apocalyptic', 'Science Fiction']
  },
  1961: { // 5 Alive
    mechanics: ['Hand Management', 'Take That', 'Player Elimination'],
    categories: ['Card Game', 'Number']
  },
  423517: { // 3 Chapters
    mechanics: ['Trick-taking', 'Card Drafting', 'Hand Management'],
    categories: ['Card Game', 'Fairy Tale']
  }
};

/**
 * Fetches single item from Geekdo API (tries /api/geekitem first, then CORS proxy)
 */
async function fetchGeekItem(id: number): Promise<EnrichedMetadata | null> {
  try {
    let json: any = null;

    // 1. Try Vercel Serverless Function first
    try {
      const resp = await fetch(`/api/geekitem?id=${id}`, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        json = await resp.json();
      }
    } catch {
      json = null;
    }

    // 2. If Vercel API is not available (local Vite dev or non-Vercel), use public CORS proxy
    if (!json || !json.item) {
      const geekUrl = `https://api.geekdo.com/api/geekitems?objectid=${id}&objecttype=thing`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(geekUrl)}`;
      const proxyResp = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (proxyResp.ok) {
        const text = await proxyResp.text();
        json = JSON.parse(text);
      }
    }

    if (!json || !json.item) return null;

    const item = json.item;
    const images = item.images || {};
    const thumbnail = images.previewthumb || images.square200 || images.thumb || images.micro;
    const image = images.original || images.previewthumb || images.thumb;

    const mechanics = (item.links?.boardgamemechanic || []).map((x: any) => x.name).filter(Boolean);
    const categories = (item.links?.boardgamecategory || []).map((x: any) => x.name).filter(Boolean);
    const description = item.description || item.short_description || undefined;

    return {
      id,
      thumbnail,
      image,
      mechanics,
      categories,
      description,
      updatedAt: Date.now(),
    };
  } catch (err) {
    console.warn(`Could not sync game ID ${id}:`, err);
    return null;
  }
}

/**
 * Fetches batch metadata from Geekdo for a list of game IDs
 */
export async function fetchBggMetadataBatch(
  ids: number[],
  onProgress?: (completed: number, total: number) => void
): Promise<EnrichedMetadata[]> {
  const allResults: EnrichedMetadata[] = [];
  const cachedMap = getCachedMetadataMap();

  // Find IDs not cached or missing thumbnail/mechanics
  const idsToFetch = ids.filter((id) => {
    const cached = cachedMap[id];
    return !cached || !cached.thumbnail || !cached.mechanics || cached.mechanics.length === 0;
  });

  if (idsToFetch.length === 0) {
    if (onProgress) onProgress(ids.length, ids.length);
    return ids.map((id) => cachedMap[id]).filter(Boolean);
  }

  let completedCount = ids.length - idsToFetch.length;
  if (onProgress) onProgress(completedCount, ids.length);

  const concurrency = 3;
  for (let i = 0; i < idsToFetch.length; i += concurrency) {
    const chunk = idsToFetch.slice(i, i + concurrency);
    const results = await Promise.all(chunk.map((id) => fetchGeekItem(id)));

    const validResults: EnrichedMetadata[] = [];
    results.forEach((res) => {
      if (res) {
        validResults.push(res);
        allResults.push(res);
      }
    });

    if (validResults.length > 0) {
      updateCachedMetadataBatch(validResults);
    }

    completedCount += chunk.length;
    if (onProgress) onProgress(Math.min(completedCount, ids.length), ids.length);

    // Short polite pause between chunks
    if (i + concurrency < idsToFetch.length) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  return allResults;
}
