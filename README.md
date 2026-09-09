# Matematikværkstedet

Lokal matematikundervisning til 6. klasse, 2.g og FP9. FP9-forløbet har 18
opgavefamilier med reproducerbare varianter, valgfri AI-guide og lokal lagring.
Prøvetype med/uden hjælpemidler vælges uafhængigt af AI til/fra. Guiden bruger
lokalt Codex-login og ChatGPT-abonnement gennem en udskiftelig adapter.

FP9-implementeringen er under afsluttende kvalitetssikring: browserkontrol og
reel elevpilot står åbne. Se [verificeret status og begrænsninger](docs/FP9-IMPLEMENTATION.md).

**Gratis til privat brug med egne børn.** Brug på skoler, i organisationer,
til undervisning af andres børn eller i en virksomhed kræver en særskilt
skriftlig aftale med projektejeren. Det gælder også gratis institutionsbrug.
Koden er offentligt tilgængelig (*source available*), men har ikke en
open-source-licens. Se [licensen](LICENSE.md) og
[forklaring af vilkårene](docs/LICENSING.md).

![Matematikværkstedet — prototype](docs/screenshots/desktop.png)

## Start

Forudsætning: Bun 1.4.0, som prototypen er afprøvet med. Versionen står også i
`.bun-version` og `package.json`. Dependencies er låst i `bun.lock`.

```sh
bun install --frozen-lockfile
bun run dev
```

Åbn http://127.0.0.1:4317/fp9 for FP9 eller http://127.0.0.1:4317 for de oprindelige demoer. `dev` bygger brugerfladen og starter Bun-serveren. Efter kodeændringer: byg igen med `bun run build`, og genindlæs browseren. Genstart serveren efter ændringer i serverkode.

```sh
bun run typecheck
bun test
bun run build
bun run start
```

For rigtig AI: installér Codex CLI, kør `codex login` med ChatGPT, og
kontrollér med `codex login status`. [Opsætning og adapterdesign](docs/AI-PROTOTYPE.md).
Uden AI: `AI_PROVIDER=off bun run dev`. Abonnementets Codex-grænser gælder.

Alternativ port: `PORT=4320 bun run start`.

## Opbygning

- `server.ts`: Bun-server og katalog-API.
- `src/lessons.ts`: To lektionsplugins registreret med Cordis.
- `src/main.tsx`: React-brugerflade, Mafs-graf og guidede forløb.
- `src/ai/`: Udskiftelig AI-provider, Codex CLI-adapter og validerede scenedata.
- `src/math.ts`: Fælles beregninger og dansk talinput.
- `src/fp9/`: Generatorer, svarvurdering, sceneoperationer, værktøjer, lokal forsøgsserver og FP9-brugerflade.
- `research/PROTOTYPE-RESULTS.md`: Udførte kontroller og afgrænsning.
- `research/`: Produktkrav, prøveanalyse og biblioteksresearch.
- `docs/`: Dokumentationsoversigt og skærmbilleder.
- `materialer/`: Kildemanifest; downloadede prøver holdes lokalt uden for Git.
- `AGENTS.md`: Arbejdsvejledning for kodeagenter.

Serveren er kun tilgængelig på denne computer. Ingen elevlogin. FP9-forsøg og samtaler gemmes lokalt i `.local/fp9`; demoernes historik lever kun i browseren. Med AI til sendes aktive opgavedata, svar, noter, kort historik, figur og relevant værktøjstilstand til OpenAI via Codex. Se SCRATCHPAD.md for de langsigtede idéer.

## Dokumentation og bidrag

Start med [krav og designnoter](research/PRODUCT-REQUIREMENTS.md) og
[dokumentationsoversigten](docs/README.md). Før kodeændringer, læs
[AGENTS.md](AGENTS.md). Samlet kodekontrol: `bun run check`.

[FP9-epic #1](docs/epics/FP9-EXAM-TRAINING.md) er aktiv. Se
[researchgrundlaget](research/fp9/FOUNDATION.md), [implementeringen](docs/FP9-IMPLEMENTATION.md)
og [pilotprotokollen](docs/FP9-PILOT.md). [QA-galleriet](research/fp9/generated/gallery.html)
indeholder seks varianter fra hver familie, klar til visuel gennemgang.

## GitHub

Projektnavn: **Matematikværkstedet**. Teknisk repository- og pakkenavn:
`matematikvaerkstedet`. Den lokale branch hedder `main`.

Repository: [mikkelkrogsholm/matematikvaerkstedet](https://github.com/mikkelkrogsholm/matematikvaerkstedet).

```sh
git clone https://github.com/mikkelkrogsholm/matematikvaerkstedet.git
cd matematikvaerkstedet
```

Remote `origin` peger på dette repository. Ændringer på `main` kan pushes med
`git push origin main` efter kontrol og commit.

## Matematik A: første emnepilot

Åbn `/matematik-a` efter lokal opstart. Plangeometri og deskriptiv statistik
har 12 opgaveformer med nye data, visuel udforskning, rigtig AI og lokal
feedbackeksport. Se [pilotens dækning og kontroller](docs/MATEMATIK-A-PILOT.md).
