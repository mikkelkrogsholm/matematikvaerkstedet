# FP9: implementeret dækning og åbne kontroller

F01–F18 er implementeret med tre strukturelle varianter pr. familie. Alle kan
bruges i begge træningsprofiler; AI er et særskilt valg. Der er ingen påstand
om fuldstændig dækning, officiel sværhedsgrad eller valideret emnevægtning.

| Familie | Variation | Bevidst afgrænsning |
| --- | --- | --- |
| F01 | Brøk til decimal, addition af brøker, ukendt tæller | Begrænsede nævnere; ingen generel brøkregningsprogression |
| F02 | Procentdel, omvendt rabat, proportional blanding | Lineære forhold, ingen sammensatte rabatforløb |
| F03 | Kvadrat, interval for rod, videnskabelig notation | Kontrollerede tal; ingen generel numerisk analyse |
| F04 | Ligning, streng heltalsulighed, to ligninger | Lineære systemer med ét efterspurgt tal |
| F05 | Udvid, find manglende udtryk, forklar algebrafejl | Polynomier i x; afgrænset symbolparser |
| F06 | Pris, maksimalt antal inden for budget, skæringspunkt | To lineære tilbud og hele besøg |
| F07 | Gentagen procentvækst, omvendt vækst, kvadratisk tabelargument | To perioder; ingen generel eksponentialløsning |
| F08 | Fart, tid i minutter, areal-/rumenhed | Udvalgte enheder; ikke en universel enhedskonverter |
| F09 | Indre vinkel, ydre vinkel, parallelbegrundelse | Euklidiske trekanter; åbne argumenter kræver gennemgang |
| F10 | Kortafstand, omvendt målestok, arealfaktor | Længde-/arealskalering |
| F11 | Omkreds, side fra areal, kassekapacitet | Rektangler og kasser; ingen cirkel-/sammensatte figurer |
| F12 | Hypotenuse, katete, kontrol af ret vinkel | Tre forskellige heltalstripler og gyldige/ugyldige tilfælde |
| F13 | Rektangel, trekant, punktflytning | Kontrol af egenskaber på afgrænset gitter; flere gyldige figurer |
| F14 | Spejling, rotation, translation | Ét punkt; ikke fri konstruktion eller transformation af hele figurer |
| F15 | Median, manglende observation, andel fra transportdiagram | Små datasæt og søjler; ikke alle diagramtyper |
| F16 | Spredning, middelværdi/median med outlier, datakvalitet | Åbne forklaringer uden automatisk pointscore |
| F17 | Direkte sandsynlighed, komplement, omvendt antal | Lige sandsynlige udfald |
| F18 | Med/uden tilbagelægning, vurder simulation | To træk; fortolkning af simuleret resultat, ingen simulationsmotor |

## Evidens og QA-materialer

`samples.json` indeholder 108 **fulde QA-opgaver med referencefacit**: seks pr.
familie, seed 101/202 og variant 0/1/2, med begge prøvetyper. Det er udviklings-
og reviewmateriale, aldrig en del af elevappens datakilde. `gallery.html`
viser samme opgaver gennem den faktiske SceneView-komponent, server-renderet.

Regenerér med `bun research/fp9/generated/export-samples.ts`. Scriptet udfører
ikke en visuel gennemgang. Hvert QA-eksempel har eksplicit åben reviewstatus.

Uafhængige matematiske kontroller: `src/fp9/domain/generators.test.ts`.
Reproduktion, profilmatrix og oprindelige regressioner: `index.test.ts`.
Domænegrænser, formater, præcis brøkækvivalens, metriske figurer og alternative
geometrisvar indgår. Rene tests og SSR beviser ikke layout/touch eller læring.

Visuel gennemgang af de 108 eksempler og afbrudt animation er åbne.
Renderfejlinjektion, print-HTML og lokal tekstinteraktion (p95 27,3 ms) er kontrolleret. Browserens fire træningskombinationer, reel AI-sceneinteraktion,
gendannelse og mobil/touch er afprøvet; se [evidens](../browser-checks/README.md).
Reel elevpilot og forsinket kontrol er også åbne.
Se [implementeringsstatus](../../../docs/FP9-IMPLEMENTATION.md).
