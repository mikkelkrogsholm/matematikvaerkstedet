# Browserkontrol · 9. september 2026

Kørt med Playwright Chromium mod den lokale Bun-server på `127.0.0.1:4317`.
Mac-lås forhindrede ikke denne browser. Alle forsøg er syntetiske; ingen elevdata.
Scripts er Playwright MCP-funktioner og køres med `browser_run_code_unsafe`
med scriptets absolutte sti som `filename`. Serveren skal være startet;
AI-kontroller kræver aktivt Codex-login og bruger abonnementets kvote.

- `matrix.js`: fire kombinationer af hjælpemidler og AI, faktisk AI-hint,
  AI fra efter hjælp, svar/noter/værktøjer, reload, eksport/import og aflevering.
- `live-scenes.js`: kør tre gange; F06/F13/F16 vælges via sessionStorage.
  Faktiske modelkald tilføjer/flytter punkt og aflæser elevens nye koordinater.
  Browserens renderkvittering forsinkes 150 ms; forklaringsteksten holdes tilbage
  indtil kvitteringen. Resultater og faktiske tokens er i `live-scene-results.json`.
- `resilience.js`: afbrudt gemmekald, bevaret kladde, blokeret navigation,
  eksplicit genforsøg, hurtige koordinater med 100 ms netværksforsinkelse,
  pointertræk, piletaster og sletning gennem brugerfladen.
- `mobile.js`: Chromium med touch, 390×844, reduceret bevægelse. Placering af
  punkt gennem touch og ingen vandret overflydning. Det er emulering, ikke fysisk telefon.

Resultatfilerne ved siden af scripts er de observerede kørsler. `false` for
`toolsRestored` uden hjælpemidler er ikke relevant; der findes ingen værktøjer
at gendanne i denne profil. Skærmbilleder ligger i `docs/screenshots/fp9`.
AI-skærmbillederne er fra før flytningen af markeringsteksten under figuren;
mobilbilledet viser den rettede placering.

Åbent: browserfejlinjektion ved renderfejl, afbrudt animation, printkontrol,
reel UI-p95, samlet visuel gennemgang af 108 opgaver samt rigtig elevpilot med
forsinket gentagelse. Browserkontrollen beviser ikke læringseffekt.
