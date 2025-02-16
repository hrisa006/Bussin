const axios = require("axios");

async function getCoordinates(stopName) {
  const apiKey = "AIzaSyBO6qDxZBuAahxt5CXHgt1ce1utzcit1Ok";
  const location = "42.6975,23.3242";
  const radius = 10000;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&type=bus_station&keyword=${encodeURIComponent(
    stopName
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const place = response.data.results[0];

    if (!place) {
      throw new Error(`Find bus stop failed: ${stopName}`);
    }

    return {
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    };
  } catch (error) {
    console.error("Error during search of a bus stop:", error);
    return null;
  }
}

module.exports = getCoordinates;
