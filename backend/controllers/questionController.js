// Question controllers — a SHARED question bank.
// Any teacher's questions are visible to every other teacher (attribution via
// createdBy), and getAllQuestions supports filtering so a teacher can find
// reusable questions by topic, difficulty, type, or free-text search.

const Question = require("../models/Question.model");

function addQuestion(req, res) {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "text is required" });

    // Stamp the author from the verified token (never trust the body for this).
    const q = new Question({ ...req.body, createdBy: req.user?.id });
    q.save()
        .then(() => res.status(201).json({ msg: "Question added", question: q }))
        .catch(err => res.status(500).json({ msg: "Error adding question", error: err.message }));
}

function addQuestions(req, res) {
    const docs = (Array.isArray(req.body) ? req.body : []).map(q => ({ ...q, createdBy: req.user?.id }));
    Question.insertMany(docs)
        .then(data => res.status(201).json({ msg: "Questions added", count: data.length, questions: data }))
        .catch(err => res.status(500).json({ msg: "Error adding questions", error: err.message }));
}

// GET /questions/getAllQuestions?topic=…&difficulty=…&questionType=…&q=…
// All filters are optional and combine (AND). `topic` and `q` are
// case-insensitive partial matches; `q` searches the question text.
function getAllQuestions(req, res) {
    const { topic, difficulty, questionType, q } = req.query;
    const filter = {};
    if (topic)        filter.topic = { $regex: topic, $options: "i" };
    if (difficulty)   filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;
    if (q)            filter.text = { $regex: q, $options: "i" };

    Question.find(filter)
        .sort({ createdAt: -1 })
        .populate("createdBy", "name")          // attribution: who wrote it
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error fetching questions", error: err.message }));
}

function getQuestionById(req, res) {
    const { id } = req.query;
    Question.findById(id)
        .populate("createdBy", "name")
        .then(qn => qn ? res.json(qn) : res.status(404).json({ msg: "Question not found" }))
        .catch(err => res.status(500).json({ msg: "Error fetching question", error: err.message }));
}

function deleteQuestion(req, res) {
    const { id } = req.body;
    Question.deleteOne({ _id: id })
        .then(data => res.json({ msg: "Question deleted", data }))
        .catch(err => res.status(500).json({ msg: "Error deleting question", error: err.message }));
}

module.exports = { addQuestion, addQuestions, getAllQuestions, getQuestionById, deleteQuestion };
