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
    const cacheKey = `forecastWeather_${location}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      // If data is present in cache, return it -- Esma Jamak
      return res.json(cachedData);
    }

    const units = "metric"; // Specify the temperature unit as Celsius -- Esma Jamak

    // Make a GET request to OpenWeatherMap API -- Esma Jamak
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: location,
          appid: "79a75fba1e0f45ad2daccdef50465c7f", // API key should be in .env file but for easier project explanation I left it here -- Esma Jamak
          units,
        },
      }
    );

    // Extract relevant forecast data from the API response -- Esma Jamak
    const forecastData = {
      location: response.data.city.name,
      forecast: response.data.list.map((item) => ({
        date: item.dt_txt,
        temperature: item.main.temp,
        description: item.weather[0].description,
      })),
    };

    // Cache the forecast data for a specific duration
    cache.put(cacheKey, forecastData, 300 * 1000); // Cache duration: 300 seconds (5 minutes)

    res.json(forecastData);
  } catch ({ response }) {
    console.error(response); // Logging info for easier error tracking down -- Esma Jamak
    res.status(response.data.cod).json({ error: response.data.message });
  }
});

module.exports = router;
