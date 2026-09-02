# TOEIC Cozy Vocab PWA (暖心多益英英自習室) 執行計畫 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一個專為多益 350→775 分設計的「暖心自習室」PWA 單字學習系統，支援英英浸潤記憶、自訂單字輸入自動補全、SM-2 智慧間隔複習、植物成長激勵與 Google Sheets (GAS) 雙向同步。

**Architecture:** 前端採用 Vite + React + Tailwind CSS，搭配 Lucide Icons 與 Google Fonts (Outfit / Plus Jakarta Sans) 打造溫馨手帳質感；採用 IndexedDB 實現 100% 離線可用，結合 Web Speech API 提供美/英雙口音發音；後端透過 Google Apps Script (GAS) 提供無伺服器雲端試算表雙向同步；支援 PWA 安裝至手機主畫面。

**Tech Stack:** React 18/19, Vite, Tailwind CSS, Lucide React, Canvas Confetti, Vitest, Google Apps Script (GAS), IndexedDB, Service Worker (PWA).

---

### Task 1: 專案基底建置與暖心 Design Tokens 設定
**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `public/manifest.json`, `public/sw.js`
- Create: `src/index.css`, `src/main.jsx`

- [ ] **Step 1: 初始化 Vite + React 專案與安裝依賴 (React, Tailwind CSS, Lucide, Canvas Confetti, Vitest)**
- [ ] **Step 2: 配置 Tailwind 色彩系統 (Cream, Caramel Latte, Sage Green, Terracotta) 與字體**
- [ ] **Step 3: 配置 PWA manifest.json 與 Service Worker 快取設定**
- [ ] **Step 4: 測試 `npm run build` 確認基底編譯成功**

---

### Task 2: SM-2 間隔重複記憶演算法 (SRS Engine) 與單元測試
**Files:**
- Create: `src/services/srsAlgorithm.js`
- Create: `src/services/srsAlgorithm.test.js`

- [ ] **Step 1: 編寫 SM-2 演算法單元測試 (測試 Again / Hard / Good / Easy 四種評分對 interval, repetition, easeFactor 的計算)**
- [ ] **Step 2: 執行測試確認失敗 (Red)**
- [ ] **Step 3: 實作 `srsAlgorithm.js` 核心邏輯 (計算 dueDate, nextInterval, newEaseFactor, 篩選今日待複習單字)**
- [ ] **Step 4: 執行測試確認全部通過 (Green)**

---

### Task 3: 本地 IndexedDB 資料庫與多益 350→775 種子單字庫
**Files:**
- Create: `src/data/toeicSeedWords.js`
- Create: `src/services/storageService.js`

- [ ] **Step 1: 建立多益 350→775 高頻精選種子單字庫（含 IPA、簡易英英、商務搭配詞、例句、繁中考點）**
- [ ] **Step 2: 實作 `storageService.js` (IndexedDB 初始化、CRUD、批次匯入、匯出 JSON/CSV、自動載入種子庫)**
- [ ] **Step 3: 驗證本地資料持久化與快取恢復機制**

---

### Task 4: 字典自動補全服務與 Web Speech TTS 發音模組
**Files:**
- Create: `src/services/dictionaryService.js`
- Create: `src/services/ttsService.js`

- [ ] **Step 1: 實作 `dictionaryService.js` (支援單字聯網解析音標、英英定義、搭配詞、例句與中文翻譯)**
- [ ] **Step 2: 實作 `ttsService.js` (封裝 Web Speech API，支援美式 en-US / 英式 en-GB 發音、語速調節)**
- [ ] **Step 3: 驗證發音播放與字典解析 fallback 機制**

---

### Task 5: 沉浸式英英單字卡組件 (WordCard)
**Files:**
- Create: `src/components/WordCard.jsx`

- [ ] **Step 1: 實作單字卡視覺介面 (單字、IPA、TTS 按鈕、Simple Definition、Collocation、Business Example)**
- [ ] **Step 2: 實作隨需揭曉中文機制 (毛玻璃遮罩、點擊或 Space 鍵平滑淡入)**
- [ ] **Step 3: 實作 4 個評分按鈕 (Again/Hard/Good/Easy) 與鍵盤快捷鍵 (1, 2, 3, 4, Space, H, R)**
- [ ] **Step 4: 整合音效與卡片翻動微動畫**

---

### Task 6: 智能單字錄入與批次匯入組件 (AddWordModal)
**Files:**
- Create: `src/components/AddWordModal.jsx`

- [ ] **Step 1: 實作單筆輸入介面 (輸入單字一鍵自動聯網解析，支援手動微調編輯)**
- [ ] **Step 2: 實作多行批次快速貼上匯入介面**
- [ ] **Step 3: 整合單字儲存與標籤分類 (HR, Finance, Marketing, Contracts, 錯題本)**

---

### Task 7: 暖心小植物養成與多益 775 成長看板 (PlantGrowth & StatsDashboard)
**Files:**
- Create: `src/components/PlantGrowth.jsx`
- Create: `src/components/StatsDashboard.jsx`

- [ ] **Step 1: 實作小植物成長激勵模組 (幼芽→盆栽→開花灌木→常青樹，澆水動畫與灑花特效)**
- [ ] **Step 2: 實作學習數據看板 (連續打卡 Streak、今日完成率、掌握單字數、多益預估分數進度條 350→775)**

---

### Task 8: Google Sheets + GAS 雲端雙向同步與設定組件
**Files:**
- Create: `gas/Code.gs`
- Create: `gas/README.md`
- Create: `src/services/gasSyncService.js`
- Create: `src/components/SettingsModal.jsx`

- [ ] **Step 1: 編寫 Google Apps Script 雲端試算表腳本 `Code.gs` 與圖文設定教學**
- [ ] **Step 2: 實作前端 `gasSyncService.js` (連線測試、一鍵上傳備份至 Google Sheets、一鍵從 Sheet 下載)**
- [ ] **Step 3: 實作 `SettingsModal.jsx` (GAS 網址配置、手動備份/還原、語音設定、重設資料)**

---

### Task 9: 主介面整合、測驗模式與 PWA 離線支援
**Files:**
- Create: `src/components/QuizMode.jsx`
- Create: `src/components/Navbar.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 實作搭配詞填空與聽音拼字測驗模組 (QuizMode)**
- [ ] **Step 2: 整合導航欄 (自習複習 / 單字總覽與搜尋 / 測驗練習 / 成長花園 / 設定)**
- [ ] **Step 3: 整合 Service Worker 實現 100% 離線操作與安裝提示**

---

### Task 10: 完整驗證、構建與 GitHub Pages 自動部署
**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: 執行自動化測試與生產環境建置 (`npm run test`, `npm run build`)**
- [ ] **Step 2: 驗證所有核心使用者流程 (新增單字→英英複習→評分排程→小植物成長→Google Sheets 同步)**
- [ ] **Step 3: 設定 GitHub Actions 工作流程，支援 push 自動發布至 GitHub Pages**
