# FP9 — oplevelse og fælles arbejdsflade

Designforslag 9. september 2026, baseret på
[researchen](../research/fp9/FOUNDATION.md) og brugerens præcisering af støttehjul.
Dette er implementeringsgrundlag, ikke allerede fungerende AI.

## To uafhængige valg

| Prøvetype | AI til | AI fra |
| --- | --- | --- |
| Uden hjælpemidler | Opgavetypen trænes med en vejledende agent, som også kan vise et trin grafisk | Eleven arbejder selv med samme opgavetype og uden almindelige matematiske hjælpeværktøjer |
| Med hjælpemidler | Agenten kan støtte forståelse, metodevalg og brug af de tilgængelige værktøjer | Eleven bruger værktøjerne selv; de forsvinder ikke, fordi AI slås fra |

AI er et separat undervisningslag. AI til i typen uden hjælpemidler må derfor
ikke afvises som en ugyldig kombination. Agentens konkrete demonstration er
registreret støtte; den åbner ikke automatisk lommeregner, CAS eller andre
elevværktøjer. AI fra må heller ikke slå regneark eller geometriværktøj fra i
typen med hjælpemidler.

Opgavetype, hjælpemiddelprofil og hjælpestatus vises hver for sig. Tid er en
yderligere indstilling: øv uden tidspres, kort træningsrunde eller et helt sæt
med tid. Kun en gennemførsel med passende prøveprofil og uden faglig støtte
betegnes en prøvesimulation. Alle fire kombinationer er almindelig træning.

## Elevens forløb

1. **Start:** Vælg prøvetype, AI til/fra og et kort forløb eller fuldt sæt.
   Emnevalg er muligt; eleven behøver ikke først en lang niveautest.
2. **Arbejd:** Venstre panel giver opgaveoversigt. Midten viser historie,
   oplysninger, arbejdsfigur og besvarelse. Højre panel viser AI, når den er
   aktiveret; ellers får arbejdsfladen mere plads. Egne noter er tilgængelige
   i et særskilt felt og forveksles ikke med chat.
3. **Få støtte:** Eleven kan bede om et hint eller en demonstration i figuren.
   Agenten inviterer derefter eleven til selv at udføre næste trin.
4. **Gennemgå:** Eleven kan hoppe mellem opgaver, markere noget til senere og
   se forskel på besøgt, besvaret og afleveret. Opgaven ændres ikke ved navigation.
5. **Aflevér:** En oversigt viser ubesvarede felter. Træning kan give feedback
   efter et svar; et timed sæt holder løsninger tilbage til aflevering.
6. **Se næste skridt:** Resultatet viser, hvad eleven klarede selv, hvilken
   støtte der blev brugt, og en konkret ny øvelse. Det er ikke en karakter fra
   ministeriet. Frie begrundelser kan markeres til menneskelig gennemgang.

Fortællinger skal være korte og sammenhængende, men senere delopgaver må ikke
kræve et korrekt tidligere svar. Eleven skal kunne begynde på næste delopgave.
På mobil bliver navigation og AI paneler, man åbner; figuren og den aktuelle
opgave skal kunne ses samtidig med relevant støtte.

## Støttehjul, som kan tages af

Foreslåede hjælpeniveauer:

- **Spørgsmål:** Hjælp eleven med at afgrænse, hvad der skal findes.
- **Hint:** Peg på relevant information eller en relation.
- **Vis et trin:** Fremhæv, flyt eller tilføj noget i forklaringslaget.
- **Gennemgå løsningen:** Kun efter et tydeligt ønske eller aflevering; forsøget
  tæller derefter ikke som selvstændig løsning.

Niveauerne er en produktmekanik, ikke en valideret læringsskala. Start med mindst
mulig relevant hjælp, og lad eleven vælge mere. Efter flere vellykkede forsøg
kan systemet foreslå en ny variant uden hjælp. En fejl udløser ikke automatisk
en fuld løsning.

Hver hjælp registreres med opgave, tidspunkt, niveau, kilde og berørte objekter.
Færdigskrevne hints og facitvisning er også støtte, selv om de ikke bruger AI.
Vis særskilt: `aiEnabled`, `assistanceUsed` og `independentAttempt`. Det er ikke
det samme. Et forsøg bliver ikke selvstændigt igen ved at slå AI fra efter et
hint. Der skal en ny, hidtil uset variant til.

AI kan slås fra midt i et træningsforløb. Nye modelkald stopper, igangværende
handlinger afbrydes, og forsinkede svar må ikke ændre scenen. Elevens arbejde
bevares. Tidligere hjælp forbliver i historikken; forklaringslaget kan skjules.
En aktivering af hjælp under prøvesimulation ændrer tydeligt forsøget til
assisteret træning og bevarer de hidtidige svar.

## Hvad agenten skal kunne se og gøre

Agenten arbejder mod en fælles scenemodel, ikke en løs parallel tegning i chatten.
Samme kommandoer kan bruges fra elevens værktøjer og agenten med forskellige
rettigheder. En lille adapter forbinder modellen med Mafs, SVG eller et senere
valideret plugin; modeludbyderen skal ikke kende rendererens interne DOM.

| Del | Indhold og ejerskab |
| --- | --- |
| Opgavegrundlag | Version, givne data, spørgsmål, begrænsninger, seed og faglige mål. Fast under forsøget. |
| Elevlag | Egne punkter, konstruktioner, beregninger, svar og markeringer. Ændringer har afsender. |
| Forklaringslag | Agentens hjælpelinjer, fremhævninger og demonstrationer. Tydeligt mærket som støtte. |
| Visning | Kamera, akser, enheder, fokus, valgte objekter og viewport. |
| Internt bedømmelsesgrundlag | Facit, kontrollører og kriterier. Holdes ude af elevens almindelige scene-snapshot. |

Agenten må ændre indhold på siden, men ikke skjult ændre de givne tal eller
overskrive elevens besvarelse. Et nyt tænkt eksempel oprettes som eksempel eller
ny variant. En demonstration på elevens konstruktion udføres i en mærket kopi
eller som en synlig, fortrydelig handling med registreret afsender.

### Minimal værktøjskontrakt

**Forslag**, ikke endelig API eller krav om ny dependency:

```ts
type SceneCommand = {
  attemptId: string;
  sceneId: string;
  expectedRevision: number;
  policyRevision: number;
  actionId: string;
  operations: SceneOperation[];
};
// SceneOperation er en typet, valideret union af tilladte handlinger.
// Resultat: applied / rejected / stale, ny revision, faktisk tilstand og fejl.
```

Læsbare capabilities: `getTask`, `getScene`, `getSelection`, `getRecentActions`.
Muterende capabilities: `highlight`, `addObject`, `moveObject`, `setVisible`,
`setViewport`, `removeExplanationObject`, `undoAgentAction`. En kort sekvens af
handlinger skal kunne afspilles og standses. Andre handlinger tilføjes kun med
et konkret undervisningsbehov.

Krav til udførelse:

- Serveren kontrollerer hjælpestatus og tilladte værktøjer; skjult chat er ikke
  tilstrækkelig deaktivering. Klienten renderer kun validerede operationer.
- Stabile objekt-id'er og revisioner hindrer, at agenten ændrer en gammel figur.
  En stale handling afvises; agenten læser igen frem for at gætte.
- Samme `actionId` må ikke tilføje en figur to gange ved retry.
- Matematiske constraints, enheder og endelige tal valideres før ændring.
  En ugyldig batch må ikke efterlade en halv konstruktion.
- Agenten siger først, at noget **er flyttet**, efter bekræftet anvendelse og
  rendering. Den kan før handlingen sige, hvad den vil vise. Fejl forklares kort.
- Elevens drag afbryder modstridende animation; fokus må ikke stjæles midt i input.
- Ingen fri JavaScript-evaluering, DOM-manipulation eller vilkårlige netkald fra
  modeloutput i denne epic. Muligheder skabes gennem eksplicitte plugins.
- Modelinput indeholder den aktuelle opgave og kompakte ændringer, ikke alle
  historiske scener. Screenshots bruges ved behov for visuel kontrol, ikke på
  hvert drag. Elevinteraktion kræver ikke modelkald.

## Konkret eksempel: fra forklaring til selvstændighed

Ny, egen prisopgave: Sted A tager 30 kr. pr. besøg. Sted B tager 90 kr. i
startbetaling og 15 kr. pr. besøg. Tallene er et design-eksempel, ikke kopieret
prøvetekst. Antal besøg er et ikke-negativt heltal.

Eleven vælger typen med hjælpemidler og AI til. Begge grafer og en tabel er på
arbejdsfladen. Eleven markerer fire besøg og spørger om forskellen. Agenten
læser den faktiske markering, tilføjer en stiplet hjælpelinje dér og fremhæver
de to tabelceller. Den spørger, hvilket tilbud der er billigst her.

Eleven beder om mere støtte. Agenten viser, hvordan prisforskellen ændrer sig
ved ét ekstra besøg, og lader eleven selv finde, hvor tilbuddene mødes. Efter
handlingens bekræftelse kan den referere præcist til det viste.

I typen uden hjælpemidler vises kun opgavens egne oplysninger og svarfelt som
udgangspunkt. AI kan stadig bygge den samme sammenhæng op som en mærket
forklaring. Det er støtte til læring, ikke et selvstændigt prøveresultat.

På en ny variant slås AI fra. Ved typen med hjælpemidler kan eleven stadig
bruge graf og tabel; ved typen uden er der ingen løsningsværktøjer. Resultatet
viser, om eleven kunne vælge metode og begrunde svaret uden hjælpen.

## AI-fri drift, tilgængelighed og data

AI fra skal virke uden API-nøgle og uden modelkald, også ved generering af nye
sæt. Seedede opgavefamilier, renderere og sikre facitkontroller kører uden LLM.
Åbne begrundelser får kriterier og referenceeksempler efter aflevering; systemet
må angive, at bedømmelse kræver menneskelig gennemgang.

Første version er lokal og gemmer forsøg og scener på en dokumenteret lokal
måde med eksport og sletning. Gem ikke børns identitet, fotos eller samtaler i
Git. Ved AI til sendes kun nødvendigt opgaveindhold og elevens valgte input;
udbyder, lagring og dataflow skal beskrives, før forbindelsen tages i brug.

Tastatur og touch skal dække centrale handlinger; farve suppleres med symboler
og labels. Reduceret bevægelse må ikke fjerne den faglige information.
Ordblindhedsværktøjer, oplæsning og særlige prøvevilkår må ikke ukritisk tælles
som faglige hints. Egentlig godkendelse til officielle særlige prøvevilkår er
uden for epic'en.

## Kvalitet før stor indholdsbank

Afprøv først én prisfamilie, én konstruktion og én dataopgave i alle fire
kombinationer. Registrér korrekthed, hjælpeniveau, lokale svartider, modeltokens,
afviste handlinger og genopretning ved fejl. Test derefter nye varianter uden
støtte. Et flot gennemspillet eksempel er hverken en gyldig prøvebank eller et
bevis for læring.
