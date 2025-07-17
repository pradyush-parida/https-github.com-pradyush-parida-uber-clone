const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const mapsController = require('../controllers/maps.controller')
const {query} = require('express-validator')

router.get('/get-coordinates', authMiddleware.authUser, [
    query('address').isString().isLength({ min: 3 }).withMessage('Address is required'),
], mapsController.getCoordinates)

router.get('/get-distance-time', authMiddleware.authUser, [
    query('origin').isString().isLength({ min: 3 }).withMessage('Origin is required'),
    query('destination').isString().isLength({ min: 3 }).withMessage('Destination is required'),
], mapsController.getDistanceAndTime)

router.get('/get-suggestions', authMiddleware.authUser, [
    query('input').isString().isLength({ min: 3 }).withMessage('Input is required'),
], mapsController.getSuggestions)

module.exports = router