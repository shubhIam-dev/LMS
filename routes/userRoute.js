let router = require('express').Router()
let {addUser, getUser,updateUser} = require('../controllers/userController');

router.post('/addUser', addUser);
router.get('/getUser', getUser)

// router.post('/updateUser', updateUser);
// router.get('/deleteUser', deleteUser);
module.exports = router;