# FP9 lokal server

`createFp9Api()` betjener `/api/fp9/*`. `Fp9Service` modtager en injicerbar
`LocalAttemptStore` og `Fp9Provider`; tests bruger midlertidige filer og falsk
provider, mens den lokale app bruger Codex-abonnementet.

Alle 18 familier er tilsluttet. Korte runder har F06/F13/F16; emnetræning har
3 varianter. Hele sæt følger den versionsstyrede produktfordeling i
[implementeringsnoterne](../../../docs/FP9-IMPLEMENTATION.md).

Samme dokument beskriver dataflow, miljøvariabler, versionsgrænser, persistens,
AI-afbrydelse og render-kvitteringer. Ingen facitfelter sendes til elevens
almindelige GET/export; referencefeedback frigives efter gældende feedbackpolitik.
