let express = require("express");
let { addQuestion, addQuestions, getAllQuestions, getQuestionById, deleteQuestion, getQuestionsByAssignment, updateQuestion, addQuestionToAssignment } = require("../controllers/questionController.js");

const router = express.Router();

router.post("/addQuestion",   addQuestion);
router.post("/addQuestions",  addQuestions);       
router.get("/getAllQuestions", getAllQuestions);
router.get("/getQuestionById", getQuestionById);
router.post("/deleteQuestion", deleteQuestion);
router.get("/assignment/:assignmentId",getQuestionsByAssignment)
router.put("/update/:id",updateQuestion)
router.post("/addQuestionToAssignment",addQuestionToAssignment)

module.exports = router;
