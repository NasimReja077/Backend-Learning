// 1. Mock Tokenizer Function (In reality, libraries like tiktoken do this)
function mockEncodeChat(messages) {
    let breakdown = [];
    let totalTokens = 0;

    messages.forEach(msg => {
        // A simple rule: Every 4 characters = 1 token (plus 3 tokens for formatting)
        let contentTokens = Math.ceil(msg.content.length / 4);
        let msgTokens = contentTokens + 3; 

        breakdown.push({
            role: msg.role,
            textSnippet: msg.content.substring(0, 30) + "...",
            tokens: msgTokens
        });

        totalTokens += msgTokens;
    });

    return { totalTokens, breakdown };
}

// 2. Truncate Function (Removes older messages to fit inside the context window)
function manageContextWindow(messages, maxWindowTokens) {
    let encoded = mockEncodeChat(messages);
    
    // As long as the token limit is exceeded, remove the oldest message (index 0)
    // However, keep the 'system' prompt intact so the AI doesn't forget its rules
    while (encoded.totalTokens > maxWindowTokens && messages.length > 1) {
        if (messages[0].role === 'system') {
            // If the first message is 'system', delete the next one (index 1)
            messages.splice(1, 1);
        } else {
            messages.shift();
        }
        encoded = mockEncodeChat(messages); // Recalculate tokens
    }
    return encoded;
}

// 3. Cost Estimation Function
function estimateCost(totalTokens, pricePer1MTokens) {
    return (totalTokens / 1000000) * pricePer1MTokens;
}

// ==========================================
// 🚀 Main Execution Program
// ==========================================

// Chat format input (System + User + Assistant)
let chatHistory = [
    { role: "system", content: "You are a helpful coding assistant specialized in JavaScript." },
    { role: "user", content: "Hello! Can you explain recursion in JavaScript with a quick example?" },
    { role: "assistant", content: "Sure! Recursion is when a function calls itself. For example, a countdown function." },
    { role: "user", content: "Great! Now tell me how to handle asynchronous errors using try-catch." },
    { role: "assistant", content: "To handle async errors, you must use the 'await' keyword inside a 'try' block." }
];

const MAX_CONTEXT_TOKENS = 75; // Our small context window limit
const PRICE_PER_1M_TOKENS = 2.50; // Assume $2.50 per 1 million tokens

console.log("--- 🔄 Starting Context Window Processing ---");

// Managing and truncating context
let finalContext = manageContextWindow(chatHistory, MAX_CONTEXT_TOKENS);

// 4. Token Breakdown Display
console.log("\n📊 Token Breakdown:");
finalContext.breakdown.forEach(item => {
    console.log(`- [${item.role.toUpperCase()}]: "${item.textSnippet}" -> ${item.tokens} tokens`);
});

console.log(`\n🔋 Total Tokens Used: ${finalContext.totalTokens} (Limit: ${MAX_CONTEXT_TOKENS})`);

// 5. Cost Estimation Display
let cost = estimateCost(finalContext.totalTokens, PRICE_PER_1M_TOKENS);
console.log(`\n💰 Estimated Cost: $${cost.toFixed(6)} ($${PRICE_PER_1M_TOKENS} per 1M tokens)`);