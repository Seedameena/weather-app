// Get Weather
async function getWeather(selectedPlace = null) {
  try {
    const cityInput = document.getElementById("city");
    const weather = document.getElementById("weather");
    const suggestions = document.getElementById("suggestions");

    const city = cityInput.value.trim();

    if (city === "") {
      alert("Please enter a city name");
      return;
    }

    suggestions.innerHTML = "";

    weather.innerHTML = `
    <div class="loading">
        <h2>🌤️ Getting Weather...</h2>
        <p>Please wait while we fetch the latest weather data.</p>
        <div class="loader"></div>
    </div>
`;
    document.getElementById("forecast").innerHTML = "";
    weather.style.backgroundColor = "";
    document.getElementById("forecast").innerHTML = "";
    let place = selectedPlace;

    // Find city coordinates if no suggestion was selected
    if (!place) {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=100&language=en&format=json`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("City search failed");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        weather.innerHTML =
          "<p>City not found. Please enter a valid city name.</p>";
        return;
      }

      place =
        data.results.find(function (item) {
          return (
            item.name.toLowerCase() === city.toLowerCase() &&
            item.country_code === "IN"
          );
        }) ||
        data.results.find(function (item) {
          return item.country_code === "IN";
        }) ||
        data.results.find(function (item) {
          return item.name.toLowerCase() === city.toLowerCase();
        }) ||
        data.results[0];
    }

    const latitude = place.latitude;
    const longitude = place.longitude;

    // Fetch weather for the selected coordinates

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=auto`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Weather request failed");
    }

    const weatherData = await weatherResponse.json();

    const daily = weatherData.daily;

    const forecast = document.getElementById("forecast");

    function getCondition(code) {
      if (code === 0) return "☀️ Clear Sky";
      if (code === 1) return "🌤️ Mainly Clear";
      if (code === 2) return "⛅ Partly Cloudy";
      if (code === 3) return "☁️ Overcast";
      if ([45, 48].includes(code)) return "🌫️ Fog";
      if ([51, 53, 55, 56, 57].includes(code)) return "🌦️ Drizzle";
      if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️ Rain";
      if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️ Snow";
      if ([95, 96, 99].includes(code)) return "⛈️ Thunderstorm";
      return "🌡️ Unknown";
    }

    forecast.innerHTML = "<h2>7-Day Forecast</h2>";

    daily.time.forEach(function (date, index) {
      const condition = getCondition(daily.weather_code[index]);

      forecast.innerHTML += `
        <div class="forecast-card">
            <h3>${new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}</h3>
            <p>${condition}</p>
            <p>Max: ${daily.temperature_2m_max[index]} °C</p>
            <p>Min: ${daily.temperature_2m_min[index]} °C</p>
        </div>
    `;
    });

    console.log(daily);

    if (!weatherData.current) {
      throw new Error("Weather data unavailable");
    }
    
const localTime = new Date().toLocaleString("en-IN", {
    timeZone: weatherData.timezone,
    dateStyle: "medium",
    timeStyle: "short"
});


    const temperature = weatherData.current.temperature_2m;
    const humidity = weatherData.current.relative_humidity_2m;
    const weatherCode = weatherData.current.weather_code;
    const windSpeed = weatherData.current.wind_speed_10m;
    const feelsLike = weatherData.current.apparent_temperature;

    // Convert weather code to a readable condition
    let weatherCondition;

    switch (weatherCode) {
      case 0:
        weatherCondition = "Clear Sky ☀️";
        break;
      case 1:
        weatherCondition = "Mainly Clear 🌤️";
        break;
      case 2:
        weatherCondition = "Partly Cloudy ⛅";
        break;
      case 3:
        weatherCondition = "Overcast ☁️";
        break;
      case 45:
      case 48:
        weatherCondition = "Fog 🌫️";
        break;
      case 51:
      case 53:
      case 55:
        weatherCondition = "Drizzle 🌦️";
        break;
      case 56:
      case 57:
        weatherCondition = "Freezing Drizzle 🌧️";
        break;
      case 61:
      case 63:
      case 65:
        weatherCondition = "Rain 🌧️";
        break;
      case 66:
      case 67:
        weatherCondition = "Freezing Rain 🌧️";
        break;
      case 71:
      case 73:
      case 75:
      case 77:
        weatherCondition = "Snow ❄️";
        break;
      case 80:
      case 81:
      case 82:
        weatherCondition = "Rain Showers 🌦️";
        break;
      case 85:
      case 86:
        weatherCondition = "Snow Showers ❄️";
        break;
      case 95:
      case 96:
      case 99:
        weatherCondition = "Thunderstorm ⛈️";
        break;
      default:
        weatherCondition = "Weather condition unavailable";
    }

    weather.innerHTML = `
    <h2>${place.name}, ${place.country || "India"}</h2>
    <p class="main-temperature">🌡️ ${temperature} °C</p>
    <p class="feels-like">Feels Like: ${feelsLike} °C</p>
    <p>Humidity: ${humidity}%</p>
    <p>Wind Speed: ${windSpeed} km/h</p>
    <p>Condition: ${weatherCondition}</p>
    <p>Local Time: ${localTime}</p>
`;

    const condition = weatherCondition.toLowerCase();

    if (condition.includes("rain")) {
      weather.style.backgroundColor = "#dbeafe";
    } else if (condition.includes("cloud")) {
      weather.style.backgroundColor = "#e5e7eb";
    } else if (condition.includes("clear")) {
      weather.style.backgroundColor = "#fff7d6";
    } else {
      weather.style.backgroundColor = "#ffffff";
    }
  } catch (error) {
    document.getElementById("weather").innerHTML = `
        <div class="error-message">
            <h2>⚠️ Oops!</h2>
            <p>Unable to fetch weather data.</p>
            <p>Please check your internet connection and try again.</p>
        </div>
    `;
    document.getElementById("forecast").innerHTML = "";
    console.error("Weather error:", error);
  }
}

// Show city suggestions
async function showSuggestions() {
  const city = document.getElementById("city").value.trim();
  const suggestions = document.getElementById("suggestions");

  suggestions.innerHTML = "";

  if (city.length < 2) {
    return;
  }

  try {
    // First search with Open-Meteo
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=100&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Open-Meteo city search failed");
    }

    const data = await response.json();

    let indianCities = (data.results || []).filter(function (place) {
      return place.country_code === "IN";
    });

    // If no Indian matches, try Nominatim restricted to India
    if (indianCities.length === 0) {
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(city + ", India")}&countrycodes=in&limit=10&addressdetails=1`;

      const fallbackResponse = await fetch(fallbackUrl);

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();

        indianCities = fallbackData
          .filter(function (place) {
            return place.address && place.address.country_code === "in";
          })
          .map(function (place) {
            const address = place.address;

            return {
              name:
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                place.name,
              admin1: address.state || "",
              country: "India",
              country_code: "IN",
              latitude: Number(place.lat),
              longitude: Number(place.lon),
            };
          });
      }
    }

    // Remove duplicate city/state combinations
    const uniqueCities = [];
    const seenCities = new Set();

    indianCities.forEach(function (place) {
      const key = `${place.name.toLowerCase()}-${place.admin1 || ""}`;

      if (!seenCities.has(key)) {
        seenCities.add(key);
        uniqueCities.push(place);
      }
    });

    // Show a maximum of 5 suggestions
    uniqueCities.slice(0, 5).forEach(function (place) {
      const item = document.createElement("p");

      item.textContent = [place.name, place.admin1, place.country || "India"]
        .filter(Boolean)
        .join(", ");

      item.addEventListener("click", function () {
        document.getElementById("city").value = place.name;
        suggestions.innerHTML = "";

        // Use the selected place's coordinates directly
        getWeather({
          name: place.name,
          country: place.country || "India",
          latitude: place.latitude,
          longitude: place.longitude,
        });
      });

      suggestions.appendChild(item);
    });

    console.log("Typed city:", city);
    console.log("Indian suggestions:", uniqueCities);
  } catch (error) {
    console.error("Suggestion error:", error);
  }
}

// Search suggestions while typing
document.getElementById("city").addEventListener("input", showSuggestions);

// Search when Enter is pressed
document.getElementById("city").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    getWeather();
  }

  if (event.key === "Escape") {
    document.getElementById("suggestions").innerHTML = "";
  }
});

// Clear search and weather

function clearWeather() {
  document.getElementById("city").value = "";
  document.getElementById("weather").innerHTML = "";
  weather.style.backgroundColor = "";
  document.getElementById("forecast").innerHTML = "";
  document.getElementById("suggestions").innerHTML = "";

  document.getElementById("city").focus();
}

// Close suggestions when clicking outside
document.addEventListener("click", function (event) {
  const autocomplete = document.querySelector(".autocomplete");

  if (autocomplete && !autocomplete.contains(event.target)) {
    document.getElementById("suggestions").innerHTML = "";
  }
});
