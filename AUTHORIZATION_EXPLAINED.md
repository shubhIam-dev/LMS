# 🛡️ Authorization Explained (From Zero)

## What Even Is Authorization?

Imagine a **college building**:

- **Anyone** can walk into the **library** (read/catalog browsing)
- Only **teachers** can enter the **staff room** (create assignments, manage courses)
- Only the **principal (superadmin)** can access the **admin office** (create teacher accounts)

**Authorization** is just that — checking "who are you and what are you allowed to do?"

---

## The 3 Files That Make It Work

There are **3 files** working together:

```
backend/
├── middleware/
│   └── auth.js          ← The BOUNCER (checks your ID card)
├── controllers/
│   ├── assignmentController.js
│   ├── courses.controllers.js
│   └── questionController.js
└── routes/
    ├── assignmentsRoutes.js    ← The DOOR (routes decide who enters)
    ├── courseRoutes.js         ← The DOOR
    └── questionRoutes.js       ← The DOOR
```

---

## Step 1: The ID Card (JWT Token)

When a user **logs in**, the server gives them a **digital ID card** called a **JWT Token**.

Look at `backend/controllers/authController.js`:

```js
// When you login successfully:
jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
```

This creates a token that contains:
```json
{
  "id": "abc123...",        // Who you are (your database ID)
  "role": "student"         // What you are allowed to do
}
```

> ⏰ This ID card expires after **7 days** — then you need to login again.

**The 3 roles:**
| Role | What it means |
|------|---------------|
| `"student"` | Can **view** things (courses, assignments, marks) |
| `"teacher"` | Can **create/edit/delete** things AND view things |
| `"superadmin"` | Can do EVERYTHING a teacher can + create other teachers |

> 📌 When you register (`POST /user/register`), your role is automatically set to `"student"`. Only a `superadmin` can create teacher accounts.

---

## Step 2: The Bouncer (auth.js middleware)

File: `backend/middleware/auth.js`

There are **2 bouncers**:

### Bouncer #1: `authenticate` — "Do you have an ID card?"

```js
function authenticate(req, res, next) {
    // 1. Take the token from the HTTP header
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    // 2. If no token → REJECT (401)
    if (!token) {
        return res.status(401).json({ msg: "Not authenticated — no token provided" });
    }

    // 3. Verify the token using the secret key
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        // 4. If valid → attach user info to req.user
        req.user = { id: payload.id, role: payload.role };
        next();  // ✅ Let them through!
    } catch {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
}
```

**In simple words:**
1. Client sends: `Authorization: Bearer <token>`
2. Server checks if the token is valid (not fake, not expired)
3. If valid → `req.user` gets set to `{ id: "...", role: "student" }`
4. If invalid → **401 "go away"**

### Bouncer #2: `authorize("teacher", "superadmin")` — "Are you the right type of person?"

```js
function authorize(...allowedRoles) {
    return (req, res, next) => {
        // 1. Check if authenticate already ran (did we have an ID card?)
        if (!req.user) {
            return res.status(401).json({ msg: "Not authenticated" });
        }
        // 2. Check if the user's role matches allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                msg: `Forbidden — this action requires role: ${allowedRoles.join(" or ")}`
            });
        }
        next();  // ✅ Let them through!
    };
}
```

**In simple words:**
- You called `authorize("teacher", "superadmin")`
- If user's role is `"teacher"` or `"superadmin"` → ✅ Let through
- If user's role is `"student"` → **403 "you don't have permission"**

---

## Step 3: How Routes Use Both Bouncers

File: `backend/routes/assignmentsRoutes.js`

```js
// ANY signed-in user can read assignments (both students & teachers)
router.get('/getAllAssignments', authenticate, getAllAssignments);
router.get('/getByCourse', authenticate, getAssignmentsByCourse);
router.get('/getAssignmentById', authenticate, getAssignmentById);

// ONLY staff can create/edit/delete assignments
const staff = [authenticate, authorize("teacher", "superadmin")];
router.post('/addAssignment', staff, addAssignment);
router.post('/addQuestionsToAssignment', staff, addQuestionsToAssignment);
router.post('/deleteAssignment', staff, deleteAssignment);
router.post('/reuse', staff, reuseAssignment);
router.put('/updateAssignmentById', staff, updateAssignmentById);
```

### What's happening here?

Express routes run middleware **in order**, left to right:

```
router.get('/getAllAssignments', authenticate, getAllAssignments)
                                   ^
                                   |
                             1st middleware runs first
```

So for `GET /assignments/getAllAssignments`:
```
Client sends request → authenticate runs → checks token
    ↓ valid (has ID card)
getAllAssignments controller runs → returns data
    ↓ invalid (no ID card)
Returns 401 "Not authenticated"
```

For `POST /assignments/addAssignment`:
```
Client sends request → authenticate runs → checks token
    ↓ valid
authorize("teacher", "superadmin") runs → checks role
    ↓ role is "teacher" or "superadmin"
addAssignment controller runs
    ↓ role is "student"
Returns 403 "Forbidden"
```

---

## Step 4: The Controllers (What Happens After Authorization Passes)

Once the bouncers let someone through, the controller runs.

### In the Controllers — The `req.user` Object

Remember, `authenticate` attaches `req.user = { id, role }`.

The controllers use `req.user.id` to know **WHO is making the request**:

```js
// assignmentController.js
function addAssignment(req, res) {
    // ...
    const assignment = new Assignment({ 
        ...req.body, 
        createdBy: req.user?.id   // ← "This assignment was created by THIS teacher"
    });
    // ...
}
```

```js
// questionController.js
function addQuestion(req, res) {
    const q = new Question({ 
        ...req.body, 
        createdBy: req.user?.id   // ← "This question was created by THIS teacher"
    });
}
```

> 🧠 This is important because when a teacher later browses questions, they can see WHO created each one. It's like a watermark saying "created by Prof. Sharma".

---

## Complete Flow Example — A Teacher Creates an Assignment

Let's trace **one complete request** from start to finish:

### Step-by-step:

```
                   THE INTERNET
                        │
                 1. POST /assignments/addAssignment
                    Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
                    Body: { "assignmentName": "Midterm", "courseId": "xyz" }
                        │
                        ▼
              ┌─────────────────────┐
              │   express.Router()   │  ← route file
              │                     │
              │  router.post(       │
              │    "/addAssignment", │
              │    staff,            │  ← [authenticate, authorize("teacher","superadmin")]
              │    addAssignment     │  ← controller function
              │  )                   │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │    authenticate()    │
              │                     │
              │  1. Read header     │
              │  2. Extract token    │
              │  3. Verify with JWT  │
              │  4. Decode payload:  │
              │     { id: "...",     │
              │       role:"teacher" }│
              │                     │
              │  ✅ Set req.user =   │
              │     { id, "teacher" }│
              │     Call next()      │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │  authorize("teacher",│
              │    "superadmin")     │
              │                     │
              │  1. Check req.user  │
              │     exists? ✅      │
              │  2. Is "teacher"    │
              │     in ["teacher",  │
              │     "superadmin"]?  │
              │     ✅ YES          │
              │                     │
              │  ✅ Call next()     │
              └─────────────────────┘
                        │
                        ▼
              ┌─────────────────────┐
              │   addAssignment()    │
              │   controller runs    │
              │                     │
              │  - Creates new      │
              │    Assignment doc   │
              │  - Sets createdBy   │
              │    = req.user.id    │
              │  - Saves to DB      │
              │  - Returns 201 ✅   │
              └─────────────────────┘
                        │
                        ▼
              Response: { msg: "Assignment added successfully", assignment: {...} }
```

---

## What If a Student Tries to Create an Assignment?

```
POST /assignments/addAssignment
Authorization: Bearer <student_token>
Body: { "assignmentName": "Hack", "courseId": "abc" }
        │
        ▼
    authenticate() → ✅ Token valid
        │
        ▼
    authorize("teacher", "superadmin") 
        →  req.user.role = "student"
        →  "student" is NOT in ["teacher", "superadmin"]
        →  ❌ RETURNS 403
        │
        ▼
    Response: { 
        "msg": "Forbidden — this action requires role: teacher or superadmin"
    }
```

The **controller never even runs**. The bouncer stops it at the door.

---

## Summary — The 3 Controllers & Their Rules

### 📝 Assignments (`assignmentsRoutes.js`)

| HTTP Method | Route | Who Can Access |
|-------------|-------|----------------|
| GET | `/getAllAssignments` | Any logged-in user (student or teacher) |
| GET | `/getByCourse` | Any logged-in user |
| GET | `/getAssignmentById` | Any logged-in user |
| POST | `/addAssignment` | **Only teacher or superadmin** |
| POST | `/addQuestionsToAssignment` | **Only teacher or superadmin** |
| POST | `/deleteAssignment` | **Only teacher or superadmin** |
| POST | `/reuse` | **Only teacher or superadmin** |
| PUT | `/updateAssignmentById` | **Only teacher or superadmin** |

### 📚 Courses (`courseRoutes.js`)

| HTTP Method | Route | Who Can Access |
|-------------|-------|----------------|
| GET | `/getAllCourses` | Any logged-in user |
| GET | `/getCourseById` | Any logged-in user |
| POST | `/addCourse` | **Only teacher or superadmin** |
| POST | `/addCourses` | **Only teacher or superadmin** |
| POST | `/updateCourseById` | **Only teacher or superadmin** |
| POST | `/deleteCourse` | **Only teacher or superadmin** |
| POST | `/enrollStudent` | **Only teacher or superadmin** |
| GET | `/getStudents` | **Only teacher or superadmin** |

### ❓ Questions (`questionRoutes.js`)

| HTTP Method | Route | Who Can Access |
|-------------|-------|----------------|
| GET | `/getAllQuestions` | Any logged-in user |
| GET | `/getQuestionById` | Any logged-in user |
| POST | `/addQuestion` | **Only teacher or superadmin** |
| POST | `/addQuestions` | **Only teacher or superadmin** |
| POST | `/deleteQuestion` | **Only teacher or superadmin** |

---

## The One Line That Makes It All Work

In every route file, this one line connects everything:

```js
const staff = [authenticate, authorize("teacher", "superadmin")];
```

`authenticate` → who are you?
`authorize("teacher", "superadmin")` → are you the right kind of person?

Together, they say: **"Show your ID, and if you're a teacher or admin, come on in."**

---

## How the Frontend Sends the Token

When a student/teacher logs in:

```js
// Login
POST /user/login { phoneNumber, password }
← Response: { token: "eyJhbGciOiJIUzI1NiIs...", user: { role: "student", ... } }

// Every subsequent request includes the token in the header:
fetch("/assignments/addAssignment", {
    method: "POST",
    headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs...",  // ← THE TOKEN
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ assignmentName: "Midterm", courseId: "xyz" })
})
```

> ❌ If the token is missing/fake/expired → `401 Not authenticated`
> ✅ If the token is valid but wrong role → `403 Forbidden`
> ✅ If the token is valid AND right role → Controller runs successfully

---

## TL;DR (Too Long; Didn't Read)

| Concept | Real-world analogy | Code equivalent |
|---------|-------------------|-----------------|
| **Token** | Your college ID card | JWT with `{ id, role }` |
| **authenticate** | Security guard checks your ID | `jwt.verify(token, SECRET)` |
| **authorize** | "Students can't enter staff room" | Checks `req.user.role` |
| **401** | "You don't have an ID" | No token / invalid token |
| **403** | "Your ID says student, this needs teacher" | Role doesn't match |
| **req.user** | The info the guard writes on a sticky note before letting you through | `{ id: "...", role: "teacher" }` |

**The golden rule:** Route files decide WHO can access WHAT. Controllers just do the actual work. `auth.js` provides the bouncers.
