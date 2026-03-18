# Bad Dashboard fuer Netlify

Dieses Projekt ist eine statische Netlify-Seite fuer ein 8.7-Zoll-Tablet im Querformat.

Enthalten:
- tiefschwarzer Hintergrund fuer moeglichst geringe OLED-Stromaufnahme
- linkes Drittel: Analoguhr, deutsche Uhrzeit, adaptiver deutscher Gruss
- rechtes Zweidrittel: 5-Tage-Wettervorschau
- Wetterdaten mit OpenWeather
- automatisches Wetter-Update alle 30 Minuten

## 1) API-Key eintragen

Oeffne die Datei `config.js` und ersetze:

```js
OPENWEATHER_API_KEY: "PASTE_YOUR_OPENWEATHER_API_KEY_HERE"
```

mit deinem echten OpenWeather API-Key.

## 2) Deploy zu Netlify

### Variante A: Drag and Drop
1. Die Projektdateien zippen oder den Ordner bereithalten.
2. Bei Netlify einloggen.
3. "Add new site" -> "Deploy manually".
4. Den kompletten Projektordner oder eine ZIP hochladen.

### Variante B: Git
1. Projekt in ein Git-Repository legen.
2. Repository mit Netlify verbinden.
3. Publish Directory ist bereits per `netlify.toml` auf `.` gesetzt.

## 3) Dateien

- `index.html` - Struktur
- `styles.css` - Design und Layout
- `app.js` - Uhr, Begruessung, Wetterlogik
- `config.js` - dein API-Key und Orteinstellungen
- `netlify.toml` - Netlify-Konfiguration

## 4) Wichtige Hinweise

- Das Projekt versucht zuerst OpenWeather-Geocoding mit `Plauesche Straße, Arnstadt, DE`.
- Falls OpenWeather dafuer nichts Eindeutiges liefert, wird auf `Arnstadt, DE` zurueckgefallen.
- Den sichtbaren Ortsnamen kannst du in `config.js` ueber `DISPLAY_LOCATION_LABEL` aendern.
- Wenn du spaeter smarte Steckdosen einbauen willst, kannst du in `app.js` oder einer zusaetzlichen Datei Buttons und API-Aufrufe ergaenzen.

## 5) Optional fuer das Tablet

Fuer den Kiosk-Betrieb auf dem Tablet:
- Fully Kiosk Browser nutzen
- URL der Netlify-Seite als Startseite setzen
- Bildschirmrotation sperren
- Auto-Sleep deaktivieren
- Helligkeit reduzieren
