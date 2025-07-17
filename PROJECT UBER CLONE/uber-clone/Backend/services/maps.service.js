const axios = require('axios')
const captainModel = require('../models/captain.model')
// /**
//  * Get coordinates (latitude, longitude) for a given address using Google Maps Geocoding API.
//  * @param {string} address - The address to geocode.
//  * @returns {Promise<{lat: number, lng: number}>} Coordinates object.
//  */
async function getAddressCoordinate(address) {
  const apiKey = process.env.GOOGLE_MAP_API
  const url = `https://maps.googleapis.com/maps/api/geocode/json`
  try {
    const response = await axios.get(url, {
      params: {
        address,
        key: apiKey
      }
    })
    const results = response.data.results
    if (results && results.length > 0) {
      const { lat, lng } = results[0].geometry.location
      return { lat, lng }
    } else {
      throw new Error('No results found for the given address.')
    }
  } catch (error) {
    throw new Error('Failed to fetch coordinates: ' + error.message)
  }
}

// /**
//  * Get distance and time between origin and destination using Google Maps Distance Matrix API.
//  * @param {string} origin - The starting address or "lat,lng".
//  * @param {string} destination - The destination address or "lat,lng".
//  * @returns {Promise<{distance: string, duration: string}>}
//  */
async function getDistanceAndTime(origin, destination) {
    if(!origin || !destination) {
        throw new Error('Origin and destination are required.')
    }
  const apiKey = process.env.GOOGLE_MAP_API
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json`
  try {
    const response = await axios.get(url, {
      params: {
        origins: origin,
        destinations: destination,
        key: apiKey
      }
    })
    const data = response.data
    if (
      data.rows &&
      data.rows.length > 0 &&
      data.rows[0].elements &&
      data.rows[0].elements.length > 0 &&
      data.rows[0].elements[0].status === "OK"
    ) {
      const element = data.rows[0].elements[0]
      return {
        distance: { text: element.distance.text, value: element.distance.value },
        duration: { text: element.duration.text, value: element.duration.value }
      }
    } else {
      throw new Error('No results found for the given origin and destination.')
    }
  } catch (error) {
    throw new Error('Failed to fetch distance and time: ' + error.message)
  }
}

async function getAddressSuggestions(input) {
    if(!input || input.length < 3) {
        throw new Error('Input must be at least 3 characters long.')
    }
  const apiKey = process.env.GOOGLE_MAP_API
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`
  try {
    const response = await axios.get(url, {
      params: {
        input,
        key: apiKey
      }
    })
    const predictions = response.data.predictions
    return predictions.map(prediction => prediction.description)
    // return response.data.predictions
  } catch (error) {
    throw new Error('Failed to fetch address suggestions: ' + error.message)
  }
}

async function getCaptainsInTheRadius(lat,lng, radius) {
  // console.log(lat,lng, radius)
  const captains = await captainModel.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius / 6378.1] // radius in kilometers
      }
    }
  })
  // .select('name email phoneNumber vehicleType vehicleNumber location')
  return captains
}

module.exports = { getAddressCoordinate, getDistanceAndTime, getAddressSuggestions, getCaptainsInTheRadius }

