# Frontend — learn.md

<<<<<<< HEAD
Welcome! This file explains **what the frontend is, how React thinks, and every file in this folder**. Read it top-to-bottom — every section points at real code you can open.

---

## 1. What is "the frontend"?

The frontend is everything the user **sees and clicks** in the browser. It:
1. Renders HTML/CSS onto the page
2. Reacts to user actions (clicks, typing, navigation)
3. Talks to the backend over HTTP to fetch/send data
4. Updates the screen when data changes — **without full page reloads**

This project builds a **Single Page Application (SPA)** — one HTML file (`index.html`), and JavaScript swaps the content in and out as the user navigates.

---

## 2. The stack we're using

| Tool | What it is | Why we use it |
|------|-----------|---------------|
| **React** | A library for building UIs from small reusable pieces called **components** | Data-driven, declarative, huge ecosystem |
| **Vite** | A dev server + build tool | Instant startup, hot reload, tiny config |
| **React Router** | Navigation between pages *without* reloading the browser | SPAs need client-side routing |
| **JSX** | HTML-in-JavaScript syntax | Lets you write `<div>` inside `.jsx` files |
| **Fetch API** | Built-in browser way to call HTTP endpoints | We wrap it in `services/api.js` |
=======
Your guided tour of the frontend. Read it top to bottom with the code open. By
the end you'll understand how a page is built, how login works, how data flows,
and where to add your own screen.

Companion docs:
- **[../AUTH.md](../AUTH.md)** — how login + roles work (frontend + backend)
- **[../README.md](../README.md)** — run it, seeded logins, contribution flow

---

## 1. What the frontend does

Everything the user sees and clicks in the browser. It renders the UI, reacts to
clicks/typing, calls the backend over HTTP, and updates the screen when data
changes — all **without full page reloads**. This is a **Single Page App (SPA)**:
one HTML file (`index.html`) and JavaScript swaps content as you navigate.

---

## 2. The stack

| Tool | What it is | Why it's here |
|------|-----------|---------------|
| **React** | Builds UIs from reusable **components** | Declarative, data-driven |
| **Vite** | Dev server + build tool | Instant start, hot reload |
| **React Router** | Navigate between pages, no reload | SPAs need client routing |
| **Redux Toolkit** | Global state (who's logged in) | One source of truth, DevTools |
| **Fetch API** | Calls the backend | Wrapped in `services/api.js` |
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232

---

## 3. Folder structure

```
frontend/
<<<<<<< HEAD
├── index.html              ← the ONLY html file — has <div id="root"></div>
├── vite.config.js          ← Vite config (just enables the React plugin)
├── package.json            ← dependencies + scripts (dev / build)
├── public/                 ← static assets served as-is (favicon, icons)
└── src/
    ├── main.jsx            ← app entry: mounts <App/> into #root
    ├── App.jsx             ← top-level routes + layout
    ├── App.css             ← app-wide styles
    ├── index.css           ← global reset + CSS variables (theme)
    ├── assets/             ← images used inside the app
    ├── components/         ← REUSABLE pieces (Sidebar, ProtectedRoute)
    ├── pages/              ← full pages, one per route (Login, Dashboard, …)
    ├── context/            ← shared state (AuthContext for login info)
    └── services/           ← backend API calls (api.js)
```

**Rule of thumb**: if it maps 1:1 to a URL, it's a **page**. If it's used inside multiple pages, it's a **component**.

---

## 4. The boot sequence (how the app starts)

1. Browser loads `index.html` → finds `<div id="root"></div>` and `<script src="/src/main.jsx">`.
2. `src/main.jsx` runs:
    ```jsx
    createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
    ```
    → React takes over the `#root` div.
3. `App.jsx` renders. It sets up the router, auth provider, and layout.
4. React Router looks at the URL and picks which page to display.

---

## 5. Walkthrough of every file

### 5.1 `App.jsx` — routing + layout

```jsx
<Router>
  <AuthProvider>
    <Layout>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        …
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  </AuthProvider>
</Router>
```

What each wrapper does (outermost → innermost):
- `<Router>` — enables client-side routing (from `react-router-dom`).
- `<AuthProvider>` — makes the logged-in user available *everywhere* below it.
- `<Layout>` — shows the `Sidebar` when the user is logged in.
- `<Routes>` — picks the ONE matching `<Route>` based on the current URL.
- `<ProtectedRoute>` — kicks non-logged-in users back to `/`.
- `<Route path="*">` — catch-all for unknown URLs.

### 5.2 `context/AuthContext.jsx` — global state for "who is logged in"

React's **Context API** lets one component share data with all its children *without* passing props through every level ("prop drilling").

Key pieces:
- `createContext(null)` — creates the "channel."
- `<AuthContext.Provider value={{ user, login, logout, loading }}>` — publishes the value.
- `useAuth()` — a custom hook that reads the value in any component.

Inside the provider you'll see:
- `useState(null)` for the `user`.
- `useEffect(() => { … }, [])` that runs **once on mount** to check `localStorage` — so users stay logged in across refreshes.
- `login()` calls `userApi.login()` from `services/api.js`, checks the password, and saves the user.
- `logout()` clears state and `localStorage`.

> **Why localStorage?** It's a tiny key-value store built into the browser that survives refreshes and tab closes. Perfect for "remember me" flags. But do NOT store real passwords or JWTs long-term without thinking about XSS.

### 5.3 `services/api.js` — the phonebook for backend calls

Any time the frontend needs data, it goes through this file. Never scatter `fetch(...)` calls all over your pages — centralize them so:
- You change the base URL in one place
- Every call handles errors consistently
- Pages just call `courseApi.getAllCourses()` and get clean data back
=======
├── index.html            the ONLY html file — has <div id="root">
└── src/
    ├── main.jsx          entry: wraps <App/> in the Redux <Provider>
    ├── App.jsx           routes + layout (sidebar when logged in)
    ├── index.css         DESIGN TOKENS — colors, fonts, spacing (the theme)
    ├── App.css           component styles + the icon system
    ├── store/
    │   ├── index.js      the Redux store
    │   └── authSlice.js  login/logout state + the login thunk
    ├── services/
    │   └── api.js        every backend call (attaches the JWT automatically)
    ├── components/
    │   ├── ProtectedRoute.jsx   gate pages by login + role
    │   └── Sidebar.jsx          nav + user card
    └── pages/
        ├── LoginPage.jsx  Dashboard.jsx  Courses.jsx
        ├── Assignments.jsx  Marks.jsx
```

**Rule of thumb:** maps 1:1 to a URL → it's a **page**. Used inside many pages →
it's a **component**.

---

## 4. The boot sequence

1. Browser loads `index.html`, finds `<div id="root">` + `<script src="/src/main.jsx">`.
2. `main.jsx` runs:
   ```jsx
   createRoot(document.getElementById('root')).render(
     <Provider store={store}><App /></Provider>
   )
   ```
   `<Provider>` makes the Redux store available to every component.
3. `App.jsx` sets up the router + layout and picks a page from the URL.

---

## 5. State management with Redux Toolkit

React components have their own local state (`useState`). But "who is logged in"
is needed by many components (sidebar, protected routes, pages), so it lives in
one **global store** instead of being passed down through props.

### The pieces (read `store/authSlice.js` alongside)

- **store** (`store/index.js`) — `configureStore({ reducer: { auth: authReducer } })`.
  One `reducer` key per slice.
- **slice** (`store/authSlice.js`) — bundles the auth state + how it changes:
  - `initialState` — `{ user, status, error }` (user re-read from localStorage).
  - **reducers** — `logout`, `clearError` (synchronous changes).
  - **thunk** — `loginUser`, an async action:
    ```js
    export const loginUser = createAsyncThunk("auth/loginUser",
      async ({ phoneNumber, password }, { rejectWithValue }) => {
        try {
          const { token, user } = await userApi.login(phoneNumber, password);
          setToken(token);                                   // save JWT
          localStorage.setItem("user", JSON.stringify(user));
          return user;                                       // → fulfilled
        } catch (err) {
          return rejectWithValue(err.message);               // → rejected
        }
      });
    ```
    A thunk auto-fires three actions: `pending` → `fulfilled`/`rejected`, handled
    in `extraReducers` to flip `status` and store the `user` or `error`.
  - **selectors** — small readers: `selectUser`, `selectRole`, `selectIsAuthed`,
    `selectAuthStatus`, `selectAuthError`.

### Using it in a component
```js
const user = useSelector(selectUser);        // READ state
const dispatch = useDispatch();              // SEND an action
dispatch(loginUser({ phoneNumber, password }));
dispatch(logout());
```

> **Why Redux over prop-drilling?** Any component reads the user directly with
> `useSelector` — no passing props through five layers. And Redux DevTools lets
> you watch every state change (install the browser extension).

---

## 6. services/api.js — the phonebook for the backend

Never scatter `fetch()` across pages. Everything goes through here so the base
URL, error handling, and **auth token** are in one place.
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232

```js
const BASE_URL = "http://localhost:9000";

async function callApi(endpoint, options = {}) {
<<<<<<< HEAD
    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });
    if (!response.ok) throw new Error(...);
    return await response.json();
}

export const courseApi = {
    getAllCourses: () => callApi("/course/getAllCourses"),
};
```

Grouped exports (`userApi`, `courseApi`, `assignmentApi`, `marksApi`) mirror the backend's route prefixes — makes it easy to find things.

### 5.4 `components/Sidebar.jsx` — the nav bar

- `<NavLink to="/courses">` — like `<a href>` but does NOT reload the page and adds an `active` class when the URL matches.
- Shows the user's initial as an avatar: `{user?.name?.[0]?.toUpperCase()}`.
- Calls `logout()` from `useAuth()` when the button is clicked.

### 5.5 `components/ProtectedRoute.jsx` — the auth guard

Very small but important:

```jsx
if (loading) return <LoadingSpinner />;
if (!user)   return <Navigate to="/" replace />;
return children;
```

Wraps any page you don't want strangers to see. If not logged in → redirect. If logged in → render the page. The `loading` check prevents a "flash of login screen" while we check localStorage.

### 5.6 `pages/LoginPage.jsx` — the form

Learn from this file:
- **Controlled inputs**: `value={phoneNumber}` + `onChange={e => setPhoneNumber(e.target.value)}`. React owns the truth; the input reflects state.
- **Form submit**: `<form onSubmit={handleLogin}>` — and inside `handleLogin` we call `e.preventDefault()` to stop the browser from actually posting the form / refreshing.
- **Loading state**: `isLoading` disables inputs and swaps the button text so users know something's happening.
- **Error state**: `error` string, rendered conditionally with `{error && <div>...</div>}`.
- **Navigation after success**: `useNavigate()` returns a `navigate("/dashboard")` function.

### 5.7 `pages/Dashboard.jsx`, `Courses.jsx`, `Assignments.jsx`, `Marks.jsx`

They all follow the same "data page" pattern — **learn this pattern well**:

```jsx
function SomePage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await someApi.getSomething();
                setData(Array.isArray(result) ? result : []);
            } catch (err) {
                setError("Failed to load…");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);   // empty array = run once on mount

    if (loading) return <Spinner />;
    if (error)   return <ErrorMessage />;
    return <RenderList data={data} />;
}
```

Every "list" page in this app is a variation of the same template. If you can write it from memory, you can build most CRUD dashboards.

Special touches worth noticing:
- `Dashboard.jsx` — uses `Promise.all([...])` to fetch two endpoints in parallel.
- `Assignments.jsx` — helper functions `formatDate` and `getAssignmentTypeColor` show how to keep JSX readable.
- `Marks.jsx` — uses `.reduce(...)` to compute overall percentage from the array; conditional color from a helper.

---

## 6. Concepts you MUST know

### 6.1 Components

A React component is just a **function that returns JSX**. That's it.

```jsx
function Hello({ name }) {
    return <h1>Hi {name}</h1>;
}
```

The word between `<` and `/>` starts with a capital letter → React treats it as a component (not an HTML tag).

### 6.2 Props

Props (properties) are how a parent passes data into a child.

```jsx
<Hello name="Ali" />          // parent
function Hello({ name }) { … } // child destructures from props
```

Props are **read-only** — a child can't change what the parent gave it.

### 6.3 State (`useState`)

State is data that belongs to a component and can change over time. Changing state triggers a re-render.

```jsx
const [count, setCount] = useState(0);
setCount(count + 1); // triggers re-render, showing new value
```

Rules:
- Call `useState` **at the top of a component** — never inside if/for/loops.
- Never mutate directly (`state.push(x)`); always call the setter with a new value.

### 6.4 Effects (`useEffect`)

`useEffect` lets you run code **after** rendering — perfect for fetching data.

```jsx
useEffect(() => {
    doThing();
}, [dep]);
```

The second argument is the **dependency array**:
- `[]`   → run once, after the very first render (this is how we fetch data on page load)
- `[x]`  → run whenever `x` changes
- (omit) → run after every render (usually a bug)

### 6.5 JSX rules

- Wrap multiple elements in `<>...</>` (fragments) or a single `<div>`.
- Use `className`, not `class` (`class` is a reserved JS keyword).
- Use `{expression}` inside JSX to embed JavaScript.
- Every item in a mapped list needs a **unique `key`**: `{items.map(i => <li key={i._id}>…</li>)}`.
- Conditional rendering: `{condition && <X/>}` or `{condition ? <A/> : <B/>}`.

### 6.6 Client-side routing

Traditional websites reload the page for every link. SPAs don't — React Router intercepts clicks and swaps the component instead.
- `<NavLink>` / `<Link>` → replaces `<a href>`.
- `useNavigate()` → programmatic navigation from JS (`navigate('/dashboard')`).
- `<Navigate to="/" />` → declarative redirect.

### 6.7 The React data flow

**Data flows down**, **events flow up**.

- Parent passes state down as props.
- Children call functions the parent gave them (via props) to request changes.
- The parent updates state → React re-renders the tree → children get new props.

Understand this diagram and 80% of React clicks:

```
[state lives here]
      │  props down
      ▼
   [child]
      │  callback up (setState, onSomething)
      ▲
```

### 6.8 Talking to the backend

```jsx
const data = await fetch(url).then(r => r.json());
```

- Do this inside `useEffect` for page-load fetches, or inside event handlers for user-triggered fetches.
- Always handle `loading`, `error`, and `data` — three states.
- Never block the UI: use spinners.

---

## 7. Running it locally
=======
  const token = getToken();                        // from localStorage
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),  // 🔑 auto-attached
      ...options.headers,
    },
    ...options,
  });
  if (!response.ok) throw new Error((await response.json()).msg);
  return response.json();
}
```

The magic line is `Authorization: Bearer <token>`. Because every call goes
through `callApi`, once you're logged in **every** request carries your token —
that's what gets you past the backend's `authenticate` middleware.

Grouped exports mirror the backend prefixes: `userApi` (login/register/me),
`courseApi`, `assignmentApi`, `marksApi`, plus `getToken`/`setToken`/`clearToken`.

---

## 7. Routing & protecting pages

`App.jsx`:
```jsx
<Router>
  <Layout>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      …
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
</Router>
```

`components/ProtectedRoute.jsx` is the guard:
```jsx
function ProtectedRoute({ children, roles }) {
  const isAuthed = useSelector(selectIsAuthed);
  const role = useSelector(selectRole);
  if (!isAuthed) return <Navigate to="/" replace />;       // not logged in
  if (roles && !roles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;                                          // allowed
}
```
- No `roles` prop → any logged-in user may see the page.
- `roles={["teacher","superadmin"]}` → only those roles; others bounce to the
  dashboard. (This is how you'll gate future teacher/admin pages.)

`Layout` shows the `Sidebar` only when logged in; the sidebar displays the user's
**role** (student / teacher / super admin) via `selectRole`.

---

## 8. The login flow, end to end

```
LoginPage: user types phone + password, submits
   → dispatch(loginUser({ phoneNumber, password }))
      → userApi.login() → POST /user/login
         → backend verifies password (bcrypt), returns { token, user }
      → authSlice saves token + user to localStorage, sets state.auth.user
   → LoginPage sees loginUser.fulfilled → navigate("/dashboard")
On refresh: authSlice reads the saved user from localStorage → still logged in.
Logout: dispatch(logout()) clears token + user.
```

Read `pages/LoginPage.jsx` — it shows **controlled inputs** (`value` + `onChange`),
a **loading** state (button disabled/relabelled), and **error** display from
`selectAuthError`.

---

## 9. The "data page" pattern (learn this cold)

`Dashboard`, `Courses`, `Assignments`, `Marks` are all variations of one shape:

```jsx
function SomePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {                       // runs once on mount ([])
    async function load() {
      try {
        const result = await someApi.getSomething();   // token auto-attached
        setData(Array.isArray(result) ? result : []);
      } catch (err) {
        setError("Failed to load…");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error)   return <ErrorMessage />;
  return <RenderList data={data} />;
}
```

Notice: three states (`loading`, `error`, `data`) and the fetch runs inside
`useEffect` with an empty `[]` so it fires once when the page mounts. Special
touches: `Dashboard` uses `Promise.all` to fetch two endpoints at once;
`Marks` uses `.reduce()` to compute the overall percentage.

---

## 10. React concepts you must know

- **Component** — a function that returns JSX. Capitalized name = component.
- **Props** — read-only inputs a parent passes to a child.
- **State (`useState`)** — data that changes over time; setting it re-renders.
  Never mutate; always call the setter with a new value.
- **Effects (`useEffect`)** — run code after render (e.g. fetch). The dependency
  array controls when: `[]` = once, `[x]` = when `x` changes.
- **JSX rules** — `className` not `class`; `{expr}` embeds JS; every mapped list
  item needs a unique `key`; conditional render with `{cond && <X/>}`.
- **Data flows down, events flow up** — parents pass state as props; children
  call callbacks (or dispatch Redux actions) to request changes.

---

## 11. The design system (so your UI matches)

The look is a deliberate **college-LMS dashboard**, defined once in
`src/index.css` under `:root` — read it before styling anything.

- **Color theory:** an **indigo** primary (`--primary-600`, academia/trust), an
  **analogous violet** for gradients, and a **complementary amber**
  (`--amber-500`, opposite indigo on the wheel) used sparingly for highlights.
  Cool indigo-tinted neutrals; semantic success/warning/danger/info.
- **Fonts:** Plus Jakarta Sans (headings) + Inter (UI).
- **Cards:** white, rounded (`--r`, `--r-lg`), soft shadows (`--shadow-sm/-md`),
  a small hover lift.
- **Icons:** Lucide-style line icons drawn as **CSS masks** (`--ic-*` in
  `App.css`) — recolored with `background-color`, **no image files**. Nav icons
  are applied by `.nav-link[href="/..."]` selectors, so adding a nav item needs
  no icon wiring in JSX.

**To keep the UI looking hand-crafted (not "AI-generated"):** reuse these
tokens and component classes, don't introduce new random colors or drop-shadows,
keep spacing on the existing scale, and prefer one clear accent over rainbow
gradients. When you add a screen it should look like it was always part of the app.

---

## 12. Running locally
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232

```bash
cd frontend
npm install
<<<<<<< HEAD
npm run dev
# open http://localhost:5173
```

`npm run build` → produces an optimized `dist/` folder for deployment.

Make sure the **backend is running on `http://localhost:9000`** (see backend/learn.md) — otherwise every API call will fail with a network error.

---

## 8. Common mistakes and fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| "Objects are not valid as a React child" | You put an object (not string) inside JSX | Access a property or `JSON.stringify` it |
| Infinite loop of re-renders | Setting state in the render body OR missing `useEffect` deps | Move state updates into effects/handlers |
| "Each child in a list should have a unique key" | Missing `key` prop in `.map()` | Add `key={item._id}` |
| CORS error in console | Backend not sending CORS headers | Fix on backend (`app.use(cors())`) |
| Page flashes login screen briefly | `loading` guard missing in ProtectedRoute | Wait for `loading === false` before deciding |
| Empty page, no error | `data` isn't an array — `.map` didn't run | Log the response; check backend shape |

---

## 9. Homework — exercises to actually learn

**Easy**
1. Change the primary color in `index.css` (look for CSS variables) and see it update everywhere.
2. Add a "Home" link in `Sidebar.jsx`.
3. Show the user's email under their name in the sidebar.

**Medium**
4. Add a search input on the `Courses` page that filters courses by `CourseName` client-side.
5. Add a Register page that calls `userApi.register()` and logs the user in on success.
6. Show a "You are logged in as X" toast for 3 seconds after login.

**Hard**
7. Move `BASE_URL` in `services/api.js` into an `.env` variable read via `import.meta.env.VITE_API_URL`.
8. Add a global loading indicator that shows whenever *any* API call is in flight.
9. Replace the ad-hoc auth with a real token flow: backend returns a JWT, frontend stores it, `callApi` attaches it as `Authorization: Bearer …`.

---

## 10. Mental model to walk away with

> **A page is a function that returns JSX. Data lives in state. Events change state. Effects run after render. Props flow down; callbacks flow up. The router picks which page to show. Everything else is detail.**

If you can build a page that fetches data, shows loading/error/empty states, and lets a user filter it — you understand React well enough to build almost anything.
=======
npm run dev          # http://localhost:5173
```

The frontend expects the backend at `http://localhost:9000` (see `services/api.js`).
Start the backend and `npm run seed` it first, then log in with a seeded account
(e.g. student `9999999001` / `demo`).

`npm run build` produces an optimized `dist/` for deployment; `npm run lint`
runs ESLint.

---

## 13. Common mistakes → fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Objects are not valid as a React child" | put an object in JSX | render a property, not the object |
| Infinite re-renders | set state in render body / bad `useEffect` deps | move updates into effects/handlers |
| "unique key" warning | missing `key` in `.map()` | add `key={item._id}` |
| Every API call 401s | not logged in / token missing | log in; `callApi` attaches the token |
| Redirected to login unexpectedly | `ProtectedRoute` sees no user | check the token/user in localStorage |
| Styles look off-theme | hard-coded colors | use the `--` variables from `index.css` |

---

## 14. Add your own page (recipe)

1. Add a call in `services/api.js` (it inherits the token automatically).
2. Create `pages/YourPage.jsx` using the data-page pattern in §9.
3. Add a `<Route>` in `App.jsx`, wrapped in `<ProtectedRoute>` (add `roles` to
   restrict it).
4. Add a nav item in `Sidebar.jsx` (and an `--ic-*` icon selector if you want one).
5. Style with the existing tokens/classes so it matches.

---

## 15. The one-paragraph summary

> **A page is a function that returns JSX. Local UI state is `useState`; the
> logged-in user is global state in the Redux `auth` slice, read with
> `useSelector`. `services/api.js` calls the backend and auto-attaches your JWT.
> `ProtectedRoute` gates pages by login and role. Effects fetch data on mount;
> data flows down, events (and `dispatch`) flow up. Style from the design tokens.
> Everything else is a variation on that.**
>>>>>>> 2a077479d9cc37ead158c2916d9e354f075a9232
