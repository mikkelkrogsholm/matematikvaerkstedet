# Matematikværkstedet

Lokal prototype til 6. klasse og 2.g. Interaktive brøker, procent, tallinje og funktioner med tangenter. Guiden er en tydeligt markeret lokal demo uden AI-forbindelse.

Målet er en pluginbaseret matematikunderviser med dynamiske visualiseringer og
varierede øveopgaver, der træner begrebsforståelse. Generative prøvesæt og en
AI-agent med adgang til arbejdsfladen er beskrevet som næste muligheder, men er
endnu ikke implementeret.

![Matematikværkstedet — prototype](docs/screenshots/desktop.png)

## Start

Forudsætning: Bun 1.4.0, som prototypen er afprøvet med. Versionen står også i
`.bun-version` og `package.json`. Dependencies er låst i `bun.lock`.

```sh
bun install --frozen-lockfile
bun run dev
```

Åbn http://127.0.0.1:4317. `dev` bygger brugerfladen og starter Bun-serveren. Efter kodeændringer: byg igen med `bun run build`, og genindlæs browseren. Genstart serveren efter ændringer i serverkode.

```sh
bun run typecheck
bun test
bun run build
bun run start
```

Alternativ port: `PORT=4320 bun run start`.

## Opbygning

- `server.ts`: Bun-server og katalog-API.
- `src/lessons.ts`: To lektionsplugins registreret med Cordis.
- `src/main.tsx`: React-brugerflade, Mafs-graf og guidede forløb.
- `src/math.ts`: Fælles beregninger og dansk talinput.
- `research/PROTOTYPE-RESULTS.md`: Udførte kontroller og afgrænsning.
- `research/`: Produktkrav, prøveanalyse og biblioteksresearch.
- `docs/`: Dokumentationsoversigt og skærmbilleder.
- `materialer/`: Kildemanifest; downloadede prøver holdes lokalt uden for Git.
- `AGENTS.md`: Arbejdsvejledning for kodeagenter.

Serveren er kun tilgængelig på denne computer. Ingen login, lagring eller eksterne modelkald. Se SCRATCHPAD.md for de langsigtede idéer.

## Dokumentation og bidrag

Start med [krav og designnoter](research/PRODUCT-REQUIREMENTS.md) og
[dokumentationsoversigten](docs/README.md). Før kodeændringer, læs
[AGENTS.md](AGENTS.md). Samlet kodekontrol: `bun run check`.

## GitHub

Projektnavn: **Matematikværkstedet**. Teknisk repository- og pakkenavn:
`matematikvaerkstedet`. Den lokale branch hedder `main`.

Når ejeren har oprettet et tomt GitHub-repository uden automatisk README,
licens eller `.gitignore`, forbindes den eksisterende historik sådan:

```sh
git remote add origin https://github.com/DIT-BRUGERNAVN/matematikvaerkstedet.git
git push -u origin main
```

Erstat `DIT-BRUGERNAVN` med den valgte bruger eller organisation. Remote er ikke
konfigureret som del af den lokale klargøring. Der er endnu ikke valgt en licens
for projektet.
