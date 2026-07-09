let mongoose = require('mongoose');

let courseSchema = new mongoose.Schema({

        title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    instructor: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: String,
        required: true
    }
})


let course=module.exports = mongoose.model("Course", courseSchema);
module.exports = course;
