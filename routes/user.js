const express = require('express')

const router = express.Router()

const {
    signup, 
    login, 
    logout, 
    forgotPassword, 
    passwordReset,
    userDashboard,
    updatePassword
} = require("../controller/userController")

//middlewares
const { isLoggedIn } = require('../middleware/user')

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotpassword').post(forgotPassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userdashboard').get(isLoggedIn, userDashboard)
router.route('/password/update').post(isLoggedIn, updatePassword)
router.route('/userdashboard/update').post(isLoggedIn, updateUserData)

module.exports = router