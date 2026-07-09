const express = require("express");
const router = express.Router();
const { addCourse,updateCourse,deleteCourse,addCourses,getCourse,getAllCourses} = require("../controllers/courses.controller");
router.post('/addCourse',addCourse)
router.post('/updateCourse/:id',updateCourse)
router.get('/deleteCourse/:id',deleteCourse)
router.post('/addCourses',addCourses)
router.get('/getCourse/:id',getCourse)
router.get('/getAllCourses',getAllCourses)
module.exports = router