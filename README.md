<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio / Netlify app

This contains everything you need to run your app locally and deploy it.

View your app in AI Studio: https://ai.studio/apps/41e1f832-0844-418e-82a4-d32e82c6965a

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Deploying to Netlify

Projek Sistem Latihan Industri Pelajar (SLIP) ini kini sedia untuk dideploy ke **Netlify**. Fail konfigurasi `netlify.toml` dan Netlify Serverless Function di `netlify/functions/api.ts` telah disediakan untuk mengurus API.

### Kaedah 1: Sambung ke GitHub / Git Repository (Disyorkan)

1. Muat naik (push) projek ini ke repositori **GitHub** anda.
2. Log masuk ke [Netlify App](https://app.netlify.com/).
3. Klik **"Add new site"** > **"Import an existing project"**.
4. Pilih **GitHub** dan pilih repositori `sistem-latihan-industri-pelajar-slip`.
5. Tetapan pembinaan (Build Settings) akan dikesan secara automatik:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
6. Pergi ke **Site configuration** > **Environment variables** dan tambah:
   - `GEMINI_API_KEY`: Kunci API Gemini anda.
7. Klik **"Deploy site"**.

### Kaedah 2: Guna Netlify CLI

1. Pasang Netlify CLI secara global jika belum ada:
   ```bash
   npm install -g netlify-cli
   ```
2. Log masuk ke akaun Netlify anda:
   ```bash
   netlify login
   ```
3. Bina projek dan lancarkan penempatan:
   ```bash
   npm run build
   ```
4. Deploy ke produksi:
   ```bash
   netlify deploy --prod
   ```
5. Tetapkan Kunci API Gemini di dashboard Netlify untuk fungsi AI.

### Kaedah 3: Manual Drag & Drop (Manual Deploy)

1. Bina projek secara tempatan:
   ```bash
   npm run build
   ```
2. Pergi ke halaman [Netlify Drop](https://app.netlify.com/drop).
3. Tarik & lepaskan (drag and drop) folder `dist` yang telah dibina.
