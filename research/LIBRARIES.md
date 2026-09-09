# Research: biblioteker til agentstyret matematikundervisning

Dato: 2026-09-09.

Opdatering efter afklaring af forretningsmodel: Biblioteker skal kunne indgå i
et produkt, der sælges til skoler. Se [licensscreeningen](LICENSE-REVIEW.md) for
verificerede kilder og afgrænsning. De fleste kandidater kan fortsat afprøves;
GeoGebra er ikke standardvalg uden særskilt afklaring. Licensangivelser nedenfor
erstatter ikke gennemgang af den konkret valgte version og dens afhængigheder.

Fire underagenter på GPT-5.6 Sol / medium undersøgte primære kilder i separate spor: 2D, nye agentvenlige værktøjer, animation/3D samt beregning. Routing fulgte codex-model-router; hovedagenten samlede vurderingen. Ingen biblioteker blev installeret eller kørt. Alle anbefalinger er hypoteser til afprøvning, ikke verificerede integrationer eller performance-resultater.

## Samlet anbefaling

Afprøv **JSXGraph, Penrose Bloom og manim-web** for at sammenligne tre forskellige arbejdsformer: konstruktioner, figurer styret af constraints og animerede forklaringer. Brug **Compute Engine / MathJSON** som første kandidat til en fælles beregningsservice. Det er en shortlist til forsøg, ikke et forslag om at installere alle motorerne i produktet.

**Mafs** er et relevant alternativ til JSXGraph ved React-baserede forklaringsscener. **Geometry DSL** fortjener et lille selvstændigt forsøg med statiske figurer. **MathBox** er relevant, når interaktiv matematisk 3D skal prioriteres.

Alder og alpha-status er ikke fravalgskriterier. Den praktiske afgørelse er, om agenten kan lave og ændre den ønskede figur korrekt, hurtigt og reproducerbart.

## 1. Interaktiv 2D

| Kandidat | Dokumenteret mulighed | Vurdering og konkret begrænsning |
| --- | --- | --- |
| [JSXGraph](https://github.com/jsxgraph/jsxgraph) | Opret/fjern/opdatér objekter, geometriske afhængigheder, grafer, målinger og drag | Bred kandidat til undervisning; stort imperativt API kan kræve en lille adapter. Numerisk plotting er ikke korrekthedsgaranti. MIT eller LGPL |
| [Mafs](https://github.com/stevenpetryk/mafs) | Deklarative React-komponenter, plots, transformationer og flytbare punkter | God til kompakte forklaringsscener; mindre konstruktionsgeometri. Adaptiv sampling har dokumenterede begrænsninger. MIT |
| [GeoGebra](https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/) | Kommando-API, CAS, geometri, 3D, tilstand og eventlisteners | Omfattende funktionalitet, men embed og licensvilkår skal passe til produktet |
| [function-plot](https://github.com/mauriciopoppe/function-plot) | Kort konfiguration til grafer, intervalbaseret sampling, zoom og events | Relevant specialplugin til funktionsgrafer; ikke en generel geometrimotor. MIT |
| [CindyJS](https://github.com/CindyJS/CindyJS) | Dynamisk geometri, CindyScript og udvidelser til 3D/GPU | Interessant specialmotor; eget sprog og forskelle mellem reference og implementering kræver konkrete tests. Apache-2.0 |

JSXGraph dokumenterer, at kurveplotteren forsøger at opdage spring og singulariteter; implicit plotting kan overse isolerede punkter eller kurvekomponenter. Mafs dokumenterer selv samplingproblemer. Begge skal afprøves på problematiske grafer, ikke kun pæne polynomier.

Kilder: [JSXGraph Board](https://jsxgraph.org/docs/symbols/JXG.Board.html), [kurver](https://jsxgraph.org/docs/symbols/Curve.html), [implicit plotting](https://jsxgraph.org/docs/symbols/JXG.Math.ImplicitPlot.html), [Mafs movable points](https://mafs.dev/guides/interaction/movable-points), [Mafs plots](https://mafs.dev/guides/display/plots), [GeoGebra-licens](https://www.geogebra.org/license).

## 2. Nye og deklarative tilgange

### Penrose Bloom

Bloom bruger TypeScript og en DiagramBuilder til at beskrive figurer, inputs og relationer. `ensure` og `encourage` udtrykker krav og præferencer, som en numerisk optimering forsøger at opfylde. Der er drag constraints og React-integration med delte diagramværdier.

Officielle eksempler illustrerer cirkler uden overlap, refleksionsvinkler og en lineær transformation, der synkroniserer med matematiske labels. Det er særlig interessant, hvis agenten skal beskrive relationer frem for at beregne alle pixelkoordinater selv.

Begrænsning: Optimering kan have tolerancer, konvergensproblemer og modstridende krav. Det er ikke et matematisk bevis. Builderen er kode, ikke et færdigt kompakt sceneformat. Introduktionen fra september 2024 beskriver Bloom som early-stage; denne formulering fastslår ikke i sig selv den aktuelle udviklingsstatus.

MIT. Kilder: [introduktion og eksempler](https://penrose.cs.cmu.edu/blog/bloom), [interaktion](https://penrose.cs.cmu.edu/docs/bloom/tutorial/interactivity), [React](https://penrose.cs.cmu.edu/docs/bloom/tutorial/site_integration), [API](https://penrose.cs.cmu.edu/bloom-docs/classes/DiagramBuilder).

### manim-web

En TypeScript-motor til matematiske browseranimationer. Scene- og objekt-API, transformationer, ValueTrackers, updaters, formler, grafer og 2D/3D. Dokumentationen har også drag-, klik- og hover-eksempler. Researchen fandt version 0.3.24; fastlås den faktiske version ved forsøg.

Relevant til at lade samme forklaring bevæge sig fra figur til formel og videre til elevinteraktion. Matematiske relationer skal vedligeholdes af vores kode; motoren er ikke en generel constraint-solver. Researchen fandt åbne issues om bl.a. transformerede aksekoordinater og interaktion i slidesMode. Kontrollér deres status og det præcise scenarie før en test; almindelig sceneinteraktion og player-interaktion er forskellige ting.

MIT. Kilder: [repository](https://github.com/maloyan/manim-web), [animationseksempler](https://maloyan.github.io/manim-web/examples/animations/), [interaktionseksempler](https://maloyan.github.io/manim-web/examples/new/), [issues](https://github.com/maloyan/manim-web/issues).

### Geometry DSL

[Geometry DSL](https://github.com/shand001/geometry-dsl) tager kort `.geom`-tekst gennem parse/evaluate/renderSvg. Projektet beskriver deterministisk SVG, fejl med linje/kolonne og semantiske konstruktioner som projektion og skæring. Markeringer kan kontrolleres mod geometrien, eksempelvis en retvinkel.

Interessant til agentgenererede opgavefigurer og hints. Det har ikke en runtime-eventmodel til drag og animation; ændringer kræver genkompilering. Det er en afgrænsning af rollen, ikke et fravalg på grund af alder.

Researchen fandt ingen GitHub-release eller publiceret npm-pakke under README'ens importnavn. “V0.4” betegner sprogprotokollen i README. Afprøvning skal derfor starte fra et fastlåst repository-commit. DOM/Node-uafhængig kerne er en projektpåstand, ikke lokalt testet Bun-kompatibilitet. MIT.

## 3. Animation og matematisk 3D

| Kandidat | Hvor den er relevant | Hvad der skal afprøves |
| --- | --- | --- |
| [MathBox](https://github.com/unconed/mathbox) | Matematiske koordinatsystemer, overflader, data og præsentationstrin oven på Three.js | Fastlås en fungerende Three-kombination; drag af matematiske objekter kræver adapter. Adskil domain/range fra visuel scale |
| [manim-web](https://github.com/maloyan/manim-web) | Samlet forklaringsanimation, sceneobjekter og interaktion | Opdateringer under animation, aksekoordinater, player kontra scene, mobil |
| [Motion Canvas](https://github.com/motion-canvas/motion-canvas) | Lineære 2D-forklaringer med signals, tweens og overgange | Slutbrugerens frie manipulation er ikke hovedformålet; parametre i en kompileret scene er ikke vilkårlig ny sceneadfærd |
| [MathCell](https://paulmasson.github.io/mathcell/docs/) | Korte interaktive ploteksempler og sliders i 2D/3D | Sceneændringer og kontinuitet mellem forklaringstrin |

Disse kandidater har MIT-licens ifølge deres projekter. Motion Canvas har en browser-player, men en primært videoorienteret arbejdsform og en standardrenderer i 2D. Derfor lavere prioritet til den centrale interaktive arbejdsflade, men relevant til et særskilt forklaringsplugin.

Kilder: [MathBox primitives](https://github.com/unconed/mathbox/blob/master/docs/primitives.md), [Motion Canvas signals](https://motioncanvas.io/docs/signals/), [project variables](https://motioncanvas.io/docs/project-variables/), [transitions](https://motioncanvas.io/docs/transitions/).

## 4. Beregning og validering

| Kandidat | Styrke | Begrænsning / rolle |
| --- | --- | --- |
| [Compute Engine / MathJSON](https://mathlive.io/compute-engine/) | Strukturerede udtryk, eksakt regning, LaTeX og symbolsk beregning | Første kandidat. Identitetskontrol er ikke altid et bevis; domæner og antagelser skal fastholdes. MIT |
| [mathjs](https://mathjs.org/docs/expressions/expression_trees.html) | Udtrykstræer, brøker, differentiation, matricer og enheder | God generel beregning. `symbolicEqual` kan ikke afgøre alle identiteter. Apache-2.0 |
| [Nerdamer](https://github.com/jiggzson/nerdamer) | Symbolsk regning, ligninger og LaTeX i JavaScript | Mere strengorienteret interface; konkret dækning og AST-integration skal testes. MIT |
| [SymPy via Pyodide](https://pyodide.org/en/stable/) | Bred symbolsk reserve i browser/WASM | Ekstra runtime og Python/JS-grænse; mål koldstart før valg. SymPy BSD-3-Clause; Pyodide MPL-2.0 |

Forslag: Start med én beregningsadapter. Bevar oprindeligt udtryk, antagelser og kendte domænebegrænsninger ved siden af et simplificeret udtryk. Lad sammenligning returnere ækvivalent, forskellig eller uafklaret, ledsaget af grundlaget. En parser kan ikke forventes automatisk at udlede alle udelukkede værdier for vilkårlige funktioner.

Eksempel: `(x²−1)/(x−1)` og `x+1` er ens på det første udtryks domæne, men har forskellige naturlige definitionsmængder. Simplificering må ikke få hullet ved x=1 til at forsvinde fra grafen. En CAS afgør heller ikke, om forklaringen passer til eleven.

Kilder: [Compute Engine API](https://mathlive.io/compute-engine/api/), [antagelser](https://mathlive.io/compute-engine/guides/assumptions/), [intervalkompilering](https://mathlive.io/compute-engine/guides/compiling/), [mathjs symbolicEqual](https://mathjs.org/docs/reference/functions/symbolicEqual.html), [SymPy singulariteter](https://docs.sympy.org/latest/modules/calculus/index.html).

## Arkitekturhypotese og næste forsøg

Cordis kan registrere pluginets muligheder og services. Bun håndterer serverarbejde; browseradapteren ejer visuelle objekter, render-loop og elevinteraktion. Server- og browserdelen af et plugin kan være separate entry points. Ingen af de undersøgte integrationer er verificeret på Bun 1.4.

Afprøv en lille struktureret kommandokontrakt med stabile objekt-id'er og inkrementelle ændringer. Sammenlign den med direkte genereret kode på samme opgave, før vi beslutter, hvor fleksibel agentens grænseflade skal være. Agentvenlighed og tokenforbrug er endnu vurderinger, ikke målte egenskaber.

Foreslået rækkefølge:

1. JSXGraph og Bloom: Samme trækbare trekant med højde, længder og vinkler; sammenlign kode/kommandoer, korrekthed og interaktion.
2. manim-web: En parabel med skiftende parametre, synkroniseret formel og tre forklaringstrin; ændr en parameter midt i en animation.
3. Compute Engine: Eksakte brøker, differentiation, antagelser og domænebevarelse i Bun og browser.
4. Geometry DSL: Generér gyldige og ugyldige figurer; mål determinisme, fejlbeskeder og agentens rettelser.
5. MathBox: Overflade og tangentplan, hvis 3D er nødvendigt tidligt.

Fælles kriterier og evidensniveauer findes i [PROOF-PLAN.md](PROOF-PLAN.md). Implementation kan efter en præcis kontrakt gives til Luna xhigh og kontrolleres med målbare tests; Sol kan gennemgå resultaterne. Ingen demonstrationer er igangsat som del af denne researchrunde.
