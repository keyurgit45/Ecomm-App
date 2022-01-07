const BigPromise = require('../middleware/bigPromise')
const User = require('../models/user')
const cookieToken = require('../utils/cookieToken')
const fileUpload = require('express-fileupload')
const cloudinary = require('cloudinary')
const mailHelper = require('../utils/emailService')
const crypto = require('crypto')

exports.signup = BigPromise( async (req, res, next) => {

    if(!req.files) return next(new Error('Photo is required!'))

    const {name, email, password} = req.body
    if(!email || !name || !password) return next(new Error('Name, Email and Password are required!'))
   
    let file = req.files.photo
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {folder: 'users', width: 150 , crop: "scale"})

    const user = await User.create({name, email, password, photo: {
        id: result.public_id,
        secure_url: result.secure_url
    }})

    cookieToken(user, res)
})

exports.login = BigPromise( async (req, res, next) => {
    const {email, password} = req.body

    if(!email || !password) return next(new Error('Email and Password are required!'))

    const user =  await User.findOne({email}).select("+password")

    if(!user) return next(new Error("Password did not match or user doesn't exist"))

    const isPasswordCorrect = await user.isValidPassword(password)

    if(!isPasswordCorrect) return next(new Error("Password did not match or user doesn't exist"))

    cookieToken(user, res)

})

exports.logout = BigPromise((req, res, next) => {
    res.cookie('token', null, {
        expires : new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "logout success"
    })
})

exports.forgotPassword = BigPromise( async (req, res, next) => {
    const {email} = req.body

    const user = await User.findOne({email})

    if(!user) return next(new Error('User does not exist'))

    const forgotPasswordToken = user.getForgorPasswordToken()

    await user.save({validateBeforeSave: false})

    const myURL = `${req.protocol}://${req.get('Host')}/api/v1/password/reset/${forgotPasswordToken}`

    const message = `Copy paste this link in your browser and hit enter \n\n ${myURL}`

    try {
        await mailHelper({
            email: email,
            subject: 'Password reset email - Tshirt Store',
            message
        }) 
        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        })
    } catch (error) {
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined
        await user.save({validateBeforeSave: false})

        return next(new Error(error.message))
    }

})

exports.passwordReset = BigPromise( async (req, res, next) => {
    const token = req.params.token

    const encryToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
        encryToken,
        forgotPasswordExpiry: {
            $gt: Date.now()
        }
    })

    if(!user) return next(new Error('Token is invalid or Expired'))
    
    if(req.body.password !== req.body.confirmPassword) return next(new Error('Password and Confirm Password do not match'))

    user.password = req.body.password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    await user.save()

    cookieToken(user, res)

})

exports.userDashboard = BigPromise( async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json(user)
})

exports.updatePassword = BigPromise( async (req, res, next) => {
    const userId = req.user.id

    if(!req.body.oldPassword || !req.body.newPassword) return next( new Error ('Old and New passwords are required') )

    const user = await User.findById(userId).select("+password")

    const isCorrectOldPassword = user.isValidPassword(req.body.oldPassword)

    if(!isCorrectOldPassword) return next( new Error ('Password did not match') )

    user.password = req.body.newPassword

    await user.save()

    cookieToken(user, res)
})

exports.updateUserData = BigPromise( async (req, res, next) => {
    const userId = req.user.id

    if(!req.body.name || !req.body.email) return next( new Error ('Name and Email are required') )

    const newData = {
        name: req.body.name,
        email: req.body.email
    }

    if(req.files){

        const imageId = req.user.id

        await cloudinary.v2.uploader.destroy(imageId)

        const res = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {folder: 'users', width: 150 , crop: "scale"})
        
        newData.photo = {
            id: res.public_id,
            secure_url: res.secure_url
        }
    }

    await User.findByIdAndUpdate(userId, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})
