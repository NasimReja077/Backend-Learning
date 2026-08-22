import express from 'express';
import { countTokens } from 'gpt-tokenizer';

const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// ========== Helper Function ==========
function analyzeContext(text, maxContext = 128000) {
  const tokens = countTokens(text || '');
  const remaining = maxContext - tokens;
  const usagePct = maxContext > 0 ? (tokens / maxContext) * 100 : 0;

  let status = 'ok';
  let message = 'Comfortable margin left for generation.';

  if (tokens > maxContext) {
    status = 'exceeded';
    message = 'Exceeds context window! Model will truncate or reject.';
  } else if (usagePct > 80) {
    status = 'warning';
    message = 'High usage — leave room for the model\'s response.';
  }

  return {
    characters: text.length,
    tokens,
    maxContext,
    remaining,
    usagePercentage: Number(usagePct.toFixed(2)),
    status,
    message
  };
}

// ========== Routes ==========

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'LLM Context Window Simulator API',
    endpoints: {
      'POST /analyze': 'Analyze text against a context window',
      'GET /analyze?text=...&maxContext=128000': 'Same using query params'
    }
  });
});

// Main endpoint - POST
app.post('/analyze', (req, res) => {
  try {
    const { text = '', maxContext = 128000 } = req.body;

    if (typeof text !== 'string') {
      return res.status(400).json({ error: 'text must be a string' });
    }

    const result = analyzeContext(text, Number(maxContext));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

// Optional: GET version (useful for quick testing)
app.get('/analyze', (req, res) => {
  const text = req.query.text || '';
  const maxContext = Number(req.query.maxContext) || 128000;

  const result = analyzeContext(text, maxContext);
  res.json(result);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});