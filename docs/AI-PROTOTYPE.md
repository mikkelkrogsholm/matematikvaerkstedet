# AI i de oprindelige demoer

Dette dokument beskriver 6. klasse/2.g. FP9 har en særskilt forsøgs- og
scenekontrakt: se [FP9-implementeringen](FP9-IMPLEMENTATION.md). Begge bruger
den fælles Codex-runtime.

Implementeret 9. september 2026. De to demonstrationsforløb kan nu tale med en
rigtig model gennem ejerens eksisterende Codex-login. Dette er den lokale
demoadapter, ikke en færdig flerbrugerbackend til skoler.

## Start med abonnementet

Installér Codex CLI fra OpenAI og kør `codex login` med ChatGPT-login.
`codex login status` skal vise `Logged in using ChatGPT`. Start derefter:

```sh
bun run dev
```

Åbn http://127.0.0.1:4317. Guidens status viser, om login er tilgængeligt.
AI er aktiveret fra start og kan slås fra med **AI som støttehjul**.
Abonnementets Codex-forbrug og grænser gælder. Der bruges ingen API-nøgle.
Login-status er ikke en garanti for resterende kvote eller modeltilgængelighed.
Efter ændret login: genindlæs siden for at hente status igen.

Eksempler:

- 6. klasse: “Vis to femtedele på tallinjen og forklar procenten.”
- 2.g: “Flyt punktet til x = −1, og forklar, hvorfor hældningen er negativ.”
- “Giv mig et lille hint, uden at fortælle facit.”

Uden AI virker figurer, skydere, faste forklaringer og lokal svarkontrol stadig.
Dette er en demonstrationsindstilling; FP9 har separat implementeret støttehistorik og genererede øvesæt på `/fp9`.

## Adaptergrænsen

`src/ai/provider.ts` definerer `TutorProvider`: `status()` og
`reply(request, signal)`. En senere API-adapter implementerer samme kontrakt
og vælges i `src/ai/http.ts`. Lektionsplugins, figurkode og chat behøver ikke
kende udbyderens login, API-format eller SDK. En API-adapter er ikke bygget endnu.

`src/ai/contracts.ts` er fælles data og validering. Browseren sender den aktuelle
scene, højst otte tidligere beskeder, spørgsmålet og eventuelt den synlige
opgavetekst. Der sendes ikke screenshots, repositoryfiler eller lokalt facitfelt.
Modellen returnerer tekst og højst én ny scene. Både server og browser validerer
sceneværdierne. Figurer og nøgletal beregnes fortsat lokalt.

Den nuværende sceneadgang er afgrænset til brøkens dele/tallinje og parablens
koefficient/punkt. Det er ikke fri kodegenerering, nye figurtyper eller et
fuldt agentværktøjsloop. Klienten anvender svar og figur samlet. Hvis eleven
har ændret figur, trin eller opgave i mellemtiden, forkastes svaret. Næste
spørgsmål indeholder den faktisk aktuelle scene. Emneskift, AI fra og Stop
annullerer det igangværende browserkald.

## Drift og begrænsninger

- Afprøvet med Bun 1.4.0 og Codex CLI 0.145.0. CLI-adapteren bruger bl.a.
  `--ignore-user-config`, `--ephemeral` og `--output-schema`.
- Hvert spørgsmål starter en separat CLI-proces med en midlertidig arbejdsmappe.
  Det koster opstartstid og gentager en begrænset historik. Der er ingen
  streaming eller automatisk genforsøg, som kunne bruge ekstra kvote.
- Kun én modelproces ad gangen. CLI-timeout er 90 sekunder. Fejl vises ærligt;
  et mislykket AI-kald erstattes ikke med et svar, der udgiver sig for at være AI.
- Demo-endpointet begrænser input til 48 KiB. Serveren binder til loopback og afviser
  cross-origin-kald. Det er ikke autentifikation til offentlig hosting.
- CLI genbruger selv login. Adapteren læser eller kopierer ikke credentials og
  fjerner nedarvede `OPENAI_API_KEY`/`CODEX_API_KEY` fra modelprocessens miljø.
- CLI kører read-only med ignoreret brugerkonfiguration/projektdokumenter,
  uden shell, apps, plugins, hooks, web search og de angivne browser/agentfeatures.
  Konfigurationen er versionsafhængig og skal kontrolleres ved CLI-opgradering.
- Disse to demoer gemmer ikke samtaler. FP9 gemmer dem lokalt. CLI bruger ephemeral sessions; dette lover ikke,
  at Codex/OpenAI ingen driftslogs eller serverdata har. Spørgsmål og figur
  sendes til OpenAI via Codex, og historikken lever i browserens hukommelse.
- Figurens numeriske værdier kontrolleres; modellens frie forklaringer er ikke
  formelt verificerede. De tre faste øveopgaver pr. emne er fortsat lokale demoer.

Miljøvariabler (kræver servergenstart):

| Variabel | Standard | Betydning |
| --- | --- | --- |
| `AI_PROVIDER` | `codex` | `codex` eller `off`; ukendte værdier afvises. |
| `CODEX_BIN` | `codex` | Sti til installeret Codex CLI. |
| `CODEX_MODEL` | CLI-standard | Valgfri model, der er tilgængelig på abonnementet. |
| `PORT` | `4317` | Lokal port. |

Ingen nye npm-dependencies er tilføjet. Codex installeres separat.

## Kilder

- [OpenAI: non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [OpenAI: authentication](https://learn.chatgpt.com/docs/auth)
- Den installerede versions `codex exec --help`, `codex features list` og
  `codex login status` er kontrolleret lokalt.
