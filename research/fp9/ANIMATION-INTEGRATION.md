# Åben integration: trinvis AI-animation

Read-only scoutaudit 9. september 2026 konstaterer, at queueAnimation,
advanceAnimation og cancelAnimation i src/fp9/scene/index.ts kun bruges af
unit tests. API og brugerflade bruger dem ikke. AI returnerer i dag én batch,
som vises samlet. Afbrydelse af et modelkald er implementeret, men er ikke
bevis for afbrydelse af en animation.

Implementeringen skal forbinde validerede trin til serverens revisionskontrol,
vise og kvittere ét trin før det næste, tilbyde Stop og afbryde resterende trin
ved elevændring, navigation, AI fra og aflevering. Reduceret bevægelse skal give
manuel fremrykning eller en statisk visning. Serveren skal bevare elevens arbejde,
afvise gamle revisioner og annullere uafviklede trin ved renderfejl.

Accept: et browserforløb skal starte flere trin, ændre et elevpunkt undervejs,
og vise at senere AI-trin udebliver uden tab af elevændringen. Test også Stop,
AI fra, navigation og renderfejl; allerede bekræftede ændringer skal være synlige
og kunne fortrydes. Ingen færdigmarkering af E04's trinforløb før dette er bygget.
