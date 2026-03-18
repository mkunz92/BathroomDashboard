function updateClock() {
  const now = new Date();
  document.getElementById("clock").textContent =
    now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
}

function updateGreeting() {
  const h = new Date().getHours();
  let g = "Guten Abend";
  if (h < 5) g = "Gute Nacht";
  else if (h < 12) g = "Guten Morgen";
  else if (h < 18) g = "Guten Tag";
  document.getElementById("greeting").textContent = g;
}

function iconUrl(icon) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

function groupForecastByDay(list) {
  const byDay = {};

  for (const item of list) {
    const date = new Date(item.dt * 1000);
    const key = date.toLocaleDateString("en-CA");
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(item);
  }

  return Object.entries(byDay).slice(0, 5).map(([key, entries]) => {
    const temps = entries.map((e) => e.main.temp);
    const chosen =
      entries.find((e) => e.dt_txt.includes("12:00:00")) ||
      entries[Math.floor(entries.length / 2)];

    const rain = entries.reduce((sum, e) => sum + (e.rain?.["3h"] || 0), 0);
    const wind = Math.max(...entries.map((e) => e.wind.speed || 0));

    return {
      key,
      weekday: new Date(entries[0].dt * 1000).toLocaleDateString("de-DE", {
        weekday: "long",
      }),
      date: new Date(entries[0].dt * 1000).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
      }),
      description:
        chosen.weather?.[0]?.description?.replace(/^./, (m) => m.toUpperCase()) ||
        "",
      icon: chosen.weather?.[0]?.icon || "03d",
      tempMax: Math.round(Math.max(...temps)),
      tempMin: Math.round(Math.min(...temps)),
      rain: Math.round(rain * 10) / 10,
      wind: Math.round(wind * 3.6),
      weatherMain: chosen.weather?.[0]?.main || "Clouds",
    };
  });
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

async function geocodeLocation() {
  const apiKey = CONFIG.OPENWEATHER_API_KEY;

  const queries = [
    "Plauesche Straße, Arnstadt, DE",
    "Arnstadt, DE",
  ];

  for (const q of queries) {
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      q
    )}&limit=1&appid=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: data[0].lat,
        lon: data[0].lon,
        name: data[0].name || "Arnstadt",
      };
    }
  }

  throw new Error("Ort konnte nicht gefunden werden");
}

function renderWeather(days, locationName) {
  const weatherEl = document.getElementById("weather");

  weatherEl.innerHTML = `
    <div class="weather-header">
      <div>
        <div class="weather-kicker">5-Tage-Vorschau</div>
        <h2>Wetter · ${locationName}</h2>
      </div>
      <div class="weather-refresh">Update alle 30 Minuten</div>
    </div>
    <div class="weather-grid">
      ${days
        .map(
          (day) => `
        <div class="weather-card ${weatherClass(day.weatherMain)}">
          <div class="weather-anim"></div>
          <div class="weather-top">
            <div>
              <div class="weather-day">${day.weekday}</div>
              <div class="weather-date">${day.date}</div>
            </div>
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
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

async function loadWeather() {
  const apiKey = CONFIG.OPENWEATHER_API_KEY;

  if (!apiKey || apiKey.includes("PASTE") || apiKey.includes("DEIN")) {
    document.getElementById("weather").innerHTML =
      `<div class="weather-error">Bitte zuerst deinen OpenWeather API-Key in der config.js eintragen.</div>`;
    return;
  }

  try {
    const location = await geocodeLocation();

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric&lang=de`;

    const res = await fetch(forecastUrl);
    const data = await res.json();

    if (!data.list) {
      throw new Error("Keine Wetterdaten erhalten");
    }

    const days = groupForecastByDay(data.list);
    renderWeather(days, location.name);
  } catch (err) {
    document.getElementById("weather").innerHTML =
      `<div class="weather-error">Wetter konnte nicht geladen werden.</div>`;
    console.error(err);
  }
}

updateClock();
updateGreeting();
loadWeather();

setInterval(updateClock, 1000);
setInterval(updateGreeting, 60 * 1000);
setInterval(loadWeather, 30 * 60 * 1000);
