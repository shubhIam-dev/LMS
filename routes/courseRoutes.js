let router = require('express').Router();
let { addCourse,getCourseById,updateCourse,deleteCourse} = require('../controllers/courseController');

router.post('/addCourse', addCourse);
router.get('/getCourse/:id', getCourseById);
router.put('/updateCourse/:id', updateCourse);
router.delete('/deleteCourse/:id', deleteCourse);

module.exports = router;