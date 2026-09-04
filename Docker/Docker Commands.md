**Essential Docker Commands – Complete Guide for Learning & Documentation**

Here is a clean, well-organized list of **all important Docker commands** with clear explanations. This is perfect for learning and for your personal notes/documentation.

---

### 1. Basic Information Commands

| Command | Explanation |
|---------|-----------|
| `docker --version` | Shows the installed Docker version |
| `docker version` | Shows detailed client and server version information |
| `docker info` | Displays system-wide information about Docker (containers, images, storage driver, etc.) |

---

### 2. Working with Images

| Command | Explanation |
|---------|-----------|
| `docker pull <image>` | Downloads an image from Docker Hub (or other registry) |
| `docker images` | Lists all images available on your system |
| `docker images -a` | Lists all images including intermediate layers |
| `docker rmi <image>` | Removes one or more images |
| `docker rmi -f <image>` | Force removes an image (even if used by stopped containers) |
| `docker tag <source> <target>` | Creates a new tag for an existing image |
| `docker push <image>` | Uploads an image to a registry (Docker Hub / private) |
| `docker history <image>` | Shows the layers/history of an image |
| `docker inspect <image>` | Shows detailed information about an image in JSON format |

**Examples:**
```bash
docker pull nginx:latest
docker images
docker tag nginx:latest mynginx:v1
docker rmi nginx:latest
```

---

### 3. Working with Containers

| Command | Explanation |
|---------|-----------|
| `docker run <image>` | Creates and starts a new container from an image |
| `docker ps` | Lists only **running** containers |
| `docker ps -a` | Lists **all** containers (running + stopped) |
| `docker start <container>` | Starts a stopped container |
| `docker stop <container>` | Gracefully stops a running container |
| `docker restart <container>` | Restarts a container |
| `docker rm <container>` | Removes a stopped container |
| `docker rm -f <container>` | Force removes a running container |
| `docker rename <old> <new>` | Renames a container |

---

### 4. Important Options with `docker run`

| Option | Explanation | Example |
|--------|-----------|--------|
| `-d` | Run container in **detached mode** (background) | `docker run -d nginx` |
| `-it` | Interactive mode + terminal (for shells) | `docker run -it ubuntu bash` |
| `-p host:container` | Port mapping | `docker run -p 8080:80 nginx` |
| `-e KEY=VALUE` | Set environment variable | `docker run -e MYSQL_ROOT_PASSWORD=123 mysql` |
| `--name` | Give a custom name to the container | `docker run --name myweb nginx` |
| `-v` | Mount a volume | `docker run -v mydata:/data nginx` |
| `--rm` | Automatically remove container when it stops | `docker run --rm nginx` |
| `-m` | Limit memory | `docker run -m 512m nginx` |

**Common Useful Commands:**
```bash
# Run Nginx in background and map port 8080
docker run -d --name my-nginx -p 8080:80 nginx

# Run Ubuntu interactively
docker run -it --name my-ubuntu ubuntu bash

# Run with environment variable
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql:8.0
```

---

### 5. Logs, Execution & Inspection

| Command | Explanation |
|---------|-----------|
| `docker logs <container>` | Shows logs of a container |
| `docker logs -f <container>` | Follow logs in real-time (like `tail -f`) |
| `docker logs --tail 100 <container>` | Shows last 100 lines of logs |
| `docker exec -it <container> bash` | Runs a command inside a **running** container (open shell) |
| `docker exec <container> <command>` | Runs a single command inside container |
| `docker inspect <container>` | Shows complete detailed information of container |
| `docker stats` | Shows live resource usage (CPU, Memory, Network) of containers |
| `docker top <container>` | Shows running processes inside a container |

**Examples:**
```bash
docker logs -f my-nginx
docker exec -it my-nginx bash
docker exec my-nginx ls /usr/share/nginx/html
docker stats
```

---

### 6. Copy Files & Commit

| Command | Explanation |
|---------|-----------|
| `docker cp <container>:<path> <host-path>` | Copy file from container to host |
| `docker cp <host-path> <container>:<path>` | Copy file from host to container |
| `docker commit <container> <new-image>` | Creates a new image from a container’s current state |

**Example:**
```bash
docker cp my-nginx:/var/www/html/index.html ./index.html
docker commit my-nginx my-custom-nginx:v1
```

---

### 7. Cleanup Commands (Very Useful)

| Command | Explanation |
|---------|-----------|
| `docker container prune` | Removes all stopped containers |
| `docker image prune` | Removes unused images |
| `docker system prune` | Removes unused data (containers, networks, images) |
| `docker system prune -a` | More aggressive cleanup (removes all unused images too) |
| `docker volume prune` | Removes unused volumes |

---

### 8. Understanding the Flow (Very Important)

```
Image  →  Container  →  Running Application
```

| Stage | Command | Meaning |
|-------|--------|--------|
| **Image** | `docker pull` / `docker build` | Blueprint / Template |
| **Create Container** | `docker run` or `docker create` | Creates a container from image |
| **Running** | `docker start` / already running with `docker run -d` | Application is live |
| **Stop** | `docker stop` | Stops the application |
| **Remove** | `docker rm` | Deletes the container |

---

### Quick Practice Commands (Recommended Order)

```bash
# 1. Check Docker
docker --version

# 2. Pull an image
docker pull nginx

# 3. See images
docker images

# 4. Run container
docker run -d --name web -p 8080:80 nginx

# 5. Check running containers
docker ps

# 6. Check logs
docker logs web

# 7. Go inside container
docker exec -it web bash

# 8. Stop container
docker stop web

# 9. See all containers
docker ps -a

# 10. Remove container
docker rm web

# 11. Remove image
docker rmi nginx
```

---
---
# 🐳 Docker Basic Commands — Complete Learning & Documentation Guide

Below is a **command-by-command Docker cheat sheet + explanation**, designed so you can use it as your **Docker learning documentation** and later for **interview revision**.

The most important mental model is:

```text
Dockerfile
    │
    │ docker build
    ↓
  IMAGE
    │
    │ docker run
    ↓
CONTAINER
    │
    │ process starts
    ↓
RUNNING APPLICATION
```

And:

```text
Image
  ↓
docker run
  ↓
Container
  ↓
Application
```

---

# 1. `docker --version`

### Purpose

Checks the installed Docker CLI version.

```bash
docker --version
```

Example:

```text
Docker version 28.x.x, build xxxxx
```

### When to use

Use it to verify that Docker is installed and accessible from your terminal.

You can also use:

```bash
docker version
```

This provides more detailed client/server information.

### Difference

```bash
docker --version
```

→ Simple version.

```bash
docker version
```

→ Detailed Docker Client and Server information.

---

# 2. `docker pull`

### Purpose

Downloads an image from a Docker registry.

```bash
docker pull nginx
```

Think:

```text
Docker Registry
      │
      │ pull
      ↓
Local Machine
      │
      ↓
   nginx image
```

For a specific version:

```bash
docker pull node:20
```

Here:

```text
node
 ↓
repository

20
 ↓
tag
```

Another example:

```bash
docker pull mongo:8
```

### Why use `pull`?

Before creating a container, Docker needs an image.

```text
Registry
   ↓
docker pull
   ↓
Image
   ↓
docker run
   ↓
Container
```

### Important

`docker pull` **does not create a container**.

It only downloads the image.

---

# 3. `docker images`

### Purpose

Shows locally available Docker images.

```bash
docker images
```

Modern equivalent:

```bash
docker image ls
```

Example:

```text
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
node         20        abc123         2 days ago    1.1GB
nginx        latest    def456         3 days ago    190MB
mongo        8         xyz789         1 week ago    800MB
```

Important columns:

| Column     | Meaning          |
| ---------- | ---------------- |
| REPOSITORY | Image name       |
| TAG        | Version/label    |
| IMAGE ID   | Image identifier |
| CREATED    | Creation time    |
| SIZE       | Image size       |

---

# 4. `docker run`

This is one of the **most important Docker commands**.

```bash
docker run nginx
```

It generally means:

```text
Find image
   ↓
Create container
   ↓
Start container
```

So:

```text
IMAGE
  ↓
docker run
  ↓
CONTAINER
  ↓
RUNNING
```

---

## Run in background

```bash
docker run -d nginx
```

`-d` = detached mode.

The container runs in the background.

---

## Give container a name

```bash
docker run -d --name my-nginx nginx
```

Now instead of a generated name, you have:

```text
my-nginx
```

You can then use:

```bash
docker stop my-nginx
```

---

# 5. Interactive vs Detached Mode

This is very important.

## Detached mode

```bash
docker run -d nginx
```

Container runs in the background.

```text
Terminal
   │
   └── Docker container
          │
          └── running in background
```

---

## Interactive mode

For example:

```bash
docker run -it ubuntu
```

Here:

```text
-i = interactive
-t = allocate terminal
```

You can interact with the container.

You might get:

```text
root@abc123:/#
```

Now you can execute:

```bash
ls
pwd
echo hello
```

---

## `-it` together

Usually you'll see:

```bash
docker run -it ubuntu bash
```

Meaning:

```text
Create Ubuntu container
       ↓
Start it
       ↓
Open interactive terminal
```

---

# 6. `docker ps`

Shows **currently running containers**.

```bash
docker ps
```

Example:

```text
CONTAINER ID   IMAGE   COMMAND       STATUS       PORTS       NAMES
abc123         nginx   ...           Up 2 mins    80/tcp      my-nginx
```

Important:

```bash
docker ps
```

does **not** normally show stopped containers.

---

# 7. `docker ps -a`

Shows **all containers**.

```bash
docker ps -a
```

Includes:

```text
Running
Stopped
Exited
Created
```

Example:

```text
CONTAINER ID   IMAGE   STATUS
abc123         nginx   Up 5 mins
def456         node    Exited (0)
xyz789         mongo   Created
```

### Interview question

**Q: How do you see stopped containers?**

```bash
docker ps -a
```

---

# 8. `docker stop`

Stops a running container.

```bash
docker stop my-nginx
```

You can also use the container ID:

```bash
docker stop abc123
```

Conceptually:

```text
RUNNING
   ↓
docker stop
   ↓
STOPPED
```

Docker normally gives the application an opportunity to shut down gracefully.

---

# 9. `docker start`

Starts an **existing stopped container**.

```bash
docker start my-nginx
```

Important difference:

```text
docker run
    ↓
CREATE + START NEW CONTAINER
```

while:

```text
docker start
    ↓
START EXISTING CONTAINER
```

### Example

```bash
docker run -d --name my-nginx nginx
```

Stop:

```bash
docker stop my-nginx
```

Start again:

```bash
docker start my-nginx
```

You don't need to create another container.

---

# 10. `docker restart`

Restarts an existing container.

```bash
docker restart my-nginx
```

Conceptually:

```text
RUNNING
   ↓
STOP
   ↓
START
   ↓
RUNNING
```

Useful when your application needs to be restarted.

---

# 11. `docker rm`

Removes a container.

```bash
docker rm my-nginx
```

Normally:

```text
Running container
     ↓
docker stop
     ↓
Stopped container
     ↓
docker rm
     ↓
Removed
```

If you want to force remove:

```bash
docker rm -f my-nginx
```

### Important

`docker rm` removes a **container**, not the image.

```text
docker rm
   ↓
Container
```

---

# 12. `docker rmi`

Removes an image.

```bash
docker rmi nginx
```

or:

```bash
docker image rm nginx
```

Conceptually:

```text
docker rmi
    ↓
IMAGE
    ↓
removed
```

### Important distinction

```bash
docker rm
```

→ removes container

```bash
docker rmi
```

→ removes image

---

# 13. `docker logs`

Shows the output/logs generated by a container.

```bash
docker logs my-api
```

For an Express application:

```text
Server running on port 3000
MongoDB connected
User API started
```

This is one of your most important debugging commands.

---

## Follow logs

```bash
docker logs -f my-api
```

`-f` = follow.

It continuously displays new logs.

Stop following with:

```text
Ctrl + C
```

The container itself continues running.

---

## Show latest logs

```bash
docker logs --tail 100 my-api
```

Shows the last 100 lines.

---

# 14. `docker exec`

Runs a command **inside an already-running container**.

Example:

```bash
docker exec my-api ls
```

For an interactive shell:

```bash
docker exec -it my-api sh
```

You may see:

```text
/app #
```

Now you are inside the container.

You can run:

```bash
ls
```

```bash
pwd
```

```bash
env
```

```bash
cat package.json
```

---

## Bash vs sh

Some images have Bash:

```bash
docker exec -it my-api bash
```

Others only have `sh`:

```bash
docker exec -it my-api sh
```

For Alpine-based images, `sh` is commonly available.

---

# 15. `docker inspect`

Provides detailed information about a Docker object.

```bash
docker inspect my-api
```

The output is JSON.

It can show information such as:

```text
Container ID
Image
Network
IP Address
Ports
Mounts
Environment
Command
State
```

This is extremely useful for debugging.

---

## Example

```bash
docker inspect my-api
```

You might find:

```text
"IPAddress": "172.17.0.2"
```

or port/network configuration.

---

# 16. `docker stats`

Shows real-time resource usage.

```bash
docker stats
```

Example:

```text
CONTAINER   CPU %   MEM USAGE / LIMIT   MEM %
my-api      2.3%    120MiB / 4GiB       2.9%
mongo       8.1%    450MiB / 4GiB       11%
```

Useful for monitoring:

* CPU
* Memory
* Network I/O
* Block I/O
* Processes

For one container:

```bash
docker stats my-api
```

---

# 17. `docker push`

Uploads an image to a registry.

Before pushing, you normally tag the image with your registry/repository name.

Suppose:

```bash
docker images
```

shows:

```text
my-express-app
```

Tag it:

```bash
docker tag my-express-app username/my-express-app:1.0
```

Then:

```bash
docker push username/my-express-app:1.0
```

Flow:

```text
Local Image
    ↓
docker tag
    ↓
Registry-compatible name
    ↓
docker push
    ↓
Docker Registry
```

Usually you'll need to authenticate first:

```bash
docker login
```

---

# 18. `docker tag`

Creates another name/tag for an image.

```bash
docker tag myapp username/myapp:1.0
```

Important:

> `docker tag` normally does not duplicate the image's data.

It creates another reference/name pointing to the image.

Example:

```text
IMAGE
 │
 ├── myapp:latest
 │
 └── username/myapp:1.0
```

---

# 19. Understanding Docker Tags

Example:

```text
node:20
```

Here:

```text
node
 ↓
Repository

20
 ↓
Tag
```

Another:

```text
username/ecommerce-api:1.2.0
```

Breakdown:

```text
username
   ↓
Registry namespace/user

ecommerce-api
   ↓
Repository

1.2.0
   ↓
Tag
```

If you don't specify a tag:

```bash
docker pull nginx
```

Docker generally uses:

```text
nginx:latest
```

But in production, **pinning a specific version is usually safer than relying on `latest`**.

---

# 20. `docker cp`

Copies files between your host machine and a container.

## Host → Container

```bash
docker cp ./file.txt my-api:/app/file.txt
```

Flow:

```text
Your Computer
      │
      │ docker cp
      ↓
Container
```

---

## Container → Host

```bash
docker cp my-api:/app/file.txt ./file.txt
```

Flow:

```text
Container
    │
    │ docker cp
    ↓
Your Computer
```

---

## Directory example

```bash
docker cp ./config my-api:/app/config
```

Useful for:

* Extracting files
* Debugging
* Copying configuration
* Retrieving generated output

But for **persistent application data**, Docker volumes are usually the better solution.

---

# 21. `docker commit`

Creates a new image from a container's current filesystem state.

Example:

```bash
docker commit my-container my-custom-image
```

Flow:

```text
Container
    ↓
docker commit
    ↓
New Image
```

For example:

```text
ubuntu container
     ↓
install something manually
     ↓
docker commit
     ↓
custom image
```

### Is `docker commit` recommended for normal development?

Usually **no**.

For reproducible applications, prefer:

```text
Dockerfile
    ↓
docker build
    ↓
Image
```

Why?

A Dockerfile documents exactly how the image is built.

`docker commit` can capture changes that aren't clearly documented.

### Use case

`docker commit` can be useful for:

* Experimentation
* Debugging
* Quickly capturing a container state

But don't make it your primary production image-building workflow.

---

# 22. Port Mapping `-p`

One of the most important commands for your Express/MERN projects.

Syntax:

```bash
docker run -p HOST_PORT:CONTAINER_PORT image
```

Example:

```bash
docker run -p 3000:3000 my-api
```

Meaning:

```text
HOST                  CONTAINER
3000  ──────────────→ 3000
```

Your browser:

```text
localhost:3000
```

reaches:

```text
Container:3000
```

---

## Different host and container ports

```bash
docker run -p 8080:3000 my-api
```

Means:

```text
Browser
localhost:8080
     ↓
Host port 8080
     ↓
Container port 3000
     ↓
Express
```

So:

```text
HOST:8080 → CONTAINER:3000
```

---

# 23. `EXPOSE` vs `-p`

This is an important interview question.

Dockerfile:

```dockerfile
EXPOSE 3000
```

doesn't itself publish the port to your host.

You still need:

```bash
docker run -p 3000:3000 my-api
```

Think:

```text
EXPOSE
   ↓
Documentation/metadata about intended container port

-p
   ↓
Actually publishes/maps host → container port
```

---

# 24. Environment Variables `-e`

You can provide environment variables when starting a container.

Example:

```bash
docker run -e NODE_ENV=production my-api
```

Multiple variables:

```bash
docker run \
  -e NODE_ENV=production \
  -e PORT=3000 \
  my-api
```

Inside Node.js:

```javascript
process.env.NODE_ENV
```

and:

```javascript
process.env.PORT
```

---

# 25. Database Example

Suppose your backend requires:

```text
MONGO_URI
JWT_SECRET
PORT
NODE_ENV
```

You can run:

```bash
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e MONGO_URI="mongodb://mongo:27017/ecommerce" \
  my-api
```

Then inside the container:

```javascript
process.env.MONGO_URI
```

gets the value.

---

# 26. `.env` File

Instead of writing many `-e` options:

```bash
docker run --env-file .env my-api
```

Example `.env`:

```text
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb://mongo:27017/ecommerce
```

Then:

```bash
docker run --env-file .env my-api
```

### Security note

Don't put secrets into your Dockerfile:

```dockerfile
ENV JWT_SECRET=my-secret
```

for real production secrets.

Use appropriate secret management mechanisms instead.

---

# 27. A Complete Practical Command

Let's combine everything:

```bash
docker run -d \
  --name ecommerce-api \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  my-express-app:1.0
```

Break it down:

```text
docker run
    ↓
Create + start container

-d
    ↓
Detached/background

--name ecommerce-api
    ↓
Container name

-p 3000:3000
    ↓
Host 3000 → Container 3000

-e NODE_ENV=production
    ↓
Environment variable

-e PORT=3000
    ↓
Environment variable

my-express-app:1.0
    ↓
Image
```

---

# 28. Complete Docker CLI Workflow

Here's a workflow you should practice yourself.

## Step 1 — Check Docker

```bash
docker --version
```

---

## Step 2 — Download image

```bash
docker pull nginx
```

---

## Step 3 — Check images

```bash
docker images
```

---

## Step 4 — Run container

```bash
docker run -d --name my-nginx nginx
```

---

## Step 5 — Check running containers

```bash
docker ps
```

---

## Step 6 — Check all containers

```bash
docker ps -a
```

---

## Step 7 — Inspect

```bash
docker inspect my-nginx
```

---

## Step 8 — View logs

```bash
docker logs my-nginx
```

---

## Step 9 — Check resource usage

```bash
docker stats my-nginx
```

---

## Step 10 — Stop

```bash
docker stop my-nginx
```

---

## Step 11 — Start

```bash
docker start my-nginx
```

---

## Step 12 — Restart

```bash
docker restart my-nginx
```

---

## Step 13 — Stop

```bash
docker stop my-nginx
```

---

## Step 14 — Remove container

```bash
docker rm my-nginx
```

---

## Step 15 — Remove image

```bash
docker rmi nginx
```

---

# 29. Complete Command Reference

## Docker information

| Command            | Purpose                        |
| ------------------ | ------------------------------ |
| `docker --version` | Show Docker version            |
| `docker version`   | Show client/server versions    |
| `docker info`      | Show Docker system information |

---

## Images

| Command                      | Purpose                    |
| ---------------------------- | -------------------------- |
| `docker pull IMAGE`          | Download image             |
| `docker images`              | List images                |
| `docker image ls`            | List images                |
| `docker build -t NAME .`     | Build image                |
| `docker tag IMAGE TAG`       | Create image tag           |
| `docker push IMAGE`          | Upload image               |
| `docker rmi IMAGE`           | Remove image               |
| `docker image inspect IMAGE` | Detailed image information |
| `docker history IMAGE`       | Show image layers/history  |

---

## Containers

| Command                    | Purpose                   |
| -------------------------- | ------------------------- |
| `docker run IMAGE`         | Create + start container  |
| `docker create IMAGE`      | Create without starting   |
| `docker ps`                | Running containers        |
| `docker ps -a`             | All containers            |
| `docker start CONTAINER`   | Start existing container  |
| `docker stop CONTAINER`    | Stop container            |
| `docker restart CONTAINER` | Restart container         |
| `docker rm CONTAINER`      | Remove container          |
| `docker kill CONTAINER`    | Forcefully stop container |
| `docker pause CONTAINER`   | Pause processes           |
| `docker unpause CONTAINER` | Resume processes          |

---

## Debugging

| Command                        | Purpose                            |
| ------------------------------ | ---------------------------------- |
| `docker logs CONTAINER`        | View logs                          |
| `docker logs -f CONTAINER`     | Follow logs                        |
| `docker exec -it CONTAINER sh` | Enter container shell              |
| `docker inspect CONTAINER`     | Detailed information               |
| `docker stats`                 | Resource usage                     |
| `docker top CONTAINER`         | Processes running inside container |

---

## File management

| Command                           | Purpose                     |
| --------------------------------- | --------------------------- |
| `docker cp SOURCE CONTAINER:DEST` | Host → container            |
| `docker cp CONTAINER:SRC DEST`    | Container → host            |
| `docker commit CONTAINER IMAGE`   | Create image from container |

---

# 30. Docker Lifecycle — Commands Together

Memorize this diagram:

```text
                    IMAGE
                      │
                      │ docker create
                      ↓
                   CREATED
                      │
                      │ docker start
                      ↓
                   RUNNING
                  /    │    \
                 /     │     \
                ↓      ↓      ↓
             stop    crash   restart
                │      │
                ↓      ↓
              STOPPED / EXITED
                │
                │ docker start
                ↓
             RUNNING
                │
                │ docker rm
                ↓
              REMOVED
```

And:

```bash
docker run
```

is effectively the convenient operation:

```text
create + start
```

---

# 31. The Most Important Differences

### `run` vs `start`

```text
docker run
→ new container

docker start
→ existing container
```

### `stop` vs `rm`

```text
docker stop
→ stop container

docker rm
→ delete container
```

### `rm` vs `rmi`

```text
docker rm
→ remove container

docker rmi
→ remove image
```

### `pull` vs `push`

```text
docker pull
→ Registry → Your computer

docker push
→ Your computer → Registry
```

### `logs` vs `exec`

```text
docker logs
→ see application output

docker exec
→ execute command inside container
```

### `images` vs `ps`

```text
docker images
→ Images

docker ps
→ Running containers
```

---

# 32. Your Core Mental Model

Whenever you see Docker commands, think about **three levels**:

```text
             IMAGE
               │
               │ docker run
               ↓
           CONTAINER
               │
               │ process
               ↓
          APPLICATION
```

For example:

```text
node:20
   │
   │ docker run
   ↓
my-api-container
   │
   ↓
node server.js
   │
   ↓
Express API :3000
```

Then networking:

```text
Browser
   │
   ↓
localhost:3000
   │
   ↓
Host :3000
   │
   │ -p 3000:3000
   ↓
Container :3000
   │
   ↓
Express
```

And registry:

```text
Dockerfile
    ↓
docker build
    ↓
IMAGE
    ↓
docker tag
    ↓
docker push
    ↓
Docker Hub / Registry
    ↓
docker pull
    ↓
IMAGE
    ↓
docker run
    ↓
CONTAINER
```

---

# 33. ⭐ Commands You MUST Memorize

For your current Docker learning stage, focus heavily on these:

```bash
# Information
docker --version
docker version
docker info

# Images
docker pull nginx
docker images
docker build -t myapp .
docker tag myapp username/myapp:1.0
docker push username/myapp:1.0
docker rmi myapp

# Containers
docker run nginx
docker run -d nginx
docker run -it ubuntu bash
docker ps
docker ps -a
docker start myapp
docker stop myapp
docker restart myapp
docker rm myapp

# Port & environment
docker run -p 3000:3000 myapp
docker run -e NODE_ENV=production myapp
docker run --env-file .env myapp

# Debugging
docker logs myapp
docker logs -f myapp
docker exec -it myapp sh
docker inspect myapp
docker stats
docker top myapp

# Files
docker cp ./file.txt myapp:/app/file.txt
docker cp myapp:/app/file.txt ./file.txt

# Container → Image
docker commit myapp myapp-snapshot
```

---
---
**Dockerfile – Complete In-Depth Study Guide**

This is a full, detailed explanation designed for deep learning and documentation.

---

### 1. What is a Dockerfile?

A **Dockerfile** is a plain text file that contains a set of instructions used to **build a Docker image**.

It is like a **recipe** or **blueprint**.

- When you run `docker build`, Docker reads the Dockerfile line by line.
- Each instruction creates a new **layer** in the image.
- The final result is a reusable Docker image.

**File name must be exactly:** `Dockerfile` (no extension)

---

### 2. Dockerfile Instructions (Complete List with Deep Explanation)

Here are **all important instructions** with detailed explanations:

| Instruction     | Purpose                              | Creates Layer? | Common Use |
|-----------------|--------------------------------------|----------------|----------|
| `FROM`          | Base image                           | Yes            | Always first |
| `WORKDIR`       | Set working directory                | Yes            | Change directory |
| `COPY`          | Copy files from host to image        | Yes            | Copy source code |
| `ADD`           | Copy files + extra features          | Yes            | Download + extract |
| `RUN`           | Execute command during build         | Yes            | Install packages |
| `CMD`           | Default command when container starts| No             | Start application |
| `ENTRYPOINT`    | Main executable of container         | No             | Fixed main command |
| `EXPOSE`        | Document port                        | No             | Tell which port app uses |
| `ENV`           | Set environment variable             | Yes            | Configuration |
| `ARG`           | Build-time variable                  | No             | Pass values during build |
| `VOLUME`        | Create mount point                   | Yes            | Persistent data |
| `USER`          | Switch user                          | Yes            | Security |
| `HEALTHCHECK`   | Check container health               | Yes            | Monitoring |
| `LABEL`         | Add metadata                         | Yes            | Documentation |

---

### 3. Line-by-Line Explanation of Each Instruction

#### 1. `FROM`
```dockerfile
FROM ubuntu:22.04
FROM node:18-alpine
FROM python:3.11-slim
```
- **Must be the first instruction** (except comments/ARG).
- Specifies the **base image**.
- Everything is built on top of this image.
- Prefer official and lightweight images (`alpine`, `slim`).

---

#### 2. `WORKDIR`
```dockerfile
WORKDIR /app
WORKDIR /usr/src/app
```
- Sets the **working directory** inside the image.
- If the directory doesn’t exist, Docker creates it.
- All following commands (`RUN`, `COPY`, `CMD`) will run from this directory.
- Better than using `cd` commands.

---

#### 3. `COPY` vs `ADD`

**`COPY`** (Recommended in most cases)
```dockerfile
COPY package.json .
COPY . .
COPY src/ /app/src/
```
- Copies files/folders from **host** → **image**.
- Simple and predictable.
- Preferred over `ADD`.

**`ADD`**
```dockerfile
ADD app.tar.gz /app/          # Automatically extracts tar files
ADD https://example.com/file /app/   # Can download from URL
```
- Has extra features (auto extract, remote URL).
- Official recommendation: Prefer `COPY` unless you need the extra features.

---

#### 4. `RUN`
```dockerfile
RUN apt-get update
RUN apt-get install -y nginx
RUN npm install
RUN pip install -r requirements.txt
```
- Executes commands **during image build**.
- Each `RUN` creates a **new layer**.
- Best practice: Combine multiple commands in one `RUN` to reduce layers.

**Good Practice:**
```dockerfile
RUN apt-get update && \
    apt-get install -y nginx curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

---

#### 5. `CMD`
```dockerfile
CMD ["nginx", "-g", "daemon off;"]
CMD ["node", "server.js"]
CMD ["python", "app.py"]
```
- Provides the **default command** when the container starts.
- Can be overridden when running the container.
- Preferred format: **Exec form** (JSON array) → `CMD ["executable", "param1"]`
- Only the **last CMD** in Dockerfile takes effect.

---

#### 6. `ENTRYPOINT`
```dockerfile
ENTRYPOINT ["python", "app.py"]
ENTRYPOINT ["nginx"]
```
- Sets the **main executable**.
- Harder to override than `CMD`.
- Often used together with `CMD` (ENTRYPOINT = fixed part, CMD = default arguments).

**Example Combination:**
```dockerfile
ENTRYPOINT ["python"]
CMD ["app.py"]
```

---

#### 7. `EXPOSE`
```dockerfile
EXPOSE 80
EXPOSE 3000 8080
```
- Documents which port the application listens on.
- Does **not** actually publish the port.
- Real port publishing is done with `-p` during `docker run`.

---

#### 8. `ENV`
```dockerfile
ENV NODE_ENV=production
ENV APP_PORT=3000
ENV PATH=$PATH:/app/bin
```
- Sets **environment variables** inside the image.
- Available during build and runtime.
- Can be overridden with `-e` during `docker run`.

---

#### 9. `ARG`
```dockerfile
ARG VERSION=1.0
ARG NODE_VERSION=18
FROM node:${NODE_VERSION}
```
- Defines **build-time variables** only.
- Not available after the image is built (unlike `ENV`).
- Passed during build:  
  `docker build --build-arg VERSION=2.0 .`

---

#### 10. Other Important Instructions

```dockerfile
VOLUME /data                          # Creates a mount point
USER node                             # Switch to non-root user (security)
HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1
LABEL maintainer="you@email.com"
```

---

### 4. Writing a Dockerfile from Scratch (Real Example)

Let’s create a simple Node.js application Dockerfile.

**Project structure:**
```
myapp/
├── Dockerfile
├── .dockerignore
├── package.json
└── server.js
```

**Dockerfile:**
```dockerfile
# 1. Base Image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy package files first (better caching)
COPY package*.json ./

# 4. Install dependencies
RUN npm install --production

# 5. Copy application code
COPY . .

# 6. Set environment variable
ENV NODE_ENV=production
ENV PORT=3000

# 7. Expose port
EXPOSE 3000

# 8. Start the application
CMD ["node", "server.js"]
```

---

### 5. Multi-Stage Builds (Very Important)

Used to create **small production images**.

```dockerfile
# Stage 1: Build Stage
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Benefits:**
- Final image is much smaller
- Build tools are not included in production image
- Better security

---

### 6. Best Practices (Must Follow)

1. **Use specific tags** → Avoid `latest`
2. **Minimize number of layers** → Combine `RUN` commands
3. **Order instructions properly** → Least changing → Most changing
4. **Use `.dockerignore`**
5. **Prefer `COPY` over `ADD`**
6. **Use multi-stage builds**
7. **Run as non-root user** (`USER`)
8. **Clean up** after installing packages
9. **Use lightweight base images** (`alpine`, `slim`)
10. **Leverage build cache**

---

### 7. `.dockerignore` File

Create a file named `.dockerignore`:

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
```

This prevents unnecessary files from being sent to the Docker daemon → Faster builds + smaller context.

---

### 8. Building the Image

```bash
# Basic build
docker build -t myapp:1.0 .

# Build with custom Dockerfile name
docker build -t myapp:1.0 -f MyDockerfile .

# Build with build arguments
docker build --build-arg VERSION=2.0 -t myapp:2.0 .

# Build without cache
docker build --no-cache -t myapp:1.0 .
```

---

### Summary – Most Important Points

| Topic              | Key Takeaway |
|--------------------|------------|
| Dockerfile         | Recipe to build image |
| `FROM`             | Always start with this |
| `RUN`              | Creates layers → Minimize them |
| `COPY` vs `ADD`    | Prefer `COPY` |
| `CMD` vs `ENTRYPOINT` | CMD is overridable, ENTRYPOINT is fixed |
| Multi-stage        | Best for small production images |
| `.dockerignore`    | Extremely important for performance |
| Layer Caching      | Order instructions wisely |

---
# 🐳 Dockerfile — In-Depth Study & Documentation

A **Dockerfile is one of the most important Docker topics for a developer/DevOps job**.

If you understand Dockerfile properly, you should be able to take a normal application such as:

```text
React
Express
Node.js
Python
Java
Go
```

and turn it into:

```text
Application
    ↓
Dockerfile
    ↓
docker build
    ↓
Docker Image
    ↓
docker run
    ↓
Container
```

---

# 1. What is a Dockerfile?

A **Dockerfile is a text file containing instructions that Docker uses to build a Docker image.**

Example:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Docker reads this file **from top to bottom** and uses the instructions to create an image.

Think of it as a **recipe**.

```text
Dockerfile
   │
   │ instructions
   ↓
Docker Build
   │
   ↓
Docker Image
```

### Important distinction

A Dockerfile is **not**:

* A Docker image
* A container
* A running application

Instead:

```text
Dockerfile
    ↓ build
Image
    ↓ run
Container
    ↓
Application
```

---

# 2. Example Project

Let's use this Express application throughout the explanation.

```text
backend/
│
├── package.json
├── package-lock.json
├── server.js
├── .env
├── .dockerignore
└── Dockerfile
```

`server.js`:

```javascript
import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Hello Docker!");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
```

`package.json`:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^5.0.0"
  }
}
```

---

# 3. First Dockerfile From Scratch

Let's create the simplest possible Dockerfile.

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Now let's understand **every single line**.

---

# 4. `FROM`

```dockerfile
FROM node:20-alpine
```

`FROM` specifies the **base image** for your Docker image.

Think:

```text
Your application
       ↓
needs Node.js
       ↓
FROM node:20-alpine
```

The `node:20-alpine` image already contains the environment required to run Node.js.

---

## Breaking it down

```text
node:20-alpine
│
├── node
│    ↓
│  image repository
│
└── 20-alpine
     ↓
   tag/version
```

You could use:

```dockerfile
FROM node:20
```

or:

```dockerfile
FROM node:20-alpine
```

or:

```dockerfile
FROM node:22-alpine
```

---

## Why Alpine?

Alpine Linux is designed to be lightweight.

Conceptually:

```text
node:20
    ↓
larger image

node:20-alpine
    ↓
smaller image
```

Smaller images can mean:

* Faster downloads
* Faster deployment
* Less storage
* Smaller attack surface

But Alpine isn't automatically the best choice for every application. Some native dependencies can behave differently, so test your application.

---

## Other examples

Node:

```dockerfile
FROM node:20-alpine
```

Python:

```dockerfile
FROM python:3.12-slim
```

Java:

```dockerfile
FROM eclipse-temurin:21-jre
```

Nginx:

```dockerfile
FROM nginx:alpine
```

Ubuntu:

```dockerfile
FROM ubuntu:24.04
```

---

# 5. `WORKDIR`

```dockerfile
WORKDIR /app
```

`WORKDIR` sets the **working directory inside the image/container** for subsequent instructions.

Think:

```text
Container
│
└── /app
     │
     ├── server.js
     ├── package.json
     └── node_modules
```

After:

```dockerfile
WORKDIR /app
```

commands such as:

```dockerfile
COPY
RUN
CMD
```

operate relative to `/app` unless otherwise specified.

---

## Why use WORKDIR?

Without it, you might end up writing:

```dockerfile
COPY server.js /app/server.js
COPY package.json /app/package.json
```

With `WORKDIR`:

```dockerfile
WORKDIR /app

COPY server.js .
COPY package.json .
```

Much cleaner.

### Important

If `/app` doesn't exist, Docker will normally create it.

---

# 6. `COPY`

```dockerfile
COPY package*.json ./
```

`COPY` copies files from the **build context** on your host machine into the image.

For example:

```text
Your computer

backend/
├── package.json
├── package-lock.json
└── server.js
```

This:

```dockerfile
COPY package*.json ./
```

copies:

```text
package.json
package-lock.json
```

into:

```text
/app/
```

because we previously specified:

```dockerfile
WORKDIR /app
```

---

## What does `./` mean?

```dockerfile
COPY package*.json ./
```

The destination:

```text
./
```

means the current working directory.

Because:

```dockerfile
WORKDIR /app
```

current directory is:

```text
/app
```

Therefore:

```text
COPY package*.json ./
```

means:

```text
Host
│
├── package.json
└── package-lock.json
       │
       ↓
Container image
│
└── /app
    ├── package.json
    └── package-lock.json
```

---

# 7. Why copy package files first?

This is a **very important Docker optimization**.

We write:

```dockerfile
COPY package*.json ./

RUN npm install

COPY . .
```

rather than:

```dockerfile
COPY . .

RUN npm install
```

Why?

Because Docker builds images in layers and can reuse cached layers when the relevant inputs haven't changed.

Suppose your source code changes:

```text
server.js
```

but:

```text
package.json
package-lock.json
```

didn't change.

Docker may reuse the cached dependency-installation layer.

Conceptually:

```text
COPY package*.json
       ↓
RUN npm install
       ↓
COPY source code
```

If only source code changes:

```text
COPY package*.json   ← CACHE
RUN npm install      ← CACHE
COPY . .             ← REBUILD
```

This can make builds significantly faster.

---

# 8. `ADD`

`ADD` can also copy files into an image:

```dockerfile
ADD . /app
```

But `ADD` has additional behavior beyond ordinary file copying, including handling local tar archives and certain URL sources.

For most normal application copying:

```dockerfile
COPY
```

is preferred because its behavior is simpler and clearer.

---

## COPY vs ADD

| Feature                        | COPY | ADD                    |
| ------------------------------ | ---- | ---------------------- |
| Copy local files               | ✅    | ✅                      |
| Copy directories               | ✅    | ✅                      |
| Automatic local tar extraction | ❌    | ✅                      |
| URL-related behavior           | ❌    | Historically supported |
| Simpler/clearer                | ✅    | Less predictable       |
| Default choice                 | ✅    | Only when needed       |

### Interview answer

> **Use `COPY` by default. Use `ADD` when you specifically need functionality provided by `ADD`, such as automatic extraction of local tar archives.**

---

# 9. `RUN`

```dockerfile
RUN npm install
```

`RUN` executes a command **while the image is being built**.

This distinction is critical.

```text
docker build
     ↓
RUN commands
     ↓
Image created
```

Example:

```dockerfile
RUN npm install
```

Docker installs dependencies **into the image**.

Other examples:

```dockerfile
RUN apt-get update
```

```dockerfile
RUN npm ci
```

```dockerfile
RUN mkdir /app/logs
```

```dockerfile
RUN npm run build
```

---

# 10. RUN vs CMD

This is a **very common interview question**.

### `RUN`

Runs during **image build**.

```dockerfile
RUN npm install
```

Meaning:

```text
docker build
     ↓
npm install
     ↓
Image
```

### `CMD`

Runs when the **container starts**.

```dockerfile
CMD ["node", "server.js"]
```

Meaning:

```text
docker run
    ↓
node server.js
    ↓
Application running
```

So:

```text
RUN
→ build time

CMD
→ container runtime
```

Memorize this.

---

# 11. `CMD`

```dockerfile
CMD ["node", "server.js"]
```

`CMD` specifies the **default command to run when a container starts**.

For our Express app:

```text
docker run
     ↓
CMD
     ↓
node server.js
     ↓
Express starts
```

---

## Exec form

Recommended:

```dockerfile
CMD ["node", "server.js"]
```

This is called **exec form**.

---

## Shell form

You can also write:

```dockerfile
CMD node server.js
```

This is shell form.

For most application containers, exec form is preferred because it gives more predictable process and signal behavior.

---

# 12. CMD can be overridden

Suppose:

```dockerfile
CMD ["node", "server.js"]
```

You run:

```bash
docker run myapp
```

Docker executes:

```text
node server.js
```

But:

```bash
docker run myapp node test.js
```

can override the default `CMD`.

Conceptually:

```text
Dockerfile
CMD ["node", "server.js"]
        ↓
default

docker run myapp node test.js
        ↓
override
```

---

# 13. `ENTRYPOINT`

`ENTRYPOINT` defines the **main executable/process** for a container.

Example:

```dockerfile
ENTRYPOINT ["node"]
```

Then:

```dockerfile
CMD ["server.js"]
```

Together:

```dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]
```

result in:

```text
node server.js
```

---

# 14. ENTRYPOINT vs CMD

This is another **very important interview question**.

### CMD

Defines a default command/arguments that are easier to override.

```dockerfile
CMD ["node", "server.js"]
```

### ENTRYPOINT

Defines the main executable.

```dockerfile
ENTRYPOINT ["node"]
```

Then:

```dockerfile
CMD ["server.js"]
```

acts as default arguments.

Think:

```text
ENTRYPOINT
     +
CMD
     ↓
Final command
```

Example:

```dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]
```

→

```text
node server.js
```

---

# 15. When should you use ENTRYPOINT?

Suppose you're building a Docker image intended to behave like a specific executable:

```dockerfile
ENTRYPOINT ["python"]
```

Then:

```bash
docker run myimage app.py
```

results conceptually in:

```text
python app.py
```

For normal web applications, you will commonly see:

```dockerfile
CMD ["npm", "start"]
```

or:

```dockerfile
CMD ["node", "server.js"]
```

You don't always need `ENTRYPOINT`.

---

# 16. `EXPOSE`

```dockerfile
EXPOSE 3000
```

`EXPOSE` documents that the application expects to listen on port `3000` inside the container.

For Express:

```text
Express
   ↓
listens on 3000
```

So:

```dockerfile
EXPOSE 3000
```

communicates that intention.

### Very important

`EXPOSE` does **not** publish the port to your host.

You still need:

```bash
docker run -p 3000:3000 myapp
```

---

# 17. EXPOSE vs -p

Remember:

```text
EXPOSE
→ declares/document intended container port

-p
→ publishes/maps host port to container port
```

Example:

```dockerfile
EXPOSE 3000
```

and:

```bash
docker run -p 8080:3000 myapp
```

means:

```text
Browser
localhost:8080
       ↓
Host :8080
       ↓
Container :3000
       ↓
Express
```

---

# 18. `ENV`

`ENV` defines environment variables in the image/container environment.

Example:

```dockerfile
ENV NODE_ENV=production
```

Then inside Node.js:

```javascript
process.env.NODE_ENV
```

returns:

```text
production
```

Another:

```dockerfile
ENV PORT=3000
```

Then:

```javascript
process.env.PORT
```

returns:

```text
3000
```

---

# 19. ENV at build time and runtime

Suppose:

```dockerfile
ENV NODE_ENV=production
```

Build:

```bash
docker build -t myapp .
```

Run:

```bash
docker run myapp
```

The container receives:

```text
NODE_ENV=production
```

You can override it:

```bash
docker run -e NODE_ENV=development myapp
```

Now the runtime value becomes:

```text
development
```

---

# 20. Don't store secrets in ENV inside Dockerfile

Avoid:

```dockerfile
ENV JWT_SECRET=mySuperSecret
```

for real secrets.

Why?

The value can become part of image metadata/history and can be exposed to anyone who can access the image.

Instead, provide secrets at runtime or through a proper secret-management system.

For development:

```bash
docker run -e JWT_SECRET="..." myapp
```

or:

```bash
docker run --env-file .env myapp
```

Production systems should use dedicated secret-management mechanisms.

---

# 21. `ARG`

`ARG` defines a **build-time variable**.

Example:

```dockerfile
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine
```

Build:

```bash
docker build --build-arg NODE_VERSION=22 -t myapp .
```

Now the build uses:

```text
node:22-alpine
```

---

# 22. ARG vs ENV

Very important.

### ARG

Available primarily during **image build**.

```dockerfile
ARG APP_VERSION=1.0
```

### ENV

Available in the **resulting container environment**.

```dockerfile
ENV NODE_ENV=production
```

Comparison:

|                            | ARG                           | ENV                                |
| -------------------------- | ----------------------------- | ---------------------------------- |
| Build-time variable        | ✅                             | Can be used                        |
| Runtime container variable | ❌ generally not automatically | ✅                                  |
| Set with                   | `--build-arg`                 | `-e`, `--env-file`, Dockerfile     |
| Good for secrets           | ❌                             | ❌ as a Dockerfile secret mechanism |

Example:

```dockerfile
ARG VERSION=1.0
ENV NODE_ENV=production
```

Think:

```text
ARG
 ↓
Build

ENV
 ↓
Container runtime
```

---

# 23. `VOLUME`

`VOLUME` declares a mount point for persistent data.

Example:

```dockerfile
VOLUME ["/app/data"]
```

Why?

Containers are designed to be replaceable.

If a container is deleted:

```text
Container
   ↓
deleted
   ↓
container writable data may be lost
```

For persistent data:

```text
Container
   ↓
Volume
   ↓
Persistent storage
```

For example, databases should generally use persistent volumes.

---

# 24. Example MongoDB Volume

```dockerfile
VOLUME ["/data/db"]
```

MongoDB stores database data under `/data/db`.

However, in real projects, you'll usually create/manage volumes with:

```bash
docker volume create mongo-data
```

and run:

```bash
docker run \
  -v mongo-data:/data/db \
  mongo
```

Docker Compose is even more convenient for this later.

---

# 25. `USER`

By default, some images run applications as `root`.

You can specify a non-root user:

```dockerfile
USER node
```

For example:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install

USER node

CMD ["node", "server.js"]
```

Why?

Security.

If your application is compromised while running as root, the potential impact can be greater.

A common production best practice is:

> **Run applications as a non-root user whenever practical.**

---

# 26. `HEALTHCHECK`

`HEALTHCHECK` tells Docker how to test whether the application is healthy.

Example:

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1
```

Conceptually:

```text
Docker
   ↓
"Is application healthy?"
   ↓
HTTP request
   ↓
Success → healthy
Failure → unhealthy
```

This is useful because:

```text
Container is running
```

doesn't necessarily mean:

```text
Application is healthy
```

For example:

```text
Container → RUNNING
Express   → crashed internally / unavailable
```

A health check helps distinguish these situations.

---

# 27. Complete Dockerfile

Now let's combine the important instructions.

```dockerfile
FROM node:20-alpine

ARG APP_VERSION=1.0

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

Let's understand the flow:

```text
FROM
 ↓
Choose Node base image

ARG
 ↓
Build-time configuration

ENV
 ↓
Runtime environment

WORKDIR
 ↓
Set /app

COPY package*.json
 ↓
Copy dependency manifests

RUN npm ci
 ↓
Install dependencies

COPY .
 ↓
Copy application

EXPOSE
 ↓
Declare application port

USER
 ↓
Run as non-root user

HEALTHCHECK
 ↓
Check application health

CMD
 ↓
Start application
```

---

# 28. Why `npm ci` instead of `npm install`?

If you have:

```text
package.json
package-lock.json
```

then:

```dockerfile
RUN npm ci --omit=dev
```

is often preferable for production image builds.

`npm ci` is designed for clean, reproducible installs based on the lockfile.

For development:

```dockerfile
RUN npm install
```

can be perfectly fine.

For production:

```dockerfile
RUN npm ci --omit=dev
```

is commonly preferred when a lockfile is available.

---

# 29. `.dockerignore`

This is another **very important Docker topic**.

`.dockerignore` tells Docker which files/directories should be excluded from the build context.

Example:

```text
node_modules
.git
.gitignore
.env
npm-debug.log
Dockerfile
README.md
coverage
dist
```

---

# 30. Why `.dockerignore` is important

Suppose your project contains:

```text
backend/
│
├── node_modules/       ← huge
├── .git/               ← unnecessary
├── .env                ← secret
├── server.js
├── package.json
└── Dockerfile
```

Then:

```dockerfile
COPY . .
```

could otherwise send unnecessary files as part of the build context.

`.dockerignore` prevents that.

---

# 31. Recommended Node `.dockerignore`

```text
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
```

Be careful with `.env` patterns: don't ignore files you intentionally need to copy into an image, and in general don't bake secrets into images.

---

# 32. Build Context

When you run:

```bash
docker build -t myapp .
```

the final:

```text
.
```

means:

> Use the current directory as the build context.

For example:

```text
backend/
├── Dockerfile
├── server.js
├── package.json
└── .dockerignore
```

Run:

```bash
cd backend
docker build -t myapp .
```

The context is:

```text
backend/
```

Docker can then access files inside that context for instructions such as:

```dockerfile
COPY . .
```

---

# 33. Why `.dockerignore` affects performance

Imagine:

```text
Project
├── node_modules     1 GB
├── .git             200 MB
├── source           20 MB
```

Without `.dockerignore`:

```text
Build context
      ↓
1.2 GB+
```

With:

```text
node_modules
.git
```

ignored:

```text
Build context
      ↓
20 MB
```

This can make builds and file transfer much faster.

---

# 34. `docker build`

Now let's build the image.

Dockerfile:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build:

```bash
docker build -t my-express-app .
```

Breakdown:

```text
docker
 ↓
Docker CLI

build
 ↓
Build an image

-t
 ↓
Tag/name the image

my-express-app
 ↓
Image name

.
 ↓
Build context
```

---

# 35. Build with a version tag

```bash
docker build -t my-express-app:1.0 .
```

Now:

```text
Repository: my-express-app
Tag:        1.0
```

You can also use:

```bash
docker build -t my-express-app:latest .
```

But don't depend on `latest` for production versioning.

Prefer explicit versions:

```text
1.0.0
1.1.0
2.0.0
```

---

# 36. Build with `ARG`

Dockerfile:

```dockerfile
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

CMD ["node", "server.js"]
```

Build:

```bash
docker build \
  --build-arg NODE_VERSION=22 \
  -t myapp:22 .
```

Now the base image becomes:

```text
node:22-alpine
```

---

# 37. Build and inspect

After:

```bash
docker build -t myapp:1.0 .
```

check:

```bash
docker images
```

You'll see:

```text
REPOSITORY   TAG   IMAGE ID
myapp        1.0   abc123
```

Inspect:

```bash
docker image inspect myapp:1.0
```

---

# 38. Run the built image

```bash
docker run -d \
  --name my-api \
  -p 3000:3000 \
  myapp:1.0
```

Now:

```text
Docker Image
     ↓
docker run
     ↓
Container
     ↓
node server.js
     ↓
Express :3000
```

Test:

```text
http://localhost:3000
```

---

# 39. Debug the application

If something doesn't work:

### Check container

```bash
docker ps
```

### Check all containers

```bash
docker ps -a
```

### Check logs

```bash
docker logs my-api
```

### Follow logs

```bash
docker logs -f my-api
```

### Enter container

```bash
docker exec -it my-api sh
```

### Inspect

```bash
docker inspect my-api
```

### Check resource usage

```bash
docker stats my-api
```

This should become your standard Docker debugging workflow.

---

# 40. Multi-Stage Builds

This is an **important production Docker concept**.

Suppose you're building a React application.

You need Node.js to build it:

```text
npm install
npm run build
```

But after the build, you may only need the generated static files.

Instead of keeping Node.js and all build dependencies in the final image, use **multi-stage builds**.

Example:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
```

---

# 41. Multi-stage build — line by line

### Stage 1

```dockerfile
FROM node:20-alpine AS builder
```

Creates a build stage called:

```text
builder
```

Then:

```dockerfile
WORKDIR /app
```

Set working directory.

```dockerfile
COPY package*.json ./
```

Copy dependencies.

```dockerfile
RUN npm ci
```

Install dependencies.

```dockerfile
COPY . .
```

Copy React source code.

```dockerfile
RUN npm run build
```

Creates:

```text
dist/
```

---

### Stage 2

```dockerfile
FROM nginx:alpine
```

Start a fresh final image.

Then:

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

Copy only the generated build files.

Conceptually:

```text
Stage 1
Node
+
npm
+
dependencies
+
source
       ↓
    npm run build
       ↓
      dist
       │
       ↓
Stage 2
Nginx
+
dist
       ↓
Final Image
```

The final image doesn't need all the Node build tooling.

---

# 42. Why Multi-Stage Builds?

Without multi-stage:

```text
Node
npm
dependencies
source code
build tools
dist
```

With multi-stage:

```text
Nginx
+
dist
```

Potential benefits:

* Smaller final image
* Less unnecessary software
* Reduced attack surface
* Faster deployment
* Cleaner production image

---

# 43. Docker Image Layers

Docker images are built from layers.

Example:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node", "server.js"]
```

Conceptually:

```text
Image
│
├── Base image layer
│
├── WORKDIR-related filesystem changes
│
├── package files layer
│
├── npm dependencies layer
│
└── application source layer
```

Docker can reuse unchanged layers.

This is why instruction ordering matters.

---

# 44. Bad Dockerfile Ordering

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm install
```

Suppose:

```text
server.js
```

changes.

Docker may invalidate the layer containing:

```dockerfile
COPY . .
```

which means:

```text
COPY . .
    ↓
RUN npm install
```

may need to run again.

---

# 45. Better Ordering

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["node", "server.js"]
```

Now:

```text
package.json unchanged
package-lock unchanged
```

means Docker can often reuse:

```text
RUN npm ci
```

even if source code changes.

This is one of the most useful Docker build optimizations.

---

# 46. Dockerfile Best Practices

## 1. Use a small appropriate base image

Instead of:

```dockerfile
FROM ubuntu
```

for a Node application, consider:

```dockerfile
FROM node:20-alpine
```

or another appropriately maintained minimal base.

---

## 2. Use `.dockerignore`

```text
node_modules
.git
.env
coverage
```

This reduces build context and prevents unnecessary files from entering the build.

---

## 3. Order instructions for caching

Prefer:

```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .
```

rather than:

```dockerfile
COPY . .
RUN npm ci
```

---

## 4. Don't install unnecessary packages

Avoid:

```dockerfile
RUN apt-get install ...
```

unless required.

---

## 5. Use multi-stage builds

Especially for:

* React
* TypeScript
* Java
* Go
* compiled applications

---

## 6. Run as non-root

Use:

```dockerfile
USER node
```

or create an appropriate non-root user.

---

## 7. Pin important versions

Instead of:

```dockerfile
FROM node:latest
```

prefer something explicit such as:

```dockerfile
FROM node:20-alpine
```

For stronger reproducibility, teams may pin even more precisely, including image digests.

---

## 8. Don't put secrets in images

Avoid:

```dockerfile
ENV API_KEY=secret
```

Use runtime environment variables or secret-management systems.

---

## 9. Use exec form for CMD/ENTRYPOINT

Prefer:

```dockerfile
CMD ["node", "server.js"]
```

over:

```dockerfile
CMD node server.js
```

---

## 10. Keep containers focused

A common principle is:

> One container should generally have one primary responsibility.

For example:

```text
React → container
API → container
MongoDB → container
Nginx → container
```

Docker Compose can then coordinate them.

---

# 47. `FROM scratch`

You may eventually encounter:

```dockerfile
FROM scratch
```

`scratch` is an empty base image.

It's useful for very small self-contained binaries, especially some Go applications.

Example concept:

```text
Builder
  ↓
Go binary
  ↓
scratch
  ↓
tiny final image
```

Don't use `scratch` blindly; the application must have everything it needs to run.

---

# 48. `AS` — Named Build Stages

You can name stages:

```dockerfile
FROM node:20-alpine AS builder
```

Then reference them:

```dockerfile
COPY --from=builder /app/dist /usr/share/nginx/html
```

This is fundamental to multi-stage builds.

---

# 49. `docker build` Useful Options

### Basic

```bash
docker build -t myapp .
```

### Tag

```bash
docker build -t myapp:1.0 .
```

### Build argument

```bash
docker build --build-arg NODE_VERSION=22 -t myapp .
```

### Specify Dockerfile

```bash
docker build -f Dockerfile.prod -t myapp:prod .
```

### Disable cache

```bash
docker build --no-cache -t myapp .
```

Useful when debugging cache-related issues.

### Pull latest base image

```bash
docker build --pull -t myapp .
```

This tells Docker to attempt to pull newer versions of referenced base images.

---

# 50. Build Command Workflow

A professional workflow might look like:

```bash
docker build \
  -t ecommerce-api:1.0.0 \
  .
```

Then:

```bash
docker images
```

Then:

```bash
docker run -d \
  --name ecommerce-api \
  -p 3000:3000 \
  ecommerce-api:1.0.0
```

Then:

```bash
docker ps
```

Then:

```bash
docker logs -f ecommerce-api
```

---

# 51. Complete Node.js Production Dockerfile

A good starting point:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

USER node

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

And:

```text
node_modules
.git
.env
npm-debug.log
coverage
.vscode
Dockerfile
docker-compose.yml
```

in `.dockerignore` as appropriate for your project.

**One caveat:** the `HEALTHCHECK` command above assumes the image has `wget`; verify that your chosen base image provides it. Otherwise use an appropriate health-check mechanism for your image.

---

# 52. Dockerfile Instruction Cheat Sheet

| Instruction   | Main purpose               | Build/Runtime         |
| ------------- | -------------------------- | --------------------- |
| `FROM`        | Base image                 | Build                 |
| `WORKDIR`     | Working directory          | Build/runtime context |
| `COPY`        | Copy files                 | Build                 |
| `ADD`         | Copy + additional features | Build                 |
| `RUN`         | Execute build command      | Build                 |
| `CMD`         | Default container command  | Runtime               |
| `ENTRYPOINT`  | Main executable            | Runtime               |
| `EXPOSE`      | Declare intended port      | Metadata              |
| `ENV`         | Environment variable       | Runtime               |
| `ARG`         | Build argument             | Build                 |
| `VOLUME`      | Declare data mount         | Runtime/storage       |
| `USER`        | Set user                   | Runtime               |
| `HEALTHCHECK` | Check container health     | Runtime               |

---

# 53. The Most Important Differences to Memorize

### RUN vs CMD

```text
RUN
→ executes while building image

CMD
→ executes when container starts
```

---

### CMD vs ENTRYPOINT

```text
CMD
→ default command/arguments

ENTRYPOINT
→ main executable
```

---

### COPY vs ADD

```text
COPY
→ straightforward file copying

ADD
→ copying plus additional behaviors
```

Use `COPY` by default.

---

### ARG vs ENV

```text
ARG
→ build-time configuration

ENV
→ environment available to the container
```

---

### EXPOSE vs `-p`

```text
EXPOSE
→ declares intended container port

-p
→ publishes/maps host port
```

---

# 54. Full Dockerfile Mental Model

You should be able to visualize this:

```text
                    Dockerfile
                         │
                         │ docker build
                         ↓
              ┌─────────────────────┐
              │      FROM           │
              │      WORKDIR        │
              │      COPY           │
              │      RUN            │
              │      COPY           │
              │      ENV            │
              │      EXPOSE         │
              │      USER           │
              │      HEALTHCHECK    │
              │      CMD            │
              └─────────────────────┘
                         │
                         ↓
                    Docker Image
                         │
                         │ docker run
                         ↓
                    Container
                         │
                         ↓
                  ENTRYPOINT / CMD
                         │
                         ↓
                  Running Process
                         │
                         ↓
                    Application
```

---

# 55. Job-Ready Dockerfile Knowledge

For a **2026 MERN/Backend/DevOps job**, don't just memorize the syntax. You should be able to explain **why** each instruction exists.

Given:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 3000

USER node

CMD ["node", "server.js"]
```

You should be able to explain:

### Line 1

```dockerfile
FROM node:20-alpine
```

> I use Node 20 on Alpine as the base environment for my Node.js application.

### Line 2

```dockerfile
WORKDIR /app
```

> I set `/app` as the working directory for subsequent instructions and the application process.

### Line 3

```dockerfile
COPY package*.json ./
```

> I copy dependency manifests separately so dependency installation can be cached independently from application source changes.

### Line 4

```dockerfile
RUN npm ci --omit=dev
```

> I install dependencies during image build using the lockfile and omit development dependencies for this production image.

### Line 5

```dockerfile
COPY . .
```

> I copy the application source into the image after installing dependencies.

### Line 6

```dockerfile
ENV NODE_ENV=production
```

> I set the container's runtime environment to production.

### Line 7

```dockerfile
EXPOSE 3000
```

> I document that the application listens on port 3000 inside the container.

### Line 8

```dockerfile
USER node
```

> I run the application as a non-root user to reduce security risk.

### Line 9

```dockerfile
CMD ["node", "server.js"]
```

> I specify the default process that starts when the container runs.

That's the level of explanation you want in an interview.

---

# 🎯 Your Dockerfile Study Checklist

Before moving to Docker Compose, make sure you can explain all of these **without looking at notes**:

```text
Dockerfile
│
├── FROM
├── WORKDIR
├── COPY
├── ADD
├── RUN
├── CMD
├── ENTRYPOINT
├── EXPOSE
├── ENV
├── ARG
├── VOLUME
├── USER
├── HEALTHCHECK
│
├── .dockerignore
│
├── Build context
│
├── docker build
│   ├── -t
│   ├── -f
│   ├── --build-arg
│   ├── --no-cache
│   └── --pull
│
├── Image layers
├── Build cache
├── Image size optimization
├── Multi-stage builds
└── Security best practices
```

### ⭐ Most important interview concepts

If you're short on time, prioritize these:

**1.** `FROM`
**2.** `WORKDIR`
**3.** `COPY`
**4.** `RUN`
**5.** `CMD` vs `ENTRYPOINT`
**6.** `EXPOSE` vs `-p`
**7.** `ENV` vs `ARG`
**8.** `.dockerignore`
**9.** Docker build context
**10.** Image layers + caching
**11.** Multi-stage builds
**12.** Running as non-root
**13.** Image-size optimization
**14.** `docker build` options
**15.** Building and running a real Express application

The **best practical exercise** now is to Dockerize your own Express backend, deliberately introduce a few problems (wrong `WORKDIR`, wrong port, missing dependency, bad `CMD`, missing `.dockerignore`) and learn to diagnose them using `docker build`, `docker ps -a`, `docker logs`, `docker inspect`, and `docker exec`. That will make these concepts stick much faster than memorizing the syntax.

















## 🎯 What you should practice now

Don't just memorize these commands. Build a small **Express Docker practice project** and perform this exact sequence:

```text
1. Create Express app
       ↓
2. Write Dockerfile
       ↓
3. docker build
       ↓
4. docker images
       ↓
5. docker run -d
       ↓
6. docker ps
       ↓
7. Open localhost:3000
       ↓
8. docker logs
       ↓
9. docker exec
       ↓
10. docker inspect
       ↓
11. docker stats
       ↓
12. docker stop
       ↓
13. docker start
       ↓
14. docker restart
       ↓
15. docker rm
       ↓
16. docker rmi
```

Once this becomes comfortable, the next major step is **Dockerfile in depth**, because that's where `FROM`, `WORKDIR`, `COPY`, `RUN`, `CMD`, `ENTRYPOINT`, `EXPOSE`, `.dockerignore`, **image layers, build cache, and multi-stage builds** start to make sense.
