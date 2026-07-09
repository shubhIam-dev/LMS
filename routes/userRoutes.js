const express = require("express");
const router = express.Router();
const { addUser,getUser,addManyUsers} = require("../controllers/users.controller");
router.post("/addUser", addUser);
router.get('/getUser',getUser);
router.post('/addManyUsers',addManyUsers)

module.exports = router;