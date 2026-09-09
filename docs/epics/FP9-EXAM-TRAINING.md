# EPIC: FP9 matematik — fra AI-støttehjul til selvstændig prøveløsning

Status: Planlagt. Research og designgrundlag udarbejdet 9. september 2026.
Implementeringen er ikke igangsat af denne epic.

## Problem og ønsket resultat

En elev kan blive sikker på en bestemt opgave uden at kunne bruge matematikken
i en ny situation. Samtidig kan fulde prøvesæt være svære at komme i gang med
uden vejledning. Matematikværkstedet skal tilbyde varieret træning til de to
skriftlige FP9-delprøver, hvor eleven kan få AI-støtte i selve arbejdsfladen og
gradvist tage støttehjulene af.

Eleven skal kunne løse opgaver med nye tal, historier og fremstillinger, forklare
sin metode og bruge relevante hjælpemidler selv. Vi skal skelne mellem en
assisteret løsning og det, eleven kan uden hjælp.

## Fast produktbeslutning: to uafhængige akser

| Prøvetype | Med AI-støtte | Uden AI-støtte |
| --- | --- | --- |
| Uden hjælpemidler | Guidet træning i denne opgavetype, også med visuelle demonstrationer | Selvstændig løsning uden almindelige matematiske hjælpeværktøjer |
| Med hjælpemidler | Guidet træning, inklusive støtte i værktøjsbrug | Selvstændig løsning med de relevante værktøjer |

Alle fire kombinationer skal være understøttet og testet. At slå AI fra må
ikke fjerne de almindelige værktøjer i typen med hjælpemidler. AI til i typen
uden hjælpemidler er en tilsigtet undervisningsfunktion. Det skal ikke blokeres
med henvisning til officielle eksamensregler.

Et forsøg med AI-hjælp mærkes som assisteret træning. Tidsgrænser og feedbacktid
vælges særskilt; en prøvesimulation kræver en passende prøveprofil og ingen
faglig støtte. En aktivering af hjælp bevarer arbejdet og ændrer tydeligt
forsøgets status til træning.

## Research og beslutningsgrundlag

- [Ministeriets rammer, fagligt landkort og researchbegrænsninger](../../research/fp9/FOUNDATION.md).
- [12 registrerede kilder](../../research/fp9/sources.json).
- [40 analyserede opgaveposter fra to historiske sæt](../../research/fp9/task-map.jsonl): 20 delopgaver fra december 2022 med hjælpemidler og 20 grupper fra maj 2023 uden.
- [Brugeroplevelse, støttehjul og agentens værktøjskontrakt](../FP9-EXPERIENCE.md).
- [Overordnede visualiseringskrav](../../research/PRODUCT-REQUIREMENTS.md).
- [Bibliotekslicenser til skoleproduktet](../../research/LICENSE-REVIEW.md).

Baseline er ministeriets oktober 2025-vejledning, fundne afviklingsregler fra
maj 2026 og prøveplanen for sommer 2027. En release til en bestemt termin skal
genkontrollere kilderne. Historiske prøver fastlægger ikke fremtidige regler.

## Scope og første leverance

Inden for epic'en:

- Begge skriftlige delprøvetyper med AI til/fra.
- Emnetræning, korte blandede runder og genererede fulde øvesæt.
- De 18 navngivne opgavefamilier F01–F18 i researchens indholdsregister.
- Reproducerbare varianter, svar, konstruktioner, begrundelser og faglig feedback.
- En delt arbejdsflade, hvor agenten kan se elevens handlinger og ændre synlige
  objekter gennem kontrollerede kommandoer.
- Lokal lagring, genoptagelse, eksport og synlig hjælprehistorik.
- En faktisk AI-integration bag en udbyderadapter; AI-fri drift uden API-nøgle.

Start med en vertikal afprøvning af F06 (priser), F13 (gitterkonstruktion) og
F16 (dataargumentation). Den skal bevise beregning, flere gyldige svar og
agenthandlinger før skalering til resten af indholdet.

Uden for denne epic: mundtlig gruppeprøve, officielt prøvesystem, proctoring,
løfte om officielle karakterer, komplet skoleplatform, klasseadministration,
betaling, UniLogin, institutionsdrift og afvikling af den rigtige eksamen.
Prototypens øvrige klassetrin skal fortsat kunne bruges, men udbygges ikke her.

18 familier er et konkret leverancemål, ikke dokumentation for fuld dækning af
alle tænkelige FP9-opgaver. Et publiceret dækningskort skal vise begrænsningerne.

## Delopgaver og acceptkriterier

### E01 — Versionsstyret fag- og prøveprofil

**Resultat:** Generator og brugerflade arbejder ud fra eksplicitte faglige mål
og tilladelser frem for tilfældige emneord.

- [ ] Registrér F01–F18 med underfærdigheder, forudsætninger, faglig handling,
  egnet prøvetype, svarform, kilde og bedømmelsestype.
- [ ] Skeln officielle oplysninger, historiske observationer og produktvalg.
- [ ] Implementér separate felter for prøvetype, hjælpemiddelprofil, AI-status,
  tidsprofil og feedbacktid; validér alle fire kombinationer.
- [ ] Prøveprofilen har kildeversion og dato. Ingen hårdkodet påstand om
  gældende regler for alle fremtidige terminer.

Afhænger af: det færdige researchgrundlag.

### E02 — Opgavefamilier og validerede varianter

**Resultat:** En opgave kan genereres igen med samme indhold, og variation
træner mere end udskiftede tal.

- [ ] Først F06/F13/F16, derefter resten af F01–F18. Hver familie får mindst
  to faglige varianter ud over nye tal, fx ændret ukendt, repræsentation eller
  ræsonnementsopgave. Tilladte prøvetyper mærkes pr. variant.
- [ ] Gem seed, familieversion, opgaveinstans og bedømmelsesgrundlag.
- [ ] Generatorer virker uden LLM og har begrænsninger for gyldige tal, figurer,
  enheder, løsninger og eventuelle flere gyldige svar.
- [ ] Kør mindst 100 seeds pr. familie samt eksplicitte randtilfælde. Brug
  uafhængige kendte resultater/invarianter, ikke kun generatorens egen løser.
- [ ] Faglig og visuel gennemgang af mindst seks varianter pr. familie dækker
  variation, kompleksitet og begge tilladte prøvetyper, hvor relevant.
- [ ] Delopgaver kan dele fortælling, men kræver ikke elevens tidligere svar.
  Tekst, figur og data er konsistente; originale prøvebilleder genudgives ikke.

Afhænger af: E01. Vertikal del afprøves sammen med E03–E06 før resten af familierne.

### E03 — Arbejdsflade og matematiske værktøjer

**Resultat:** Eleven kan arbejde med tekst, tal, figurer, data og begrundelser
på samme side, med et læseligt layout.

- [ ] Opgavegrundlag, elevlag, forklaringslag og visning har særskilt ejerskab.
- [ ] Understøt matematikinput, tabel/graf, gittergeometri og forklaring med
  tekst og relevante figurer. Flere gyldige konstruktioner accepteres.
- [ ] Uden hjælpemidler tilbyder ikke en skjult automatisk løser. AI kan stadig
  vise et mærket forklaringstrin, når den er aktiveret.
- [ ] Med hjælpemidler tilbyder de værktøjer, de valgte opgaver behøver:
  beregning, tabel/regneark, geometri og afgrænset CAS ved relevante opgaver.
  Manglende værktøjsdækning vises; værktøjer må ikke blot være knapper uden funktion.
- [ ] Valg af nye biblioteker dokumenteres med versionslicens og afprøvning.
  Bevar Cordis/Mafs hvor de passer; ingen generel omskrivning forudsættes.
- [ ] Enheder, akser, målestok, labels og figurers begrænsninger kontrolleres.
  Mobil, tastatur, touch og reduceret bevægelse afprøves.

Afhænger af: E01 og E02's første familier.

### E04 — Agentens læse- og handleværktøjer

**Resultat:** Agentens forklaring henviser til det, der faktisk vises og sker.

- [ ] Agenten kan læse den aktive opgave, scene, markering og relevante
  elevhandlinger og udføre de beskrevne, typede sceneoperationer.
- [ ] Agenten kan mindst tilføje, flytte, fremhæve og fjerne egne
  forklaringsobjekter samt vise et kort forløb trinvis.
- [ ] Afvis ugyldige objekter, ukendte capabilities, gamle revisioner,
  uautoriserede ændringer og operationer mod et andet forsøg.
- [ ] Retry af samme handling er idempotent; en mislykket batch efterlader
  ikke en delvist ændret scene. Agentændringer kan fortrydes.
- [ ] En agent må først hævde en udført handling efter bekræftet anvendelse og
  rendering. Test serveraccept efterfulgt af renderfejl og forsinket bekræftelse.
- [ ] Ingen vilkårlig kodeafvikling fra modellen. Givne data og elevsvar kan
  ikke overskrives skjult; demonstrationer har tydelig afsender.

Afhænger af: E03.

### E05 — AI til/fra og gradvis støtte

**Resultat:** AI er valgfri og kan støtte begge prøvetyper uden at forfalske
elevens selvstændige præstation.

- [ ] Tilslut én faktisk modeludbyder gennem en adapter. API-nøgler er serverdata
  og kommer ikke i browserkode, eksport eller repository.
- [ ] Implementér spørgsmål → hint → vis et trin → løsning, med mulighed for
  at eleven selv vælger mere støtte. Ingen automatisk facitvisning ved første fejl.
- [ ] AI fra betyder nul modelkald, ingen køede agentmutationer og fortsat
  fungerende opgaver, generatorer, relevante værktøjer og sikker svarfeedback.
- [ ] Ved deaktivering af AI afvises forsinkede svar og ændringer gennem en
  opdateret politikrevision. Elevens arbejde og tidligere hjælprehistorik bevares.
- [ ] Registrér faglig støtte uanset kilde. Et assisteret forsøg bliver ikke
  selvstændigt ved blot at slukke AI; næste kontrol bruger en ny variant.
- [ ] Udbyderfejl eller manglende nøgle giver mulighed for at fortsætte uden AI.
  Systemet opfinder ikke en påstand om, at en modelhandling blev udført.
- [ ] Beskriv dataflow, udbydervilkår og omkostningsgrænse for integrationen.
  Ingen elevidentitet er nødvendig for den lokale pilot.

Afhænger af: E04. AI-fri sti i E03 kan afprøves tidligere.

### E06 — Svarvurdering og læringsfeedback

**Resultat:** Feedback skelner mellem korrekthed, begrundelse og brugt støtte.

- [ ] Numeriske og symbolske svar håndteres med relevante domæner, enheder,
  tolerancer og ækvivalente former. Et påkrævet svarformat håndhæves særskilt.
- [ ] Geometrisvar vurderes ud fra egenskaber, ikke lighed med et skærmbillede.
- [ ] Frie begrundelser har kriterier, flere referenceeksempler og en tilstand
  for uafklaret/menneskelig vurdering. LLM-feedback er ikke en officiel censor.
- [ ] Uden AI kan eleven få kontrollerbare resultater og efter aflevering se
  kriterier og eksempler; usikre dele får ikke en opdigtet præcis score.
- [ ] Resultater viser selvstændigt/assisteret, relevante faglige observationer
  og næste øvelse. Ingen automatisk officiel 7-trins-karakter.
- [ ] Regressionseksempler inkluderer korrekt tal uden begrundelse, forskellige
  gyldige argumenter, delvist korrekt arbejde og en ukorrekt standardmetode.

Afhænger af: E02 og E03; AI-vurdering, hvis anvendt, afhænger af E05.

### E07 — Øvesæt, navigation og genoptagelse

**Resultat:** Eleven kan gennemføre et sammenhængende forløb uden at miste sit arbejde.

- [ ] Generér korte runder og hele sæt efter en versionsstyret fordeling af
  områder, faglige handlinger, svarformer og anslået belastning.
- [ ] En profil uden hjælpemidler kan danne 20 opgaver/50 delopgaver; profilen
  med hjælpemidler har flere varierede historier og åbne delopgaver. Fordelingen
  er et dokumenteret produktvalg, ikke en påstået officiel emnevægtning.
- [ ] Alle fire kombinationer kan gennemføres som træning. Ved timed forløb er
  afleverings- og hjælpestatus tydelig. Pause/ekstra tid logges, ikke skjules.
- [ ] Skeln besøgt, besvaret, til senere og afleveret. Vis samlet kontrol før
  aflevering og lås afleveret forsøg; review ændrer ikke den afleverede besvarelse.
- [ ] Gem lokalt, genoptag efter reload, og eksportér/importér et versionsmærket
  forsøg. Sletning virker. Giv printvenlig HTML med egne svar og figurer.
- [ ] Prøveprofil og assistance logges. Funktionaliteten påstår ikke at kunne
  forhindre hjælp fra andre apps eller garantere eksamensintegritet.

Afhænger af: E01, E02, E03 og E06; fuldt assisteret flow kræver E05.

### E08 — Samlet kvalitet og pilot

**Resultat:** Dokumentation viser, hvad der fungerer og hvad der stadig ikke er valideret.

- [ ] Automatiske forløb dækker alle fire kombinationer, AI-skift, retry,
  netværksfejl, afbrudt animation, aflevering og gendannelse.
- [ ] Modellen kan demonstrere en flytning/tilføjelse og derefter aflæse elevens
  efterfølgende ændring i pris-, geometri- og datafamilierne.
- [ ] Mål lokal interaktionsrespons på dokumenteret referenceudstyr; foreslået
  mål er p95 under 100 ms uden modelkald. Registrér AI-latens og faktiske tokens
  pr. hjælpeniveau separat; budget og timeout er konfigurerbare.
- [ ] Afprøv et elevforløb med gradvist mindre støtte og en ny, tilbageholdt
  variant uden hjælp. Gentag efter en forsinkelse og beskriv resultaterne uden
  at generalisere læringseffekt ud fra få børn.
- [ ] Faglig gennemgang, generatorchecks, tilgængelighed, licenser, datadeling
  og testresultater er registreret; uafklarede dele er synlige i dækningskortet.
- [ ] Genkontrollér ministeriets kildegrundlag for den valgte termin før release.

Afhænger af: E01–E07. Tidlige test af vertikal afprøvning sker før fuld indholdsudvidelse.

## Rækkefølge og definition af færdig

E01 → E02's tre første familier → E03 → E04/E06 → E05 → E07 → E02's øvrige
familier → E08. E06's sikre kontroller behøver ikke en AI-forbindelse.
Indhold og UI skal justeres efter den vertikale afprøvning, inden alle familier
produceres. Delopgaverne bliver ikke automatisk særskilte GitHub-issues i denne
planlægningsrunde.

Epic'en er færdig, når E01–E08's kriterier er dokumenteret opfyldt, alle fire
kombinationer virker, de 18 familier og deres dækningsbegrænsninger er beskrevet,
og eleven kan tage et nyt sæt uden AI eller API-nøgle. Research og en flot demo
alene er ikke nok til at lukke implementeringsepic'en.

## Risici og bevidste valg

Åbne svar kan ikke altid scores automatisk sikkert; brug kriterier og markér usikkerhed.
Tilfældige varianter kan ændre sværhedsgrad; versionsmærk og afprøv dem.
Regnearks-, CAS- og geometriintegration må ikke optage hele projektet før den
vertikale afprøvning. Eleven må ikke lære at vente på AI; giv plads til eget
arbejde og kontroller transfer på nye varianter.

Modeludbyder, konkrete nye biblioteker og endelige produktbudgetter vælges under
de relevante delopgaver. Ingen ny modeltjeneste, elevdataindsamling eller
institutionsdrift er startet som del af denne research og epicregistrering.
