import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const generateTags = async (text, existingTags = []) => {
     const prompt = `
Return ONLY JSON array of tags.
Existing tags: ${existingTags.join(", ")}

Content:
${text.slice(0, 2000)}

Rules:
- reuse existing tags if possible
- lowercase
- 1-2 words
- max 5 tags
`;

try {
    const res = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      // This tells Mistral to strictly output JSON format
      response_format: { type: "json_object" } 
    });

    let output = res.choices[0].message.content.trim();

    // Advanced cleaning: Removes ```json and ``` blocks entirely
    const cleanedOutput = output.replace(/^```json/i, "").replace(/```/g, "").trim();

    return JSON.parse(cleanedOutput);
  } catch (error) {
    console.error("AI Tagging Error:", error.message);
    // Return an empty array so the router can still finish the request
    return []; 
  }
};

// /**
//  * res.choices[0].message.content: Accesses the text message content from the first choice of the OpenAI chat completion response.
// .replace(/```/g, ""): Uses a regular expression to find all instances of markdown code fences (```) and replaces them with an empty string, cleaning up the text.
// .trim(): Removes whitespace from both ends of the string.
// let output = ...: Stores the cleaned string into the variable output. 
// OpenAI Developer Community
// OpenAI Developer Community
//  +1

//  */