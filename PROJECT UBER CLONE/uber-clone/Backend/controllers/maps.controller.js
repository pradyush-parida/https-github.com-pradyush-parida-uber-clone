const mapService = require('../services/maps.service');
const{validationResult} = require('express-validator');

module.exports.getCoordinates = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { address } = req.query;
    try {
        const coordinates = await mapService.getAddressCoordinate(address);
        if (!coordinates) {
            return res.status(404).json({ message: 'Coordinates not found for the given address.' });
        }
        res.status(200).json(coordinates);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports.getDistanceAndTime = async (req,res)=>{
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { origin, destination } = req.query;
        const result = await mapService.getDistanceAndTime(origin, destination);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports.getSuggestions = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { input } = req.query;
        const suggestions = await mapService.getAddressSuggestions(input);
        res.status(200).json(suggestions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};