let mongoose=require("mongoose")

let coursesSchema= new mongoose.Schema({
    CourseName:{
        type:String,
        required:true
    },
    CourseCode:{
        type:String,
        required:true
    }
})

module.exports=mongoose.model("courses",coursesSchema)