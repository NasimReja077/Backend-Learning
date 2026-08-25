import "dotenv/config";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// ====================== Model ======================
const model = new ChatMistralAI({
  model: "mistral-small-latest",
  temperature: 0.7,
  apiKey: process.env.MISTRAL_API_KEY,
});

// ====================== Prompt + Chain ======================
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant. Keep answers clear and concise."],
  ["human", "{question}"],
]);

const chain = prompt.pipe(model).pipe(new StringOutputParser());

// ====================== Event Streaming ======================
async function runEventStreaming() {
  const question = "Explain Event Streaming in LangChain in simple words and its Types?.";

  console.log("\x1b[33mQuestion:\x1b[0m", question);
  console.log("\x1b[36m\n--- Event Streaming Started ---\x1b[0m\n");

  const eventStream = await chain.streamEvents(
    { question },
    { version: "v2" }
  );

  for await (const event of eventStream) {
    // 1. When the model starts
    if (event.event === "on_chat_model_start") {
      console.log("\x1b[35m[Event] Model started generating...\x1b[0m");
    }

    // 2. When tokens are streaming
    if (event.event === "on_chat_model_stream") {
      const content = event.data?.chunk?.content || "";
      if (content) {
        process.stdout.write(content); // Live typing effect
      }
    }

    // 3. When the model finishes
    if (event.event === "on_chat_model_end") {
      console.log("\n\n\x1b[35m[Event] Model finished generating.\x1b[0m");
    }

    // 4. When the full chain ends
    if (event.event === "on_chain_end" && event.name === "RunnableSequence") {
      console.log("\x1b[32m[Event] Chain completed successfully.\x1b[0m");
    }
  }

  console.log("\n\x1b[36m--- Event Streaming Finished ---\x1b[0m");
}

runEventStreaming().catch(console.error);

// Event,                        Meaning
// on_chat_model_start,          Model started
// on_chat_model_stream,         New token received
// on_chat_model_end,            Model finished
// on_chain_start,               Chain started
// on_chain_end,                 Chain finished
// on_tool_start,                Tool started (when using tools)
// on_tool_end,                  Tool finished


// 1. Load API Key
// 2. Create Mistral Model
// 3. Create Prompt (System + Human)
// 4. Create Chain (Prompt → Model → Parser)
// 5. Start Event Streaming
// 6. Listen to events:
//       - Model Start
//       - Token by Token (live)
//       - Model End
//       - Chain End
// 7. Finish