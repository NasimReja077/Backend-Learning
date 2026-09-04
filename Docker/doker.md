**Docker Containers Lifecycle – Complete In-Depth Study Guide**

This guide explains everything about the **lifecycle of a Docker container** in detail, with commands and clear explanations.

---

### 1. Container Lifecycle Overview

A container goes through different states:

```
Created → Running → Paused → Stopped → Deleted
```

| State       | Meaning                              | Command used          |
|-------------|--------------------------------------|-----------------------|
| Created     | Container is created but not started | `docker create`       |
| Running     | Container is active                  | `docker start` / `run`|
| Paused      | Process is suspended                 | `docker pause`        |
| Stopped     | Container has stopped                | `docker stop`         |
| Deleted     | Completely removed                   | `docker rm`           |

---

### 2. Creating, Starting, Stopping & Removing Containers

#### Create + Start (Most Common)
```bash
docker run <image>
```

#### Create only (without starting)
```bash
docker create --name mycontainer nginx
```

#### Start a stopped container
```bash
docker start mycontainer
```

#### Stop a running container (Graceful)
```bash
docker stop mycontainer
```
- Sends `SIGTERM` signal
- Waits 10 seconds (default) then force kills if needed

#### Force stop (Immediate)
```bash
docker kill mycontainer
```

#### Restart container
```bash
docker restart mycontainer
```

#### Remove container
```bash
docker rm mycontainer              # Remove stopped container
docker rm -f mycontainer           # Force remove running container
```

#### Remove all stopped containers
```bash
docker container prune
```

---

### 3. Attached vs Detached Mode

| Mode          | Flag | Behavior                              | Use Case                     |
|---------------|------|---------------------------------------|------------------------------|
| **Attached**  | (default) | Logs appear in your terminal         | Debugging, interactive use  |
| **Detached**  | `-d` | Runs in background                    | Real applications, servers  |

**Examples:**

```bash
# Attached mode (default)
docker run nginx
# You will see Nginx logs in terminal. Press Ctrl+C to stop.

# Detached mode (Recommended for real apps)
docker run -d --name web nginx
```

**Interactive Mode (for shells):**
```bash
docker run -it ubuntu bash
```
- `-i` → Interactive (keeps STDIN open)
- `-t` → Allocate a terminal

---

### 4. Port Publishing & Mapping

By default, ports inside a container are **not accessible** from the host.

You must **publish** them using `-p`.

```bash
docker run -d -p 8080:80 --name web nginx
```

**Syntax:**
```bash
-p HOST_PORT:CONTAINER_PORT
```

| Example                    | Meaning                                      |
|---------------------------|----------------------------------------------|
| `-p 8080:80`              | Host 8080 → Container 80                     |
| `-p 80:80`                | Host 80 → Container 80                       |
| `-p 3306:3306`            | MySQL default port                           |
| `-p 8080:80 -p 8443:443`  | Map multiple ports                           |
| `-P`                      | Publish all exposed ports on random host ports |

**Check port mapping:**
```bash
docker port web
docker ps
```

---

### 5. Environment Variables & Secrets

#### Using Environment Variables (`-e`)

```bash
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=secret123 \
  -e MYSQL_DATABASE=mydb \
  mysql:8.0
```

**Multiple ways:**

```bash
# Method 1: Multiple -e
docker run -e KEY1=value1 -e KEY2=value2 nginx

# Method 2: Using env file
docker run --env-file ./config.env nginx
```

**Example `config.env` file:**
```env
MYSQL_ROOT_PASSWORD=secret123
MYSQL_DATABASE=mydb
NODE_ENV=production
```

#### Important Notes on Secrets:
- Avoid passing sensitive data (passwords, API keys) directly in commands.
- Prefer:
  - Environment files
  - Docker Secrets (in Swarm)
  - External secret managers (AWS Secrets Manager, Vault, etc.)

---

### 6. Resource Limits (CPU & Memory)

By default, a container can use **unlimited** host resources. In production, always set limits.

#### Memory Limits
```bash
docker run -d --name web -m 512m nginx          # Maximum 512 MB
docker run -d --name web --memory=1g nginx      # Maximum 1 GB
docker run -d --memory=512m --memory-swap=1g nginx
```

#### CPU Limits
```bash
docker run -d --cpus="1.5" nginx                # Use maximum 1.5 CPU cores
docker run -d --cpu-shares=512 nginx            # Relative CPU weight
```

**Useful combination:**
```bash
docker run -d \
  --name limited-app \
  --memory=512m \
  --cpus="1.0" \
  nginx
```

**Check resource usage:**
```bash
docker stats
```

---

### 7. Restart Policies

Restart policies control what happens when a container exits.

```bash
docker run -d --restart <policy> nginx
```

| Policy            | Meaning                                              | Common Use Case       |
|-------------------|------------------------------------------------------|-----------------------|
| `no`              | Do not restart (default)                             | Testing               |
| `always`          | Always restart                                       | Critical services     |
| `on-failure`      | Restart only if exits with non-zero code             | Most applications     |
| `on-failure:3`    | Restart maximum 3 times on failure                   | Controlled retries    |
| `unless-stopped`  | Always restart unless manually stopped               | Production (Best)     |

**Recommended for Production:**
```bash
docker run -d --name web --restart unless-stopped -p 80:80 nginx
```

**Update restart policy of existing container:**
```bash
docker update --restart unless-stopped web
```

---

### 8. Complete Practical Example

```bash
# Run a production-ready Nginx container
docker run -d \
  --name my-website \
  --restart unless-stopped \
  -p 8080:80 \
  -e NGINX_HOST=localhost \
  -m 256m \
  --cpus="0.5" \
  nginx:1.25-alpine
```

**Useful related commands:**
```bash
docker ps                          # See running containers
docker ps -a                       # See all containers
docker logs -f my-website          # Follow logs
docker exec -it my-website bash    # Enter container
docker stop my-website
docker rm my-website
```

---

### 9. Summary Table (Quick Revision)

| Task                      | Command                                      |
|---------------------------|----------------------------------------------|
| Create + Start            | `docker run`                                 |
| Start                     | `docker start`                               |
| Stop                      | `docker stop`                                |
| Force Kill                | `docker kill`                                |
| Restart                   | `docker restart`                             |
| Remove                    | `docker rm` / `docker rm -f`                 |
| Detached Mode             | `docker run -d`                              |
| Interactive Mode          | `docker run -it`                             |
| Port Mapping              | `-p HOST:CONTAINER`                          |
| Environment Variable      | `-e KEY=VALUE`                               |
| Memory Limit              | `-m 512m`                                    |
| CPU Limit                 | `--cpus="1.5"`                               |
| Restart Policy            | `--restart unless-stopped`                   |

---

Would you like me to continue with the next topic in the same depth?

**Next recommended topics:**
1. Docker Volumes (Data Persistence)
2. Docker Networking
3. Docker Compose

Just reply with the topic name.
----------------------
**Docker Networking – Complete In-Depth Study Guide**  
*(Very Important – Especially for MERN Stack)*

Docker Networking allows containers to communicate with each other and with the outside world. This is one of the **most important topics** for real-world applications (especially MERN: MongoDB + Express + React + Node).

---

### 1. What is Docker Networking?

When Docker is installed, it creates a virtual network so that containers can talk to:
- Each other
- The host machine
- The external internet

Docker uses **network drivers** to provide different types of networking.

---

### 2. Default Networks in Docker

When you install Docker, it automatically creates **3 default networks**:

| Network   | Driver  | Description                                      | Use Case                          |
|-----------|---------|--------------------------------------------------|-----------------------------------|
| **bridge**    | bridge  | Default network for containers                   | Most common                       |
| **host**      | host    | Container shares host’s network stack            | High performance, special cases   |
| **none**      | null    | No networking (complete isolation)               | Security / testing                |

**Check default networks:**
```bash
docker network ls
```

---

### 3. Bridge Network (Default)

- This is the **default network**.
- Every container gets attached to a private internal network.
- Containers get a private IP (usually `172.17.x.x`).
- Containers can talk to each other using **IP address** (not recommended).
- To access from host machine → You need **port mapping** (`-p`).

**Example:**
```bash
docker run -d --name web1 nginx
docker run -d --name web2 nginx
```

Both containers are on the default `bridge` network.

---

### 4. Host Network

```bash
docker run -d --network host --name web nginx
```

- Container shares the **host’s network** directly.
- No isolation.
- Ports are opened directly on the host (no need of `-p`).
- Best performance.
- Less secure (not recommended for most cases).

---

### 5. None Network

```bash
docker run -d --network none --name isolated nginx
```

- Container has **no network interface**.
- Completely isolated.
- Used for high security scenarios.

---

### 6. User-Defined Bridge Networks (Most Important)

Default bridge network has limitations.  
**Always create your own custom bridge network** for real applications.

**Create a custom network:**
```bash
docker network create mern-network
```

**Run containers on custom network:**
```bash
docker run -d --name mongodb --network mern-network mongo
docker run -d --name backend --network mern-network my-node-app
docker run -d --name frontend --network mern-network my-react-app
```

---

### 7. Container-to-Container Communication

On a **user-defined bridge network**, containers can communicate using **container name** (DNS).

**Example (MERN Stack):**

```bash
# Backend can connect to MongoDB using hostname "mongodb"
mongodb://mongodb:27017/mydb
```

This is possible because Docker provides **automatic DNS resolution** on custom networks.

---

### 8. DNS Resolution Between Containers

On custom bridge networks:
- Docker runs an embedded DNS server.
- You can reach other containers using their **name**.

```bash
docker exec -it backend ping mongodb
docker exec -it backend ping frontend
```

**Note:** This does **not** work properly on the default `bridge` network.

---

### 9. Port Publishing / Port Mapping

Even if containers are on the same network, to access a container from **outside** (browser/host), you need port mapping.

```bash
docker run -d \
  --name frontend \
  --network mern-network \
  -p 3000:3000 \
  my-react-app
```

**Syntax:**
```bash
-p HOST_PORT:CONTAINER_PORT
```

| Mapping           | Meaning                            |
|-------------------|------------------------------------|
| `-p 3000:3000`    | Host 3000 → Container 3000         |
| `-p 80:3000`      | Host 80 → Container 3000           |
| `-p 8080:80`      | Host 8080 → Container 80           |

---

### 10. Network Drivers Explained

| Driver     | Description                                      | When to Use                      |
|------------|--------------------------------------------------|----------------------------------|
| **bridge**     | Default, single host networking                  | Most common (Development + Production on single server) |
| **host**       | Uses host network directly                       | Maximum performance              |
| **none**       | No networking                                    | High isolation                   |
| **overlay**    | Multi-host networking (Swarm/Kubernetes)         | Docker Swarm / multi-server      |
| **macvlan**    | Assigns MAC address (appears as physical device) | Legacy apps needing direct LAN access |

---

### 11. Important Network Commands

```bash
# List all networks
docker network ls

# Create a custom network
docker network create mern-network
docker network create --driver bridge my-network

# Inspect a network (Very useful)
docker network inspect mern-network
docker network inspect bridge

# Connect a running container to a network
docker network connect mern-network mycontainer

# Disconnect from network
docker network disconnect mern-network mycontainer

# Remove a network
docker network rm mern-network

# Remove all unused networks
docker network prune
```

---

### 12. Real MERN Stack Networking Example

```bash
# 1. Create custom network
docker network create mern-net

# 2. Run MongoDB
docker run -d \
  --name mongodb \
  --network mern-net \
  -v mongo-data:/data/db \
  mongo:6

# 3. Run Backend (Node + Express)
docker run -d \
  --name backend \
  --network mern-net \
  -p 5000:5000 \
  -e MONGO_URL=mongodb://mongodb:27017/mern \
  my-backend-image

# 4. Run Frontend (React)
docker run -d \
  --name frontend \
  --network mern-net \
  -p 3000:3000 \
  my-frontend-image
```

**Communication Flow:**
- React (Frontend) → calls → `http://backend:5000/api`
- Backend → connects to → `mongodb://mongodb:27017`

---

### 13. Key Differences: Default Bridge vs User-Defined Bridge

| Feature                      | Default Bridge      | User-Defined Bridge     |
|-----------------------------|---------------------|-------------------------|
| DNS Resolution by name      | Poor / Not reliable | Excellent               |
| Automatic DNS               | No                  | Yes                     |
| Recommended for production  | No                  | Yes                     |
| Container communication     | Using IP only       | Using container name    |
| Isolation                   | Low                 | Better                  |

**Rule:** Always create a **user-defined network** for multi-container applications.

---

### 14. Summary – Most Important Points

| Concept                        | Key Point |
|--------------------------------|---------|
| Default Network                | `bridge` |
| Best Practice                  | Create your own network |
| Container Communication        | Use container name (DNS) |
| Access from Host/Browser       | Use `-p` port mapping |
| MERN Recommendation            | One custom bridge network for all services |
| Inspect Network                | `docker network inspect` |
| Most Used Driver               | `bridge` |

---

### Practice Commands (Do These)

```bash
docker network ls
docker network create app-network
docker run -d --name box1 --network app-network alpine sleep 3600
docker run -d --name box2 --network app-network alpine sleep 3600
docker exec -it box1 ping box2
docker network inspect app-network
```

---

Would you like me to continue with the next highly important topic?

**Recommended Next:**
1. **Docker Volumes** (Data Persistence) ⭐⭐⭐⭐
2. **Docker Compose** (Most important for MERN)

Just reply with the topic name.
-------------
# Docker Networking ⭐⭐⭐⭐ — Complete Study Guide

Docker networking is **extremely important for MERN applications**, especially when you move from:

```text
React + Node + MongoDB
```

to:

```text
React Container
      │
      ▼
Node/Express Container
      │
      ▼
MongoDB Container
```

The key idea is:

> **Containers communicate with each other through Docker networks, while users outside Docker usually access containers through published ports.**

---

# 1. What is Docker Networking?

Docker networking allows:

* Containers to communicate with each other
* Containers to communicate with the host
* Containers to communicate with the internet
* External users to access containerized applications
* Services to find each other using DNS

Without networking:

```text
React Container       ❌       Backend Container
                               │
                               ❌
                           MongoDB
```

With Docker networking:

```text
             Docker Network
        ┌──────────────────────┐
        │                      │
        │  React ──► Backend   │
        │              │       │
        │              ▼       │
        │           MongoDB     │
        │                      │
        └──────────────────────┘
```

---

# 2. Real MERN Architecture

Suppose you have:

```text
Frontend
React
Port 5173

Backend
Node + Express
Port 3000

Database
MongoDB
Port 27017
```

Without Docker:

```text
Browser
   │
   ▼
localhost:5173
   │
   ▼
React
   │
   ▼
localhost:3000
   │
   ▼
Express
   │
   ▼
localhost:27017
   │
   ▼
MongoDB
```

With Docker:

```text
                     Docker Host
                         │
                ┌────────┴─────────┐
                │   Docker Network │
                │                  │
                │  React           │
                │    │             │
                │    ▼             │
                │ Backend           │
                │    │             │
                │    ▼             │
                │ MongoDB           │
                │                  │
                └──────────────────┘
```

This distinction is very important:

### External access

```text
localhost:3000
```

### Container-to-container access

```text
backend:3000
```

You normally use the **container/service name**, not `localhost`, for communication between containers on the same user-defined network.

---

# 3. Docker Network Commands

The main command is:

```bash
docker network
```

Run:

```bash
docker network --help
```

You'll see commands such as:

```text
connect
create
disconnect
inspect
ls
prune
rm
```

---

# 4. List Docker Networks

```bash
docker network ls
```

Example:

```text
NETWORK ID     NAME      DRIVER    SCOPE
abc123         bridge    bridge    local
def456         host      host      local
ghi789         none      null      local
```

Docker normally creates the default networks:

```text
bridge
host
none
```

---

# 5. Default Docker Networks ⭐⭐⭐⭐

Docker provides built-in/default network types including:

```text
bridge
host
none
```

Let's understand each.

---

# 6. Bridge Network ⭐⭐⭐⭐⭐

The default `bridge` network is the standard network available on a typical Docker installation.

If you run:

```bash
docker run -d nginx
```

without specifying `--network`, Docker normally connects the container to the default `bridge` network.

Conceptually:

```text
Docker Host
│
└── docker0 bridge
      │
      ├── Container A
      │
      └── Container B
```

---

# 7. Default Bridge Network

Check:

```bash
docker network inspect bridge
```

You can see:

* Network ID
* Driver
* Subnet
* Gateway
* Connected containers
* Configuration

---

# 8. Important Problem With Default Bridge

The default `bridge` network has limitations compared with a **user-defined bridge network**.

One particularly important difference is automatic container-name DNS resolution.

On the default bridge network, you should not design your application assuming that arbitrary container names will automatically resolve the same way they do on a user-defined bridge.

Instead, create your own network.

---

# 9. User-Defined Bridge Network ⭐⭐⭐⭐⭐

Create one:

```bash
docker network create my-network
```

Check:

```bash
docker network ls
```

You should see:

```text
NETWORK ID     NAME          DRIVER
abc123         bridge        bridge
def456         my-network    bridge
```

Notice:

```text
my-network
    │
    └── DRIVER = bridge
```

A user-defined bridge network is still a **bridge network**, but Docker gives you better service-to-service networking behavior.

---

# 10. Run Containers on Custom Network

Run MongoDB:

```bash
docker run -d \
  --name mongo \
  --network my-network \
  mongo
```

PowerShell one-line version:

```powershell
docker run -d --name mongo --network my-network mongo
```

Now run backend:

```powershell
docker run -d --name backend --network my-network my-backend
```

Architecture:

```text
                my-network
       ┌─────────────────────────┐
       │                         │
       │  backend ───────── mongo │
       │                         │
       └─────────────────────────┘
```

---

# 11. Container-to-Container Communication ⭐⭐⭐⭐⭐

This is one of the most important concepts.

Suppose:

```text
Container A
name = backend

Container B
name = mongo
```

Both are connected to:

```text
my-network
```

Backend can communicate with MongoDB using:

```text
mongo
```

instead of:

```text
localhost
```

For example:

```text
mongodb://mongo:27017/mydatabase
```

---

# 12. Why NOT `localhost`?

This is a common beginner mistake.

Inside the backend container:

```text
localhost
```

means:

> **the backend container itself**

It does NOT mean your MongoDB container.

Imagine:

```text
Backend Container
┌─────────────────────┐
│ localhost            │
│      │               │
│      ▼               │
│ Backend itself       │
└─────────────────────┘
```

MongoDB is somewhere else:

```text
Backend Container             Mongo Container
┌───────────────┐             ┌───────────────┐
│ localhost     │             │ MongoDB       │
│      ❌       │             │               │
└───────────────┘             └───────────────┘
        │
        │
        └──── Docker Network ────►
```

Therefore:

```text
localhost:27017
```

is generally wrong for backend → MongoDB container communication.

Instead:

```text
mongo:27017
```

---

# 13. MERN Example

Suppose your backend `.env` currently has:

```env
MONGO_URI=mongodb://localhost:27017/myapp
```

This may work when Node runs directly on your host.

But if Node is inside a Docker container and MongoDB is another container:

```env
MONGO_URI=mongodb://mongo:27017/myapp
```

because:

```text
mongo
  │
  └── MongoDB container name/DNS name
```

---

# 14. Docker DNS ⭐⭐⭐⭐⭐

Docker provides DNS-based service discovery on user-defined networks.

Suppose:

```bash
docker run -d --name mongo --network my-network mongo
```

Then another container on:

```text
my-network
```

can generally resolve:

```text
mongo
```

to the MongoDB container's network address.

Conceptually:

```text
Backend
   │
   │ DNS lookup: mongo
   ▼
Docker DNS
   │
   ▼
Mongo Container IP
```

You don't need to manually find the IP.

---

# 15. Why Container IPs Should Usually NOT Be Hardcoded

You might inspect:

```bash
docker inspect mongo
```

and find:

```text
172.x.x.x
```

You could technically use:

```text
mongodb://172.x.x.x:27017
```

But don't build your application around that.

Why?

Container IPs can change.

Use:

```text
mongodb://mongo:27017
```

instead.

Docker's internal DNS resolves the name.

---

# 16. Test DNS

Run a temporary container on your custom network:

```bash
docker run --rm --network my-network busybox nslookup mongo
```

If the image/tool supports it, you'll see that `mongo` resolves to an address.

You can also use:

```bash
docker run --rm --network my-network busybox ping -c 3 mongo
```

depending on the image/tooling available.

---

# 17. Container Name = DNS Name?

On a user-defined network, Docker provides name-based service discovery. A container can commonly be reached by its container name, and network aliases can provide additional names.

For example:

```bash
docker run -d \
  --name mongodb \
  --network my-network \
  mongo
```

Another container can use:

```text
mongodb:27017
```

---

# 18. Network Alias

You can also provide an alias:

```bash
docker network connect \
  --alias database \
  my-network \
  mongodb
```

Then the container may be reachable as:

```text
database
```

So:

```text
mongodb
   │
   ├── mongodb:27017
   │
   └── database:27017
```

---

# 19. Port Publishing ⭐⭐⭐⭐⭐

This command:

```bash
docker run -p 3000:3000 myapp
```

publishes a container port to the host.

Structure:

```text
-p HOST_PORT:CONTAINER_PORT
```

Therefore:

```bash
-p 3000:3000
```

means:

```text
Host port 3000
       │
       ▼
Container port 3000
```

---

# 20. Port Mapping Diagram

```text
                  HOST
           localhost:3000
                  │
                  │
             Port Mapping
                  │
                  ▼
             CONTAINER
               :3000
                  │
                  ▼
              Express
```

---

# 21. Different Host and Container Ports

You can do:

```bash
docker run -p 8080:3000 myapp
```

Meaning:

```text
Host       Container
8080  ───► 3000
```

User accesses:

```text
http://localhost:8080
```

Application listens inside container on:

```text
3000
```

---

# 22. Do Containers Need Published Ports to Talk to Each Other?

**No.**

This is extremely important.

Suppose:

```text
backend → mongo
```

Both are connected to:

```text
my-network
```

Backend can access:

```text
mongo:27017
```

without:

```bash
-p 27017:27017
```

The `-p` option is primarily for exposing a container service through the host/network boundary.

---

# 23. Example: MongoDB

You might run:

```bash
docker run -d \
  --name mongo \
  --network my-network \
  mongo
```

You don't necessarily need:

```bash
-p 27017:27017
```

if **only other containers** need to access MongoDB.

Backend:

```text
mongodb://mongo:27017/myapp
```

works through the Docker network.

---

# 24. When Should You Publish MongoDB Port?

If you want to connect from your host machine using:

* MongoDB Compass
* local scripts
* local Node application

then publish:

```bash
docker run -d \
  --name mongo \
  --network my-network \
  -p 27017:27017 \
  mongo
```

Now:

```text
Host
localhost:27017
      │
      ▼
Mongo Container
27017
```

---

# 25. Internal Port vs Published Port

Remember:

```text
CONTAINER PORT
```

is not the same thing as:

```text
HOST PORT
```

Example:

```bash
docker run -p 8080:3000 myapp
```

```text
8080 = Host
3000 = Container
```

---

# 26. `EXPOSE` vs `-p`

Another interview favorite.

Dockerfile:

```dockerfile
EXPOSE 3000
```

means:

> The application intends to listen on port 3000.

It does **not** publish the port.

You still need:

```bash
docker run -p 3000:3000 myapp
```

So:

```text
EXPOSE
   ↓
Documentation / image metadata

-p
   ↓
Actual host-to-container port publishing
```

---

# 27. `-P` vs `-p`

### Lowercase `-p`

You specify the mapping:

```bash
docker run -p 8080:3000 myapp
```

### Uppercase `-P`

Docker publishes exposed ports to automatically selected host ports.

Example:

```bash
docker run -P myapp
```

If the image contains:

```dockerfile
EXPOSE 3000
```

Docker may map container port `3000` to an automatically selected host port.

Check:

```bash
docker ps
```

---

# 28. Host Network ⭐⭐⭐

Docker also provides the `host` network driver.

On Linux, host networking means the container uses the host's network namespace rather than getting its own isolated network namespace in the normal bridge-style way.

Run:

```bash
docker run --network host nginx
```

Conceptually:

```text
Normal bridge:

Host
 │
 ├── Docker network
 │      │
 │      └── Container
 │
 └── Port mapping


Host network:

Host Network
     │
     └── Container
```

---

# 29. Host Network Important Point

With host networking, the container shares the host network stack.

Therefore:

```bash
-p
```

doesn't work in the usual port-publishing sense because there isn't a separate container network namespace requiring that mapping.

The application listens directly on the host's network interfaces/ports according to the platform's host-networking support.

---

# 30. Host Network on Docker Desktop

You're using **Windows**, so this is important.

Docker Desktop runs Linux containers inside a Linux VM/WSL-based environment. Host networking behavior on Docker Desktop is not identical to native Linux in every respect.

So for learning MERN applications:

> Focus primarily on **user-defined bridge networks**.

That's the networking model you'll use most often for a normal Dockerized MERN stack.

---

# 31. None Network ⭐⭐⭐

The `none` network disables normal container networking.

Example:

```bash
docker run --network none alpine
```

Conceptually:

```text
Container
   │
   X
No normal network connectivity
```

Useful when a container doesn't need networking or when strong network isolation is desired.

---

# 32. Network Drivers

Docker supports multiple network drivers.

The important ones:

| Driver    | Typical purpose                                      |
| --------- | ---------------------------------------------------- |
| `bridge`  | Containers on one Docker host                        |
| `host`    | Share host networking                                |
| `none`    | Disable networking                                   |
| `overlay` | Multi-host/container orchestration                   |
| `macvlan` | Give containers network presence like physical hosts |

---

# 33. Bridge Driver ⭐⭐⭐⭐⭐

Most important for your current learning.

Create:

```bash
docker network create my-network
```

By default, Docker creates a user-defined bridge network.

Check:

```bash
docker network inspect my-network
```

Use it for:

```text
React
Backend
MongoDB
Redis
Nginx
```

on one Docker host.

---

# 34. Overlay Driver

Overlay networking is designed for communication across multiple Docker hosts, especially in orchestration environments such as Docker Swarm.

Conceptually:

```text
Docker Host 1                 Docker Host 2
┌───────────────┐             ┌───────────────┐
│ Container A   │             │ Container B   │
└───────┬───────┘             └───────┬───────┘
        │                             │
        └──────── Overlay ────────────┘
```

For your learning roadmap:

```text
Bridge → learn now
Overlay → learn when studying orchestration/Swarm
```

---

# 35. Macvlan

`macvlan` can give containers their own MAC addresses and make them appear more like physical devices on a network.

Conceptually:

```text
Physical Network
       │
 ┌─────┼─────────┐
 │     │         │
Host Container Container
      A          B
```

Useful in specialized networking environments.

For normal MERN applications, you usually won't need it.

---

# 36. Network Driver Comparison

| Feature             | Bridge                   | Host            | None                     | Overlay         | Macvlan                              |
| ------------------- | ------------------------ | --------------- | ------------------------ | --------------- | ------------------------------------ |
| Container isolation | Yes                      | Low             | Strong network isolation | Yes             | Different model                      |
| Single host         | ✅                        | ✅               | ✅                        | Not primary use | ✅                                    |
| Multi-host          | ❌                        | ❌               | ❌                        | ✅               | Possible with network infrastructure |
| Container DNS       | ✅ on user-defined bridge | Different model | ❌ normal networking      | ✅               | Depends/configuration                |
| MERN use            | ⭐⭐⭐⭐⭐                    | ⭐⭐              | ⭐                        | ⭐⭐⭐             | ⭐                                    |

---

# 37. Inspecting Networks ⭐⭐⭐⭐⭐

List networks:

```bash
docker network ls
```

Inspect:

```bash
docker network inspect my-network
```

This is one of the best debugging commands.

---

# 38. What Does `docker network inspect` Show?

You can find:

```text
Network ID
Name
Driver
Scope
Subnet
Gateway
Containers
IP addresses
Network configuration
```

Conceptually:

```json
{
  "Name": "my-network",
  "Driver": "bridge",
  "IPAM": {
    "Subnet": "172.x.x.x/16"
  },
  "Containers": {
    "...": {
      "Name": "backend",
      "IPv4Address": "172.x.x.x/16"
    }
  }
}
```

---

# 39. Connect Existing Container to Network

Suppose:

```text
backend
```

already exists.

Connect it:

```bash
docker network connect my-network backend
```

Now:

```text
backend
   │
   └── my-network
```

---

# 40. Disconnect Container

```bash
docker network disconnect my-network backend
```

Now the container is disconnected from that network.

---

# 41. Create a Network

```bash
docker network create my-network
```

Specify driver:

```bash
docker network create --driver bridge my-network
```

These are effectively equivalent for the usual user-defined bridge case.

---

# 42. Remove a Network

```bash
docker network rm my-network
```

The network generally must not have attached containers.

If containers are still connected, disconnect/remove them first.

---

# 43. Remove Unused Networks

```bash
docker network prune
```

Force:

```bash
docker network prune -f
```

Be careful with cleanup commands.

---

# 44. Complete Network Command Reference

```bash
# List networks
docker network ls

# Show help
docker network --help

# Create network
docker network create my-network

# Create bridge network explicitly
docker network create --driver bridge my-network

# Inspect network
docker network inspect my-network

# Connect container
docker network connect my-network backend

# Disconnect container
docker network disconnect my-network backend

# Remove network
docker network rm my-network

# Remove unused networks
docker network prune
```

---

# 45. Practical MERN Networking Lab ⭐⭐⭐⭐⭐

Let's build:

```text
Backend
   │
   ▼
MongoDB
```

using Docker networking.

---

## Step 1 — Create Network

```powershell
docker network create mern-network
```

Check:

```powershell
docker network ls
```

---

## Step 2 — Run MongoDB

```powershell
docker run -d --name mongo --network mern-network mongo
```

Check:

```powershell
docker ps
```

---

## Step 3 — Run Backend

Suppose your image is:

```text
express-app:1.0
```

Run:

```powershell
docker run -d `
  --name backend `
  --network mern-network `
  -p 3000:3000 `
  express-app:1.0
```

PowerShell one-line:

```powershell
docker run -d --name backend --network mern-network -p 3000:3000 express-app:1.0
```

---

# 46. Network Architecture

Now you have:

```text
                        Your Computer
                              │
                              │ localhost:3000
                              ▼
                     ┌─────────────────┐
                     │ Backend         │
                     │ Container       │
                     │ :3000           │
                     └────────┬────────┘
                              │
                       mern-network
                              │
                              ▼
                     ┌─────────────────┐
                     │ MongoDB         │
                     │ Container       │
                     │ :27017          │
                     └─────────────────┘
```

Backend MongoDB URL:

```text
mongodb://mongo:27017/myapp
```

Not:

```text
mongodb://localhost:27017/myapp
```

---

# 47. What Happens Internally?

Backend makes:

```text
mongo:27017
```

Docker's DNS resolves:

```text
mongo
   ↓
Mongo container IP
```

Then:

```text
Backend
   │
   ▼
Docker DNS
   │
   ▼
Mongo container
   │
   ▼
27017
```

No manually hardcoded container IP is required.

---

# 48. Add Redis

Suppose you add Redis:

```powershell
docker run -d --name redis --network mern-network redis
```

Now:

```text
                  mern-network
          ┌─────────────────────────┐
          │                         │
          │ Backend ───► MongoDB    │
          │    │                    │
          │    └───────► Redis      │
          │                         │
          └─────────────────────────┘
```

Backend can use:

```text
mongo:27017
```

and:

```text
redis:6379
```

---

# 49. Add Nginx

Now imagine:

```text
Internet
    │
    ▼
  Nginx
    │
    ▼
 Backend
    │
    ├──► MongoDB
    │
    └──► Redis
```

Docker networking becomes extremely important here.

You might have:

```text
frontend-network
backend-network
```

and selectively connect services to the networks they need.

---

# 50. Multiple Networks

A container can connect to more than one Docker network.

Example:

```text
                    frontend-network
                   /                 \
                Nginx              Frontend
                  │
                  │
             backend-network
                  │
               Backend
              /       \
          Mongo       Redis
```

This can provide useful segmentation.

For example:

```text
MongoDB
   │
   └── backend-network only
```

while:

```text
Nginx
   │
   ├── frontend-network
   │
   └── backend-network
```

This limits which services can directly communicate.

---

# 51. Port Publishing vs Docker Networking

This distinction is **extremely important**.

### Port publishing

```bash
-p 3000:3000
```

is for:

```text
Host/external network
       ↓
Container
```

### Docker network

```text
--network mern-network
```

is for:

```text
Container
    ↓
Docker network
    ↓
Container
```

---

# 52. Visual Difference

### Port Mapping

```text
Browser
   │
   │ localhost:3000
   ▼
Host
   │
   │ -p 3000:3000
   ▼
Backend Container
```

### Container Networking

```text
Backend Container
       │
       │ mongo:27017
       ▼
Docker Network
       │
       ▼
Mongo Container
```

---

# 53. Very Important Rule

For container-to-container communication:

```text
❌ localhost
❌ host machine IP unnecessarily
❌ hardcoded container IP
```

Prefer:

```text
✅ container/service name
```

Example:

```text
mongodb://mongo:27017
```

---

# 54. Common MERN Docker Mistake

You have:

```text
Backend container
Mongo container
```

Your Node code says:

```env
MONGO_URI=mongodb://localhost:27017/mydb
```

Result:

```text
Backend
   │
   ▼
localhost
   │
   ▼
Backend container itself
   │
   X
MongoDB
```

Connection fails.

Change to:

```env
MONGO_URI=mongodb://mongo:27017/mydb
```

assuming the MongoDB container is named `mongo` and both are attached to the same user-defined network.

---

# 55. Another Common Mistake

Suppose Mongo is:

```text
mongo
```

and backend is:

```text
backend
```

Both are on:

```text
mern-network
```

You might think:

```text
mongodb://localhost:27017
```

because MongoDB runs on port `27017`.

Wrong because `localhost` refers to the backend container.

Correct:

```text
mongodb://mongo:27017
```

---

# 56. Another Common Mistake: Port Confusion

Suppose:

```bash
docker run -p 8080:3000 backend
```

You might think the Mongo connection should use:

```text
mongo:8080
```

No.

The `8080` is the **host-published backend port**.

Mongo's own internal port remains:

```text
27017
```

So:

```text
mongodb://mongo:27017
```

---

# 57. Internal Communication Doesn't Need `-p`

Suppose:

```text
Mongo:
container port = 27017
```

Backend communicates:

```text
mongo:27017
```

You don't need:

```bash
-p 27017:27017
```

unless you also need host/external access.

This is a very common interview question.

---

# 58. Docker DNS Mental Model ⭐⭐⭐⭐⭐

Remember:

```text
Container A
     │
     │ database
     ▼
Docker DNS
     │
     │ resolves name
     ▼
Container B
```

For example:

```text
backend
   │
   │ mongo
   ▼
Docker DNS
   │
   ▼
172.x.x.x
   │
   ▼
Mongo container
```

Your application doesn't need to know the changing IP.

---

# 59. DNS vs Port

Another important distinction:

```text
mongo
```

identifies **where**.

```text
27017
```

identifies **which port/service**.

Together:

```text
mongo:27017
```

means:

```text
Host/service = mongo
Port = 27017
```

---

# 60. Network Isolation

Docker networks also provide logical separation.

Example:

```text
network-A
├── frontend
└── nginx


network-B
├── backend
├── mongo
└── redis
```

Now frontend isn't automatically able to communicate directly with Mongo unless the relevant networking connections exist.

This supports better architecture and security.

---

# 61. Useful Network Debugging Commands

When your containers cannot communicate:

### 1. List networks

```bash
docker network ls
```

### 2. Inspect network

```bash
docker network inspect mern-network
```

### 3. Check containers

```bash
docker ps
```

### 4. Inspect container

```bash
docker inspect backend
```

### 5. Check logs

```bash
docker logs backend
```

### 6. Enter container

```bash
docker exec -it backend sh
```

Then test connectivity using tools available in that image.

For example, if the image contains appropriate tools:

```sh
getent hosts mongo
```

or:

```sh
ping mongo
```

or test the actual application protocol/port.

---

# 62. Network Troubleshooting Checklist

If:

```text
Backend → MongoDB
```

doesn't work, check:

```text
1. Is Mongo running?
       ↓
   docker ps

2. Is Backend running?
       ↓
   docker ps

3. Same Docker network?
       ↓
   docker network inspect mern-network

4. Correct hostname?
       ↓
   mongo

5. Correct port?
       ↓
   27017

6. Are you incorrectly using localhost?
       ↓
   Change to mongo

7. Check backend logs
       ↓
   docker logs backend
```

---

# 63. `docker inspect` Network Information

Run:

```bash
docker inspect backend
```

Search for:

```text
Networks
```

You'll see information such as:

```text
Networks
  └── mern-network
       ├── IPAddress
       ├── Gateway
       └── ...
```

This helps determine whether the container is connected to the expected network.

---

# 64. Network Creation With Subnet

You can specify network configuration:

```bash
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  my-network
```

For normal applications, Docker's automatic IPAM configuration is usually sufficient.

---

# 65. Network Gateway

A Docker bridge network generally has a gateway.

Conceptually:

```text
172.20.0.0/16
      │
      ├── Gateway: 172.20.0.1
      │
      ├── Backend: 172.20.0.x
      │
      └── Mongo: 172.20.0.y
```

You normally don't need to manually manage these addresses for ordinary application communication.

Docker handles this networking for you.

---

# 66. Default Bridge vs User-Defined Bridge

⭐ Very important interview comparison.

| Feature                         | Default `bridge`                          | User-defined bridge |
| ------------------------------- | ----------------------------------------- | ------------------- |
| Automatically exists            | ✅                                         | ❌                   |
| Driver                          | bridge                                    | bridge              |
| Container isolation             | ✅                                         | ✅                   |
| Automatic DNS service discovery | Limited compared with user-defined bridge | ✅                   |
| Recommended for applications    | ❌                                         | ✅                   |
| Custom configuration            | Limited                                   | Better              |

For application stacks, prefer:

```bash
docker network create my-network
```

rather than relying on the default `bridge`.

---

# 67. The MERN Networking Pattern You Should Learn

For your projects, think:

```text
                         Internet
                            │
                            ▼
                      Host :80/:443
                            │
                            ▼
                          Nginx
                            │
                     backend-network
                            │
                            ▼
                         Backend
                         /      \
                        /        \
                       ▼          ▼
                    Mongo       Redis
```

Frontend might be:

```text
Browser
   │
   ▼
Nginx / Frontend
   │
   ▼
Backend API
```

The database normally should **not** be directly published to the public internet.

---

# 68. Docker Networking Commands — Cheat Sheet

```bash
# List networks
docker network ls

# Help
docker network --help

# Create custom network
docker network create mern-network

# Create bridge network explicitly
docker network create --driver bridge mern-network

# Inspect
docker network inspect mern-network

# Run container on network
docker run -d --name mongo --network mern-network mongo

# Connect existing container
docker network connect mern-network backend

# Disconnect
docker network disconnect mern-network backend

# Remove network
docker network rm mern-network

# Remove unused networks
docker network prune
```

---

# 69. Most Important Commands to Practice

Do this yourself:

```powershell
docker network create test-network
```

Then:

```powershell
docker run -d --name container1 --network test-network nginx
```

Then:

```powershell
docker run -d --name container2 --network test-network nginx
```

Inspect:

```powershell
docker network inspect test-network
```

You should see both:

```text
container1
container2
```

attached to the network.

---

# 70. Test Container DNS

You can launch a temporary diagnostic container:

```powershell
docker run --rm --network test-network busybox nslookup container1
```

Or:

```powershell
docker run --rm --network test-network busybox ping -c 3 container1
```

The exact diagnostic commands available depend on the image.

---

# 71. Remove Test Environment

Stop:

```powershell
docker stop container1 container2
```

Remove:

```powershell
docker rm container1 container2
```

Remove network:

```powershell
docker network rm test-network
```

---

# 72. ⭐⭐⭐⭐⭐ Interview Questions

## Q1. What is Docker networking?

Docker networking allows containers to communicate with other containers, the host, and external networks using configurable network drivers.

---

## Q2. What is the default Docker network?

Docker normally provides:

```text
bridge
host
none
```

as built-in/default networks.

---

## Q3. What is a bridge network?

A bridge network connects containers on the same Docker host and provides network isolation from other networks.

---

## Q4. Why use a user-defined bridge network?

Because it provides better application-oriented networking, including automatic DNS-based service discovery by container/service names and configurable isolation.

---

## Q5. How do containers communicate?

Containers attached to the same suitable Docker network can communicate using their network-reachable names and container ports.

Example:

```text
backend → mongo:27017
```

---

## Q6. Why doesn't `localhost` work?

Inside a container:

```text
localhost
```

refers to that container's own network namespace, not another container.

---

## Q7. How does Docker DNS work?

Docker provides embedded DNS for containers on user-defined networks, allowing containers to resolve other containers/services by name.

---

## Q8. What is port mapping?

Example:

```bash
docker run -p 8080:3000 app
```

means:

```text
Host 8080 → Container 3000
```

---

## Q9. Do containers need port mapping to communicate?

**No.**

If they're on the same Docker network, they can communicate directly through the container port.

---

## Q10. `EXPOSE` vs `-p`?

```text
EXPOSE
   ↓
Declares/document container port

-p
   ↓
Publishes/maps host port to container port
```

---

## Q11. Bridge vs host?

```text
Bridge
→ container has its own network namespace and virtual networking

Host
→ container shares host network stack
```

---

## Q12. What is overlay?

Overlay networking enables communication across multiple Docker hosts and is primarily relevant to multi-host/orchestration scenarios such as Docker Swarm.

---

## Q13. What is `none`?

A network mode that disables normal container networking.

---

# 73. 🔥 Must-Memorize Architecture

For MERN:

```text
                 Docker Host
                      │
               mern-network
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
    Frontend       Backend        MongoDB
     :5173          :3000          :27017
                      │
                      │
                mongo:27017
                      │
                      ▼
                   MongoDB
```

External request:

```text
Browser
   │
   ▼
localhost:3000
   │
   │ published port
   ▼
Backend container
```

Internal request:

```text
Backend
   │
   │ mongo:27017
   ▼
Docker DNS
   │
   ▼
MongoDB
```

---

# 74. 🔥 The 5 Rules You Should Never Forget

### Rule 1

```text
localhost inside a container ≠ your host machine
```

More precisely, `localhost` refers to the container's own network namespace.

---

### Rule 2

For container-to-container communication:

```text
service/container name + container port
```

Example:

```text
mongo:27017
```

---

### Rule 3

`-p` is for publishing ports across the host/container boundary.

```bash
-p 8080:3000
```

means:

```text
Host 8080 → Container 3000
```

---

### Rule 4

Containers on the same user-defined bridge network can communicate without publishing their ports to the host.

```text
Backend ─────► Mongo
```

No:

```text
-p 27017:27017
```

required for backend-to-Mongo-only communication.

---

### Rule 5

For application stacks, prefer a custom network:

```bash
docker network create mern-network
```

instead of relying on the default `bridge`.

---

# 75. Final Mental Model

Memorize this diagram:

```text
                         INTERNET
                            │
                            ▼
                    ┌──────────────┐
                    │ Docker Host  │
                    └──────┬───────┘
                           │
                     Port Publishing
                      -p 3000:3000
                           │
                           ▼
                    ┌──────────────┐
                    │   Backend    │
                    │    :3000     │
                    └──────┬───────┘
                           │
                           │
                    mern-network
                           │
                    Docker DNS
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
        ┌────────────┐             ┌──────────┐
        │   Mongo    │             │  Redis   │
        │   :27017   │             │  :6379   │
        └────────────┘             └──────────┘

Backend → Mongo
     │
     └── mongo:27017

Backend → Redis
     │
     └── redis:6379

Browser → Backend
     │
     └── localhost:3000
```

### Your core Docker networking formula

```text
EXTERNAL
    ↓
Host Port
    ↓
-p HOST:CONTAINER
    ↓
Container

INTERNAL
    ↓
Docker Network
    ↓
DNS Name
    ↓
Container Port
    ↓
Container
```.
