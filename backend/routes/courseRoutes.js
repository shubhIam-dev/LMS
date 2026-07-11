let express=require("express")
let {addCourse,updateCourseById,deleteCourse,addCourses,getCourseById, getAllCourses, enrollStudent}=require("../controllers/courses.controllers.js")
const router=express.Router()

router.post("/addCourse",addCourse)
router.post("/updateCourseById",updateCourseById)
router.get("/deleteCourse",deleteCourse)
router.post("/addCourses",addCourses)
router.get("/getCourseById",getCourseById)
router.get("/getAllCourses",getAllCourses)
router.post("/enrollStudent",enrollStudent)
module.exports=router;