export interface EnrichedMetadata {
  id: number;
  thumbnail?: string;
  image?: string;
  mechanics?: string[];
  categories?: string[];
  description?: string;
  shortDescription?: string;
  updatedAt: number;
}

const STORAGE_KEYS = {
  CUSTOM_CSV: 'bgg_custom_csv_data',
  METADATA_CACHE: 'bgg_metadata_cache_v1',
  SAVED_VIEW: 'bgg_preferred_view_mode',
};

export function getCustomCsv(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_CSV);
  } catch {
    return null;
  }
}

export function saveCustomCsv(csvContent: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CSV, csvContent);
  } catch (err) {
    console.error('Failed to save CSV to localStorage', err);
  }
}

export function clearCustomCsv(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_CSV);
  } catch (err) {
    console.error('Failed to clear custom CSV', err);
  }
}

export function getCachedMetadataMap(): Record<number, EnrichedMetadata> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.METADATA_CACHE);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveCachedMetadataMap(map: Record<number, EnrichedMetadata>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.METADATA_CACHE, JSON.stringify(map));
  } catch (err) {
    console.warn('Metadata cache reached localStorage limit, clearing older entries', err);
  }
}

export function updateCachedMetadataBatch(entries: EnrichedMetadata[]): void {
  const current = getCachedMetadataMap();
  for (const entry of entries) {
    current[entry.id] = {
      ...(current[entry.id] || {}),
      ...entry,
      updatedAt: Date.now(),
    };
  }
  saveCachedMetadataMap(current);
}

