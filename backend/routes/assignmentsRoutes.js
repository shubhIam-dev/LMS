let express = require("express");
let { addAssignment, deleteAssignment, getAllAssignments } = require('../controllers/assignmentController.js');

const router = express.Router();

router.post('/addAssignment', addAssignment);
router.post('/deleteAssignment', deleteAssignment);
router.get('/getAllAssignments', getAllAssignments);

module.exports = router;