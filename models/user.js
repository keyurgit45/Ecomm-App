const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { log } = require('console')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password should be atleast 6 char'],
        select: false
    }, 
    photo: {
       id: {
           type: String,
           required: true
       },
       secure_url: {
           type: String,
           required: true
       }
    },
    role: {
        type: String,
        default: 'user'
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})

//encrypting password before saving - hooks
userSchema.pre('save' , async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10)
})

//validate the password with passed on user password
userSchema.methods.isValidPassword = async function (passSentByUser){
   return await bcrypt.compare(passSentByUser, this.password)
}

//create and return jwt token
userSchema.methods.getJwtToken = function() {
    // console.log(`Creating token with ${this._id}`);
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

//generate forgot password token (string)
userSchema.methods.getForgorPasswordToken = function() {
    // generate a long random string
    var token = crypto.randomBytes(20).toString('hex')

    //creating hash and storing it on database
    this.forgotPasswordToken = crypto.createHash('sha256').update(token).digest('hex')

    //setting forget password expiry of 20 minutes
    this.forgotPasswordExpiry = Date.time + 20 * 60 * 1000

    return token
}

module.exports = mongoose.model("User", userSchema)