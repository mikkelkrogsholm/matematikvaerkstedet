# EPIC: Matematik A på gymnasieniveau — stx

Registreret som [GitHub-epic #3](https://github.com/mikkelkrogsholm/matematikvaerkstedet/issues/3).

Status: Første afgrænsede plangeometri-/statistikpilot implementeret; den samlede epic er fortsat åben. Dato: 9. september 2026.
Denne epic bestiller en kommende indholdsudbygning; oprettelsen af planen er
ikke i sig selv autorisation til at starte implementering i denne samtalerunde.
Organisationer og brugere i epic #2 forbliver udskudt.

## Ændret første prioritet: plangeometri og deskriptiv statistik

Ejerens søn arbejder aktuelt med plangeometri og deskriptiv statistik. Efter
beslutning 9. september 2026 leveres en afgrænset emnepilot i disse områder
**før funktionsværkstedet**. Det ændrer leverancerækkefølgen, ikke målet om bred A-dækning.

Første pilot omfatter linjer/cirkler, trekantsberegning, ugrupperede data og
grupperede data med nye varianter, visualisering, svarfeedback og rigtig AI.
Den skal kunne gemme lokal feedback til en konkret opgave, så afprøvningen kan
føre til præcise forbedringer. Se [pilotstatus](../MATEMATIK-A-PILOT.md).
Det resterende plangeometri-/statistikstof og funktionsværkstedet er fortsat
planlagt; piloten afslutter ikke hele G07 eller epic'en.

## 1. Problem og resultat

Eleven skal kunne forstå, anvende og forklare matematik på stx A-niveau i nye
situationer. Træningen skal forbinde regning, modeller, grafiske fremstillinger
og argumentation. Gentagne opgaver skal ændre matematisk struktur og
repræsentation, så succes ikke blot skyldes genkendelse af én løsning.

Produktnavnet er **Matematik A på gymnasieniveau**. Navigationen organiseres
udelukkende efter emner og forudsætninger, ikke 1.g, 2.g og 3.g. Stx og
læreplansversion er eksplicitte metadata og fremgår af faglig information.
Første mulige afprøver er ejerens søn, som har matematik A på stx.

Resultatet er et lokalt, sammenhængende værksted med:

- Emnetræning, korte blandede runder og egne genererede skriftlige øvesæt.
- Mundtlig træning i begreber, ræsonnementer og beviser med fælles visuel tavle.
- Rigtig AI, der kan aflæse og ændre arbejdsfladen gennem kontrollerede handlinger.
- Selvstændig træning og eksamenssimulation uden faglig AI-støtte.
- Synlig faglig dækning, dokumenterede matematiske kontroller og bevaringsværdig historik.

## 2. Grundlag, version og afgrænsning

[Researchen](../../research/gymnasium/MATEMATIK-A.md) samler læreplan, vejledning,
formelsamling, hjælpemiddeloversigt og stikprøver fra vejledende enkeltopgaver.
Baseline er stx A, læreplan august 2024, vejledning november 2025 og den undersøgte
hjælpemiddeloversigt april 2026. Det er ikke en garanti for sønnens fremtidige eksamenstermin.

G01 nedenfor skal kontrollere den præcise profil og analysere flere officielle
opgaver. Årstal, metodekrav, eksamensundtagelser og kildeplaceringer registreres
som data. Antal vejledende eksempler må ikke bruges som officiel emnevægtning.
Enkeltopgavesamlingen er kun stikprøvelæst; ingen fuldstændig opgaveanalyse foreligger.

Inden for scope: stx A-kernestof, et afgrænset supplerende forløb, begge skriftlige
delprøvetyper og mundtlig forberedelse, lokal anvendelse og faktisk AI-integration.

Uden for scope: hhx/htx, øvrige gymnasieniveauer og grundskoleindhold, konti,
organisationer, betaling, skoleintegrationer, officiel karaktergivning, certificeret
prøveafvikling og generel automatisk beviskontrol. Talegenkendelse og stemmesyntese
er valgfrie senere udvidelser; mundtlig træning kan begynde med tekst og tavle.
Der bygges ikke en generel CAS fra bunden.

## 3. Fagligt omfang og leverancebølger

Tabellen er epic'ens implementeringsomfang, ikke en national undervisningsrækkefølge.
Hvert underemne skal i G01 få en selvstændig række i dækningsregistret og en
status: planlagt, implementeret, verificeret eller eksplicit udskudt.
En udskydelse skal være synlig og må ikke skjules bag “fuld A-dækning”.

| ID | Emne og underemner | Første bølge |
|---|---|---|
| A01 | Tal og algebra: talmængder, regnehierarki, omskrivning, potenser/rødder, proportionalitet, ligninger, procent/rente | 1 |
| A02 | Funktioner: begreb, definitions-/værdimængde, lineær, anden grad og øvrige polynomier, eksponential-, potens- og logaritmefunktioner, sammensætning, graftransformationer | 1 |
| A03 | Modellering: parametre, regression, fortolkning, enheder, interpolation/ekstrapolation og modellens rækkevidde | 1 |
| A04 | Differentialregning: grænseværdi/kontinuitet, differentialkvotient, regneregler inkl. produkt/kæde, tangent, monotoni, ekstrema og optimering | 1 |
| A05 | Trekanter og analytisk plangeometri: trigonometri, sinus-/cosinusrelationer, areal, linje, cirkel, skæringer, afstande og tangenter | 2 |
| A06 | Vektorer i planen: regning, længde, skalarprodukt, projektion, determinant, vinkler og parameterfremstillinger | 2 |
| A07 | Sandsynlighed: hændelser, tælling/kombinatorik, stokastiske variable, middelværdi/spredning og binomialfordeling | 2 |
| A08 | Statistik: deskriptive fremstillinger, grupperede/ugrupperede data, normalfordeling, estimation og binomialtest | 2–3 |
| A09 | Trigonometriske funktioner og modeller: sinus/cosinus, amplitude, periode, fase og differentiation | 3 |
| A10 | Integralregning: stamfunktion, bestemt/ubestemt integral, regneregler, substitution, areal og omdrejningsvolumen | 3 |
| A11 | Differentialligninger: kvalitativ analyse, de foreskrevne førsteordens typer, separation, begyndelsesbetingelser og modeller | 3 |
| A12 | Numeriske metoder: Newton og Euler, iteration, tilnærmelse og fejladfærd | 3 |
| A13 | Rumgeometri: vektorer, vektorprodukt, linjer, planer, kugler, skæringer, afstande og vinkler | 3 |
| A14 | Ræsonnement og formidling: definition, sætning, bevis, modbevis, modelkritik, historisk perspektiv og mundtlig fordybelse | Alle |

Faglig dækning og skriftlig eksamensrelevans er forskellige felter. De undersøgte
undtagelser for deskriptiv statistik, estimation og binomialtest skal indgå i
prøveprofilen uden at fjerne disse emner fra undervisningen.
Supplerende stof specificeres som vores eget begrænsede tilbud; det foregiver
ikke at erstatte skolens konkrete supplerende pensum.

## 4. Brugeroplevelse

Indgangen viser emner og tre handlinger: **Lær og øv**, **Blandet træning** og
**Eksamenstræning**. Eleven kan vælge frit; eventuelle faglige forudsætninger
vises som hjælp, ikke som årgangslåse. En kort indledende runde kan foreslå repetition.

Et træningsforløb går fra kort begrebsforklaring til elevens eget arbejde,
eventuel hjælp, feedback og en ny variant. Centrum er opgaven og arbejdsfladen;
AI-panelet er sekundært. På mindre skærme kan forklaringen åbnes efter behov.
Tilføj ikke dashboard- eller organisationsfunktioner for at levere dette.

| Profil | AI til | AI fra |
|---|---|---|
| Opgaver til delprøve 1 | Guidet træning; visualisering må bruges som tydeligt forklaringslag | Selvstændig træning med profilens formelsamling, uden beregningsværktøjer |
| Opgaver til delprøve 2 | Guidet metode- og værktøjstræning | Selvstændig løsning med profilens tilladte værktøjer |

Alle fire kombinationer skal fungere. AI-valget ændrer ikke de almindelige
hjælpemidler. Eksamenstilstand bruger AI fra, tilbageholder feedback og følger
prøvens fasegrænser. Aktivering af hjælp skifter tydeligt til træning og bevarer
arbejdet samt historikken. Et assisteret forsøg bliver aldrig uassisteret ved
at slå AI fra igen. Korte øverunder må ikke mærkes som fulde prøvesæt.

## 5. Kontrakt for generativt indhold

En opgavefamilie beskriver mindst:

- Stabilt ID/version, uddannelse/niveau/læreplan, faglige mål og forudsætninger.
- Tilladte prøveprofiler, metodekrav, svarform og vurderingskriterier.
- Reproducerbart seed og strukturel variant, parametergrænser og gyldighedsbetingelser.
- Matematisk model, opgavetekst, eventuel historie, givne oplysninger og delspørgsmål.
- Scene, elevens tilladte handlinger og separate AI-forklaringsobjekter.
- Skjult facit, uafhængig kontrolmetode, almindelige misforståelser og støttetrin.
- Kildereference samt egen QA-status; modelgenereret tekst er ikke en faglig godkendelse.

Den samme model styrer tekst, tal og figur. Opgavens forudsætninger fryses ved
start. Et nyt spørgsmål må ikke utilsigtet ændre det foregående delspørgsmåls data.
Generatoren kontrollerer matematikken; AI bruges til forklaring og tilpasning
inden for validerede rammer. Ingen krav om modelkald for hver ny talvariant.

Pr. familie kræves som udgangspunkt mindst tre strukturelle varianter, fx direkte
beregning, rekonstruktion fra resultat og fejl-/modelanalyse. G01 registrerer en
begrundet undtagelse, hvis et snævert færdighedsmål ikke meningsfuldt har tre.
Variation skal også omfatte repræsentation og opgaveform, hvor det er fagligt relevant.
Hold mindst én variant tilbage fra guidet demonstration til selvstændig afprøvning.

Historier skal være korte og plausible, med konsistente enheder og relevante
antagelser. Rene matematikopgaver behøver ingen kunstig fortælling. Sværhedsgrad
beskrives gennem konkrete krav, ikke uverificerede kalibrerede niveauer.

## 6. Matematikvurdering og værktøjer

Svar kan være tal, eksakte udtryk, mængder/intervaller, koordinater, konstruktioner,
metodetrin eller begrundelser. Vurdering skal skelne mellem forkert, korrekt,
delvist opfyldt, ikke understøttet og kræver gennemgang.

- Ækvivalens må respektere definitionsmængder, enheder og eventuelle ekstra løsninger.
- Numerisk tolerance begrundes pr. opgave; stikprøvepunkter alene er ikke bevis for symbolsk identitet.
- Stamfunktioner håndteres med integrationskonstant; differentialløsninger med betingelser.
- Et korrekt slutresultat opfylder ikke automatisk et eksplicit metodekrav.
- Åbne beviser og forklaringer får kriteriebaseret feedback; AI-feedback mærkes som sådan.
- Facit og løsningsmateriale holdes ude af elevpayload før den relevante feedbackfase.

Afprøv en eksisterende motor til nødvendige symbolske/numeriske operationer og
et passende værktøjsflow til regression/data. Dokumentér licens, nøjagtighed og
begrænsninger før valg. Alpha-kode er acceptabel med konkret funktionsbevis.
Eksamenstræning må først kaldes dækkende, når profilens nødvendige værktøjer er
verificeret. Tillad et dokumenteret eksternt CAS-flow, hvis det er den enkleste
løsning; AI skal ikke hævde at kunne se handlinger i et eksternt program.

## 7. Visualisering og agentinteraktion

Genbrug FP9's sceneejerskab og kvitteringsprincipper. Udbyg kun de nødvendige
repræsentationer: funktionskurver, punkter/linjer, vektorer, tabeller/fordelinger,
integralflader, hældningsfelter og rumfigurer.

- Målestok, akser, enheder, domæner og etiketter skal være korrekte. En skitse mærkes som skitse.
- Undgå falske forbindelser over asymptoter og ugyldige domæner. Sampling og zoom må ikke skjule centrale egenskaber.
- Vis fortegnet integral og geometrisk areal som forskellige begreber.
- Rumfigurer kræver forståelig kamerastyring og alternativ tekst/2D-visning af relevante oplysninger.
- Agenten får et struktureret snapshot med objekter, værdier, markering og revision.
- Tillad kun typede, validerede handlinger på identificerbare objekter; ingen vilkårlig modelkode i browseren.
- AI må tilføje, flytte, fremhæve og animere forklaringer, men ikke overskrive elevens svar eller ændre givne data.
- En handling omtales først som vist efter renderkvittering. Fejl giver rollback eller en præcis fejlbesked.
- Stop, fortryd, navigation, AI fra og genforsøg bevarer sceneinvarianter; reduceret bevægelse understøttes.
- Matematik skal kunne aflæses uden farve alene, med tastatur og meningsfulde tekstalternativer.

## 8. Delopgaver og acceptkriterier

### G01 — Versioneret fagligt register og prøveprofil

- [ ] Alle A01–A14-underemner er koblet til kilder, læringsmål, forudsætninger og planlagte familier.
- [ ] Relevante dele af enkeltopgavesamlingen er analyseret på tværs af alle skriftlige emner og begge delprøver; kilde/side/opgave/metode registreres.
- [ ] Prøveprofilen indeholder tid, faseovergang, hjælpemidler, metodekrav, undtagelser og kontroltidspunkt.
- [ ] Mundtligt og supplerende stof er adskilt fra den skriftlige blueprint; historiske sæt blandes ikke ind uden versionsmærkning.
- [ ] Første bølges konkrete familier og matematiske kontrolmetoder er besluttet før implementering.

### G02 — Genbrugelig emneindgang og indholdskontrakt

Afhænger af G01.

- [ ] Matematik A kan åbnes og navigeres efter emner uden årgangsopdeling.
- [ ] Familie/version/seed/profil kan gemmes og genskabes med samme opgave.
- [ ] Emne, forklaring og hjælpestatus fremgår uden implementeringsdetaljer i elevflowet.
- [ ] Kontrakten kan bære både FP9 og A-indhold uden at ændre FP9-opgavernes adfærd.
- [ ] Kun nødvendige udtræk fra den eksisterende kode foretages; ingen total omskrivning.

### G03 — Første sammenhængende funktionsværksted

Afhænger af G01–G02; udvikles sammen med G04–G06 for de berørte familier.

- [ ] Forløb: relevant algebra → funktion/model → sekant/tangent → afledt → monotoni/optimering.
- [ ] Andengrad, eksponentialfunktion og logaritme indgår med gyldige domæner.
- [ ] Mindst én modelopgave forbinder fortælling, beregning, graf og fortolkning.
- [ ] Eleven kan forklare et trin og få et relevant opfølgende spørgsmål fra rigtig AI.
- [ ] Alle fire kombinationer af delprøvetype og AI er afprøvet for understøttede opgavetyper.
- [ ] Ny strukturel variant uden AI kan gennemføres efter guidet træning.
- [ ] Et lokalt, dokumenteret demoforløb kan afprøves på ejerens søn uden konti.

### G04 — Vurdering og værktøjsadaptere

- [ ] Svarformerne i afsnit 6 er understøttet for implementerede familier eller tydeligt sendt til gennemgang.
- [ ] Regression, relevante symbolske operationer og numeriske metoder er konkret afprøvet.
- [ ] Enhed, domæne, afrunding, flertydighed og metodekrav har målrettede regressionstests.
- [ ] Nye dependencies har dokumenteret versions- og licensgennemgang for produktets anvendelse.

### G05 — Dynamiske scener og fælles tavle

- [ ] Repræsentationerne i afsnit 7 implementeres i takt med de relevante emner.
- [ ] Geometri, sampling og matematisk model kontrolleres med uafhængige egenskaber.
- [ ] Rigtig AI kan ændre en scene og efterfølgende aflæse elevens egen ændring.
- [ ] For hver ny scenetype dokumenteres browserkontrol af korrekt render, fejlforløb og betjening.
- [ ] Scene-/renderhandlinger er sikre ved forældet revision, Stop, fortryd og genforsøg.

### G06 — AI-guide med aftagende støtte

- [ ] Den lokale Codex-provider fungerer bag eksisterende udskiftelig adapter.
- [ ] Spørgsmål, hint, deltrin og løsning har forskellige, afprøvede støttekontrakter.
- [ ] AI fra giver ingen skjulte modelkald; modellen kan ikke omgå profilens rettigheder.
- [ ] Forbrug, latenstid, timeout og afbrudte kald registreres med begrænsede kontekster.
- [ ] Støttehistorik overlever reload, eksport/import og skift til AI fra.
- [ ] Reelle modelkald bruges i evaluering; fixtures alene tæller ikke som fungerende AI.

### G07 — Øvrigt emnebibliotek

Afhænger af den første verificerede bølge; G04–G06 udbygges efter behov.

- [ ] Bølge 2 og 3 leverer alle underemner i dækningsregistret med tydelig status.
- [ ] Familienes strukturelle variation, forudsætninger og kontrolmetoder er implementeret.
- [ ] 3D-, integral-, fordelings- og differentialligningsscener er fagligt verificeret.
- [ ] Et afgrænset forløb med supplerende stof og historisk perspektiv er specificeret og tilgængeligt.
- [ ] Ufuldstændig dækning vises ærligt; afslutning af G03 er ikke afslutning af G07.

### G08 — Skriftlige øvesæt og eksamenssimulation

Afhænger af tilstrækkelig verificeret dækning i G07.

- [ ] Korte og fulde egne sæt genereres reproducerbart med en dokumenteret blueprint og variation.
- [ ] Blueprintens vægte og sværhedsvalg mærkes som vores design, medmindre en kilde fastsætter dem.
- [ ] Baselineprofilens 180/120 minutter og delprøveovergang er implementeret; testen simulerer tiden.
- [ ] Begge opgavedele kan ses fra start, men værktøjer og aflevering følger fasegrænserne.
- [ ] Formelsamling, datafiler og nødvendige værktøjer har et verificeret flow; anvendelsesrettigheder er afklaret.
- [ ] Eksamenstilstand skjuler hjælp og feedback indtil relevant aflevering; hjælp kan konvertere til tydeligt assisteret træning.
- [ ] Besvarelser, noter, navigation, timer, import/eksport og print kan genoptages og kontrolleres.
- [ ] Resultatet viser fagområder og støttebrug, ikke en udokumenteret officiel karakter.

### G09 — Mundtlig forberedelse

Kan begynde allerede i G03; bred dækning afhænger af G07.

- [ ] Bibliotek af egne øvespørgsmål dækker begreber, argumentation, beviser og valgt supplerende stof.
- [ ] Eleven kan se øvespørgsmålene, trække et spørgsmål, forberede en disposition og gennemføre en faglig dialog.
- [ ] Vejledertilstand og en simulation med tilbageholdt hjælp er tydeligt adskilt.
- [ ] AI kan stille spørgsmål som eksaminator; assistance under forberedelsen gør forløbet til guidet træning.
- [ ] Feedback skelner mellem faglig korrekthed, begrundelse, notation og formidling; tvivl markeres.
- [ ] Skolens egne spørgsmål kan senere indtastes som lokalt materiale uden at blive publiceret automatisk.
- [ ] Tekst/tavle-forløbet kaldes mundtlig forberedelse, ikke en verificeret vurdering af elevens faktiske tale.

### G10 — Samlet QA og dokumenteret prototypeaccept

- [ ] Typecheck, relevante tests og build består; FP9 samt eksisterende demoer fungerer fortsat.
- [ ] Hver familie testes som udgangspunkt med mindst 100 seeds pr. struktur og relevante grænsetilfælde.
- [ ] Facitkontrol bruger uafhængig beregning/egenskab; generator og dens eget facit er ikke tilstrækkelig test.
- [ ] Hver struktur gennemgås visuelt med mindst to forskellige parametervalg; beviser og åbne kriterier gennemgås fagligt.
- [ ] AI-evaluering dækker hint uden facit, matematiske fejl, figurhandling, usikkerhed og irrelevant input.
- [ ] Netværksfejl, timeout, annullering, tabt kvittering, genindlæsning og lokal gemning har browser-evidens.
- [ ] Mål lokal respons (arbejdsmål p95 under 100 ms på oplyst udstyr) og AI-latens/tokens separat; målafvigelser dokumenteres og afhjælpes, når de hindrer brug.
- [ ] Alle kriterier har henvisning til kode, test eller observeret resultat i en samlet acceptfil.
- [ ] Kilder/prøveprofil er genkontrolleret, og kendte faglige/værktøjsmæssige begrænsninger er synlige.

## 9. Leverancer og rækkefølge

1. **Grundlag:** G01 og G02; konkret register, kontrakt og emneindgang.
2. **Afprøvbar første milepæl:** plangeometri/statistik-piloten ovenfor med relevante dele af G04–G06 og G10. Derefter G03.
3. **Faglig bredde:** G07 i bølger med løbende visualisering, AI og QA.
4. **Prøveforberedelse:** G08 og færdiggørelse af G09.
5. **Epic-accept:** G10 samt verificeret opfyldelse af alle delopgaver.

Foreslåede artefakter: `research/gymnasium/sources.json`, `coverage.json`,
`task-map.jsonl`, `exam-profiles.json`, genereret QA-korpus samt
`docs/MATEMATIK-A-ACCEPTANCE.md`. Navne er forslag, ikke krav om et ekstra framework.
Ingen kalender- eller tokenestimat fastsættes før første bølges kontrakt er konkret.
Delopgaverne bliver ikke automatisk ti separate issues.

## 10. Afprøvning med sønnen og definition af færdig

Plangeometri/statistik-piloten og senere G03 skal være nemme at afprøve på sønnen. Et foreslået lille forløb er selvstændig
startopgave, guidet variant, ny variant uden AI og senere gentagelse. Observer
misforståelser, selvstændighed, grafik og brugerflow; registrér kun nødvendige
oplysninger lokalt. En enkelt elev dokumenterer ikke generel læringseffekt.

**Faktisk deltagelse af en elev er ikke et blokerende acceptkriterium for denne
prototype-epic.** Resultater fra en frivillig afprøvning er input til forbedring,
ikke noget agenten må opfinde eller vente ubegrænset på. Tekniske og faglige
kontroller skal kunne gennemføres med syntetiske data.

Epic'en er færdig, når G01–G10 er opfyldt med evidens, alle aftalte underemner
har verificeret dækning og brugerforløbene kan gennemføres. En milepæl kan
leveres tidligere uden at lukke hele epic'en. Scopeændringer registreres
udtrykkeligt; et lavt resterende budget gør ikke en ufuldstændig epic færdig.

## 11. Åbne valg og sikre standarder

- Sønnens aktuelle emne: kan ændre rækkefølgen; bekræftet start er nu plangeometri og deskriptiv statistik.
- Skolens CAS: påvirker værktøjstræning; må ikke blokere generiske indholdskontrakter.
- Holdets konkrete prøveår/version: genbekræft før terminsspecifik simulation; vis baseline indtil da.
- Supplerende stof og skolens mundtlige spørgsmål: vores egne mærkede eksempler indtil konkret materiale foreligger.
- Symbolsk motor/3D-bibliotek: vælg efter små verificerbare forsøg og licensscreening.

## 12. Referencer

- [Fagligt grundlag og officielle kilder](../../research/gymnasium/MATEMATIK-A.md).
- [Produkt- og visualiseringskrav](../../research/PRODUCT-REQUIREMENTS.md).
- [Eksisterende FP9-accept](../FP9-ACCEPTANCE.md).
- [AI-prototype og provider](../AI-PROTOTYPE.md).
- [Arkitekturreview](../../research/architecture/README.md).
- [Udskudt organisations-epic](ORGANISATIONS-AND-USERS.md).
