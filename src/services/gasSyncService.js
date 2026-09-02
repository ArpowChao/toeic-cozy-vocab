/**
 * Google Apps Script (GAS) Sync Client Service
 */

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
