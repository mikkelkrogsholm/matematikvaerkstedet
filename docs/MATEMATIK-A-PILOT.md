# Matematik A — første emnepilot

9. september 2026. Lokal, afgrænset pilot til afprøvning og feedback.
Start med `bun run dev` og åbn `/matematik-a`. Forsiden linker til forløbet.

## To sammenhængende forløb — ny startside

`/matematik-a` åbner nu to afgrænsede forløb:

- **Hvad bestemmer en linjes hældning?** Forudsig effekten af at flytte B,
  flyt selv punktet, beregn en positiv hældning, begrund forholdet mellem
  koordinatforskellene og beregn derefter en ny negativ hældning uden hjælp.
- **Hvornår er gennemsnittet misvisende?** Forudsig effekten af en lang
  ventetid, ændr observationen, beregn og begrund gennemsnit/median og anvend
  derefter begreberne på syv observationer med gentagelser og en ny ekstremværdi.

Begge følger **forudsig → udforsk → beregn → forklar → prøv selv**.
Udforskningen ændrer de faktiske matematiske værdier. Beregningsfasen fastlåser
et tydeligt beskrevet eksempel. Sidste trin har hverken AI, slider eller
hjælpelag; feedback gives efter aflevering. Det er en øveopgave, ikke en låst
prøve: eleven kan gå tilbage til tidligere trin. Tilbageblikket skelner mellem
første korrekte aflevering og korrekt efter feedback og registrerer brug af AI.

Forklaringsfasen kombinerer et fagligt valg med elevens egen tekst. Kun valget
kontrolleres fagligt automatisk. Den frie tekst gemmes, men godkendes aldrig
som korrekt alene på baggrund af dens længde. Sidste opgave har kontrolspørgsmål
til egen refleksion efter korrekt beregning.

UI har tydelig trinvis fremdrift, valgfri guide, tastaturbetjente kontroller,
fokus på overskriften ved trinskift og mobilvisning med læsbare data ved figuren.
Geometrien bruger samme målestok på begge akser. Prikdiagrammet placerer data
på en fælles numerisk akse og stabler gentagelser.

Guiden bruger rigtig Codex gennem en udskiftelig provider og får den aktuelle
fase, figur, elevsvar, forudsigelse og kort samtalehistorik. Den kan ændre
udforskningsværdien og fremhæve synlige hjælpelag. Handlinger er begrænsede og
validerede; navigation, elevændringer og Stop annullerer forældede svar.
Modellen instrueres i at give små skub, men kan stadig afsløre mere end ønsket.
`AI_PROVIDER=off` giver ingen modelkald. De nye forløb har højst 40 kald pr.
serverproces, to samtidige og 90 sekunders timeout; det er en lokal demogrænse.

Ét aktuelt forløb gemmes i localStorage inklusive fase, udforskning, svar,
AI-valg og forsøgstal. Et nyt forløb erstatter dette. Feedback kan eksporteres
med opgavevariant, svar og støttehistorik som JSON. Der er ingen identitet,
serverlagret elevhistorik eller automatisk deling.

### Verificeret efter forbedringen

- Typecheck, build og **62 tests / 109362 assertions** består.
- 100 seeds med uafhængige beregninger af hældning, gennemsnit og median.
- Begge komplette browserforløb, bevidst forkert svar og målrettet feedback,
  egen begrundelse, ny selvstændig opgave og tilbageblik.
- Rigtig Codex flyttede B og forklarede korrekte koordinatforskelle; statistik-
  guiden aflæste ændrede data og fremhævede den korrekte median.
- AI fra og udforskning bevaret efter reload; feedbackeksport starter download.
- Forsinkede fixtures afvist efter Stop/trinskift; netværksfejl bevarede svaret.
- Desktop og 390 px mobil visuelt inspiceret, ingen vandret sideoverflow.
- Forside, FP9 og eksisterende øvebibliotek åbner fortsat.

Se [kontrolresultater](../research/gymnasium/learning-checks.json).
Dette er to konceptforløb med et begrænset antal matematiske strukturer; nye
seeds giver ikke uendelig faglig variation. Næste indholdsudbygning bør variere
repræsentation, kontekst og metodevalg. Ingen elevtest eller læringseffekt er
påstået. Build har fortsat en advarsel om størrelsen på den fælles JS-fil.

## Fast app-ramme — 10. september 2026

Matematik A-forløbene bruger nu en fast ramme tilpasset den synlige viewport.
Top, trin og bundnavigation bliver stående. Computer viser figur og opgave i
hver sit panel; på mobil står figuren over opgaven med mulighed for stor figur.
Opgave og AI-guide vælges i samme panel. Svar og samtale bevares ved panelskift.
Lange opgaver, begrundelser, tilbageblik og samtaler kan rulle **inde i panelet**;
selve dokumentet ruller ikke. Det bevarer adgang til indhold ved små skærme og zoom.

Figurens forhold bevares via SVG's ens skalering. Mobil har læsbare værdier ved
figuren og en knap til stor visning. Figurens forklaring findes under “Om figuren”.
Trinskift nulstiller opgavepanelets læseposition. VisualViewport bruges til at
følge ændringer i det tilgængelige skærmareal, fx ved skærmtastatur.

Kontrol: begge forløb gennemført i browseren, 62 tests/typecheck/build består,
fast bund og intet dokumentoverflow ved 1366×768, 1280×720, 390×844, 375×667,
844×390 og 683×384. Mobilfigur og desktop-layout er visuelt inspiceret. En lang
AI-besked er afprøvet med en syntetisk providerrespons; ingen ny live-modeltest
i denne layoutændring. Et fysisk iOS-/Android-tastatur og faktisk browserzoom
er ikke afprøvet; små viewports er kontrolleret som layoutbelastning.
Se [layoutkontroller](../research/gymnasium/app-layout-checks.json).

## Øvebiblioteket — bevaret på `/matematik-a/opgaver`

| Gruppe | De tre opgaveformer |
|---|---|
| Linjer og cirkler | Hældning fra to punkter; vinkelret hældning; radius fra centrum og randpunkt |
| Trekanter | Pythagoras; areal ud fra grundlinje/højde; cosinusrelationen |
| Ugrupperede data | Gennemsnit; nedre kvartil; gennemsnit med en outlier |
| Grupperede data | Kumuleret frekvens; vægtet gennemsnitsestimat; medianinterval |

Alle har seedede nye data og deterministisk svarvurdering på serveren.
Figurer viser den konkrete linje/cirkel/trekant med samme aksemålestok.
Statistik viser observationsdiagram eller histogram med lige brede intervaller.
Udforskning ændrer en separat markør eller den sidste søjles kontur, ikke givne data.
Et valgfrit hjælpelag viser deskriptorer, boksplot eller kumulerede frekvenser.
Det tæller som assisteret træning.

Kvartiler: median af halvdele, central observation udelades ved ulige antal.
Varians i hjælpelaget divideres med n. Grupperede intervaller er [0;10[, [10;20[
osv., med klassemidtpunkter 5, 15, 25 og 35. Grupperede deskriptorer mærkes som
estimater. Medianintervalopgaver har ulige observationstal, så de to midterste
observationer ikke kan ligge i forskellige klasser. Afrunding oplyses i opgaven.

## Øvebibliotekets AI og lokale gemning

Hint, deltrin og løsning kalder eksisterende `runCodex` via en lille provideradapter.
Opgave, indtastet svar og udforskning sendes ved hjælp. Hint får ikke skjult facit;
løsningsniveau får referenceværdi/metode. Modellen kan stadig selv udregne facit,
så et hint er en pædagogisk instruktion, ikke en garanti for aldrig at afsløre svaret.

Agenten kan fremhæve et eksisterende objekt, tilføje en annotation eller flytte
en separat geometrimarkør. Handlinger valideres, og browseren kontrollerer render
før svar med handlingsbekræftelse vises. Forældede/annullerede svar kasseres.
Dette er en mindre, lokal kontrakt; den genbruger Codex-runtime men ikke hele
FP9's serverlagrede animations-/ACK-protokol. Ingen ny animationsmotor er bygget.

AI fra giver ingen modelkald. `AI_PROVIDER=off` deaktiverer serverens provider.
`GYM_AI_MAX_CALLS` begrænser kald pr. serverproces (standard 80); højst to samtidige
kald og timeout på 90 sekunder. Genstart nulstiller tælleren; dette er ikke en
organisations- eller faktureringsgrænse. Ingen credentials sendes til browseren.

Aktuel opgavereference, svar, hjælpestatus, seneste samtale, AI-valg og op til 100
feedbackposter gemmes i denne browsers localStorage. Kun det aktuelle forsøg
genoptages; der er ikke et fuldt forsøgshistoriksystem. Udforskning og forklaringslag
nulstilles ved reload. Feedback har opgavereference, sværhedsoplevelse, note og dato
og kan eksporteres som JSON. Noter skal gemmes med knappen før eksport. Ingen
identitet kræves, og feedback sendes ikke automatisk til andre.

## Tidligere kontroller af øvebiblioteket

- `bun run check`: 54 tests, 107933 assertions, typecheck og build består.
- 100 seeds × 3 strukturer × 4 grupper med uafhængige formler/egenskaber.
- Regressioner for kvartil, afrunding, tomt svar, ugyldige referencer og figurhandlinger.
- Servertests: skjult marking, autoritativ gengenerering, AI fra, origin, validering og cancellation.
- Browser: alle 12 former ved seed 1 besvaret korrekt ud fra uafhængige beregninger.
- Rigtig Codex i browser: markerede B(3;12), forklarede punktet; aflæste derefter elevens markør (4;5) og skelnede fra givne punkter.
- Rigtig Codex i statistik: fremhævede første søjle og beskrev korrekt seks pakker i [0;10[ kg.
- Browser: feedback gemt/eksporteret, svar og reference genindlæst, AI fra bevaret efter reload.
- Forsinkede fixture-svar: navigation og Stop forhindrede forældet tekst. Injiceret netværksfejl bevarede svaret.
- Desktop og mobilbredde 390 px: intet vandret overflow. Udvalgte cirkel-, trekant-, histogram- og mobilskærmbilleder inspiceret.

Se [evidens](../research/gymnasium/pilot-checks.json). Alle browserdata er syntetiske.
Den første delegerede UI-skitse bestod kun de eksisterende tests og manglede rigtig
AI samt havde matematiske fejl. Den er efterfølgende rettet og udvidet; build alene
blev ikke anvendt som acceptbevis.

## Afgrænsning og næste feedback

Dette er ikke fuld plangeometri-/statistikdækning eller hele Matematik A. Fx mangler
selvstændige familier for linje-cirkel-skæring, generel linjeligning, sinusrelation,
fraktilinterpolation og konstruktion af sumkurver. Flere aktuelle opgaver er
indledende færdighedstræning. Der er endnu ikke en fuld eksamenssimulation eller
mundtlig prøve. Deskriptiv statistik er undervisningsstof, ikke den undersøgte
ordnings skriftlige eksamensdækning.

Feedback fra sønnen skal især afklare: matcher underemnerne undervisningen,
er opgaverne for lette/svære, er figurer og forklaringer forståelige, og giver
hjælpen passende plads til selvstændigt arbejde? Ingen elevafprøvning eller
læringseffekt er endnu dokumenteret. Epic #3 forbliver åben.
