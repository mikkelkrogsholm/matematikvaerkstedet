# Generative øveprøver og begrebsforståelse

Arbejdsforslag, 9. september 2026. Ikke implementeret eller valideret endnu.

## Målet

Generér mange forskellige, fagligt kontrollerede øveprøver, så eleven lærer at genkende og bruge matematiske begreber i nye situationer. Antallet af varianter er mindre vigtigt end meningsfuld variation og pålidelig vurdering af læring.

## Analyse af eksisterende prøver

Registrér hver delopgaves emne, begreb, nødvendige forudsætninger, metodevalg, repræsentation, sproglige krav, hjælpemidler, forventede svar og krav til begrundelse. Notér typiske misforståelser og kildehenvisning. Skeln mellem det opgaven synligt kræver og vores hypotese om dens sværhedsgrad. Brug gældende officiel prøvevejledning og tilgængelige bedømmelsesvejledninger sammen med de faktiske opgaver; opgavernes emneord alene fortæller ikke hele det faglige mål.

## Variation

- Tal og kontekst: priser, længder, navne og situationer.
- Repræsentation: tekst, tabel, graf, formel og konkret figur.
- Ukendt størrelse: find resultatet, find en parameter, eller konstruér et eksempel.
- Tænkning: beregn, vælg metode, forklar en fejl, undersøg en påstand eller begrund et valg.
- Støtte: gennemarbejdet eksempel, deltrin, kort hint eller selvstændig løsning.

Repræsentationsskift og nye spørgsmål kan ændre opgavens sværhedsgrad og kompetencekrav. De skal derfor mærkes som faglige varianter, ikke automatisk regnes som ækvivalente opgaver. Introducér variation gradvist og bland senere emner, så eleven også skal vælge metode. Gentag begreber over tid; undgå at kræve, at alt er nyt hver gang.

## Foreslået konstruktion

En opgavefamilie beskriver mål, tilladte variationer, matematiske begrænsninger, løser, bedømmelseskriterier og mulige visninger. Agenten vælger og komponerer; programkode kontrollerer parametre, beregner resultater og tegner ud fra samme matematiske model. Nye familier kan tilføjes som plugins efter afprøvning.

Kontrollér fx at en trekant kan eksistere, at en prisopgave har de tilsigtede skæringspunkter i det relevante område, at enheder passer, og at spørgsmål kan besvares ud fra de viste oplysninger. Kontrollen må ikke alene være, at den genererende model erklærer sin egen opgave korrekt. Åbne svar kræver kriterier og mulighed for flere gyldige løsninger; en numerisk facitkontrol er utilstrækkelig.

Sammensæt prøver efter en eksplicit fordeling af emner, kompetencer, svarformer og anslået tid/sværhedsgrad. Tilfældig udtrækning giver ikke i sig selv sammenlignelige prøver. Genererede sæt betegnes øveprøver; officiel FP9-ækvivalens eller karaktergrænser kræver særskilt dokumentation.

## Agent og fælles arbejdsflade

Agenten skal kunne læse scenens objekter, værdier, akser, enheder, markeringer og elevens handlinger via struktureret tilstand. Den skal kunne oprette og ændre figurer, fremhæve områder og aflæse resultatet af handlinger. Kommandoer skal returnere den faktisk anvendte tilstand, også ved afvisning af ugyldige ændringer.

Matematik, facit og visualisering deler datagrundlag. Visningsregler håndterer størrelsesforhold, aksemærkning og overlap. En skitse uden korrekte mål skal mærkes tydeligt. Visuel kontrol supplerer datakontrol, fordi korrekt geometri stadig kan blive ulæselig på skærmen. Agenten behøver ikke et screenshot efter hvert træk; hændelser og kompakte ændringer begrænser tokens. Skeln mellem elevsynlig information og internt facit.

Træning tillader forklaringer og hjælp, som registreres. Prøvetilstand holder opgaverne stabile og tilbageholder hjælp og løsninger indtil aflevering. Elevinteraktioner er observationer, ikke sikre beviser på elevens tanker.

## Lille første forsøg

Start med familien »sammenlign to priser« fra Tivoli/skøjtehal-eksemplet. Lav varianter med tekst, tabel og graf samt beregning og begrundelse. Gem tilfældighedsseed og generatorversion, så fejl kan reproduceres.

1. Generér 100 varianter og kontrollér alle matematiske begrænsninger og facit med programkode. Supplér med faglig og visuel stikprøve; automatiske checks beviser ikke den samlede undervisningskvalitet.
2. Demonstrér, at agenten læser et elevtræk, ændrer scenen korrekt og giver en forklaring, der svarer til det viste.
3. Afprøv læring på en ny kontekst og repræsentation uden hjælp, samt senere igen. Hold hele opgavevarianter ude af træningsforløbet; nye tal alene er en svag test af overførsel.

Dette er et afgrænset forslag til næste udviklingstrin, ikke en allerede gennemført afprøvning.

## Indledende kilder

- [UVM: prøvevejledninger](https://www.uvm.dk/folkeskolen/folkeskolens-proever/faglig-forberedelse/proevevejledninger): udgangspunkt for det videre arbejde med officielle krav. Aktuel matematikspecifik version skal kontrolleres ved selve kortlægningen.
- [IES: Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1): anbefaler bl.a. at forbinde konkrete og abstrakte repræsentationer, kombinere grafik og ord, veksle mellem løste eksempler og egen problemløsning samt fordele læring over tid. Det understøtter principperne, men validerer ikke vores produkt.
- [Lokal sammenligning af prøver](EXAM-COMPARISON.md): konkrete fælles opgavetyper og forskelle i svarform.
