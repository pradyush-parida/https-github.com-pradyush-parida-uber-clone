const express = require('express')
const router = express.Router()
const {body,query} = require('express-validator')
const rideController = require('../controllers/ride.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/create',authMiddleware.authUser,[
    body('pickup').isString().isLength({min:3}).withMessage('Pickup location must be at least 3 characters long.'),
    body('destination').isString().isLength({min:3}).withMessage('Destination location must be at least 3 characters long.'),
    body('vehicleType').isString().isIn(['car', 'moto', 'auto']).withMessage('Vehicle type must be one of the following: car, moto, auto.')
], rideController.createRide)

router.get('/get-fare', authMiddleware.authUser, [
    query('pickup').isString().isLength({min:3}).withMessage('Pickup location must be at least 3 characters long.'),
    query('destination').isString().isLength({min:3}).withMessage('Destination location must be at least 3 characters long.'),
], rideController.getFare)

router.post('/confirm',authMiddleware.authCaptain,[
    body('rideId').isMongoId().withMessage('Invalid ride ID.')
], rideController.confirmRide)

module.exports = router