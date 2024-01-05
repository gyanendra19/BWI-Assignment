const multer = require('multer')
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync')


const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    console.log(file)
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new appError('Upload images', 404), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next()
    console.log(req.file)

    req.file.filename = `user-${Date.now()}.jpeg`
    await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90}).toFile(`img/${req.file.filename}`)

    next()
})