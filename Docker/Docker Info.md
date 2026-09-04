# Docker Fundamentals – Complete Learning & Documentation Guide

A clean, consolidated guide covering what Docker is, architecture, images vs containers, layers, UnionFS, and registries.  
Duplicates removed • Diagrams • Examples • Summary • Practice project

---

## 1. What is Docker?

**Docker** is an open-source platform that packages an application and everything it needs (code, runtime, libraries, config) into a standardized unit called a **container**.

> **Build once, run anywhere.**

It solves the classic problem: *“It works on my machine”*.

```
┌──────────────────────────────┐
│       Docker Container       │
│                              │
│  Application code            │
│  Runtime (e.g. Node.js)      │
│  Dependencies                │
│  Configuration               │
└──────────────────────────────┘
         runs the same on
   laptop → server → cloud → CI
```

### Key benefits
- Consistent environments (dev → test → prod)
- Lightweight and fast startup
- Easy to scale and deploy
- High portability

---

## 2. Docker vs Virtual Machine

| Feature            | Docker Container                          | Virtual Machine                          |
|--------------------|-------------------------------------------|------------------------------------------|
| Isolation          | Process / container level (shares kernel) | Full hardware + guest OS                 |
| Size               | MBs – low GBs                             | Often several GBs                        |
| Startup            | Seconds                                   | Minutes                                  |
| Resource usage     | Low                                       | High                                     |
| OS                 | Shares host kernel                        | Full guest OS per VM                     |
| Performance        | Near-native                               | Hypervisor overhead                      |
| Typical use        | Microservices, APIs, CI/CD                | Different OS, strong isolation needs     |

### Visual comparison

```
Virtual Machine                     Docker
─────────────────                   ─────────────────
┌─────────────────────┐             ┌─────────────────────┐
│     Hypervisor      │             │   Docker Engine     │
├───────┬───────┬─────┤             ├───────┬───────┬─────┤
│Guest  │Guest  │Guest│             │ App A │ App B │App C│
│ OS +  │ OS +  │ OS+ │             │(Cont.)│(Cont.)│(C.) │
│ App   │ App   │ App │             └───────┴───────┴─────┘
└───────┴───────┴─────┘                       │
         Host OS                         Host OS (shared kernel)
         Hardware                             Hardware
```

**Interview tip:** Containers do *not* “have no OS”. They have a user-space filesystem and runtime, but **share the host kernel** instead of booting a separate guest kernel.

---

## 3. Docker Architecture

Client–server model:

```
┌──────────────────┐         ┌────────────────────────────────┐
│  Docker Client   │  REST   │         Docker Host            │
│  (CLI / Desktop) │ ──────► │  Docker Daemon (dockerd)       │
└──────────────────┘  API    │    • Images  • Containers      │
                             │    • Networks • Volumes        │
                             └────────────────┬───────────────┘
                                              │ pull / push
                                              ▼
                             ┌────────────────────────────────┐
                             │     Docker Registry            │
                             │  (Docker Hub / private)        │
                             └────────────────────────────────┘
```

| Component          | Role |
|--------------------|------|
| **Docker Client**  | CLI or GUI you type commands into |
| **Docker Daemon**  | Background service that builds images, runs containers, manages networks/volumes |
| **Docker Host**    | Machine where the daemon runs |
| **Image**          | Read-only template |
| **Container**      | Running (or created) instance of an image |
| **Registry**       | Store & distribute images (Docker Hub, ECR, GHCR, Harbor, …) |

**Typical flow**
1. `docker pull nginx` → Client → Daemon → Registry  
2. `docker run nginx` → Daemon creates & starts a container  
3. `docker build` → Daemon builds an image from a Dockerfile  

---

## 4. Image vs Container

| Image                              | Container                              |
|------------------------------------|----------------------------------------|
| Read-only template / blueprint     | Instance of an image                   |
| Stored locally or in a registry    | Has a writable layer on top            |
| Can create many containers         | Can be started, stopped, removed       |

```
              IMAGE (blueprint)
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
   Container  Container  Container
```

Analogy: **Image ≈ Class**, **Container ≈ Object**.

```bash
docker pull nginx          # get image
docker run -d nginx        # create + start container
```

---

## 5. Docker Layers & Union File System

### What are layers?

An image is a **stack of read-only layers**.  
Most Dockerfile instructions (`FROM`, `RUN`, `COPY`, …) create a new layer.

```dockerfile
FROM ubuntu:22.04              # Layer 1
RUN apt-get update             # Layer 2
RUN apt-get install -y nginx   # Layer 3
COPY index.html /var/www/html/ # Layer 4
CMD ["nginx", "-g", "daemon off;"]  # metadata (no new FS layer)
```

When a **container** starts, Docker adds one **writable layer** on top:

```
┌─────────────────────────────────┐
│  Container Layer (Read-Write)   │  ← only this can change
├─────────────────────────────────┤
│  Image Layer 4 (COPY)           │  Read-only
├─────────────────────────────────┤
│  Image Layer 3 (install nginx)  │  Read-only
├─────────────────────────────────┤
│  Image Layer 2 (apt-get update) │  Read-only
├─────────────────────────────────┤
│  Base Image Layer (ubuntu)      │  Read-only (shared)
└─────────────────────────────────┘
```

### Why layers matter
- **Sharing** – many images reuse the same base layers  
- **Caching** – unchanged layers are reused on rebuild → faster builds  
- **Efficiency** – only differences are stored  

### Union File System (UnionFS)

UnionFS (commonly **OverlayFS** today) overlays the layers so they look like **one filesystem**.

### Copy-on-Write (CoW)

1. File lives in a lower read-only layer.  
2. Container tries to modify it.  
3. Docker **copies** the file into the writable top layer, then modifies the copy.  
4. Original lower layer stays unchanged.

That is why containers stay lightweight and isolated.

---

## 6. Docker Hub & Registries

A **registry** stores and distributes images.

| Type              | Examples                                      | Use |
|-------------------|-----------------------------------------------|-----|
| **Public**        | Docker Hub                                    | Learning, open-source |
| **Private**       | Docker Hub private, AWS ECR, GHCR, Azure ACR, Harbor, GitLab | Company / production |

### Common workflow

```
Developer machine
      │ docker build
      ▼
  Local image
      │ docker tag + docker push
      ▼
 Registry (Hub / ECR / Harbor …)
      │ docker pull
      ▼
 Servers / CI / Kubernetes / teammates
```

```bash
docker login
docker tag myapp:1.0 username/myapp:1.0
docker push username/myapp:1.0
docker pull username/myapp:1.0
```

> Production images almost always go to a **private** registry for security, access control, and compliance.

---

## 7. Essential Commands (Quick Reference)

```bash
# Info
docker --version
docker info

# Images
docker images
docker pull nginx
docker build -t myapp:1.0 .
docker rmi myapp:1.0
docker history myapp:1.0
docker image inspect myapp:1.0

# Containers
docker run -d --name web -p 8080:80 nginx
docker ps
docker ps -a
docker stop web
docker start web
docker restart web
docker rm web
docker logs -f web
docker exec -it web sh
```

**Key differences**
```
docker run   → create + start (new container)
docker start → start existing container
docker stop  → stop container
docker rm    → delete container
docker rmi   → delete image
```

---

## 8. Summary

| Concept              | Key takeaway |
|----------------------|--------------|
| **Docker**           | Package app + deps into portable containers |
| **Container vs VM**  | Containers share host kernel → lighter & faster |
| **Image**            | Read-only template |
| **Container**        | Running instance of an image |
| **Layers**           | Stacked read-only layers; one writable layer per container |
| **UnionFS / CoW**    | Layers look like one FS; writes copy to top layer |
| **Registry**         | Store & share images (Hub public, private for real projects) |

---

## 9. Small Practice Project – Layers, CoW & Registry

Demonstrates layers, UnionFS/CoW, and pushing to a registry.

### Project structure

```
layers-demo/
├── Dockerfile
├── message.txt
└── (optional) .dockerignore
```

### 1. `message.txt`

```text
This file was copied with the COPY instruction.
```

### 2. `Dockerfile`

```dockerfile
# Layer 1 – base
FROM ubuntu:22.04

# Layer 2
RUN apt-get update

# Layer 3
RUN apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Layer 4
RUN echo "Hello from Docker Layers!" > /var/www/html/index.html

# Layer 5
COPY message.txt /var/www/html/message.txt

# Metadata only
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Build & inspect layers

```bash
docker build -t my-layers-demo:1.0 .

# See each layer
docker history my-layers-demo:1.0

# Detailed info
docker image inspect my-layers-demo:1.0
```

### 4. Demonstrate Copy-on-Write

```bash
# Run container
docker run -d --name layer-test -p 8080:80 my-layers-demo:1.0

# Original content (from image layer)
docker exec layer-test cat /var/www/html/index.html
# → Hello from Docker Layers!

# Modify file → CoW copies it into container writable layer
docker exec layer-test sh -c 'echo "Modified inside container" > /var/www/html/index.html'

docker exec layer-test cat /var/www/html/index.html
# → Modified inside container

# New container from same image still has original content
docker run --rm my-layers-demo:1.0 cat /var/www/html/index.html
# → Hello from Docker Layers!
```

Open http://localhost:8080 in a browser to see the modified page (from the running container).

### 5. (Optional) Push to Docker Hub

```bash
docker login
docker tag my-layers-demo:1.0 YOUR_USERNAME/my-layers-demo:1.0
docker push YOUR_USERNAME/my-layers-demo:1.0
```

### 6. Cleanup

```bash
docker stop layer-test
docker rm layer-test
docker rmi my-layers-demo:1.0
# docker rmi YOUR_USERNAME/my-layers-demo:1.0   # if you pushed
```

### What you practiced

| Concept            | What you saw |
|--------------------|--------------|
| **Layers**         | Each `RUN` / `COPY` → new layer (`docker history`) |
| **UnionFS**        | All layers appear as one filesystem |
| **Copy-on-Write**  | Edit only affects the container layer; image stays unchanged |
| **Registry**       | Tag + push / pull workflow |

---

## 10. Interview Checklist

Be able to explain without notes:

1. What is Docker and why use it?  
2. Container vs Virtual Machine  
3. Docker Client, Daemon, Registry  
4. Image vs Container  
5. What layers are and why they help (cache, sharing)  
6. UnionFS and Copy-on-Write  
7. Public vs private registry and when to use each  
8. `docker run` vs `docker start`, `docker stop` vs `docker rm`

---

**Learning path so far**

```
Fundamentals (this guide)
    → Dockerfile
    → Commands & lifecycle
    → Layers & registries (this guide)
    → Volumes & Networking
    → Docker Compose
    → Multi-container MERN
    → Nginx, CI/CD, cloud, Kubernetes
```

Next recommended topics: **Docker Volumes** and **Docker Networking**, then refine multi-container apps with Compose.