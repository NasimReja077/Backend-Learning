// server/routes/save.js
import { Router } from 'express';
const router = Router();

import { ChatMistralAI } from '@langchain/mistralai';
import Save from '../models/Save.js';
import extractContent from '../utils/extractContent.js';

const mistral = new ChatMistralAI({
  apiKey: process.env.MISTRAL_API_KEY,
  model: 'mistral-large-latest',
  temperature: 0.3,           // lowered → more reliable JSON
  maxTokens: 500,
});

const auth = (req, res, next) => {
  // TODO: Replace with real JWT verification
  req.user = { id: '67b123456789abcdef123456' };
  if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

router.post('/save', auth, async (req, res) => {
  const { url } = req.body;
  const userId = req.user.id;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Valid URL is required' });
  }

  try {
    const extracted = await extractContent(url);

    if (!extracted?.text?.trim()) {
      return res.status(400).json({
        error: 'Could not extract meaningful content',
        type: extracted.type
      });
    }

    const prompt = `
You are an intelligent personal knowledge curator.
From the content below, return **ONLY** valid JSON (no markdown, no explanation):

{
  "title": "short catchy title — max 80 characters",
  "tags": ["tag1", "tag2", ...]   // 5-10 relevant, lowercase, kebab-case tags
}

Content:
${extracted.text.substring(0, 14000).trim()}
`.trim();

    const aiMessage = await mistral.invoke([
      { role: 'user', content: prompt }
    ]);

    let rawOutput = aiMessage.content?.trim() || '';

    // Aggressive cleaning for common LLM issues
    rawOutput = rawOutput
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let aiData;
    try {
      aiData = JSON.parse(rawOutput);
    } catch (parseErr) {
      console.error('JSON parse failed. Raw output:', rawOutput.substring(0, 400));
      return res.status(500).json({
        error: 'AI did not return valid JSON',
        rawPreview: rawOutput.substring(0, 300) + '...'
      });
    }

    // Normalize
    const title = String(aiData.title || extracted.defaultTitle || 'Untitled')
      .trim()
      .substring(0, 120);

    const tags = Array.isArray(aiData.tags)
      ? aiData.tags
          .filter(t => typeof t === 'string' && t.trim())
          .map(t => t.trim().toLowerCase().replace(/\s+/g, '-'))
          .slice(0, 10)
      : [];

    const newSave = new Save({
      userId,
      url,
      title,
      tags: [...new Set(tags)],
      content: extracted.text.substring(0, 30000),
      type: extracted.type || 'other',
      metadata: {
        extractedAt: new Date(),
        sourceLength: extracted.text.length,
        aiGenerated: true
      }
    });

    await newSave.save();

    res.status(201).json({
      success: true,
      data: {
        _id: newSave._id,
        url,
        title: newSave.title,
        tags: newSave.tags,
        type: newSave.type,
        savedAt: newSave.savedAt
      }
    });

  } catch (err) {
    console.error('Save endpoint error:', err);
    res.status(500).json({
      error: 'Failed to save item',
      message: err.message
    });
  }
});

export default router;