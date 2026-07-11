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
└── README.md         You are here
```

The two `learn.md` files are the main teaching material. Start there.

---

## Running it locally

### Prerequisites
- **Node.js 18+** and **npm**
- A **MongoDB** connection string (a free MongoDB Atlas cluster works — see `backend/.env.example`)

### Backend
```bash
cd backend
npm install
cp .env.example .env    # then edit .env with your MongoDB URI
npm start               # runs node server.js on http://localhost:9000
```

### Frontend
```bash
cd frontend
npm install
npm run dev             # runs Vite on http://localhost:5173
```

Open http://localhost:5173 in your browser. The frontend expects the backend at `http://localhost:9000` — if you change that, edit `frontend/src/services/api.js`.

> **First time?** You'll need to seed a user before you can log in. Send a `POST` to `http://localhost:9000/user/addUser` with a JSON body `{ "name": "You", "email": "you@x.com", "password": "test", "phoneNumber": 9999999999 }` from Postman / Thunder Client / `curl`.

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
