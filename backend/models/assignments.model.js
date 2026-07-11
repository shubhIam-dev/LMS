let mongoose=require("mongoose")

let assignmentSchema= new mongoose.Schema({
questions:Array,
createdOn:Date,
dueOn:Date,
assignmentName:String,
assignmentType:String,
assignmentTopics:Array,


})

module.exports=mongoose.model("asignments",assignmentSchema)