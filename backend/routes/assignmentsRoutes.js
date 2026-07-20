let express = require("express");
let { addAssignment, addQuestionsToAssignment, getAllAssignments, getAssignmentsByCourse, getAssignmentById, deleteAssignment, reuseAssignment, updateAssignmentById } = require('../controllers/assignmentController.js');
let { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Reads: any signed-in user.
router.get('/getAllAssignments', authenticate, getAllAssignments);
router.get('/getByCourse', authenticate, getAssignmentsByCourse);
router.get('/getAssignmentById', authenticate, getAssignmentById);

// Writes: staff only.
const staff = [authenticate, authorize("teacher", "superadmin")];
router.post('/addAssignment', staff, addAssignment);
router.post('/addQuestionsToAssignment', staff, addQuestionsToAssignment);
router.post('/deleteAssignment', staff, deleteAssignment);
router.post('/reuse', staff, reuseAssignment);
router.put('/updateAssignmentById', staff, updateAssignmentById)

module.exports = router;

