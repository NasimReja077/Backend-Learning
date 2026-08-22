import express from 'express';
import chalk from 'chalk';
import dotenv from 'dotenv';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

dotenv.config();

const app = express();
const PORT = 5000;
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || 'mistral-small-latest';

app.use(express.json());

// ====================== PROMPT BUILDER ======================
function buildReviewAnalysisPrompt(reviewText) {
  return `
You are a smart review analysis assistant.

Context:
You need to fully analyze a customer review for sentiment, inappropriate language, and key points.

Task:
Perform a complete analysis of the review.

Input Data:
"""
${reviewText}
"""

Output Format:
1. Sentiment: [Positive / Negative / Neutral / Mixed]
2. Contains Bad Words: [Yes / No]
3. Bad Words (if any): [list]
4. Positive Points:
   - 
5. Negative Points:
   - 
6. Short Summary: [2-3 sentences]
7. Recommendation: [Approve / Flag / Reject]

Return only valid JSON with these keys:
sentiment, containsBadWords, badWords, positivePoints, negativePoints, summary, recommendation
`.trim();
}

// ====================== SIMULATED ANALYSIS ======================
// (In real project, replace this with OpenAI / Grok / Claude API call)
function simulateAnalysis(reviewText) {
  const lower = reviewText.toLowerCase();

  const badWordsList = ['stupid', 'hate', 'worst', 'terrible', 'awful', 'shit', 'damn'];
  const foundBadWords = badWordsList.filter(word => lower.includes(word));

  let sentiment = 'Neutral';
  if (lower.includes('love') || lower.includes('great') || lower.includes('amazing') || lower.includes('excellent')) {
    sentiment = 'Positive';
  } else if (lower.includes('bad') || lower.includes('hate') || lower.includes('worst') || lower.includes('terrible')) {
    sentiment = 'Negative';
  }

  return {
    sentiment,
    containsBadWords: foundBadWords.length > 0 ? 'Yes' : 'No',
    badWords: foundBadWords.length > 0 ? foundBadWords : ['None'],
    positivePoints: sentiment === 'Positive' ? ['Customer is happy', 'Good experience mentioned'] : ['None clearly mentioned'],
    negativePoints: sentiment === 'Negative' ? ['Customer is unhappy', 'Complaint found'] : ['None clearly mentioned'],
    summary: `The review appears to be ${sentiment.toLowerCase()}.`,
    recommendation: foundBadWords.length > 0 ? 'Flag' : sentiment === 'Negative' ? 'Flag' : 'Approve'
  };
}

async function analyzeReview(reviewText) {
  const prompt = buildReviewAnalysisPrompt(reviewText);

  if (!process.env.MISTRAL_API_KEY) {
    return { prompt, analysis: simulateAnalysis(reviewText), provider: 'simulated' };
  }

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You analyze customer reviews and return structured JSON.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Mistral API error (${response.status}): ${details}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Mistral returned an empty response');
  }

  return { prompt, analysis: JSON.parse(content), provider: `mistral (${MISTRAL_MODEL})` };
}

// ====================== TERMINAL PRINTER (using Chalk) ======================
function printAnalysisInTerminal(review, analysis, prompt) {
  console.log('\n' + chalk.bgCyan.black(' REVIEW ANALYSIS SYSTEM '));
  console.log(chalk.gray('─'.repeat(60)));

  console.log(chalk.yellow.bold('\nOriginal Review:'));
  console.log(chalk.white(review));

  console.log(chalk.yellow.bold('\nGenerated Prompt (sent to LLM):'));
  console.log(chalk.gray(prompt.substring(0, 300) + '...\n'));

  console.log(chalk.cyan.bold('Analysis Result:'));
  console.log(chalk.green(`Sentiment           : ${analysis.sentiment}`));
  console.log(chalk.red(`Contains Bad Words  : ${analysis.containsBadWords}`));
  console.log(chalk.red(`Bad Words           : ${analysis.badWords.join(', ')}`));
  console.log(chalk.green(`Positive Points     : ${analysis.positivePoints.join(' | ')}`));
  console.log(chalk.red(`Negative Points     : ${analysis.negativePoints.join(' | ')}`));
  console.log(chalk.blue(`Summary             : ${analysis.summary}`));
  console.log(chalk.magenta(`Recommendation      : ${analysis.recommendation}`));

  console.log(chalk.gray('\n' + '─'.repeat(60)));
}

// ====================== ROUTES ======================

app.get('/', (req, res) => {
  res.json({
    message: 'Review Analyzer API is running!',
    endpoint: 'POST /api/analyze-review'
  });
});

app.post('/api/analyze-review', async (req, res) => {
  const { review } = req.body;

  if (!review || review.trim() === '') {
    return res.status(400).json({ error: 'Review text is required' });
  }

  try {
    const { prompt, analysis, provider } = await analyzeReview(review);

    printAnalysisInTerminal(review, analysis, prompt);

    res.json({ success: true, provider, promptUsed: prompt, analysis });
  } catch (error) {
    console.error(chalk.red(error.message));
    res.status(502).json({ error: 'Review analysis failed', details: error.message });
  }
});

async function startTerminalInput() {
  if (!input.isTTY) return;

  const terminal = readline.createInterface({ input, output });
  console.log(chalk.yellow('Type a review and press Enter. Type "exit" to quit.'));

  try {
    while (true) {
      const review = (await terminal.question(chalk.cyan('\nReview: '))).trim();
      if (review.toLowerCase() === 'exit') break;
      if (!review) continue;

      try {
        const { prompt, analysis } = await analyzeReview(review);
        printAnalysisInTerminal(review, analysis, prompt);
      } catch (error) {
        console.error(chalk.red(`Analysis failed: ${error.message}`));
      }
    }
  } finally {
    terminal.close();
  }
}

// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log(chalk.bgGreen.black(`\n Server running on http://localhost:${PORT} `));
  console.log(chalk.cyan('Ready to analyze reviews...\n'));
  startTerminalInput();
});