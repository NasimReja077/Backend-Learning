import express from "express";

const app = express();

app.get("/", async (req, res) => {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos");

        if (!response.ok) {
            console.error(`Todos API returned HTTP ${response.status}`);
            return res.status(502).json({ message: "Failed to fetch todos" });
        }

        const todos = await response.json();
        res.json(todos);
    } catch (error) {
        console.error("Failed to fetch todos:", error);
        res.status(502).json({ message: "Failed to fetch todos" });
    }
});

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Uncached server running on http://localhost:${port}`);
});
