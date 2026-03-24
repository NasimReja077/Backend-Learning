import { ChatMistralAI } from "@langchain/mistralai";

export const summarizeContent = async (text) => {
  try {
    const mistral = new ChatMistralAI({
      apiKey: process.env.MISTRAL_API_KEY,
      model: "mistral-large-latest",
      temperature: 0.3,
    });

    const prompt = `
Return ONLY JSON:

{
  "summary": "short summary",
  "keyPoints": ["point1", "point2"],
  "tags": ["tag1", "tag2"]
}

Content:
${text.substring(0, 12000)}
`;

    const res = await mistral.invoke([
      { role: "user", content: prompt },
    ]);

    let output = res.content.trim();
    output = output.replace(/```json|```/g, "").trim();

    return JSON.parse(output);

  } catch (err) {
    console.error("AI Error:", err.message);

    return {
      summary: "AI failed",
      keyPoints: [],
      tags: [],
    };
  }
};