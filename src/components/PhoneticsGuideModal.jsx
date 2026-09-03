import React, { useState } from 'react';
import { X, Volume2, Search, Sparkles, BookOpen, HelpCircle } from 'lucide-react';
import { speakText } from '../services/ttsService.js';

const TOP_DIFFERENCES = [
  {
    kk: '[o]',
    ipa: '/oʊ/',
    name: '雙母音 o',
    tip: 'KK 習慣簡寫為單一字母，IPA 如實標示出從「ㄛ」圓唇滑向「ㄨ」的雙母音嘴型。',
    examples: ['go', 'no', 'overall', 'boat'],
  },
  {
    kk: '[e]',
    ipa: '/eɪ/',
    name: '雙母音 e',
    tip: 'KK 簡寫為單字母，IPA 標示從「ㄝ」滑向「ㄧ」，發音像注音「ㄟ」。',
    examples: ['day', 'say', 'make', 'game'],
  },
  {
    kk: '[ɔ]',
    ipa: '/ɑː/ 或 /ɔː/',
    name: '開口大母音',
    tip: '美語中開大口的母音，現代劍橋字典多數標為開口較大的 /ɑː/（像 father）。',
    examples: ['call', 'law', 'overall', 'water'],
  },
  {
    kk: '[i]',
    ipa: '/iː/',
    name: '長母音 i',
    tip: 'IPA 多了後方的長音符號「ː」，嘴角放鬆向兩側拉開微笑。',
    examples: ['see', 'team', 'eat', 'sleep'],
  },
  {
    kk: '[u]',
    ipa: '/uː/',
    name: '長母音 u',
    tip: 'IPA 多了長音符號「ː」，嘴唇縮成小圓圈的長音「嗚~」。',
    examples: ['too', 'food', 'blue', 'school'],
  },
  {
    kk: '[ɛ]',
    ipa: '/e/ 或 /ɛ/',
    name: '短母音 e',
    tip: '嘴張約一指半的短促「ㄝ」，劍橋字典習慣直接寫成字母 /e/。',
    examples: ['bed', 'set', 'head', 'help'],
  },
];

const VOWELS = [
  { kk: '[i]', ipa: '/iː/', desc: '長母音：微笑嘴角拉開長音「ㄧ」', examples: ['see', 'heat', 'key'] },
  { kk: '[ɪ]', ipa: '/ɪ/', desc: '短母音：嘴微開短促放鬆的「ㄧ」', examples: ['sit', 'hit', 'big'] },
  { kk: '[e]', ipa: '/eɪ/', desc: '雙母音：從「ㄝ」滑向「ㄧ」', examples: ['say', 'late', 'rain'] },
  { kk: '[ɛ]', ipa: '/e/', desc: '短母音：嘴張約一指半的短促「ㄝ」', examples: ['bed', 'red', 'yes'] },
  { kk: '[æ]', ipa: '/æ/', desc: '蝴蝶音：嘴張大約兩指的大開口「ㄝ/ㄚ」', examples: ['cat', 'bad', 'apple'] },
  { kk: '[ɑ]', ipa: '/ɑː/', desc: '短母音：看牙醫開大口的「ㄚ」', examples: ['hot', 'father', 'box'] },
  { kk: '[ɔ]', ipa: '/ɔː/', desc: '倒 c 音：嘴唇微圓突出「歐」', examples: ['law', 'door', 'walk'] },
  { kk: '[o]', ipa: '/oʊ/', desc: '雙母音：從「ㄛ」滑向「ㄨ」', examples: ['go', 'home', 'overall'] },
  { kk: '[ʊ]', ipa: '/ʊ/', desc: '短母音：嘴唇微翹短促「ㄨ」', examples: ['book', 'put', 'good'] },
  { kk: '[u]', ipa: '/uː/', desc: '長母音：嘴唇縮小圓圈長音「嗚~」', examples: ['food', 'moon', 'rule'] },
  { kk: '[ʌ]', ipa: '/ʌ/', desc: '倒 v 音：短促有力的「ㄜ」（重音）', examples: ['cup', 'love', 'bus'] },
  { kk: '[ə]', ipa: '/ə/', desc: '倒 e 弱化音：完全放鬆短音「ㄜ」', examples: ['ago', 'sofa', 'about'] },
  { kk: '[aɪ]', ipa: '/aɪ/', desc: '雙母音：開口「ㄚ」滑向「ㄧ」', examples: ['time', 'my', 'like'] },
  { kk: '[aʊ]', ipa: '/aʊ/', desc: '雙母音：開口「ㄚ」滑向「ㄨ」', examples: ['now', 'out', 'house'] },
  { kk: '[ɔɪ]', ipa: '/ɔɪ/', desc: '雙母音：圓唇「ㄛ」滑向「ㄧ」', examples: ['boy', 'oil', 'coin'] },
];

const R_VOWELS = [
  { kk: '[ɝ]', ipa: '/ɜːr/ 或 /ɝ/', desc: '重音捲舌：舌尖向後捲、音調加強', examples: ['bird', 'work', 'nurse'] },
  { kk: '[ɚ]', ipa: '/ər/ 或 /ɚ/', desc: '弱音捲舌：字尾輕讀捲舌', examples: ['teacher', 'doctor', 'overall'] },
  { kk: '[ɑr]', ipa: '/ɑːr/', desc: '大口母音後捲舌', examples: ['car', 'star', 'park'] },
  { kk: '[ɔr]', ipa: '/ɔːr/', desc: '圓唇母音後捲舌', examples: ['door', 'for', 'sport'] },
  { kk: '[ɛr]', ipa: '/er/', desc: 'ㄝ母音後捲舌', examples: ['care', 'bear', 'share'] },
  { kk: '[ɪr]', ipa: '/ɪr/', desc: 'ㄧ母音後捲舌', examples: ['ear', 'here', 'clear'] },
];

const CONSONANTS = [
  { kk: '[ʃ]', ipa: '/ʃ/', desc: '氣音「ㄒㄩ」（叫人安靜噓~）', examples: ['ship', 'fish', 'sure'] },
  { kk: '[ʒ]', ipa: '/ʒ/', desc: '濁音「ㄖ」（聲帶震動）', examples: ['vision', 'measure', 'asia'] },
  { kk: '[tʃ]', ipa: '/tʃ/', desc: '氣音「ㄑㄧ」（像吃或七）', examples: ['chair', 'check', 'catch'] },
  { kk: '[dʒ]', ipa: '/dʒ/', desc: '濁音「ㄐㄧ」（聲帶震動）', examples: ['job', 'jump', 'age'] },
  { kk: '[θ]', ipa: '/θ/', desc: '無聲咬舌：舌尖碰上下門牙吹氣', examples: ['think', 'three', 'bath'] },
  { kk: '[ð]', ipa: '/ð/', desc: '有聲咬舌：舌尖碰牙齒並發聲震動', examples: ['this', 'that', 'they'] },
  { kk: '[ŋ]', ipa: '/ŋ/', desc: '鼻後音「ㄥ」', examples: ['sing', 'ring', 'long'] },
  { kk: '[j]', ipa: '/j/', desc: '注意不是「ㄐ」，而是英文的「y」（耶）', examples: ['yes', 'you', 'year'] },
];

export default function PhoneticsGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('core'); // 'core' | 'vowels' | 'r' | 'consonants' | 'stress'
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handlePlayWord = (word) => {
    speakText(word, 'en-US');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-cozyDark-500/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl lg:max-w-3xl overflow-hidden paper-shadow border border-cream-300 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-50">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-latte-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-latte-600" />
              KK 音標 ⇄ 現代 IPA 音標對照手冊
            </h2>
            <p className="text-xs text-cozyDark-200 mt-0.5">
              為熟悉台灣 KK 音標的學習者提供無痛橋樑，點擊單字可直接試聽標準發音
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-cozyDark-100 hover:text-cozyDark-400 hover:bg-cream-200 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 bg-cream-100/70 border-b border-cream-200 overflow-x-auto">
          {[
            { id: 'core', label: '🔥 核心必記 6 大差異' },
            { id: 'vowels', label: '母音全覽 (Vowels)' },
            { id: 'r', label: '含 R 捲舌母音' },
            { id: 'consonants', label: '特殊子音' },
            { id: 'stress', label: '重音符號規則' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-latte-600 text-white shadow-xs'
                  : 'bg-white text-latte-700 hover:bg-cream-200 border border-cream-300/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: Core 6 Differences */}
          {activeTab === 'core' && (
            <div className="space-y-3.5">
              <div className="bg-amberGold-50 border border-amberGold-200 p-3.5 rounded-2xl text-xs text-amberGold-800 leading-relaxed">
                💡 <strong>學習心法：</strong> 台灣國高中教材的 KK 音標習慣將雙母音簡寫為單字母（如 [o], [e]）；而劍橋等現代字典採用的 <strong>IPA</strong> 會完整標出嘴型滑動的軌跡。兩者<strong>發音完全相同</strong>，只是符號更精確！
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TOP_DIFFERENCES.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-cream-50 border border-cream-300 hover:border-latte-300 transition shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-latte-600 uppercase tracking-wide bg-cream-200/80 px-2 py-0.5 rounded-md">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-sm">
                        <span className="px-2 py-0.5 bg-amberGold-100 text-amberGold-800 rounded font-bold" title="KK 音標">
                          {item.kk}
                        </span>
                        <span className="text-cozyDark-200">➔</span>
                        <span className="px-2 py-0.5 bg-sage-100 text-sage-800 rounded font-bold" title="現代 IPA 音標">
                          {item.ipa}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-cozyDark-300 leading-relaxed mb-3">
                      {item.tip}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-cozyDark-200">試聽：</span>
                      {item.examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => handlePlayWord(ex)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-latte-100 text-latte-700 border border-cream-300 text-xs font-semibold shadow-2xs transition flex items-center gap-1 active:scale-95"
                          title={`點擊朗讀 ${ex}`}
                        >
                          <Volume2 className="w-3 h-3 text-latte-500" />
                          <span>{ex}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Vowels */}
          {activeTab === 'vowels' && (
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-2xl border border-cream-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-cream-100 text-latte-800 border-b border-cream-300 font-bold">
                      <th className="p-3">KK 音標</th>
                      <th className="p-3">現代 IPA</th>
                      <th className="p-3">嘴型與發音重點</th>
                      <th className="p-3">範例單字（可點擊試聽）</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200 bg-white">
                    {VOWELS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-cream-50/70 transition">
                        <td className="p-3 font-mono font-bold text-amberGold-800 bg-amberGold-50/50 w-24">
                          {row.kk}
                        </td>
                        <td className="p-3 font-mono font-bold text-sage-800 bg-sage-50/50 w-24">
                          {row.ipa}
                        </td>
                        <td className="p-3 text-cozyDark-400">
                          {row.desc}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {row.examples.map((ex, i) => (
                              <button
                                key={i}
                                onClick={() => handlePlayWord(ex)}
                                className="px-2 py-0.5 bg-cream-100 hover:bg-latte-100 rounded text-latte-700 font-medium transition flex items-center gap-1"
                              >
                                <Volume2 className="w-2.5 h-2.5 text-latte-500" />
                                {ex}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: R Vowels */}
          {activeTab === 'r' && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-2xl border border-cream-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-cream-100 text-latte-800 border-b border-cream-300 font-bold">
                      <th className="p-3">KK 音標</th>
                      <th className="p-3">現代 IPA</th>
                      <th className="p-3">特徵說明</th>
                      <th className="p-3">範例單字</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200 bg-white">
                    {R_VOWELS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-cream-50/70 transition">
                        <td className="p-3 font-mono font-bold text-amberGold-800 bg-amberGold-50/50 w-24">
                          {row.kk}
                        </td>
                        <td className="p-3 font-mono font-bold text-sage-800 bg-sage-50/50 w-28">
                          {row.ipa}
                        </td>
                        <td className="p-3 text-cozyDark-400">
                          {row.desc}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {row.examples.map((ex, i) => (
                              <button
                                key={i}
                                onClick={() => handlePlayWord(ex)}
                                className="px-2 py-0.5 bg-cream-100 hover:bg-latte-100 rounded text-latte-700 font-medium transition flex items-center gap-1"
                              >
                                <Volume2 className="w-2.5 h-2.5 text-latte-500" />
                                {ex}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Consonants */}
          {activeTab === 'consonants' && (
            <div className="space-y-3">
              <div className="p-3 bg-cream-100 rounded-2xl text-xs text-latte-700">
                多數一般子音（如 p, b, t, d, k, g, m, n, s, z, f, v, l）在 KK 與 IPA 符號中完全一致，以下僅列出最容易混淆的特殊子音：
              </div>
              <div className="overflow-x-auto rounded-2xl border border-cream-300">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-cream-100 text-latte-800 border-b border-cream-300 font-bold">
                      <th className="p-3">KK 音標</th>
                      <th className="p-3">現代 IPA</th>
                      <th className="p-3">口型比喻提示</th>
                      <th className="p-3">範例單字</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200 bg-white">
                    {CONSONANTS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-cream-50/70 transition">
                        <td className="p-3 font-mono font-bold text-amberGold-800 bg-amberGold-50/50 w-20">
                          {row.kk}
                        </td>
                        <td className="p-3 font-mono font-bold text-sage-800 bg-sage-50/50 w-20">
                          {row.ipa}
                        </td>
                        <td className="p-3 text-cozyDark-400">
                          {row.desc}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {row.examples.map((ex, i) => (
                              <button
                                key={i}
                                onClick={() => handlePlayWord(ex)}
                                className="px-2 py-0.5 bg-cream-100 hover:bg-latte-100 rounded text-latte-700 font-medium transition flex items-center gap-1"
                              >
                                <Volume2 className="w-2.5 h-2.5 text-latte-500" />
                                {ex}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: Stress Rules */}
          {activeTab === 'stress' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-300 space-y-3">
                <h4 className="font-bold text-latte-800 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-latte-500" />
                  IPA 重音符號速記公式
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white border border-cream-200">
                    <div className="font-mono text-base font-bold text-terracotta-600 mb-1">
                      ˈ（高撇號）= 主重音
                    </div>
                    <p className="text-cozyDark-300 leading-relaxed">
                      音調最高、發音最響亮。永遠標在<strong>重音音節的最前方上方</strong>。
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-cream-200">
                    <div className="font-mono text-base font-bold text-latte-600 mb-1">
                      ˌ（低撇號）= 次重音
                    </div>
                    <p className="text-cozyDark-300 leading-relaxed">
                      次要重音，音調略平。永遠標在<strong>次重音音節的最前方下方</strong>。
                    </p>
                  </div>
                </div>

                <div className="mt-3 p-3.5 rounded-xl bg-white border border-cream-200">
                  <div className="font-bold text-latte-800 mb-1.5">實戰拆解範例：<code>overall</code></div>
                  <div className="flex items-center gap-2 font-mono text-base font-black text-latte-700 mb-2">
                    <span>/</span>
                    <span className="text-latte-600 bg-latte-50 px-1.5 py-0.5 rounded">ˌoʊ</span>
                    <span>.</span>
                    <span className="text-cozyDark-300 bg-cream-100 px-1.5 py-0.5 rounded">vɚ</span>
                    <span>ˈ</span>
                    <span className="text-terracotta-600 bg-terracotta-50 px-1.5 py-0.5 rounded">ɑːl</span>
                    <span>/</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-cozyDark-400">
                    <li><code>ˌoʊ</code>：次重音開頭（稍用力發「歐-」）</li>
                    <li><code>.vɚ</code>：音節間的句點分隔號，輕音帶過（捲舌「ㄦ」）</li>
                    <li><code>ˈɑːl</code>：主重音最高音（用力發大口「啊~」）</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cream-200 bg-cream-50 flex items-center justify-between">
          <span className="text-xs text-cozyDark-200">
            💡 提示：在 Google 試算表直接填寫 KK 音標，系統也會 100% 完整呈現！
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-latte-600 hover:bg-latte-700 text-white text-xs font-bold rounded-xl transition shadow-xs active:scale-95"
          >
            我知道了
          </button>
        </div>

      </div>
    </div>
  );
}
