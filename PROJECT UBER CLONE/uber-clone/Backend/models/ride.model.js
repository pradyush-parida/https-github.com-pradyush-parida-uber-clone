const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        // required: true
    },
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'captain',
        // required: true
    },
    pickup: { type: String, required: true, minlength: 3 },
    destination: { type: String, required: true, minlength: 3 },
    fare: { type: Number, required: true, min: 0 },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
        default: 'pending'
    },
    duration: { type: Number },
    distance: { type: Number },
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
    otp:{type:String,select:false,require:true},
});
module.exports = mongoose.model('ride', rideSchema);