const ANNOTATIONS_KEY = 'bgg_personal_annotations_v1';

export function getAllAnnotations(): Record<number, string> {
  try {
    const raw = localStorage.getItem(ANNOTATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getPersonalAnnotation(gameId: number): string {
  const map = getAllAnnotations();
  return map[gameId] || '';
}

export function savePersonalAnnotation(gameId: number, text: string): void {
  try {
    const map = getAllAnnotations();
    if (!text.trim()) {
      delete map[gameId];
    } else {
      map[gameId] = text;
    }
    localStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save annotation to localStorage', err);
  }
}

