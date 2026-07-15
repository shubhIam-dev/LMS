# Authentication & Role-Based Authorization

This project has three kinds of user and a real login system. This document
explains how a person proves who they are (**authentication**) and what each
kind of user is allowed to do (**authorization**).

---

## 1. The three roles

Every account is a `User` document with a `role` (see `backend/models/User.model.js`):

| Role         | Who they are                          | In one line                                   |
|--------------|---------------------------------------|-----------------------------------------------|
| `student`    | A learner. The default for signups.   | Views courses/assignments/marks, submits work |
| `teacher`    | Faculty who own courses.              | Creates courses, questions, assignments; grades |
| `superadmin` | The administrator.                    | Everything a teacher can do **plus** manage users |

---

## 2. How authentication works (JWT)

We use **JSON Web Tokens**. The flow:

```
1. User submits phone + password  ──POST /user/login──►  backend
2. Backend looks up the user, compares the password to the stored
   bcrypt HASH (never plain text).
3. On success it signs a JWT that encodes { id, role } and returns
   { token, user }.
4. The frontend stores the token in localStorage and sends it on every
   request:   Authorization: Bearer <token>
5. The `authenticate` middleware verifies the token on protected routes
   and attaches req.user = { id, role }.
```

- **Passwords** are hashed with **bcrypt** in the User model's `pre("save")`
  hook. The hash is never returned in any API response (`toSafeJSON` strips it).
- **Tokens** expire after 7 days.
- The signing secret comes from `JWT_SECRET` in `.env` (a dev fallback exists
  so the app still boots while learning — never rely on it in production).

### Endpoints

| Method + path            | Who        | Purpose                                    |
|--------------------------|------------|--------------------------------------------|
| `POST /user/register`    | public     | Self-signup — always creates a **student** |
| `POST /user/login`       | public     | Returns `{ token, user }`                  |
| `GET  /user/me`          | any signed-in | Re-hydrate the session from the token   |
| `POST /user/adminCreateUser` | superadmin | Create a teacher / superadmin / student |

> Self-registration can only ever create a **student**. Making a teacher or
> superadmin must go through a superadmin — otherwise anyone could grant
> themselves teaching powers.

---

## 3. How authorization works (RBAC)

Two composable middlewares (`backend/middleware/auth.js`):

- `authenticate` — rejects the request (401) unless a valid token is present.
- `authorize(...roles)` — rejects (403) unless `req.user.role` is in the list.

They're chained on a route:

```js
// Only teachers and superadmins may create a course
router.post("/addCourse", authenticate, authorize("teacher", "superadmin"), addCourse)
```

A request with no token → **401**. A student hitting a teacher-only route → **403**.

---

## 4. Permission matrix

"Staff" = `teacher` or `superadmin`. "Any" = any signed-in user.

| Action                                   | Endpoint                                   | Allowed roles |
|------------------------------------------|--------------------------------------------|---------------|
| Register (as student)                    | `POST /user/register`                      | public        |
| Log in                                   | `POST /user/login`                         | public        |
| View own profile                         | `GET /user/me`                             | any           |
| Create teacher / superadmin              | `POST /user/adminCreateUser`               | **superadmin** |
| Bulk-insert users                        | `POST /user/addUsers`                      | **superadmin** |
| Browse courses                           | `GET /course/getAllCourses`, `/getCourseById` | any        |
| Create / edit / delete a course          | `POST /course/addCourse`, `/updateCourseById`, `/deleteCourse`, `/addCourses` | staff |
| Enroll a student in a course             | `POST /course/enrollStudent`               | staff         |
| Browse the question bank                 | `GET /questions/getAllQuestions`, `/getQuestionById` | any |
| Add / delete questions                   | `POST /questions/addQuestion`, `/addQuestions`, `/deleteQuestion` | staff |
| Browse assignments                       | `GET /assignments/getAllAssignments`, `/getByCourse`, `/getAssignmentById` | any |
| Create assignment / attach questions / delete | `POST /assignments/addAssignment`, `/addQuestionsToAssignment`, `/deleteAssignment` | staff |
| Submit an assignment                     | `POST /submissions/submit`                 | any           |
| View own submissions                     | `GET /submissions/getByStudent`            | any           |
| Review everyone's submissions            | `GET /submissions/getByAssignment`         | staff         |
| Grade a submission                       | `POST /submissions/grade`                  | staff         |
| View a student's marks                   | `GET /marks/getMarksByStudent`             | any           |
| Record marks / view whole grade book     | `POST /marks/addMarks`, `GET /marks/getAllMarks` | staff   |

---

## 5. Frontend

- `services/api.js` reads the token from localStorage and adds the
  `Authorization: Bearer …` header to **every** call automatically.
- `store/authSlice.js` — the `loginUser` thunk POSTs to `/user/login`, then
  stores the token + user. `logout` clears both. A `selectRole` selector
  exposes the current role.
- `components/ProtectedRoute.jsx` accepts an optional `roles` prop:
  ```jsx
  <ProtectedRoute roles={["teacher", "superadmin"]}><TeacherPage/></ProtectedRoute>
  ```
  Not logged in → login page. Wrong role → back to the dashboard.
- The sidebar shows the signed-in user's role.

---

## 6. Try it (after `npm run seed`)

The seeder creates one of each role. Log in on the frontend, or via curl:

```bash
# Log in as the superadmin → grab the token
curl -s -X POST http://localhost:9000/user/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":9000000000,"password":"admin"}'

# A student trying a teacher-only action gets 403:
TOKEN=<student token>
curl -i -X POST http://localhost:9000/course/addCourse \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"CourseName":"X","CourseCode":"Y"}'
# → HTTP 403 Forbidden
```

Seeded logins:

| Role       | Phone       | Password |
|------------|-------------|----------|
| superadmin | 9000000000  | admin    |
| teacher    | 9000000001  | teach    |
| teacher    | 9000000002  | teach    |
| student    | 9999999001  | demo     |
| student    | 9999999002  | demo     |
| student    | 9999999003  | demo     |

---

## 7. What's intentionally left for later

- Refresh tokens / token rotation (currently a single 7-day token).
- Rate-limiting the login endpoint.
- Password reset flow.
- Dedicated teacher/admin **pages** in the frontend (the backend already
  enforces the permissions; the UI to drive them is the next step —
  see `DATABASE.md` and `flowofbackend.md` roadmaps).
