#!/usr/bin/env bash
#
# Creates a batch of student-friendly issues on the GitHub repo so learners
# have well-scoped tasks to pick up.
#
# One-time setup:
#   1. Install the GitHub CLI:  https://cli.github.com  (macOS: brew install gh)
#   2. Authenticate:            gh auth login
#   3. Run this from the repo root:   bash scripts/create-issues.sh
#
# Safe to re-run: labels are created with "|| true" so existing ones don't error.
# (Issues themselves WILL be duplicated if you run it twice — only run once.)

set -euo pipefail

REPO="shubhIam-dev/LMS"

echo "→ Ensuring labels exist…"
gh label create "good first issue" --repo "$REPO" --color 7057ff --description "Great for newcomers" 2>/dev/null || true
gh label create "backend"          --repo "$REPO" --color 0e8a16 --description "Node/Express/Mongo" 2>/dev/null || true
gh label create "frontend"         --repo "$REPO" --color 1d76db --description "React/Redux/CSS" 2>/dev/null || true
gh label create "docs"             --repo "$REPO" --color fbca04 --description "Documentation" 2>/dev/null || true
gh label create "difficulty:easy"    --repo "$REPO" --color c2e0c6 2>/dev/null || true
gh label create "difficulty:medium"  --repo "$REPO" --color fef2c0 2>/dev/null || true
gh label create "difficulty:hard"    --repo "$REPO" --color f9d0c4 2>/dev/null || true

new_issue () {
  # usage: new_issue "title" "labels" "body"
  echo "→ Creating: $1"
  gh issue create --repo "$REPO" --title "$1" --label "$2" --body "$3"
}

# ---------------------------------------------------------------------------
# EASY
# ---------------------------------------------------------------------------
new_issue "Build a Register page on the frontend" \
"good first issue,frontend,difficulty:easy" \
"There is a working \`POST /user/register\` endpoint and \`userApi.register()\` in \`frontend/src/services/api.js\`, but no UI for it.

**Task:** Add a \`/register\` route and page that collects name, email, phone, password, calls \`userApi.register()\`, stores the returned token + user (reuse the auth slice), and redirects to the dashboard on success.

**Files:** \`frontend/src/pages/\`, \`frontend/src/App.jsx\`, \`frontend/src/store/authSlice.js\`.

**Acceptance criteria:**
- [ ] A new student can register from the UI and land on the dashboard.
- [ ] Errors from the backend are shown (e.g. phone already used).
- [ ] A link to /register exists on the login page."

new_issue "Show a friendly message when API calls fail" \
"good first issue,frontend,difficulty:easy" \
"When the backend is down or returns an error, pages show a bare console error.

**Task:** Add a small reusable error banner component and use it on the Courses, Assignments, and Marks pages when a fetch fails.

**Files:** \`frontend/src/pages/*.jsx\`, a new \`frontend/src/components/\` component.

**Acceptance criteria:**
- [ ] Stopping the backend and loading a page shows a readable message, not a blank screen."

new_issue "Add a logout confirmation" \
"good first issue,frontend,difficulty:easy" \
"Clicking Logout in the sidebar signs out instantly.

**Task:** Ask 'Are you sure?' before logging out (a simple window.confirm is fine to start).

**Files:** \`frontend/src/components/Sidebar.jsx\`.

**Acceptance criteria:**
- [ ] Cancelling keeps the user logged in; confirming logs out."

# ---------------------------------------------------------------------------
# MEDIUM
# ---------------------------------------------------------------------------
new_issue "Populate course info in assignments and marks responses" \
"good first issue,backend,difficulty:medium" \
"Some endpoints return raw ObjectIds instead of readable data.

**Task:** Use Mongoose \`.populate()\` so \`GET /assignments/getAllAssignments\` includes the course name and \`GET /marks/getAllMarks\` includes the student name. See DATABASE.md §4 for populate examples.

**Files:** \`backend/controllers/assignmentController.js\`, \`backend/controllers/marksController.js\`.

**Acceptance criteria:**
- [ ] Responses show human-readable course/student fields.
- [ ] Existing pages still render correctly."

new_issue "Add a Question Bank page for teachers" \
"good first issue,frontend,difficulty:medium" \
"Teachers can create questions via the API but there's no UI.

**Task:** Add a teacher-only \`/questions\` page (guard with \`<ProtectedRoute roles={['teacher','superadmin']}>\`) that lists questions and has a form to add one. Wire it to \`/questions/getAllQuestions\` and \`/questions/addQuestion\`. See AUTH.md for role guarding and flowofbackend.md for the teacher flow.

**Files:** \`frontend/src/pages/\`, \`frontend/src/App.jsx\`, \`frontend/src/services/api.js\`.

**Acceptance criteria:**
- [ ] A teacher can view and add questions; a student is redirected away."

new_issue "Build the assignment submission UI for students" \
"good first issue,frontend,difficulty:medium" \
"The backend supports \`POST /submissions/submit\` but students can't submit from the UI.

**Task:** On an assignment detail view, render each question (use \`GET /assignments/getAssignmentById\`) and let a student type answers and submit. See DATABASE.md §5 steps 5-7.

**Files:** \`frontend/src/pages/\`, \`frontend/src/services/api.js\`.

**Acceptance criteria:**
- [ ] A student can open an assignment, answer, and submit.
- [ ] A success state is shown after submitting."

new_issue "Cache page data in Redux slices" \
"good first issue,frontend,difficulty:medium" \
"Courses/Assignments/Marks refetch on every mount.

**Task:** Add \`coursesSlice\`, \`assignmentsSlice\`, and \`marksSlice\` (Redux Toolkit createAsyncThunk) so data is fetched once and cached in the store.

**Files:** \`frontend/src/store/\`, the three pages.

**Acceptance criteria:**
- [ ] Navigating away and back doesn't refetch unnecessarily."

# ---------------------------------------------------------------------------
# HARD
# ---------------------------------------------------------------------------
new_issue "Add a manual grading queue for long-answer questions" \
"good first issue,backend,difficulty:hard" \
"The auto-grader in \`submissionController.gradeSubmission\` scores long-answer questions as 0 because they have no \`correctAnswer\`.

**Task:** Add an endpoint for a teacher to manually set marks per long-answer question on a submission, then recompute the total and update the Marks row.

**Files:** \`backend/controllers/submissionController.js\`, \`backend/routes/submissionRoutes.js\`.

**Acceptance criteria:**
- [ ] A teacher can override/assign marks for individual answers.
- [ ] The Marks row reflects the final total."

new_issue "Add attempt limits and late-submission handling" \
"good first issue,backend,difficulty:hard" \
"Assignments can currently be submitted any number of times, any time.

**Task:** Add \`attemptsAllowed\` and enforce it in \`submitAssignment\`; flag submissions made after \`dueOn\` as late.

**Files:** \`backend/models/assignments.model.js\`, \`backend/models/Submission.model.js\`, \`backend/controllers/submissionController.js\`.

**Acceptance criteria:**
- [ ] Submitting beyond the limit is rejected with a clear message.
- [ ] Late submissions are marked as late."

new_issue "Add a teacher dashboard" \
"good first issue,frontend,difficulty:hard" \
"Teachers log in but see the same view as students.

**Task:** Build a teacher-only dashboard: their courses, quick actions to create a course/assignment, and a list of submissions to review (\`/submissions/getByAssignment\`). Guard with roles. Follow the existing LMS design system (see the CSS variables in \`frontend/src/index.css\`).

**Files:** \`frontend/src/pages/\`, \`frontend/src/App.jsx\`.

**Acceptance criteria:**
- [ ] A teacher sees teacher-specific tools; a student never does."

# ---------------------------------------------------------------------------
# DOCS
# ---------------------------------------------------------------------------
new_issue "Add API examples to a Postman/Thunder collection" \
"good first issue,docs,difficulty:easy" \
"The curl examples in DATABASE.md and AUTH.md are great, but a ready-made request collection would help newcomers.

**Task:** Export a Postman (or Thunder Client) collection covering login + the main endpoints and commit it under \`docs/\`.

**Acceptance criteria:**
- [ ] Importing the collection lets someone log in and hit each endpoint with pre-filled examples."

echo ""
echo "✅ Done. View them:  gh issue list --repo $REPO"
