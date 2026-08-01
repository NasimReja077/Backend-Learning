# MongoDB — Complete Explanation Guide

A structured, exam-ready reference built from your MongoDB notes — covering core CRUD, operators, the aggregation framework, data modeling, and server administration topics.

---

## 1. What is MongoDB?

MongoDB is an **open-source, non-relational (NoSQL) database management system**. Instead of tables and rows, it stores data as flexible **documents** (BSON — Binary JSON), grouped into **collections**.

| Concept | MongoDB | SQL Equivalent |
|---|---|---|
| Database | `use myDB` | `USE myDB;` |
| Collection | `db.users` | `users` table |
| Document | `{ name: "Nasim" }` | a row |

**Why NoSQL / MongoDB:**
- Handles unstructured/semi-structured data at scale
- No fixed schema — documents in the same collection can have different fields
- Horizontally scalable (sharding) instead of only vertically scalable
- No universal query language across NoSQL databases (each has its own), unlike SQL

Other NoSQL examples mentioned: Apache CouchDB, Elasticsearch, Couchbase.

---

## 2. Database & Collection Basics

### Database Commands
```js
show dbs                  // list all databases
use myDatabase             // switch to (or create) a database
db.dropDatabase()          // delete current database + all collections
```
**Important:** A database (and a collection) is not physically created until you insert at least one document into it.

### Collection Commands
```js
db.createCollection("mycollection")   // explicit creation
show collections                       // list collections in current db
db.COLLECTION_NAME.drop()              // delete a collection
```
Collections are also created implicitly the first time you `insertOne()`/`insertMany()` into a name that doesn't exist yet.

**Note:** Collection names are **case-sensitive** — `Teacher` ≠ `teacher`.

---

## 3. Documents & BSON Data Types

A **document** is the basic unit of data — a JSON-like key/value object stored in BSON. Every document has a unique `_id` field (auto-generated as an `ObjectId` if not supplied).

### Common BSON Types

| Type | Example | Type Number |
|---|---|---|
| String | `"model": "Nexon"` | 2 |
| Double | `"mileage": 18.5` | 1 |
| Int32 | `"airbags": 2` | 16 |
| Int64 (NumberLong) | `NumberLong("922...")` | 18 |
| Boolean | `"sunroof": true` | 8 |
| Date | `new Date("2023-07-12")` | 9 |
| ObjectId | `"_id": ObjectId(...)` | 7 |
| Array | `"features": ["ABS","Bluetooth"]` | 4 |
| Object (embedded doc) | `"engine": {"cc":1199}` | 3 |
| Null | `"color": null` | 10 |
| Timestamp | `Timestamp(12345678,1)` | 17 |
| Binary | `BinData(0,'...')` | 5 |
| Regular Expression | `/^Nex/` | 11 |
| MinKey/MaxKey | comparison bounds | — |

Check a field's type in a query:
```js
db.users.find({ age: { $type: "int" } })      // by name
db.cars.find({ model: { $type: 2 } })          // by number
```

### ObjectId — Structure & Methods
A 12-byte identifier: **4 bytes timestamp + 5 bytes machine/process identifier + 3 bytes incrementing counter**.

```js
ObjectId()                          // generate new
ObjectId("64e45a8d1fcdb14723df5672").getTimestamp()  // creation time
```
Sorting by `_id` is effectively sorting by creation time. A custom `_id` (string, number, UUID) is allowed.

### Is MongoDB really "schemaless"?
It is **schema-flexible**, not schemaless — documents in one collection can differ in shape, but you can optionally enforce structure with **schema validation** (`$jsonSchema`, see §9).

---

## 4. CRUD Operations

### Create
```js
db.student.insertOne({ name: "Raju", age: 25 })

db.Teacher.insertMany([
  { "Name": "Nasim" },
  { "Name": "Joy" }
])
```
- `insertMany([])` on an **empty array** throws `MongoInvalidArgumentError`.
- The **`ordered` option** controls error handling in `insertMany`:

| `ordered` | Behavior |
|---|---|
| `true` (default) | Inserts stop at the first error; later documents are skipped |
| `false` | Continues past errors; all valid documents are inserted, errors reported separately |

### Read — `find()` / `findOne()`
```js
db.collection.find(query, projection)
```
- `query` — filter criteria (omit or `{}` for all documents)
- `projection` — `{ field: 1 }` to include, `{ field: 0 }` to exclude

```js
db.cars.find({ maker: "Honda" })                     // filter
db.cars.find({ "engine.type": "Turbocharged" })       // nested field (dot notation)
db.cars.findOne({ model: "Nexon" })                    // single document
db.cars.find({}, { model: 1, _id: 0 })                 // projection only
db.Teacher.find().pretty()                             // pretty-print
```
⚠️ `{}` as a filter matches **everything** — use with caution on `deleteMany`.

### Update — `updateOne()` / `updateMany()`
```js
db.collection.updateOne(<filter>, <update>, <options>)
```
```js
db.cars.updateOne({ model: "City" }, { $set: { transmission: "Manual" } })
db.cars.updateMany({ fuel_type: "Diesel" }, { $set: { eco_friendly: false } })
```

### Delete — `deleteOne()` / `deleteMany()`
```js
db.cars.deleteOne({ model: "Baleno" })
db.cars.deleteMany({ "engine.cc": { $lt: 1200 } })
db.cars.deleteMany({})   // deletes ALL documents — be careful
```

### Upsert
If no document matches the filter, `updateOne` with `{ upsert: true }` **inserts** a new document instead:
```js
db.users.updateOne(
  { name: "Rohit" },
  { $set: { age: 25, city: "Mumbai" } },
  { upsert: true }
)
```

---

## 5. Query, Update & Array Operators

### Comparison Operators
| Operator | Meaning | Example |
|---|---|---|
| `$eq` | equal | `{ age: { $eq: 23 } }` |
| `$ne` | not equal | `{ name: { $ne: "Nasim" } }` |
| `$gt` / `$gte` | greater (or equal) | `{ age: { $gt: 20 } }` |
| `$lt` / `$lte` | less (or equal) | `{ age: { $lt: 30 } }` |
| `$in` | any value in array | `{ city: { $in: ["Delhi","Mumbai"] } }` |
| `$nin` | none in array | `{ maker: { $nin: ["Tata"] } }` |

### Logical Operators
| Operator | Meaning |
|---|---|
| `$and` | all conditions true (implicit when multiple top-level fields given) |
| `$or` | any condition true |
| `$not` | negate a condition |
| `$nor` | none of the conditions true |

### Element Operators
| Operator | Meaning |
|---|---|
| `$exists` | field is present / absent |
| `$type` | field matches a BSON type |

### Evaluation Operators
| Operator | Meaning |
|---|---|
| `$expr` | use aggregation expressions inside a query, e.g. compare two fields |
| `$mod` | value % divisor == remainder |
| `$regex` | pattern matching (like SQL `LIKE`); combine with `$options:"i"` for case-insensitive |
| `$text` | full-text search (needs a text index) |
| `$where` | custom JavaScript condition (slow, avoid in production) |

### Array Operators (query side)
| Operator | Meaning | Example |
|---|---|---|
| `field: value` | matches if any array element equals value | `{ colors: "red" }` |
| `$all` | array must contain all given values (any order) | `{ colors: { $all: ["red","white"] } }` |
| `$elemMatch` | one array element satisfies *all* given conditions | see below |
| `field.index` | match value at a specific array index | `{ "colors.1": "blue" }` |
| `$size` | array has exact length | `{ colors: { $size: 3 } }` |

```js
db.cars.find({
  services: { $elemMatch: { type: "repair", cost: { $gt: 400 } } }
})
```
`$elemMatch` is required when multiple conditions must match the **same** array element (otherwise MongoDB may match conditions across different elements).

### Update Operators
| Operator | Meaning |
|---|---|
| `$set` | set/add a field |
| `$unset` | remove a field |
| `$inc` | increment a numeric field |
| `$mul` | multiply a field |
| `$min` / `$max` | update only if new value is lower/higher |
| `$rename` | rename a field |
| `$currentDate` | set field to current date/time |

### Array Update Operators
| Operator | Meaning |
|---|---|
| `$push` | add to end of array (allows duplicates) |
| `$addToSet` | add only if not already present |
| `$pull` | remove matching value(s), or matching sub-documents |
| `$pullAll` | remove several specific values |
| `$pop` | remove first (`-1`) or last (`1`) element |

`$push` modifiers for fine control:
```js
db.users.updateOne(
  { name: "Nasim" },
  { $push: { hobbies: {
      $each: ["cycling", "painting"],
      $sort: 1,        // sort ascending
      $slice: -3,       // keep only last 3
      $position: 0      // insert at start
  }}}
)
```

### Updating Nested Arrays (positional `$`)
```js
db.students.updateOne(
  { name: "Nasim", "subjects.name": "Math" },
  { $set: { "subjects.$.score": 90 } }
)
```
`$.field` updates the **first matched** array element.

---

## 6. Cursor Methods

`find()` returns a **cursor** (a pointer to the result set), not the documents immediately.

| Method | Purpose |
|---|---|
| `.forEach()` | iterate and process each document |
| `.toArray()` | convert cursor to an array |
| `.limit(n)` | return only first *n* results |
| `.skip(n)` | skip first *n* results (pagination) |
| `.sort({field: 1/-1})` | ascending (1) / descending (-1) |
| `.pretty()` | nicely formatted shell output |

```js
db.cars.find().sort({ airbags: -1 }).skip(2).limit(3)
db.users.find().sort({ age: 1, name: -1 })          // sort by 2 fields, tie-break on 2nd
db.users.find().sort({ "address.city": 1 })          // sort by nested field
```
Sorting large result sets without a supporting index is slow — check with:
```js
db.users.find().sort({ age: 1 }).explain("executionStats")
```

---

## 7. The Aggregation Framework

Aggregation transforms, filters, and summarizes data through a **pipeline** of stages — similar to SQL's `SELECT ... WHERE ... GROUP BY ... HAVING`.

```js
db.collection.aggregate([ { stage1 }, { stage2 }, ... ], { options })
```

### Core Stages

| Stage | Purpose |
|---|---|
| `$match` | filter documents (like `find()`) |
| `$group` | group by an expression and compute accumulators |
| `$project` | include/exclude/rename/compute fields (like SQL `SELECT`) |
| `$sort` | order results |
| `$limit` / `$skip` | restrict / offset result count |
| `$count` | count documents passing through the pipeline |
| `$unwind` | explode an array field into one document per element |
| `$lookup` | left outer join with another collection |
| `$addFields` | add/modify fields while keeping the rest |
| `$bucket` | group documents into numeric ranges (histogram-style) |

### `$group` accumulators
`$sum`, `$avg`, `$min`, `$max`, `$push` (collect into array), etc.
```js
db.cars.aggregate([
  { $group: { _id: "$fuel_type", count: { $sum: 1 }, avgPrice: { $avg: "$price" } } }
])
```

### `$project` — reshape output
```js
db.cars.aggregate([
  { $project: { _id: 0, model: 1, price_with_tax: { $multiply: ["$price", 1.18] } } }
])
```

### `$unwind` — flatten arrays
```js
db.cars.aggregate([
  { $unwind: "$features" },
  { $group: { _id: "$model", featureCount: { $sum: 1 } } }
])
```

### `$lookup` — joins
```js
db.orders.aggregate([
  { $lookup: {
      from: "customers",
      localField: "customer_id",
      foreignField: "_id",
      as: "customer_info"
  }},
  { $unwind: "$customer_info" }   // flatten single-match array into an object
])
```
Advanced form with a sub-pipeline (MongoDB 3.6+):
```js
{
  $lookup: {
    from: "customers",
    let: { cust_id: "$customer_id" },
    pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$cust_id"] } } },
      { $project: { name: 1, city: 1 } }
    ],
    as: "customer_info"
  }
}
```
`$lookup` only joins collections **within the same database**; the result is always an array unless unwound.

### `$bucket` — histogram grouping
```js
db.students.aggregate([
  { $bucket: {
      groupBy: "$marks",
      boundaries: [0, 50, 70, 100],
      default: "Invalid Marks",
      output: { count: { $sum: 1 }, students: { $push: "$name" } }
  }}
])
```
`$bucketAuto` is the counterpart that calculates boundaries automatically instead of you specifying them.

### Conditional Operators (used inside `$project` / `$addFields`)
| Operator | Purpose |
|---|---|
| `$cond` | if / then / else |
| `$ifNull` | fallback value if field is null/missing |
| `$switch` | multiple if-else branches |

```js
{ $cond: { if: { $gte: ["$price", 1500000] }, then: "Premium", else: "Budget" } }
{ $ifNull: ["$airbags", 2] }
{ $switch: { branches: [ { case: {...}, then: "..." } ], default: "Unknown" } }
```

### Date Operators
| Operator | Purpose |
|---|---|
| `$dateAdd` | add a time unit to a date |
| `$dateDiff` | difference between two dates |
| `$year`, `$month`, `$hour` | extract date parts |
| `$dayOfMonth`, `$dayOfYear` | extract day-of-month / day-of-year |

```js
{ $dateDiff: { startDate: "$dob", endDate: "$$NOW", unit: "year" } }
```

### System & User-Defined Variables
| Variable | Meaning |
|---|---|
| `$$ROOT` | the entire input document |
| `$$CURRENT` | current-stage document |
| `$$NOW` | current timestamp at run time |
| `$$REMOVE` | conditionally drop a field |
| `$let` | declare a local (user-defined) variable inside an expression |

```js
{ $let: { vars: { discount: { $multiply: ["$price", 0.1] } },
          in: { $subtract: ["$price", "$$discount"] } } }
```

---

## 8. Data Modeling & Relationships

MongoDB models relationships two ways: **embedding** (denormalization) or **referencing** (normalization).

| Relationship | Example | Typical Approach |
|---|---|---|
| One-to-One | User ↔ Profile | Embed if always read together; reference if large/independent |
| One-to-Many | Blog ↔ Comments | Embed if small/read together; reference if large or independently queried |
| Many-to-Many | Students ↔ Courses | Reference (array of IDs) + `$lookup`, optionally a junction collection |

```js
// Embedded 1:1
{ _id: 1, name: "Nasim", profile: { bio: "Web Developer", location: "Kolkata" } }

// Referenced 1:N
// customers: { _id: 1, name: "Reja" }
// orders: [{ customer_id: 1, product: "Tyre" }, { customer_id: 1, product: "Oil" }]
```
Use `$lookup` to join referenced collections when you need combined results.

---

## 9. Schema Validation

Enforces structure using **JSON Schema** rules, even though MongoDB doesn't require a fixed schema.

```js
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "age"],
      properties: {
        name:  { bsonType: "string" },
        email: { bsonType: "string", pattern: "^.+@.+$" },
        age:   { bsonType: "int", minimum: 18 }
      }
    }
  },
  validationLevel: "strict",   // off | moderate | strict
  validationAction: "error"    // warn | error
})
```
Update validation on an existing collection with `collMod`:
```js
db.runCommand({ collMod: "cars", validator: { $jsonSchema: { ... } } })
```
| Setting | Options |
|---|---|
| `validationLevel` | `strict` (all writes), `moderate` (new/changed fields only), `off` |
| `validationAction` | `error` (reject), `warn` (log only, still allow) |

---

## 10. Indexes

An index is a data structure that lets MongoDB find documents **without scanning every document** (avoiding a full collection scan).

```js
db.collection.createIndex({ field1: type1, field2: type2 }, { options })
```

| Type | Description |
|---|---|
| Single Field | `{ email: 1 }` |
| Compound | `{ customerId: 1, orderDate: -1 }` |
| Unique | ensures no duplicate values, e.g. `{ rollNo: 1 }, { unique: true }` |
| Multikey | automatically created for array fields |
| Text | for full-text search, `{ title: "text" }` |
| Hashed | for sharded collections |
| Wildcard | `{ "$**": 1 }` — dynamic/all fields |
| Geospatial | `2d` / `2dsphere` — location queries |
| TTL | auto-deletes documents after a set period |

```js
db.users.getIndexes()          // list
db.users.dropIndex("email_1")  // drop one
db.users.dropIndexes()         // drop all
```
Verify index usage: `db.users.find({email:"x"}).explain("executionStats")`.

---

## 11. Transactions

MongoDB supports **ACID transactions** across multiple documents/collections (requires a replica set or sharded cluster, MongoDB 4.0+/4.2+).

- **Atomicity** — all operations succeed or none do
- **Consistency** — data remains valid
- **Isolation** — transactions don't interfere with each other
- **Durability** — committed changes persist

```js
const session = db.getMongo().startSession();
session.startTransaction();
try {
  session.getDatabase("shop").users.updateOne({ _id: 1 }, { $inc: { balance: -100 } });
  session.getDatabase("shop").orders.insertOne({ userId: 1, item: "Laptop", amount: 100 });
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();
} finally {
  session.endSession();
}
```
Use transactions for multi-document updates needing strict consistency (banking, orders); single-document updates are already atomic and usually don't need one. Keep transactions short-lived — default timeout is 60 seconds, with a ~16 MB in-memory limit on uncommitted changes.

---

## 12. Write Concern

Controls how much acknowledgment MongoDB requires before a write is considered successful.

| Value | Meaning | Trade-off |
|---|---|---|
| `w: 0` | no acknowledgment (fire-and-forget) | fastest, least reliable |
| `w: 1` (default) | acknowledged by primary only | good balance |
| `w: "majority"` | acknowledged by majority of replica set | safest, slower |
| `w: n` | acknowledged by *n* members | custom |

Optional: `j: true` (wait for journal write = durability), `wtimeout: ms`.
```js
db.orders.insertOne({ item: "Phone" }, { writeConcern: { w: "majority", j: true, wtimeout: 5000 } })
```

---

## 13. Replication & Sharding

### Replication (high availability)
A **replica set** is a group of servers holding the same data: one **primary** (handles writes), one or more **secondaries** (replicate data), and optionally an **arbiter** (votes in elections but stores no data). If the primary fails, a secondary is automatically elected — **automatic failover**.
```js
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" },
    { _id: 1, host: "localhost:27018" },
    { _id: 2, host: "localhost:27019" }
  ]
})
```

### Sharding (horizontal scaling)
Distributes data across multiple servers (**shards**) using a **shard key**. A **config server** stores cluster metadata; **mongos** routes queries to the right shard.
```js
sh.enableSharding("car_dealership")
sh.shardCollection("car_dealership.cars", { model: 1 })
```
A good shard key has high cardinality and even distribution, chosen with query patterns in mind.

| Feature | Replication | Sharding |
|---|---|---|
| Purpose | High availability | Horizontal scaling |
| Data | Full copies | Partitioned |
| Components | Primary/Secondary/Arbiter | Shards/Config Server/mongos |
| Use case | Fault tolerance, backup | Large datasets, high load |

---

## 14. Authentication & RBAC

MongoDB does **not enable authentication by default**. Enable it in `mongod.conf`:
```yaml
security:
  authorization: "enabled"
```

### Built-in Roles
| Role | Scope | Description |
|---|---|---|
| `read` | any db | read-only |
| `readWrite` | any db | read + write |
| `dbAdmin` | any db | schema-level admin |
| `userAdmin` | any db | manage users/roles |
| `clusterAdmin` | admin | cluster-wide admin |
| `root` | admin | superuser |

```js
use admin
db.createUser({ user: "admin", pwd: "strongpassword", roles: [{ role: "root", db: "admin" }] })

use yourDatabase
db.createUser({ user: "nasim", pwd: "pw", roles: [{ role: "readWrite", db: "yourDatabase" }] })
```
Custom roles allow fine-grained privileges (e.g. `find`-only access to a specific collection).
```js
db.getUsers()             // view users
db.getRoles({ showPrivileges: true })
db.dropUser("nasim")
```

---

## 15. Capped Collections

A **fixed-size**, circular collection that preserves insertion order and automatically overwrites the **oldest** documents once full. Good for logs, sensor data, or size-limited chat history.

```js
db.createCollection("logs", { capped: true, size: 10240, max: 1000 })
```
- Cannot delete/update in ways that change document size
- Cannot be resized after creation; converting a normal collection to capped requires copying data out and back in

---

## 16. `mongoimport` (CLI Import Tool)

```bash
mongoimport --db car_dealership --collection inventory --file cars.json --jsonArray
```
| Flag | Meaning |
|---|---|
| `--db` | target database |
| `--collection` | target collection |
| `--file` | path to source file |
| `--jsonArray` | file contains a JSON **array** of documents (omit for one-object-per-line files) |
| `--drop` | drop the collection before importing |
| `--uri` | connect to a remote URI (e.g. Atlas) |
| `--mode` | `insert` (default) / `upsert` / `merge` |

---

## Quick-Reference: Command Cheat Sheet

| Task | Command |
|---|---|
| List databases | `show dbs` |
| Switch/create database | `use <db>` |
| List collections | `show collections` |
| Insert one | `db.coll.insertOne({...})` |
| Insert many | `db.coll.insertMany([...])` |
| Find all | `db.coll.find()` |
| Find with filter | `db.coll.find({field: value})` |
| Update one | `db.coll.updateOne(filter, {$set:{...}})` |
| Delete one | `db.coll.deleteOne(filter)` |
| Aggregate | `db.coll.aggregate([{stage},...])` |
| Create index | `db.coll.createIndex({field:1})` |

---

## Topic Coverage Summary

**Topics your notes fully cover (≈26 total):**
1. NoSQL & MongoDB fundamentals
2. Databases (create/switch/drop)
3. Collections (create/list/drop)
4. Documents & BSON data types
5. ObjectId structure & methods
6. CRUD — insert (One/Many, `ordered` option)
7. CRUD — read (`find`, `findOne`, projection)
8. CRUD — update (One/Many), upsert
9. CRUD — delete (One/Many)
10. Query operators (comparison, logical, element, evaluation)
11. Array query operators (`$all`, `$elemMatch`, `$size`, index match)
12. Update operators (`$set/$unset/$inc/$mul/$min/$max/$rename`)
13. Array update operators (`$push/$addToSet/$pull/$pullAll/$pop`, `$each/$sort/$slice/$position`)
14. Nested/array updates with positional `$`
15. Cursor methods (`sort/limit/skip/forEach/toArray/pretty`)
16. Aggregation framework & pipeline stages
17. `$group`, `$match`, `$project`, `$sort`, `$limit`, `$count`, `$unwind`
18. `$lookup` joins (basic + sub-pipeline form)
19. `$bucket` / `$bucketAuto`
20. Conditional operators (`$cond/$ifNull/$switch`)
21. Date operators
22. Aggregation variables (`$$ROOT/$$CURRENT/$$NOW/$$REMOVE/$let`)
23. Data modeling & relationships (embedding vs referencing)
24. Schema validation (`$jsonSchema`)
25. Indexes (types, create/list/drop)
26. Transactions, Write Concern, Replication, Sharding, Authentication/RBAC, Capped Collections, `mongoimport`

**That's a genuinely comprehensive sweep — you've covered nearly the full core MongoDB curriculum.**

**Topics not yet in your notes (worth adding for full exam/interview coverage):**
1. **Backup & Restore** — `mongodump` / `mongorestore`
2. **GridFS** — storing files larger than the 16MB document limit
3. **Change Streams** — real-time data change notifications
4. **Read Concern & Read Preference** — you have Write Concern, but not its read-side counterpart
5. **Views** — read-only virtual collections built on aggregation pipelines
6. **More aggregation stages** — `$facet`, `$sample`, `$merge`, `$out`, `$graphLookup` (recursive joins)
7. **Geospatial queries** — practical `2dsphere` query examples (`$near`, `$geoWithin`)
8. **Time Series Collections** — purpose-built for time-stamped data
9. **MongoDB Atlas / Compass** — cloud hosting and GUI tooling
10. **CAP theorem & consistency models** in the context of MongoDB's design choices

Roughly **26 topics learned vs. 10 notable gaps** — you're at a strong, exam-ready depth on core MongoDB; the remaining items are mostly advanced/operational topics that show up more in production-engineering or interview contexts than in a typical MCA syllabus.
