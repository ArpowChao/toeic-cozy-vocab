/**
 * Google Apps Script (GAS) Backend for TOEIC Cozy Vocab PWA
 * 專為「暖心多益單字自習室」提供 Google Sheets 雙向雲端同步 Web API
 */

const HEADERS = [
  'id',
  'word',
  'ipa',
  'pos',
  'level',
  'category',
  'simpleDefinition',
  'collocation',
  'example',
  'exampleZh',
  'chinese',
  'toeicTip',
  'state',
  'repetition',
  'interval',
  'easeFactor',
  'dueDate',
  'lastReviewed',
];

/**
 * Handle GET Requests (Pull Words from Sheet)
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('TOEIC_Vocab');
    if (!sheet) {
      sheet = initSheet(ss);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse({ success: true, count: 0, words: [] });
    }

    const headers = data[0];
    const words = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0] && !row[1]) continue; // Skip empty rows

      const wordObj = {};
      headers.forEach((h, idx) => {
        wordObj[h] = row[idx] !== undefined ? row[idx] : '';
      });
      words.push(wordObj);
    }

    return jsonResponse({
      success: true,
      count: words.length,
      words: words,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Handle POST Requests (Push / Backup Words to Sheet)
 */
function doPost(e) {
  try {
    let payload;
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter;
    }

    const words = payload.words || [];
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('TOEIC_Vocab');
    if (!sheet) {
      sheet = initSheet(ss);
    }

    // Overwrite with latest data
    sheet.clearContents();
    sheet.appendRow(HEADERS);

    if (words.length > 0) {
      const rows = words.map((w) => {
        return HEADERS.map((h) => (w[h] !== undefined ? w[h] : ''));
      });
      sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
    }

    return jsonResponse({
      success: true,
      message: `成功同步 ${words.length} 個單字至 Google 試算表！`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * Initialize Sheet Structure & Formatting
 */
function initSheet(ss) {
  let sheet = ss.getSheetByName('TOEIC_Vocab');
  if (!sheet) {
    sheet = ss.insertSheet('TOEIC_Vocab');
  }
  sheet.clear();
  sheet.appendRow(HEADERS);

  // Styling header
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#8C5E3C').setFontColor('#FFFFFF').setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

/**
 * Helper to return CORS-compliant JSON
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
