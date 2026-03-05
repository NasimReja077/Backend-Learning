import express from "express"
import { redisClient } from "../config/redis.js"
import { getCharacters } from "../services/dragon.api.js"

const router = express.Router()

router.get("/characters", async(req,res)=>{

   try{

      const cacheKey = "dragonball:characters"

      // 1️⃣ Check Redis Cache
      const cachedData = await redisClient.get(cacheKey)

      if(cachedData){

         console.log("Cache Hit")

         return res.json({
            source:"redis cache",
            data: JSON.parse(cachedData)
         })
      }

      // 2️⃣ Fetch from API
      console.log("Fetching from API")

      const characters = await getCharacters()

      // 3️⃣ Store in Redis
      await redisClient.set(
         cacheKey,
         JSON.stringify(characters),
         { EX: 60 }   // cache for 60 seconds
      )

      res.json({
         source:"api",
         data:characters
      })

   }catch(err){
      res.status(500).json({
         error:err.message
      })
   }

})

export default router