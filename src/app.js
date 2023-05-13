const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

// Require route files
const currentWeatherRoute = require("./routes/weather/current/getCurrentWeather");
const forecastWeatherRoute = require("./routes/weather/forecast/getForecastWeather");
const historicalWeatherRoute = require("./routes/weather/history/getHistoricalWeather");

// Use route files as middleware
app.use("/weather/current", currentWeatherRoute);
app.use("/weather/forecast", forecastWeatherRoute);
app.use("/weather/history", historicalWeatherRoute);

// Add Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = app;
