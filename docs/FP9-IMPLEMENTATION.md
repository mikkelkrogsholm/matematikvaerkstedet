# FP9: implementering og verificeret status

9. september 2026. Epic #1 er under implementering og **ikke lukket**.
Den lokale app findes på `/fp9`; de oprindelige demoer findes fortsat på `/`.

## Det implementerede

- F01–F18, hver med tre strukturelle varianter, versionsnummer og seed.
  Generatorer og bedømmelse arbejder lokalt uden modelkald.
- To uafhængige valg: prøvetype med/uden hjælpemidler og AI til/fra.
- Kort runde, emnetræning og fuldt øvesæt. Uden hjælpemidler: 20 grupper og
  50 selvstændigt besvarbare delopgaver. Med hjælpemidler: 7 grupper à 3 dele.
- Svar, begrundelser, noter, elevpunkter, regneark, markeringer og hjælprehistorik
  gemmes i `.local/fp9`. Gemmefejl vises, og ændringer kan forsøges gemt igen.
- Pause, genoptagelse og ekstra tid registreres. Aflevering låser forsøget.
  Review giver læringsfeedback, kriterier og eksempler, aldrig en officiel karakter.
- Versionsmærket eksport/import, genoptagelse, sletning og print fra review.
- Beregner, et lille regneark og afgrænset polynomial-CAS i profilen med
  hjælpemidler. De virker fortsat efter AI slukkes.
- Originale SVG-figurer med særskilte givne data, elevobjekter og AI-forklaring.
  Geometri bevarer samme målestok på begge akser. AI kan tilføje, flytte,
  fremhæve, skjule og fjerne egne objekter samt ændre udsnittet inden for kontrakten.

Et fuldt øvesæt følger vores **produktfordeling**, ikke en dokumenteret officiel
emnevægtning eller valideret sværhedsgrad. Uden hjælpemidler gennemløbes alle
18 familier, efterfulgt af F01/F02. De første 10 grupper har 3 dele, resten 2.
Med hjælpemidler bruges F06/F13/F16/F11/F04/F15/F18. Øvrige familier kan vælges
som emnetræning. Tidsestimater i kataloget er foreløbige produktvalg og er endnu
ikke kalibreret med elever; tidsgrænse er valgfri.

## AI gennem abonnementet

`CodexFp9Provider` implementerer `Fp9Provider` i `src/fp9/server/index.ts`.
En senere API-provider kan implementere samme interface. `src/ai/runtime.ts`
indkapsler den lokale Codex-proces og genbruger CLI'ens ChatGPT-login uden at
læse eller kopiere loginfiler. Der bruges ingen API-nøgle i denne adapter.

Modellen modtager den aktive opgaves offentlige data, elevens aktuelle svar,
noter, scene, markering, værktøjstilstand, seneste handlinger og højst otte
chatbeskeder. Bedømmelsesgrundlaget sendes kun ved eksplicit **Vis løsning**.
Modellen ser strukturerede data, ikke screenshots. Data går til OpenAI via
Codex og er omfattet af kontoens gældende vilkår og forbrugsgrænser; ephemeral
CLI-sessioner er ikke et løfte om manglende serverlogs hos udbyderen.

Fire manuelt valgte niveauer: spørgsmål, hint, ét trin og løsning. Der er ingen
automatisk eskalering eller genforsøg. Spørgsmål/hint kan ikke ændre scenen.
Et trin kan følges af et nyt trin efter elevens valg. Elevens ændringer indgår i
næste kald; modellen får ikke generel adgang til filer, shell eller kodeafvikling.

Sceneændringer valideres atomisk. Forklaringstekst holdes tilbage, indtil
browseren bekræfter det aktuelle render-token. Fejl ruller forklaringsændringen
tilbage. Forældede svar, forkert forsøg, deaktiveret AI og ændret elevtilstand
må ikke overskrive arbejdet. En flytning opdaterer etiketten; den gamle tekst
bevares ikke stiltiende. Støtte registreres ved leveret tekst/bekræftet figur;
slukning og fortrydelse fjerner ikke allerede registreret støtte.

| Variabel | Standard | Afgrænsning |
| --- | --- | --- |
| `FP9_STORE_PATH` | `.local/fp9` | Lokale forsøgsfiler |
| `FP9_AI_MAX_CALLS` | 12 | Kald pr. forsøg, inklusive fejl/annullering |
| `FP9_AI_MAX_TOKENS` | 150000 | Stop nye kald efter registreret tokenforbrug |
| `FP9_AI_TIMEOUT_MS` | 90000 | Timeout pr. kald |
| `AI_PROVIDER` | `codex` | `off` giver model-fri drift |
| `CODEX_MODEL` | CLI-standard | Valgfri tilgængelig abonnementsmodel |

Tokenbudgettet er en adgangsgrænse for **næste** kald, ikke et præcist loft over
et igangværende kald. Registrering bruger CLI'ens faktiske usage-events, når de
modtages. Ved afbrudte processer kan endeligt tokenforbrug være ukendt; kontoens
Codex-forbrugsoversigt er autoritativ. Der er én igangværende forespørgsel pr.
forsøg. Denne lokale prototype er ikke en flerbruger- eller skolebackend.

Bun-serveren binder til loopback, begrænser bodies til 2 MiB og afviser fremmede
origins. Det ældre demo-endpoint har desuden sin egen mindre inputgrænse.
Ingen elevidentitet eller nye npm-dependencies er nødvendige.

## Verifikation

`bun run check` omfatter typecheck, matematik-/scene-/serverregressioner og build.
De nye generatorchecks rekonstruerer resultater fra offentlige oplysninger for
100 seeds × 3 varianter × 18 familier × 2 prøvetyper. Derudover kontrolleres
geometriske størrelsesforhold, præcise ækvivalente brøker, enheder, formatkrav,
flere gyldige konstruktioner og åbne begrundelser. De erstatter ikke elevpilot.

Reelle Codex-kald har i F06/F13/F16 tilføjet et punkt, flyttet det og derefter
korrekt aflæst et ændret elevpunkt. Det er en **server-/modeltest med simuleret
render-kvittering**. Den er ikke bevis for browserens visning. Et særskilt
reelt kald har bekræftet rettelsen af en forældet punktetiket. Det oprindelige
brøkforløb har også returneret en gyldig 3/4-scene gennem den ændrede runtime.

De første målte AI-kald lå omkring 6–11 sekunder, omtrent 9900–10500 inputtokens
og 47–185 outputtokens pr. kald. Tallene omfatter CLI-konteksten og kan ændre sig
med model, historik og udbyder. De er stikprøver, ikke latencygarantier.
Se [maskinlæsbar evidens](../research/fp9/verification.json).

## Åbne acceptpunkter

- Den interne browser virker også med låst Mac. Fire træningskombinationer,
  faktisk AI-renderkvittering i F06/F13/F16, reload, eksport/import, aflevering,
  sletning, netværksfejl/genforsøg, pointer/tastatur og emuleret mobil/touch er
  nu afprøvet. Se [browserkontroller og resultater](../research/fp9/browser-checks/README.md).
  Renderfejlinjektion og print-HTML er nu også afprøvet. Lokal tekstredigering
  målte p95 27,3 ms (100 input, browser-frame, Apple M3 Max). Afbrudt animation
  står fortsat åben. Målingen er ikke en garanti for alle interaktioner.
  Den rene sceneopdatering må ikke bruges som UI-latensmål.
- [108 komplette QA-eksempler](../research/fp9/generated/samples.json) og
  [HTML-galleriet](../research/fp9/generated/gallery.html) er klar. Alle seks varianter pr. familie er nu set; se
  [visuel QA](../research/fp9/generated/VISUAL-REVIEW.md). F05 har en åben faglig præcisering.
- [Elevpilot og forsinket gentagelse](FP9-PILOT.md) er ikke gennemført. Der
  hævdes ingen dokumenteret læringseffekt eller mestring på grundlag af modeltests.
- Dækningen er afgrænset: ingen mundtlig prøve, generel CAS, frie beviser med
  automatisk scoring eller komplet skoleprodukt. Se [dækningskort](../research/fp9/generated/COVERAGE.md).

Eksportformat 1 / blueprint `fp9-blueprint-2` gengenererer og validerer indholdet.
Andre blueprint-versioner afvises eksplicit. Gemte lokale forsøgsinstanser har
selve opgaven og bedømmelsesgrundlaget, men import lover ikke bagudkompatibilitet
med tidligere udviklingsversioner.

Trinvis animation findes foreløbig kun i scenemotoren. API/UI-integration mangler;
se [den konkrete audit](../research/fp9/ANIMATION-INTEGRATION.md).
