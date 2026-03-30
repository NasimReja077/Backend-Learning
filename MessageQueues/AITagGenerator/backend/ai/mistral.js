import axios from "axios";

export const generateTags = async (context) => {
  if (!context || context.length < 50) {
    throw new Error("Content too small for AI ❌");
  }
  const response = await axios.post(
    "https://api.mistral.ai/v1/chat/completions",
    {
      model: "mistral-small",
      messages: [
        {
          role: "user",
          content: `Generate SEO title and 5 SEO tags for this content:\n${context}`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
    }
  );

  return response.data.choices[0].message.content;
};
