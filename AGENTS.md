# Arbejdsvejledning til agenter

## Projekt og status

Matematikværkstedet (`matematikvaerkstedet`) er en lokal prototype med React,
TypeScript, Bun, Cordis og Mafs. Brugerflade og undervisningstekst er på dansk.
Der er to demonstrationsforløb: brøker/procent til 6. klasse og parabler/tangenter
til 2.g. Guiden er regelbaseret og må ikke præsenteres som en tilsluttet AI.

Læs README.md og research/PRODUCT-REQUIREMENTS.md før produktændringer.
research/PROTOTYPE-RESULTS.md beskriver det afprøvede; SCRATCHPAD.md indeholder
historiske idéer og åbne spørgsmål. Forslag i dokumenterne er ikke implementerede
funktioner eller automatisk en bestilling på at bygge dem.

## Struktur

- `src/main.tsx`: brugerflade og guidede forløb.
- `src/lessons.ts`: Cordis-registry og lektionsplugins.
- `src/math.ts`: fælles matematiske beregninger og svarinput.
- `src/math.test.ts`: tests for matematik og registry.
- `src/style.css`: layout og visuel stil.
- `server.ts`: lokal Bun-server med `/api/lessons` og statiske filer fra `dist/`.
- `research/`: kilder, analyse, krav og forsøgsresultater.
- `docs/`: dokumentationsoversigt og skærmbilleder.
- `materialer/`: kildemanifest og eventuelle lokalt downloadede prøver.

## Udvikling og kontrol

Brug Bun 1.4.0 som den dokumenterede baseline og bevar `bun.lock`.

```sh
bun install --frozen-lockfile
bun run dev
bun run check
```

`dev` bygger én gang og starter serveren på http://127.0.0.1:4317. Der er ikke
automatisk genbygning. Efter ændringer: byg brugerfladen igen, og genstart
serveren ved serverændringer. `PORT` kan vælge en anden port.

Ved kodeændringer skal typecheck, relevante tests og build bestå. Kontrollér
ændret interaktion og layout i browseren, når det er relevant. Rene
dokumentationsændringer kræver link- og indholdskontrol, ikke nye kodetests.
Rapportér præcist, hvad der er afprøvet, og hvad der stadig er usikkert.

## Matematik og visualisering

- Hold matematiske værdier, facit, tekst og figurer konsistente.
- Bevar korrekte enheder, størrelsesforhold og aksemærkning. Markér skitser,
  der ikke er målfast tegnet.
- Nye opgavegeneratorer skal have kontrollerede parametre og reproducerbare
  varianter. En models egen godkendelse er ikke en tilstrækkelig facitkontrol.
- Åbne spørgsmål kan have flere gyldige løsninger; brug relevante kriterier.
- Lad elevinteraktion opdatere lokalt, når et modelkald ikke er nødvendigt.
- Hold skjult facit adskilt fra elevens visning, og undgå at ændre en
  igangværende opgaves forudsætninger utilsigtet.
- Nye biblioteker og alpha-versioner er acceptable kandidater, men demonstrér
  deres konkrete funktion og begrænsninger før påstande om understøttelse.

## Arbejdsform

Hold løsningen enkel og ændringer afgrænsede. Undgå brede refaktoreringer og nye
abstraktioner uden et konkret behov. Brug hovedagenten til små og tæt koblede
opgaver. Delegér kun klart afgrænsede, uafhængige opgaver, når det er nyttigt og
autoriseret; parallelle skrivninger må ikke overlappe.

Skriv dokumentation som Markdown og strukturerede data som JSON eller CSV.
Opdatér relevante krav eller forsøgsresultater, når en ændring gør dem forældede.
Skeln mellem ønsket produkt, foreløbige forslag og verificeret funktionalitet.

## Repository og lokale materialer

Forretningsmodel: gratis privat brug med egne børn; skole-, organisations- og
kommerciel brug kræver en særskilt aftale. Læs `LICENSE.md` og
`docs/LICENSING.md`. Kald projektet source available, ikke open source.
Ændr ikke brugsrettigheder uden ejerens instruktion. Ved nye dependencies skal
den præcise versions licens, transitive afhængigheder og medfølgende assets
undersøges for salg til skoler og distribution under projektets egne vilkår.
Bevar tredjepartsrettigheder og notices. Se `research/LICENSE-REVIEW.md`.
Eksterne bidrag skal have dokumenterede kommercielle genbrugsrettigheder før
integration; familielicensen alene giver ikke ejeren disse rettigheder.

Commit kode, dokumentation, lockfil og offentlige kildehenvisninger. `.local/`
indeholder eventuelle private originalnoter; de må ikke læses eller publiceres
uden et konkret behov. Lokale PDF-prøver og regneark, browserlogs, miljøfiler,
dependencies og buildoutput er ignoreret og skal ikke force-addes.

`research/FOUND-EXAMS.csv` bruger relative stier inden for en ekstern
prøvesamling. Filerne findes ikke i en ny klon. Undgå personlige kontooplysninger,
absolutte hjemmemappestier og elevdata i versionsstyrede filer.

GitHub-repository oprettes af ejeren. Tilføj remote eller push, når brugeren
beder om det og angiver destinationen.
