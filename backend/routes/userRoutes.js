// let Router = require('express').Router
let express=require("express")
// import { addUser } from '../controllers/users.controllers.js';
let {addUser, loginUser, getUser, addUsers}=require("../controllers/users.controllers");

const router = express.Router();

router.post('/addUser',addUser)
router.post('/login', loginUser)  // 🆕 NEW: Proper JWT login endpoint
router.get('/getUser',getUser)
router.post('/addUsers',addUsers)
module.exports = router;

