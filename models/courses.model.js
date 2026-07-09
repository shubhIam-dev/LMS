const mongoose = require("mongoose")
let courseSchema = new  mongoose.Schema({
    courseName:{type:String,required:true},
    courseID:{type:String,required:true},
    courseAccess:{type:String,required:true},
    courseDuration:{type:String,required:true}
})

module.exports = mongoose.model('course',courseSchema)
