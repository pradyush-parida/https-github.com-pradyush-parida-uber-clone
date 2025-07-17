const rideService = require('../services/ride.service')
const {validationResult} = require('express-validator')
const mapsService = require('../services/maps.service')
const {sendMessageToSocketId} = require('../socket')
const rideModel = require('../models/ride.model')

module.exports.createRide = async(req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({errors: error.array()});
    }
    const {userId, pickup, destination, vehicleType} = req.body;
    try {
        const ride = await rideService.createRide({
            user: req.user._id, // Assuming user is authenticated and user ID is available in req.user
            pickup,
            destination,
            vehicleType,
            // otp
        });

        const pickupCoordinates = await mapsService.getAddressCoordinate(pickup);
        // console.log(pickupCoordinates)
        if (!pickupCoordinates) {
            return res.status(400).json({message: 'Invalid pickup location.'});
        }
        const captainsInRadius = await mapsService.getCaptainsInTheRadius(pickupCoordinates.lat, pickupCoordinates.lng, 5); // 5 km radius

        if (captainsInRadius.length === 0) {
            return res.status(404).json({message: 'No captains available in your area.'});
        }
        // console.log(captainsInRadius);

        ride.otp = ""

        const rideWithUser = await rideModel.findById(ride._id).populate('user');

        captainsInRadius.map(captain => {
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: rideWithUser
            });
        });

        res.status(201).json({ride, captains: captainsInRadius});

    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

module.exports.getFare = async(req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({errors: error.array()});
    }
    const {pickup, destination} = req.query;
    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json({fare});
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
}

module.exports.confirmRide = async (req,res)=>{
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({errors: error.array()});
    }
    const {rideId} = req.body;
    console.log('confirmRide called. rideId:', rideId, 'captain:', req.captain);
    try {
        const ride = await rideService.confirmRide({rideId,captain:req.captain});
        console.log('rideService.confirmRide result:', ride);
        if (!ride) {
            return res.status(404).json({message: 'Ride not found or already confirmed.'});
        }

        // Notify the user about the ride confirmation
        if (!ride.user || !ride.user.socketId) {
            console.error('Ride user or socketId missing:', ride.user);
        } else {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-confirmed',
                data: ride
            });
        }
        return res.status(200).json(ride);
    } catch (error) {
        console.error('Error in confirmRide:', error);
        return res.status(500).json({error: error.message});
    }
}