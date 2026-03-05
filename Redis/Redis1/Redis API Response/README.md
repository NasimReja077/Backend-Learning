# 🚀 Redis API Response Caching (Node.js + Express)

This project demonstrates how to use **Redis for API response caching** in a Node.js backend application.  
It fetches data from the **Dragon Ball API** and stores the response in Redis to improve performance and reduce repeated API calls.

---

## 📌 Tech Stack

- Node.js
- Express.js
- Redis
- Axios

---

## 🌐 External API

Base URL:

https://www.dragonball-api.com/api

Example Endpoint Used:

https://www.dragonball-api.com/api/characters

---

## ⚡ Features

- Fetch data from external API
- Cache API response in Redis
- Return cached data if available
- Set cache expiration (TTL)
- Improve API performance
- Reduce unnecessary external API requests

---

## 🧠 How It Works

1. Client sends request to:
/api/characters


2. Server checks Redis cache

- If **cache exists → return cached data**
- If **cache not found → fetch from API**

3. Store the API response in Redis

4. Return the response to the client

---

## 📁 Project Folder Structure
redis-api-response-caching
│
├── node_modules
│
├── config
│ └── redisClient.js # Redis connection setup
│
├── routes
│ └── characterRoutes.js # API routes
│
├── controllers
│ └── characterController.js # Logic for fetching and caching API data
│
├── server.js # Main server file
├── package.json
└── README.md

---

## ⚙️ Installation

### 1️⃣ Clone the Repository


git clone https://github.com/your-username/redis-api-response-caching.git


### 2️⃣ Install Dependencies


npm install


### 3️⃣ Start Redis Server
redis-server


### 4️⃣ Run the Application


node server.js


Server will start at:


http://localhost:5000


---

## 🧪 Test API

Open in browser or Postman:


http://localhost:5000/api/characters


First request → data from API  
Next requests → data from **Redis cache**

---

## 📈 Benefits of Redis Caching

- Faster API responses
- Reduced external API calls
- Better backend performance
- Improved scalability

---

## 🎯 Learning Outcome

Through this project, I learned:

- How Redis works as an **in-memory cache**
- How to integrate Redis with **Node.js and Express**
- How to optimize backend API performance

---

## 🔥 Future Improvements

- Add cache invalidation
- Add Redis rate limiting
- Add pagination caching
- Deploy with Docker

---

## 👨‍💻 Author

**Nasim Reja Mondal**

MERN Stack Developer