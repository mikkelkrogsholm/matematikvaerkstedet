# Trinvis AI-animation

Implementeret 9. september 2026 efter read-only scoutaudit fandt ubrugte
scenefunktioner. Flere operationer fra samme modelkald valideres samlet og i
hver mellemtilstand, før første trin vises. Serveren styrer køen; klienten kan
kun fremrykke et bestemt kendt commandId eller stoppe den.

Hvert trin kræver browserens renderkvittering. Automatisk afspilning venter et
sekund mellem bekræftede trin. Reduceret bevægelse giver manuel Næste trin.
Slutteksten holdes tilbage indtil sidste trin er bekræftet; assistance registreres
én gang, når første trin er bekræftet. Stop, elevændring, navigation, AI fra,
pause og aflevering annullerer resten. En ubekræftet ændring rulles tilbage;
bekræftede trin kan fortrydes enkeltvis. Eksport udelader uafviklede trin.

Genforsøg bruger det samme commandId. Allerede anvendte kommandoer afvikler
ikke næste trin. Renderkvitteringer er idempotente for samme token/revision.
Tabes et kvitteringssvar, opdaterer UI fra serveren; hvis kvitteringen ikke nåede
frem, findes en eksplicit Bekræft figur igen-knap.

Sol-review fandt Stop/timer-race og tabt ACK-svar. Rettelser: timeren annulleres
synkront ved en elevhandling, en allerede annulleret fremrykning droppes lokalt,
og ACK kan genlæses/genforsøges uden dobbeltregistrering.

Evidens: server/index.test.ts og browser-checks/animation*.js med resultatfiler.
Reelle modelkald har afprøvet tre trin automatisk, manuel fremrykning og afbrydelse
ved elevændring. Fejlinjektion har tabt et allerede committet ACK-svar og forsinket
Stop-svaret 1600 ms; begge forløb består. Servertests dækker også AI fra,
navigation, aflevering, renderfejl og genforsøg før/efter ACK.
