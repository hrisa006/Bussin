require("dotenv").config();
const axios = require("axios");

async function getCoordinates(stopName) {
  const apiKey = process.env.API_KEY;
  const address = encodeURIComponent(`${stopName}, София`);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const location = response.data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  } catch (err) {
    console.error("Failed locating:", error);
    return null;
  }
}

module.exports = getCoordinates;
