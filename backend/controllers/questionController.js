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
 
    // If teacher: only return questions used in THEIR assignments
    if (req.user.role === "teacher") {
        // Find their courses
        const Course = require("../models/Courses.model.js");
        const Assignment = require("../models/assignments.model.js");
        
        return Course.find({ instructor: req.user.id }).select("_id")
            .then((courses) => {
                const courseIds = courses.map((c) => c._id);
                return Assignment.find({ courseId: { $in: courseIds } }).select("questions");
            })
            .then((assignments) => {
                // Collect all question IDs used in those assignments
                const qIds = new Set();
                for (const a of assignments) {
                    for (const qid of a.questions) qIds.add(String(qid));
                }
                filter._id = { $in: [...qIds].map((id) => require("mongoose").Types.ObjectId.createFromHexString(id)) };
                
                // Apply other filters
                if (topic) filter.topic = { $regex: topic, $options: "i" };
                if (difficulty) filter.difficulty = difficulty;
                if (questionType) filter.questionType = questionType;
                if (q) filter.text = { $regex: q, $options: "i" };
 
                return Question.find(filter).sort({ createdAt: -1 }).populate("createdBy", "name");
            })
            .then((data) => res.json(data))
            .catch((err) => res.status(500).json({ msg: "...", error: err.message }));
    }
 
    // Superadmin: show everything as before
    if (topic) filter.topic = { $regex: topic, $options: "i" };
    if (difficulty) filter.difficulty = difficulty;
    if (questionType) filter.questionType = questionType;
    if (q) filter.text = { $regex: q, $options: "i" };
 
    Question.find(filter).sort({ createdAt: -1 }).populate("createdBy", "name")         // attribution: who wrote it
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

function updateQuestionById(req,res){
    const{id}=req.body
     Question.findById(id)
        .then((question) => {
            if (!question) {
                return res.status(404).json({msg: "Question not found"});
            }
            if (  question.createdBy.toString() !== req.user.id &&
            req.user.role !== "superadmin"
            ){
                return res.status(403).json({msg: "You are not authorized to update this question"});
            }
             question.text = req.body.text ?? question.text;
            question.topic = req.body.topic ?? question.topic;
            question.marks = req.body.marks ?? question.marks;
            question.difficulty =req.body.difficulty ?? question.difficulty;
            question.questionType =req.body.questionType ?? question.questionType;

            return question.save();
        })
        .then((updatedQuestion) => {

            if (!updatedQuestion) return;

            res.json({
                msg: "Question updated successfully",
                question: updatedQuestion
            });

        })
        .catch((err) => {
            res.status(500).json({
                msg: "Error updating question",
                error: err.message
            });
        });
}



module.exports = { addQuestion, addQuestions, getAllQuestions, getQuestionById, deleteQuestion,updateQuestionById};
