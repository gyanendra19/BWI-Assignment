const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const photoController = require('../controllers/photoController')
const express = require('express')

const router = express.Router()

// USER SIGNUP
router.route('/signup').post(photoController.uploadUserPhoto, photoController.resizeUserPhoto, authController.signup) 
router.route('/signupAdmin').post(authController.signupAdmin) //ADMIN SIGNUP
router.route('/login').post(authController.login) // LOGIN

router.use(authController.protect)  // AUTHENTICATION FOR THE USER TO BE LOGGED IN
router.route('/updateMe').post(userController.updateMe)  // UPDATING PERSONAL USER DETAILS
router.route('/getMe').get(userController.getMe)  // RETRIEVING PERSONAL USER DETAILS
router.route('/deleteMe').delete(userController.deleteMe) // DELETING PERSONAL USER 
router.route('/updateMyPassword').post(authController.updateMyPassword) // UPDATING USER PASSWORD

router.use(authController.restrictTo('admin')) // ENDPOINTS RESTRICTED TO ADMIN
router.route('/').get(userController.allUsers) // GETTING ALL USERS
router.route('/:id').patch(photoController.uploadUserPhoto, photoController.resizeUserPhoto, userController.updateUser).delete(userController.deleteUser) // UPDATING AND DELETING USERS
module.exports = router