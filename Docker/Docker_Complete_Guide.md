# 🐳 Docker — Complete Learning Guide & Documentation

*Consolidated, deduplicated, and reorganized from your Docker notes — for learning, revision, and interviews.*

## Table of Contents

1. [What is Docker?](#1-what-is-docker)
2. [Docker vs Virtual Machines](#2-docker-vs-virtual-machines)
3. [Docker Architecture](#3-docker-architecture)
4. [Images](#4-images)
5. [Containers & Lifecycle](#5-containers--lifecycle)
6. [Dockerfile](#6-dockerfile)
7. [Multi-Stage Builds](#7-multi-stage-builds)
8. [Networking](#8-networking)
9. [Volumes & Storage](#9-volumes--storage)
10. [Environment Variables & Secrets](#10-environment-variables--secrets)
11. [Docker Compose](#11-docker-compose)
12. [Image & Build Optimization](#12-image--build-optimization)
13. [Production Best Practices](#13-production-best-practices)
14. [Debugging Cheatsheet](#14-debugging-cheatsheet)
15. [Full Command Cheatsheet](#15-full-command-cheatsheet)
16. [Interview Q&A Quick Fire](#16-interview-qa-quick-fire)
17. [Mini Project — Dockerize a Node + MongoDB App](#17-mini-project--dockerize-a-node--mongodb-app)

---

## 1. What is Docker?

Docker is a platform that packages an application **with everything it needs** (code, runtime, libraries, system tools) into a single unit called a **container**, so it runs the same way everywhere — your laptop, a teammate's machine, or a production server.

**Key benefits**

| Benefit | Why it matters |
|---|---|
| Consistency | "Works on my machine" problem disappears |
| Isolation | Each app runs in its own environment |
| Lightweight | Shares the host OS kernel — no full OS per app |
| Fast startup | Containers start in seconds |
| Portability | Runs anywhere Docker is installed (cloud, on-prem, laptop) |
| Scalability | Easy to spin up multiple identical instances |

---

## 2. Docker vs Virtual Machines

```mermaid
graph TD
    subgraph VM["Virtual Machines"]
    A1[App A] --> G1[Guest OS]
    A2[App B] --> G2[Guest OS]
    G1 --> H1[Hypervisor]
    G2 --> H1
    H1 --> OS1[Host OS]
    end

    subgraph DK["Docker Containers"]
    B1[App A] --> DE[Docker Engine]
    B2[App B] --> DE
    DE --> OS2[Host OS]
    end
```

| Feature | Virtual Machine | Docker Container |
|---|---|---|
| OS | Full guest OS per VM | Shares host OS kernel |
| Size | GBs | MBs |
| Boot time | Minutes | Seconds |
| Performance | Overhead from hypervisor | Near-native |
| Isolation | Strong (hardware-level) | Process-level (namespaces/cgroups) |
| Portability | Less portable | Highly portable |

**Interview one-liner:** A VM virtualizes hardware and runs a full OS; a container virtualizes the OS and shares the host kernel, which is why it's lighter and faster.

---

## 3. Docker Architecture

```mermaid
graph LR
    CLI[Docker Client<br/>docker CLI] -- REST API --> Daemon[Docker Daemon<br/>dockerd]
    Daemon --> Images[Images]
    Daemon --> Containers[Containers]
    Daemon --> Networks[Networks]
    Daemon --> Volumes[Volumes]
    Daemon <--> Registry[Docker Registry<br/>Docker Hub / private]
```

| Component | Role |
|---|---|
| **Docker Client** | The `docker` CLI you type commands into |
| **Docker Daemon (`dockerd`)** | Background service that builds, runs, and manages containers |
| **Docker Engine** | The daemon + APIs + CLI together |
| **Docker Registry** | Stores images (Docker Hub is the public default; you can run private ones) |
| **Docker Image** | Read-only template used to create containers |
| **Docker Container** | A running (or stopped) instance of an image |

**Typical flow:** `docker run nginx` → Client sends request to Daemon → Daemon checks local images → if missing, pulls from Registry → Daemon creates and starts a Container from the Image.

---

## 4. Images

### What is an Image?

A Docker image is a **read-only, layered template** containing the app code, dependencies, and OS-level files needed to run a container. Think of it as a "class"; a container is an "instance" of that class.

### Image vs Container

| Image | Container |
|---|---|
| Read-only template | Running/stopped instance |
| Stored on disk | Exists as a process + writable layer |
| Doesn't change | Can be started, stopped, modified |
| One image → many containers | Each container is independent |

### Image Layers

Every instruction in a Dockerfile (`FROM`, `RUN`, `COPY`, ...) creates a new **layer**. Layers are cached and reused — this is the foundation of fast rebuilds.

```mermaid
graph TD
    L1["Layer 1: FROM node:18-alpine"] --> L2["Layer 2: COPY package.json"]
    L2 --> L3["Layer 3: RUN npm ci"]
    L3 --> L4["Layer 4: COPY . ."]
    L4 --> L5["Layer 5: RUN npm run build"]
    L5 --> WL["Writable Container Layer (per container)"]
```

Why layers matter: **reusability** (shared base layers across images), **caching** (unchanged layers aren't rebuilt), **storage efficiency**, **faster distribution** (only changed layers are pushed/pulled).

### Core Image Commands

```bash
docker pull nginx:1.25-alpine     # Download an image (always prefer explicit tags over `latest`)
docker images                     # List local images
docker images -a                  # Include intermediate images
docker inspect <image>            # Full metadata (JSON)
docker history <image>            # Show each layer and its size
docker tag myapp:latest myapp:1.0 # Add a tag
docker rmi <image>                # Remove an image
docker rmi -f <image>             # Force remove
```

### Building, Tagging, Pushing

```bash
docker build -t myapp:1.0 .                     # Build from Dockerfile in current dir
docker build -t myapp:1.0 -t myapp:latest .      # Multiple tags
docker login                                     # Authenticate to Docker Hub
docker tag myapp:1.0 username/myapp:1.0          # Tag for your registry namespace
docker push username/myapp:1.0                   # Push to registry
docker pull username/myapp:1.0                   # Pull it back down anywhere
```

### Save / Load vs Export / Import

| Command | Captures | Use case |
|---|---|---|
| `docker save img > img.tar` | Image + all layers + history | Move an image between machines without a registry |
| `docker load < img.tar` | Restores a saved image | Loading the above |
| `docker export container > c.tar` | Flattened filesystem snapshot of a **container** (no layer history) | Creating a minimal rootfs |
| `docker import c.tar` | Creates a new image from that flattened tar | Restoring a filesystem as a fresh image |

### `.dockerignore`

Tells Docker which files to exclude from the build context — smaller, faster builds and no accidental leaking of secrets.

```dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
Dockerfile
.dockerignore
README.md
*.md
.vscode
.DS_Store
coverage
dist
```

---

## 5. Containers & Lifecycle

### Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Created: docker create
    Created --> Running: docker start
    Running --> Paused: docker pause
    Paused --> Running: docker unpause
    Running --> Stopped: docker stop / kill
    Stopped --> Running: docker start
    Stopped --> [*]: docker rm
```

| State | Meaning | Command |
|---|---|---|
| Created | Container exists but hasn't started | `docker create` |
| Running | Actively executing | `docker run` / `docker start` |
| Paused | Process suspended (frozen) | `docker pause` |
| Stopped | Process ended, filesystem intact | `docker stop` / `docker kill` |
| Removed | Fully deleted | `docker rm` |

### Creating & Managing Containers

```bash
docker run <image>                # Create + start
docker create --name c1 nginx     # Create only, don't start
docker start c1                   # Start a stopped container
docker stop c1                    # Graceful stop (SIGTERM, then SIGKILL after ~10s)
docker kill c1                    # Immediate force stop (SIGKILL)
docker restart c1                 # Stop + start
docker rm c1                      # Remove a stopped container
docker rm -f c1                   # Force remove a running container
docker container prune            # Remove all stopped containers
```

### Attached vs Detached vs Interactive

| Flag | Meaning | Use case |
|---|---|---|
| *(none)* | Attached — logs stream to your terminal | Debugging |
| `-d` | Detached — runs in background | Real services |
| `-i` | Interactive — keeps STDIN open | Piping input |
| `-t` | Allocates a pseudo-TTY | Shell-like output |
| `-it` | Interactive shell session | `docker run -it ubuntu bash` |

### Important `docker run` Options

```bash
docker run -d --name web -p 8080:80 nginx        # Detached, named, port-mapped
docker run -e KEY=VALUE myapp                     # Environment variable
docker run --env-file .env myapp                  # Load env vars from file
docker run -v myvolume:/data myapp                # Mount a named volume
docker run --rm myapp                              # Auto-remove after it stops
docker run -m 512m --cpus="1.0" myapp              # Resource limits
docker run --restart unless-stopped myapp          # Restart policy
```

### Port Publishing

```
-p HOST_PORT:CONTAINER_PORT
```

| Example | Meaning |
|---|---|
| `-p 8080:80` | host:8080 → container:80 |
| `-p 3306:3306` | MySQL default mapping |
| `-p 8080:80 -p 8443:443` | Multiple ports |
| `-P` | Publish all `EXPOSE`d ports to random host ports |

`EXPOSE` in a Dockerfile only **documents** a port — it does not publish it. Only `-p`/`ports:` actually opens host access.

### Resource Limits

```bash
docker run -d --memory=512m --memory-swap=1g nginx
docker run -d --cpus="1.5" nginx
docker stats                       # Live CPU / memory / network usage
```

### Restart Policies

| Policy | Behavior |
|---|---|
| `no` (default) | Never restart automatically |
| `always` | Always restart, even after a manual stop + daemon reboot |
| `on-failure` | Restart only on non-zero exit code |
| `on-failure:3` | Retry a maximum of 3 times |
| `unless-stopped` | Restart automatically unless the user explicitly stopped it — **best for production** |

```bash
docker run -d --restart unless-stopped nginx
docker update --restart unless-stopped web   # Change policy on an existing container
```

### Logs, Exec & Inspect

```bash
docker logs c1                     # View logs
docker logs -f c1                  # Follow (tail -f style)
docker logs --tail 100 c1          # Last 100 lines
docker exec -it c1 bash            # Shell into a running container
docker exec c1 ls /app             # Run a single command
docker inspect c1                  # Full JSON metadata
docker top c1                      # Processes running inside
docker cp c1:/app/log.txt ./       # Copy container → host
docker cp ./file.txt c1:/app/      # Copy host → container
docker commit c1 my-snapshot       # Save a container's current state as a new image
```

---

## 6. Dockerfile

A Dockerfile is a script of build instructions, executed top-to-bottom to produce an image.

```dockerfile
FROM node:18-alpine        # Base image
WORKDIR /app                # Working directory inside the image
COPY package*.json ./       # Copy dependency manifests first (caching!)
RUN npm ci                  # Install dependencies
COPY . .                    # Copy the rest of the source code
EXPOSE 5000                 # Document the port the app listens on
CMD ["node", "server.js"]   # Default command when the container starts
```

**Caching rule:** Docker rebuilds a layer — and every layer after it — the moment anything in that instruction changes. Order instructions from **least-changing → most-changing** so dependency installs stay cached while only your source-code layer rebuilds on every code change.

| Instruction | Purpose |
|---|---|
| `FROM` | Sets the base image (and starts a new build stage) |
| `WORKDIR` | Sets/creates the working directory |
| `COPY` / `ADD` | Copies files into the image (`ADD` also handles URLs/tar extraction — prefer `COPY` unless you need that) |
| `RUN` | Executes a command at **build time**, creating a layer |
| `ENV` | Sets an environment variable baked into the image |
| `EXPOSE` | Documents a port (doesn't publish it) |
| `CMD` | Default command at **container start** (overridable) |
| `ENTRYPOINT` | Fixed executable a container always runs; `CMD` becomes its default args |
| `USER` | Runs subsequent instructions/the container as a non-root user |

---

## 7. Multi-Stage Builds

**Problem:** a single-stage build for a compiled/bundled app keeps the compiler, dev dependencies, and source code in the final image — often 800MB–1.5GB and a larger attack surface.

**Solution:** use multiple `FROM` statements — one stage to *build*, a second, minimal stage to *run* — and copy across only the finished artifact.

```mermaid
graph LR
    subgraph "Stage 1: builder"
    S1[node:18 full image] --> S2[npm ci + npm run build]
    end
    subgraph "Stage 2: production"
    S3[node:18-alpine, minimal] --> S4[COPY --from=builder /app/dist]
    end
    S2 -. "only /app/dist copied across" .-> S4
```

```dockerfile
# ---------- Stage 1: Build ----------
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Stage 2: Production ----------
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

**Key syntax**

| Syntax | Meaning |
|---|---|
| `FROM image AS name` | Starts and names a stage |
| `COPY --from=name` | Pulls files from an earlier stage |
| Last `FROM` | Becomes the final image that ships |

**React / static frontend example** (build with Node, serve with Nginx):

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Go example** (final image can be 10–20MB):

```dockerfile
FROM golang:1.21 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o main .

FROM alpine:latest
COPY --from=builder /app/main .
CMD ["./main"]
```

---

## 8. Networking

### Default Networks

```bash
docker network ls
```

| Network | Driver | Description |
|---|---|---|
| `bridge` | bridge | Default network for standalone containers |
| `host` | host | Container shares the host's network stack directly (no isolation) |
| `none` | null | No networking at all |
| `overlay` | overlay | Connects containers **across multiple hosts** (Swarm/orchestration) |

### Bridge Network & Port Publishing

```mermaid
graph TD
    Internet((Browser)) -- "localhost:3000" --> HostPort["Host Port 3000"]
    HostPort -- "-p 3000:3000" --> Backend["Backend Container :3000"]
    Backend -- "mongo:27017 (Docker DNS)" --> Mongo["MongoDB Container :27017"]
    Backend -- "redis:6379 (Docker DNS)" --> Redis["Redis Container :6379"]
    subgraph mern-network [Custom Bridge Network]
    Backend
    Mongo
    Redis
    end
```

**5 rules to never forget**

1. `localhost` inside a container refers to *that container itself*, never another container or the host.
2. Container-to-container communication uses **service/container name + container port** (e.g. `mongo:27017`), resolved via Docker's built-in DNS — this only works on a **user-defined** network, not the default bridge.
3. `-p HOST:CONTAINER` publishes a port across the host boundary — it's for *external* access, not needed for container-to-container traffic.
4. Containers on the same user-defined bridge network can talk to each other **without** publishing ports to the host.
5. For real applications, always create a custom network instead of relying on the default bridge:
   ```bash
   docker network create mern-network
   docker run -d --network mern-network --name mongo mongo:6
   docker run -d --network mern-network --name backend -p 5000:5000 my-backend
   ```

### Common Network Commands

```bash
docker network ls                       # List networks
docker network create mern-network      # Create a custom bridge network
docker network inspect mern-network     # See connected containers, subnet, etc.
docker network connect mern-network c1  # Attach a running container
docker network disconnect mern-network c1
docker network rm mern-network
```

---

## 9. Volumes & Storage

### Why Containers Are Ephemeral

By default, everything written inside a container lives in its **writable container layer**. Removing the container (`docker rm`) deletes that layer — and all the data with it.

| Storage location | Survives container removal? |
|---|---|
| Container's writable layer | ❌ No |
| Image layers | ✅ Yes (but read-only) |
| Volumes / bind mounts | ✅ Yes (stored outside the container) |

### Types of Persistence

| Type | Managed by Docker | Best for |
|---|---|---|
| **Named volumes** | Yes | Databases, production — recommended default |
| **Bind mounts** | No (you pick the host path) | Local development, live code reload |
| **tmpfs mounts** | Yes (RAM only) | Sensitive, short-lived data — never touches disk |

```bash
# Named volume — Docker manages storage location
docker run -d --name mongo -v mongo-data:/data/db mongo:6

# Bind mount — you control the host path (great for dev)
docker run -d --name web -v $(pwd)/src:/app/src myapp

# tmpfs — RAM-only, gone when the container stops
docker run -d --tmpfs /app/temp:rw,size=100m nginx
```

### Volume Management

```bash
docker volume create mongo-data
docker volume ls
docker volume inspect mongo-data
docker volume rm mongo-data
docker volume prune            # Remove all unused volumes
```

### Backup & Restore a Volume

```bash
# Backup
docker run --rm -v mongo-data:/data -v $(pwd):/backup ubuntu \
  tar cvf /backup/mongo-backup.tar /data

# Restore
docker run --rm -v mongo-data:/data -v $(pwd):/backup ubuntu \
  tar xvf /backup/mongo-backup.tar -C /
```

**Rule of thumb:** bind mounts for your source code while developing, named volumes for anything you need to persist (databases) in production.

---

## 10. Environment Variables & Secrets

**Never** hardcode secrets in your source code, Dockerfile, or a `docker run` command — Dockerfile values get baked permanently into image layers, and command-line values show up in shell history and `docker inspect`.

### Options, from basic to advanced

| Method | Security | Best for |
|---|---|---|
| `-e KEY=VALUE` | Low | Quick manual testing |
| `environment:` in Compose | Medium | Small projects |
| `.env` + `env_file` | Medium-High | Most projects (recommended default) |
| Docker Secrets (Swarm) | High | Production clusters |
| External secret managers (Vault, AWS Secrets Manager) | Very High | Enterprise |

### `.env` File Workflow

```env
# .env
MONGO_URI=mongodb://admin:secret123@mongodb:27017/mern?authSource=admin
JWT_SECRET=supersecretjwtkey
NODE_ENV=production
PORT=5000
```

```gitignore
# .gitignore
.env
.env.local
.env.production
```

```bash
docker run --env-file .env my-backend
```

```yaml
# compose.yaml
services:
  backend:
    build: ./backend
    env_file:
      - .env
```

Access inside the app:

```js
// Node.js
const mongoURI = process.env.MONGO_URI;
```
```python
# Python
import os
mongo_uri = os.getenv("MONGO_URI")
```

### Docker Secrets (Swarm)

```bash
echo "mySuperSecretJWT" | docker secret create jwt_secret -
docker service create --name backend --secret jwt_secret my-backend
# Mounted (not an env var) at: /run/secrets/jwt_secret
```

### Golden Rules

- Never commit `.env` to Git — always in `.gitignore`.
- Never `RUN echo $SECRET > file` or similar in a Dockerfile — it's permanently in the image history.
- Use different `.env` files per environment (`.env.development`, `.env.production`).
- Rotate secrets periodically; use a real secret manager in production.

---

## 11. Docker Compose

Docker Compose defines and runs **multi-container applications** from a single YAML file, replacing long chains of `docker run` commands.

```mermaid
graph TD
    Y[compose.yaml] --> S1[Service: frontend]
    Y --> S2[Service: backend]
    Y --> S3[Service: mongodb]
    Y --> S4[Service: redis]
    S1 -.same network, DNS by name.- S2
    S2 -.same network, DNS by name.- S3
    S2 -.same network, DNS by name.- S4
```

### Full MERN + Redis Example

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - mern-net

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret123
    volumes:
      - mongodb-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - mern-net

  redis:
    image: redis:alpine
    networks:
      - mern-net

networks:
  mern-net:

volumes:
  mongodb-data:
```

### Key Sections

| Section | Purpose |
|---|---|
| `services` | Each container your app needs (build or pull) |
| `image` | Use a pre-built image |
| `build` | Build from a local Dockerfile instead |
| `ports` | `"HOST:CONTAINER"` publishing |
| `environment` / `env_file` | Configuration & secrets |
| `volumes` | Persistent storage |
| `networks` | Custom networks for DNS-based service discovery |
| `depends_on` | Startup ordering (add `condition: service_healthy` to wait for readiness, not just process start) |
| `restart` | Restart policy per service |

### Compose DNS

Inside Compose, every service can reach another simply by its **service name** — no IP addresses, no manual networking. `backend` connects to Mongo at `mongodb://mongodb:27017`, not `localhost:27017`.

### Essential Commands

```bash
docker compose up              # Start everything (attached)
docker compose up -d           # Start in background
docker compose up --build      # Rebuild images before starting
docker compose down            # Stop and remove containers/networks
docker compose down -v         # Also remove volumes (⚠️ deletes data)
docker compose ps              # List running services
docker compose logs -f         # Follow logs from all services
docker compose exec backend bash   # Shell into a running service
```

---

## 12. Image & Build Optimization

Five techniques that matter most in real projects and interviews:

### 1. Order Dockerfile Instructions for Caching

```dockerfile
# ❌ Bad: any code change reruns npm install
COPY . .
RUN npm install

# ✅ Good: dependency layer stays cached across code changes
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

### 2. Always Use `.dockerignore`

Smaller build context → faster builds and no accidental copying of `.env`, `.git`, or `node_modules`.

### 3. `npm ci` over `npm install`

| Command | Speed | Reliability | Use case |
|---|---|---|---|
| `npm install` | Slower | Medium | General dev |
| `npm ci` | Faster | High — strict `package-lock.json`, clean install | CI/CD & Docker builds |

### 4. Multi-Stage Builds

See [Section 7](#7-multi-stage-builds) — keeps build tools and source code out of the shipped image.

### 5. Minimal Base Images

| Base image | Approx. size | Recommendation |
|---|---|---|
| `node:18` | ~900 MB | Avoid for production |
| `node:18-slim` | ~200 MB | Good |
| `node:18-alpine` | ~120 MB | **Best for most cases** |
| `nginx:alpine` | ~40 MB | Excellent |
| `python:3.11-alpine` | ~50 MB | Excellent |

### Complete Optimized Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

**Checklist:** order least→most changing · use `.dockerignore` · `npm ci` · multi-stage · alpine/slim base · clean cache · non-root user.

---

## 13. Production Best Practices

### Dev vs Production

| Aspect | Development | Production |
|---|---|---|
| Image | Full, includes dev tools | Minimal, multi-stage, alpine |
| Restart policy | `no` | `unless-stopped` |
| Volumes | Bind mounts (live reload) | Named volumes (data only) |
| Secrets | Plain `.env` is fine | `.env` + secret manager |
| Logging | Console | Centralized logging driver |
| Resource limits | Optional | Mandatory |

### Checklist

- ✅ Use optimized, multi-stage, minimal-base images
- ✅ Always set `--restart unless-stopped`
- ✅ Add health checks (`HEALTHCHECK` in Dockerfile or `healthcheck:` in Compose)
- ✅ Set memory/CPU limits so one container can't starve the host
- ✅ Never store persistent data inside a container — always a volume
- ✅ Centralize logs (don't rely on `docker logs` alone at scale)
- ✅ Put a reverse proxy (Nginx/Traefik) in front for TLS termination and routing
- ✅ Run as a non-root user
- ✅ Scan images for vulnerabilities before shipping

### Typical Production Architecture

```mermaid
graph TD
    Internet((Internet)) -->|HTTPS 443| Proxy[Nginx / Traefik<br/>Reverse Proxy + TLS]
    Proxy --> FE[Frontend Container]
    Proxy --> BE[Backend Container]
    BE --> DB[(MongoDB<br/>+ Named Volume)]
    BE --> Cache[(Redis)]
```

### Sample Production `compose.yaml` Snippet

```yaml
services:
  backend:
    build: ./backend
    restart: unless-stopped
    env_file: .env
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - app-net

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - backend
    networks:
      - app-net

networks:
  app-net:
```

---

## 14. Debugging Cheatsheet

### Container exits immediately

```bash
docker ps -a                 # Check exit code
docker logs <container>      # See why it crashed
docker inspect <container>   # Check the configured CMD/ENTRYPOINT
docker run -it <image> sh    # Run interactively to poke around
```
Common causes: missing `CMD`, the main process crashed on startup, wrong file paths, missing environment variables.

### Backend can't connect to MongoDB

```bash
docker network inspect mern-net              # Are both containers on the same network?
docker exec -it backend ping mongo           # Does the name resolve?
docker exec -it backend sh -c "nc -zv mongo 27017"   # Is the port reachable?
docker logs mongo                             # Is Mongo actually healthy?
```
Common causes: using `localhost` instead of the service name, containers on different networks, Mongo not fully started yet (fix with `depends_on` + `healthcheck`), wrong credentials in the connection string.

### Quick reference

```bash
docker ps -a                       # See everything, including exited containers
docker logs -f <container>         # Live logs
docker exec -it <container> sh     # Get a shell (use `sh` if `bash` isn't installed, e.g. alpine)
docker inspect <container>         # Full config/state dump
docker stats                       # Live resource usage
docker system df                   # Disk usage by images/containers/volumes
docker system prune -a             # Nuke unused everything (careful!)
```

---

## 15. Full Command Cheatsheet

```bash
### Info
docker --version
docker version
docker info

### Images
docker pull <image>
docker images
docker rmi <image>
docker tag <old> <new>
docker push <image>
docker history <image>
docker inspect <image>
docker build -t name:tag .

### Containers — lifecycle
docker run <image>
docker create --name c1 <image>
docker start c1
docker stop c1
docker kill c1
docker restart c1
docker rm c1
docker rm -f c1
docker rename old new

### Running options
docker run -d <image>
docker run -it <image> bash
docker run -p HOST:CONTAINER <image>
docker run -e KEY=VALUE <image>
docker run --env-file .env <image>
docker run --name myapp <image>
docker run -v vol:/data <image>
docker run --rm <image>
docker run -m 512m --cpus="1.0" <image>
docker run --restart unless-stopped <image>

### Logs / exec / inspect
docker logs c1
docker logs -f c1
docker exec -it c1 bash
docker inspect c1
docker stats
docker top c1
docker cp c1:/path ./local
docker commit c1 new-image

### Networks
docker network ls
docker network create mynet
docker network inspect mynet
docker network connect mynet c1
docker network rm mynet

### Volumes
docker volume ls
docker volume create myvol
docker volume inspect myvol
docker volume rm myvol
docker volume prune

### Cleanup
docker container prune
docker image prune
docker volume prune
docker system prune -a

### Compose
docker compose up -d
docker compose up --build
docker compose down
docker compose down -v
docker compose ps
docker compose logs -f
docker compose exec <service> bash
```

---

## 16. Interview Q&A Quick Fire

**Q: What is Docker?**
A platform for packaging an application and its dependencies into a portable, isolated container that runs consistently across environments.

**Q: Container vs Image?**
An image is a read-only template; a container is a running (or stopped) instance created from that image, with its own writable layer.

**Q: Container vs VM?**
A VM virtualizes hardware and runs a full guest OS via a hypervisor; a container shares the host kernel and isolates processes, making it far lighter and faster to start.

**Q: Why does `localhost` not work between containers?**
Inside a container, `localhost` refers to that container's own network namespace — never another container. Use the service/container name over a shared Docker network instead.

**Q: `EXPOSE` vs `-p`?**
`EXPOSE` just documents which port the app listens on inside the image. `-p HOST:CONTAINER` actually publishes/maps that port to the host.

**Q: Do containers need port mapping to talk to each other?**
No — containers on the same user-defined network communicate directly over the container port via Docker's built-in DNS.

**Q: Why use multi-stage builds?**
To keep build tools, dev dependencies, and source code out of the final image — smaller size, smaller attack surface, faster deploys.

**Q: Named volume vs bind mount?**
A named volume is fully managed by Docker (best for databases/production); a bind mount maps a specific host folder into the container (best for live-reload development).

**Q: Why avoid hardcoding secrets in a Dockerfile?**
`RUN`/`ENV` values are baked permanently into image layers and can be extracted by anyone with the image, even after the value is "removed" in a later step.

**Q: `docker stop` vs `docker kill`?**
`stop` sends `SIGTERM` and waits (default ~10s) for graceful shutdown before force-killing; `kill` sends `SIGKILL` immediately.

**Q: What does `--restart unless-stopped` do?**
Automatically restarts the container on crash or daemon/host reboot, unless a user explicitly stopped it — the standard production choice.

---

## 17. Mini Project — Dockerize a Node + MongoDB App

A small, complete project that ties together: multi-stage build, `.dockerignore`, environment variables, a custom network, a named volume, and Docker Compose.

### Project Structure

```
todo-api/
├── .env
├── .gitignore
├── .dockerignore
├── compose.yaml
└── backend/
    ├── Dockerfile
    ├── package.json
    └── server.js
```

### `backend/server.js` (minimal Express + MongoDB API)

```js
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const Todo = mongoose.model("Todo", { text: String, done: Boolean });

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/todos", async (req, res) => {
  res.json(await Todo.find());
});

app.post("/todos", async (req, res) => {
  const todo = await Todo.create({ text: req.body.text, done: false });
  res.status(201).json(todo);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
```

### `backend/package.json`

```json
{
  "name": "todo-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": { "start": "node server.js" },
  "dependencies": {
    "express": "^4.19.2",
    "mongoose": "^8.5.0"
  }
}
```

### `backend/Dockerfile` (multi-stage, optimized)

```dockerfile
# ---------- Stage 1: install deps ----------
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# ---------- Stage 2: production ----------
FROM node:18-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
EXPOSE 5000
CMD ["node", "server.js"]
```

### `.dockerignore`

```dockerignore
node_modules
npm-debug.log
.git
.env
Dockerfile
.dockerignore
```

### `.env`

```env
MONGO_URI=mongodb://admin:secret123@mongodb:27017/tododb?authSource=admin
PORT=5000
```

### `compose.yaml`

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    depends_on:
      mongodb:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - todo-net

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret123
    volumes:
      - mongodb-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - todo-net

networks:
  todo-net:

volumes:
  mongodb-data:
```

### Run It

```bash
docker compose up -d --build     # Build and start both services
docker compose ps                # Confirm both are running/healthy
curl http://localhost:5000/health
curl -X POST http://localhost:5000/todos -H "Content-Type: application/json" -d '{"text":"Learn Docker"}'
curl http://localhost:5000/todos
docker compose logs -f backend   # Watch logs
docker compose down              # Stop everything (data survives — it's in the volume)
docker compose down -v           # Stop AND wipe the volume (fresh start)
```

### What This Project Demonstrates

| Concept | Where it's used |
|---|---|
| Multi-stage build | `backend/Dockerfile` — deps stage vs production stage |
| Layer caching | `package.json` copied before the rest of the source |
| `.dockerignore` | Keeps `node_modules`/`.env` out of the build context |
| Env vars & secrets | `.env` + `env_file` — never hardcoded |
| Named volume | `mongodb-data` — DB survives container recreation |
| Custom network + DNS | `todo-net` — backend reaches Mongo via `mongodb:27017`, not an IP |
| Health checks | Compose waits for Mongo to be actually ready, not just started |
| Restart policy | `unless-stopped` on both services |
| Non-root user | `appuser` in the final image |

**Next steps to extend it yourself:** add a React frontend as a third service, put Nginx in front as a reverse proxy with TLS, add resource limits, and push the backend image to Docker Hub.
