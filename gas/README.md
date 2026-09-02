# ☁️ Google Sheets + GAS 雲端雙向同步設定教學

透過 Google 試算表 (Google Sheets) 與 Google Apps Script (GAS)，您可以享受：
1. **隨時在試算表編輯/整理多益單字**。
2. **網頁端一鍵將最新複習進度備份至雲端**。
3. **跨手機、平板、電腦無縫同步**。

---

## 🚀 3 步快速設定流程 (只需 2 分鐘)

### 步驟 1：建立 Google 試算表
1. 打開 [Google 雲端硬碟 (Google Drive)](https://drive.google.com/)。
2. 點擊左上角「**新增**」→「**Google 試算表**」，將試算表命名為 `My TOEIC Vocab`。

### 步驟 2：貼上 GAS 腳本
1. 在試算表上方選單，點擊「**擴充功能 (Extensions)**」→「**Apps Script**」。
2. 將編輯器內原本的程式碼清空。
3. 複製專案中 [`gas/Code.gs`](./Code.gs) 的全部程式碼並貼入。
4. 點擊上方的「💾 儲存」圖示。

### 步驟 3：部署為 Web 應用程式 (Web App)
1. 點擊右上角藍色的「**部署 (Deploy)**」按鈕 → 選擇「**新增部署作業 (New deployment)**」。
2. 點擊左側齒輪圖示 ⚙️，選擇「**網頁應用程式 (Web app)**」。
3. 設定如下：
   - **說明**：`TOEIC Vocab Sync API`
   - **執行身分 (Execute as)**：`我 (Me / 您的 Google 帳號)`
   - **誰可以存取 (Who has access)**：`任何人 (Anyone)` *(重要：必須選任何人，前端網頁才能跨網域發送請求)*
4. 點擊「**部署**」並完成權限授權。
5. 複製生成的 **網頁應用程式網址 (Web App URL)**（格式類似 `https://script.google.com/macros/s/AKfycbx.../exec`）。

### 步驟 4：在背單字系統中填入網址
1. 打開本多益背單字系統。
2. 點擊右上角「⚙️ **設定**」。
3. 在「Google Apps Script (GAS) Web App 網址」欄位中貼上您的網址，點擊「**儲存並測試連線**」。
4. 點擊「**一鍵備份至 Google Sheets**」或「**從 Google Sheets 同步**」即可！
