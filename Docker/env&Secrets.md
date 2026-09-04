**Environment Variables & Secrets in Docker – Complete In-Depth Study Guide**  
*(Very Important for Real Projects)*

In real applications (especially MERN, Node.js, etc.), you will have sensitive information like:

```env
MONGO_URI=mongodb://admin:secret@mongodb:27017/mydb
JWT_SECRET=mySuperSecretKey123
RAZORPAY_KEY=rzp_test_xxxxx
API_KEY=sk_live_xxxxx
```

You should **never hardcode** these values directly in your code or Dockerfile.

---

### 1. Why Secrets Should Never Be Hardcoded

| Bad Practice | Problem |
|--------------|--------|
| Hardcoding in code | Anyone who sees the code can steal secrets |
| Writing in Dockerfile | Secrets get stored in image layers forever |
| Committing to GitHub | Secrets become public (very common mistake) |
| Putting in `docker run` command | Visible in process list & shell history |

**Real Risk Example:**
If you push a Dockerfile or code containing `JWT_SECRET` to GitHub → Attackers can find it using automated bots within minutes.

---

### 2. Best Ways to Handle Environment Variables in Docker

Docker provides several ways (from basic to advanced):

| Method                    | Difficulty | Security Level | Recommended For       |
|---------------------------|------------|----------------|-----------------------|
| `-e` flag                 | Easy       | Low            | Quick testing         |
| `environment` in Compose  | Easy       | Medium         | Small projects        |
| `.env` + `env_file`       | Easy       | Medium-High    | Most projects         |
| Docker Secrets            | Medium     | High           | Production / Swarm    |
| External Secret Managers  | Advanced   | Very High      | Enterprise            |

---

### 3. Using `.env` File (Most Common & Recommended for Learning)

#### Step 1: Create a `.env` file

```env
MONGO_URI=mongodb://admin:secret123@mongodb:27017/mern?authSource=admin
JWT_SECRET=supersecretjwtkey
RAZORPAY_KEY=rzp_test_123456
API_KEY=sk_test_abcdef
NODE_ENV=production
PORT=5000
```

#### Step 2: Add `.env` to `.gitignore`

```gitignore
# .gitignore
.env
.env.local
.env.production
node_modules/
```

**This is extremely important.** Never commit `.env` files to Git.

---

### 4. Using Environment Variables in Docker Compose

#### Method 1: `env_file` (Cleanest way)

```yaml
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    depends_on:
      - mongodb
```

All variables from `.env` will be available inside the container.

#### Method 2: `environment` section

```yaml
services:
  backend:
    build: ./backend
    environment:
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - RAZORPAY_KEY=${RAZORPAY_KEY}
      - NODE_ENV=production
```

Here `${MONGO_URI}` is automatically loaded from the `.env` file in the same folder.

#### Method 3: Mix of both

```yaml
services:
  backend:
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - PORT=5000
```

---

### 5. Using Environment Variables with `docker run`

```bash
docker run -d \
  --name backend \
  -p 5000:5000 \
  -e MONGO_URI="mongodb://admin:secret@mongodb:27017/mern" \
  -e JWT_SECRET="supersecret" \
  -e NODE_ENV=production \
  my-backend
```

Or using an env file:

```bash
docker run -d \
  --name backend \
  --env-file .env \
  -p 5000:5000 \
  my-backend
```

---

### 6. Accessing Environment Variables Inside Application

#### Node.js Example:
```js
const mongoURI = process.env.MONGO_URI;
const jwtSecret = process.env.JWT_SECRET;
const razorpayKey = process.env.RAZORPAY_KEY;

console.log("MongoDB URI:", process.env.MONGO_URI);
```

#### Python Example:
```python
import os

mongo_uri = os.getenv("MONGO_URI")
jwt_secret = os.getenv("JWT_SECRET")
```

---

### 7. Docker Secrets (Higher Security)

Docker Secrets are used mainly with **Docker Swarm**.  
Secrets are encrypted and only mounted as files inside the container (not as environment variables).

#### Example (Swarm mode):

```bash
# Create secret
echo "mySuperSecretJWT" | docker secret create jwt_secret -

# Use in service
docker service create \
  --name backend \
  --secret jwt_secret \
  my-backend
```

Inside the container, the secret will be available at:
```
/run/secrets/jwt_secret
```

**Note:** For normal Docker Compose (without Swarm), secrets support is limited. Most developers use `.env` + good practices.

---

### 8. Complete Real Example (MERN Backend)

**Folder Structure:**
```
project/
├── .env
├── .gitignore
├── compose.yaml
└── backend/
    ├── Dockerfile
    └── server.js
```

**`.env` file:**
```env
MONGO_URI=mongodb://admin:secret123@mongodb:27017/mern?authSource=admin
JWT_SECRET=myjwtsecretkey123
RAZORPAY_KEY=rzp_test_xxxxx
NODE_ENV=production
PORT=5000
```

**`.gitignore`:**
```gitignore
.env
node_modules/
```

**`compose.yaml`:**
```yaml
services:
  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secret123
    volumes:
      - mongodb-data:/data/db
    networks:
      - mern-net

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - .env
    depends_on:
      - mongodb
    networks:
      - mern-net

networks:
  mern-net:

volumes:
  mongodb-data:
```

---

### 9. Best Practices Summary

| Practice                              | Recommendation |
|---------------------------------------|--------------|
| Hardcode secrets in code              | Never |
| Put secrets in Dockerfile             | Never |
| Commit `.env` to GitHub               | Never |
| Use `.env` + `env_file`               | Yes (Most common) |
| Add `.env` in `.gitignore`            | Mandatory |
| Use different `.env` for dev/prod     | Yes |
| Use Docker Secrets / Vault in production | Highly Recommended |
| Rotate secrets regularly              | Yes |

---

### 10. Common Interview Questions

1. Why shouldn’t we hardcode secrets in Dockerfile?
2. Difference between `environment` and `env_file`?
3. How do you pass environment variables in Docker Compose?
4. What is the use of `.env` file?
5. How do Docker Secrets work?
6. How do you prevent secrets from being pushed to GitHub?

---

### Quick Revision Points

- Always use **`.env`** file for local development.
- Always add **`.env`** in **`.gitignore`**.
- Prefer `env_file` in Docker Compose.
- Never store secrets in image layers.
- For production → Use secret managers (AWS Secrets Manager, HashiCorp Vault, Docker Secrets, etc.).

---

Would you like me to continue with the next topic?

**Suggested Next:**
1. Docker Best Practices & Image Optimization
2. Docker Security Basics
3. Full MERN Project Setup with Docker + Compose + Env

Just tell me!