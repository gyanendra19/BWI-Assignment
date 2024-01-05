const User = require('../model/userModel')
const appError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')

// ALL USERS
exports.allUsers = catchAsync( async (req, res, next) => {
    const users = await User.find()
    
    if(!users){
        return next(new appError('No users availaible', 204))
    }

    res.status(200).json({
        status: 'success',
        data: users
    })
})

// UPDATE ALL USERS
exports.updateUser = catchAsync(async (req, res, next) => {

    if(req.body.password){
        return next(new appError('This route is not for updating passwords', 403))
    }

    req.body.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: updatedUser
    })
})

//DELETE ALL USER
exports.deleteUser = catchAsync(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status: 'success',
    })
})

// USER OWN UPDATE
exports.updateMe = catchAsync( async(req, res, next) => {
    if(req.body.email || req.body.phone){
        return next(new appError('Not allowed to change email or phone', 403))
    }

    const user = await User.findByIdAndUpdate(req.user._id, {
        name: req.body.name,
        photo: req.body.photo
    }, 
    {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: "success",
        data: user
    })

})

// USER OWN ACCOUNT
exports.getMe = catchAsync( async (req, res, next) => {
    const user = await User.findById(req.user._id)

    res.status(200).json({
        status: "success",
        data: user
    })

})

// DELETE OWN ACCOUNT
exports.deleteMe = catchAsync( async (req, res, next) => {
    await User.findByIdAndDelete(req.user._id)

    res.status(200).json({
        status: "success",
    })
})