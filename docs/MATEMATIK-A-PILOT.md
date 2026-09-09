# Matematik A-pilot (stx)

Åbn `http://127.0.0.1:4317/matematik-a` efter `bun run dev`.

Piloten dækker fire afgrænsede, seedede opgavegrupper: analytisk plangeometri,
trekantsberegning, ugrupperet statistik og grupperet statistik. Hver gruppe har
tre strukturelle varianter. Opgavens data er synlige, mens intern svarværdi kun
bruges, når eleven vælger **Tjek svar**. Kvartiler bruger median-af-halvdele med
den centrale observation udeladt. Grupperede intervaller er 0–9, 10–19 osv.; et
grupperet gennemsnit er tydeligt et vægtet estimat.

Eleven kan generere nye seeds/varianter, udforske en skitse eller data-visning,
få faste hint og eksportere lokal feedback som JSON. Der gemmes ingen identitet.
AI-kontakten er bevidst begrænset i denne første UI-pilot: den synlige toggle
giver kun faste, sikre hjælpeformer; den kalder ikke modellen. Det eksisterende
Codex-forløb på forsiden og FP9 er uændret.

Dette er ikke fuld Matematik A-dækning, en eksamenssimulation eller evidens for
læringseffekt. Deskriptiv statistik er fagligt undervisningsstof, men ikke
præsenteret som aktuel skriftlig eksamensdækning.

Kontrol udført: `bun run check`.
