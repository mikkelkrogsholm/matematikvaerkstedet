# Visuel gennemgang af 108 varianter

9. september 2026, Codex-hovedagent. Chromium, 1440 pixels bred browser,
seks opgaver pr. familieskærmbillede. Alle 18 skærmbilleder er faktisk åbnet
og set; det er ikke alene en DOM-kontrol. Materialet er syntetisk.

Korpus: seed 101/202, varianter 0/1/2 for F01–F18. Billeder:
`docs/screenshots/fp9/gallery-F01.png` til `gallery-F18.png` fra repositoryets rod.
Scenekomponenten er den samme som i elevappen, server-renderet i QA-galleriet.

| Familier | Gennemgang |
|---|---|
| F01–F04 | Seks varianter hver: brøker, procent, enheder, ligninger og svarformat læselige; ingen beskårne tekster. |
| F05 | Seks varianter læselige. Åben faglig præcisering: arealhistorien angiver alle reelle x, også værdier der giver negativt areal. |
| F06 | Seks varianter: tabel svarer til prislinjer; startbetaling, besøg og kroner fremgår; diagram kun med hjælpemidler. |
| F07–F08 | Seks varianter hver: vækstdata, enheder og spørgsmål læselige. Overflødig tom anden signatur i F07 rettet. |
| F09 | Seks varianter: indre/ydre vinkler og parallel linje kontrolleret. C og ydre vinkel stod for tæt; etiketten flyttet og alle seks set igen. |
| F10 | Seks varianter: målestok, længde- og arealfaktor tydeligt adskilt i teksten. |
| F11–F12 | Seks varianter hver: rektangler og retvinklede trekanter har korrekte synlige forhold, kendte/ukendte mål markeret. Rumfang og retvinkelbegrundelse er tekstvarianter. |
| F13–F14 | Seks varianter hver: lige skala på akser, synlige givne punkter, konstruktion og transformationsinstruktioner. |
| F15 | Seks varianter: median, manglende observation og transportdiagram. Tom anden signatur fjernet og seks varianter set igen. |
| F16 | Seks varianter: datapunkter svarer til tabeller; outlier er inden for aksen; overlappende observationer kan skelnes med fyldt/åben markør. |
| F17–F18 | Seks varianter hver: sandsynlighed, tilbagelægning og simulation tydeligt beskrevet; ingen beskæring. |

Begrænsninger: Dette er agentens visuelle QA, ikke en matematiklærers godkendelse
eller en elevpilot. Matematiske størrelsesforhold og facit har særskilte uafhængige
beregningskontroller i generator- og figurtests. Denne gennemgang certificerer
ikke alle seeds eller vilkårlige AI-etiketter. Mobil/touch er afprøvet særskilt
på et kort F13-forløb, ikke på hver af disse 108 visninger. Korpus' samlede
faglige accept står åben indtil den noterede F05-præcisering er håndteret.
