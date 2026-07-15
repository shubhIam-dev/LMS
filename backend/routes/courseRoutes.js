let express = require("express");
let { addCourse, updateCourseById, deleteCourse, addCourses, getCourseById, getAllCourses, enrollStudent, getCourseStudents } = require("../controllers/courses.controllers.js");

const router = express.Router();

router.post("/addCourse", addCourse);
router.post("/addCourses", addCourses);
router.post("/updateCourseById", updateCourseById);
router.post("/deleteCourse", deleteCourse);
router.post("/enrollStudent", enrollStudent);
router.get("/getAllCourses", getAllCourses);
router.get("/getCourseById", getCourseById);
router.get("/getStudents", getCourseStudents);

module.exports = router;
