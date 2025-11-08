import express from "express";
import dotenv from "dotenv";
import productsRoute from "./routes/product.route.js"
import connectDB from "./db/index.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
     res.send("Hi I am live, Bro");
})

app.use("/api/product", productsRoute);

connectDB();
app.listen(PORT, () => {
     console.log(`Runing...,App is listening on PORT ${PORT}`)
});

