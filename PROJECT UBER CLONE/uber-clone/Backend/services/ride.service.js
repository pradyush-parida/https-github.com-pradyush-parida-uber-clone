const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto');


module.exports.getFare = async (pickup, destination) => {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    const distanceTime = await mapService.getDistanceAndTime(pickup, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };

    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto))
    };

    return fare;

}

function getOtp(num) {
    if (!num || num <= 0) throw new Error('OTP length must be a positive number');
    let otp = '';
    while (otp.length < num) {
        // Generate a random byte and convert to a digit
        const digit = crypto.randomInt(0, 10);
        otp += digit.toString();
    }
    return otp;
}


module.exports.createRide = async ({ user, pickup, destination, vehicleType }) => {

    if (!user || !pickup || !destination || !vehicleType) {
        throw new Error('All fields are required');
    }

    const fare = await module.exports.getFare(pickup, destination);

    const ride = rideModel.create(
        {
            user,
            pickup,
            destination,
            fare: fare[vehicleType],
            otp: getOtp(6),
            captain: null, // Initially no captain assigned
            // status: 'pending',
        }
    )

    return ride;
}

module.exports.confirmRide = async ({
    rideId, captain
}) => {
    if (!rideId) {
        throw new Error('Ride id is required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    }, {
        status: 'accepted',
        captain: captain._id
    })

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if (!ride) {
        throw new Error('Ride not found');
    }

    return ride;

}