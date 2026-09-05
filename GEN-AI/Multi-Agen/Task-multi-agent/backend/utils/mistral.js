import { Mistral } from "@mistralai/mistralai";
import dotenv from "dotenv";
dotenv.config();

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function askMistral(systemPrompt, userPrompt, model = "mistral-small-latest") {
  try {
    const response = await client.chat.complete({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Mistral Error:", error.message);
    return "Error calling Mistral AI";
  }
}