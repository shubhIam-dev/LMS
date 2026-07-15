// Question controllers — CRUD on the questions collection.
// Assignments reference these documents by _id.

const  Assignments = require("../models/assignments.model");
const Question = require("../models/Question.model");

function addQuestion(req, res) {
    const { text, assignmentId } = req.body;
    if (!text) return res.status(400).json({ msg: "text is required" });

    const q = new Question(req.body);
    q.save()
        .then(savedQuestion => {
            if (assignmentId) {
                // Verify the assignment exists before linking
                return Assignments.findById(assignmentId)
                    .then(assignment => {
                        if (!assignment) {
                            // Question saved but assignment not found — still return success but warn
                            return res.status(201).json({
                                msg: "Question added but assignment not found",
                                question: savedQuestion,
                                warning: "Assignment with this ID does not exist"
                            });
                        }
                        return Assignments.findByIdAndUpdate(
                            assignmentId,
                            { $push: { questions: savedQuestion._id } },
                            { new: true }
                        ).then(() => {
                            res.status(201).json({ msg: "Question added and linked to assignment", question: savedQuestion });
                        });
                    });
            }
            res.status(201).json({ msg: "Question added", question: savedQuestion });
        })
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
        Question.findById(id)
        .then(question => {
            if (!question) {
                return res.status(404).json({ msg: "Question not found" });
            }
            return Question.deleteOne({ _id: id })
                .then(() => {
                    if (question.assignmentId) {
                        return Assignments.findByIdAndUpdate(
                            question.assignmentId,
                            { $pull: { questions: id } },
                            { new: true }
                        );
                    }
                })
                .then(() => {
                    res.json({ msg: "Question deleted and removed from assignment" });
                });
        })
        .catch(err => res.status(500).json({ msg: "Error deleting question", error: err.message }));
}

function addQuestionToAssignment(req,res){
    const{assignmentId,text,questionType,options,correctAnswer,marks}=req.body
    const question=new Question({
        assignmentId:assignmentId,
        text, questionType, options, correctAnswer, marks
    });
     question.save()
        .then(savedQuestion => {
            return Assignments.findByIdAndUpdate(
                assignmentId,
                { $push: { questions: savedQuestion._id } },
                { new: true }
            ).populate("questions")
             .then(updatedAssignment => {
                 res.status(201).json({
                     msg: "Question added to assignment!",
                     question: savedQuestion,
                     assignment: updatedAssignment
                 });
             });
        })
        .catch(err => res.status(500).json({ msg: "Error" }));
}

function getQuestionsByAssignment(req,res){
    const{assignmentId}=req.params
    Question.find({assignmentId:assignmentId})
    .then(data=>res.json(data))
    .catch(err=>res.status(500).json({msg:"Error"}))
}

function updateQuestion(req,res){
    const{id}=req.params
    const updateData=req.body

    Question.findByIdAndUpdate(id,updateData,{new:true})
    .then(data=>{
        if(!data){
            return res.status(404).json({msg:"Not Found"})
        }else{
            res.status(200).json({msg:"Updated", question: data})
        }
    })
    .catch(err => res.status(500).json({msg:"Error", error: err.message}))
}

module.exports = { addQuestion, addQuestions, getAllQuestions, getQuestionById, deleteQuestion, addQuestionToAssignment, updateQuestion, getQuestionsByAssignment };
