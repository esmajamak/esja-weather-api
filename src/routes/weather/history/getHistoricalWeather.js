const express = require("express");
const axios = require("axios");
const router = express.Router();
const cache = require("memory-cache");

const { authenticateUser } = require("../../../users/auth");

router.get("/", async (req, res) => {
  console.log("jdsajdaj");
  if (
    !req.headers.authorization ||
    !(await authenticateUser(req.headers.authorization))
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log("jksodkaod");
  const longitude = req.query.longitude;
  const latitude = req.query.latitude;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  if (!longitude || !latitude || !startDate || !endDate) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  try {
    const cacheKey = `historicalWeather_${longitude}_${latitude}_${startDate}_${endDate}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      // If data is present in cache, return it -- Esma Jamak
      return res.json(cachedData);
    }

    const units = "metric"; // Specify the temperature unit as Celsius -- Esma Jamak
    // Make a GET request to OpenWeatherMap API -- Esma Jamak
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/onecall/timemachine",
      {
        params: {
          lat: latitude,
          lon: longitude,
          dt: 1586468027,
          appid: "79a75fba1e0f45ad2daccdef50465c7f", // API key should be in .env file but for easier project explanation I left it here -- Esma Jamak
          units,
        },
      }
    );

    const historicalData = {
      location: response.data.timezone,
      startDate: startDate,
      endDate: endDate,
      data: response.data.hourly.map((item) => ({
        timestamp: item.dt,
        temperature: item.temp,
        description: item.weather[0].description,
      })),
    };

    // Cache the historical weather data for a specific duration -- Esma Jamak
    cache.put(cacheKey, historicalData, 300 * 1000); // Cache duration: 300 seconds (5 minutes) -- Esma Jamak

    res.json(historicalData);
  } catch ({ response }) {
    console.error(response); // Logging info for easier error tracking down -- Esma Jamak
    res.status(response.data.cod).json({ error: response.data.message });
  }
});

module.exports = router;
