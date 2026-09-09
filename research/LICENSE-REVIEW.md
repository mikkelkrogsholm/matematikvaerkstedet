# Licensscreening til salg til skoler

Dato: 9. september 2026. Formål: vurdere biblioteker til et produkt, som ejeren
kan sælge til skoler, mens projektets egen kode kun er gratis til privat
familiebrug. Dette er en indledende teknisk og dokumentbaseret screening, ikke
en juridisk godkendelse af et færdigt produkt.

## Konklusion

Der er ikke fundet et forbud mod kommerciel brug i prototypens centrale
dependencies. Cordis, Mafs, React og React DOM angiver MIT. De kan som
udgangspunkt indgå i et produkt med andre vilkår for vores egen kode, når deres
licenskrav overholdes. Flere af researchkandidaterne har samme egenskab.

GeoGebra skal ikke vælges som standardintegration til skoleproduktet uden
yderligere afklaring eller kommerciel aftale. MPL-komponenter er ikke automatisk
udelukket, men kræver opmærksomhed på filernes licens og distribution.

Vores familielicens ændrer ikke andres bibliotekslicenser. Vi kan ikke forbyde
andre at bruge MIT-biblioteker kommercielt; vi kan begrænse den kode og det
indhold, vi selv har rettighederne til.

## Installeret prototype

Inventaret i [DEPENDENCY-LICENSES.json](DEPENDENCY-LICENSES.json) registrerer
55 installerede pakkers metadata og topniveau-licensfiler på macOS arm64. Det er
ikke alle pakker til andre platforme, alle indlejrede komponenter eller en
fuldstændig inspektion af hver fil. Runtime-træet følger de normale dependencies
fra de fire direkte runtime-pakker og omfatter 15 pakker.

| Del | Fund | Betydning |
| --- | --- | --- |
| Cordis 4.0.0-rc.10 | MIT i installeret metadata; pakken mangler LICENSE, men upstream har MIT. | Ingen fundet kommerciel begrænsning. Upstream-notice er medtaget med tydelig kilde; releasehistorikken er ikke særskilt verificeret. |
| Mafs 0.21.0, React/React DOM 19.2.8 | MIT i metadata og medfølgende licensfiler. | Bevar copyright og licenstekst ved distribution. |
| Øvrige runtime-pakker | Primært MIT; `@juggle/resize-observer` Apache-2.0. | Ingen fundet kommerciel begrænsning i de registrerede licenser; bevar relevante notices. |
| `computer-modern` 0.1.3 | Wrapper angiver MIT; fontfilerne har SIL OFL. Ingen separat MIT-tekst i pakken. | Fonts skal vurderes under OFL, ikke alene npm-feltet. Prototypen importerer ikke `mafs/font.css`. Afklar wrapper-notice før distribution af hele pakken. |
| TypeScript 7.0.2 | Apache-2.0. | Udviklingsværktøj; licensen forbyder ikke kommercielt produktarbejde. |
| Vite og Tailwind | MIT på de direkte pakker. | Udviklingsværktøjer; deres underafhængigheder har egne licenser. |
| Lightning CSS 1.33.0 og den installerede native binding | MPL-2.0. | Brug som buildværktøj betyder ikke i sig selv, at vores appkode bliver MPL. Distribution eller ændring af selve værktøjet kræver særskilt overholdelse. |

[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) indeholder licenstekster og
kildeoplysninger for det installerede runtime-træ, inklusive fontnoticen og
den ovenstående usikkerhed ved Cordis. Det er ikke en erklæring om, at alle disse
pakker eller fonts indgår i den optimerede browserfil.

Dependencies, Bun-runtime og værktøjer distribueres ikke som kopier i dette
Git-repository. `dist/` er også ignoreret. Ved en hosted webudgivelse skal notices
følge den distribuerede klientkode; ved containere eller installationspakker
skal det faktiske leverede runtime- og dependencyindhold gennemgås igen.

## Biblioteker fra research

Upstream-licensfiler er hentet 9. september 2026. Kilder og fil-hashes er gemt i
[CANDIDATE-LICENSES.json](CANDIDATE-LICENSES.json). Disse fund vedrører projekternes
rodlicenser på undersøgelsesdagen, ikke en endnu uvalgt versions samlede
afhængigheder, demoassets eller datasæt.

| Kandidat | Verificeret kilde | Foreløbig beslutning til kommercielt produkt |
| --- | --- | --- |
| JSXGraph | [MIT-tekst](https://github.com/jsxgraph/jsxgraph/blob/main/LICENSE.MIT) og [README med valg mellem MIT og LGPL](https://github.com/jsxgraph/jsxgraph#license) | Fortsat kandidat; brug MIT-muligheden. GitHub API fandt kun LGPL-filen, så automatisk detektion alene er misvisende. |
| Penrose/Bloom | [MIT](https://github.com/penrose/penrose/blob/main/LICENSE) | Fortsat kandidat. |
| manim-web | [MIT](https://github.com/maloyan/manim-web/blob/main/LICENSE) | Fortsat kandidat. |
| Geometry DSL | [MIT](https://github.com/shand001/geometry-dsl/blob/main/LICENSE) | Fortsat kandidat. |
| function-plot | [MIT](https://github.com/mauriciopoppe/function-plot/blob/master/LICENSE) | Fortsat kandidat. |
| CindyJS | [Apache-2.0](https://github.com/CindyJS/CindyJS/blob/main/LICENSE) | Fortsat kandidat; kontrollér også medfølgende udvidelser. |
| MathBox | [MIT](https://github.com/unconed/mathbox/blob/master/LICENSE.md) | Fortsat kandidat; Three.js og øvrige afhængigheder kontrolleres ved versionsvalg. |
| Motion Canvas | [MIT](https://github.com/motion-canvas/motion-canvas/blob/main/LICENSE) | Fortsat kandidat. |
| MathCell | [MIT](https://github.com/paulmasson/mathcell/blob/master/LICENSE.md) | Fortsat kandidat. |
| Compute Engine/MathJSON-implementering | [MIT](https://github.com/cortex-js/compute-engine/blob/main/LICENSE) | Fortsat kandidat. Aktuelt repository er `cortex-js/compute-engine`; det antagne `arnog/compute-engine` gav 404. |
| mathjs | [Apache-2.0](https://github.com/josdejong/mathjs/blob/develop/LICENSE) | Fortsat kandidat. |
| Nerdamer | [MIT](https://github.com/jiggzson/nerdamer/blob/master/license.txt) | Fortsat kandidat. |
| SymPy | [Licensfil](https://github.com/sympy/sympy/blob/master/LICENSE): BSD-3-Clause-lignende hovedvilkår og separate BSD/MIT-notices | Fortsat kandidat; bevar alle relevante notices, ikke kun en enkelt overskrift. GitHub detekterer NOASSERTION på den sammensatte fil. |
| Pyodide | [MPL-2.0](https://github.com/pyodide/pyodide/blob/main/LICENSE) | Mulig kandidat med distributionskrav; kontrollér også Python, WASM og de konkret indlæste pakker. |
| GeoGebra | [Officielle vilkår](https://www.geogebra.org/license) | Ikke standardvalg uden yderligere afklaring. Det samlede produkt/materialer har kommercielle begrænsninger. |

### GeoGebra: forskel på produkt og kildekode

GeoGebras officielle vilkår kræver særlig aftale for kommerciel brug af produktet.
Kildekoden er derimod EUPL-1.2, og en kildekodebaseret afledning kan anvendes uden
den samme noncommercial-begrænsning, hvis EUPL overholdes. Sprog-, stil- og
billedfiler samt øvrige produktdele har andre vilkår. En EUPL-afledning kræver
derfor også vurdering af copyleft og vores familielicens; den er ikke en gratis
genvej til at indlejre hele produktet på egne vilkår. [Kilde](https://www.geogebra.org/license).

### MPL og copyleft

MPL tillader kommerciel brug og kan kombineres med proprietær kode. Ved relevant
distribution skal de MPL-dækkede filer og ændringer til dem fortsat håndteres
under MPL, og modtagere skal kunne få den relevante kildekode. Det er ikke det
samme som et krav om at udgive hele vores kode under MPL. Browserleveret
JavaScript tæller også som distribution. [Mozilla FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/).

GPL/AGPL er heller ikke forbud mod salg, men kan stille krav, som er uforenelige
med at distribuere en kombineret afledning under vores begrænsede familielicens.
Vurdér konkret kombination og distribution, hvis sådanne komponenter overvejes;
de er ikke fundet blandt de registrerede installerede pakkers licensfelter.
[GNU FAQ](https://www.gnu.org/licenses/gpl-faq.en.html).

## Praktisk regel for næste biblioteksvalg

Kontrollér licensteksten for den valgte version, dens reelle dependencies og
assets. Registrér version, kilde og påkrævede notices. Foretræk til dette produkt
MIT, BSD, ISC og Apache-2.0, når de teknisk opfylder behovet. Behandl MPL/LGPL og
blandede eller kommercielt begrænsede licenser konkret. Et offentligt repository
uden en passende licens er ikke tilstrækkelig tilladelse til produktbrug.

Brug ikke prøve-PDF'er, eksempelfigurer, fonts eller andre assets som kommercielt
indhold alene på baggrund af bibliotekets rodlicens. Fremtidige AI-tjenesters
vilkår skal vurderes, når udbyder og leverancemodel vælges.
