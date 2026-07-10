const Assignment=require("../models/assignments.model")
function addAssignment(req,res){
    let assignment = new Assignment(req.body);
    assignment.save()
    .then(()=>{
        res.json({msg: 'assignment added'})
    })
}
function deleteAssignment(req,res){
    
}
module.exports={addAssignment,deleteAssignment}

