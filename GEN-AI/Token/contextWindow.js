import express from 'express';
import { encode, decode, countTokens } from 'gpt-tokenizer';

const app = express();
const PORT = 3000;

app.use(express.json());

// ========== Helper Functions ==========

/**
 * Truncate text so it fits inside the context window
 */
function truncateToContextWindow(text, maxTokens) {
  const tokens = encode(text);

  if (tokens.length <= maxTokens) {
    return {
      text,
      tokens: tokens.length,
      truncated: false
    };
  }

  // Keep only the last N tokens (most recent information)
  const truncatedTokens = tokens.slice(-maxTokens);
  const truncatedText = decode(truncatedTokens);

  return {
    text: truncatedText,
    tokens: truncatedTokens.length,
    truncated: true,
    originalTokens: tokens.length
  };
}

/**
 * Full context window analysis
 */
function analyzeContextWindow(text = '', maxContext = 128000) {
  const tokenCount = countTokens(text);
  const remaining = maxContext - tokenCount;
  const usagePct = maxContext > 0 ? (tokenCount / maxContext) * 100 : 0;

  let status = 'ok';
  let message = 'Fits comfortably inside the context window.';

  if (tokenCount > maxContext) {
    status = 'exceeded';
    message = 'Exceeds context window. Text should be truncated.';
  } else if (usagePct > 85) {
    status = 'warning';
    message = 'Very high usage. Leave space for the model response.';
  }

  return {
    originalCharacters: text.length,
    originalTokens: tokenCount,
    maxContextWindow: maxContext,
    remainingTokens: remaining,
    usagePercentage: Number(usagePct.toFixed(2)),
    status,
    message
  };
}

// ========== Routes ==========

// Home
app.get('/', (req, res) => {
  res.json({
    message: 'Context Window Demo API',
    endpoints: {
      'POST /analyze': 'Analyze text against context window',
      'POST /truncate': 'Truncate text to fit inside context window'
    }
  });
});

// 1. Analyze only
app.post('/analyze', (req, res) => {
  const { text = '', maxContext = 128000 } = req.body;

  const result = analyzeContextWindow(text, Number(maxContext));
  res.json(result);
});

// 2. Truncate to fit context window
app.post('/truncate', (req, res) => {
  const { text = '', maxContext = 128000 } = req.body;

  const analysis = analyzeContextWindow(text, Number(maxContext));
  const truncated = truncateToContextWindow(text, Number(maxContext));

  res.json({
    analysis,
    result: {
      truncated: truncated.truncated,
      finalTokens: truncated.tokens,
      finalText: truncated.text,
      originalTokens: truncated.originalTokens || truncated.tokens
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});