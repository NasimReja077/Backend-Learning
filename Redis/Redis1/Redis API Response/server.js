import express from "express"
import cors from "cors"
import characterRoutes from "./routes/character.route.js"
import "./config/redis.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api", characterRoutes)

app.listen(5000, ()=>{
   console.log("Server running on port 5000")
})