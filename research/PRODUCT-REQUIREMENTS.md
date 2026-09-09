# Matematikunderviser — samlede krav og designnoter

Dato: 9. september 2026. Levende dokument fra samtalen.

**Status:** Brugerønsker beskriver den ønskede retning. Konkrete løsningsforslag og acceptkriterier nedenfor er arbejdsforslag, ikke dokumentation for implementeret funktionalitet. Den eksisterende prototype har en lokal Codex-adapter med rigtig AI til de to demonstrationsscener; se [PROTOTYPE-RESULTS.md](PROTOTYPE-RESULTS.md).

## 1. Formål og brugere

**Brugerønske:** En matematisk underviser, der kombinerer samtale, forklaringer og dynamiske visualiseringer. Eleven skal blive god til begreber og fremgangsmåder og kunne bruge dem i nye situationer. Eleven skal ikke blot lære en bestemt opgave udenad.

Den langsigtede ambition spænder fra 0. klasse til 3.g. De første konkrete brugere er en elev i 6. klasse og en elev i 2.g; gymnasieeleven har matematik A på stx. Produktet kaldes Matematik A på gymnasieniveau og organiseres efter emner og forudsætninger uden årgangsopdeling. Matematik A er nu første prioritet for næste indholdsudbygning; se [research](gymnasium/MATEMATIK-A.md). FP9-materialet er et konkret analysegrundlag og en mulig senere målgruppe, ikke i sig selv en passende sværhedsgrad for begge børn.

Muligt layout: emner og niveauvalg i venstre panel, fælles visuel arbejdsflade i midten og samtale i højre panel. Arbejdsfladen er central: her skal eleven se, undersøge og arbejde med matematikken.

### Afklaret forretningsmodel

Gratis privat brug med egne børn eller børn under værgemål. Skolebrug,
organisationsbrug, undervisning af andres børn og kommerciel brug kræver en
særskilt aftale med ejeren. Ejeren ønsker at kunne sælge løsningen til skoler.
Offentlig kildekode udgives under en privat familielicens (source available).
Biblioteker og assets skal derfor kunne bruges i en kommerciel løsning; se
[licensscreeningen](LICENSE-REVIEW.md) og [vilkårene](../LICENSE.md).

## 2. Hvad tester en opgave, og hvordan?

**Brugerønske:** Undersøg de eksisterende prøver for at forstå både det faglige indhold og måden, eleven bliver testet på.

**Forslag til registrering pr. delopgave:**

| Felt | Hvad vi skal beskrive |
| --- | --- |
| Kilde | Prøveordning, år, fil, side og opgavenummer. |
| Fagligt mål | Begreb, færdighed og nødvendig forhåndsviden. |
| Elevens arbejde | Beregne, aflæse, modellere, konstruere, vælge metode, undersøge eller begrunde. |
| Fremstilling | Tekst, tabel, formel, diagram, geometrisk figur eller kombination. |
| Fortælling | Situation, personer, objekter, praktiske antagelser og sammenhæng mellem delopgaver. |
| Svar og bedømmelse | Tal, enhed, interval, figur, forklaring eller flere mulige løsninger; kriterier for et godt svar. |
| Støtte og hjælpemidler | Givne formler, deltrin, bilag, regneark og tilladte værktøjer. |
| Mulige vanskeligheder | Faglige misforståelser, læsekrav og repræsentationsskift; tydeligt mærket som vores analyse. |
| Variation | Hvad kan ændres, mens det faglige mål bevares, og hvad ændrer selve målet? |

Analysen skal bruge opgaver og tilgængelige officielle vejledninger. Den eksisterende sammenligning er kvalitativ; der er endnu ikke lavet en fuld kortlægning af hver delopgave eller en dokumenteret sværhedsgradskalibrering.

## 3. Generative opgaver og prøvesæt

**Brugerønske:** Opgaver og øveprøver skal kunne skabes undervejs og være forskellige fra gang til gang. Målet er i praksis meget mange brugbare varianter.

**Foreslåede krav:**

- Variér tal, kontekst, visning, ukendt størrelse og krav til tænkning. Nye navne og tal alene er utilstrækkeligt.
- Brug opgavefamilier med faglige mål, parametre, begrænsninger, løsningskontrol, bedømmelseskriterier og visningsmuligheder.
- Lad variationen være kontrolleret: mere læsning, flere trin eller skift fra tabel til formel kan gøre en opgave sværere, selv om emnet er det samme.
- Generér kun opgaver, der kan besvares ud fra de givne oplysninger. Et bevidst spørgsmål om manglende oplysninger skal være angivet som sådan.
- Bevar sammenhæng mellem fortælling, tal, enheder, bilag, spørgsmål, figur og løsning.
- Sammensæt hele prøver efter en plan for emner, kompetencer, svarformer, anslået tid og sværhedsgrad. Tilfældige opgaver giver ikke automatisk sammenlignelige prøver.
- Gem seed, generatorversion og konkret opgaveindhold, så en elev kan vende tilbage til samme opgave, og fejl kan reproduceres.
- Hold elevens igangværende opgave stabil. En forklaring eller visningsændring må ikke utilsigtet ændre opgavens forudsætninger.
- Betegn genererede sæt som øveprøver. Officiel FP9-ækvivalens og karaktergrænser er ikke dokumenteret.

En model må gerne foreslå nye opgavefamilier, men de skal afprøves før almindelig brug. Kontrol må ikke bestå alene i, at den genererende model godkender sit eget facit. Åbne svar kræver mulighed for flere gyldige løsninger og begrundelser.

## 4. Krav til visualiseringer

**Brugerønsker:** Grafikken skal være flot, matematisk korrekt og repræsentativ. Størrelsesforhold skal passe. Visualiseringer skal kunne skabes og tilpasses dynamisk og være hurtige med lavt tokenforbrug. Agenten skal kunne interagere med den visning, eleven arbejder i.

### Matematisk korrekthed

**Foreslåede konkrete krav:**

- Opgave, facit, tabel og figur bygger på samme matematiske datagrundlag.
- Længder, vinkler, arealer og andele skal vises i korrekte forhold, når figuren bruges som målfast repræsentation.
- Koordinatgeometri, hvor form eller vinkel betyder noget, skal bruge passende ens skalering på akserne. Pris- og tidsgrafer kan have forskellige akseskalaer, men de skal være tydelige.
- Akser, enheder, kategorier, signaturer og relevante værdier skal være læselige. Aksebrud og afskårne akser må ikke skjule en vigtig fortolkning.
- Skitser, der ikke er målfast tegnet, skal mærkes. En opgave må ikke kræve præcis måling fra en sådan skitse.
- Diskrete størrelser skal behandles korrekt: antal besøg er hele tal, selv om en underliggende prislinje kan tegnes kontinuert. Et geometrisk skæringspunkt er ikke altid et gyldigt svar i virkelighedens situation.
- Afrunding i tekst og grafik må ikke skabe modstrid med beregningen. Beregn med tilstrækkelig præcision, og angiv relevant afrunding i svaret.
- Genererede figurer skal overholde deres geometriske begrænsninger og kunne håndtere randtilfælde uden fejlagtige billeder.

### Pædagogik og visuel kvalitet

- Brug grafik til at gøre en relation forståelig eller understøtte elevens arbejde. Illustrationer af historien og matematiske figurer kan have forskellige roller.
- Hold farver, symboler og objektnavne konsistente på tværs af tekst, tabel, graf og forklaring.
- Vis information trinvist, når det støtter forklaringen. Undgå at afsløre netop den værdi, eleven skal bestemme.
- Understøt skift mellem konkret situation, graf/tabel og matematisk udtryk, mens sammenhængen bevares.
- Etiketter må ikke overlappe eller blive klippet væk ved forskellige tal, vinduesstørrelser eller zoomniveauer.
- Farve må ikke være eneste betydningsbærer; brug også tekst, symboler eller linjemønstre. Centrale interaktioner bør kunne betjenes med tastatur og berøring.
- Animation skal have en faglig funktion, kunne standses og tage hensyn til reduceret bevægelse.
- Skeln mellem at illustrere en påstand og at bevise den. En animation eller nogle få afprøvede tal er ikke automatisk et generelt bevis.

### Dynamik og genbrug

- Plugins leverer genbrugelige byggeelementer og handlinger; konkrete scener skal ikke alle være tegnet på forhånd.
- Agenten skal kunne sammensætte og ændre scener fra strukturerede kommandoer.
- Elevens træk og skyderændringer skal kunne opdatere lokalt uden et modelkald for hvert trin.
- En scene skal kunne gemmes og gendannes. Foreslået ekstra funktion: fortrydelse af ændringer.
- Både datakontrol og visuel kontrol er nødvendige; korrekt beregning garanterer ikke et læseligt resultat.

## 5. Visningsbehov set i prøvematerialet

Observationerne bygger på [sammenligningen af danske og grønlandske prøver](EXAM-COMPARISON.md). Sidste kolonne er vores forslag til produktfunktioner.

| Opgaver i materialet | Matematik og fremstilling | Mulig funktion i underviseren |
| --- | --- | --- |
| Tivoli, AEU-2 januar 2017, problemregning 12–13; skøjtehal, FP9 december 2022 med hjælpemidler 1.4 | Priser, grafer og valg mellem tilbud. | Synkron tabel og prisgraf, markering af antal besøg og sammenligning af tilbud. |
| Skøjteløbernes tider, FP9 december 2022 med hjælpemidler 2.1 | Sammenligning af datasæt og begrundelse for valg. | Tabel og fx prikdiagram; eleven kan undersøge forskellige egenskaber ved data. Diagramtypen er vores forslag. |
| Medaljer, AEU-2 maj 2017, problemregning 15–17 | Tabelsummer, manglende tal og cirkeldiagram. | Sammenhæng mellem antal, andel og sektorvinkel; eleven kan selv konstruere diagrammet. |
| Temperaturer, FP9 december 2022 med hjælpemidler, opgavegruppe 5 | Tidsserie, gennemsnit og vurdering af udvikling. | Tidsserie med valgbare perioder og tydelig adskillelse mellem rådata og beregnede mål. |
| Geometri i de læste sæt | Vinkler, målestok, areal og rumfang. | Målfast geometri, måleredskaber og eventuelt opdeling af figurer under forklaring. |
| Algebra, FP9 december 2022 med hjælpemidler 6.3–6.4 | Forklaring af omskrivningsfejl og opstilling af udtryk. | Trinvis visning af udtryk og markering af den del, en omskrivning ændrer. Ikke alle opgaver behøver en graf. |

Tabellen er en første behovsliste. Den er ikke en udtømmende registrering af prøvernes figurer eller en beslutning om bestemte biblioteker.

## 6. Historier omkring opgaverne

**Brugerobservation:** Mange prøveopgaver har en fortælling eller praktisk situation, og det skal platformen kunne skabe og arbejde med.

I materialet ses bl.a. en tur i Tivoli, skøjtebilletter, sportsresultater, temperaturmålinger, fiskeri og slædeløb. Fortællingen kan give mening til tallene, skabe sammenhæng mellem delopgaver og kræve, at eleven oversætter en situation til matematik.

**Foreslåede krav til genererede historier:**

- Beskriv situation, formål og nødvendige oplysninger klart. Historien skal give eleven en forståelig grund til at regne eller undersøge noget.
- Tilpas sprog og læsemængde til elev og læringsmål. Sproglig kompleksitet må ikke utilsigtet blive den største udfordring.
- Brug sammenhængende og plausible størrelser, enheder og betingelser. Skeln mellem opdigtede øvedata og data fra en virkelig kilde.
- Genbrug oplysninger konsistent gennem et opgaveforløb: samme person, priser, tidsrum og objekter, medmindre en ændring er udtrykkeligt beskrevet.
- Variér situationer, så eleven møder samme matematik flere steder. Personlige interesser kan bruges, når eleven har oplyst dem, men må ikke begrænse al træning til én kendt kontekst.
- Lad nogle opgaver være rent matematiske. En fortælling er ikke nødvendig for enhver ligning eller figur.
- Brug kun overflødige oplysninger bevidst, når udvælgelse af relevante data er en del af målet.
- Hvis et genereret stemningsbillede bruges, skal matematiske mål, diagrammer og labels fortsat bygges af kontrollerede data. Et dekorativt billede skal ikke være en skjult kilde til præcise mål.

**Eksempel på en familie:** En klasse skal vælge mellem to aktivitetssteder. Først læser eleven en prisliste, derefter sammenligner eleven omkostninger ved forskellige deltagerantal og til sidst begrunder eleven sit valg. Familien kan senere foregå ved leje af udstyr eller et abonnement, mens den matematiske relation bevares. Nye antagelser om fx grupperabat skal være eksplicitte og matematisk modelleret.

## 7. Agentens adgang til arbejdsfladen

**Foreslået kontrakt:** Agenten kan læse objekter, værdier, koordinater, akser, enheder, synlighed og elevens markeringer. Den kan oprette, ændre og fremhæve objekter samt modtage hændelser fra elevens handlinger.

Handlinger skal returnere den faktisk anvendte tilstand og eventuelle fejl. Agenten må ikke antage, at en figur blev ændret, blot fordi den sendte en kommando. Opgave og scene skal identificeres med version, så en forsinket forklaring ikke beskriver en tidligere visning.

Snapshots og kompakte ændringer bruges til den løbende dialog; screenshots kan supplere ved kontrol af layout og faktisk rendering. Elevsynlig information og internt facit skal holdes adskilt. Et elevtræk er en observation, ikke et sikkert bevis på en bestemt tanke eller misforståelse.

## 8. Træning, prøve og tegn på forståelse

**Præcisering fra brugeren:** Prøvetype og AI-støtte er uafhængige akser.
Både opgaver med og uden hjælpemidler skal kunne tages med AI til eller fra.
AI er støttehjul, som kan trappes ned; AI fra fjerner ikke de almindelige
værktøjer i typen med hjælpemidler. Tid og feedbacktid vælges særskilt.
En prøvesimulation er én særlig profil, ikke hele produktets træningsmodel.
Detaljer og acceptkriterier: [FP9-oplevelsen](../docs/FP9-EXPERIENCE.md) og
[epic'en](../docs/epics/FP9-EXAM-TRAINING.md).

**Forslag:** Træning tillader hints, forklaringer og justeret støtte. Prøvetilstand holder opgaven fast og tilbageholder hjælp og løsninger til aflevering. Hjælp registreres, så en løsning med omfattende støtte ikke sidestilles med en selvstændig løsning.

Læring undersøges gennem nye kontekster, repræsentationer og opgaveformer uden hjælp og gerne med forsinkelse. Nogle varianter skal holdes ude af træningen. En enkelt korrekt løsning er utilstrækkelig til at erklære et begreb mestret. For åbne opgaver vurderes både resultat og ræsonnement efter tydelige kriterier.

## 9. Teknisk retning og økonomi

Cordis er den afprøvede kandidat til pluginfundament, og Bun 1.4 er afprøvet i den lille prototype. Det er ikke en garanti for alle fremtidige plugins. Biblioteksresearch findes i [LIBRARIES.md](LIBRARIES.md).

**Brugerønske:** Nye biblioteker og alpha-kode er acceptable, hvis vi kan demonstrere, at de virker. Hastighed, matematisk korrekthed og lavt tokenforbrug skal tænkes ind fra starten.

**Forslag:** Brug kompakte scenekommandoer, lokale beregninger og lokal rendering. Mål genereringstid, interaktionsrespons og faktiske modeltokens på konkrete forløb. Kvantitative mål er endnu ikke fastlagt. Valg af bibliotek skal bygge på reproducerbare forsøg med opgavernes reelle behov.

## 10. Første foreslåede afprøvning

Start med prisfamilien og to tilbud, før vi udvider til tre tilbud og hele prøver:

1. Generér 100 reproducerbare varianter og kontrollér de matematiske begrænsninger, facit og enheder.
2. Kontrollér et udvalg af historier og visninger fagligt og visuelt, herunder lange etiketter, store tal og forskellige skærmstørrelser.
3. Vis samme opgave som tekst, tabel og graf uden indbyrdes modstrid.
4. Demonstrér en elevhandling, agentens korrekte aflæsning og en relevant ændring eller forklaring i den samme scene.
5. Afprøv både støttet træning og en ny variant uden hjælp. Registrér begrænsninger frem for at konkludere læring alene ud fra gennemført interaktion.

Udvidet begrundelse og indledende forskningskilder: [GENERATIVE-EXAMS.md](GENERATIVE-EXAMS.md). Næste beslutninger er første målgruppe, den præcise opgavefamilie og målbare krav til hastighed. Dette dokument igangsætter ikke i sig selv implementering.
