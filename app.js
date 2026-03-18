function updateClockAndDate() {
  const now = new Date();

  document.getElementById("clock").textContent = now.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit"
  });

  document.getElementById("date").textContent = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = "Guten Abend";

  if (hour < 5) greeting = "Gute Nacht";
  else if (hour < 12) greeting = "Guten Morgen";
  else if (hour < 18) greeting = "Guten Tag";

  document.getElementById("greeting").textContent = greeting;
}

function iconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function weatherClass(main) {
  switch (main) {
    case "Clear":
      return "weather-clear";
    case "Clouds":
      return "weather-clouds";
    case "Rain":
    case "Drizzle":
      return "weather-rain";
    case "Thunderstorm":
      return "weather-storm";
    case "Snow":
      return "weather-snow";
    default:
      return "weather-clouds";
  }
}

function groupForecastByDay(list) {
  const grouped = {};

  for (const item of list) {
    const date = new Date(item.dt * 1000);
    const key = date.toLocaleDateString("en-CA");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  return Object.values(grouped).slice(0, 5).map((entries) => {
    const midday = entries.find((e) => e.dt_txt.includes("12:00:00")) || entries[Math.floor(entries.length / 2)];
    const temps = entries.map((e) => e.main.temp);
    const rain = entries.reduce((sum, e) => sum + (e.rain?.["3h"] || 0), 0);
    const wind = Math.max(...entries.map((e) => e.wind.speed || 0));

    return {
      weekday: new Date(entries[0].dt * 1000).toLocaleDateString("de-DE", { weekday: "long" }),
      date: new Date(entries[0].dt * 1000).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" }),
      description: midday.weather?.[0]?.description?.replace(/^./, (m) => m.toUpperCase()) || "",
      icon: midday.weather?.[0]?.icon || "03d",
      tempMax: Math.round(Math.max(...temps)),
      tempMin: Math.round(Math.min(...temps)),
      rain: Math.round(rain * 10) / 10,
      wind: Math.round(wind * 3.6),
      weatherMain: midday.weather?.[0]?.main || "Clouds"
    };
  });
}

async function geocodeLocation() {
  const apiKey = CONFIG.OPENWEATHER_API_KEY;
  const queries = [
    "Plauesche Straße, Arnstadt, DE",
    "Arnstadt, DE"
  ];

  for (const q of queries) {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`
    );
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
  }

  throw new Error("Ort konnte nicht gefunden werden");
}

function renderWeather(days) {
  const weatherEl = document.getElementById("weather");

  weatherEl.innerHTML = days.map((day) => `
    <article class="weather-card ${weatherClass(day.weatherMain)}">
      <div class="weather-anim"></div>

      <div class="weather-top">
        <div class="weather-day">${day.weekday}</div>
        <div class="weather-date">${day.date}</div>
      </div>

      <div class="weather-icon-wrap">
        <img class="weather-icon" src="${iconUrl(day.icon)}" alt="${day.description}">
      </div>

      <div class="weather-desc">${day.description}</div>

      <div class="weather-temp">
        <span class="temp-max">${day.tempMax}°</span>
        <span class="temp-min">↓ ${day.tempMin}°</span>
      </div>

      <div class="weather-meta">
        <span>Niederschlag ${day.rain} mm</span>
        <span>Wind bis ${day.wind} km/h</span>
      </div>
    </article>
  `).join("");
}

async function loadWeather() {
  const apiKey = CONFIG.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey.includes("PASTE") || apiKey.includes("DEIN")) {
    document.getElementById("weather").innerHTML =
      '<div class="weather-error">Bitte zuerst deinen OpenWeather API-Key in der config.js eintragen.</div>';
    return;
  }

  try {
    const location = await geocodeLocation();
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric&lang=de`
    );
    const data = await res.json();

    if (!data.list) {
      throw new Error("Keine Wetterdaten erhalten");
    }

    renderWeather(groupForecastByDay(data.list));
  } catch (error) {
    console.error(error);
    document.getElementById("weather").innerHTML =
      '<div class="weather-error">Wetter konnte nicht geladen werden.</div>';
  }
}

updateClockAndDate();
updateGreeting();
loadWeather();

setInterval(updateClockAndDate, 1000);
setInterval(updateGreeting, 60000);
setInterval(loadWeather, 30 * 60 * 1000);
