let express = require("express");
let { addUser, getUser, addUsers } = require("../controllers/users.controllers");
let { register, login, me } = require("../controllers/authController");

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', me);
router.post('/addUsers', addUsers);
router.post('/addUser', addUser);
router.get('/getUser', getUser);

module.exports = router;
