const Assignment = require("../models/assignments.model");

function addAssignment(req, res) {
    let assignment = new Assignment(req.body);
    assignment.save()
        .then(() => {
            res.json({ msg: 'Assignment added successfully' });
        })
        .catch((err) => {
            res.status(500).json({ msg: 'Error adding assignment', error: err });
        });
}

function deleteAssignment(req, res) {
    const { id } = req.body;
    Assignment.deleteOne({ _id: id })
        .then((data) => {
            res.json({ msg: 'Assignment deleted', data });
        })
        .catch((err) => {
            res.status(500).json({ msg: 'Error deleting assignment', error: err });
        });
}

function getAllAssignments(req, res) {
    Assignment.find().populate("questions")
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ msg: 'Error fetching assignments', error: err });
        });
}

function getAllAssignmentsByCourse(req,res){
    const{courseId}=req.params
    Assignment.find({courseId:courseId})
    .populate("questions")
    .then((data)=>res.json(data))
    .catch(err=>res.status(500).json({msg:"Error",error:err.message}))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
}
function UpdateAssignment(req,res){
    const{id}=req.params
    const updateData=req.body
    Assignment.findByIdAndUpdate(id,updateData,{new:true})
    .populate("questions")
    .then((data)=>{
        if (!data){
            return res.status(404).json({msg:"Not Found"})
        }else{
            return res.status(200).json({msg:"Updated", assignment: data})
        }
    })
    .catch(err => res.status(500).json({msg:"Error", error: err.message}))
}

module.exports = { addAssignment, deleteAssignment, getAllAssignments,getAllAssignmentsByCourse,UpdateAssignment};

