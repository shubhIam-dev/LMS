const Course = require('../models/courses.model')
const addCourse = async(req,res)=>{
    try{
        const newCourse = new Course({
            courseName:req.body.courseName,
            courseID:req.body.courseID,
            courseDuration:req.body.courseDuration,
            courseAccess:req.body.courseAccess,  
        })
        await newCourse.save()
        res.status(201).json(newCourse)
    }
    catch(err){
        console.log(err)
        res.status(500).json({
            message: ('server error')
        })
    }
}
const updateCourse = async(req,res)=>{
    try{
        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
        );
         if(!updatedCourse){
            return res.status(404).json({
                message:"Course not found"
            });

        }
        res.json(updatedCourse);
    }
    catch(err){
        console.log(err)
        res.status(500).json(
            {message:('server error')}
        )
    }
}

const deleteCourse = async(req,res)=>{
    try{
        const deletedCourse = await Course.findByIdAndDelete(
            req.params.id
        );
        if(!deletedCourse){
            return res.status(404).json({
                message:"Course not found"
            });
        }
        res.json({
            message:"Course deleted successfully"
        });
    }

    catch(err){
        console.log(err);
        res.status(500).json({
        message:"server error"
        });
    }

}

const addCourses = async(req,res)=>{
    try{
        const addedcourses = await Course.insertMany(
            req.body);
        res.status(201).json(addedcourses);
    } 
    catch(err){
        console.log(err)
        res.status(500).json({
            message: ('server error')
        })
    }
}
const getCourse = async (req,res)=>{
    try{const gotcourse = await Course.findById(
        req.params.id
    )
    if(!gotcourse){
    return res.status(404).json({
    message:"Course not found"})    
    }
    res.json(gotcourse); }

       catch(err){
        console.log(err);
        res.status(500).json({
            message:"server error"
        });

    }
}


const getAllCourses = async (req,res)=>{
    try{
        const getAllCourse = await Course.find()
        res.json(getAllCourse)
    }
    catch(err){
        res.status(500).json({
            message:"server error"
        });
    }
}

module.exports = { addCourse,updateCourse,deleteCourse,addCourses,getCourse,getAllCourses}