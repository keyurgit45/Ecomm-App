const User = require('../models/user')
const jwt = require('jsonwebtoken')
const BigPromise = require('../middleware/bigPromise')

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    const token = req.cookies.token || req.header('Authorization').replace('Bearer ','') //bug

    if(!token) return next(new Error("Login first to access this Page."))

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    next()
})

exports.customRole = function (...roles) {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next( new Error('You are not allowed to access this route'))
        }
        next()
    }
}