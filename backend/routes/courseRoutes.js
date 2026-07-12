let express = require("express")
let { addCourse, updateCourseById, deleteCourse, addCourses, getCourseById, getAllCourses, enrollStudent } = require("../controllers/courses.controllers.js")
let { authenticate, authorize } = require("../middleware/auth")

const router = express.Router()

// Any signed-in user can read the catalog.
router.get("/getAllCourses", authenticate, getAllCourses)
router.get("/getCourseById", authenticate, getCourseById)

// Creating / editing courses and enrolling students is staff-only.
const staff = [authenticate, authorize("teacher", "superadmin")]
router.post("/addCourse", staff, addCourse)
router.post("/addCourses", staff, addCourses)
router.post("/updateCourseById", staff, updateCourseById)
router.post("/deleteCourse", staff, deleteCourse)   // was GET — POST is correct for a mutation
router.post("/enrollStudent", staff, enrollStudent)

module.exports = router;
