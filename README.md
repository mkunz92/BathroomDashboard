# Bad Dashboard fuer GitHub Pages oder Netlify

Dieses Projekt ist fuer ein 8.7-Zoll-Tablet im Querformat optimiert.

Enthalten:
- freundlicher, heller Hintergrund mit sanfter Bewegung
- optionales eigenes Hintergrundvideo
- mittige digitale Uhr im Glas-Look
- deutscher Gruss und deutsches Datum
- kompakte 5-Tage-Wetterkarten mit Animation nur im oberen Bereich
- Wetterdaten mit OpenWeather
- automatisches Wetter-Update alle 30 Minuten

## 1) API-Key eintragen

Oeffne `config.js` und ersetze:

```js
OPENWEATHER_API_KEY: "PASTE_YOUR_OPENWEATHER_API_KEY_HERE"
```

mit deinem echten OpenWeather API-Key.

## 2) Optional: bewegtes Hintergrundvideo

Du kannst ein eigenes Video verwenden, zum Beispiel Strand mit Wellengang.

Vorgehen:
1. Lege einen Ordner `assets` an.
2. Kopiere dein Video hinein, zum Beispiel `assets/strand.mp4`.
3. Trage in `config.js` ein:

```js
BACKGROUND_VIDEO_PATH: "./assets/strand.mp4"
```

Wenn `BACKGROUND_VIDEO_PATH` leer bleibt, nutzt das Dashboard automatisch den animierten Farbverlauf.

## 3) Deploy zu GitHub Pages

1. Dateien ins Repository hochladen.
2. In GitHub: `Settings -> Pages`.
3. `Deploy from a branch` waehlen.
4. Branch `main` und Ordner `/ (root)` waehlen.
5. Speichern.

## 4) Dateien

- `index.html` - Struktur
- `styles.css` - Design und Layout
- `app.js` - Uhr, Begruessung, Wetterlogik, optionales Hintergrundvideo
- `config.js` - API-Key, Ort und optionales Video
- `README.md` - Hinweise
