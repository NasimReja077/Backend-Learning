**Docker Commands Cheatsheet**  
*(Perfect for quick revision & interviews)*

---

### 1. Basic Info
```bash
docker --version          # Docker version
docker version            # Detailed client + server info
docker info               # System-wide Docker information
```

---

### 2. Images
```bash
docker pull nginx                         # Download image
docker images                             # List images
docker images -a                          # List all images (including intermediate)
docker rmi <image>                        # Remove image
docker rmi -f <image>                     # Force remove image
docker tag <old> <new>                    # Create new tag
docker push <image>                       # Push image to registry
docker history <image>                    # Show image layers
docker inspect <image>                    # Detailed image info
```

---

### 3. Containers – Lifecycle
```bash
docker run <image>                        # Create + Start container
docker ps                                 # List running containers
docker ps -a                              # List all containers
docker start <container>                  # Start stopped container
docker stop <container>                   # Stop running container
docker restart <container>                # Restart container
docker rm <container>                     # Remove stopped container
docker rm -f <container>                  # Force remove running container
docker rename <old> <new>                 # Rename container
```

---

### 4. Important `docker run` Options
```bash
docker run -d <image>                     # Detached mode (background)
docker run -it <image> bash               # Interactive mode
docker run -p 8080:80 <image>             # Port mapping (Host:Container)
docker run -e KEY=VALUE <image>           # Environment variable
docker run --name myapp <image>           # Custom container name
docker run -v myvolume:/data <image>      # Mount volume
docker run --rm <image>                   # Auto-remove after stop
docker run -m 512m <image>                # Memory limit
```

**Useful Combinations:**
```bash
docker run -d --name web -p 8080:80 nginx
docker run -it --name ubuntu ubuntu bash
docker run -d -e MYSQL_ROOT_PASSWORD=123 --name mysql mysql:8.0
```

---

### 5. Logs, Exec & Inspect
```bash
docker logs <container>                   # View logs
docker logs -f <container>                # Follow logs (real-time)
docker logs --tail 100 <container>        # Last 100 lines
docker exec -it <container> bash          # Open shell inside container
docker exec <container> <command>         # Run single command
docker inspect <container>                # Full details (JSON)
docker stats                              # Live CPU, Memory, Network usage
docker top <container>                    # Processes inside container
```

---

### 6. Copy & Commit
```bash
docker cp <container>:/path /host/path    # Container → Host
docker cp /host/path <container>:/path    # Host → Container
docker commit <container> <new-image>     # Create image from container
```

---

### 7. Cleanup Commands
```bash
docker container prune                    # Remove all stopped containers
docker image prune                        # Remove unused images
docker system prune                       # Remove unused data
docker system prune -a                    # Aggressive cleanup
docker volume prune                       # Remove unused volumes
```

---

### 8. Most Used Daily Commands
```bash
docker ps -a
docker images
docker logs -f <container>
docker exec -it <container> bash
docker stop <container> && docker rm <container>
docker run -d --name <name> -p <host>:<container> <image>
```

---

### Quick Flow Reminder
```
Image → docker run → Container → Running Application
         ↓
      docker stop → Stopped
         ↓
      docker rm  → Deleted
```

---

Would you like me to also create a **Volumes + Networking Cheatsheet** next?