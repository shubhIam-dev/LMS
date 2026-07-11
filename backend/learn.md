# Backend — learn.md

Welcome! This file explains **what the backend is, why every folder exists, and the big ideas you must understand** before writing your own APIs. Read it top-to-bottom; every section maps to real files in this project.

---

## 1. What is "the backend"?

The **frontend** is what the user sees in the browser (buttons, forms, pages).
The **backend** is the program running on a server that the frontend talks to. It:

1. Listens for HTTP requests (`GET /course/getAllCourses`, `POST /user/addUser`, …)
2. Talks to a database (MongoDB) to read/write data
3. Sends a response back (usually JSON)

Think of a restaurant:
- **Frontend** = the menu + waiter taking your order
- **Backend** = the kitchen that actually cooks the food
- **Database** = the pantry / fridge where ingredients live

---

## 2. The stack we're using

| Tool | What it is | Why we use it |
|------|-----------|---------------|
| **Node.js** | A runtime that lets JavaScript run outside the browser | Same language on frontend & backend |
| **Express** | A tiny web framework on top of Node | Handles routing, middleware, req/res |
| **MongoDB** | A NoSQL database — stores JSON-like "documents" | Flexible, no rigid schema like SQL |
| **Mongoose** | An ODM (Object–Document Mapper) for MongoDB | Gives us `Model.find()`, `.save()`, schemas, etc. |
| **dotenv** | Loads secrets from a `.env` file into `process.env` | Never hardcode passwords / DB URLs |
| **cors** | Middleware that lets the frontend (different port) call the backend | Browsers block cross-origin requests by default |

---

## 3. Folder structure (the "MVC-ish" pattern)

```
backend/
├── server.js         ← the entry point: creates the app, connects DB, mounts routes
├── .env              ← secrets (MONGODB_URI, PORT) — never commit this
├── .env.example      ← template so teammates know what to put in .env
├── package.json      ← lists dependencies + scripts
├── models/           ← "shape" of each collection in the DB (schemas)
├── controllers/      ← the actual functions that do work
└── routes/           ← the URL → controller mapping
```

The pattern is: **Route** decides *which* URL calls *which* controller → **Controller** decides *what* to do → **Model** decides *how* data is stored.

```
Browser ──HTTP──> server.js ──> routes/ ──> controllers/ ──> models/ ──> MongoDB
                                                                      <──
                                                              <────────
                                              <──JSON──
                              <──response──
```

---

## 4. Walkthrough of every file

### 4.1 `server.js` — the entry point

Open `server.js`. Nine things happen, in order:

1. `require('express')` → import the framework.
2. `let app = express()` → create the app instance.
3. `require('dotenv').config()` → load `.env` into `process.env`.
4. `require('./routes/...')` → import each route module.
5. `process.on('uncaughtException', …)` → catch crashes so the server doesn't die silently.
6. `mongoose.connect(process.env.MONGODB_URI, …)` → open the DB connection.
7. `app.use(cors())` and `app.use(express.json())` → **middleware** (see §5).
8. `app.use('/course', courseRoutes)` etc. → **mount** each router under a URL prefix.
9. `app.listen(9000, …)` → start listening on port 9000.

> **Key idea:** `app.use('/course', courseRoutes)` means "any URL that starts with `/course` should be handled by `courseRoutes`." So `GET /course/getAllCourses` goes into `routes/courseRoutes.js`.

### 4.2 `models/` — the shape of your data

Each model = one MongoDB collection.

Look at `models/User.model.js`:

```js
let userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true }
})
module.exports = mongoose.model("User", userSchema);
```

- `mongoose.Schema({...})` — describes what a document looks like.
- `required: true` — Mongoose will refuse to save if the field is missing.
- `mongoose.model("User", userSchema)` — creates a **Model** you can call methods on: `User.find()`, `new User({...}).save()`, `User.deleteOne({...})`, etc. Behind the scenes MongoDB creates a `users` collection (Mongoose lowercases + pluralizes).

Other models in this repo:
- `Courses.model.js` — `CourseName`, `CourseCode`
- `assignments.model.js` — `questions`, `dueOn`, `assignmentName`, …
- `Marks.model.js` — includes **references**: `studentId: { type: ObjectId, ref: "User" }`. This is how you link documents across collections (like a foreign key in SQL).

### 4.3 `routes/` — the URL map

Each route file does the same three things: import Express, import controllers, wire URL → function.

Look at `routes/userRoutes.js`:

```js
let express = require("express")
let { addUser, getUser, addUsers } = require("../controllers/users.controllers");

const router = express.Router();

router.post('/addUser', addUser)
router.get('/getUser', getUser)
router.post('/addUsers', addUsers)

module.exports = router;
```

Since this router is mounted at `/user` in `server.js`, the **final URLs** become:

| Method | Full URL | Runs |
|--------|----------|------|
| POST | `/user/addUser` | `addUser` controller |
| GET  | `/user/getUser` | `getUser` controller |
| POST | `/user/addUsers` | `addUsers` (bulk insert) |

> **HTTP verbs matter.** By convention:
> - `GET` → read data (no side effects)
> - `POST` → create new data
> - `PUT` / `PATCH` → update
> - `DELETE` → remove
>
> Note: `courseRoutes.js` uses `router.get("/deleteCourse", …)` — that's **wrong** by convention. Deleting should be `DELETE`, not `GET`. Good learning example to fix later.

### 4.4 `controllers/` — the real logic

A controller is just a function that takes `(req, res)` and does something. Look at `controllers/users.controllers.js`:

```js
function addUser(req, res) {
    const { name, email, password, phoneNumber } = req.body

    if (!name || !email || !password || !phoneNumber) {
        return res.send({ message: 'All fields are required' })
    }

    let newUser = new User({ name, email, password, phoneNumber })
    newUser.save()
    res.json({ message: 'User registered successfully', /* … */ });
}
```

Four things every controller does:
1. **Read input** from `req` (`req.body`, `req.query`, `req.params`).
2. **Validate** — check nothing is missing.
3. **Talk to the DB** through a Mongoose model.
4. **Send a response** with `res.send(...)` or `res.json(...)`.

---

## 5. Concepts you MUST know

### 5.1 `req` — the request object

Where does the data come from? Three main places:

| Source | How it's sent | Read it as | Example |
|--------|---------------|-----------|---------|
| **Body** | JSON in the request body (usually `POST`/`PUT`) | `req.body.name` | `POST /user/addUser` with `{ "name": "Ali" }` |
| **Query** | `?key=value` at the end of the URL | `req.query.phoneNumber` | `GET /user/getUser?phoneNumber=9999999999` |
| **Params** | placeholders in the URL like `/user/:id` | `req.params.id` | `GET /user/123` (not used in this repo yet) |

`req.body` only works because we added `app.use(express.json())` in server.js — that middleware parses the JSON body into a JS object.

### 5.2 `res` — the response object

- `res.send("hi")` — send any string / object
- `res.json({ msg: "ok" })` — send JSON (auto sets Content-Type)
- `res.status(400).json({ msg: "bad" })` — set an HTTP status code first
- Always send exactly **one** response per request (never call `res.json` twice).

### 5.3 Middleware

Middleware are functions that run *between* request-arrival and controller-execution. Two used here:

```js
app.use(cors());           // adds CORS headers so browser lets the frontend talk to us
app.use(express.json());   // parses JSON body → req.body
```

You can also write your own (e.g. authentication middleware) — that's a great next step.

### 5.4 Async, promises, and `.then`

Mongoose returns **promises**. Two ways to handle them:

```js
// (a) .then chain — what most controllers in this repo use
User.findOne({ phoneNumber }).then((user) => { res.json(user) })

// (b) async/await — cleaner
async function getUser(req, res) {
    const user = await User.findOne({ phoneNumber: req.query.phoneNumber })
    res.json(user)
}
```

Once you're comfortable, prefer `async/await` — it reads top-to-bottom.

### 5.5 Environment variables

Never hardcode secrets. In `server.js`:

```js
require('dotenv').config()
mongoose.connect(process.env.MONGODB_URI, …)
```

Anything in `.env` becomes available on `process.env.NAME`. See `.env.example` for what this project needs. **`.env` must be in `.gitignore`** — check yours.

---

## 6. Full request lifecycle (worked example)

You click "Load Courses" in the browser. Trace it:

1. **Browser** → `fetch("http://localhost:9000/course/getAllCourses")`
2. `cors()` middleware adds headers → request is allowed
3. `app.use('/course', courseRoutes)` → matched, forwarded to `courseRoutes.js`
4. `router.get("/getAllCourses", getAllCourses)` → matched, forwarded to controller
5. Controller: `Course.find().then((data) => res.json(data))` → Mongoose runs a MongoDB `find` query
6. MongoDB returns an array of documents
7. `res.json(data)` sends them back as JSON
8. Frontend receives the JSON, renders course cards

Every route in this codebase follows this same pattern. Learn one, you've learned them all.

---

## 7. Running it locally

```bash
cd backend
npm install                       # installs dependencies
cp .env.example .env              # then edit .env with your real MongoDB URI
npm start                         # runs `node server.js`
# open http://localhost:9000 → should say "College ERP Backend is working!"
```

Testing endpoints without a UI:
- Browser (for GETs): visit `http://localhost:9000/course/getAllCourses`
- Postman / Thunder Client (for POSTs): send `Content-Type: application/json` + a JSON body

---

## 8. Common mistakes and fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `req.body` is `undefined` | Missing `app.use(express.json())` | Add it before routes |
| CORS error in browser console | Missing `app.use(cors())` | Add it |
| `Cannot connect to MongoDB` | Wrong URI, no internet, IP not whitelisted in Atlas | Check `.env`, Atlas Network Access |
| `res.send` sends HTML instead of JSON | Passing a string to `res.send` | Use `res.json({...})` |
| Route not found (404) | Router mounted at wrong prefix | Check `app.use('/prefix', router)` |
| Field not saved | Not in the schema | Add it to `models/*.model.js` |

---

## 9. Homework — exercises to actually learn

**Easy**
1. Add a `role` field (`"student" | "teacher"`) to `User.model.js` and let `addUser` accept it.
2. Fix `router.get("/deleteCourse", …)` → make it `router.delete("/deleteCourse", …)`.
3. Add proper HTTP status codes to every controller (`201` for created, `404` for not found, `400` for bad input).

**Medium**
4. Password is stored in plain text. Install `bcrypt`, hash on save, compare on login.
5. Replace all `.then()` with `async/await`.
6. Add pagination to `getAllCourses` (`?page=1&limit=10`).

**Hard**
7. Add JWT authentication: `/user/login` returns a token, and a middleware protects other routes.
8. Move validation into a middleware layer so controllers stay clean.
9. Populate `studentId` and `courseId` in `getAllMarks` so the response includes the student's name and course name.

---

## 10. Mental model to walk away with

> **A route says "who to call". A controller says "what to do". A model says "how it's stored". Middleware runs before controllers. `req` is input, `res` is output. Everything else is detail.**

If you can draw the arrow diagram in §3 from memory and explain each folder in one sentence, you understand this backend.
