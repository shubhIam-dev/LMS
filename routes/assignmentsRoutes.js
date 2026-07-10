let express=require("express");
let {addAssignment,deleteAssignment} = require('../controllers/assignmentController.js')

const router=express.Router()

router.post('/addAssignment', addAssignment)
router.post('/deleteAssignment',deleteAssignment)
module.exports=router