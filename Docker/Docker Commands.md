# Docker Complete Learning & Documentation Guide

A clean, consolidated guide for learning Docker commands, Dockerfiles, and practical usage.  
Duplicates removed • Clear explanations • Diagrams • Examples • Practice project

---

## Mental Model (Start Here)

```
Dockerfile  ──docker build──►  IMAGE  ──docker run──►  CONTAINER  ──►  RUNNING APP
```

| Concept     | What it is                          | Analogy          |
|-------------|-------------------------------------|------------------|
| **Image**   | Read-only template / blueprint      | Class            |
| **Container** | Running instance of an image      | Object / process |
| **Dockerfile** | Recipe to build an image         | Build script     |

```
Registry (Docker Hub)
        │ docker pull
        ▼
   Local Image
        │ docker run
        ▼
    Container
        │ process starts
        ▼
 Running Application
```

---

## 1. Essential Docker Commands

### 1.1 Information

| Command              | Purpose                                      |
|----------------------|----------------------------------------------|
| `docker --version`   | Quick version check                          |
| `docker version`     | Client + server details                      |
| `docker info`        | System-wide info (storage, containers, etc.) |

### 1.2 Images

| Command                    | Purpose                          |
|----------------------------|----------------------------------|
| `docker pull <image>`      | Download image from registry     |
| `docker images` / `docker image ls` | List local images       |
| `docker rmi <image>`       | Remove image                     |
| `docker rmi -f <image>`    | Force remove image               |
| `docker tag <src> <target>`| Create new tag for an image      |
| `docker push <image>`      | Upload image to registry         |
| `docker history <image>`   | Show image layers                |
| `docker inspect <image>`   | Detailed JSON info               |
| `docker build -t name .`   | Build image from Dockerfile      |

**Examples**
```bash
docker pull nginx:latest
docker images
docker tag nginx:latest mynginx:v1
docker rmi nginx:latest
```

### 1.3 Containers

| Command                      | Purpose                              |
|------------------------------|--------------------------------------|
| `docker run <image>`         | Create **and** start a container     |
| `docker create <image>`      | Create without starting              |
| `docker ps`                  | List **running** containers          |
| `docker ps -a`               | List **all** containers              |
| `docker start <container>`   | Start a stopped container            |
| `docker stop <container>`    | Graceful stop                        |
| `docker restart <container>` | Restart                               |
| `docker rm <container>`      | Remove stopped container             |
| `docker rm -f <container>`   | Force remove (even if running)       |
| `docker rename <old> <new>`  | Rename container                     |
| `docker kill <container>`    | Force stop                           |

**Key differences**
```
docker run   → CREATE + START (new container)
docker start → START existing container
docker stop  → stop container
docker rm    → delete container
docker rmi   → delete image
```

### 1.4 Useful `docker run` Options

| Option              | Meaning                          | Example |
|---------------------|----------------------------------|---------|
| `-d`                | Detached (background)            | `docker run -d nginx` |
| `-it`               | Interactive + TTY                | `docker run -it ubuntu bash` |
| `-p host:container` | Port mapping                     | `docker run -p 8080:80 nginx` |
| `-e KEY=VALUE`      | Environment variable             | `docker run -e NODE_ENV=prod myapp` |
| `--env-file .env`   | Load env from file               | `docker run --env-file .env myapp` |
| `--name name`       | Custom container name            | `docker run --name web nginx` |
| `-v` / `--mount`    | Volume / bind mount              | `docker run -v data:/data nginx` |
| `--rm`              | Auto-remove when stopped         | `docker run --rm nginx` |
| `-m`                | Memory limit                     | `docker run -m 512m nginx` |

**Practical examples**
```bash
# Nginx in background, port mapped
docker run -d --name my-nginx -p 8080:80 nginx

# Interactive Ubuntu shell
docker run -it --name my-ubuntu ubuntu bash

# App with env vars
docker run -d \
  --name my-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  my-express-app:1.0
```

### 1.5 Logs, Exec, Inspect, Stats

| Command                              | Purpose                              |
|--------------------------------------|--------------------------------------|
| `docker logs <container>`            | View logs                            |
| `docker logs -f <container>`         | Follow logs (live)                   |
| `docker logs --tail 100 <container>` | Last 100 lines                       |
| `docker exec -it <container> bash/sh`| Open shell inside running container  |
| `docker exec <container> <cmd>`      | Run one-off command                  |
| `docker inspect <container>`         | Full JSON details                    |
| `docker stats`                       | Live CPU / memory / network usage    |
| `docker top <container>`             | Processes inside container           |

```bash
docker logs -f my-nginx
docker exec -it my-nginx sh
docker exec my-nginx ls /usr/share/nginx/html
docker stats
```

### 1.6 Copy & Commit

| Command | Purpose |
|---------|---------|
| `docker cp <container>:<path> <host>` | Container → host |
| `docker cp <host> <container>:<path>` | Host → container |
| `docker commit <container> <image>`   | Snapshot container → new image |

> Prefer **Dockerfile + `docker build`** over `docker commit` for reproducible images.

### 1.7 Cleanup

| Command                    | Purpose                              |
|----------------------------|--------------------------------------|
| `docker container prune`   | Remove stopped containers            |
| `docker image prune`       | Remove unused images                 |
| `docker volume prune`      | Remove unused volumes                |
| `docker system prune`      | Clean unused data                    |
| `docker system prune -a`   | Aggressive cleanup (unused images)   |

### 1.8 Lifecycle Diagram

```
IMAGE
  │ docker create / docker run
  ▼
CREATED
  │ docker start
  ▼
RUNNING ──docker stop──► STOPPED / EXITED
  │                        │
  │ docker restart         │ docker start
  │                        ▼
  │                     RUNNING
  │
  └── docker rm ──► REMOVED
```

`docker run` ≈ `create` + `start`.

---

## 2. Dockerfile – Build Images Properly

### 2.1 What is a Dockerfile?

A plain text file named **`Dockerfile`** containing instructions that Docker uses to build an image.

```
Dockerfile  →  docker build  →  Image  →  docker run  →  Container
```

### 2.2 Core Instructions

| Instruction    | Purpose                         | Layer? | When      |
|----------------|---------------------------------|--------|-----------|
| `FROM`         | Base image                      | Yes    | Build     |
| `WORKDIR`      | Working directory               | Yes    | Build     |
| `COPY`         | Copy files (preferred)          | Yes    | Build     |
| `ADD`          | Copy + extra features           | Yes    | Build     |
| `RUN`          | Execute command during build    | Yes    | Build     |
| `CMD`          | Default command at start        | No     | Runtime   |
| `ENTRYPOINT`   | Main executable                 | No     | Runtime   |
| `EXPOSE`       | Document intended port          | No     | Metadata  |
| `ENV`          | Environment variable            | Yes    | Runtime   |
| `ARG`          | Build-time variable             | No     | Build     |
| `VOLUME`       | Mount point                     | Yes    | Runtime   |
| `USER`         | Switch user (security)          | Yes    | Runtime   |
| `HEALTHCHECK`  | Health check command            | Yes    | Runtime   |
| `LABEL`        | Metadata                        | Yes    | Build     |

### 2.3 Important Distinctions

| Pair              | Difference |
|-------------------|------------|
| **RUN vs CMD**    | `RUN` = build time · `CMD` = container start |
| **CMD vs ENTRYPOINT** | `CMD` = easy to override · `ENTRYPOINT` = main executable |
| **COPY vs ADD**   | Prefer `COPY` · use `ADD` only for auto-extract / special cases |
| **ARG vs ENV**    | `ARG` = build only · `ENV` = available at runtime |
| **EXPOSE vs `-p`**| `EXPOSE` = documentation · `-p` = actually publish port |

### 2.4 Good Node.js Dockerfile Example

```dockerfile
# Base image (lightweight)
FROM node:20-alpine

# Working directory
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Runtime environment
ENV NODE_ENV=production
ENV PORT=3000

# Document port
EXPOSE 3000

# Run as non-root user
USER node

# Start command
CMD ["node", "server.js"]
```

### 2.5 Multi-Stage Build (Production)

```dockerfile
# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
USER node
CMD ["node", "dist/server.js"]
```

**Benefits:** smaller final image, no build tools in production, better security.

### 2.6 `.dockerignore`

```dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
.env.*
coverage
.vscode
.idea
Dockerfile
docker-compose.yml
README.md
*.md
```

Reduces build context size and prevents secrets / unnecessary files from entering the image.

### 2.7 Build Commands

```bash
# Basic
docker build -t myapp:1.0 .

# Custom Dockerfile
docker build -t myapp:1.0 -f Dockerfile.prod .

# Build argument
docker build --build-arg NODE_VERSION=22 -t myapp:22 .

# No cache
docker build --no-cache -t myapp:1.0 .

# Pull newer base image
docker build --pull -t myapp:1.0 .
```

### 2.8 Layer Caching Best Practice

**Better order (cache-friendly):**
```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
```

**Worse order:**
```dockerfile
COPY . .
RUN npm ci   # invalidates on every source change
```

---

## 3. Quick Command Summary (Must Memorize)

```bash
# Info
docker --version
docker info

# Images
docker pull nginx
docker images
docker build -t myapp:1.0 .
docker tag myapp:1.0 user/myapp:1.0
docker push user/myapp:1.0
docker rmi myapp:1.0

# Containers
docker run -d --name web -p 8080:80 nginx
docker ps
docker ps -a
docker start web
docker stop web
docker restart web
docker rm web

# Debug
docker logs -f web
docker exec -it web sh
docker inspect web
docker stats

# Cleanup
docker system prune -a
```

---

## 4. Recommended Practice Order

```bash
docker --version
docker pull nginx
docker images
docker run -d --name web -p 8080:80 nginx
docker ps
docker logs web
docker exec -it web sh          # exit with Ctrl+D or exit
docker stop web
docker ps -a
docker rm web
docker rmi nginx
```

---

## 5. Small Practice Project – Express Hello Docker

Build a minimal Express app, Dockerize it, run it, and practice the full lifecycle.

### Project structure

```
hello-docker/
├── Dockerfile
├── .dockerignore
├── package.json
└── server.js
```

### 1. `package.json`

```json
{
  "name": "hello-docker",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.21.0"
  }
}
```

### 2. `server.js`

```javascript
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from Docker! 🐳");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 3. `Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["node", "server.js"]
```

### 4. `.dockerignore`

```
node_modules
npm-debug.log
.git
.env
*.md
```

### 5. Commands to run

```bash
# Install locally (optional, for testing outside Docker)
npm install

# Build image
docker build -t hello-docker:1.0 .

# Run container
docker run -d --name hello-app -p 3000:3000 hello-docker:1.0

# Test
curl http://localhost:3000
# → Hello from Docker! 🐳

# Debug workflow
docker logs -f hello-app
docker exec -it hello-app sh
docker inspect hello-app
docker stats hello-app

# Lifecycle
docker stop hello-app
docker start hello-app
docker restart hello-app
docker rm -f hello-app
docker rmi hello-docker:1.0
```

### What you practiced

1. Write a real Dockerfile  
2. Use layer caching (`package*.json` first)  
3. Build with `docker build`  
4. Run with port mapping & env  
5. Debug with logs / exec / inspect  
6. Clean up containers and images  

---

## 6. Interview-Ready Checklist

You should be able to explain **without notes**:

- Image vs Container vs Dockerfile  
- `docker run` vs `docker start`  
- `docker rm` vs `docker rmi`  
- `RUN` vs `CMD`  
- `CMD` vs `ENTRYPOINT`  
- `COPY` vs `ADD`  
- `EXPOSE` vs `-p`  
- `ARG` vs `ENV`  
- Why copy `package*.json` before source code  
- Why `.dockerignore` matters  
- Multi-stage builds and why they help  
- Why run as non-root (`USER`)  
- Basic debugging flow: `ps` → `logs` → `exec` → `inspect`

---

**Next step after this guide:** Docker Compose (multi-container apps: API + database + reverse proxy).