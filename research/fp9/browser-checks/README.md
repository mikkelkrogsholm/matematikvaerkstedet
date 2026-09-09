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

- `render-failure.js`: reel modelhandling, kontrolleret fjernelse af AI-DOM,
  faktisk negativ renderkvittering, rollback og synlig fejlbesked. Bestået.
- `latency-print.js`: 100 tastaturinput til anden animation-frame med baggrundsgemning.
  p95 27,3 ms på Apple M3 Max / 128 GiB, Chromium 152. Målingen gælder lokal
  tekstredigering; den omfatter ikke diskpersistens eller alle interaktionstyper.
  Printmediet viser tre opgaver, elevsvar, noter og dataceller; kontrolknapper skjules.
  Dette kontrollerer print-HTML, ikke fysisk printer eller paginering.

- `animation.js` og `animation-auto.js`: faktisk model, tre trin, browser-ACK,
  automatisk afspilning og reduceret bevægelse; elevændring afbryder resten.
- `animation-ack-recovery.js`: server committer ACK, svar tabes; UI genlæser
  og gennemfører uden at registrere hjælpen flere gange.
- `animation-stop-race.js`: Stop-svar forsinkes 1600 ms, ingen senere trin
  afsendes, og eleven kan navigere videre.

Alle 108 QA-visninger er gennemgået; se `../generated/VISUAL-REVIEW.md`.
Åbent: rigtig elevpilot med forsinket gentagelse. Browserkontrollen beviser ikke læringseffekt.
