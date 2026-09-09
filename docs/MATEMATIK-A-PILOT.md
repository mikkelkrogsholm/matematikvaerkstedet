# Matematik A — første emnepilot

9. september 2026. Lokal, afgrænset pilot til afprøvning og feedback.
Start med `bun run dev` og åbn `/matematik-a`. Forsiden linker til forløbet.

## Det kan afprøves nu

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

## Rigtig AI og lokal gemning

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

## Kontrolleret

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
