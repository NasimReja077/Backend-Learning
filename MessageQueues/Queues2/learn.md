# BullMQ Email Queue System

A modern, production-ready background job processor using **BullMQ** and **Redis**.

This project demonstrates how to handle asynchronous tasks (like sending emails) efficiently using message queues.

---

## 🎯 What Learning Here

This project is designed to teach you real-world backend engineering concepts.

| Topic                        | What You Learned                                                                 | Real-World Importance |
|-----------------------------|----------------------------------------------------------------------------------|-----------------------|
| **Message Queues**          | Producer-Consumer Pattern using BullMQ                                          | Decouples slow tasks from API responses |
| **Redis as Backend**        | Using Redis with `ioredis` for job storage                                      | High performance, persistence & reliability |
| **Environment Variables**   | Secure config management with `dotenv`                                          | Different settings for dev, staging & production |
| **Modular Architecture**    | Separated `config/`, `producer`, `worker`, `server`                             | Clean, maintainable & scalable code |
| **Monitoring Dashboard**    | Bull Board UI for real-time queue monitoring                                    | Essential for debugging in production |
| **Graceful Shutdown**       | Proper worker cleanup on server stop                                             | Prevents job loss and data corruption |
| **Async Job Processing**    | Background email simulation with delay                                           | Improves API response time dramatically |
| **ES Modules**              | Modern `import/export` syntax instead of `require`                               | Future-proof JavaScript |
| **Centralized Connection**  | Single Redis connection reused across files                                      | Better performance & easier maintenance |

---

## ✨ Features

- Add email jobs to queue
- Background job processing with simulated email sending
- Real-time **Bull Board Dashboard**
- Clean modular folder structure
- Environment-based configuration
- Graceful worker shutdown
- Production-ready Redis connection using ioredis

---

## 🛠️ Tech Stack

- **Node.js** + **Express**
- **BullMQ** – Queue Library
- **Redis** + **ioredis** – Queue Storage
- **Bull Board** – Queue Dashboard
- **dotenv** – Environment Variables

---

## 📁 Project Structure

```bash
Queues1/
├── config/
│   └── redis.js                 # Centralized Redis connection
├── producer.js                  # Add jobs to queue
├── worker.js                    # Process jobs in background
├── server.js                    # Express server + Bull Board Dashboard
├── .env                         # Environment variables
├── package.json
└── README.md


---

## 🚀 How to Run

### 1. Start Redis

```powershell
redis-server
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Run the Application

**Terminal 1** – Start Server + Dashboard:
```powershell
node server.js
```

**Terminal 2** – Add Jobs (optional):
```powershell
node producer.js
```

---

## 📊 Access Dashboard

Open your browser and go to:

**http://localhost:3000/admin/queues**

You can see all jobs: Waiting, Active, Completed, Failed, etc.

---




