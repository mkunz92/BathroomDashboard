window.DASHBOARD_CONFIG = {
  OPENWEATHER_API_KEY: "PASTE_YOUR_OPENWEATHER_API_KEY_HERE",

  // Zielort wie von dir gewünscht. Erst wird eine direkte Geocoding-Anfrage
  // an OpenWeather versucht. Falls dabei nichts Passendes zurückkommt,
  // fällt das Projekt auf Arnstadt zurück.
  LOCATION_QUERY_PRIMARY: "Plauesche Straße, Arnstadt, DE",
  LOCATION_QUERY_FALLBACK: "Arnstadt, DE",

  // Zeitzone fest auf Deutschland/Berlin setzen.
  TIMEZONE: "Europe/Berlin",
  LOCALE: "de-DE",

  // Alle 30 Minuten neue Wetterdaten laden.
  WEATHER_REFRESH_MINUTES: 30,

  // Optional: lokales Hintergrundvideo eintragen, z. B. "./assets/strand.mp4"
  // Wenn leer, bleibt der freundlich animierte Farbverlauf aktiv.
  BACKGROUND_VIDEO_PATH: "",

  // Du kannst diesen Labeltext frei ändern, ohne den Wetterabruf zu beeinflussen.
  DISPLAY_LOCATION_LABEL: "Arnstadt · Plauesche Straße"
};
