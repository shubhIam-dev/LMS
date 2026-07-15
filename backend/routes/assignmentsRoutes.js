let express = require("express");
let {
    addAssignment,
    addQuestionsToAssignment,
    getAllAssignments,
    getAssignmentsByCourse,
    getAssignmentById,
    deleteAssignment,
    reuseAssignment
} = require('../controllers/assignmentController.js');

const router = express.Router();

router.get('/getAllAssignments', getAllAssignments);
router.get('/getByCourse', getAssignmentsByCourse);
router.get('/getAssignmentById', getAssignmentById);
router.post('/addAssignment', addAssignment);
router.post('/addQuestionsToAssignment', addQuestionsToAssignment);
router.post('/deleteAssignment', deleteAssignment);
router.post('/reuse', reuseAssignment);

module.exports = router;
