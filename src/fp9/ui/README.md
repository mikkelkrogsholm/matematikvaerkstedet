# FP9 UI integration

`FP9App` vælges i `src/main.tsx` ved `/fp9`; den eksisterende 6. klasse/2.g-
prototype bliver fortsat rendret på `/`.

UI'et bruger udelukkende de offentlige typer fra `src/fp9/api-types.ts` og de
samme-origin endpoints i `docs/FP9-API-CONTRACT.md`. Den importerer ikke
generator eller bedømmelseslogik i browseren.

## Integrationpunkter

- Forsøgsændringer er serialiserede `action`-kald med den viste revision.
  En konflikt giver fejlstatus og genindlæsning i stedet for at overskrive nyere
  serverdata.
- Sceneobjekter fra eleven gemmes separat med `student`-aktionen. AI-objekter
  får stabile `data-ai-object-id`-attributter og bekræftes først efter en
  browser-frame; en manglende DOM-rendering rapporteres som `success: false`.
- MathTools er kontrolleret af `ToolState` og gemmes pr. opgave via `tools`.
- Serverimplementeringen ejer fortsat eksport, import, generationsseed,
  vurdering, AI-policy og holdt modeltekst. UI'et indeholder ingen mock-data.

## Kontrol

`bun run check` er kørt efter ændringen. Backendens FP9-endpoints var ikke
tilgængelige i dette worktree, så browserforløb mod et rigtigt forsøg, AI-render
acknowledgement og import/eksport skal afprøves efter backendintegration.
