import { embedding } from "../services/ai.service.js";
import { searchVector } from "../services/pinecone.service.js";
import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const chat = async (req, res) => {
  try {
    const { question } = req.body;

    const vector = await embedding(question);

    const matches = await searchVector(vector);

    const context = matches
      .map((m) => m.metadata.text)
      .join("\n---\n");

    const prompt = `
Answer using context:
${context}

Question: ${question}
`;

    const response = await client.chat.complete({
      model: "mistral-small",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      answer: response.choices[0].message.content,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




// import { embedding } from "../services/ai.service.js";
// import { searchVector } from "../services/pinecone.service.js";
// import { Mistral } from "@mistralai/mistralai";

// const client = new Mistral({
//   apiKey: process.env.MISTRAL_API_KEY,
// });

// export const chat = async (req, res) => {
//   try {
//     const { question } = req.body;

//     if (!question) {
//       return res.status(400).json({ error: "Question required" });
//     }

//     const vector = await embedding(question);
//     const matches = await searchVector(vector);

//     const context = matches.map((m) => m.metadata.summary).join("\n");

//     const prompt = `Answer using this context:\n${context}\n\nQuestion: ${question}`;

//     const response = await client.chat.complete({
//       model: "mistral-small",
//       messages: [{ role: "user", content: prompt }],
//     });

//     res.json({
//       answer: response.choices[0].message.content,
//     });
//   } catch (error) {
//     console.error("Chat error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };
