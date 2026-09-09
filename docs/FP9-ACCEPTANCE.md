# Epic 1: samlet acceptkontrol

9. september 2026. Kodegrundlag: dd691a6 samt efterfølgende dokumenteret
måling af fire hjælpeniveauer. Implementeringsaccept er gennemgået; epic'en
kan **ikke lukkes**, fordi elevpiloten og dens forsinkede gentagelse mangler.

| Krav | Autoritativ evidens | Vurdering |
|---|---|---|
| E01: familier, kildetyper, fire profiler, versionsdato | `src/fp9/domain/index.ts`, profiltests, `research/fp9/FOUNDATION.md` | Implementeret og maskinkontrolleret; prøveprofilen er datomærket, ikke en garanti for fremtidige regler. |
| E02: 18 familier, strukturel variation, seeds, korrekthed | `domain/generators.ts`, `generators.test.ts`, `index.test.ts`, `figures.ts`; 100 seeds × 3 varianter × 18 familier × 2 typer | Uafhængige beregninger kontrollerer facit og geometriske invarianter. |
| E02: seks visuelle/faglige varianter pr. familie | `research/fp9/generated/VISUAL-REVIEW.md`, `review-manifest.json`, 18 familieskærmbilleder | 108 konkrete opgaver gennemgået af agent; indholdshash afgør, om review fortsat gælder. Ingen påstand om lærergodkendelse. |
| E03: lag, input, værktøjer, layout og betjening | `SceneView.tsx`, `FP9App.tsx`, værktøjstests; browser `matrix`, `resilience`, `mobile` | Gitter, tabeller, graf, lommeregner, simpelt regneark og afgrænset CAS fungerer. Mobil/touch er emuleret; ingen universel tilgængelighedscertificering. |
| E04: typede modelhandlinger, ejerskab og revisionskontrol | Scene- og servertests; browser `live-scenes`, `render-failure`, `animation*` | Rigtige modelkald tilføjer/flytter og aflæser elevændringer. Rendergate, rollback, trinvis afvikling, Stop og genforsøg verificeret. |
| E05: faktisk udbyder, fire støtteniveauer, AI fra, datadeling | `src/ai/runtime.ts`, `server/index.ts`, `docs/AI-PROTOTYPE.md`, servermatrix og `help-levels-results.json` | Codex via lokalt abonnement; modelkald er serverstyrede. Opgave, svar, noter og aktiv figur sendes til udbyderen ved hjælp; ingen elevidentitet er nødvendig. |
| E06: vurdering, formater, frie svar og assistance | Domæne-/værktøjsregressioner, serverfeedbacktests, browsermatrixens aflevering | Numeriske, symbolske og geometriske svar kontrolleres. Frie begrundelser kræver gennemgang; ingen officiel karakter. |
| E07: hele sæt, tid, navigation, lokal lagring, eksport/import, sletning, print | Servertests (20/50 og 7 grupper), browser `matrix`, `resilience`, `latency-print` | Sammenhængende lokal øveplatform. Eksport validerer blueprint; ingen løfte om kompatibilitet med tidligere udviklingsversioner. Print er kontrolleret som HTML-medie. |
| E08: fejlforløb og egentlig agentinteraktion | Browserresultater for fire kombinationer, netværk, renderfejl, tabt ACK, Stop-race og animation | Bestået med syntetiske data og faktisk model, hvor resultatfilen angiver det. |
| E08: lokal latenstid, tokens og budget | `latency-print-results.json`, `help-levels-results.json`; konfigurationsfelter i server | Tekstredigering p95 27,3 ms på M3 Max/128 GiB, 100 input. AI-kald separat pr. niveau; ikke en latencygaranti eller alle interaktioners p95. |
| E08: faglig QA, licenser og begrænsninger samlet | Denne kontrol, `research/LICENSE-REVIEW.md`, `THIRD_PARTY_NOTICES.md`, `generated/COVERAGE.md` | Registreret. Licensscreening er teknisk/dokumentbaseret og afgrænset til det undersøgte indhold; ingen nye dependencies i epic'en. |
| E08: reel elev, gradvist mindre hjælp, uset variant og forsinket gentagelse | `docs/FP9-PILOT.md` | **Mangler.** Modeltests kan ikke erstatte eleven eller bevise læring. |

Seneste kodekontrol: typecheck, 48 tests med 101598 assertions og produktionsbuild
består. Browserfiler og observerede resultater findes i
[research/fp9/browser-checks](../research/fp9/browser-checks/README.md).

Grænserne i dækningskortet er bevaret: dette er lokal FP9-træning, ikke officiel
prøveafvikling, generel CAS, mundtlig prøve eller institutionsdrift. De oprindelige
6.-klasse- og 2.g-demoer findes fortsat og er ikke udbygget i denne epic.
