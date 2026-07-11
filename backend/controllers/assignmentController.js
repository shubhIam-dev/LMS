const Assignment = require("../models/assignments.model");

function addAssignment(req, res) {
    let assignment = new Assignment(req.body);
    assignment.save()
        .then(() => {
            res.json({ msg: 'Assignment added successfully' });
        })
        .catch((err) => {
            res.status(500).json({ msg: 'Error adding assignment', error: err });
        });
}

function deleteAssignment(req, res) {
    const { id } = req.body;
    Assignment.deleteOne({ _id: id })
        .then((data) => {
            res.json({ msg: 'Assignment deleted', data });
        })
        .catch((err) => {
            res.status(500).json({ msg: 'Error deleting assignment', error: err });
        });
}

function getAllAssignments(req, res) {
    Assignment.find()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ msg: 'Error fetching assignments', error: err });
        });
}

module.exports = { addAssignment, deleteAssignment, getAllAssignments };

