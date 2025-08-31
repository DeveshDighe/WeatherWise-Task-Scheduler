const axios = require('axios');

const makeOpenWeatherApiCall = async (city) => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERAPI}&units=metric`
        );
        return response.data.weather;
    } catch (error) {
        let reason = "Unknown error";

        if (error.response) {
            // API responded with a status outside 2xx
            reason = error.response.data?.message || `API returned status ${error.response.status}`;
        } else if (error.request) {
            // No response received
            reason = "No response from weather service";
        } else {
            // Something else went wrong while setting up request
            reason = error.message;
        }

        console.log("Weather API failed:", reason);

        // Instead of throwing, return a safe object/message
        return { error: true, message: `Weather API failed: ${reason}` };
    }
};

module.exports = {
    makeOpenWeatherApiCall
};
