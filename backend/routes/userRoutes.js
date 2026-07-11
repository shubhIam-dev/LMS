// let Router = require('express').Router
let express=require("express")
// import { addUser } from '../controllers/users.controllers.js';
let {addUser,getUser, addUsers}=require("../controllers/users.controllers");

// console.log(addUser)
const router = express.Router();

router.post('/addUser',addUser)
router.get('/getUser',getUser)
router.post('/addUsers',addUsers)
module.exports = router;

