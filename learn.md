# 🎓 College ERP Portal — Complete Project Flow (learn.md)

> **Read this top to bottom.** By the end you'll understand:
> - How the frontend is structured and how pages are built
> - How the backend is structured and how requests flow
> - How frontend and backend talk to each other
> - Where attendance fits today (and what's missing)

---

## 📋 Table of Contents

1. [Big Picture — How It All Fits Together](#1-big-picture)
2. [Frontend — The User Interface](#2-frontend)
   - 2.1 [Stack & Folder Structure](#21-frontend-stack)
   - 2.2 [Boot Sequence (How the App Starts)](#22-boot-sequence)
   - 2.3 [Routing & Page Protection](#23-routing)
   - 2.4 [State Management with Redux](#24-redux)
   - 2.5 [API Service Layer](#25-api-service)
   - 2.6 [Every Page Explained](#26-pages)
   - 2.7 [Design System (CSS Variables)](#27-design-system)
3. [Backend — The Server & Database](#3-backend)
   - 3.1 [Stack & Folder Structure](#31-backend-stack)
   - 3.2 [Request Lifecycle (4 Layers)](#32-request-lifecycle)
   - 3.3 [Models (Database Schema)](#33-models)
   - 3.4 [Controllers (Business Logic)](#34-controllers)
   - 3.5 [Routes (URL Mapping)](#35-routes)
   - 3.6 [Auth Middleware (Security)](#36-auth-middleware)
   - 3.7 [Seed Data](#37-seed-data)
4. [Frontend ↔ Backend Connection](#4-connection)
   - 4.1 [How They Talk (HTTP + JSON + JWT)](#41-how-they-talk)
   - 4.2 [Full Request Trace (Login → Dashboard)](#42-full-trace)
   - 4.3 [Auth Flow (Login → Token → Protected Requests)](#43-auth-flow)
   - 4.4 [Course Filtering by Instructor](#44-course-filtering)
5. [Attendance Feature — Current State](#5-attendance)
6. [Quick Reference](#6-quick-reference)

---

<a name="1-big-picture"></a>
## 1. 🖼️ Big Picture — How It All Fits Together

This is a **College ERP (Enterprise Resource Planning) Portal** — a web app where students and teachers can manage courses, assignments, marks, and attendance.

The project has two parts that work together:

```
┌──────────────────────────────────────────────────────────────┐
│                         BROWSER                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  🖥️ FRONTEND (React + Vite)                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │    │
│  │  │  Login   │  │Dashboard │  │ Courses  │  ...pages  │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘           │    │
│  │       └──────────────┼──────────────┘                │    │
│  │                      │                               │    │
│  │  ┌───────────────────▼──────────────────────────┐    │    │
│  │  │  services/api.js  (the 📞 telephone)         │    │    │
│  │  │  Every call goes through here — auto-attaches│    │    │
│  │  │  the JWT token so backend knows who you are  │    │    │
│  │  └───────────────────┬──────────────────────────┘    │    │
│  └──────────────────────┼──────────────────────────────┘    │
└─────────────────────────┼──────────────────────────────────┘
                          │  HTTP requests (fetch API)
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  🖧 BACKEND (Node.js + Express) — runs on port 9000          │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Routes  │→ │  Middleware  │→ │  Controllers          │   │
│  │ (URL map)│  │ (auth check) │  │ (business logic)      │   │
│  └──────────┘  └──────────────┘  └──────────┬───────────┘   │
│                                             │               │
│                                   ┌─────────▼──────────┐    │
│                                   │  Models (Mongoose)  │    │
│                                   │  (data blueprints)  │    │
│                                   └─────────┬──────────┘    │
│                                             │               │
│                                   ┌─────────▼──────────┐    │
│                                   │  🗄️ MongoDB        │    │
│                                   │  (actual database)  │    │
│                                   └────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

**Analogy:** Think of a restaurant.
- **Frontend** = the menu + waiter (what you see and interact with)
- **Backend** = the kitchen (where the real work happens)
- **API calls** = the waiter carrying orders and bringing back food
- **MongoDB** = the pantry/storage (all ingredients stored)

---

<a name="2-frontend"></a>
## 2. 🎨 Frontend — The User Interface

<a name="21-frontend-stack"></a>
### 2.1 Stack & Folder Structure

| Tool | What it does |
|------|-------------|
| **React** | Builds UIs from reusable components (JSX functions) |
| **Vite** | Dev server — instant startup, hot reload on changes |
| **React Router** | Navigation between pages WITHOUT page reload |
| **Redux Toolkit** | Global state (who is logged in) — accessible from any component |
| **Fetch API** | Built-in browser way to call backend HTTP endpoints |

**Folder layout:**

```
frontend/
├── index.html              ← The ONLY HTML file — has <div id="root">
├── vite.config.js          ← Build configuration
├── package.json            ← Dependencies & scripts
│
└── src/
    ├── main.jsx            ← Entry point: mounts React into index.html
    ├── App.jsx             ← Top-level routing + layout (sidebar)
    ├── App.css             ← Component styles + icon system
    ├── index.css           ← Global theme: CSS variables (colors, fonts)
    │
    ├── store/
    │   ├── index.js        ← Redux store configuration
    │   └── authSlice.js    ← Login/logout state + async login thunk
    │
    ├── services/
    │   └── api.js          ← ⭐ EVERY backend call goes through here
    │
    ├── components/         ← Reusable UI pieces (like Lego blocks)
    │   ├── Sidebar.jsx     ← Navigation menu (shown when logged in)
    │   ├── ProtectedRoute.jsx  ← Security gate for pages
    │   └── AttendanceSection/
    │       └── AttendanceSection.css  ← Styles for attendance page
    │
    ├── pages/              ← Full pages (one file per route)
    │   ├── LoginPage.jsx
    │   ├── Dashboard.jsx
    │   ├── Courses.jsx
    │   ├── Assignments.jsx
    │   ├── AssignmentDetail.jsx
    │   ├── Marks.jsx
    │   ├── Manage.jsx          ← Teacher-only console
    │   ├── StudentProfile.jsx
    │   ├── FacultyProfile.jsx
    │   └── AttendanceSection.jsx  ← Attendance page
    │
    └── data/               ← Static lookup lists
        ├── fieldOfStudyList.js
        └── skillsList.js
```

<a name="22-boot-sequence"></a>
### 2.2 Boot Sequence (How the App Starts)

```
1. Browser loads index.html
       ↓
   Finds: <div id="root"></div> (empty container)
   Finds: <script src="/src/main.jsx"> (the React code)
       ↓
2. main.jsx runs:
   createRoot(document.getElementById('root')).render(
     <Provider store={store}>    ← makes Redux available everywhere
       <App />
     </Provider>
   )
       ↓
3. App.jsx renders:
   - Checks if user is logged in (reads from Redux)
   - Shows Sidebar + Layout if logged in
   - React Router looks at the URL → picks which page to show
```

<a name="23-routing"></a>
### 2.3 Routing & Page Protection (`App.jsx` + `ProtectedRoute.jsx`)

**App.jsx** sets up all the routes:

```jsx
<Router>
  <Layout>                     ← Shows sidebar when logged in
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* These pages require login: */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/courses"   element={<ProtectedRoute><Courses /></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
      <Route path="/assignments/:id" element={<ProtectedRoute><AssignmentDetail /></ProtectedRoute>} />
      <Route path="/marks"     element={<ProtectedRoute><Marks /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><AttendanceSection /></ProtectedRoute>} />

      {/* Teacher-only page: */}
      <Route path="/manage" element={<ProtectedRoute roles={["teacher","superadmin"]}><Manage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />  ← 404 → login
    </Routes>
  </Layout>
</Router>
```

**ProtectedRoute.jsx** — the security gate:

| Scenario | What happens |
|----------|-------------|
| Not logged in | Redirected to `/` (login page) |
| Logged in, no `roles` prop | Page is shown |
| Logged in, wrong role | Redirected to `/dashboard` |
| Logged in, correct role | Page is shown |

So `/manage` is only accessible to teachers and superadmins, while `/attendance` is accessible to **any** logged-in user (students AND teachers).

<a name="24-redux"></a>
### 2.4 State Management with Redux

Redux holds **global state** — data that many components need (like "who is logged in").

```
store/index.js
  └── configureStore({
        reducer: {
          auth: authReducer    ← one "slice" for authentication
        }
      })

store/authSlice.js
  ├── initialState: { user, status, error }
  │     - user: read from localStorage (survives refresh!)
  │     - status: "idle" | "loading" | "succeeded" | "failed"
  │     - error: error message if login failed
  │
  ├── reducers (synchronous):
  │     - logout() → clears user + token
  │     - clearError() → clears error message
  │
  ├── extraReducers (async — the login thunk):
  │     - loginUser.pending → status = "loading"
  │     - loginUser.fulfilled → user = payload, status = "succeeded"
  │     - loginUser.rejected → error = payload, status = "failed"
  │
  └── selectors (how components READ the data):
        - selectUser        → the user object
        - selectRole        → user's role ("student" | "teacher" | "superadmin")
        - selectIsAuthed    → boolean (true if logged in)
        - selectAuthStatus  → "idle" | "loading" | ...
        - selectAuthError   → error string or null
```

**How components use Redux:**

```jsx
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectRole, loginUser, logout } from '../store/authSlice';

function MyComponent() {
  const user = useSelector(selectUser);     // READ the user
  const role = useSelector(selectRole);     // READ the role
  const dispatch = useDispatch();           // SEND actions

  // Trigger login:
  dispatch(loginUser({ phoneNumber: '...', password: '...' }));

  // Trigger logout:
  dispatch(logout());
}
```

<a name="25-api-service"></a>
### 2.5 API Service Layer (`services/api.js`)

This is the **single file** through which all frontend-to-backend communication flows. Think of it as the company phonebook.

**How it works:**

```
callApi(endpoint, options)
  │
  ├── Reads JWT token from localStorage
  ├── Sets Content-Type: application/json
  ├── Sets Authorization: Bearer <token>   ← 🔑 THIS is how backend knows who you are
  ├── Calls fetch(BASE_URL + endpoint, ...)
  ├── If response not OK → throws error with backend's error message
  └── Returns parsed JSON data
```

**Grouped exports** (mirror backend route prefixes):

| Export | Backend Base | Example calls |
|--------|-------------|--------------|
| `userApi` | `/user` | `login()`, `register()`, `me()`, `adminCreateUser()`, `getStudents()` |
| `courseApi` | `/course` | `getAllCourses()`, `getCourseById()`, `addCourse()`, `enrollStudent()`, `getStudents()` |
| `assignmentApi` | `/assignments` | `getAllAssignments()`, `getByCourse()`, `getAssignmentById()`, `addAssignment()`, `reuse()` |
| `questionApi` | `/questions` | `getAll()`, `add()` |
| `submissionApi` | `/submissions` | `submit()`, `getByStudent()`, `getByAssignment()`, `gradeManual()` |
| `marksApi` | `/marks` | `getMarksByStudent()`, `getAllMarks()` |
| `profileApi` | `/api/profile` | `getProfile()`, `updateProfile()`, `changePassword()`, `uploadImage()` |

**The BASE_URL** is hardcoded as `http://localhost:9000` — the backend must be running on port 9000.

<a name="26-pages"></a>
### 2.6 Every Page Explained

#### 🔑 `LoginPage.jsx` — The Sign-in Form

```
User types phone number + password
       ↓
dispatch(loginUser({ phoneNumber, password }))
       ↓
userApi.login() → POST /user/login
       ↓
Backend verifies (bcrypt compare)
       ↓
Login succeeds → navigate("/dashboard")
Login fails → show error message
```

Three states handled: **loading** (button says "Signing in..."), **error** (red message), **success** (redirect).

#### 📊 `Dashboard.jsx` — The Home Page

**TWO modes based on user role:**

| Feature | Student View | Teacher View |
|---------|-------------|-------------|
| Courses shown | All courses | Only courses where `instructor` matches the logged-in teacher's ID |
| Stats | Courses, Assignments, Overall Marks %, Email | My Courses, Assignments, Submissions, Email |
| Quick links | View Courses, View Assignments, Check Marks, Attendance | My Courses, Assignments, Student Marks |
| Extra section | Recent Marks (last 5) | Courses You Teach (with student counts) |

**How it fetches data (on page load):**
```jsx
useEffect(() => {
  const [coursesData, assignmentsData] = await Promise.all([
    courseApi.getAllCourses(),       // GET /course/getAllCourses
    assignmentApi.getAllAssignments(), // GET /assignments/getAllAssignments
  ]);
  marksData = await marksApi.getMarksByStudent(user._id);  // GET /marks/getMarksByStudent
}, []);
```

**Course filtering (teacher view):**
```jsx
const displayedCourses = viewMode === "teacher"
  ? courses.filter(c => c.instructor === user._id || c.instructor?._id === user._id)
  : courses;
```
This is a **client-side filter** — it fetches ALL courses and then filters by instructor ID. ⚠️ Not ideal for scale but works for now.

#### 📚 `Courses.jsx` — Course Catalog

Fetches all courses from backend. Shows them as cards in a grid. Simple fetch → display pattern.

#### 📝 `Assignments.jsx` — Assignment List

Fetches all assignments. Shows each as a row with:
- Color-coded type indicator (Homework=green, Project=orange, Quiz=blue, Exam=red)
- Topic tags
- Due date
- Question count badge

**Clicking** an assignment navigates to `/assignments/:id` → `AssignmentDetail.jsx`.

#### 🔍 `AssignmentDetail.jsx` — Take/Grade Assignment

- **Students**: See questions, write answers, submit. If already submitted, shows submitted status.
- **Teachers**: See questions read-only.
- **Question types supported**: MCQ, True/False, Short answer, Long answer, Code.

#### 📈 `Marks.jsx` — The Report Card

- Shows overall percentage (color-coded: green/orange/yellow/red)
- Shows total marks across all exams
- Shows a table with per-exam breakdown

#### 🛠️ `Manage.jsx` — Teacher Console (staff only)

Five tabs:
1. **Courses** — Create new courses
2. **Questions** — Add to shared question bank, filter/search existing questions
3. **Assignments** — Create assignments with questions, **reuse** others' assignments
4. **Students** — View roster, enroll students
5. **Grading** — View submissions per assignment, award marks per question

#### 👤 `StudentProfile.jsx` / `FacultyProfile.jsx`

Profile pages showing detailed user info (academic details, skills, projects, etc.). Use the `profileApi` to fetch/update data.

#### 📋 `AttendanceSection.jsx` — Attendance (Frontend-Only)

> ⚠️ **This page uses HARDCODED sample data.** See Section 5 for details.

<a name="27-design-system"></a>
### 2.7 Design System (CSS Variables)

Defined in `index.css` under `:root`. Key variables:

| Variable | What it controls |
|----------|-----------------|
| `--primary-600` | Main button/link color (indigo #4F46E5) |
| `--violet-500` | Gradient accent |
| `--amber-500` | Highlight/CTA color |
| `--success` / `--danger` | Green / Red semantics |
| `--bg` | Page background (#F4F5FB) |
| `--card` | Card background (white) |
| `--ink` / `--muted` | Text colors |
| `--line` | Border color |
| `--r` / `--r-lg` | Border radius (12px / 16px) |
| `--shadow-sm` / `--shadow` | Box shadows |
| `--font-display` | Plus Jakarta Sans (headings) |
| `--font-sans` | Inter (body text) |

**Icons** are defined as CSS masks in `App.css` (no image files needed):
```css
--ic-dashboard: url("data:image/svg+xml,...");
--ic-book: url("data:image/svg+xml,...");
--ic-clipboard: url("data:image/svg+xml,...");
```

---

<a name="3-backend"></a>
## 3. 🧠 Backend — The Server & Database

<a name="31-backend-stack"></a>
### 3.1 Stack & Folder Structure

| Tool | What it does |
|------|-------------|
| **Node.js** | Runs JavaScript on the server (not a browser) |
| **Express** | Web framework — routing, middleware, HTTP handling |
| **MongoDB** | NoSQL database — stores data as JSON-like documents |
| **Mongoose** | ODM (Object Data Modeling) — schemas, validation, queries |
| **bcryptjs** | Password hashing — never stores plain text passwords |
| **jsonwebtoken (JWT)** | Secure login tokens |
| **dotenv** | Loads secrets (DB URI, JWT secret) from `.env` file |
| **cors** | Allows frontend (different port) to call backend |

```
backend/
├── server.js              ← 🚀 Entry point (the engine)
├── seed.js                ← 🌱 Fills database with demo data
├── .env.example           ← Template for your secrets
│
├── middleware/
│   └── auth.js            ← 🛡️ Authenticate (JWT) + Authorize (role)
│
├── models/                ← 📐 Database schemas (blueprints)
│   ├── User.model.js
│   ├── Courses.model.js
│   ├── Question.model.js
│   ├── assignments.model.js
│   ├── Submission.model.js
│   ├── Marks.model.js
│   └── Profile.model.js
│
├── controllers/           ← 👷 Business logic functions
│   ├── authController.js
│   ├── users.controllers.js
│   ├── courses.controllers.js
│   ├── questionController.js
│   ├── assignmentController.js
│   ├── submissionController.js
│   ├── marksController.js
│   ├── profileController.js
│   └── attendanceController.js  ← ⚠️ EMPTY (not implemented)
│
└── routes/                ← 📇 URL address book
    ├── userRoutes.js
    ├── courseRoutes.js
    ├── questionRoutes.js
    ├── assignmentsRoutes.js
    ├── submissionRoutes.js
    ├── marksRoutes.js
    └── profileRoutes.js
```

<a name="32-request-lifecycle"></a>
### 3.2 Request Lifecycle (4 Layers)

Every backend request flows through exactly 4 layers:

```
HTTP Request arrives at server.js (port 9000)
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│  LAYER 1: App-wide Middleware (server.js)                 │
│  ├── cors() — allows cross-origin requests                │
│  └── express.json() — parses JSON body into req.body      │
└────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│  LAYER 2: Routes (URL mapping)                           │
│  Example: GET /course/getAllCourses                       │
│  → Matches the /course router in courseRoutes.js          │
│  → Route says: [authenticate] → getAllCourses controller  │
└────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│  LAYER 3: Middleware (auth guards)                        │
│  authenticate → checks JWT token                          │
│  authorize("teacher") → checks user role                  │
│  If either fails → sends 401/403 response immediately     │
└────────────────────────────────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────────────────────────┐
│  LAYER 4: Controller (business logic)                     │
│  1. Read input from req.body / req.query / req.params     │
│  2. Validate required fields                              │
│  3. Use Mongoose model to query DB                        │
│  4. Send response: res.json(data) or res.status(400)      │
└────────────────────────────────────────────────────────────┘
```

<a name="33-models"></a>
### 3.3 Models (Database Schema)

**There are 7 collections in MongoDB:**

#### 👤 `User` — Everyone in the system
```
{
  name: "Prof. Rao",
  email: "rao@x.co",
  password: "$2a$10$...",       ← bcrypt hashed, never plain text
  phoneNumber: 9000000001,       ← Used for LOGIN
  role: "teacher",               ← "student" | "teacher" | "superadmin"
  enrolledCourses: [ObjectId]    ← Courses the student takes (for students)
}
```

#### 📚 `courses` — Subjects offered
```
{
  CourseName: "Data Structures & Algorithms",
  CourseCode: "CS201",
  description: "Arrays, trees, graphs...",
  credits: 4,
  semester: "Fall 2026",
  instructor: ObjectId → User,        ← ⭐ The teacher who OWNS this course
  enrolledStudents: [ObjectId → User] ← Students taking this course
}
```

#### ❓ `questions` — Reusable question bank
```
{
  text: "Time complexity of binary search?",
  questionType: "mcq",               ← "mcq" | "truefalse" | "short" | "long" | "code"
  options: ["O(1)", "O(log n)", ...],
  correctAnswer: "O(log n)",
  marks: 2,
  topic: "Complexity",
  difficulty: "easy",                ← "easy" | "medium" | "hard"
  createdBy: ObjectId → User         ← The teacher who wrote it
}
```

#### 📝 `assignments` — Homework/Quiz/Exam
```
{
  assignmentName: "Week 1 — Complexity & Basics",
  assignmentType: "Homework",        ← "Homework" | "Quiz" | "Project" | "Exam"
  assignmentTopics: ["Complexity", "DS Basics"],
  courseId: ObjectId → courses,      ← Which course this belongs to
  questions: [ObjectId → questions], ← Questions in this assignment
  totalMarks: 9,                     ← Auto-calculated from questions
  dueOn: Date,
  createdBy: ObjectId → User         ← Teacher who created it
}
```

#### 📄 `submissions` — Student's answers
```
{
  assignmentId: ObjectId → assignments,
  studentId: ObjectId → User,
  answers: [
    { questionId: ObjectId, answer: "O(log n)", awarded: 2 }  ← awarded set when graded
  ],
  status: "graded",                  ← "submitted" | "graded"
  marksAwarded: 4                    ← Total marks earned
}
```

#### 📊 `marks` — Grade book
```
{
  studentId: ObjectId → User,
  courseId: ObjectId → courses,
  courseName: "Data Structures & Algorithms",
  marksObtained: 82,
  totalMarks: 100,
  examType: "Midterm",
  semester: "Fall 2026"
}
```

#### 👤 `profiles` — Extended user details
```
{
  userId: ObjectId → User,
  studentId: "CS21001",
  department: "Computer Science",
  course: "B.Tech",
  branch: "CSE",
  year: "3rd",
  gender: "Female",
  dateOfBirth: "2003-05-15",
  currentAddress: "...",
  fatherName: "...",
  skills: ["Python", "React"],
  projects: [...],
  education: [...],
  profileImage: "/uploads/profile-images/..."
}
```

**Relationship diagram:**

```
User (teacher) ──instructor──►  courses  ◄──courseId── asignments ──questions[]──► Question
                                  │                            │
                                  │ enrolledStudents[]         │ assignmentId
                                  ▼                            ▼
                             User (student)              submissions
                                  │                            │
                                  │ studentId                  │ studentId
                                  ▼                            ▼
                              marks                      User (student)
```

<a name="34-controllers"></a>
### 3.4 Controllers (Business Logic)

Each controller is a function that receives `(req, res)`:

| Controller | Key Functions | What it does |
|-----------|--------------|-------------|
| `authController.js` | `register`, `login`, `me`, `adminCreateUser` | Authentication — issues JWTs |
| `users.controllers.js` | `addUser`, `getUser`, `addUsers`, `getStudents` | User CRUD |
| `courses.controllers.js` | `addCourse`, `getAllCourses`, `getCourseById`, `enrollStudent`, `getCourseStudents` | Course CRUD + enrollment |
| `questionController.js` | `addQuestion`, `getAllQuestions`, `getQuestionById`, `deleteQuestion` | Shared question bank |
| `assignmentController.js` | `addAssignment`, `addQuestionsToAssignment`, `getAllAssignments`, `getAssignmentById`, `reuseAssignment` | Assignment CRUD + reuse |
| `submissionController.js` | `submitAssignment`, `getSubmissionsByStudent`, `getSubmissionsByAssignment`, `gradeSubmission`, `gradeManual` | Student submissions + auto/rubric grading |
| `marksController.js` | `addMarks`, `getMarksByStudent`, `getAllMarks` | Grade book |
| `profileController.js` | `getProfile`, `updateProfile`, `changePassword`, `uploadImage` | User profile management |
| `attendanceController.js` | — | ⚠️ EMPTY — NOT IMPLEMENTED |

<a name="35-routes"></a>
### 3.5 Routes (URL Mapping)

Routes connect a URL path to a controller function, with auth guards in between.

**server.js** mounts routers under prefixes:
```js
app.use('/user', userRoutes);        // Everything starting with /user
app.use('/course', courseRoutes);    // Everything starting with /course
app.use('/assignments', assignmentsRoutes);
app.use('/marks', marksRoutes);
app.use('/questions', questionRoutes);
app.use('/submissions', submissionRoutes);
```

**Route guard patterns used:**

| Pattern | Meaning |
|---------|---------|
| `authenticate` | Any logged-in user can access |
| `authorize("teacher", "superadmin")` | Only teachers and superadmins |
| `authorize("superadmin")` | Only superadmins |
| No guards | ⚠️ Public (anyone can access) |

**Full route table:**

| Method | Path | Auth | Controller | Purpose |
|--------|------|------|-----------|---------|
| POST | /user/register | Public | `register` | Self-signup (student only) |
| POST | /user/login | Public | `login` | Get JWT token |
| GET | /user/me | authenticate | `me` | Current user from token |
| POST | /user/adminCreateUser | superadmin | `adminCreateUser` | Create teacher/admin |
| GET | /user/students | teacher+ | `getStudents` | All students |
| GET | /course/getAllCourses | authenticate | `getAllCourses` | All courses |
| POST | /course/addCourse | teacher+ | `addCourse` | Create course |
| POST | /course/enrollStudent | teacher+ | `enrollStudent` | Enroll student in course |
| GET | /course/getStudents | teacher+ | `getCourseStudents` | Roster for a course |
| GET | /assignments/getAllAssignments | authenticate | `getAllAssignments` | All assignments |
| GET | /assignments/getAssignmentById | authenticate | `getAssignmentById` | One assignment + questions |
| POST | /assignments/addAssignment | teacher+ | `addAssignment` | Create assignment |
| POST | /assignments/reuse | teacher+ | `reuseAssignment` | Clone assignment |
| GET | /questions/getAllQuestions | authenticate | `getAllQuestions` | Search question bank |
| POST | /questions/addQuestion | teacher+ | `addQuestion` | Add to question bank |
| POST | /submissions/submit | authenticate | `submitAssignment` | Submit answers |
| POST | /submissions/grade | teacher+ | `gradeSubmission` | Auto-grade |
| POST | /submissions/gradeManual | teacher+ | `gradeManual` | Rubric-grade |
| GET | /marks/getMarksByStudent | authenticate | `getMarksByStudent` | Student's marks |
| GET | /marks/getAllMarks | teacher+ | `getAllMarks` | All marks (gradebook) |
| POST | /marks/addMarks | teacher+ | `addMarks` | Record marks |

<a name="36-auth-middleware"></a>
### 3.6 Auth Middleware (Security)

`middleware/auth.js` provides two guards:

**`authenticate(req, res, next)`**
```
1. Reads Authorization header: "Bearer <token>"
2. Verifies token with jwt.verify(token, JWT_SECRET)
3. Sets req.user = { id, role }  ← This is how controllers know WHO is calling
4. Calls next() to proceed
```

**`authorize(...allowedRoles)`**
```
1. Checks if req.user.role is in the allowed list
2. If yes → next()
3. If no → 403 Forbidden
```

**Note on `questionRoutes.js` and `submissionRoutes.js`:** These files currently have their auth middleware commented out/removed. The routes work without authentication.

<a name="37-seed-data"></a>
### 3.7 Seed Data (`seed.js`)

Running `npm run seed` populates the database with:

| Data | Count | Details |
|------|-------|---------|
| superadmin | 1 | Dr. Admin (phone: 9000000000, pass: admin) |
| teachers | 2 | Prof. Rao (CS201, CS305), Prof. Mehta (CS304, CS410) |
| students | 3 | Aria, Bilal, Chitra (pass: demo) |
| courses | 4 | DSA, DBMS, OS, ML (each assigned to a teacher) |
| questions | 8 | Mix of MCQ, true/false, short, long, code |
| assignments | 3 | One per course (DSA, DBMS, OS) |
| submissions | 1 | Aria's graded submission for DSA homework |
| marks rows | 5 | Various students with marks |

**Login credentials:**
```
superadmin  9000000000  admin
teacher     9000000001  teach    (Prof. Rao)
teacher     9000000002  teach    (Prof. Mehta)
student     9999999001  demo     (Aria)
student     9999999002  demo     (Bilal)
student     9999999003  demo     (Chitra)
```

**Course ownership:**
```
Prof. Rao (9000000001) → CS201 (DSA), CS305 (OS)
Prof. Mehta (9000000002) → CS304 (DBMS), CS410 (ML)
```

---

<a name="4-connection"></a>
## 4. 🔗 Frontend ↔ Backend Connection

<a name="41-how-they-talk"></a>
### 4.1 How They Talk (HTTP + JSON + JWT)

```
┌─────────────────────┐                    ┌─────────────────────┐
│     FRONTEND        │                    │      BACKEND        │
│  (port 5173)        │    HTTP Request    │   (port 9000)       │
│                     │ ──────────────────►│                     │
│  services/api.js    │   GET /course/     │  server.js receives  │
│  callApi()          │   getAllCourses    │  → routes → auth    │
│                     │   Authorization:   │  → controller → DB  │
│                     │   Bearer <JWT>     │                     │
│                     │◄──────────────────│                     │
│                     │    HTTP Response   │                     │
│  Page re-renders    │    JSON [courses]  │  Course.find()      │
│  with new data      │                    │  → res.json(data)   │
└─────────────────────┘                    └─────────────────────┘
```

**Key points:**
- Frontend runs on `localhost:5173`, backend on `localhost:9000`
- All data is sent as **JSON** (JavaScript Object Notation)
- **JWT token** is stored in `localStorage` and sent as `Authorization: Bearer <token>`
- Backend validates the token on every protected request
- **CORS** (configured on backend with `app.use(cors())`) allows the browser to accept responses from a different port

<a name="42-full-trace"></a>
### 4.2 Full Request Trace (Login → Dashboard)

Let's trace what happens when a user logs in and sees the dashboard:

```
STEP 1: User types phone + password on LoginPage
        ↓
STEP 2: dispatch(loginUser({ phoneNumber: "9999999001", password: "demo" }))
        ↓
STEP 3: userApi.login() calls:
        fetch("http://localhost:9000/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber: "9999999001", password: "demo" })
        })
        ↓
STEP 4: server.js receives POST /user/login
        ↓
STEP 5: userRoutes → login controller (authController.js)
        ↓
STEP 6: login() function:
        a. User.findOne({ phoneNumber: "9999999001" })  ← Search MongoDB
        b. user.comparePassword("demo")  ← bcrypt comparison
        c. jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" })
        d. res.json({ token: "eyJ...", user: { _id, name, email, role, ... } })
        ↓
STEP 7: Frontend receives { token, user }
        a. setToken(token) → localStorage
        b. localStorage.setItem("user", JSON.stringify(user))
        c. Redux state updates: user = { ... }
        ↓
STEP 8: LoginPage sees loginUser.fulfilled → navigate("/dashboard")
        ↓
STEP 9: Dashboard component mounts → useEffect runs:
        ↓
STEP 10: courseApi.getAllCourses() calls:
         fetch("http://localhost:9000/course/getAllCourses", {
           headers: { Authorization: "Bearer eyJ..." }  ← 🔑 Token auto-attached!
         })
         ↓
STEP 11: server.js → courseRoutes → authenticate middleware:
         a. Reads token from Authorization header
         b. jwt.verify(token, JWT_SECRET) → { id, role }
         c. Sets req.user = { id: "...", role: "student" }
         d. Calls next()
         ↓
STEP 12: getAllCourses controller:
         a. Course.find() → gets all courses from MongoDB
         b. res.json([{ CourseName: "DSA", ... }, { CourseName: "DBMS", ... }])
         ↓
STEP 13: Dashboard receives JSON array → sets state
         ↓
STEP 14: React re-renders → shows course count, assignment count, etc.
```

<a name="43-auth-flow"></a>
### 4.3 Auth Flow (Login → Token → Protected Requests)

```
                         LOGIN
                    ┌─────────────────────┐
                    │  User sends phone + │
                    │  password to backend │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Backend verifies   │
                    │  via bcrypt.compare │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Backend generates  │
                    │  JWT token:         │
                    │  jwt.sign({ id,     │
                    │    role }, secret)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Returns to frontend│
                    │  { token, user }    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Frontend stores:   │
                    │  • Token in         │
                    │    localStorage     │
                    │  • User in Redux +  │
                    │    localStorage     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Refresh page?      │
                    │  authSlice reads    │
                    │  user from          │
                    │  localStorage →     │
                    │  still logged in!   │
                    └──────────┬──────────┘
                               │
                         PROTECTED REQUEST
                    ┌─────────────────────┐
                    │  Frontend calls     │
                    │  GET /course/       │
                    │  getAllCourses      │
                    │                     │
                    │  callApi() auto-    │
                    │  attaches:          │
                    │  Authorization:     │
                    │  Bearer eyJ...      │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Backend:           │
                    │  authenticate       │
                    │  middleware:        │
                    │  jwt.verify(token)  │
                    │  → sets req.user   │
                    │  → calls next()    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Controller runs    │
                    │  req.user.id tells  │
                    │  who is calling     │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Returns data       │
                    │  (or 401 if token   │
                    │   expired/invalid)  │
                    └─────────────────────┘
```

<a name="44-course-filtering"></a>
### 4.4 Course Filtering by Instructor

This is the pattern used to restrict what a teacher sees. Currently implemented only in the **Dashboard** (not in the attendance page):

**Frontend (`Dashboard.jsx` line ~69):**
```jsx
const displayedCourses = viewMode === "teacher" && user?._id
  ? courses.filter(c => c.instructor === user._id || c.instructor?._id === user._id)
  : courses;
```

**The filter works because:**
1. Every course in MongoDB has an `instructor` field (ObjectId referencing a User)
2. Seed data correctly assigns courses to teachers:
   - Prof. Rao → CS201 (DSA), CS305 (OS)
   - Prof. Mehta → CS304 (DBMS), CS410 (ML)
3. The frontend fetches ALL courses and then filters client-side

**To replicate this pattern elsewhere, you would need:**
- A backend endpoint that returns courses filtered by instructor ID, OR
- Client-side filtering (like the dashboard does)

---

<a name="5-attendance"></a>
## 5. 📋 Attendance Feature — Current State

### What exists:

| File | Contents |
|------|----------|
| `frontend/src/pages/AttendanceSection.jsx` | ✅ Full UI with two views |
| `frontend/src/components/AttendanceSection/AttendanceSection.css` | ✅ Premium styling |
| `frontend/src/App.jsx` | ✅ Route for `/attendance` |
| `frontend/src/components/Sidebar.jsx` | ✅ Nav link shown to all users |
| `backend/controllers/attendanceController.js` | ⚠️ **EMPTY FILE** |
| `backend/server.js` | ❌ No attendance routes mounted |

### Student View:
- Shows 6 hardcoded subjects with progress rings (SVG circles)
- Shows overall attendance percentage with a colored status bar
- Uses **hardcoded sample data** — never calls the backend

### Teacher View:
- Shows 4 hardcoded courses in a dropdown
- Shows 8 hardcoded students as a roster
- Has mark-all-present/absent buttons and submit functionality
- Uses **hardcoded sample data** — never calls the backend

### What's missing for teacher-specific course filtering:

| Requirement | Status |
|------------|--------|
| Backend attendance routes | ❌ Not created (controller is empty) |
| Backend attendance model/collection | ❌ Not created |
| Backend endpoint to fetch teacher's courses | ✅ Exists (`GET /course/getAllCourses` — fetches ALL courses) |
| Backend endpoint to fetch courses filtered by teacher ID | ❌ Not created |
| Frontend filtering by instructor (client-side) | ✅ Possible but not done for attendance — the hardcoded `teacherCourses` is used instead |
| Fetching actual students from a course's roster | ✅ `GET /course/getStudents?courseId=...` exists! |

In other words: the **attendance page is entirely self-contained with fake data**. It does not connect to any backend endpoint. This is why every teacher currently sees all 4 hardcoded courses.

---

<a name="6-quick-reference"></a>
## 6. ⚡ Quick Reference

### How to run the project:

```bash
# Terminal 1: Backend
cd backend
npm install
cp .env.example .env     # Paste your MongoDB URI
npm run seed             # Fill DB with demo data
npm start                # Starts on http://localhost:9000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev              # Starts on http://localhost:5173
```

### URL map:

| URL | Page | Requires |
|-----|------|----------|
| `/` | Login | Nothing |
| `/dashboard` | Home | Login |
| `/courses` | Course catalog | Login |
| `/assignments` | Assignment list | Login |
| `/assignments/:id` | Take/view assignment | Login |
| `/marks` | Report card | Login |
| `/attendance` | Attendance | Login |
| `/manage` | Teacher Console | Teacher/Superadmin |

### How data flows (the pattern):

```
1. User does something (clicks, types, navigates)
       ↓
2. Page calls an API function (e.g. courseApi.getAllCourses())
       ↓
3. api.js sends HTTP request to backend with JWT
       ↓
4. Backend route → middleware → controller → MongoDB
       ↓
5. Backend sends JSON response
       ↓
6. Page receives data → updates state → re-renders UI
```

### Three states every page should handle:

```jsx
if (loading) return <Spinner />;
if (error)   return <ErrorMessage />;
if (!data.length) return <EmptyState />;
return <RenderList data={data} />;
```

### Key backend endpoints for course/student lookup:

| Endpoint | Returns | Auth |
|----------|---------|------|
| `GET /course/getAllCourses` | All courses (with instructor IDs) | Any login |
| `GET /course/getStudents?courseId=xxx` | Students enrolled in a course | Teacher+ |
| `GET /user/students` | All students in system | Teacher+ |
| `GET /user/me` | Current user from JWT token | Any login |
