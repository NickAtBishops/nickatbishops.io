const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));

// API endpoint for analysis
app.post('/api/analyze', async (req, res) => {
    try {
        const { fileContents, propertyInfo } = req.body;

        const systemPrompt = `You are an expert MHC underwriting analyst for Gary Group Capital. Analyze seller financials and normalize to GGC methodology.

GGC METHODOLOGY:
- Lot Rent: T3 Annualized (trailing 3-month × 4)
- Other Income: T12 as-is
- Expenses: T12 + 3% inflation (multiply by 1.03)
- Management Fee: 5% of EGI (override seller)
- CapEx Reserve: $50/unit added on top
- Vacancy: 5% underwritten

EXPENSE CATEGORIES:
- RE Taxes, Insurance, Utilities (water/sewer/electric/gas/trash), Repair & Maintenance, Ground Maintenance, Management Fee, Payroll, Employee Allowance, G&A, Professional Fees, Advertising, CapEx Reserve

ANOMALIES TO FLAG:
- Expense ratio > 55%
- Utilities > $400/unit
- Payroll > $500/unit  
- R&M > $300/unit
- Missing expense categories
- Large YoY variances

Return ONLY valid JSON with this structure:
{
  "propertyName": "string",
  "units": number,
  "askingPrice": number,
  "income": {
    "grossPotentialRent": {"t12": number, "t3Ann": number, "ggcUW": number, "perUnit": number},
    "vacancy": {"seller": number, "ggcUW": number, "perUnit": number},
    "netRentalIncome": {"seller": number, "ggcUW": number, "perUnit": number},
    "utilityReimbursement": {"t12": number, "ggcUW": number, "perUnit": number},
    "homeRentIncome": {"t12": number, "ggcUW": number, "perUnit": number},
    "otherIncome": {"t12": number, "ggcUW": number, "perUnit": number},
    "effectiveGrossIncome": {"seller": number, "ggcUW": number, "perUnit": number}
  },
  "expenses": {
    "reTaxes": {"t12": number, "ggcUW": number, "perUnit": number},
    "insurance": {"t12": number, "ggcUW": number, "perUnit": number},
    "totalUtilities": {"t12": number, "ggcUW": number, "perUnit": number},
    "repairMaintenance": {"t12": number, "ggcUW": number, "perUnit": number},
    "managementFee": {"t12": number, "ggcUW": number, "rate": 0.05},
    "payroll": {"t12": number, "ggcUW": number, "perUnit": number},
    "generalAdmin": {"t12": number, "ggcUW": number, "perUnit": number},
    "capExReserve": {"ggcUW": number, "perUnit": 50},
    "totalExpenses": {"t12": number, "ggcUW": number, "perUnit": number}
  },
  "summary": {
    "netOperatingIncome": {"seller": number, "ggcUW": number, "perUnit": number},
    "capRate": number,
    "pricePerUnit": number,
    "expenseRatio": number
  },
  "anomalies": [{"type": "warning|info", "title": "string", "description": "string"}],
  "analysisNotes": "string"
}`;

        const userPrompt = `Analyze these seller financials for ${propertyInfo.name || 'the property'} (${propertyInfo.units || '?'} units, asking $${propertyInfo.askingPrice || '?'}):

${fileContents}

Return the normalized GGC underwriting analysis as JSON only.`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 8000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Anthropic API error:', error);
            return res.status(500).json({ error: 'API request failed' });
        }

        const data = await response.json();
        const text = data.content?.[0]?.text || '';
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            return res.json(result);
        }
        
        return res.status(500).json({ error: 'Could not parse response' });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`GGC Underwriting Engine running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
