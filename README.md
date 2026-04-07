# GGC Underwriting Analysis Tool

Internal underwriting analysis tool for Gary Group Capital.

## Deploy to Render (free, ~5 minutes)

### Step 1 — Push to GitHub
1. Create a new repo at github.com (click New Repository, name it `ggc-underwriting`, set to Private)
2. Open Terminal and run:
```
cd ggc-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ggc-underwriting.git
git push -u origin main
```

### Step 2 — Deploy on Render
1. Go to render.com and sign up (free)
2. Click **New → Web Service**
3. Connect your GitHub account and select the `ggc-underwriting` repo
4. Fill in these settings:
   - **Name:** ggc-underwriting
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Click **Add Environment Variable**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your Anthropic API key (from console.anthropic.com)
6. Click **Create Web Service**

Render builds and deploys in ~2 minutes. You get a URL like:
`https://ggc-underwriting.onrender.com`

Share that URL with anyone — no setup needed on their end.

## Run locally
```
npm install
ANTHROPIC_API_KEY=your_key_here node server.js
```
Then open http://localhost:3000
