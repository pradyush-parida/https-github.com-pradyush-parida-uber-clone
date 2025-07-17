const captainModel = require('../models/captain.model')
const captainService = require('../services/captain.service')
const {validationResult} = require('express-validator')
const blacklistTokenModel = require('../models/blacklistToken.model')

module.exports.registerCaptain = async (req,res,next)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {fullName,email,password,vehicle} = req.body;

    const existingCaptain = await captainModel.find({email});
    if(existingCaptain.length>0){
        return res.status(400).json({message:'Captain already exists'});
    }
    
    const existingVehicle = await captainModel.find({'vehicle.plate':vehicle.plate});
    if(existingVehicle.length>0){
        return res.status(400).json({message:'Vehicle with this plate already exists'});
    }

    try {
        const hashedPassword = await captainModel.hashPassword(password);
        const captain = await captainService.createCaptain({
            firstName: fullName.firstName,
            lastName: fullName.lastName,
            email,
            password:hashedPassword,
            ...vehicle
        });

        const token = captain.generateAuthToken();

        res.status(201).json({token,captain});
    } catch (error) {
        next(error);
    }
}

module.exports.loginCaptain = async (req,res,next)=>{
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {email,password} = req.body;
    const captain = await captainModel.findOne({email}).select('+password');

    if(!captain){
        res.status(401).json({message:'Invalid email or password'});
    }
    
    const isMatch = await captain.comparePassword(password);
    
    if(!isMatch){
        res.status(401).json({message:'Invalid email or password'});
    }

    const token = captain.generateAuthToken();

    res.cookie('token',token);
    res.status(200).json({token,captain});
    
}

module.exports.getCaptainProfile = async (req,res,next)=>{
    res.status(200).json(req.captain);
}

module.exports.logoutCaptain = async (req,res,next)=>{
    res.clearCookie('token')
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    await blacklistTokenModel.create({token});
    res.status(200).json({message:'Logged Out'})
}