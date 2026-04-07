const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are an expert MHC (Manufactured Housing Community) and commercial real estate underwriter with deep experience at firms like Berkadia and PNC Real Estate. You analyze rent rolls and P&L statements for mobile home parks and RV campgrounds.

When given a document (rent roll, P&L, or investor deck), extract and return a JSON object with EXACTLY this structure. If a value cannot be determined, use null. Do not include any text outside the JSON.

{
  "propertyName": "string or null",
  "location": "string or null",
  "assetType": "MHC or RV or Mixed or null",
  "totalSites": number or null,
  "occupiedSites": number or null,
  "occupancyPct": number or null,
  "avgLotRent": number or null,
  "grossPotentialRent": number or null,
  "effectiveGrossIncome": number or null,
  "totalExpenses": number or null,
  "expenseRatio": number or null,
  "noi": number or null,
  "purchasePrice": number or null,
  "pricePerSite": number or null,
  "capRate": number or null,
  "debtAmount": number or null,
  "debtRate": number or null,
  "ltv": number or null,
  "projectedIRR": number or null,
  "projectedCoC": number or null,
  "equityMultiple": number or null,
  "holdPeriod": number or null,
  "pohPct": number or null,
  "proForma": [
    { "year": "UW", "noi": number or null, "occupancy": number or null, "avgRent": number or null },
    { "year": "Yr 1", "noi": number or null, "occupancy": number or null, "avgRent": number or null },
    { "year": "Yr 2", "noi": number or null, "occupancy": number or null, "avgRent": number or null },
    { "year": "Yr 3", "noi": number or null, "occupancy": number or null, "avgRent": number or null },
    { "year": "Yr 4", "noi": number or null, "occupancy": number or null, "avgRent": number or null },
    { "year": "Yr 5", "noi": number or null, "occupancy": number or null, "avgRent": number or null }
  ],
  "flags": [
    { "severity": "red|yellow|green", "category": "string", "text": "string" }
  ],
  "narrative": "2-3 sentence executive summary of the deal including key strengths and risks",
  "expenseLineItems": [
    { "name": "string", "amount": number }
  ]
}

For flags, identify:
- RED: Serious risks (very low DSCR, high POH%, major deferred maintenance, below-market occupancy with no clear plan, self-dealing expenses, suspicious financials)
- YELLOW: Watch items (above-average expense ratio, single large tenant concentration, lease expirations, market concerns)
- GREEN: Positive highlights (assumable debt, strong MSA, below-market rents with upside, infill opportunity)

Be thorough and flag anything a professional underwriter would note.`;

app.post('/api/analyze', async (req, res) => {
  const { fileData, mediaType } = req.body;

  if (!fileData) {
    return res.status(400).json({ error: 'No file data provided.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: mediaType || 'application/pdf', data: fileData }
            },
            {
              type: 'text',
              text: 'Please analyze this document and return the JSON underwriting summary as instructed.'
            }
          ]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content?.map(c => c.text || '').join('') || '';
    res.json({ text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Catch-all: serve frontend for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
