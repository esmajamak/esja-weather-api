const express = require("express");
const axios = require("axios");
const router = express.Router();
const cache = require("memory-cache");

const { authenticateUser } = require("../../../users/auth");

router.get("/", async (req, res) => {
  if (
    !req.headers.authorization ||
    !(await authenticateUser(req.headers.authorization))
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const location = req.query.location;

  if (!location) {
    return res.status(400).json({ error: "Invalid location" });
  }

  try {
    const cacheKey = `currentWeather_${location}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      // If data is present in cache, return it -- Esma Jamak
      return res.json(cachedData);
    }

    const units = "metric"; // Specify the temperature unit as Celsius -- Esma Jamak

    // Make a GET request to OpenWeatherMap API
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          q: location,
          appid: "79a75fba1e0f45ad2daccdef50465c7f", // API key should be in .env file but for easier project explanation I left it here -- Esma Jamak
          units,
        },
      }
    );

    const weatherData = {
      location: response.data.name,
      temperature: response.data.main.temp,
      description: response.data.weather[0].description,
    };

    // Cache the weather data for a specific duration -- Esma Jamak
    cache.put(cacheKey, weatherData, 300 * 1000); // Cache duration: 300 seconds (5 minutes) -- Esma Jamak

    res.json(weatherData);
  } catch ({ response }) {
    console.error(response); // Logging info for easier error tracking down -- Esma Jamak
    res.status(response.data.cod).json({ error: response.data.message });
  }
});

module.exports = router;
