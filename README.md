# GGC Underwriting Engine

AI-powered tool that takes seller financials in any format, normalizes them to GGC's underwriting methodology, and outputs analysis ready for the Excel model.

## Setup

### Option 1: Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your Anthropic API key:**
   ```bash
   export ANTHROPIC_API_KEY=your_key_here
   ```
   Or create a `.env` file:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

### Option 2: Deploy to Render/Railway/Heroku

1. Push this code to a GitHub repo
2. Connect to Render/Railway/Heroku
3. Set environment variable: `ANTHROPIC_API_KEY`
4. Deploy

## File Structure

```
/
├── public/
│   └── index.html    # Frontend UI
├── server.js         # Express backend (proxies Anthropic API)
├── package.json
└── README.md
```

## How It Works

1. **Upload** seller financials (Excel T-12, P&L, Rent Roll)
2. **Enter** property details (name, address, units, asking price)
3. **Click** Analyze & Normalize
4. **AI parses** the messy data and identifies income/expense line items
5. **Normalizes** according to GGC methodology:
   - Lot Rent: T3 Annualized
   - Other Income: T12
   - Expenses: T12 + 3% inflation
   - Management Fee: 5% of EGI
   - CapEx Reserve: $50/unit
   - Vacancy: 5% underwritten
6. **Flags** anomalies (high expense ratios, unusual per-unit costs, etc.)
7. **Export** to Excel in GGC's format

## For GitHub Pages (Static Only)

If you want to host on GitHub Pages without a backend, you'll need to either:
- Use a separate backend service (Render, Railway, etc.)
- Or demo the tool from within Claude.ai where the API is available

The frontend (index.html) expects the backend at `/api/analyze`.
