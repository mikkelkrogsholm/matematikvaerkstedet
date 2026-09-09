# FP9 lokal server

`createFp9Api()` håndterer kontraktens lokale `/api/fp9/*`-endpoints og gemmer atomisk
under `.local/fp9` (eller `FP9_STORE_PATH`). `Fp9Service` tager både en temp-sti og en
`Fp9Provider`, så tests kan bruge en falsk provider uden modelkald.

De tre implementerede familier er F06, F13 og F16. Korte runder bruger én variant fra
hver; emnetræning har de tre varianter. Domæne-blueprintet registrerer full/aids-former,
men serveren begrænser denne vertikale leverance til de tre familier, indtil resten er
genereret og verificeret.

`FP9_AI_MAX_CALLS` (12) og `FP9_AI_TIMEOUT_MS` (90000) styrer Codex-budget og timeout.
AI er server- og forsøgsstyret; slukning annullerer igangværende svar. Codex modtager kun
den offentlige opgave, scene-snapshot og seneste handlinger. Tekst til sceneændringer
frigives først efter en korrekt render-ack. Eksport er versioneret og indeholder aldrig
intern marking eller credentials; import regenererer og sammenligner opgavegivens.
