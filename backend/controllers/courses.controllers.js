let Course=require("../models/Courses.model.js")
let User=require("../models/User.model.js")

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

// POST /course/enrollStudent
// Body: { courseId, studentId }
// A teacher enrolls a student in a course. This is a many-to-many link, so
// we update BOTH sides: the student appears in course.enrolledStudents AND
// the course appears in user.enrolledCourses. $addToSet prevents duplicates.
async function enrollStudent(req,res){
    try {
        const { courseId, studentId } = req.body;
        if (!courseId || !studentId) {
            return res.status(400).json({ msg: "courseId and studentId are required" });
        }

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ msg: "Course not found" });

        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ msg: "Student not found" });

        await Course.updateOne({ _id: courseId }, { $addToSet: { enrolledStudents: studentId } });
        await User.updateOne({ _id: studentId }, { $addToSet: { enrolledCourses: courseId } });

        res.json({ msg: "Student enrolled", courseId, studentId });
    } catch (err) {
        res.status(500).json({ msg: "Error enrolling student", error: err.message });
    }
}

module.exports={addCourse,updateCourseById,deleteCourse,addCourses,getCourseById,getAllCourses,enrollStudent}

