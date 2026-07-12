let express = require("express");
let { addQuestion, addQuestions, getAllQuestions, getQuestionById, deleteQuestion } = require("../controllers/questionController.js");

const router = express.Router();

router.post("/addQuestion",   addQuestion);
router.post("/addQuestions",  addQuestions);       // bulk insert
router.get("/getAllQuestions", getAllQuestions);
router.get("/getQuestionById", getQuestionById);
router.post("/deleteQuestion", deleteQuestion);

module.exports = router;
