let express = require("express");
let { addMarks, getMarksByStudent, getAllMarks } = require("../controllers/marksController.js");

const router = express.Router();

router.post("/addMarks", addMarks);
router.get("/getMarksByStudent", getMarksByStudent);
router.get("/getAllMarks", getAllMarks);

module.exports = router;
