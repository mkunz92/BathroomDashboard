(() => {
  const config = window.DASHBOARD_CONFIG;
  const timeZone = config.TIMEZONE || "Europe/Berlin";
  const locale = config.LOCALE || "de-DE";

  const greetingEl = document.getElementById("greeting");
  const dateLineEl = document.getElementById("dateLine");
  const digitalTimeEl = document.getElementById("digitalTime");
  const statusLineEl = document.getElementById("statusLine");
  const weatherGridEl = document.getElementById("weatherGrid");
  const template = document.getElementById("weatherCardTemplate");
  const locationLabel = document.querySelector(".location-label");
  const backgroundVideo = document.getElementById("backgroundVideo");

  locationLabel.textContent = config.DISPLAY_LOCATION_LABEL || "Arnstadt · Deutschland";

  function getBerlinNow() {
    const now = new Date();
    const berlinDate = new Date(now.toLocaleString("en-US", { timeZone }));
    return berlinDate;
  }

  function getGreeting(hour) {
    if (hour >= 5 && hour < 11) return "Guten Morgen";
    if (hour >= 11 && hour < 18) return "Guten Tag";
    if (hour >= 18 && hour < 23) return "Guten Abend";
    return "Gute Nacht";
  }

  function updateClock() {
    const berlinNow = getBerlinNow();
    const hours = berlinNow.getHours();

    digitalTimeEl.textContent = berlinNow.toLocaleTimeString(locale, {
      timeZone,
      hour: "2-digit",
      minute: "2-digit"
    });

    dateLineEl.textContent = berlinNow.toLocaleDateString(locale, {
      timeZone,
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    greetingEl.textContent = getGreeting(hours);
  }

  function normalizeDayGroups(list) {
    const grouped = new Map();

    list.forEach((entry) => {
      const [dateKey] = entry.dt_txt.split(" ");
      if (!grouped.has(dateKey)) grouped.set(dateKey, []);
      grouped.get(dateKey).push(entry);
    });

    return Array.from(grouped.entries())
      .slice(0, 5)
      .map(([dateKey, entries]) => {
        const middayEntry = entries.reduce((best, current) => {
          const bestHour = Math.abs(new Date(best.dt_txt).getHours() - 12);
          const currentHour = Math.abs(new Date(current.dt_txt).getHours() - 12);
          return currentHour < bestHour ? current : best;
        }, entries[0]);

        const maxTemp = Math.max(...entries.map((item) => item.main.temp_max));
        const minTemp = Math.min(...entries.map((item) => item.main.temp_min));
        const wind = Math.max(...entries.map((item) => item.wind?.speed || 0));
        const precipitation = entries.reduce((sum, item) => {
          const rain = item.rain?.["3h"] || 0;
          const snow = item.snow?.["3h"] || 0;
          return sum + rain + snow;
        }, 0);

        return {
          dateKey,
          icon: middayEntry.weather?.[0]?.icon || "01d",
          description: middayEntry.weather?.[0]?.description || "Keine Daten",
          maxTemp,
          minTemp,
          wind,
          precipitation
        };
      });
  }

  function formatTemp(value) {
    return `${Math.round(value)}°`;
  }


  function setupBackgroundVideo() {
    const videoPath = config.BACKGROUND_VIDEO_PATH;
    if (!backgroundVideo || !videoPath) return;

    backgroundVideo.src = videoPath;
    backgroundVideo.addEventListener("canplay", () => {
      backgroundVideo.classList.add("is-ready");
    }, { once: true });
  }

  function getWeatherTheme(iconCode = "") {
    const code = String(iconCode);
    if (code.startsWith("11")) return "storm";
    if (code.startsWith("13")) return "snow";
    if (code.startsWith("09") || code.startsWith("10")) return "rain";
    if (code.startsWith("01")) return "clear";
    if (code.startsWith("02") || code.startsWith("03") || code.startsWith("04")) return "clouds";
    return "default";
  }

  function renderWeather(days) {
    weatherGridEl.innerHTML = "";

    days.forEach((day) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const dateObj = new Date(`${day.dateKey}T12:00:00`);
      card.dataset.weather = getWeatherTheme(day.icon);

      card.querySelector(".weekday").textContent = dateObj.toLocaleDateString(locale, {
        weekday: "long"
      });
      card.querySelector(".date").textContent = dateObj.toLocaleDateString(locale, {
        day: "2-digit",
        month: "2-digit"
      });
      card.querySelector(".weather-desc").textContent = capitalize(day.description);
      card.querySelector(".temp-max").textContent = formatTemp(day.maxTemp);
      card.querySelector(".temp-min").textContent = `↓ ${formatTemp(day.minTemp)}`;
      card.querySelector(".precip").textContent = `Niederschlag ${day.precipitation.toFixed(1).replace('.', ',')} mm`;
      card.querySelector(".wind").textContent = `Wind bis ${Math.round(day.wind * 3.6)} km/h`;

      const icon = card.querySelector(".weather-icon");
      icon.src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
      icon.alt = day.description;

      weatherGridEl.appendChild(card);
    });
  }

  function capitalize(text) {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  async function geocodeLocation(query) {
    const url = new URL("https://api.openweathermap.org/geo/1.0/direct");
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "1");
    url.searchParams.set("appid", config.OPENWEATHER_API_KEY);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Geocoding fehlgeschlagen (${response.status})`);
    }

    const results = await response.json();
    return Array.isArray(results) && results[0] ? results[0] : null;
  }

  async function resolveCoordinates() {
    const cacheKey = "arnstadt-dashboard-geocode";
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    let result = await geocodeLocation(config.LOCATION_QUERY_PRIMARY);
    if (!result) {
      result = await geocodeLocation(config.LOCATION_QUERY_FALLBACK);
    }

    if (!result) {
      throw new Error("Kein Ort für die Wetterdaten gefunden.");
    }

    const payload = {
      lat: result.lat,
      lon: result.lon,
      name: result.name,
      country: result.country
    };

    localStorage.setItem(cacheKey, JSON.stringify(payload));
    return payload;
  }

  async function loadWeather() {
    if (!config.OPENWEATHER_API_KEY || config.OPENWEATHER_API_KEY.includes("PASTE_YOUR")) {
      statusLineEl.textContent = "Bitte zuerst den OpenWeather API Key in config.js eintragen.";
      return;
    }

    try {
      statusLineEl.textContent = "Lade Wetterdaten …";
      const coords = await resolveCoordinates();

      const url = new URL("https://api.openweathermap.org/data/2.5/forecast");
      url.searchParams.set("lat", coords.lat);
      url.searchParams.set("lon", coords.lon);
      url.searchParams.set("appid", config.OPENWEATHER_API_KEY);
      url.searchParams.set("units", "metric");
      url.searchParams.set("lang", "de");

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Wetterabruf fehlgeschlagen (${response.status})`);
      }

      const weatherData = await response.json();
      const days = normalizeDayGroups(weatherData.list || []);

      if (!days.length) {
        throw new Error("Keine 5-Tage-Daten erhalten.");
      }

      renderWeather(days);

      const updatedAt = new Date().toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit"
      });
      statusLineEl.textContent = `Zuletzt aktualisiert: ${updatedAt}`;
    } catch (error) {
      console.error(error);
      statusLineEl.textContent = error.message || "Wetterdaten konnten nicht geladen werden.";
    }
  }

  setupBackgroundVideo();
  updateClock();
  setInterval(updateClock, 1000);

  loadWeather();
  setInterval(loadWeather, (config.WEATHER_REFRESH_MINUTES || 30) * 60 * 1000);
})();
