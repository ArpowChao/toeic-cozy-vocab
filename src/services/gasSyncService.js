/**
 * Google Apps Script (GAS) Sync Client Service
 */

const GAS_URL_KEY = 'cozy_toeic_gas_url';
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycby_qeCnxjUnhdhuNSznujknjugUXUjPOrBpViHk5gB8PpAJgnekokO_YJs4ui82rqnOHg/exec';

export function getSavedGasUrl() {
  return localStorage.getItem(GAS_URL_KEY) || DEFAULT_GAS_URL;
}

export function saveGasUrl(url) {
  const cleanUrl = url ? url.trim() : '';
  localStorage.setItem(GAS_URL_KEY, cleanUrl || DEFAULT_GAS_URL);
  return cleanUrl || DEFAULT_GAS_URL;
}

/**
 * Test GAS endpoint connectivity
 */
export async function testGasConnection(url) {
  const targetUrl = url || getSavedGasUrl();
  if (!targetUrl) throw new Error('請先填入 GAS Web App 網址');

  const res = await fetch(targetUrl, { method: 'GET' });
  if (!res.ok) throw new Error(`連線失敗 (HTTP ${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '連線錯誤');
  return data;
}

/**
 * Push all words to Google Sheets via GAS
 */
export async function pushWordsToGas(words, url) {
  const targetUrl = url || getSavedGasUrl();
  if (!targetUrl) throw new Error('請先填入 GAS Web App 網址');

  const payload = {
    action: 'push',
    timestamp: new Date().toISOString(),
    words,
  };

  // Google Apps Script requires text/plain for CORS preflight bypass
  const res = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`備份至試算表失敗 (HTTP ${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '備份錯誤');
  return data;
}

/**
 * Pull words from Google Sheets via GAS
 */
export async function pullWordsFromGas(url) {
  const targetUrl = url || getSavedGasUrl();
  if (!targetUrl) throw new Error('請先填入 GAS Web App 網址');

  const res = await fetch(targetUrl, { method: 'GET' });
  if (!res.ok) throw new Error(`讀取試算表失敗 (HTTP ${res.status})`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '讀取錯誤');
  return data.words || [];
}

/**
 * Merges local and cloud words intelligently.
 * Matches by word spelling or ID.
 * Prefers the record with the most recent lastReviewed / dueDate progress,
 * while preserving rich enriched fields (definition, example, translation).
 */
export function mergeWordLists(localWords = [], cloudWords = []) {
  const map = new Map();

  // Index local words first
  for (const local of localWords) {
    if (!local?.word) continue;
    const key = local.word.toLowerCase().trim();
    map.set(key, { ...local });
  }

  // Merge cloud words
  for (const cloud of cloudWords) {
    if (!cloud?.word) continue;
    const key = cloud.word.toLowerCase().trim();
    const existing = map.get(key);

    if (!existing) {
      // New word from cloud (e.g. added in Google Sheet)
      map.set(key, {
        ...cloud,
        id: cloud.id || `sheet-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        state: cloud.state || 'new',
        repetition: Number(cloud.repetition) || 0,
        interval: Number(cloud.interval) || 0,
        easeFactor: Number(cloud.easeFactor) || 2.5,
      });
    } else {
      // Word exists in both: compare review dates to decide which review progress is newer
      const localRev = existing.lastReviewed || '';
      const cloudRev = cloud.lastReviewed || '';
      const cloudIsNewer = Boolean(cloudRev && (!localRev || cloudRev > localRev));

      map.set(key, {
        ...existing,
        // If cloud review is newer, adopt cloud SRS state; otherwise keep local SRS state
        ...(cloudIsNewer
          ? {
              dueDate: cloud.dueDate || existing.dueDate,
              lastReviewed: cloud.lastReviewed || existing.lastReviewed,
              state: cloud.state || existing.state,
              repetition: Number(cloud.repetition) || existing.repetition || 0,
              interval: Number(cloud.interval) || existing.interval || 0,
              easeFactor: Number(cloud.easeFactor) || existing.easeFactor || 2.5,
            }
          : {}),
        // Fill any empty metadata fields from whichever source has them
        ipa: existing.ipa || cloud.ipa || '',
        pos: existing.pos || cloud.pos || '',
        simpleDefinition: existing.simpleDefinition || cloud.simpleDefinition || '',
        collocation: existing.collocation || cloud.collocation || '',
        example: existing.example || cloud.example || '',
        exampleZh: existing.exampleZh || cloud.exampleZh || '',
        chinese: existing.chinese || cloud.chinese || '',
        toeicTip: existing.toeicTip || cloud.toeicTip || '',
        level: existing.level || cloud.level || 'L2',
        category: existing.category || cloud.category || '自訂生詞',
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Perform background cloud synchronization (Pull and intelligent merge)
 */
export async function syncWithCloud(localWords = [], url) {
  const targetUrl = url || getSavedGasUrl();
  if (!targetUrl) return { words: localWords, synced: false, pulledCount: 0 };

  try {
    const cloudWords = await pullWordsFromGas(targetUrl);
    if (!cloudWords || cloudWords.length === 0) {
      return { words: localWords, synced: true, pulledCount: 0 };
    }

    const merged = mergeWordLists(localWords, cloudWords);
    return { words: merged, synced: true, pulledCount: cloudWords.length };
  } catch (error) {
    console.warn('Background sync with cloud failed:', error);
    return { words: localWords, synced: false, error };
  }
}
