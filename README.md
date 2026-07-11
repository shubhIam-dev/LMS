# College ERP Portal (LMS)

A small MERN app used at Newton School to teach full-stack fundamentals — a College ERP where students log in with a phone number and can browse **Courses**, **Assignments**, and their **Marks**.

The codebase is deliberately kept **small, readable, and free of clever abstractions** so first-timers can trace every request from a click in the browser all the way to a MongoDB document — and back.

---

## What's inside

```
LMS/
├── backend/          Express + Mongoose API (Node)
│   ├── models/       Mongoose schemas — the shape of each collection
│   ├── controllers/  The functions that actually do work
│   ├── routes/       URL → controller mapping
│   ├── server.js     Entry point — DB connect + middleware + mount routes
│   └── learn.md      📘 Deep-dive teaching guide for the backend
│
├── frontend/         React + Vite + Redux Toolkit
│   ├── src/
│   │   ├── pages/        One component per URL
│   │   ├── components/   Reusable bits (Sidebar, ProtectedRoute)
│   │   ├── store/        Redux store + slices (state management)
│   │   ├── services/     Thin wrapper around fetch — one file per resource
│   │   ├── App.jsx       Routes + layout
│   │   └── main.jsx      Renders <App /> into #root, wraps in <Provider>
│   └── learn.md      📘 Deep-dive teaching guide for the frontend
│
├── fullflow.md       End-to-end walkthrough of a real request
├── DATABASE.md       📘 Every collection, every relationship, curl walkthrough of a full flow, roadmap
├── flowofbackend.md  📘 A teacher's journey: create course → questions → assignment → enroll → grade
└── README.md         You are here
```

**Reading order:** `README.md` (this file) → `DATABASE.md` for the data model → `flowofbackend.md` for how a teacher drives it → `backend/learn.md` and `frontend/learn.md` for a code tour.

---

## Running it locally

### Prerequisites
- **Node.js 18+** and **npm**
- A **MongoDB** database — either a free Atlas cluster (recommended, walkthrough below) or MongoDB running locally

### Step 1 — Set up MongoDB (your own free cluster)

You have two options. Pick one.

#### Option A: MongoDB Atlas (free cloud tier — recommended)

Atlas gives you a hosted MongoDB you can reach from anywhere, and the free **M0** tier is more than enough for this project.

1. **Create an account** at https://www.mongodb.com/cloud/atlas/register.
2. **Create a project.** Name it whatever you like (e.g. `lms-learning`).
3. **Deploy a cluster:**
   - Click **"Build a Database"**.
   - Choose **M0 (Free)**.
   - Pick any cloud provider and the region closest to you.
   - Cluster name: leave the default or rename to `Cluster0`.
   - Click **"Create Deployment"**. Provisioning takes 1–3 minutes.
4. **Create a database user:**
   - When prompted (or under **Security → Database Access**), click **"Add New Database User"**.
   - Auth method: **Password**.
   - Choose a username (e.g. `lmsuser`) and a **strong password**. Save both somewhere safe — you'll paste them into the connection string in a moment.
   - Built-in role: **"Read and write to any database"**.
   - Click **"Add User"**.
5. **Whitelist your IP:**
   - Under **Security → Network Access**, click **"Add IP Address"**.
   - For development, click **"Allow Access from Anywhere"** (`0.0.0.0/0`). This is fine for a learning project — for production you'd whitelist specific IPs only.
   - Click **"Confirm"**.
6. **Get your connection string:**
   - Go back to **Database → Clusters**, click **"Connect"** on your cluster.
   - Choose **"Drivers"** (or "Connect your application").
   - Driver: **Node.js**, Version: **latest**.
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
7. **Fill in the placeholders:**
   - Replace `<username>` with your DB username.
   - Replace `<password>` with the DB password (URL-encode any special characters — `@` becomes `%40`, `#` becomes `%23`, etc.).
   - Optionally add a database name in the URL before the `?`:
     ```
     mongodb+srv://lmsuser:mySecret%40123@cluster0.abcde.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0
     ```
     The trailing `/lms` tells Mongoose to use a database named `lms`. If you omit it, you'll get a default database — that's fine too.
8. **Paste it into `.env`** in the next step.

#### Option B: Local MongoDB

If you'd rather not use Atlas, install MongoDB Community Edition locally. On macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```
Your connection string will then be:
```
mongodb://127.0.0.1:27017/lms
```

### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env    # then edit .env with the connection string from Step 1
npm start               # runs node server.js on http://localhost:9000
```

Your `.env` should look like:
```
MONGODB_URI=mongodb+srv://lmsuser:mySecret%40123@cluster0.abcde.mongodb.net/lms?retryWrites=true&w=majority&appName=Cluster0
PORT=9000
```

If the server prints `Connected TO DataBase` you're good. If it prints an error, check:
- Password URL-encoded? (`@` → `%40`, `#` → `%23`)
- IP whitelisted in Atlas?
- Username / password typed correctly?
- Cluster still provisioning? (wait ~2 min)

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev             # runs Vite on http://localhost:5173
```

Open http://localhost:5173 in your browser. The frontend expects the backend at `http://localhost:9000` — if you change that, edit `frontend/src/services/api.js`.

### Step 4 — Seed your database with demo data (one command)

Your fresh MongoDB is empty — nothing to log in with, no courses to browse. The backend ships with a seeder that fills all six collections with realistic connected data (teachers, students, courses, question bank, assignments, a graded submission, marks). It uses **your own** `MONGODB_URI` from `.env` — nothing about it is hardcoded.

```bash
cd backend
npm run seed
```

You'll see something like:
```
→ Connecting to MongoDB…
✅ Connected.
→ Clearing existing data in the six collections…
→ Inserting users…
→ Inserting courses…
→ Inserting question bank…
→ Inserting assignments…
→ Inserting a graded submission for Aria on the DSA homework…
→ Inserting marks rows…

✅ Seed complete. Log in on the frontend with any of these:

   Aria    → phone 9999999001   password demo
   Bilal   → phone 9999999002   password demo
   Chitra  → phone 9999999003   password demo
```

Open the frontend, log in as any of the demo students, and you'll see a fully-populated dashboard.

> **Warning:** `npm run seed` **wipes all six collections** in your database before inserting. Run it on an empty database or a scratch one — not on real data you care about.

Prefer to make your own user by hand instead? Send this to the backend:
```bash
curl -X POST http://localhost:9000/user/addUser \
  -H "Content-Type: application/json" \
  -d '{"name":"You","email":"you@x.com","password":"test","phoneNumber":9999999999,"role":"student"}'
```

For a full walkthrough of creating courses, questions, assignments, submissions, and grades via `curl`, see **[DATABASE.md](DATABASE.md) §5**.

---

## Tech stack

| Layer | Tool | Why it's here |
|-------|------|---------------|
| Frontend UI | **React 19** | Component-based UI |
| Frontend build | **Vite** | Fast dev server + build |
| Routing | **React Router 7** | Client-side navigation |
| State management | **Redux Toolkit** | Predictable, DevTools-friendly global state |
| Backend runtime | **Node.js** | JavaScript on the server |
| Backend framework | **Express 5** | HTTP routing + middleware |
| Database | **MongoDB** | Document store — flexible for teaching |
| ODM | **Mongoose** | Schemas + query helpers for Mongo |
| Config | **dotenv** | Loads secrets from `.env` |
| Fonts | **Fraunces + DM Sans** (Google Fonts) | Display serif + UI sans |

---

## What you need to learn to understand this code fully

If any of these are new, go through them in order — later topics depend on earlier ones. The linked chapter names refer to the MDN Web Docs and each library's official docs, which are the ground truth.

### Foundations (do these first)
- **HTML basics** — elements, attributes, forms
- **CSS basics** — the box model, flexbox, grid, custom properties (CSS variables), media queries, pseudo-elements (`::before` / `::after`)
- **JavaScript essentials**
  - `let` / `const`, functions, arrow functions
  - Objects, arrays, destructuring, spread/rest
  - `if` / `for` / `map` / `filter` / `reduce`
  - **Promises**, `async` / `await`, `try` / `catch`
  - ES modules — `import` / `export`
- **JSON** — how objects serialize over the network
- **The browser** — the DOM, dev tools, the network tab, `localStorage`

### HTTP + the network
- Request/response lifecycle
- HTTP verbs: `GET`, `POST`, `PUT`, `PATCH`, `DELETE` — when to use which
- Status codes: `200`, `201`, `400`, `401`, `404`, `500`
- Query strings vs. request body vs. URL params
- CORS — why the browser blocks cross-origin requests, and how the `cors` package fixes it
- The `fetch` API and how we wrap it in `frontend/src/services/api.js`

### Node + Express (the backend)
- What Node.js is and how `require` / `module.exports` work
- `npm` and `package.json` — scripts, dependencies, `node_modules`
- Environment variables and `dotenv`
- Express fundamentals:
  - `app.use(...)` — middleware
  - `app.get / post / put / delete` — route handlers
  - The `(req, res)` handler signature
  - `req.body`, `req.query`, `req.params` — three input sources
  - `res.json()`, `res.status()`
- The MVC-ish pattern: **routes → controllers → models**

### MongoDB + Mongoose
- What a document database is (vs SQL)
- Collections and documents
- MongoDB Atlas setup, IP whitelist, connection string
- Mongoose schemas — types, `required`, `default`, `enum`
- CRUD via a model: `Model.find`, `.findOne`, `.findById`, `.save`, `.updateOne`, `.deleteOne`, `.insertMany`
- References across collections — `ObjectId` + `ref` (see `models/Marks.model.js`)

### React (the frontend)
- Components as functions returning JSX
- Props (read-only inputs to a component)
- State with `useState` — never mutate; always set new values
- Effects with `useEffect` — the dependency array, when it runs
- Conditional rendering, list rendering with `key`
- Controlled inputs (see `LoginPage.jsx`)
- One-way data flow: **data down, events up**
- Component composition (`Layout` wraps `Sidebar` + page)

### React Router
- `<BrowserRouter>`, `<Routes>`, `<Route>`
- `<Link>`, `<NavLink>` — client-side navigation without a full reload
- `useNavigate()` — programmatic navigation
- `<Navigate to=... />` — redirects (see `ProtectedRoute.jsx`)

### Redux Toolkit (state management)
- **Why** Redux — one predictable source of truth for global state, DevTools time-travel debugging, avoids prop drilling
- Core concepts: **store**, **actions**, **reducers**, **selectors**
- `configureStore` — see `src/store/index.js`
- `createSlice` — bundles initial state + reducers + auto-generated action creators
- `createAsyncThunk` — for async work (e.g. login API call). Auto-dispatches `.pending` / `.fulfilled` / `.rejected`
- `useSelector` — read state in a component
- `useDispatch` — send actions from a component
- `<Provider store={store}>` — makes the store available to the whole tree (see `main.jsx`)
- All of the above lives in **`src/store/authSlice.js`**. Read that file top-to-bottom.

### Tooling & workflow
- **Git**: `clone`, `add`, `commit`, `push`, `pull`, branches, PRs
- **ESLint** — how it's configured here (`eslint.config.js`)
- Dev tools: **React DevTools** and **Redux DevTools** browser extensions — install both

### Recommended learn-by-doing order
1. Get comfortable with HTML / CSS / JS in isolation
2. Build a tiny Node + Express "Hello world" API
3. Add MongoDB + Mongoose to it
4. Learn React on its own with a small side project
5. Add React Router
6. **Now** open this repo — you'll recognize every pattern
7. Then read `backend/learn.md` and `frontend/learn.md` for the guided walkthrough

---

## Contributing

Contributions are welcome — this is a teaching repo, so **clarity beats cleverness**.

### Ground rules
1. **One PR, one idea.** Don't mix a bug fix with a refactor.
2. **Keep it simple.** If a beginner can't read your code in one pass, it's too clever.
3. **Match the existing style.** The two `learn.md` files describe our patterns — follow them.
4. **No new dependencies without discussing first.** Every dependency is another thing students have to learn.
5. **Don't reformat files you didn't change.** Diffs should show intent, not whitespace churn.

### How to contribute
1. **Fork** this repo on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/LMS.git
   cd LMS
   ```
3. **Create a branch** off `main`. Use a descriptive name:
   ```bash
   git checkout -b fix-marks-percentage-color
   ```
4. **Make the change.** Run both frontend and backend locally to verify.
5. **Commit** with a message that explains the **why**, not just the **what**:
   ```
   Fix percentage color threshold for grades below 40

   The old cutoff at 35 was inconsistent with the pass/fail line
   used elsewhere in the report.
   ```
6. **Push** and open a **Pull Request** against `shubhIam-dev/LMS` `main`.
7. In the PR description, explain:
   - What the change does
   - Why it's needed
   - What you tested manually (screenshots for UI changes are gold)

### Good first issues
- Add proper HTTP status codes to every controller (`201`, `400`, `404` — see `backend/learn.md` §9)
- Hash the password with `bcrypt` instead of storing plain text
- Move `BASE_URL` in `services/api.js` to a Vite env var (`import.meta.env.VITE_API_URL`)
- Add pagination to `getAllCourses`
- Add a Register page (there's already a `userApi.register()` — wire it up)
- Write a real JWT-based auth flow (backend issues token, frontend stores + sends it)
- Add a `coursesSlice` and `marksSlice` so page data is cached in Redux
- Fix `router.get("/deleteCourse", …)` — should be `DELETE`, not `GET`

### Reporting a bug
Open an issue with:
- What you did (steps to reproduce)
- What you expected
- What actually happened
- Screenshots or console output if relevant
- Your Node / npm / OS versions

### Suggesting a feature
Open an issue first before writing code. Explain the use case in one paragraph — we'll discuss scope before you spend time on it.

---

## License
This is a teaching repository. Do whatever helps you learn.
