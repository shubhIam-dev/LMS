let Course=require("../models/Courses.model.js")

function addCourse(req,res){
    const{CourseName,CourseCode}=req.body

    if(!CourseName || !CourseCode){
        return res.send("ALL FEILDS ARE REQUIRED")
    }

    let newCourse= new Course({
        CourseName,
        CourseCode
    })

    newCourse.save()
    res.json({
        message: 'User registered successfully',
        CourseName:newCourse.CourseName,
        CourseCode:newCourse.CourseCode
      })

}

function updateCourseById(req,res){
    const{_id,CourseName,CourseCode}=req.body
    Course.updateOne({_id},
        {CourseName,CourseCode},
    ).then((data)=>{res.json(data)})
}

function deleteCourse(req,res){
    const{_id,CourseName,CourseCode}=req.body
    Course.deleteOne({_id}).then((data)=>{res.json(data)})
}

function addCourses(req,res){
    Course.insertMany(req.body)
    res.json({message:"Added all the Courses"})
}

function getCourseById(req,res){
  const{_id}=req.body
    Course.findById({_id})
    .then((data)=>{res.json(data)})
}

function getAllCourses(req,res){
    Course.find().then((data)=>{res.json(data)})
}

module.exports={addCourse,updateCourseById,deleteCourse,addCourses,getCourseById,getAllCourses}

