# Vercel Deployment Guide for TruthLine

TruthLine is fully prepared for 1-click deployment on **Vercel** with complete SPA routing rewrites, serverless API handling, and a dedicated 404 page.

---

## Method 1: Deploy Full-Stack (Frontend + Serverless API) [Recommended]

### 1. Push to GitHub
Commit and push your project to a GitHub repository:
```bash
git add .
git commit -m "Deploy TruthLine to Vercel"
git push origin main
```

### 2. Import into Vercel
1. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. Select your repository.
3. Keep the **Root Directory** as `./` (the root).
4. Vercel will automatically detect `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build --workspace=frontend`
   - **Output Directory**: `frontend/dist`

### 3. Configure Environment Variables in Vercel
Under the **Environment Variables** section in Vercel, add:
- `TAVILY_API_KEY`: `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` (or your personal key)
- `GOOGLE_FACT_CHECK_API_KEY`: `AIzaSyA7a9IInko3ZHVomLrhdZZnIyHF0r2DKhQ` (Optional)
- `NODE_ENV`: `production`

Click **Deploy**! Vercel will build the frontend and serve both the SPA and `/api/*` serverless functions.

---

## Method 2: Deploy Frontend-Only on Vercel

If you prefer to host your Express backend on a separate provider (such as Railway, Render, or Fly.io):

1. Set **Root Directory** in Vercel project settings to `frontend`.
2. Add the environment variable:
   - `VITE_API_URL`: `https://your-backend-domain.com/api`
3. Click **Deploy**. Vercel will build `frontend/` using [`frontend/vercel.json`](file:///e:/ChromEx/frontend/vercel.json) with SPA rewrites.

---

## Features Configured for Vercel

1. **SPA Rewrites**: All deep routes (like `/results/:jobId` and `/history`) rewrite to `index.html` so refreshing pages never causes Vercel 404 errors.
2. **Dedicated 404 Page**: Any unmatched client route renders the custom TruthLine 404 page with quick navigation back to the verification engine.
3. **Serverless SQLite Compatibility**: In Vercel serverless functions, SQLite and file uploads automatically redirect to `/tmp/truthline.db` to avoid read-only filesystem errors.
