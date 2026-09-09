# Prototype — 9. september 2026

## Implementeret

- 6. klasse: brøkdele, procent, tallinje og tre opgaver med feedback.
- 2.g: f(x)=ax², flytbart punkt, tangent og hældning samt tre opgaver.
- Lokal regelbaseret guide med forklaring af den aktuelle figur og hints. Ingen sprogmodel, frie AI-genererede scener eller eksterne modelkald.
- To lektioner registreret via Cordis på Bun; en browserkomponent pr. visualiseringstype. Dette afprøver en lille del af pluginarkitekturen, ikke en færdig generel pluginkontrakt.
- Mafs til funktionsgrafen og egne HTML/CSS-komponenter til brøker/tallinje.

Versioner: Bun 1.4.0, Cordis 4.0.0-rc.10, Mafs 0.21.0, React 19.2.8, Vite 8.2.2. Præcis dependency-resolution gemt i bun.lock. Installation advarede om transitive React-peerkrav; de afprøvede interaktioner fungerede med den installerede kombination.

## Udført kontrol

- `bun run build`: bestået; Vite afviklet på Bun.
- `bun run typecheck`: bestået.
- `bun test`: fire tests, 29 assertions. Brøkproportioner, tangentberegning, dansk svarinput og Cordis-registrering med oprydning.
- Browser: skift af klassetrin, ændring af brøk, tallinje, korrekte opgavesvar i begge forløb, nulhældning, lokal guides fallback.
- Punktet på grafen flyttet med både mus og piletast; sliderens værdi fulgte med.
- Desktop og mobil (390 px viewport) visuelt inspiceret. Ingen vandret overflow på den kontrollerede mobilvisning.
- Ingen JavaScript-runtimefejl observeret under interaktionstesten. Første indlæsning havde en manglende favicon-request; serveren håndterer nu denne separat.

## Afgrænsning

Dette verificerer kun den beskrevne prototype. Cordis' loader/HMR, reaktiv serviceudskiftning, andre renderbiblioteker, agentgenereret kode, formelvalidering med CAS og generelle performance-/tokenmål er ikke testet. Forløbene er eksempler til de to klassetrin, ikke en pensumkortlægning; 2.g-matematikniveau er ikke oplyst.

Ingen login eller lagring. Arbejde nulstilles ved genindlæsning. Serveren lytter kun på denne computers loopback-adresse; linket er ikke offentligt tilgængeligt.

## Opdatering: rigtig AI, 9. september 2026

De tidligere beskrivelser af en demo uden AI gælder den oprindelige version.
Der er nu en Codex CLI-adapter, der genbruger ChatGPT-login, og et lille
provider-interface til senere API-integration. Ingen nye npm-dependencies.

- Direkte live-kald via Codex CLI 0.145.0: 3/4 blev ændret til 2/5 på tallinje,
  med korrekt forklaring af 40 %. Dette ene kald tog 11,2 sekunder; det er
  en observation, ikke en latencygaranti eller et tokenbenchmark.
- Browser: rigtig chat → server → Codex → valideret scene → tallinje med 2/5
  og 40 %, samt forklaring i chatten, er kontrolleret.
- Typecheck, build og otte tests med 56 assertions bestod. AI-tests dækker
  ugyldige sceneværdier, emneskift i modelsvar, historikgrænser, cross-origin,
  AI fra, samtidige kald og fejl uden eksponering af providerdiagnostik.

Afgrænsning: frie forklaringer er modelsvar, ikke verificerede facitbeviser.
Ingen fulde FP9-prøver, ny opgavegenerator, streaming eller produktions-API
indgår i denne ændring. Detaljer: [AI-prototype](../docs/AI-PROTOTYPE.md).

Supplerende browserkontrol på samme version:
- 2.g: AI flyttede punktet til x = −1 på f(x) = x². Figuren viste (−1; 1)
  og hældning −2, som stemte med forklaringen.
- AI fra gav en fast lokal forklaring, mens grafen fortsat virkede.
- Elevændring fra 3/4 til 1/4 under et AI-kald blev bevaret; det forsinkede
  forslag om en halv blev afvist med en synlig forklaring.
- Stop fjernede ventetilstanden. Ingen tilhørende `matematik-ai-` Codex-proces
  var tilbage ved efterfølgende proceskontrol.
