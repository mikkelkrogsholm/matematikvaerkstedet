# FP9 matematik — grundlag for træningsproduktet

Undersøgt 9. september 2026. Research afsluttet til planlægning af første epic.
Produktet er ikke implementeret eller pædagogisk valideret gennem denne research.

## Konklusion og afgrænsning

Byg træning i begge skriftlige delprøver med et separat valg af AI-støtte.
Eleven skal kunne starte med støttehjul og senere løse nye varianter selv.
Brug officielle rammer til indhold og prøveformat, de historiske sæt til
opgavetyper og vores egen afprøvning til at afgøre kvaliteten af nye opgaver.

Første epic afgrænses til **skriftlig FP9**. Mundtlig matematik findes fortsat som
udtræksprøve og kræver et særskilt forløb; den er ikke dækket af en skriftlig
prøvegenerator. Træning i at forklare og begrunde er dog relevant på tværs.
[UVM: prøvestruktur](https://uvm.dk/grundskole/folkeskolen/folkeskolens-proever/aarsplan-og-proeveplaner/ny-proevestruktur-fra-skoleaaret-2025-2026/).

## Kilder og sikkerhed i konklusionerne

[sources.json](sources.json) indeholder 12 kilder med dato, læste afsnit og
hashes for de lokalt tilgængelige PDF'er. [task-map.jsonl](task-map.jsonl) er vores
egen analyse: 20 nummererede delopgaver i december 2022 med hjælpemidler samt
20 opgavegrupper i maj 2023 uden hjælpemidler. Sidstnævnte er grupper, ikke en
påstand om 20 spørgsmål. De tre historiske danske PDF'er er tidligere læst;
denne systematiske kortlægning omfatter de to ovennævnte.

Tekst og udvalgte figursider er kontrolleret. Formeludtræk fra PDF kan miste
brøker og symboler; kortlægningen gengiver derfor ikke facit eller alle formler.
Bilagsfiler er lokaliseret, men der er ikke gennemført en opgavevis løsning og
faglig censur af hele materialet. Nyere loginbeskyttede sæt og deres
rettevejledninger er ikke indholdslæst. Grønlandske AEU-2-sæt er supplement til
idéudvikling, ikke reference for danske prøveregler.

Markeringer i dette grundlag:

- **Officiel ramme:** oplysninger fra ministeriet, med versionsdato.
- **Observation:** det vi har set i de konkrete historiske prøver.
- **Produktforslag:** vores valg, som skal implementeres og afprøves.

## Officielle rammer

**Uden hjælpemidler:** Maj 2026 afvikledes prøven digitalt og selvrettende med
en varighed på 60 minutter. Skriveredskaber og papir til udregninger er tilladt;
almindelige matematiske hjælpemidler er ikke.
[Retningslinjer, s. 2](https://uvm.dk/media/eo3njh4l/260324-fp9-matematik-uden-hjaelpemidler-retningslinjer-maj-2026-a.pdf).

**Med hjælpemidler:** Maj 2026 varede prøven 180 minutter og havde både trykt og
digitalt opgavehæfte, regnearksbilag og papiraflevering. En produktvisning med
digital aflevering er derfor en træningsoplevelse, ikke en kopi af hele skolens
afvikling. Printvenlig besvarelse er relevant.
[Retningslinjer, s. 2–3](https://uvm.dk/media/cogektni/260324-fp9-matematik-med-hjaelpemidler-retningslinjer-maj-2026-a.pdf).

**Vejledning oktober 2025:** Uden hjælpemidler beskrives 20 opgaver med 50
delopgaver, fri navigation og ét point pr. korrekt svar. Ækvivalente svarformer
accepteres, medmindre opgaven kræver en bestemt form. Med hjælpemidler vurderes
både løsning og faglig begrundelse; den officielle karakter kræver mere end
automatisk facitkontrol. Delopgaver skal kunne løses uden egne tidligere
resultater. Fagspecifikke hjælpemidler fra undervisningen kan bl.a. være
lommeregner, CAS, geometri og regneark; onlineadgang afhænger af regler og
skolens anvisninger. En konkret prøve har sin egen rettevejledning.
[Prøvevejledning, s. 7–14](https://uvm.dk/media/br4hbu3h/251022-vejledning-til-folkeskolens-proever-i-matematik-i-9-klasse.pdf).

**AI og støttehjul:** AI er ikke tilladt under de officielle skriftlige prøver.
Det ændrer ikke produktbeslutningen: **begge opgavetyper skal kunne trænes med
AI**. Vi mærker assisterede forløb som træning og bruger nye, selvstændige forsøg
til at se, om støtten kan undværes. Produktet skal ikke markedsføres som et
godkendt hjælpemiddel ved selve eksamen.
[Ministeriets AI-regler](https://uvm.dk/grundskole/folkeskolen/folkeskolens-proever/proeveafholdelse/brug-af-digitale-hjaelpemidler-og-kunstig-intelligens-ved-folkeskolens-proever/).

**Versionsstyring:** Sommerplanen 2027 placerer de to matematikdelprøver
3. maj, kl. 9–10 og 10–13. Brug oktober 2025-vejledningen og de fundne
2026-afviklingsregler som eksplicit baseline; kontrollér terminsreglerne igen
før en 2027-prøveprofil frigives.
[Prøveplan 2027](https://uvm.dk/grundskole/folkeskolen/folkeskolens-proever/aarsplan-og-proeveplaner/proeveplan-sommer-2027/).

## Fagligt landkort

Fagets områder er matematiske kompetencer, tal og algebra, geometri og måling
samt statistik og sandsynlighed. Fælles Mål skelner bl.a. mellem
problembehandling, modellering, ræsonnement, repræsentation/symbolbehandling,
kommunikation og hjælpemidler.
[Fælles Mål, efter 9. klassetrin, s. 8](https://uvm.dk/media/ko0dtyah/240513-faellesmaal-matematik.pdf).

De detaljerede færdigheds- og vidensmål/-områder er vejledende fra januar 2025;
bl.a. kompetencemålene er fortsat bindende. Ministeriet oplyser, at ældre hæfter
ikke er ajourført med ændringen, og at fagplaner skal erstatte Fælles Mål fra
2027/28. Vi må derfor ikke mærke hver gammel detalje som et nutidigt bindende
prøvekrav. [Aktuel status](https://uvm.dk/grundskole/folkeskolen/fag-og-indhold/fag-emner-og-tvaergaaende-temaer/faelles-maal/faelles-maal-for-folkeskolens-fag/obligatoriske-fag/).

**Vores foreslåede indholdsregister** nedenfor omsætter landkort og prøveanalyse
til 18 implementerbare familier. Det er en produktstruktur, ikke ministeriets
opgaveliste eller en dokumenteret vægtning til eksamen.

| ID | Familie | Eksempel på, hvad eleven skal vise | Visningsbehov |
| --- | --- | --- | --- |
| F01 | Tal, brøker og decimaler | Sammenligne størrelser og regne med forskellige talformer | Taludtryk, tallinje, brøkmodel under forklaring |
| F02 | Procent, forhold og opskalering | Vælge referenceværdi og skalere en mængde | Prisliste, opskrift, forholdstabel |
| F03 | Overslag, potenser og rødder | Vurdere størrelsesorden og rimelighed | Udtryk, valgmuligheder, relevante talområder |
| F04 | Ligninger, uligheder og enkle systemer | Finde ukendte og kontrollere løsningen | Symboler, balanceforklaring, valgfri graf |
| F05 | Formler, omskrivning og fejl | Oversætte, arbejde baglæns og forklare ugyldige trin | Trinvis algebra med stabile symboler |
| F06 | Lineære modeller og tilbud | Vælge model og argumentere for en beslutning | Synkron tekst, tabel og graf; diskrete priser |
| F07 | Vækst og ikke-lineære modeller | Sammenligne udviklinger og bruge rente-/vækstberegning | Tabel, regneark, graf |
| F08 | Enheder, fart og sammensatte mål | Omsætte oplysninger og kontrollere dimensioner | Mål, tidslinje, tabel |
| F09 | Vinkler og geometriske egenskaber | Udlede vinkler og forklare relationer | Mærkede figurer, skitser og vinkler |
| F10 | Målestok og ligedannethed | Skelne længde-, areal- og rumfangsfaktor | Sammenlignelige figurer |
| F11 | Omkreds, areal og rumfang | Opdele figurer og finde manglende mål | 2D-figurer og læselige rumskitser |
| F12 | Retvinklede trekanter | Vælge relation mellem afstand, højde og vinkel | Målfast trekant og tydelig højdemarkering |
| F13 | Konstruktioner og koordinatgeometri | Bygge en figur, som opfylder flere krav | Gitter, punkter, polygoner, constraints |
| F14 | Symmetri og flytninger | Genkende og beskrive transformationer | Spejling, drejning, parallelforskydning |
| F15 | Diagrammer og deskriptorer | Aflæse, beregne og vælge relevante mål | Tabel, søjler, prikker og boksplot efter behov |
| F16 | Dataundersøgelser | Begrundet sammenligning, trend og kritisk vurdering | Datasæt, diagram og begrundelsesfelt |
| F17 | Enkle sandsynligheder | Afgrænse udfald og bruge komplement | Kort, udfaldstabel, brøk |
| F18 | Sammensatte hændelser og simulering | Skelne model, beregning og observation | Træ/tabel og gentagelige simuleringer |

Hver familie skal desuden mærkes med elevens handling: aflæs, beregn, vælg
metode, konstruér, forklar, undersøg eller vurder. Et emne er ikke en tilstrækkelig
beskrivelse af kompetencen. Ikke alle varianter er egnede til begge delprøver.

[coverage.csv](coverage.csv) kobler familierne til observerede opgaver og
markerer, hvor vores valgte opgaveudsnit ikke giver et konkret eksempel.
Alle familier har status planlagt; en kortlagt opgave er ikke en implementeret
generator eller dokumenteret læringsdækning.

## Hvad de konkrete prøver lærer os om produktet

Dette er vores analyse, med opgavehenvisninger i [task-map.jsonl](task-map.jsonl):

- **Prisvalg, 2022 1.1–1.4:** En fælles historie kan rumme basal regning,
  procent og åben undersøgelse. Et klippekort skal modelleres med hele kort og
  eventuelle restbilletter, ikke ukritisk som en kontinuerlig pris pr. tur.
- **Skøjteløberdata, 2022 2.1:** Bedømmelsen skal kunne acceptere forskellige
  velbegrundede valg af egenskaber ved data. Ét modelgenereret facitsvar er
  utilstrækkeligt til denne opgaveform.
- **Pist, 2022 3.1–3.3:** Et foto giver kontekst; trekant, mål og formel bærer
  matematikken. Et forklaringslag kan vise forskellen mellem hældningsvinkel og
  procentfald. Illustration og målfast arbejdsfigur har forskellige roller.
- **Temperatur, 2022 4–5:** Skift mellem formel, graf og data kræver samme enheder
  og referencer. En trendpåstand skal vurderes med data, ikke alene en flot linje.
- **Regneopskrift, 2022 6:** Vi skal både kunne beregne, gå baglæns, oversætte
  til symboler og diskutere fejl. En graf er ikke nødvendig i hver opgave.
- **Gitterfigurer, 2022 7.1:** En korrekt konstruktion kan se anderledes ud end
  et eksempel. Kontrollér egenskaber og areal frem for pixels.
- **Maj 2023:** De korte opgaver spænder fra sportspriser og opskrifter til
  enheder, trekanter, pyramider, diagrammer og sandsynlighed. Også korte opgaver
  kræver læsning af flere repræsentationer. At gøre alle til rene talfelter ville
  indsnævre den træning, prøven lægger op til.

Opgave-PDF'erne er lokale og indgår ikke i Git. Kilder og checksums findes i
[manifestet](sources.json). Analysen giver ikke tilladelse til at genudgive
prøvernes tekst, fotografier eller figurer i et skoleprodukt.

## Støttehjul og læring: belæg og hypoteser

IES anbefaler bl.a. spredt øvelse, vekslen mellem gennemarbejdede eksempler og
egen problemløsning, sammenhæng mellem grafik og forklaring samt konkrete og
abstrakte repræsentationer. Vejledningen angiver moderat evidens for disse
anbefalinger og stærk evidens for genkaldelse gennem quizzer og dybe
forklaringsspørgsmål. Det er generelle læringsprincipper, ikke dokumentation
for netop vores AI-agent. [IES](https://ies.ed.gov/ncee/wwc/PracticeGuide/1).

**Produktforslag:** Tilbyd hjælp i stigende trin og foreslå efterhånden mindre
støtte. Afprøv forståelsen på tilbageholdte varianter med nye repræsentationer
og kontekster, uden hjælp og efter en forsinkelse. Vi skal måle elevens egne
præstationer, ikke antal gennemførte opgaver eller modellens selvsikkerhed.
Eleven skal fortsat kunne bede om hjælp uden at blive straffet eller fastlåst.

## Usikkerheder, som epic'en skal håndtere

Vi har ikke belæg for officielle procentvægte pr. emne eller fælles
karaktergrænser for genererede sæt. Vi har heller ikke en valideret model for
sværhedsgrad eller automatisk vurdering af frie begrundelser. Derfor skal første
version vise faglig feedback, points hvor kontrollen er sikker og uafklarede
områder tydeligt. Den må ikke love en officiel karakter eller fuld eksamensparathed.

2027-regler skal genkontrolleres før release. Mundtlig prøve, skolernes
produktionsdrift, elevadministration, betaling og institutionsaftaler ligger
uden for denne første skriftlige epic. De konkrete valg og delopgaver følger i
[UX og agentkontrakt](../../docs/FP9-EXPERIENCE.md) og
[epic'en](../../docs/epics/FP9-EXAM-TRAINING.md).
