# Afprøvning af biblioteker

Dato: 2026-09-09. Plan, ikke udførte tests. Formålet er at gøre researchens anbefalinger efterprøvelige.

## Fælles vurdering

Et bibliotek vurderes på sin rolle; et beregningsbibliotek behøver ikke tegne, og et renderbibliotek behøver ikke være en CAS.

| Kriterium | Bevis vi vil indsamle |
| --- | --- |
| Agentens brug | Gem input, genereret kommando/kode, fejl og antal rettelser fra samme opgave |
| Dynamisk komposition | Opret en scene med nye tal og objekter, og ændr den uden at erstatte hele arbejdsfladen |
| Elevinteraktion | Træk et objekt eller ændr en parameter; scene og labels opdateres uden modelkald |
| Matematisk korrekthed | Kontroller kendte værdier, proportioner, begrænsninger og definitionsmængder |
| Visuel kvalitet | Inspicér små og store skærme, labeloverlap, kontrast og kontinuitet mellem forklaringstrin |
| Respons | Mål opstart separat fra lokale interaktioner og fra ventetid på modellen |
| Tokenforbrug | Mål værktøjsbeskrivelser, første scene og ændringer separat; bytes er ikke tokens |
| Pluginintegration | Monter, opdatér og afmontér; kontrollér at lyttere og grafikressourcer ryddes op |
| Reproducerbarhed | Gem præcis version/commit, runtime, browser, kommando og forventet resultat |

## Små bevisopgaver

1. **Brøker:** Vis 1/2 og 1/3 med samme helhed. Skift til 2/4. Kontroller lige store felter og ens længde for ækvivalente værdier.
2. **Geometri:** Træk en trekants hjørne. Kontroller at viste sidelængder og vinkler følger koordinaterne, og at geometriske akser har ens skalering.
3. **Funktioner:** Vis y = ax² og en tangent, mens a og tangentpunktet ændres. Kontrollér analytiske værdier.
4. **Brud og domæner:** Vis 1/x uden en falsk linje over nul. Kontroller at (x²−1)/(x−1) beholder undtagelsen x=1 ved sammenligning med x+1.
5. **Forklaringssekvens:** Gennemfør tre trin frem og tilbage, og ændr et tal midtvejs. Ingen gamle labels eller lyttere må hænge tilbage.
6. **3D, kun relevante kandidater:** Skær en kugle med et plan. Kontrollér snitradius r = sqrt(R²−h²), og håndtér |h| > R.

## Evidensniveauer

- **Dokumenteret:** Funktion beskrevet i officiel dokumentation eller kildekode.
- **Eksempel tilgængeligt:** Projektet stiller et konkret eksempel til rådighed; vi har ikke dermed kørt det.
- **Lokalt demonstreret:** Eksempel kørt og visuelt inspiceret med registrerede versioner.
- **Kontrolleret:** Relevant matematisk adfærd eller livscyklus kontrolleret mod eksplicitte forventninger.

Alpha-status tæller ikke negativt i sig selv. En dokumenteret funktion eller flot demo er ikke bevis på korrekt integration i vores platform. Bun på serveren og browserens rendering afprøves separat.
