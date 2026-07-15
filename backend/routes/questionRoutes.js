let express = require("express");
let { addQuestion, addQuestions, getAllQuestions, getQuestionById, deleteQuestion } = require("../controllers/questionController.js");
<<<<<<< HEAD

const router = express.Router();

router.post("/addQuestion",   addQuestion);
router.post("/addQuestions",  addQuestions);       // bulk insert
router.get("/getAllQuestions", getAllQuestions);
router.get("/getQuestionById", getQuestionById);
router.post("/deleteQuestion", deleteQuestion);
=======
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Reads: any signed-in user.
router.get("/getAllQuestions", authenticate, getAllQuestions);
router.get("/getQuestionById", authenticate, getQuestionById);

// Writes: staff only (teachers build the question bank).
const staff = [authenticate, authorize("teacher", "superadmin")];
router.post("/addQuestion", staff, addQuestion);
router.post("/addQuestions", staff, addQuestions);
router.post("/deleteQuestion", staff, deleteQuestion);
>>>>>>> 378f46c862515ab3d7c8356f99efa49bf8fa34fa

module.exports = router;
