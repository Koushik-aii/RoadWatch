/**
 * IndexedDB wrapper for RoadWatch offline capabilities.
 */

const DB_NAME = 'RoadWatchDB';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (e) => reject(e.target.error);

      request.onsuccess = (e) => resolve(e.target.result);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('apiCache')) {
          db.createObjectStore('apiCache', { keyPath: 'url' });
        }
        if (!db.objectStoreNames.contains('mutationQueue')) {
          db.createObjectStore('mutationQueue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }
  return dbPromise;
}

// ── Cache (GET requests) ──────────────────────────────────────

export async function setCache(url, data) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('apiCache', 'readwrite');
      const store = tx.objectStore('apiCache');
      const req = store.put({ url, data, timestamp: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to write cache to IDB', err);
  }
}

export async function getCache(url) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('apiCache', 'readonly');
      const store = tx.objectStore('apiCache');
      const req = store.get(url);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to read cache from IDB', err);
    return null;
  }
}

// ── Mutation Queue (POST requests) ────────────────────────────

export async function queueMutation(path, method, headers, serializedBody) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutationQueue', 'readwrite');
      const store = tx.objectStore('mutationQueue');
      const req = store.add({
        path,
        method,
        headers,
        body: serializedBody, // Must be an object, string, or Blob. FormData is converted first.
        timestamp: Date.now()
      });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to queue mutation', err);
  }
}

export async function getQueuedMutations() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutationQueue', 'readonly');
      const store = tx.objectStore('mutationQueue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return [];
  }
}

export async function removeMutation(id) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutationQueue', 'readwrite');
      const store = tx.objectStore('mutationQueue');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to remove mutation', err);
  }
}

/**
 * Serializes FormData into an object containing File/Blob and strings,
 * which IndexedDB can natively store.
 */
export async function serializeFormData(formData) {
  const obj = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File || value instanceof Blob) {
      obj[key] = {
        type: 'file',
        blob: value,
        name: value.name
      };
    } else {
      obj[key] = { type: 'text', value };
    }
  }
  return obj;
}

/**
 * Reconstructs FormData from the serialized object.
 */
export function deserializeFormData(obj) {
  const fd = new FormData();
  for (const key in obj) {
    const item = obj[key];
    if (item.type === 'file') {
      fd.append(key, item.blob, item.name);
    } else {
      fd.append(key, item.value);
    }
  }
  return fd;
}
