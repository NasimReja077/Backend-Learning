# Docker Compose – Complete Learning & Documentation Guide

A clean, consolidated guide for learning Docker Compose.  
Duplicates removed • Clear explanations • Diagrams • Examples • Practice project

---

## 1. What is Docker Compose?

**Docker Compose** defines and runs **multi-container applications** with a single YAML file (`compose.yaml` or `docker-compose.yml`).

Instead of many long `docker run` commands, you describe the whole stack and start it with:

```bash
docker compose up
```

### Typical stack (MERN example)

```
                    Application
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     Frontend         Backend          MongoDB
      (React)        (Express)         (DB)
        │                │                │
     Container        Container        Container
                         │
                       Redis
                     Container
```

### Why Compose?

| Without Compose                         | With Compose              |
|-----------------------------------------|---------------------------|
| Many manual `docker run` / network / volume commands | One YAML file             |
| Hard to remember options                | Declarative & versionable |
| Difficult to share with team            | `docker compose up`       |

---

## 2. Mental Model

```
              compose.yaml
                    │
                    ▼
         Docker Compose reads it
                    │
     ┌──────────────┼──────────────┐
     ▼              ▼              ▼
  frontend       backend         mongo
  container      container      container
     │              │              │
     └──────────────┼──────────────┘
                    │
              Network + Volumes
                    │
              Running Application
```

Compose manages: containers, networks, volumes, env vars, ports, builds, dependencies, healthchecks, restart policies, and scaling.

---

## 3. Basic Structure

**Recommended filename:** `compose.yaml`  
(Older name `docker-compose.yml` still works.)

```yaml
services:
  service1:
    # ...
  service2:
    # ...

networks:
  # optional

volumes:
  # optional
```

Each **service** describes one application component (usually one container).

---

## 4. Core Service Options

| Key              | Meaning                              | Example |
|------------------|--------------------------------------|---------|
| `image`          | Use existing image                   | `image: mongo:8` |
| `build`          | Build from Dockerfile                | `build: ./backend` |
| `container_name` | Fixed container name                 | `container_name: backend` |
| `ports`          | Host:Container port mapping          | `"3000:3000"` |
| `environment`    | Environment variables                | `NODE_ENV: production` |
| `env_file`       | Load vars from file                  | `env_file: .env` |
| `volumes`        | Named volumes or bind mounts         | `mongo-data:/data/db` |
| `networks`       | Attach to network                    | `- app-network` |
| `depends_on`     | Startup order / readiness            | See below |
| `restart`        | Restart policy                       | `unless-stopped` |
| `healthcheck`    | Health check                         | See below |
| `command`        | Override default command             | `command: npm run dev` |

### `image` vs `build`

```yaml
# Use pre-built image
mongo:
  image: mongo:8

# Build from local Dockerfile
backend:
  build: ./backend
  # or more explicit:
  # build:
  #   context: ./backend
  #   dockerfile: Dockerfile
  #   args:
  #     NODE_VERSION: 20
```

### Ports

```yaml
ports:
  - "3000:3000"   # host:container
  - "8080:3000"   # host 8080 → container 3000
```

Equivalent to `docker run -p 3000:3000 ...`

### Environment variables

```yaml
environment:
  PORT: 3000
  NODE_ENV: production
  MONGO_URI: mongodb://mongo:27017/myapp
```

Or from `.env`:

```yaml
environment:
  MONGO_URI: ${MONGO_URI}
  NODE_ENV: ${NODE_ENV}
```

Or:

```yaml
env_file:
  - .env
```

> Never commit production secrets. Put `.env` in `.gitignore`.

### Volumes (persistence)

```yaml
services:
  mongo:
    image: mongo:8
    volumes:
      - mongo-data:/data/db          # named volume
      # - ./backend:/app             # bind mount (dev)
      # - /app/node_modules          # anonymous volume (protect node_modules)

volumes:
  mongo-data:
```

**Without volume:** data is lost when container is removed.  
**With named volume:** data survives `docker compose down` (unless you use `-v`).

### Networks & service discovery

```yaml
services:
  backend:
    networks:
      - app-network
  mongo:
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Containers on the same network talk using **service names** as hostnames:

```
mongodb://mongo:27017     ✅ correct
mongodb://localhost:27017 ❌ wrong (localhost = this container)
```

Compose creates a default project network even if you don’t declare one.

### `depends_on` + Healthcheck

```yaml
backend:
  depends_on:
    mongo:
      condition: service_healthy   # wait until healthy

mongo:
  image: mongo:8
  healthcheck:
    test: ["CMD-SHELL", "mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 20s
```

`depends_on` alone only controls start order — it does **not** guarantee the app inside is ready. Prefer healthchecks.

### Restart policies

```yaml
restart: "no"            # default
restart: always
restart: on-failure
restart: unless-stopped  # common choice
```

---

## 5. Important Commands

| Command | Purpose |
|---------|---------|
| `docker compose up` | Create & start all services |
| `docker compose up -d` | Detached (background) |
| `docker compose up -d --build` | Rebuild + start |
| `docker compose down` | Stop & remove containers + networks |
| `docker compose down -v` | Also remove named volumes ⚠️ data loss |
| `docker compose ps` | List services |
| `docker compose logs` | All logs |
| `docker compose logs -f backend` | Follow one service |
| `docker compose exec backend sh` | Shell into running service |
| `docker compose build` | Build images |
| `docker compose build backend` | Build one service |
| `docker compose pull` | Pull images |
| `docker compose restart` | Restart services |
| `docker compose stop` / `start` | Stop / start without removing |

**Scaling (no fixed `container_name`):**

```bash
docker compose up -d --scale backend=3
```

---

## 6. Dockerfile vs Compose

| Dockerfile                    | Compose                              |
|-------------------------------|--------------------------------------|
| Builds **one image**          | Orchestrates **multiple services**   |
| `FROM`, `RUN`, `COPY`, `CMD`  | `services`, `ports`, `volumes`, …    |
| Image recipe                  | How containers run & connect         |

```
Dockerfile  →  docker build  →  Image
compose.yaml → docker compose up → Containers + Network + Volumes
```

---

## 7. Development vs Production Tips

**Development**
- Bind mounts for live code: `./backend:/app`
- Protect `node_modules` with anonymous volume
- Use `command: npm run dev` if needed

**Production**
- Prefer built images / multi-stage Dockerfiles
- Named volumes only for data
- Healthchecks + proper `depends_on`
- No secrets in the YAML or image
- Resource limits when needed

---

## 8. Full Example – Backend + MongoDB + Redis

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      PORT: 3000
      NODE_ENV: production
      MONGO_URI: mongodb://mongo:27017/myapp
      REDIS_URL: redis://redis:6379
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    networks:
      - app-network

  mongo:
    image: mongo:8
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD-SHELL", "mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  mongo-data:
```

---

## 9. Quick Summary

| Topic                | Key point |
|----------------------|-----------|
| Purpose              | Multi-container apps in one YAML |
| File                 | `compose.yaml` or `docker-compose.yml` |
| Communication        | Service name as hostname |
| Persistence          | Named volumes for databases |
| Startup reliability  | `depends_on` + healthcheck |
| Most used command    | `docker compose up -d --build` |
| Cleanup              | `docker compose down` (add `-v` carefully) |
| Dockerfile vs Compose| Image build vs orchestration |

---

## 10. Small Practice Project – Express + MongoDB

Minimal multi-container app you can run in a few minutes.

### Project structure

```
compose-demo/
├── compose.yaml
├── .env
├── .gitignore
└── backend/
    ├── Dockerfile
    ├── .dockerignore
    ├── package.json
    └── server.js
```

### `.gitignore`

```
node_modules
.env
```

### `.env`

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://mongo:27017/demo
```

### `backend/package.json`

```json
{
  "name": "compose-demo-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0",
    "mongoose": "^8.0.0"
  }
}
```

### `backend/server.js`

```javascript
import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://mongo:27017/demo";

app.get("/", (req, res) => {
  res.send("Hello from Docker Compose! 🐳");
});

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState; // 1 = connected
  res.json({
    status: "ok",
    mongo: dbState === 1 ? "connected" : "disconnected",
  });
});

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();
```

### `backend/Dockerfile`

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```

### `backend/.dockerignore`

```
node_modules
npm-debug.log
.git
.env
```

### `compose.yaml`

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      mongo:
        condition: service_healthy
    restart: unless-stopped

  mongo:
    image: mongo:8
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD-SHELL", "mongosh --quiet --eval 'db.runCommand({ ping: 1 }).ok'"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 15s
    restart: unless-stopped

volumes:
  mongo-data:
```

### Run & practice

```bash
# Start
docker compose up -d --build

# Status
docker compose ps

# Logs
docker compose logs -f backend
docker compose logs mongo

# Test
curl http://localhost:3000
curl http://localhost:3000/health

# Shell into backend
docker compose exec backend sh

# Restart one service
docker compose restart backend

# Stop (keep volume)
docker compose down

# Start again – Mongo data still there
docker compose up -d

# DANGER: remove volumes too
docker compose down -v
```

### What you practiced

1. Multi-service `compose.yaml`  
2. Build + image services  
3. Service-name DNS (`mongo`)  
4. Named volume persistence  
5. Healthcheck + `depends_on`  
6. Logs, exec, restart, down  

---

## 11. Interview Checklist

Be able to explain without notes:

1. What Docker Compose is and why use it  
2. `services`, `image`, `build`, `ports`, `environment`  
3. Named volumes vs bind mounts  
4. Why use service name instead of `localhost`  
5. `depends_on` vs healthcheck  
6. `docker compose up` vs `down` vs `down -v`  
7. Dockerfile vs Compose  
8. How containers communicate on a Compose network  

---

**Next steps:** Nginx reverse proxy in Compose → multi-stage production Dockerfiles → CI/CD → cloud / Kubernetes.