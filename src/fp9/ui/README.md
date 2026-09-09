# FP9 UI integration

`FP9App` vælges i `src/main.tsx` ved `/fp9`; den eksisterende 6. klasse/2.g-
prototype bliver fortsat rendret på `/`.

UI'et bruger udelukkende de offentlige typer fra `src/fp9/api-types.ts` og de
samme-origin endpoints i `docs/FP9-API-CONTRACT.md`. Den importerer ikke
generator eller bedømmelseslogik i browseren.

## Integrationpunkter

- Forsøgsændringer er serialiserede `action`-kald med den viste revision.
  En konflikt giver fejlstatus og opdaterer revisionsgrundlaget til et eksplicit
  genforsøg. Ugemte felter bevares, og navigation blokeres ved gemmefejl.
- Sceneobjekter fra eleven gemmes separat med `student`-aktionen. AI-objekter
  får stabile `data-ai-object-id`-attributter og bekræftes først efter en
  browser-frame; en manglende DOM-rendering rapporteres som `success: false`.
- MathTools er kontrolleret af `ToolState` og gemmes pr. opgave via `tools`.
- Serverimplementeringen ejer fortsat eksport, import, generationsseed,
  vurdering, AI-policy og holdt modeltekst. UI'et indeholder ingen mock-data.

## Kontrol

`bun run check` består. Endpoints er afprøvet gennem den rigtige lokale server.
Browserforløb, faktisk render-kvittering, tastatur, touch og mobilvisning afventer
adgang til den låste Mac. Se docs/FP9-IMPLEMENTATION.md for den samlede evidens.
