export interface AttachedFile {
  id: string;
  gameId: number;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  createdAt: number;
}

const DB_NAME = 'bgg_library_files_db';
const STORE_NAME = 'attached_files';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('gameId', 'gameId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachedFiles(gameId: number): Promise<AttachedFile[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('gameId');
      const req = index.getAll(IDBKeyRange.only(gameId));
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to get attached files from IndexedDB', err);
    return [];
  }
}

export async function saveAttachedFile(gameId: number, file: File): Promise<AttachedFile> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const record: AttachedFile = {
    id: `${gameId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    gameId,
    name: file.name,
    size: file.size,
    type: file.type || 'application/octet-stream',
    dataUrl,
    createdAt: Date.now(),
  };

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteAttachedFile(fileId: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(fileId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function downloadAttachedFile(file: AttachedFile): void {
  const link = document.createElement('a');
  link.href = file.dataUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function openAttachedFileInNewTab(file: AttachedFile): void {
  // For PDFs and images, open in new tab
  const win = window.open();
  if (win) {
    if (file.type.startsWith('image/')) {
      win.document.write(
        `<html><body style="margin:0;background:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${file.dataUrl}" style="max-width:100%;max-height:100vh;object-contain:contain;box-shadow:0 10px 30px rgba(0,0,0,0.5);" /></body></html>`
      );
    } else {
      win.location.href = file.dataUrl;
    }
  }
}

