let Course = require("../models/Course.schema")

   // new course 
let addCourse = async (req, res) => {
  try {
    let { title, description, instructor, duration } = req.body;

    if (!title || !description || !instructor || !duration) {
      return res.send({ message: 'All fields are required' });
    }

    let newCourse = new Course({
      title,
      description,
      instructor,
      duration,
    });

    await newCourse.save();
    res.status(201).send({ message: 'Course added successfully', course: newCourse });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
};


let getCourseById = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }
    res.status(200).send(course);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
};


let updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    let updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).send(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(400).send({ message: 'Update failed' });
  }
};

let deleteCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send({ message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: 'Course deleted successfully', id: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Server error' });
  }
};








module.exports = {addCourse,getCourseById,updateCourse,deleteCourse}














