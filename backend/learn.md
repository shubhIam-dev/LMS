# Backend — learn.md

This is your guided tour of the backend. Read it top to bottom once, with the
code open beside you. By the end you should be able to trace any request from
the browser to the database and back, and know where to add your own feature.

Companion docs (read after this):
- **[../AUTH.md](../AUTH.md)** — roles, login, and the full permission table
- **[../DATABASE.md](../DATABASE.md)** — every collection + how they link
- **[../flowofbackend.md](../flowofbackend.md)** — a teacher's journey through the API

---

## 1. What the backend does

The backend is a program that runs on a server, listens for HTTP requests from
the frontend, talks to a MongoDB database, and sends back JSON.

Restaurant analogy:
- **Frontend** = the waiter taking your order
- **Backend** = the kitchen that cooks it
- **Database** = the pantry the kitchen pulls from

---

## 2. The stack

| Tool | What it is | Why it's here |
|------|-----------|---------------|
| **Node.js** | Runs JavaScript outside the browser | Same language front + back |
| **Express** | Tiny web framework on Node | Routing + middleware |
| **MongoDB** | NoSQL database of JSON-like documents | Flexible, easy to learn |
| **Mongoose** | Models/schemas for MongoDB | `Model.find()`, `.save()`, refs, hooks |
| **bcryptjs** | Password hashing | Never store plain-text passwords |
| **jsonwebtoken** | Signed login tokens (JWT) | Stateless authentication |
| **dotenv** | Loads secrets from `.env` | Keep DB URI / JWT secret out of code |
| **cors** | Lets the frontend (different port) call us | Browsers block cross-origin by default |

---

## 3. Folder structure

```
backend/
├── server.js         ← ENTRY POINT: connect DB, add middleware, mount routes, listen
├── seed.js           ← fills your DB with demo data (npm run seed)
├── .env              ← your secrets (MONGODB_URI, PORT, JWT_SECRET) — never committed
├── .env.example      ← template showing what .env needs
├── middleware/
│   └── auth.js       ← authenticate (check JWT) + authorize (check role)
├── models/           ← the SHAPE of each collection (Mongoose schemas)
├── controllers/      ← the functions that DO the work
└── routes/           ← maps a URL to a controller (+ which guards run first)
```

The mental model — four layers, each with one job:

```
Request → routes (which function?) → middleware (are you allowed?)
        → controllers (do the work) → models (how it's stored) → MongoDB
```

---

## 4. server.js — the entry point

Open `server.js`. In order, it:

1. Creates the Express `app`.
2. `require('dotenv').config()` — loads `.env` into `process.env`.
3. Imports every route module.
4. **Fails fast** if `MONGODB_URI` is missing/placeholder — prints a friendly
   3-step fix instead of an ugly crash.
5. `mongoose.connect(...)` — opens the DB connection (prints ✅ or a helpful error).
6. `app.use(cors())` and `app.use(express.json())` — **middleware** (see §7).
7. `app.use('/course', courseRoutes)` etc. — **mounts** each router under a prefix.
8. `app.listen(...)` — starts listening on the port.

> **Key idea:** `app.use('/course', courseRoutes)` means "any URL starting with
> `/course` is handled by `courseRoutes.js`." So `GET /course/getAllCourses`
> enters that router.

Mounted prefixes today: `/user`, `/course`, `/assignments`, `/marks`,
`/questions`, `/submissions`.

---

## 5. models/ — the shape of your data

There are **six** collections. Full field-by-field detail (and the relationship
diagram) lives in **[../DATABASE.md](../DATABASE.md)**; here's the quick map:

| Model file | Collection | Holds | Links to |
|------------|-----------|-------|----------|
| `User.model.js` | users | people (student/teacher/superadmin) | `enrolledCourses[] → courses` |
| `Courses.model.js` | courses | subjects | `instructor → User`, `enrolledStudents[] → User` |
| `Question.model.js` | questions | reusable questions | — |
| `assignments.model.js` | asignments | question sets, due dates | `courseId → courses`, `questions[] → Question` |
| `Submission.model.js` | submissions | a student's answers | `assignmentId`, `studentId`, `answers[].questionId` |
| `Marks.model.js` | marks | the grade book | `studentId → User`, `courseId → courses` |

Read `User.model.js` closely — it shows three important Mongoose features:

```js
role: { type: String, enum: ["student","teacher","superadmin"], default: "student" }
```
- **enum** — Mongoose rejects any role outside this list (catches typos).

```js
userSchema.pre("save", async function () {          // runs before every .save()
    if (!this.isModified("password")) return;       // only when password changed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
```
- **pre-save hook** — automatically hashes the password. You never store plain
  text. (In modern Mongoose an `async` hook just returns/throws — no `next`.)

```js
userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);     // used at login
};
```
- **instance method** — attach helpers to every document.

> ⚠️ **Gotcha:** `Model.insertMany()` does **not** run the pre-save hook, so it
> would store unhashed passwords. Use `Model.create()` when hashing matters
> (that's why `seed.js` uses `User.create`).

---

## 6. routes/ — the URL map (+ guards)

Every route file: import Express, import controllers, import the auth guards,
wire `METHOD path → [guards] → controller`.

Look at `routes/courseRoutes.js`:

```js
const staff = [authenticate, authorize("teacher", "superadmin")];

router.get("/getAllCourses", authenticate, getAllCourses);   // any logged-in user
router.post("/addCourse", staff, addCourse);                 // teachers/admins only
```

Because this router is mounted at `/course`, the final URLs are
`GET /course/getAllCourses`, `POST /course/addCourse`, etc.

The guards run **left to right before** the controller. A request with no token
never reaches `addCourse` — it's stopped at `authenticate` with a 401.

> **HTTP verbs:** `GET` = read, `POST` = create, `PUT`/`PATCH` = update,
> `DELETE` = remove. Reads are `GET`; anything that changes data is `POST` here.

---

## 7. Middleware — code that runs *between* request and controller

Middleware are functions with the signature `(req, res, next)`. They can inspect
the request, stop it, or call `next()` to pass control along.

App-wide (in `server.js`):
```js
app.use(cors());          // adds CORS headers so the browser allows the frontend
app.use(express.json());  // parses a JSON body into req.body
```

Our own (`middleware/auth.js`) — the heart of security:

```js
function authenticate(req, res, next) {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ msg: "Not authenticated" });
    try {
        req.user = jwt.verify(token, JWT_SECRET);   // { id, role }
        next();                                      // ✅ allowed through
    } catch { return res.status(401).json({ msg: "Invalid or expired token" }); }
}

function authorize(...allowedRoles) {               // returns a middleware
    return (req, res, next) =>
        allowedRoles.includes(req.user.role)
            ? next()
            : res.status(403).json({ msg: "Forbidden" });
}
```

- `authenticate` proves **who** you are (401 if not).
- `authorize(...roles)` proves you're **allowed** (403 if wrong role).
- `authorize` is a *higher-order* function: you call it with roles and it
  *returns* the actual middleware. That's why routes say `authorize("teacher")`.

The full who-can-do-what table is in **[../AUTH.md](../AUTH.md)**.

---

## 8. controllers/ — the real logic

A controller is a function `(req, res)` that does four things:
1. **Read input** from `req` (`req.body`, `req.query`, `req.params`, `req.user`).
2. **Validate** — check nothing's missing.
3. **Talk to the DB** through a Mongoose model.
4. **Respond** with `res.status(...).json(...)`.

### Authentication — `authController.js`
- `register` — public signup, always creates a **student**, returns a JWT.
- `login` — finds the user, `comparePassword`, returns `{ token, user }`.
- `me` — returns the current user from `req.user.id` (used on page refresh).
- `adminCreateUser` — superadmin-only; can mint teachers/superadmins.

`signToken(user)` wraps `jwt.sign({ id, role }, secret, { expiresIn: "7d" })`.

### The rest
- `courses.controllers.js` — CRUD + `enrollStudent` (updates **both** sides of
  the student↔course many-to-many with `$addToSet`).
- `questionController.js` — CRUD on the reusable question bank.
- `assignmentController.js` — create assignments, `addQuestionsToAssignment`
  (recomputes `totalMarks` from the referenced questions), read with
  `.populate()`.
- `submissionController.js` — `submit` a student's answers, and `grade` which
  auto-scores against each question's `correctAnswer` and writes a Marks row.
- `marksController.js` — read/record marks.

### Reading linked data — `.populate()`
References are just IDs. To fetch the linked document in one query:
```js
Assignment.findById(id).populate("courseId").populate("questions")
```
Without populate you get raw ObjectIds — that's usually your hint that a
`.populate()` is missing.

---

## 9. `req` and `res` cheat-sheet

| Where input comes from | Read with | Example |
|------------------------|-----------|---------|
| JSON body (POST/PUT) | `req.body.x` | `POST /user/login` with `{phoneNumber, password}` |
| Query string `?a=b` | `req.query.a` | `GET /user/getUser?phoneNumber=999` |
| URL param `/x/:id` | `req.params.id` | (not used yet) |
| The logged-in user | `req.user` | set by `authenticate` → `{ id, role }` |

Responding: `res.json(obj)`, `res.status(201).json(obj)`. Send exactly **one**
response per request.

`req.body` only works because of `app.use(express.json())`.

---

## 10. Full request lifecycle (worked example)

Student logs in, then the dashboard loads courses:

```
1. Browser → POST /user/login  { phoneNumber, password }
2. express.json() fills req.body
3. /user router → login controller
4. User.findOne → user.comparePassword(bcrypt) → jwt.sign
5. res.json({ token, user })                     ← frontend stores the token

6. Browser → GET /course/getAllCourses   Authorization: Bearer <token>
7. authenticate verifies the token, sets req.user
8. getAllCourses → Course.find() → res.json([...])
9. Frontend renders the course cards
```

Learn this one path and every endpoint is a variation of it.

---

## 11. Running & seeding locally

```bash
cd backend
npm install
cp .env.example .env      # then paste your MongoDB URI + a JWT_SECRET
npm run seed              # fills the DB with demo users/courses/etc.
npm start                 # http://localhost:9000
```

Seeded logins (created by `seed.js`, passwords hashed automatically):

| Role | Phone | Password |
|------|-------|----------|
| superadmin | 9000000000 | admin |
| teacher | 9000000001 | teach |
| student | 9999999001 | demo |

Test endpoints with `curl`, Postman, or Thunder Client. Log in first, then send
the token as `Authorization: Bearer <token>` (see AUTH.md §6 for copy-paste curl).

---

## 12. Common mistakes → fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `req.body` is undefined | missing `express.json()` | it's already in server.js; check your route |
| 401 on every call | no/expired token | log in again; send `Authorization: Bearer …` |
| 403 Forbidden | your role can't do this | see the AUTH.md permission table |
| passwords stored in plain text | used `insertMany` | use `.create()` so the hook runs |
| response shows ObjectIds | missing `.populate()` | populate the ref you need |
| `Cannot connect to MongoDB` | wrong URI / IP not allowlisted | check `.env`, Atlas Network Access |

---

## 13. Add your own endpoint (recipe)

1. **Model** — add/adjust a schema in `models/` if you need new data.
2. **Controller** — write `(req, res)`: read input, validate, hit the model, respond.
3. **Route** — wire it in `routes/…`, adding `authenticate` / `authorize(...)` guards.
4. It's auto-reachable because the router is already mounted in `server.js`.
5. Test with curl, then wire the frontend (`frontend/src/services/api.js`).

---

## 14. The one-paragraph summary

> **A route says who to call and who's allowed. Middleware runs first —
> `authenticate` checks the token, `authorize` checks the role. A controller
> does the work: read `req`, validate, use a model, send `res`. A model is the
> shape of the data and where passwords get hashed. `.populate()` turns IDs into
> full documents. Everything else is a variation on that.**

If you can draw the arrow diagram in §3 and explain each folder in one sentence,
you understand this backend.
