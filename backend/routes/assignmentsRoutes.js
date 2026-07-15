let express = require("express");
let { addAssignment, deleteAssignment, getAllAssignments, getAllAssignmentsByCourse, UpdateAssignment} = require('../controllers/assignmentController.js');

const router = express.Router();

router.post('/addAssignment', addAssignment);
router.post('/deleteAssignment', deleteAssignment);
router.get('/getAllAssignments', getAllAssignments);
router.get('/course/:courseId',getAllAssignmentsByCourse)
router.put('/update/:id',UpdateAssignment)
module.exports = router;