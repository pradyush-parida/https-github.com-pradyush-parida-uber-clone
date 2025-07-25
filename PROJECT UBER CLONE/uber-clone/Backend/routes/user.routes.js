const express = require('express')
const router = express.Router();
const {body} = require('express-validator')
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')
router.post('/register',[
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('email').notEmpty().withMessage('Email is required'),
    body('fullName.firstName').isLength({ min: 3 }).withMessage('First Name must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('password').notEmpty().withMessage('Password is required'),
],userController.registerUser)


router.post('/login',[
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
],userController.loginUser)

router.get('/profile',authMiddleware.authUser,userController.getUserProfile)
router.get('/logout',authMiddleware.authUser,userController.logoutUser)

module.exports = router;