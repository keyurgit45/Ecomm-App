const express = require('express')

const router = express.Router()

const {
    signup, 
    login, 
    logout, 
    forgotPassword, 
    passwordReset,
    userDashboard,
    updatePassword,
    updateUserData,
    adminAllUsers,
    adminGetUser,
    adminDeleteUser,
    managerAllUsers,
    adminUpdateUserData
} = require("../controller/userController")

//middlewares
const { isLoggedIn, customRole } = require('../middleware/user')

//user routes
router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotpassword').post(forgotPassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userdashboard').get(isLoggedIn, userDashboard)
router.route('/password/update').post(isLoggedIn, updatePassword)
router.route('/userdashboard/update').post(isLoggedIn, updateUserData)

//admin routes
router.route('/admin/users').get(isLoggedIn,customRole('admin'), adminAllUsers)
router.route('/admin/user/:id')
.get(isLoggedIn,customRole('admin'), adminGetUser)
.put(isLoggedIn,customRole('admin'), adminUpdateUserData)
.delete(isLoggedIn, customRole('admin'), adminDeleteUser)


//manager routes
router.route('/manager/users').get(isLoggedIn,customRole('manager'), managerAllUsers)

module.exports = router