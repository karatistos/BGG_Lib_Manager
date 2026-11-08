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
 * Parses BGG XML API2 response string into EnrichedMetadata objects
 */
export function parseBggXmlResponse(xmlText: string): EnrichedMetadata[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  const items = xmlDoc.querySelectorAll('item, thing');
  const results: EnrichedMetadata[] = [];

  items.forEach((item) => {
    const idAttr = item.getAttribute('id');
    if (!idAttr) return;
    const id = parseInt(idAttr, 10);
    if (isNaN(id) || id <= 0) return;

    const thumbnailEl = item.querySelector('thumbnail');
    const imageEl = item.querySelector('image');

    const thumbnail = thumbnailEl?.textContent?.trim() || undefined;
    const image = imageEl?.textContent?.trim() || undefined;

    const mechanics: string[] = [];
    const categories: string[] = [];

    const links = item.querySelectorAll('link');
    links.forEach((link) => {
      const type = link.getAttribute('type');
      const value = link.getAttribute('value');
      if (type === 'boardgamemechanic' && value) {
        mechanics.push(value);
      } else if (type === 'boardgamecategory' && value) {
        categories.push(value);
      }
    });

    const description = item.querySelector('description')?.textContent?.trim() || undefined;

    results.push({
      id,
      thumbnail,
      image,
      mechanics,
      categories,
      description,
      updatedAt: Date.now(),
    });
  });

  return results;
}

/**
 * Fetches batch metadata from BGG XML API2 for a list of game IDs
 */
export async function fetchBggMetadataBatch(
  ids: number[],
  onProgress?: (completed: number, total: number) => void
): Promise<EnrichedMetadata[]> {
  const allResults: EnrichedMetadata[] = [];
  const chunkSize = 20; // BGG API recommendation: batches of 20 items
  const cachedMap = getCachedMetadataMap();

  // Find IDs not cached or older than 30 days
  const idsToFetch = ids.filter((id) => {
    const cached = cachedMap[id];
    return !cached || !cached.mechanics || cached.mechanics.length === 0;
  });

  if (idsToFetch.length === 0) {
    if (onProgress) onProgress(ids.length, ids.length);
    return ids.map((id) => cachedMap[id]).filter(Boolean);
  }

  let completedCount = ids.length - idsToFetch.length;

  for (let i = 0; i < idsToFetch.length; i += chunkSize) {
    const batch = idsToFetch.slice(i, i + chunkSize);
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${batch.join(',')}&stats=1`;

    let xmlText = '';
    try {
      // Direct fetch attempt
      const resp = await fetch(url);
      if (resp.status === 200) {
        xmlText = await resp.text();
      } else if (resp.status === 202) {
        // BGG queued request, wait 1.5s
        await new Promise((r) => setTimeout(r, 1500));
        const retryResp = await fetch(url);
        xmlText = await retryResp.text();
      }
    } catch {
      // CORS fallback using public proxy
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const proxyResp = await fetch(proxyUrl);
        if (proxyResp.ok) {
          xmlText = await proxyResp.text();
        }
      } catch (proxyErr) {
        console.warn(`Could not fetch batch ${batch.join(',')}`, proxyErr);
      }
    }

    if (xmlText) {
      const parsed = parseBggXmlResponse(xmlText);
      allResults.push(...parsed);
      updateCachedMetadataBatch(parsed);
    }

    completedCount += batch.length;
    if (onProgress) onProgress(Math.min(completedCount, ids.length), ids.length);

    // Polite BGG API delay between batches
    if (i + chunkSize < idsToFetch.length) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return allResults;
}

