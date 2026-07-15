# Frontend — learn.md

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

---

## 3. Folder structure

```
frontend/
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

```js
const BASE_URL = "http://localhost:9000";

async function callApi(endpoint, options = {}) {
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

```bash
cd frontend
npm install
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
