// Question controllers — CRUD on the questions collection.
// Assignments reference these documents by _id.

const Question = require("../models/Question.model");

function addQuestion(req, res) {
    const { text } = req.body;
    if (!text) return res.status(400).json({ msg: "text is required" });

    const q = new Question(req.body);
    q.save()
        .then(() => res.status(201).json({ msg: "Question added", question: q }))
        .catch(err => res.status(500).json({ msg: "Error adding question", error: err.message }));
}

function addQuestions(req, res) {
    Question.insertMany(req.body)
        .then(data => res.status(201).json({ msg: "Questions added", count: data.length, questions: data }))
        .catch(err => res.status(500).json({ msg: "Error adding questions", error: err.message }));
}

function getAllQuestions(req, res) {
    Question.find()
        .then(data => res.json(data))
        .catch(err => res.status(500).json({ msg: "Error fetching questions", error: err.message }));
}

function getQuestionById(req, res) {
    const { id } = req.query;
    Question.findById(id)
        .then(q => q ? res.json(q) : res.status(404).json({ msg: "Question not found" }))
        .catch(err => res.status(500).json({ msg: "Error fetching question", error: err.message }));
}

function deleteQuestion(req, res) {
    const { id } = req.body;
    Question.deleteOne({ _id: id })
        .then(data => res.json({ msg: "Question deleted", data }))
        .catch(err => res.status(500).json({ msg: "Error deleting question", error: err.message }));
}

module.exports = { addQuestion, addQuestions, getAllQuestions, getQuestionById, deleteQuestion };
