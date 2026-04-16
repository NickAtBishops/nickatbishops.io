# GGC Deal Engine

AI-Powered MHC & RV Park Underwriting Automation

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Partner's Browser                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              index.html (GitHub Pages)                  ││
│  │  - Upload T-12, Rent Roll, Offering Memo                ││
│  │  - Enter property info                                  ││
│  │  - Claude API analyzes documents (runs in browser)      ││
│  │  - Click to download Excel/Memo                         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              │ POST JSON data
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Vercel Serverless                         │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │  /api/generate-excel │  │  /api/generate-memo │          │
│  │  (Python + openpyxl) │  │  (Python + docx)    │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                              │                               │
│              Returns formatted .xlsx / .docx                 │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### Step 1: Create GitHub Repository

1. Create a new repo on GitHub (e.g., `ggc-deal-engine`)
2. Push all these files to the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/ggc-deal-engine.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages (for frontend)

1. Go to your repo → Settings → Pages
2. Source: "Deploy from a branch"
3. Branch: `main`, folder: `/ (root)`
4. Your frontend will be at: `https://YOUR_USERNAME.github.io/ggc-deal-engine/`

### Step 3: Deploy to Vercel (for backend)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project" → Import your `ggc-deal-engine` repo
3. Vercel will auto-detect the Python functions
4. Click "Deploy"
5. Your API will be at: `https://ggc-deal-engine.vercel.app`

### Step 4: Connect Frontend to Backend

1. Open the deployed GitHub Pages site
2. Enter your backend URL in the "Backend URL" field: `https://ggc-deal-engine.vercel.app`
3. Click "Save"

### Step 5: Add Your API Key

1. Enter your Anthropic API key
2. Click "Save"

## Usage

1. **Upload Documents**: Drag & drop T-12, Rent Roll, or Offering Memo (PDF/Excel)
2. **Enter Property Info**: Address, units, asking price
3. **Click Analyze**: Claude parses documents, researches comps, analyzes market
4. **Download Results**: 
   - Excel Model (formatted with all GGC tabs)
   - Investment Memo (Word doc with all sections)
   - Raw JSON (for debugging)

## File Structure

```
ggc-deal-engine/
├── index.html              # Frontend (GitHub Pages)
├── vercel.json            # Vercel configuration
├── requirements.txt       # Python dependencies
├── api/
│   ├── generate-excel.py  # Excel generator endpoint
│   └── generate-memo.py   # Word memo generator endpoint
├── templates/
│   └── GGC_UW_Template.xlsx  # Formatted Excel template
└── README.md
```

## Custom Domain (Optional)

If you have a custom domain:

1. **GitHub Pages**: Settings → Pages → Custom domain
2. **Vercel**: Settings → Domains → Add your domain

Then update the Backend URL in the frontend to point to your Vercel domain.

## GGC Underwriting Methodology

The tool applies these normalizations:

| Item | Rule |
|------|------|
| Lot Rent | T3 annualized (T3 × 4) |
| Other Income | T12 as reported |
| Expenses | T12 + 3% inflation |
| Management Fee | 5% of EGI |
| CapEx Reserve | $50/unit |
| Vacancy | 5% minimum |

## Troubleshooting

**Excel/Memo download not working?**
- Check that the Backend URL is correct
- Check browser console for CORS errors
- Verify Vercel deployment succeeded

**Analysis failing?**
- Verify API key is valid
- Check that documents contain readable text
- Try with a simpler document first

**Formatting issues?**
- The Excel template is embedded in the backend
- Check that templates/GGC_UW_Template.xlsx exists
