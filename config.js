window.DASHBOARD_CONFIG = {
  OPENWEATHER_API_KEY: "8b40620b1b535dac2c0a1aa57c1342aa",

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

  // Du kannst diesen Labeltext frei ändern, ohne den Wetterabruf zu beeinflussen.
  DISPLAY_LOCATION_LABEL: "Arnstadt · Plauesche Straße"
};
