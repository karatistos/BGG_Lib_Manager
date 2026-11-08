# 🎲 BoardGameGeek Library Explorer & Game Night Manager

A responsive, zero-latency catalog explorer, visual filter, and game night assistant for personal board game collections exported from BoardGameGeek (BGG).

Built with **React 18 + TypeScript + Vite + Tailwind CSS + TanStack Table + Lucide Icons**.

---

## 🌟 Key Features

1. **Instant Search & Multi-Faceted Filtering**:
   - **Player Count & "Best At"**: Exact player counts with an optional toggle for community-voted "★ Best with X".
   - **Complexity Weight**: Color-coded BGG complexity brackets (Light <1.8, Med-Light 1.8–2.5, Med-Heavy 2.5–3.25, Heavy >3.25).
   - **Duration**: Filter by playtime (≤30m Quick, 31–60m Mid, 61–120m Main Event, >120m Epic).
   - **Language Dependence**: Official BGG ratings (Levels 1–5) plus a 1-click **"🌿 Language Neutral"** preset.
   - **Game Mechanics & Categories**: Filter by mechanics (*Worker Placement*, *Deck Building*, *Card Drafting*, *Set Collection*, *Push Your Luck*, etc.).
   - **Storage & Location Notes**: Real-time search across your personal storage locations (`invlocation`) and inventory tags.

2. **Dual View Modes**:
   - **Card Grid View**: Rich visual grid with crisp, uncropped box covers, complexity meters, player count pills, and direct BGG links.
   - **Dense Spreadsheet Table**: High-density table powered by `@tanstack/react-table` with column toggles and multi-column sorting.

3. **Centered Deep Inspection Modal**:
   - **Overview & BGG Details**: Full formatted description, 1–8+ player recommendation matrix, and mechanics cloud.
   - **Base Game & Expansions Hierarchy**: Automatically connects base games with their expansions in your collection with 1-click navigation.
   - **Personal Guides & Reference Files**: Attach rulebook PDFs, cheat sheets, or player aid images stored offline in your browser via **IndexedDB**.
   - **Personal Annotations**: Autosaving private notepad for setup tips, house rules, and card sleeve specifications.

4. **🎲 Game Night Picker ("Pick Game")**:
   - Configure your game group's constraints directly inside the modal (player count, max duration, complexity, language neutrality).
   - Animated roulette selector cycles through matching games to pick what to play tonight!

5. **📊 Collection Shelf Analytics**:
   - Visual distribution histograms for Player Counts, Complexity Weight, Publication Eras, and Top Mechanics.
   - Click any chart bar to immediately filter your collection.

6. **Instant Ingestion & Multi-User Support**:
   - Bakes in your default collection with pre-cached official box covers.
   - Drag & drop or upload any new `collection.csv` from BGG at any time.
   - All custom data, notes, and file attachments are stored locally in the browser.

---

## 🚀 Quick Start (Local)

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Build for production
```bash
npm run build
```

---

## 🌐 Sharing with Your Game Group (Free Cloud Hosting)

Because this application is 100% client-side, you can host it for free on **Vercel** or **Netlify**:

1. Push this folder to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) with GitHub.
3. Select your repository and click **Deploy**.
4. Share the generated link with your friends! Each person can use the app with their own BGG export by clicking **"Import CSV"**.
