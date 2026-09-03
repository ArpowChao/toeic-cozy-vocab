import { TOEIC_SEED_WORDS } from '../data/toeicSeedWords.js';

const DB_NAME = 'CozyToeicVocabDB';
const DB_VERSION = 1;
const STORE_NAME = 'words';
const SETTINGS_STORE = 'settings';
const LOGS_STORE = 'study_logs';

/**
 * Open IndexedDB with Fallback
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null); // Fallback to localStorage
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(LOGS_STORE)) {
        db.createObjectStore(LOGS_STORE, { keyPath: 'date' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null); // gracefully fallback
  });
}

/**
 * LocalStorage Fallback Helpers
 */
const LS_WORDS_KEY = 'cozy_toeic_words';
const LS_SETTINGS_KEY = 'cozy_toeic_settings';
const LS_LOGS_KEY = 'cozy_toeic_logs';

/**
 * Deduplicate word list by spelling, keeping the richer record (with definition/ipa/chinese)
 */
export function deduplicateWordList(words) {
  const map = new Map();
  const duplicatesToDelete = [];

  for (const w of words) {
    if (!w || !w.word) continue;
    const key = w.word.toLowerCase().trim();
    if (!map.has(key)) {
      map.set(key, w);
    } else {
      const existing = map.get(key);
      const existingScore = (existing.simpleDefinition?.trim() ? 2 : 0) + (existing.chinese?.trim() ? 2 : 0) + (existing.ipa?.trim() ? 1 : 0);
      const newScore = (w.simpleDefinition?.trim() ? 2 : 0) + (w.chinese?.trim() ? 2 : 0) + (w.ipa?.trim() ? 1 : 0);

      if (newScore > existingScore) {
        if (existing.id) duplicatesToDelete.push(existing.id);
        map.set(key, { ...existing, ...w });
      } else {
        if (w.id) duplicatesToDelete.push(w.id);
        map.set(key, { ...w, ...existing });
      }
    }
  }

  return { uniqueWords: Array.from(map.values()), duplicatesToDelete };
}

/**
 * Initialize storage with default seed words if empty, and clean up duplicate records
 */
export async function initStorage() {
  const words = await getAllWords();
  if (words.length === 0) {
    await saveWordsBatch(TOEIC_SEED_WORDS);
    return TOEIC_SEED_WORDS;
  }

  const { uniqueWords, duplicatesToDelete } = deduplicateWordList(words);
  if (duplicatesToDelete.length > 0) {
    for (const id of duplicatesToDelete) {
      await deleteWord(id);
    }
    await saveWordsBatch(uniqueWords);
    return uniqueWords;
  }

  return words;
}

/**
 * Get all words
 */
export async function getAllWords() {
  const db = await openDB();
  if (!db) {
    const raw = localStorage.getItem(LS_WORDS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/**
 * Save or update a single word
 */
export async function saveWord(word) {
  const db = await openDB();
  if (!word.id) {
    word.id = `word-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  if (!db) {
    const words = await getAllWords();
    const index = words.findIndex((w) => w.id === word.id || w.word.toLowerCase() === word.word.toLowerCase());
    if (index >= 0) {
      words[index] = { ...words[index], ...word };
    } else {
      words.unshift(word);
    }
    localStorage.setItem(LS_WORDS_KEY, JSON.stringify(words));
    return word;
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(word);
      request.onsuccess = () => resolve(word);
      request.onerror = () => reject(request.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Save words in batch with duplicate ID cleanup
 */
export async function saveWordsBatch(newWords) {
  const db = await openDB();
  if (!db) {
    const existing = await getAllWords();
    const map = new Map();
    existing.forEach((w) => {
      if (w?.word) map.set(w.word.toLowerCase().trim(), w);
    });
    newWords.forEach((w) => {
      if (!w?.word) return;
      const key = w.word.toLowerCase().trim();
      const prev = map.get(key);
      map.set(key, { ...prev, ...w });
    });
    const merged = Array.from(map.values());
    localStorage.setItem(LS_WORDS_KEY, JSON.stringify(merged));
    return merged;
  }

  // Check for any conflicting old IDs in IndexedDB
  const existingWords = await getAllWords();
  const existingByWord = new Map();
  existingWords.forEach((w) => {
    if (w?.word) existingByWord.set(w.word.toLowerCase().trim(), w);
  });

  const idsToDelete = [];
  const finalWords = [];

  for (const nw of newWords) {
    if (!nw?.word) continue;
    const key = nw.word.toLowerCase().trim();
    const match = existingByWord.get(key);
    if (match && match.id !== nw.id) {
      idsToDelete.push(match.id);
    }
    finalWords.push(nw);
  }

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      idsToDelete.forEach((id) => store.delete(id));
      finalWords.forEach((w) => store.put(w));
      transaction.oncomplete = () => resolve(finalWords);
      transaction.onerror = () => reject(transaction.error);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Delete a word by ID
 */
export async function deleteWord(id) {
  const db = await openDB();
  if (!db) {
    const words = await getAllWords();
    const filtered = words.filter((w) => w.id !== id);
    localStorage.setItem(LS_WORDS_KEY, JSON.stringify(filtered));
    return true;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Record today's study progress
 */
export async function recordStudyActivity(count = 1) {
  const today = new Date().toISOString().split('T')[0];
  const db = await openDB();

  if (!db) {
    const raw = localStorage.getItem(LS_LOGS_KEY);
    const logs = raw ? JSON.parse(raw) : {};
    logs[today] = (logs[today] || 0) + count;
    localStorage.setItem(LS_LOGS_KEY, JSON.stringify(logs));
    return logs;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(LOGS_STORE, 'readwrite');
      const store = transaction.objectStore(LOGS_STORE);
      const getReq = store.get(today);
      getReq.onsuccess = () => {
        const current = getReq.result || { date: today, count: 0 };
        current.count += count;
        store.put(current);
        resolve(current);
      };
      getReq.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Get study logs for streak & heatmap
 */
export async function getStudyLogs() {
  const db = await openDB();
  if (!db) {
    const raw = localStorage.getItem(LS_LOGS_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(LOGS_STORE, 'readonly');
      const store = transaction.objectStore(LOGS_STORE);
      const request = store.getAll();
      request.onsuccess = () => {
        const map = {};
        (request.result || []).forEach((item) => {
          map[item.date] = item.count;
        });
        resolve(map);
      };
      request.onerror = () => resolve({});
    } catch {
      resolve({});
    }
  });
}

/**
 * Export all data to JSON
 */
export async function exportToJSON() {
  const words = await getAllWords();
  const logs = await getStudyLogs();
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    words,
    logs,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cozy_toeic_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Reset all words back to default seed list
 */
export async function resetToDefault() {
  const db = await openDB();
  if (!db) {
    localStorage.removeItem(LS_WORDS_KEY);
    localStorage.removeItem(LS_LOGS_KEY);
    return initStorage();
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([STORE_NAME, LOGS_STORE], 'readwrite');
      transaction.objectStore(STORE_NAME).clear();
      transaction.objectStore(LOGS_STORE).clear();
      transaction.oncomplete = async () => {
        const words = await initStorage();
        resolve(words);
      };
    } catch {
      resolve(initStorage());
    }
  });
}
