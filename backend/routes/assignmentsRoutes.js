let express = require("express");
let {
    addAssignment,
    addQuestionsToAssignment,
    getAllAssignments,
    getAssignmentsByCourse,
    getAssignmentById,
    deleteAssignment
} = require('../controllers/assignmentController.js');

const router = express.Router();

router.post('/addAssignment', addAssignment);
router.post('/addQuestionsToAssignment', addQuestionsToAssignment);
router.get('/getAllAssignments', getAllAssignments);
router.get('/getByCourse', getAssignmentsByCourse);
router.get('/getAssignmentById', getAssignmentById);
router.post('/deleteAssignment', deleteAssignment);

module.exports = router;
