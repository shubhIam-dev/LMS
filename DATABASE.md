# Database Design — MongoDB + Mongoose

This document is the **single source of truth** for how data lives in this
project: every collection, every field, and every link between them. If
you're touching the backend, read this end-to-end first.

The database is **MongoDB** (a document store). We talk to it through
**Mongoose** — an ODM (Object–Document Mapper) that gives us schemas,
validation, and helpers like `.find()`, `.populate()`, and `.save()`.

---

## 1. The six collections at a glance

```
┌──────────────┐          ┌──────────────┐          ┌────────────────┐
│    User      │          │   courses    │          │    Question    │
│  (students   │◄───┐  ┌──│              │──────┐   │  (reusable     │
│   + teachers)│    │  │  │              │      │   │   questions)   │
└──────────────┘    │  │  └──────────────┘      │   └────────────────┘
      ▲             │  │         ▲              │           ▲
      │             │  │         │              │           │
      │             │  │         │              ▼           │
      │             │  │  ┌──────────────┐   ┌──────────────┐
      │             │  └──│  asignments  │──►│  questions[] │
      │             │     │              │   │  (refs)      │
      │             │     └──────────────┘   └──────────────┘
      │             │            ▲
      │             │            │
      │             │            │
      │  ┌──────────────┐  ┌──────────────┐
      └──│  Submission  │──│              │
         │              │  │              │
         └──────────────┘  └──────────────┘
                 │
                 ▼
         ┌──────────────┐
         │    Marks     │
         │  (grade book)│
         └──────────────┘
```

Reading the arrows: `A ──► B` means *A stores a reference (an `ObjectId`)
that points into collection B*. Follow the arrow to fetch the linked doc.

| Collection    | What lives here                                              | Key refs it holds                          |
|---------------|--------------------------------------------------------------|--------------------------------------------|
| **User**      | People (both students and teachers, `role` distinguishes)    | `enrolledCourses[]` → courses              |
| **courses**   | Each subject / paper offered                                 | `instructor` → User, `enrolledStudents[]` → User |
| **Question**  | Reusable questions — stored once, referenced by many assignments | none                                  |
| **asignments**| Groups of Question refs due on a date, tied to one course    | `courseId` → courses, `questions[]` → Question |
| **Submission**| A student's attempt at one assignment                        | `assignmentId` → asignments, `studentId` → User, `answers[i].questionId` → Question |
| **Marks**     | The grade book — one row per exam per student                | `studentId` → User, `courseId` → courses   |

> **Naming note (heads up).** Mongoose lowercases + pluralizes the model
> name to derive the collection name. So `mongoose.model("User", ...)`
> creates the `users` collection, `mongoose.model("courses", ...)` stays
> `courses`, `mongoose.model("asignments", ...)` stays `asignments` (yes,
> misspelled — kept for backwards-compat with existing data). Always
> reference collections by the exact model name used in `ref: "..."`.

---

## 2. Every field in every collection

### 2.1 `User` — `models/User.model.js`

```js
{
  name:            String,   // required
  email:           String,   // required
  password:        String,   // required (plain text for now — see Roadmap)
  phoneNumber:     Number,   // required (also acts as the login username)
  role:            String,   // "student" | "teacher", default "student"
  enrolledCourses: [ObjectId → courses],
  createdAt:       Date,     // added by { timestamps: true }
  updatedAt:       Date
}
```

### 2.2 `courses` — `models/Courses.model.js`

```js
{
  CourseName:       String,   // required
  CourseCode:       String,   // required
  description:      String,   // default ""
  credits:          Number,   // default 3
  semester:         String,   // e.g. "Fall 2026"
  instructor:       ObjectId → User,   // one teacher per course
  enrolledStudents: [ObjectId → User],
  createdAt, updatedAt
}
```

### 2.3 `Question` — `models/Question.model.js`

```js
{
  text:          String,   // required — the actual prompt
  questionType:  String,   // "mcq" | "short" | "long" | "code" | "truefalse"
  options:       [String], // used only when type === "mcq"
  correctAnswer: String,   // used by the auto-grader in submissionController
  marks:         Number,   // default 1
  topic:         String,
  difficulty:    String,   // "easy" | "medium" | "hard"
  createdAt, updatedAt
}
```

**Why a separate collection?** Questions can be reused across quizzes,
practice sets, and midterms. Storing them once and linking makes editing
easier and keeps assignment documents small.

### 2.4 `asignments` — `models/assignments.model.js`

```js
{
  assignmentName:   String,   // required
  assignmentType:   String,   // "Homework" | "Quiz" | "Project" | "Exam" (free-form for now)
  assignmentTopics: [String],
  courseId:         ObjectId → courses,     // required — parent course
  questions:        [ObjectId → Question],  // order = question number
  totalMarks:       Number,                 // sum of question marks, filled by controller
  createdOn:        Date,     // default now
  dueOn:            Date,
  createdAt, updatedAt
}
```

### 2.5 `Submission` — `models/Submission.model.js`

```js
{
  assignmentId: ObjectId → asignments,   // required
  studentId:    ObjectId → User,          // required
  answers: [{                             // one entry per attempted question
    questionId: ObjectId → Question,      // required
    answer:     String                    // whatever the student typed
  }],
  submittedOn:  Date,     // default now
  status:       String,   // "submitted" | "graded"
  marksAwarded: Number,   // filled by the grader
  createdAt, updatedAt
}
```

### 2.6 `Marks` — `models/Marks.model.js`

```js
{
  studentId:     ObjectId → User,     // required
  courseId:      ObjectId → courses,  // required
  courseName:    String,              // denormalized — snapshot at grade time
  marksObtained: Number,              // required
  totalMarks:    Number,              // default 100
  examType:      String,              // "Midterm" | "Final" | "Quiz" | "Assignment"
  semester:      String,              // required
}
```

> **Why is `courseName` copied into Marks?** That's called **denormalization**.
> If the course is later renamed, the historical grade sheet still shows
> the name it had *when the grade was recorded* — which is what a
> transcript is supposed to do.

---

## 3. Relationships in plain English

- A **User** with role `"student"` **belongs to many** courses (via `enrolledCourses`).
- A **course** **is taught by one** teacher (via `instructor`) and **has many** students (via `enrolledStudents`).
- A **course** **has many** assignments (join *the other way*: query `asignments` where `courseId = <this course>`).
- An **assignment** **belongs to one** course and **has many** questions.
- A **Question** **can appear in many** assignments (many-to-many; each assignment's `questions[]` decides which).
- A **Submission** links a student, an assignment, and a set of answers — one submission per (student, assignment).
- **Marks** is the flat, permanent grade log — one row per graded exam. The auto-grader in `submissionController.gradeSubmission` inserts a Marks row when it grades a submission.

### One-to-many vs many-to-many (how we model each)

| Relationship                       | Modeled how                                                  |
|------------------------------------|--------------------------------------------------------------|
| Student ↔ Courses (many-to-many)   | Array of refs on **both** sides (`User.enrolledCourses` + `courses.enrolledStudents`) — denormalized for read-speed |
| Teacher → Course (one-to-many)     | Single ref on the **course** (`courses.instructor`) — never on the User |
| Course → Assignments (one-to-many) | No array on Course. `asignments.courseId` stores the parent; query the child collection |
| Assignment ↔ Questions (many-to-many) | Array of refs on the **assignment** (`asignments.questions[]`) — questions don't know which assignments they're in |
| Student → Submissions (one-to-many)| `Submission.studentId` on the child; query the child collection |

**Rule of thumb we're following:** "many" always lives on the parent as
an array of refs, unless the array would grow unbounded (thousands of
items) — in that case the ref lives on the child instead.

---

## 4. Reading connected data — `.populate()`

Refs on their own are just `ObjectId`s. To fetch the linked document in
the same query, call `.populate()`:

```js
// Get an assignment with its course info and all its questions filled in
Assignment.findById(id)
  .populate('courseId')      // replaces courseId with the full course doc
  .populate('questions')     // replaces each ObjectId in questions[] with the full Question doc
  .then(assignment => { ... });

// Get a student's submissions with the assignment name for each
Submission.find({ studentId })
  .populate('assignmentId', 'assignmentName dueOn')   // only pick a couple of fields
  .then(subs => { ... });

// Get all students enrolled in a course with only their name + email
Course.findById(courseId)
  .populate('enrolledStudents', 'name email')
  .then(course => { ... });
```

Without `.populate()` you'll see raw `ObjectId`s in the response — that's
usually a hint that a populate call is missing.

---

## 5. End-to-end walkthrough — creating a real assignment

This is the intended data flow. Each step's example command assumes the
backend is running on `http://localhost:9000`. Copy the returned `_id`s
into the next step.

### Step 1 — Create a teacher and a student

```bash
curl -X POST http://localhost:9000/user/addUser \
  -H "Content-Type: application/json" \
  -d '{"name":"Prof Rao","email":"rao@x.co","password":"x","phoneNumber":9000000001,"role":"teacher"}'

curl -X POST http://localhost:9000/user/addUser \
  -H "Content-Type: application/json" \
  -d '{"name":"Aria","email":"aria@x.co","password":"x","phoneNumber":9000000002,"role":"student"}'
```
Save both `_id`s.

### Step 2 — Create a course, owned by the teacher

```bash
curl -X POST http://localhost:9000/course/addCourse \
  -H "Content-Type: application/json" \
  -d '{
    "CourseName": "Data Structures",
    "CourseCode": "CS201",
    "description": "Arrays, trees, graphs.",
    "credits": 4,
    "semester": "Fall 2026",
    "instructor": "<teacher _id from step 1>",
    "enrolledStudents": ["<student _id from step 1>"]
  }'
```
Save the course `_id`.

### Step 3 — Create the questions (they can be reused later)

```bash
curl -X POST http://localhost:9000/questions/addQuestions \
  -H "Content-Type: application/json" \
  -d '[
    {"text":"What is the time complexity of binary search?","questionType":"mcq","options":["O(1)","O(log n)","O(n)","O(n²)"],"correctAnswer":"O(log n)","marks":2,"topic":"Complexity","difficulty":"easy"},
    {"text":"Explain the difference between BFS and DFS.","questionType":"long","correctAnswer":"","marks":5,"topic":"Traversal","difficulty":"medium"}
  ]'
```
Save the returned question `_id`s.

### Step 4 — Create the assignment that references course + questions

```bash
curl -X POST http://localhost:9000/assignments/addAssignment \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentName": "Week 1 — Basics",
    "assignmentType": "Homework",
    "assignmentTopics": ["Complexity", "Traversal"],
    "courseId": "<course _id>",
    "questions": ["<q1 _id>", "<q2 _id>"],
    "totalMarks": 7,
    "dueOn": "2026-08-01"
  }'
```

### Step 5 — Student submits answers

```bash
curl -X POST http://localhost:9000/submissions/submit \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "<assignment _id>",
    "studentId":    "<student _id>",
    "answers": [
      {"questionId":"<q1 _id>","answer":"O(log n)"},
      {"questionId":"<q2 _id>","answer":"BFS uses a queue; DFS uses a stack..."}
    ]
  }'
```

### Step 6 — Auto-grade the submission

```bash
curl -X POST http://localhost:9000/submissions/grade \
  -H "Content-Type: application/json" \
  -d '{"submissionId":"<submission _id>"}'
```

What happens inside `gradeSubmission`:
1. Load the submission → find its assignment → find the course (via `.populate`).
2. Load all the Question docs referenced in the submission's answers.
3. For each answer, compare `answer.trim().toLowerCase()` with `question.correctAnswer.trim().toLowerCase()`. On a match, add the question's marks to a running total.
4. Update the submission: `marksAwarded = total`, `status = "graded"`.
5. **Also** insert a row into `Marks` so the student's grade sheet reflects the assignment.

### Step 7 — Student's Marks page now shows the result

The frontend already calls `GET /marks/getMarksByStudent?studentId=…`, so
the newly-created Marks row appears on their dashboard.

---

## 6. Design decisions worth understanding

**Refs vs embedding.** We embed something when it only exists in the
context of its parent (a Submission's `answers` don't matter without
the submission). We use refs when the child needs to be queried on its
own or reused (Questions belong to many Assignments).

**Denormalization for reads.** `Marks.courseName` is a snapshot of the
course name at the moment the mark was recorded. Yes, it can drift from
`courses.CourseName` if the course is renamed — that's the *point*. A
transcript should be immutable.

**Timestamps everywhere.** Every schema has `{ timestamps: true }`,
which auto-adds `createdAt` / `updatedAt`. Use these for sorting recent
activity without adding your own date fields.

**Enums.** We use `enum` on `role`, `questionType`, `examType`, etc.
Mongoose rejects any value outside the list, which catches typos before
they land in the database.

---

## 7. Roadmap — what we're building next

The current schema is *ready* for these features. Nothing new needs to
be modeled — only more UI and a few endpoints.

### Near-term (contributor-friendly)

1. **Populate everywhere.** Update `getAllAssignments` and
   `getAllCourses` to `.populate('courseId')` / `.populate('instructor')`
   so the frontend receives already-linked objects instead of ObjectIds.

2. **Assignment detail page.** New route `/assignments/:id` in the
   frontend that loads one assignment and renders every question. Backend
   already supports this via `GET /assignments/getAssignmentById` (add
   this endpoint if missing) with `.populate('questions')`.

3. **Submission UI.** A form that renders the questions and lets a
   student type answers, then POSTs to `/submissions/submit`.

4. **Password hashing.** Store `bcrypt.hash(password, 10)` instead of
   plain text. Comparison at login uses `bcrypt.compare`.

5. **JWT auth.** `POST /user/login` returns a signed token; a middleware
   verifies it on protected routes. Frontend stores the token and sends
   it as `Authorization: Bearer <token>`.

### Medium-term

6. **Teacher dashboards.** Guarded pages that only role `teacher` can
   reach — create courses, upload question banks, review submissions.

7. **Redux slices for data.** `coursesSlice`, `assignmentsSlice`,
   `marksSlice` — cache the fetch results so pages don't refetch on
   every mount.

8. **Attempt limits + late penalty.** Add `attemptsAllowed` + a
   `lateOn` field on `asignments`, and enforce in `submitAssignment`.

9. **Manual grading queue.** Long-answer questions don't auto-grade —
   route them into a review list for the teacher.

### Longer-term

10. **File uploads** for assignment attachments (needs `multer` + object
    storage).
11. **Analytics** — course-wide averages, question difficulty
    calibration from real submission data.
12. **Notifications** — email or in-app "new assignment posted."

Every one of these is a small, well-scoped PR. See `README.md`'s
"Contributing" section for how to open one.

---

## 8. Where each collection is used in the running app today

| Collection    | Backend endpoints                                         | Frontend page that reads it |
|---------------|-----------------------------------------------------------|-----------------------------|
| `users`       | `/user/addUser`, `/user/getUser`, `/user/addUsers`        | `LoginPage.jsx` (via Redux `loginUser` thunk) |
| `courses`     | `/course/*`                                               | `Courses.jsx`, `Dashboard.jsx` |
| `questions`   | `/questions/*`                                            | (not yet — see Roadmap #2)  |
| `asignments`  | `/assignments/*`                                          | `Assignments.jsx`, `Dashboard.jsx` |
| `submissions` | `/submissions/*`                                          | (not yet — see Roadmap #3)  |
| `marks`       | `/marks/*`                                                | `Marks.jsx`                 |
