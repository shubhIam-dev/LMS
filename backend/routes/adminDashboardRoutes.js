const express=require("express")
const {getAdminDashboard}=require("../controllers/adminDashboardController")
const {authenticate,authorize}=require("../middleware/auth")


const router = express.Router()
 
// Only superadmins can access the admin dashboard
router.get("/", authenticate, authorize("superadmin"), getAdminDashboard)
 
module.exports = router