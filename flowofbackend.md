# Flow of the Backend — a Teacher's Journey

This document follows a **teacher** through the backend from an empty
database to a live, gradeable assignment. Along the way you'll see exactly
which endpoint runs, which controller handles it, and which collections get
linked together.

If `DATABASE.md` is the *map* (every collection and field), this file is the
*route* (the order you actually do things and why).

> **Roles today.** Every account has a `role` of `"student"` or `"teacher"`
> (see `User.model.js`). The backend does **not yet enforce** role-based
> access — any request can hit any endpoint. Enforcement (JWT + a
> "teacher-only" middleware) is on the roadmap in `DATABASE.md §7`. For now,
> "what a teacher does" means "the endpoints intended for teachers."

---

## 1. How the collections connect (quick recap)

```
   User (teacher) ──owns──►  courses  ◄──belongs to── asignments ──has──► Question(s)
        │                       ▲                          │
        │                       │ enrolled                 │ answered by
        │                       │                          ▼
   User (student) ──enrolled──►─┘                     Submission ──produces──► Marks
```

- A **teacher** owns courses (`courses.instructor → User`).
- A **course** has many students (`courses.enrolledStudents[] → User`) and,
  mirrored, each student lists their courses (`User.enrolledCourses[] → courses`).
- An **assignment** belongs to exactly one course (`asignments.courseId → courses`)
  and references a list of questions (`asignments.questions[] → Question`).
- A **student** submits answers (`Submission`), which the grader turns into a
  **Marks** row.

Everything below builds these links one endpoint at a time.

---

## 2. What a teacher can do (the views / tasks)

| # | Task | Endpoint | Controller | Collections touched |
|---|------|----------|------------|---------------------|
| 1 | Create a course | `POST /course/addCourse` | `courses.controllers.addCourse` | writes `courses` |
| 2 | See all courses | `GET /course/getAllCourses` | `getAllCourses` | reads `courses` |
| 3 | Enroll a student in a course | `POST /course/enrollStudent` | `enrollStudent` | updates `courses` **and** `users` |
| 4 | Add a question to the bank | `POST /questions/addQuestion` | `questionController.addQuestion` | writes `questions` |
| 5 | Bulk-add questions | `POST /questions/addQuestions` | `addQuestions` | writes `questions` |
| 6 | See the question bank | `GET /questions/getAllQuestions` | `getAllQuestions` | reads `questions` |
| 7 | Create an assignment for a course | `POST /assignments/addAssignment` | `assignmentController.addAssignment` | writes `asignments` (links `courseId`) |
| 8 | Attach questions to an assignment | `POST /assignments/addQuestionsToAssignment` | `addQuestionsToAssignment` | updates `asignments` (links `questions[]`) |
| 9 | See a course's assignments | `GET /assignments/getByCourse?courseId=…` | `getAssignmentsByCourse` | reads `asignments` |
| 10 | Open one assignment (full detail) | `GET /assignments/getAssignmentById?id=…` | `getAssignmentById` | reads `asignments` + `courses` + `questions` (populated) |
| 11 | See who submitted an assignment | `GET /submissions/getByAssignment?assignmentId=…` | `submissionController.getSubmissionsByAssignment` | reads `submissions` + `users` |
| 12 | Grade a submission | `POST /submissions/grade` | `gradeSubmission` | reads `submissions`/`asignments`/`questions`, writes `submissions` + `marks` |

The teacher's dashboard (a future frontend page — roadmap `DATABASE.md §7`)
would be built by composing these: "my courses" (2, filtered by `instructor`),
drill into a course → "its assignments" (9) → open one (10) → "submissions to
review" (11) → grade (12).

---

## 3. The end-to-end teacher flow

Assume the backend is on `http://localhost:9000`. Each step shows the request
and what the backend does internally. Copy the returned `_id`s forward.

### Step 0 — There is a teacher account

Teachers are just `User` docs with `role: "teacher"`. Create one:

```bash
curl -X POST http://localhost:9000/user/addUser \
  -H "Content-Type: application/json" \
  -d '{"name":"Prof. Rao","email":"rao@x.co","password":"teach","phoneNumber":9000000001,"role":"teacher"}'
```
→ Inserts a document into **users**. Save its `_id` as `TEACHER_ID`.

### Step 1 — Teacher creates a course

```bash
curl -X POST http://localhost:9000/course/addCourse \
  -H "Content-Type: application/json" \
  -d '{
    "CourseName": "Data Structures & Algorithms",
    "CourseCode": "CS201",
    "description": "Arrays, trees, graphs.",
    "credits": 4,
    "semester": "Fall 2026",
    "instructor": "TEACHER_ID"
  }'
```

**Inside `addCourse`:** validates the required fields, builds a `Course`,
saves it. The `instructor` field stores `TEACHER_ID` as an `ObjectId` — this
is the **teacher → course** link.

→ Save the returned course `_id` as `COURSE_ID`.

### Step 2 — Teacher enrolls students

First there must be student accounts (`role: "student"`). Then:

```bash
curl -X POST http://localhost:9000/course/enrollStudent \
  -H "Content-Type: application/json" \
  -d '{"courseId":"COURSE_ID","studentId":"STUDENT_ID"}'
```

**Inside `enrollStudent`:** this is a **many-to-many** link, so it updates
*both* sides atomically-ish:
- `courses.enrolledStudents` gets `STUDENT_ID` added (`$addToSet` → no dupes)
- `users.enrolledCourses` gets `COURSE_ID` added

Now the student "sees" the course and the course "knows" the student. Repeat
for each student.

### Step 3 — Teacher builds the question bank

Questions live in their **own** collection so they can be reused across many
assignments. Add several at once:

```bash
curl -X POST http://localhost:9000/questions/addQuestions \
  -H "Content-Type: application/json" \
  -d '[
    {"text":"Time complexity of binary search?","questionType":"mcq","options":["O(1)","O(log n)","O(n)"],"correctAnswer":"O(log n)","marks":2,"topic":"Complexity","difficulty":"easy"},
    {"text":"Which structure is LIFO?","questionType":"mcq","options":["Queue","Stack"],"correctAnswer":"Stack","marks":2,"topic":"DS","difficulty":"easy"},
    {"text":"Explain BFS vs DFS.","questionType":"long","marks":5,"topic":"Graphs","difficulty":"medium"}
  ]'
```

**Inside `addQuestions`:** `Question.insertMany(req.body)` writes them all.
→ Save the returned question `_id`s as `Q1`, `Q2`, `Q3`.

Note: questions are **not** tied to a course or assignment yet. They're a
free-floating library. Linking happens in the next steps.

### Step 4 — Teacher creates an assignment for the course

```bash
curl -X POST http://localhost:9000/assignments/addAssignment \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentName": "Week 1 — Basics",
    "assignmentType": "Homework",
    "assignmentTopics": ["Complexity","DS"],
    "courseId": "COURSE_ID",
    "questions": ["Q1","Q2"],
    "dueOn": "2026-08-01"
  }'
```

**Inside `addAssignment`:**
1. Requires `assignmentName` + `courseId` (the **assignment → course** link).
2. Builds the assignment. `questions` here is optional — you can pass some now
   and add more later.
3. Calls `sumMarks(questions)` → fetches those Question docs and sums their
   `marks`, storing the result in `totalMarks`. So `totalMarks` always matches
   the questions actually attached (here `2 + 2 = 4`).
4. Saves.

→ Save the returned assignment `_id` as `ASSIGNMENT_ID`.

### Step 5 — Teacher attaches more questions to the assignment

You built Q3 but didn't include it above. Add it now:

```bash
curl -X POST http://localhost:9000/assignments/addQuestionsToAssignment \
  -H "Content-Type: application/json" \
  -d '{"assignmentId":"ASSIGNMENT_ID","questionIds":["Q3"]}'
```

**Inside `addQuestionsToAssignment`:**
1. Loads the assignment.
2. Pushes each new question `_id` into `questions[]`, skipping any already
   present (dedupe via a `Set`).
3. Recomputes `totalMarks` with `sumMarks` (now `2 + 2 + 5 = 9`).
4. Saves.

This is the **assignment ↔ questions** many-to-many link growing over time.
The same Q3 could be attached to a *different* assignment too — that's the
whole point of a separate question bank.

### Step 6 — Teacher reviews the assignment (fully populated)

```bash
curl "http://localhost:9000/assignments/getAssignmentById?id=ASSIGNMENT_ID"
```

**Inside `getAssignmentById`:** uses `.populate("courseId").populate("questions")`
so the response contains the **full course object** and the **full text of
every question** — not just ObjectIds. This is the payload a "take assignment"
page (student) or a "preview" page (teacher) would render.

### Step 7 — Students submit, teacher grades

A student submits their answers:

```bash
curl -X POST http://localhost:9000/submissions/submit \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId":"ASSIGNMENT_ID",
    "studentId":"STUDENT_ID",
    "answers":[
      {"questionId":"Q1","answer":"O(log n)"},
      {"questionId":"Q2","answer":"Stack"},
      {"questionId":"Q3","answer":"BFS uses a queue; DFS uses a stack."}
    ]
  }'
```
→ Writes a **submissions** doc. Save its `_id` as `SUBMISSION_ID`.

The teacher sees all submissions for the assignment:

```bash
curl "http://localhost:9000/submissions/getByAssignment?assignmentId=ASSIGNMENT_ID"
```
→ `getSubmissionsByAssignment` returns them with each student's name/email
populated.

The teacher grades one:

```bash
curl -X POST http://localhost:9000/submissions/grade \
  -H "Content-Type: application/json" \
  -d '{"submissionId":"SUBMISSION_ID"}'
```

**Inside `gradeSubmission`:**
1. Loads the submission → its assignment → its course (`.populate`).
2. Loads all referenced Question docs.
3. For each answer, compares `answer` to `question.correctAnswer`
   (trimmed + lowercased). MCQ/short/true-false auto-grade; long-answer
   (`correctAnswer: ""`) scores 0 and would need manual review.
4. Sets `submission.marksAwarded` + `status: "graded"`.
5. **Inserts a `marks` row** (`examType: "Assignment"`) so the student's
   grade sheet — `GET /marks/getMarksByStudent` — reflects it immediately.

This closes the loop: **Submission → Marks**, and the student's existing
Marks page (`frontend/src/pages/Marks.jsx`) shows the score with no extra work.

---

## 4. The request lifecycle (any endpoint)

Every call above follows the same path through the backend:

```
HTTP request
   │
   ▼
server.js                     app.use(cors()), app.use(express.json())
   │                          → mounts routers by prefix:
   │                            /course /user /assignments /marks
   │                            /questions /submissions
   ▼
routes/*.js                   matches METHOD + path → names a controller fn
   │
   ▼
controllers/*.js              reads req.body / req.query, validates,
   │                          calls the Mongoose model
   ▼
models/*.js (Mongoose)        .save() / .find() / .updateOne() / .populate()
   │
   ▼
MongoDB                       stores / returns documents
   │
   ▼
res.json(...)                 controller sends the response back up
```

Read one endpoint end-to-end (route → controller → model) and the rest are
variations on the same three files.

---

## 5. Quick reference — teacher endpoints

```
COURSES
  POST /course/addCourse               create a course (instructor = teacher)
  GET  /course/getAllCourses           list courses
  GET  /course/getCourseById           one course
  POST /course/updateCourseById        edit a course
  POST /course/enrollStudent           enroll a student (updates both sides)

QUESTION BANK
  POST /questions/addQuestion          add one question
  POST /questions/addQuestions         bulk add
  GET  /questions/getAllQuestions      list the bank
  GET  /questions/getQuestionById      one question
  POST /questions/deleteQuestion       remove one

ASSIGNMENTS
  POST /assignments/addAssignment              create (linked to a course)
  POST /assignments/addQuestionsToAssignment   attach questions, recompute total
  GET  /assignments/getAllAssignments          list (course name populated)
  GET  /assignments/getByCourse                assignments for one course
  GET  /assignments/getAssignmentById          full detail (course + questions)
  POST /assignments/deleteAssignment           remove one

SUBMISSIONS & GRADING
  GET  /submissions/getByAssignment    who submitted this assignment
  POST /submissions/grade              auto-grade + write a Marks row
```

For the student-side flow and the full field-by-field schema, see
[DATABASE.md](DATABASE.md). For a line-by-line tour of the code, see
[backend/learn.md](backend/learn.md).
