# Layered Architecture - Toolbox API

> **Project Type:** Professional Layered Architecture (Repository + Service Pattern)  
> **Stack:** Node.js + Express + MongoDB (Mongoose)  
> **Architecture Style:** Clean / Layered Architecture (not basic MVC)

---

## 1. Project Overview

This is a **Toolbox API** that manages developer tools (VS Code, Postman, Figma, etc.).

It does **not** follow the normal simple MVC pattern used in most tutorials.

Instead, it uses a **professional layered architecture**:

```
Route → Controller → Service → Repository → Model → Database
```

This style is commonly used in real-world medium-to-large applications because it is:
- Cleaner
- More testable
- More maintainable
- Easier to scale

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                    │
│              (React / Postman / Mobile App)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Request
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        ROUTES LAYER                         │
│              (toolbox.route.js + index.route.js)            │
│         Only maps URL → Controller method                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLER LAYER                        │
│                   (ToolController.js)                       │
│     • Receives request                                      │
│     • Extracts data from req                                │
│     • Calls Service                                         │
│     • Sends HTTP response                                   │
│     • NO business logic, NO database calls                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                          │
│                    (ToolService.js)                         │
│     • Contains ALL business logic                           │
│     • Validation rules                                      │
│     • Duplicate checking                                    │
│     • Bulk operations logic                                 │
│     • Error wrapping                                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                         │
│         (BaseRepository.js + ToolRepository.js)             │
│     • Only talks to the database                            │
│     • All MongoDB queries live here                         │
│     • BaseRepository = generic CRUD                         │
│     • ToolRepository = tool-specific queries                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       MODEL LAYER                           │
│                      (Tools.js)                             │
│     • Mongoose Schema                                       │
│     • Validation rules                                      │
│     • Indexes                                               │
│     • Simple static methods                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        MONGODB                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Folder Structure Explained

```
src/
├── config/
│   ├── database.js      → MongoDB connection logic
│   └── index.js         → App configuration (port, cors, etc.)
│
├── controllers/
│   └── ToolController.js → Handles HTTP request & response only
│
├── models/
│   └── Tools.js         → Mongoose Schema + validation
│
├── repositories/
│   ├── BaseRepository.js → Generic CRUD methods (reusable)
│   └── ToolRepository.js → Tool-specific database queries
│
├── routes/
│   ├── index.route.js   → Main router (mounts /tools)
│   └── toolbox.route.js → All tool-related routes
│
├── services/
│   └── ToolService.js   → Business logic layer
│
├── app.js               → Express app setup (middleware + routes)
└── server.js            → Starts the server + connects to DB
```

---

## 4. Layer-by-Layer Detailed Explanation

### 4.1 Config Layer

**`config/index.js`**
- Loads environment variables using `dotenv`
- Exports configuration object (port, CORS, API prefix, etc.)

**`config/database.js`**
- Handles MongoDB connection using Mongoose
- Contains connection options (pool size, timeouts)
- Has `connect()` and `disconnect()` methods

---

### 4.2 Model Layer (`models/Tools.js`)

**Responsibility:** Only define the shape of data.

```js
const toolSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['IDE', 'API_TOOL', 'VERSION_CONTROL', ...] 
  },
  url: { type: String, required: true },
  isPopular: { type: Boolean, default: false },
  tags: [String]
});
```

Also contains:
- Indexes for faster queries
- Pre-save middleware (updates `updatedAt`)
- Static methods (`findPopular`, `findByCategory`)

**Important:** Model should **not** contain complex business logic.

---

### 4.3 Repository Layer

#### BaseRepository.js
Generic reusable methods for any model:

| Method          | Purpose                          |
|-----------------|----------------------------------|
| `findAll`       | Get multiple documents           |
| `findById`      | Get one document by ID           |
| `findOne`       | Get one document by filter       |
| `create`        | Create new document              |
| `updateById`    | Update document                  |
| `deleteById`    | Delete document                  |
| `count`         | Count documents                  |

#### ToolRepository.js
Extends `BaseRepository` and adds tool-specific methods:

- `findByName(name)`
- `findByCategory(category)`
- `findPopular()`
- `search(searchQuery)` → searches in name, description, and tags

**Rule:** Repository is the **only** place that talks to MongoDB.

---

### 4.4 Service Layer (`services/ToolService.js`)

**Responsibility:** Contains **all business logic**.

Examples of business rules in this project:

- Tool name must be unique
- Handle bulk create (success + failed results)
- Handle bulk delete
- Wrap errors with meaningful messages
- Check if tool exists before update/delete

```js
async createTool(toolData) {
  const existingTool = await this.toolRepository.findByName(toolData.name);
  if (existingTool) {
    throw new Error('Tool with this name already exists');
  }
  return await this.toolRepository.create(toolData);
}
```

---

### 4.5 Controller Layer (`controllers/ToolController.js`)

**Responsibility:** Only handle HTTP.

Controller should:
1. Extract data from `req` (body, params, query)
2. Call the Service
3. Send proper HTTP response (status code + JSON)

Controller should **never**:
- Talk to database directly
- Contain business rules

Example:
```js
createTool = async (req, res) => {
  try {
    const tool = await this.toolService.createTool(req.body);
    res.status(201).json({ success: true, data: tool });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

### 4.6 Routes Layer

**`routes/toolbox.route.js`**

| Method | Endpoint                  | Controller Method     |
|--------|---------------------------|-----------------------|
| GET    | `/api/tools`              | `getAllTools`         |
| GET    | `/api/tools/popular`      | `getPopularTools`     |
| GET    | `/api/tools/category/:cat`| `getToolsByCategory`  |
| GET    | `/api/tools/:id`          | `getToolById`         |
| POST   | `/api/tools/create`       | `createTool`          |
| POST   | `/api/tools/create/bulk`  | `createBulkTools`     |
| PUT    | `/api/tools/:id`          | `updateTool`          |
| DELETE | `/api/tools/delete/:id`   | `deleteTool`          |
| DELETE | `/api/tools/delete/bulk`  | `deleteBulkTools`     |

---

## 5. Complete Request Flow Example

**Example:** Create a new tool

```
1. Client sends:
   POST /api/tools/create
   Body: { name: "Postman", category: "API_TOOL", ... }

2. Route matches → calls toolController.createTool

3. Controller extracts req.body → calls toolService.createTool()

4. Service checks:
   - Does a tool with this name already exist?
   - If yes → throw error
   - If no → call repository.create()

5. Repository creates document using Mongoose Model

6. Response goes back:
   Service → Controller → Client
```

---

## 6. Comparison with Normal MVC

| Feature               | Normal MVC                          | This Project (Layered)               |
|-----------------------|-------------------------------------|--------------------------------------|
| Layers                | Route → Controller → Model          | Route → Controller → Service → Repository → Model |
| Business Logic        | Inside Controller                   | Inside Service                       |
| Database Access       | Inside Controller                   | Inside Repository                    |
| Controller Size       | Fat                                 | Thin                                 |
| Testability           | Hard                                | Easy                                 |
| Best For              | Small projects                      | Medium / Large projects              |

---

## 7. What Happens If We Add More Professional Features?

### 7.1 Rate Limiting

If we add rate limiting (using `express-rate-limit`):

```
middleware/
└── rateLimiter.js
```

It would be applied in `app.js`:

```js
const rateLimiter = require('./middleware/rateLimiter');
app.use('/api', rateLimiter);
```

**Effect:** Protects API from abuse (e.g. max 100 requests per 15 minutes per IP).

---

### 7.2 Centralized Error Handling

Currently, every controller has its own `try/catch`.

Better approach:

```
middleware/
└── errorHandler.js
```

```js
// errorHandler.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};
```

Then in controllers we can just do:
```js
next(error);   // instead of writing res.status().json() everywhere
```

**Benefit:** Cleaner controllers + consistent error format.

---

### 7.3 Validation Layer

Currently validation is partly in Model and partly in Service.

Better approach (using `joi` or `express-validator`):

```
validators/
└── toolValidator.js
```

Example with Joi:
```js
const createToolSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().valid('IDE', 'API_TOOL', ...).required(),
  url: Joi.string().uri().required()
});
```

Then use as middleware before controller:
```js
router.post('/create', validate(createToolSchema), toolController.createTool);
```

**Benefit:** Invalid data is rejected before reaching Controller/Service.

---

### 7.4 Utils / Helpers Folder

```
utils/
├── AppError.js          → Custom error class
├── asyncHandler.js      → Removes try/catch boilerplate
├── apiFeatures.js       → Advanced filtering, sorting, pagination
└── constants.js         → Enums, messages, etc.
```

Example `asyncHandler`:
```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

Then controllers become even cleaner:
```js
createTool = asyncHandler(async (req, res) => {
  const tool = await this.toolService.createTool(req.body);
  res.status(201).json({ success: true, data: tool });
});
```

---

## 8. If This Project Used TypeScript

If the project was converted to TypeScript, types would be used in these places:

### 8.1 Model Types
```ts
interface ITool {
  name: string;
  description: string;
  category: 'IDE' | 'API_TOOL' | 'VERSION_CONTROL' | ...;
  url: string;
  isPopular: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 8.2 DTOs (Data Transfer Objects)
```ts
// dto/create-tool.dto.ts
interface CreateToolDto {
  name: string;
  description: string;
  category: string;
  url: string;
  isPopular?: boolean;
  tags?: string[];
}
```

### 8.3 Repository & Service
```ts
class ToolRepository extends BaseRepository<ITool> {
  async findByName(name: string): Promise<ITool | null> { ... }
}

class ToolService {
  async createTool(data: CreateToolDto): Promise<ITool> { ... }
}
```

### 8.4 Controller
```ts
createTool = async (req: Request, res: Response): Promise<void> => {
  const tool = await this.toolService.createTool(req.body);
  res.status(201).json({ success: true, data: tool });
};
```

### 8.5 Benefits of TypeScript in this architecture
- Catch errors at compile time
- Better autocomplete
- Clear contracts between layers
- Safer refactoring

---

## 9. Current Project Strengths

- Clear separation of concerns
- Reusable `BaseRepository`
- Business logic is isolated in Service
- Controllers are thin
- Good foundation for scaling

## 10. Current Project Weaknesses / Missing Parts

| Missing Feature          | Impact                                      |
|--------------------------|---------------------------------------------|
| Centralized Error Handler| Repeated try/catch in every controller      |
| Input Validation Middleware | Validation is scattered                   |
| Rate Limiting            | API is open to abuse                        |
| Logging                  | Hard to debug in production                 |
| Authentication           | Anyone can create/update/delete tools       |
| Unit Tests               | No tests currently                          |
| TypeScript               | No type safety                              |

---

## 11. Recommended Next Improvements

1. Add `middleware/errorHandler.js`
2. Add validation using Joi or Zod
3. Add rate limiting
4. Add authentication (JWT)
5. Convert to TypeScript
6. Add unit tests for Service and Repository
7. Fix small bug in `BaseRepository` (`query.exce()` → `query.exec()`)

---

## 12. Summary

This project is a **well-structured Layered Architecture** backend.

It is significantly better than a basic MVC tutorial project because:

- Responsibilities are clearly separated
- Code is more testable and maintainable
- Easy to add new features without making controllers fat
- Ready to grow into a real production application

**Architecture Style Name:**  
**Repository Pattern + Service Layer** (Layered / Clean Architecture lite)
