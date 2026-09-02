/**
 * Dictionary & Word Auto-enrichment Service
 * Uses Free Dictionary API + MyMemory Translation API with offline fallback
 */

const COMMON_BUSINESS_COLLOCATIONS = {
  comply: 'comply with regulations / safety policies',
  accommodate: 'accommodate client needs / special requests',
  negotiate: 'negotiate contract terms / lower prices',
  reimburse: 'reimburse travel expenses / costs',
  attendee: 'registered attendees / conference attendees',
  expedite: 'expedite shipment / delivery process',
  delegate: 'delegate tasks / authority to subordinates',
  address: 'address concerns / issues / the audience',
  contingency: 'a contingency plan for emergencies',
  mandatory: 'mandatory training / compliance checks',
  tentative: 'a tentative agreement / schedule',
  unprecedented: 'unprecedented growth / market demand',
};

/**
 * Fetch word details automatically
 * @param {string} wordText
 * @returns {Promise<Object>} Enriched word data
 */
export async function lookupWordOnline(wordText) {
  const cleanWord = wordText.trim().toLowerCase();
  if (!cleanWord) return null;

  let ipa = '';
  let pos = 'n.';
  let simpleDefinition = '';
  let example = '';
  let chinese = '';

  // 1. Try Free Dictionary API
  try {
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
    if (dictRes.ok) {
      const data = await dictRes.json();
      if (Array.isArray(data) && data.length > 0) {
        const entry = data[0];
        
        // Find phonetic
        ipa = entry.phonetic || (entry.phonetics?.find((p) => p.text)?.text) || '';

        // Find primary meaning
        if (entry.meanings && entry.meanings.length > 0) {
          const primaryMeaning = entry.meanings[0];
          pos = primaryMeaning.partOfSpeech ? `${primaryMeaning.partOfSpeech.substring(0, 3)}.` : 'v.';
          
          if (primaryMeaning.definitions && primaryMeaning.definitions.length > 0) {
            const defObj = primaryMeaning.definitions[0];
            simpleDefinition = defObj.definition || '';
            example = defObj.example || '';
          }
        }
      }
    }
  } catch (err) {
    console.warn('Free Dictionary lookup failed, using fallback:', err);
  }

  // 2. Try MyMemory Translation API for Traditional Chinese
  try {
    const transRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|zh-TW`
    );
    if (transRes.ok) {
      const transData = await transRes.json();
      if (transData.responseData?.translatedText) {
        chinese = transData.responseData.translatedText;
      }
    }
  } catch (err) {
    console.warn('Translation lookup failed:', err);
  }

  // 3. Fallbacks and defaults
  if (!simpleDefinition) {
    simpleDefinition = `to act, use, or manage ${cleanWord} in a practical or business context`;
  }

  const collocation = COMMON_BUSINESS_COLLOCATIONS[cleanWord] || `${cleanWord} [in the workplace / for the project]`;
  
  if (!example) {
    example = `The management decided to ${cleanWord} the new proposal during the quarterly meeting.`;
  }

  return {
    word: cleanWord,
    ipa: ipa || `/${cleanWord}/`,
    pos: pos || 'v.',
    level: 'L2',
    category: '自訂生詞',
    simpleDefinition,
    collocation,
    example,
    exampleZh: chinese ? `例句（參考）：管理階層決定在季度會議上探討相關事宜。` : '',
    chinese: chinese || '（點擊手動輸入中文釋義）',
    toeicTip: '多益重點：請留意本單字在商務句型中的搭配詞與動名詞詞性轉換。',
    derivatives: '',
    state: 'new',
    repetition: 0,
    interval: 0,
    easeFactor: 2.5,
    dueDate: null,
  };
}
