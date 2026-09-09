# Scratchpad — matematikunderviser

Opdateret: 9. september 2026. Levende arbejdsnoter fra vores samtale; forslag er ikke endelige teknologivalg.

Samlet beskrivelse: [Krav og designnoter](research/PRODUCT-REQUIREMENTS.md). Dokumentet samler generative opgaver, analyse af prøvekrav, korrekt og dynamisk grafik, agentens fælles arbejdsflade, fortællinger og sammenhængende delopgaver, træning/prøve samt et forslag til første afprøvning. Brugerønsker, observationer fra prøverne og vores løsningsforslag er markeret særskilt.

## Første indholdsprioritet: Matematik A på gymnasieniveau

Planlagt som [epic #3](https://github.com/mikkelkrogsholm/matematikvaerkstedet/issues/3);
[detaljeret plan](docs/epics/MATEMATIK-A-STX.md) med ti delopgaver, faglig dækning,
AI/visualiseringer og skriftlig/mundtlig træning. Første implementering prioriterer nu plangeometri og deskriptiv statistik, som
sønnen arbejder med. Se [pilotstatus](docs/MATEMATIK-A-PILOT.md).

Ejeren har bekræftet, at sønnen har matematik A på stx og går i 2.g.
Produktet kaldes Matematik A på gymnasieniveau og organiseres efter emner og
forudsætninger uden opdeling i 1.g, 2.g og 3.g. Indhold og eksamensforberedelse
prioriteres, så næste udbygning kan afprøves på ham. Se [research om matematik A](research/gymnasium/MATEMATIK-A.md).
Stx og læreplansversion bevares som faglig afgrænsning.
Bred dækning af 0.–9. klasse og øvrige gymnasieniveauer er fortsat ambitionen,
men A-forløbet prioriteres først. Organisations-epic #2 forbliver udskudt.

## Aktuel prioritering — indhold før organisationsfunktioner

Beslutning 9. september 2026: FP9-prototypen er implementeret og epic #1 afsluttet.
Næste ønskede fokus er at bruge og udbygge den eksisterende motor til fagligt
indhold for 0.–9. klasse og gymnasiets 1.g, 2.g og 3.g med matematik på A-, B-
og C-niveau. Dette er retning for næste planlægning, ikke en bestilling på at
implementere alle niveauer i denne dokumentationsrunde.

Før indholdsarbejdet skal vi kortlægge faglige mål, progression og relevante
kombinationer af gymnasial uddannelse, årgang og niveau. Årgang og A/B/C er
separate dimensioner; vi må ikke antage, at alle kombinationer er selvstændige
eller ens på tværs af uddannelser. Uddannelsestyper og konkret dækning er endnu ikke afklaret.

Bevar generative opgavefamilier med strukturel variation, uafhængig facitkontrol,
korrekt grafik, alderssvarende sprog, relevante fortællinger og reel AI-interaktion.
Udbyg kun motoren, hvor konkrete nye indholdstyper kræver det. Dækning skal
beskrives pr. fagområde og niveau; et enkelt eksempel betyder ikke fuld dækning.

Organisationer, brugere, kombinerbare roller, hold, tildelte forløb, Better Auth
og SQLite pr. organisation er samlet i en [udskudt epic](docs/epics/ORGANISATIONS-AND-USERS.md).
De skal ikke implementeres før det faglige indhold alene på baggrund af denne plan.

## Produktidé

Historisk plan for det nu afsluttede FP9-forløb: Research fra ministeriet og en
opgavekortlægning er samlet i [FP9-grundlaget](research/fp9/FOUNDATION.md).
Brugerens præcisering er central: prøvetype (med/uden hjælpemidler) og AI-støtte
(til/fra) er to uafhængige valg. Begge prøvetyper kan trænes med støttehjul,
som gradvist fjernes. Hjælp logges og nulstilles ikke ved at slukke AI på samme
opgave. Agenten skal kunne læse og ændre arbejdsfladens konkrete objekter.
Se [UX og agentkontrakt](docs/FP9-EXPERIENCE.md) og
[implementeringsepic](docs/epics/FP9-EXAM-TRAINING.md). Research er udført;
implementering og prototypeaccept er nu afsluttet; se [acceptkontrollen](docs/FP9-ACCEPTANCE.md).

Epic'en er registreret på GitHub som [#1](https://github.com/mikkelkrogsholm/matematikvaerkstedet/issues/1),
med otte delopgaver og acceptkriterier. De fire kombinationer af prøvetype og
AI-støtte er obligatoriske i planen.

Forretningsmodel afklaret: Gratis privat brug til egne børn eller børn under
værgemål. Skoler, organisationer, undervisning af andres børn og kommerciel brug
kræver en særskilt skriftlig aftale med ejeren, som ønsker at kunne sælge til
skoler. Offentlig kildekode med en privat familielicens (source available), ikke
open source. Se [vilkårene](LICENSE.md), [forklaringen](docs/LICENSING.md) og
[bibliotekernes licensgennemgang](research/LICENSE-REVIEW.md).

Første konkrete brugere: brugerens datter går i 6. klasse, og sønnen går i 2.g på et dansk gymnasium. Matematikniveauet er A på stx.

En matematikunderviser, der kombinerer samtale, pædagogiske forklaringer og dynamiske, interaktive visualiseringer. Langsigtet målgruppe: fra 0. klasse til 3.g, med alderssvarende sprog og interaktion.

Muligt desktoplayout:

- Venstre: emner, niveauer og navigation.
- Midten: den primære arbejdsflade, hvor matematik vises og udforskes.
- Højre: samtale med underviseren.

Grafikken skal være flot, repræsentativ og matematisk korrekt, herunder størrelsesforhold. Forklaringer og visualiseringer skal kunne skabes og tilpasses undervejs. Hurtig respons og lavt tokenforbrug er centrale krav.

## 1. Cordis som pluginfundament

Ny produktidé: Generative øveprøver, der varierer både tal, kontekst, repræsentation og krav til elevens tænkning. Målet er begrebsforståelse og overførsel til nye situationer. Forslag: validerede opgavefamilier som plugins, fælles matematisk model for facit og grafik, agentadgang til scenetilstand og elevhandlinger samt adskilt trænings- og prøvetilstand. Første mulige forsøg er prisgrafer med forskellige opgaveformer. Se [research/GENERATIVE-EXAMS.md](research/GENERATIVE-EXAMS.md) for analyseplan, arkitektur og afprøvning. Endnu ikke implementeret.

Kandidat: [cordiverse/cordis](https://github.com/cordiverse/cordis).

Brugerens hovedidé er en platform, der hurtigt kan udvides med plugins til nye visualiseringer og måder at forklare matematik på. Cordis skal understøtte denne udvidelighed.

Cordis tilbyder services, deklarerede afhængigheder, events og styring af plugins' levetid med oprydning af registrerede effekter. Vi skal selv definere kontrakten for undervisningsplugins og integrationen med brugerfladen.

Mulige plugins, endnu kun idéer:

- Tallinje: tal, afstande, spring og intervaller.
- Brøkværksted: opdeling, sammenligning og sammensætning af mængder.
- Balancevægt: ligninger forklaret gennem ligevægt.
- Geometri: figurer, konstruktioner, vinkler og mål.
- Funktionslaboratorium: grafer, parametre, tangenter og arealer.
- Forklaringsstrategier: konkrete eksempler, undersøgende spørgsmål og trinvis hjælp.

Arkitekturforslag: Visualiseringer og forklaringsstrategier skal kunne kombineres på tværs af emner og niveauer. Plugins leverer udtryksmuligheder; agenten sammensætter konkrete scener og forklaringer undervejs.

En fælles pluginkontrakt kunne beskrive:

- Understøttede begreber og handlinger.
- Kompakte, strukturerede kommandoer til agenten.
- Elevinteraktioner og hændelser.
- Fælles visuelle regler og tilgængelighed.
- Inputvalidering og kontrol af matematik.
- Afhængigheder, opstart og oprydning.

Forslag til bevis på udvidelighed: Byg to plugins, og tilføj et tredje uden at ændre platformens kerne. Ikke igangsat eller besluttet endnu.

Afgrænsning: Cordis beregner og tegner ikke i sig selv matematik. Oprydning ved afmontering er heller ikke automatisk historik, fortrydelse eller gendannelse af elevens arbejde.

Kilde: [Cordis Primer](https://deepseek-harness.github.io/deepseek-harness/en/reference/cordis-primer).

## 2. Bun 1.4 som runtime

Bun 1.4 er den runtimekandidat, brugeren har spurgt til. Endeligt valg afventer praktisk kompatibilitetstest.

Foreløbig vurdering fra dokumentation og kode:

- Cordis' kernepakke er ESM med få afhængigheder; den ser plausibel ud at køre på Bun.
- Cordis' HMR til ændret kildekode benytter interne Node-modulfunktioner. Vi kan ikke antage, at denne del fungerer uændret på Bun.
- Pluginaktivering og afmontering skal vurderes særskilt fra genindlæsning af ændrede kildefiler.
- Cordis-repositoryets egne build- og testscripts bruger Node og Yarn; det er ikke i sig selv et bevis på applikationens runtimekrav.

**Status: Ikke testet på Bun. Ingen verificeret kompatibilitet endnu.**

**Opdatering efter prototype:** Cordis 4.0.0-rc.10 er nu kørt på Bun 1.4.0 med to registrerede lektionsplugins. Test af registrering og oprydning består. Dette er et afgrænset kompatibilitetsbevis; loader/HMR og hele Cordis-funktionsfladen er fortsat ikke testet.

Planlagt minimumstest: Fastlås præcise Bun- og Cordis-versioner, og afprøv import, opstart, serviceafhængigheder, events samt aktivering og afmontering med oprydning. Afprøv loader/HMR særskilt, hvis vi vil bruge dem.

Kilder: [Kernepakke](https://github.com/cordiverse/cordis/blob/main/packages/core/package.json), [HMR](https://github.com/cordiverse/cordis/blob/main/packages/hmr/src/index.ts), [Bun-kompatibilitet](https://bun.sh/docs/runtime/nodejs-compat).

## Undersøgelse: visualiseringsbiblioteker

Brugerens kriterier:

- En agent skal nemt kunne bruge biblioteket til dynamisk at vise og forklare matematik for en bruger.
- Det skal understøtte tilpasning undervejs, frem for kun faste demonstrationer.
- Grafikken skal være flot og matematisk korrekt.
- Interaktion skal være hurtig, og agentens brug skal være økonomisk i tokens.
- Helt nye biblioteker og alpha-kode er velkomne. Alder og modenhed er ikke selvstændige fravalgskriterier.
- Det afgørende er, at det virker, og at vi kan demonstrere og reproducere det.

Tidligere nævnte kandidater — ikke en shortlist eller færdig undersøgelse:

| Kandidat | Mulig rolle | Status |
| --- | --- | --- |
| [JSXGraph](https://jsxgraph.org/) | Interaktiv geometri og grafer | Dokumentation orienteret; ikke testet |
| [Mafs](https://github.com/stevenpetryk/mafs) | React-komponenter til interaktiv matematik | Dokumentation orienteret; ikke testet |
| Egne SVG-komponenter | Tælleobjekter, brøkbjælker og konkrete illustrationer | Arkitekturidè; ikke implementeret |
| [Compute Engine / MathJSON](https://mathlive.io/compute-engine/) | Beregning og strukturerede matematiske udtryk; separat fra rendering | Dokumentation orienteret; ikke testet |

Forslag til evaluering: Lad agenten oprette og ændre en scene via bibliotekets API, og demonstrér elevinteraktion, matematisk korrekthed og integration som plugin. Registrér præcise versioner, reproducerbare eksempler, begrænsninger, responstid og størrelsen på agentens kommandoer. Mål faktisk tokenforbrug, hvis eksemplet involverer modelkald.

Søgningen skal også omfatte nye tilgange ud over de allerede nævnte kandidater.

### Første researchrunde gennemført

Fire underagenter på Sol / medium har undersøgt 2D, nye agentvenlige værktøjer, animation/3D og beregning efter codex-model-router. Resultater og primære kilder: [research/LIBRARIES.md](research/LIBRARIES.md). Fælles afprøvningsplan: [research/PROOF-PLAN.md](research/PROOF-PLAN.md).

Foreløbig shortlist til forsøg:

- **JSXGraph:** Bred interaktiv matematik og konstruktioner.
- **Penrose Bloom:** Dynamiske figurer med constraints og numerisk optimering.
- **manim-web:** Animerede matematiske forklaringer med browserinteraktion.
- **Compute Engine / MathJSON:** Fælles beregningsservice.
- **Geometry DSL:** Særskilt eksperiment med korte agentgenererede, statiske figurer.
- **Mafs og MathBox:** Alternativer til henholdsvis React-baseret 2D og matematisk 3D.

Ingen endelige biblioteksvalg. Ingen integrationer, performance-tal eller tokenbesparelser er lokalt verificeret. Alpha-status accepteres fortsat; næste afgørelse skal baseres på reproducerbare forsøg.

## Åbne designspørgsmål

### Genfundne prøvematerialer

De danske FP9-sæt er sammenlignet med de grønlandske AEU-2-sæt: stort fagligt overlap, men de læste danske problemopgaver kræver oftere selvstændigt metodevalg og begrundelser. Samme visualiseringsplugins kan bruges; prøveordning, årgang og svarform skal bevares som metadata. Konkret fælles eksempel: Tivoli-priser (AEU-2 januar 2017) og skøjtebilletter (FP9 december 2022). Se [research/EXAM-COMPARISON.md](research/EXAM-COMPARISON.md). Sammenligningen dokumenterer ikke formel niveauligestilling.

Downloadet efter brugerens ønske: tre danske FP9-prøvesæt (december 2022 med/uden hjælpemidler og maj 2023 uden hjælpemidler) samt to originale XLSX-bilag, gemt i `materialer/fp9/`. Kilder og SHA-256 findes i `materialer/fp9/sources.json`. PDF-forsider og XLSX-arkivstruktur er kontrolleret. Maj 2023 blev hentet fra slutspurt.nu, fordi det tidligere kaas-nielsen.dk-link gav HTTP 404 ved download.

Efterfølgende webresearch med tre underagenter fandt danske FP9-PDF'er fra december 2022 (begge dele, plus regnearkslinks), maj 2023 (uden hjælpemidler) og december 2014. Nyere officielle sæt ligger i Prøvebanken med loginbegrænsning. Verificerede links og adgangsforhold: [research/FP9-SOURCES.md](research/FP9-SOURCES.md). Intet er importeret i prototypen endnu.

18 PDF-prøver fra 2015–2017 er fundet i en lokal, privat prøvesamling: ni færdighedsregningsprøver og ni problemregningsprøver. Forsiderne er læst: alle er mærket AEU-2 og henviser til Piareersarfik eller Majoriaq med dansk/grønlandsk tekst. De er derfor ikke dokumenteret som danske FP9-prøvesæt. Filoversigt: [research/FOUND-EXAMS.csv](research/FOUND-EXAMS.csv). Originalerne er ikke flyttet eller kopieret ind i prototypen.

En første lokal prototype er nu bygget med brøker/procent til 6. klasse og parabler/tangenter til 2.g. Lokal guidet demo uden AI-model. Mafs er afprøvet i browseren; de øvrige researchkandidater er ikke implementeret. Se [prototypens resultater](research/PROTOTYPE-RESULTS.md) og [README](README.md) for afprøvning og opstart.

- Hvor frit skal agenten kunne komponere scener: strukturerede kommandoer, genereret kode eller en kombination?
- Hvordan deler plugins scenetilstand og matematiske objekter?
- Hvordan kontrollerer vi både matematisk korrekthed og kvaliteten af forklaringen?
- Hvilket emne er bedst til den første prototype? Brøker og procentregning er foreslået, men ikke valgt.
- Hvilke konkrete mål skal vi sætte for hastighed og tokenforbrug?


## 9. september 2026 — rigtig AI i demoen

Brugerbeslutning: Brug eksisterende Codex/ChatGPT-abonnement under lokal test.
Hold provider udskiftelig, så en API-adapter kan overtage senere. Implementeret
med Codex CLI og fælles scene-/chatkontrakt; se [AI-prototypen](docs/AI-PROTOTYPE.md).
Guiden kan ændre brøken og parablens punkt, og AI kan slås fra.
