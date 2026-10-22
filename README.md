# 思語弟弟的陀螺世界 — 戰鬥陀螺X（BEYBLADE X）全商品目錄
非官方網站・粉絲EJ製作
網站：https://beyblade-x-ej.surge.sh/
## 檔案
- site/            ← 只有這個資料夾會發佈（index.html, style.css, app.js, data.js）
- site/data.js     ← 由 build.py 自動產生的全部商品資料（勿手改）
- data/config.json ← 匯率、檢查日期、已驗證的 Takara Tomy Mall 單品頁、manual_links 手動補連結
- scripts/         ← scrape_official.py（官方清單）、collect_tw.py（momo/PChome 抓取）、match_tw.py（比對台灣商品頁）
- raw/             ← 快取原始資料與 linkcheck.json
## 更新
1. 改匯率／日期：編輯 data/config.json 的 rate 與 checked_date
2. 重新抓官方與台灣通路：python3 build.py --refresh
3. 只重建：python3 build.py（會用 curl 重新檢查連結，404 自動移除）
4. 發佈：cd /workspace/beyblade-x && surge site beyblade-x-ej.surge.sh
## 外觀
- 明亮風主題（style.css）；系列配色以 CSS 變數定義：BX 藍 `--bx:#1d4ed8`、UX 橘紅 `--ux:#c2410c`、CX 紫 `--cx:#7e22ce`（各有 -soft / -line / -ink 淺色、邊框、文字色）
- index.html、style.css、app.js 為手寫檔案，build.py 只會重建 data.js
