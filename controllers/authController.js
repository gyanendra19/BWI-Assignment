const User = require('../model/userModel')
const catchAsync = require('../utils/catchAsync')
const appError = require('../utils/appError')
const jwt = require('jsonwebtoken')
const {promisify} = require('util')

//CREATE TOKEN FUNCTION
const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET_SIGN, {
        expiresIn: process.env.JWT_EXPIRY
    })
}

// USER SIGNUP
exports.signup = catchAsync( async (req, res, next) => {
    if(req.file) req.body.photo = req.file.filename
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        phone: req.body.phone,
        photo: req.body.photo,
    })

    const token = signToken(newUser._id)

    res.status(201).json({
        status: 'success',
        token,
        data: newUser
    })
})

// ADMIN SIGNUP
exports.signupAdmin = catchAsync( async ( req, res, next) => {
    if(!req.body.role) req.body.role = 'admin';
    const admin = await User.create(req.body)

    const token = signToken(admin._id)

    res.status(201).json({
        status: "success",
        token,
        data: admin
    })
})

// LOGIN
exports.login = catchAsync( async (req, res, next) => {
    let user;
    const {email, phone, password} = req.body;

    if((!email && !phone) || !password){
        return next(new appError('Please provide email/phone or password', 401))
    }

    if(email){
         user = await User.findOne({email})
    }else{
         user = await User.findOne({phone})
    }

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new appError('Invalid email/phone or password', 400))
    }

    const token = signToken(user._id)

    res.status(200).json({
        status: 'success',
        token,
        data: user
    })
})


// AUTHENTICATION
exports.protect = catchAsync( async (req, res, next) => {
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }

    if(!token){
        return next(new appError('You are not logged in', 401))
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_SIGN)
    const currentUser = await User.findById(decoded.id)

    if(!currentUser){
        return next(new appError('No user with this token', 404))
    }

    if(currentUser.passwordChangedAfter(decoded.iat)){
        return next(new appError('Password changed. Login again', 403))
    }

    req.user = currentUser
    next()
})


// AUTHORIZATION
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new appError('You are not allowed', 403))
        }
        next()
    }
}


// PASSWORD UPDATE
exports.updateMyPassword = catchAsync( async (req, res, next) => {
    const { password, currentPassword, confirmPassword } = req.body;

    if(!password || !currentPassword || !confirmPassword){
        return next(new appError('currentPassword, password and confirmPassword are the required fields', 405))
    }

    const user = await User.findById(req.user._id)

    if(!user){
        return next(new appError('No user exist', 404))
    }

    if(!(await user.correctPassword(currentPassword, user.password))){
        return next(new appError('Invalid currentPassword', 405))
    }

    user.password = password;
    user.confirmPassword = confirmPassword
    await user.save() 

    const token = signToken(user._id)

    res.status(200).json({
        status: "success",
        token,
        data: user
    })
})

