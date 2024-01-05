const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name']
    }, 
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail, 'Invalid email type']
    },
    phone: {
        type: String,
        minLength: [10, 'There should be a 10 digit number'],
        maxLength: [10, 'There should be a 10 digit number'],
    },
    password: {
        type: String,
        required: [true, 'Please create a password'],
        minLength: 8,
    },
    confirmPassword: {
        type: String,
        required: [true, 'Re-enter your password'],
        minLength: 8,
        validate: {
            validator: function(el){
                return el === this.password
            },
            message: 'Passwords are not the same'
        }
    }, 
    passwordChangedAt: Date,
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
})


userSchema.pre('save', function(next){
    if(!(this.isModified('password')) || this.isNew) return next()

    this.passwordChangedAt = Date.now() + 3000;

    next()
}) 

// ENCRYPTING PASSWORD
userSchema.pre('save', async function(next){
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)
    this.confirmPassword = undefined
    next()
})

// CHECKING PASSWORD SAME OR NOT
userSchema.methods.correctPassword = async function(candidatePass, userPass){
    const compare =  await bcrypt.compare(candidatePass, userPass)
    return compare
}

// CHECKING FOR PASSWORD EXPIRY
userSchema.methods.passwordChangedAfter = function(JWTTimeStamp){
  if(this.passwordChangedAt){
    const passwordChangeStamp =  parseInt (this.passwordChangedAt.getTime() / 1000 , 10)
  const bool = JWTTimeStamp < passwordChangeStamp
  return bool
}
}

const User = mongoose.model('User', userSchema)

module.exports = User