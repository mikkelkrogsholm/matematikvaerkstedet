# Arkitekturreview med Graphify

9. september 2026. Gennemgået produktkode: `dbd58f5`.

Graphify 0.9.42 var allerede installeret på maskinen. Der er oprettet en lokal
kodegraf og en reproducerbar bygger; ingen nye runtime-dependencies eller
modelkald er tilføjet til prototypen. Dette review ændrer ikke produktkoden.

## Resultat og prioritering

Prototypen har tydelige begyndende samlingspunkter, men grafen dokumenterer
ikke en defekt arkitektur. Gennemfør små udtræk med bevaret adfærd, når de
berørte områder næste gang skal udbygges. En total omskrivning er ikke begrundet.

| Prioritet | Fund og kodeevidens | Anbefalet næste ændring | Kontrol ved ændringen |
|---|---|---|---|
| 1 | `src/fp9/server/index.ts:72`: `Fp9Service` har 22 grafkanter og håndterer forsøg, revisioner, låsning, AI, renderkvitteringer og import/eksport. Samme fil rummer fil-lager, Codex-adapter og HTTP-routing. | Start med at flytte lager, provider og routes til hver sin fil. Udtræk derefter importvalidering som ren funktion. Bevar service som koordinator. | Servertests for import, revisionskonflikt, AI fra, budget, tabt ACK og Stop-race. Flyt ikke låse eller ændr rækkefølgen af transaktioner i samme ændring. |
| 2 | `src/fp9/ui/FP9App.tsx:27`: komponenten ejer gemmekø, fejlede saves, revisionsopdatering, AI-annullering, animationstimer og DOM-kvittering samt skærmvalg. Meget kode er pakket på få linjer. | Formatér først i en separat ændring. Udtræk derefter en samlet `useAttemptSession` med gemmekø og livscyklus; flyt setup/review til præsentationskomponenter. | Browserforløb for netværksfejl, retry, navigation, aflevering, tabt ACK, reduceret bevægelse og Stop. Gemmekø og renderkvittering skal fortsat koordineres. |
| 3 | `src/fp9/domain/index.ts`: fælles typer, katalog/profiler, generatorer og `assess` er samlet. `generators.ts:2`, `figures.ts:1` og `number-answer.ts:1` importerer typer tilbage fra index. | Flyt rene typer til `types.ts`, og lad index geneksportere dem. Senere kan vurdering og generatorregister få egne moduler. | Typecheck og eksisterende generator-/vurderingstests med samme seeds, facit og figurer. |

Udtræk af provider kræver ikke en ny abstraktion: `Fp9Provider` og konstruktorens
injektion findes allerede. Bevar denne udskiftelighed frem mod et senere API.

## God nodes: signaler, ikke automatisk teknisk gæld

- `Fp9Service`: 22 kanter. Reelt ansvarssamlingspunkt efter kildekontrol;
  en del af graden skyldes blot forbindelser til klassens egne metoder.
- `compilerOptions`: 20 kanter. JSON-konfiguration, ikke et god object.
- `assess`, `applyCommand` og `createFp9Api`: hver 14 kanter. Vurdering og
  scenevalidering må gerne have centrale indgange. Især sceneinvarianterne bør
  forblive samlet; HTTP-routing kan flyttes for læsbarhed.
- `generateAdditional`: 13 kanter. Et fremtidigt udtræk pr. fagområde kan gøre
  flere opgavefamilier lettere at tilføje, men er ikke nødvendigt for demoen.

## Forbindelser, som grafen fremhæver

`assess → equivalent` viser den forventede forbindelse mellem vurdering og
matematikværktøj. `AttemptView → Answer/Assessment/Profile` viser en fælles
kontrakt mellem server og UI. Det er nyttige navigationspunkter, ikke fejl.

Grafens tre importcykler går gennem `import type` tilbage til domænets index.
De rapporterede cykler er derfor ikke påvist som runtime-cykler. Et separat
typemodul vil gøre retningen klarere uden at opfinde et runtime-problem.

## Spørgsmål til næste kodeændring

- Kan lager, provider og routing flyttes, uden at ændre service-transaktioner?
- Hvilken komponent ejer gemmekø og renderkvittering under navigation og Stop?
- Kan en ny opgavefamilie tilføjes uden at ændre fælles typer eller vurdering?

## Genbygning og navigation

Kør fra repositoryets rod med Python-miljøet, hvor Graphify er installeret:

```sh
python research/architecture/build-graph.py
graphify export html
graphify explain Fp9Service
graphify god-nodes --top 10
```

Ved installation med `uv tool install graphifyy` kan interpreteren findes under
`$(uv tool dir)/graphifyy/bin/python3` og bruges i stedet for `python`.
Det genererede `graphify-out/graph.html` kan åbnes lokalt uden server.
`GRAPH_REPORT.md`, `graph.json`, `analysis.json` og `health.json` ligger samme sted.
Output er Git-ignoreret, fordi det kan indeholde maskinens absolutte stier og
kan genbygges. `.graphifyignore` afgrænser analysen til kode/konfiguration og
udelukker prøvemateriale, dokumenter, QA-data, dependencies og build-output.

## Måling og begrænsninger

- 34 kode-/konfigurationsfiler, 18.638 ord, 391 noder, 844 kanter og 15 grupper.
- AST-udtræk uden semantiske modelkald: 0 input-/outputtokens for udtrækket.
  Reviewet her er almindeligt agentarbejde og har naturligvis tokenforbrug.
- 879 rå kanter: 28 havde manglende endepunkter og indgår ikke i grafen;
  7 parallelle forbindelser blev sammenlagt. Grafen er derfor ikke komplet.
- To kanter er infererede med gennemsnitlig konfidens 0,5. Rapportens afrundede
  “100% EXTRACTED” skal ikke læses som, at samtlige kanter er direkte udtrukket.
- Graphifys benchmark anslår 6,8× mindre kontekst for sine to standardspørgsmål
  (~26.066 kontra ~3.843 tokens). Det er et estimat, ikke målt besparelse i
  vores agentkørsler. Benchmarkets korpusestimat afviger fra detektorens ordtal.
- Korpuset passer allerede i et stort kontekstvindue. Grafens værdi her er
  navigation og overblik. Den erstatter ikke kildekontrol eller funktionstest.

Byggescriptet og HTML-eksporten er kørt med succes. Produktkoden er uændret;
de seneste produktkontroller er dokumenteret i `docs/FP9-ACCEPTANCE.md`.
