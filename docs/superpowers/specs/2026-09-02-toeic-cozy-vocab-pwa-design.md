# TOEIC Cozy Vocab PWA (暖心多益英英單字自習室) - 系統設計規範 (Design Spec)

## 1. 專案背景與目標 (Background & Goals)
- **目標使用者**：多益目前 350 分，目標跨越至 775 分（藍色證書 B2 等級）。
- **核心痛點**：
  1. 傳統「英翻中」死背導致閱讀速度過慢、聽力反應不及。
  2. 缺乏商務搭配詞 (Collocations) 與商務真實語境。
  3. 背單字枯燥無味、缺乏動力與正向回饋。
- **解決方案**：
  - 打造一套**「暖心自習室 (Cozy Study Nook)」**風格的 PWA 網頁單字系統。
  - 採用**「英英思維 (English-First Immersion)」**，首眼呈現簡易英英解釋、商務搭配詞與例句，中文按需揭曉。
  - 支援**「自訂單字快速輸入與自動補全」**，並整合 **Google Sheets + GAS 雙向雲端同步** 與 **本機 IndexedDB 離線快取**。
  - 內建 **SM-2 間隔重複記憶演算法 (SRS)** 與 **多益 350→775 分級種子題庫**。

---

## 2. 系統架構設計 (System Architecture)

```mermaid
graph TD
    subgraph 雲端資料庫
        GS[Google Sheets 試算表] <-->|GET / POST JSON| GAS[Google Apps Script Web App]
    end

    subgraph 前端 PWA 應用 (React + Vite + Tailwind CSS)
        UI[暖心手帳 UI 介面]
        
        subgraph 核心模組
            Card[英英浸潤式單字卡<br/>WordCard]
            Input[智能錄入與自動補全<br/>AddWordModal]
            Plant[植物成長與連勝激勵<br/>PlantGrowth]
            Quiz[搭配詞與聽寫測驗<br/>QuizMode]
            Stats[多益 775 進度看板<br/>StatsDashboard]
        end

        subgraph 底層服務層
            SRS[SM-2 排程排程器]
            Dict[字典查詢服務 FreeDict / SeedData]
            TTS[Web Speech API 真人雙口音發音]
            Sync[GAS 雙向同步服務]
            DB[(IndexedDB 本地儲存庫)]
        end
    end

    UI --> Card & Input & Plant & Quiz & Stats
    Card & Quiz --> SRS & TTS
    Input --> Dict & DB
    SRS --> DB
    Sync <--> GAS
    Sync <--> DB
```

---

## 3. 核心功能規格 (Detailed Feature Specifications)

### 3.1 沉浸式英英單字卡 (English-First Immersion Card)
- **視覺呈現**：
  - 正面首要元素：目標單字 (Word)、音標 (IPA)、詞性 (Part of Speech)、美/英雙口音發音按鈕。
  - **Simple English Definition**：用 2,000 核心詞彙撰寫的簡易英英釋義。
  - **TOEIC Collocation (黃金搭配詞)**：凸顯高頻考點片語（如 `comply with regulations`）。
  - **Business Example (商務情境例句)**：附帶可點擊發音的商務實例句。
- **隨需揭曉中文 (Reveal on Demand)**：
  - 中文多益考點釋義與例句翻譯預設以毛玻璃效果模糊或摺疊。
  - 支援點擊卡片、按鈕或空白鍵 (`Space`) 平滑淡入揭曉。
- **評分反饋操作**：
  - `Again (忘記)` / `Hard (困難)` / `Good (良好)` / `Easy (簡單)` 四個直覺按鈕，對應快捷鍵 `1`, `2`, `3`, `4`。

### 3.2 自訂單字輸入與自動補全 (Smart Custom Input & Auto-Enrichment)
- **單筆輸入 (Quick Add)**：
  - 使用者僅需輸入英文單字，點擊「自動解析」或按下 Enter。
  - 系統自動呼叫字典服務解析：音標、英英釋義、搭配詞、例句與繁體中文。
  - 允許使用者在儲存前手動自由編輯任何欄位。
- **批次匯入 (Batch Import)**：
  - 支援一次貼上多行單字（以換行分隔），系統批次處理並加入生詞庫。
- **自訂分類與標籤 (Tags & Levels)**：
  - 支援標記分類（如：`人事HR`、`採購合約`、`商務行銷`、`財務會計`、`我的錯題`）。

### 3.3 SM-2 間隔重複記憶演算法 (SRS Engine)
- **資料模型**：
  - `interval`：下次複習間隔天數（初始為 1）。
  - `repetition`：連續成功複習次數（初始為 0）。
  - `easeFactor`：難易度因子（初始為 2.5，最低 1.3）。
  - `dueDate`：預計複習日期 (YYYY-MM-DD)。
  - `lastReviewed`：上次複習時間戳記。
  - `state`：單字狀態 (`new` / `learning` / `review` / `mastered`)。
- **演算法計算規則**：
  - 評分等級 $q \in \{1: \text{Again}, 2: \text{Hard}, 3: \text{Good}, 4: \text{Easy}\}$。
  - 若 $q < 3$：重置 `repetition = 0`，`interval = 1`。
  - 若 $q \ge 3$：
    - 若 `repetition == 0`，`interval = 1`。
    - 若 `repetition == 1`，`interval = 3`（若為 Easy 則為 6）。
    - 若 `repetition > 1`，$\text{interval} = \lceil \text{interval} \times \text{easeFactor} \rceil$。
    - `repetition += 1`。
  - 更新難易度因子：$\text{easeFactor} = \max(1.3, \text{easeFactor} + (0.1 - (4 - q) \times (0.08 + (4 - q) \times 0.02)))$。

### 3.4 溫馨成長激勵與學習數據 (Cozy Motivation & Analytics)
- **多益小植物養成 (Plant Growth Milestone)**：
  - 今日完成複習單字數達標時，小植物澆水成長。
  - 根據已掌握單字量與正確率，換算「多益預估分數（350~775+）」。
  - 植物成長階梯：
    1. 350~499分：種子發芽 (Sprout)
    2. 500~649分：青翠小盆栽 (Potted Plant)
    3. 650~749分：開花山茶花/咖啡樹 (Flowering Shrub)
    4. 775+分：茂盛金色商務常青樹 (Golden Evergreen Tree)
- **打卡熱力圖 (Daily Streak)**：連續學習天數紀錄，給予溫馨鼓勵語錄。

### 3.5 Google Sheets + GAS 雙向雲端備份
- 提供獨立 `gas/Code.gs` 腳本，使用者在自己的 Google 雲端硬碟建立試算表並部署為 Web 應用程式。
- 前端設定介面支援填入 GAS Web App URL，提供：
  - **一鍵匯出 / 備份到 Google Sheets**。
  - **一鍵從 Google Sheets 同步回本機**。
  - **離線優先機制 (Offline First)**：無網路或未設定 GAS 時，100% 依賴本地 IndexedDB 流暢運行。

---

## 4. 介面設計規範 (UI/UX & Design Tokens)

### 4.1 色彩計畫 (Warm Palette)
- **背景底色 (Surface/Background)**：
  - Primary Background: `#FAF7F2` (Warm Cream)
  - Card Background: `#FFFFFF` (Pure Paper White)
  - Card Alt / Secondary Surface: `#F4EFE6` (Soft Oat Linen)
- **主要強調色 (Accent & Brand)**：
  - Primary Brand (焦糖拿鐵棕): `#8C5E3C` / `#6F4627`
  - Warm Amber (暖陽琥珀金): `#E59866` / `#F39C12`
  - Calm Sage Green (抹茶/鼠尾草綠 - 掌握/答對): `#5E937A`
  - Soft Terracotta (陶土暖紅 - 需複習/忘記): `#D96B5B`
- **文字階層 (Typography)**：
  - Headings & English Words: `Outfit`, `Plus Jakarta Sans`, `Inter`, sans-serif
  - Body & Traditional Chinese: System Font, `-apple-system`, `BlinkMacSystemFont`, `"Noto Sans TC"`, `"Microsoft JhengHei"`, sans-serif

### 4.2 互動微動畫 (Micro-Interactions)
- 翻卡切換：柔和 3D 卡片翻轉或淡入淡出（0.25s ease-out）。
- 中文揭曉：平滑高斯模糊過渡 (blur 12px -> 0px) 與透明度淡入。
- 語音按鈕：點擊時有波紋漣漪微反饋與播放中發光效果。

---

## 5. 測試與驗證計畫 (Verification Plan)
1. **單元測試 (Unit Tests)**：
   - 驗證 `srsAlgorithm.js` 之 SM-2 四種評分在不同 repetition 次數下的 interval 與 easeFactor 計算正確性。
   - 驗證 `storageService.js` 之 IndexedDB CRUD 與快取恢復能力。
2. **端到端流程驗證 (End-to-End Verification)**：
   - 使用者輸入單字 -> 自動解析詞條 -> 加入生詞本。
   - 翻卡複習 -> 揭曉中文 -> 點擊評分 -> 檢查下次到期日與植物成長數值變化。
   - 離線模擬 -> 斷網環境下正常進行複習與新增 -> 聯網後同步測試。
   - PWA 安裝檢測 -> manifest.json 與 Service Worker 快取驗證。
