# EPIC: Organisationer, brugere, hold og tildelte øveforløb

Registreret som [GitHub-epic #2](https://github.com/mikkelkrogsholm/matematikvaerkstedet/issues/2).

Status: Backlog / udskudt. Beslutning 9. september 2026.
Dette er en plan, ikke implementeret funktionalitet eller en ordre om at starte.
Fagligt indhold på den eksisterende motor prioriteres før denne epic.

## Formål

Samme matematikværksted skal kunne bruges af en familie eller en skole med
adskilte data, personlige elevprofiler, flere roller og tildelte øveforløb.
Bevar generatorer, matematikvalidering, visualiseringer og den udskiftelige AI-provider.
Hold løsningen enkel: én applikation med få, tydelige adgangsregler.

## Aftalt produktretning

- Én organisationsmodel for familier og skoler; hold er valgfri i brug.
- Hver elev har sin egen profil. Organisationer har brugere med medlemskaber.
- Roller: administrator, underviser og elev. Roller kan kombineres inden for
  samme organisation; en administrator kan også være underviser.
- En visningsvælger skifter mellem administration og undervisning uden nyt login.
  Serveren håndhæver rettigheder uanset den valgte visning.
- Undervisere kan organisere klasser/hold, tildele øveforløb og følge elevernes arbejde.
- Prøvetype/hjælpemidler og AI-støtte er fortsat uafhængige dimensioner.
- Better Auth er det ønskede loginfundament.
- Foretrukken databasemodel: SQLite med Bun, én undervisningsdatabase pr. organisation.
- Ingen skolebetaling, SSO-integration eller avanceret rettighedsbygger i første udgave.

## Foreslået konkret model — afklares før implementering

| Entitet | Ansvar |
|---|---|
| Bruger | Global loginidentitet |
| Organisation og medlemskab | Tilhørsforhold og kombinerbare roller |
| Elevprofil | Organisationsafgrænset elevidentitet; relation til login skal fastlægges |
| Hold og tilknytning | Elever og de undervisere, der må følge holdet |
| Tildelt øveforløb | Fagområder, omfang, modtagere og tilladt AI-støtte |
| Besvarelse/forsøg | Én elevs variant, svar, assistance og progression; gentagelse er et nyt forsøg |

Forslag: opretteren får administrator- og underviserrollen. Et login kan høre til
flere organisationer; skolearbejde og privat træning forbliver adskilt.

Forslag til adgang: Undervisere ser tilknyttede elevers tildelte forløb,
besvarelser, resultater og graden af AI-støtte. Privat træning deles ikke automatisk,
og underviserrollen giver ikke automatisk adgang til alle AI-samtaler.
Administratorrollen giver ikke i sig selv fagligt indblik i alle besvarelser.
Eleven skal kunne se, hvad der deles med en underviser.

## Database og server

Foreslået struktur:

```text
platform.sqlite                  # Better Auth, organisationer, medlemskaber, databaseregister
organisations/<intern-id>.sqlite # Elevprofiler, hold, forløb, besvarelser, AI-data og forbrug
```

Serveren verificerer session, medlemskab og rettighed før valg af organisationsdatabase.
Filstier udledes af serverens interne register, aldrig direkte af brugerinput.
Adgang til konkrete elever og forløb kontrolleres også inde i organisationen.
Better Auth bruger den fælles database; produktets adgangsregler implementeres i vores kode.
Referencer mellem de separate databaser kræver eksplicit livscyklus- og fejlhåndtering.

Start med én Bun-server og lokal vedvarende disk. Brug korte transaktioner,
WAL, foreign keys, kontrolleret ventetid ved låse og atomiske revisionskontroller.
Vent aldrig på et AI-kald inde i en skrivetransaktion. Håndter databaseforbindelser
med en afgrænset cache frem for at holde alle organisationers filer åbne permanent.

Hver database skal have skemaversion og genkørbare, kontrollerede migrationer.
Oprettelse af organisation skal kunne genoptages efter delvis fejl mellem fælles
register og organisationsdatabase. Backup skal være SQLite-konsistent og kunne
gendannes pr. organisation uden at rulle fælles login tilbage.

AI følger samme autoriserede kontekst som brugeren. Budget og forbrug skal kunne
opgøres pr. organisation og bruger. Den lokale Codex-provider bevares til demo;
providerkontrakten skal fortsat tillade senere API-tilkobling.

## Delopgaver og accept

### O01 — Identitet og medlemskaber
- [ ] Better Auth-login og organisationsmedlemskab fungerer med testkonti.
- [ ] Organisation kan oprettes; elever og undervisere kan tilknyttes.
- [ ] En bruger kan have flere roller og organisationer uden utilsigtet datadeling.
- [ ] Voksen-/elevlogin og oprettelsesforløb er besluttet og dokumenteret.

### O02 — Organisationslager
- [ ] Fælles identitetsdatabase og organisationsdatabaser oprettes med versioneret skema.
- [ ] Eksisterende lokale demoforsøg kan flyttes kontrolleret til en valgt demoorganisation.
- [ ] Alle læse-, skrive-, eksport-, import-, slette- og AI-endpoints kontrollerer adgang.
- [ ] Revisionskonflikter håndteres atomisk; AI, animation og renderkvitteringer bevarer deres garantier.
- [ ] Migration, delvis oprettelsesfejl samt backup og gendannelse er afprøvet.

### O03 — Roller og arbejdsflader
- [ ] Administrator/underviser kan skifte visning uden nyt login.
- [ ] Skift af organisation rydder eller annullerer forrige organisations igangværende UI-/AI-arbejde.
- [ ] Serveren afviser handlinger uden rettighed, også med manipulerede requests.

### O04 — Hold og forløb
- [ ] Underviser kan oprette hold og tildele forløb til hold eller enkelte elever.
- [ ] Hver elev får en reproducerbar egen variant og en selvstændig besvarelse.
- [ ] Gentagelse opretter et nyt forsøg og bevarer historik.
- [ ] Tilladt AI-støtte håndhæves uafhængigt af valg af almindelige hjælpemidler.

### O05 — Indblik og fælles slutkontrol
- [ ] Indblik viser fagområde, konkrete resultater og anvendt støtte uden ubegrundede mestringspåstande.
- [ ] Privat/tildelt arbejde og synlighed er tydeligt for eleven.
- [ ] To organisationer kan ikke læse eller ændre hinandens data, heller ikke med kendte IDs.
- [ ] To elever i samme organisation kan ikke tilgå hinandens besvarelser.
- [ ] Fjernet medlemskab, ændrede roller og organisationsskift under AI-kald er testet.
- [ ] Samtidige syntetiske elevsessioner belastningstestes; observeret kapacitet og begrænsninger dokumenteres.
- [ ] Samlet demoforløb: organisation → to elever → hold → tildeling → forskellige varianter → underviserindsigt.

## Åbne produktbeslutninger

- Elevlogin uden egen mail: oprettelse, legitimationsoplysninger og gendannelse.
- Præcis synlighed af noter, AI-samtaler og privat træning; mulighed for eksplicit deling.
- Hvad sker der med adgang og historik ved udmeldelse, holdskift og sletning?
- Hvordan tildeles og ændres AI-støtte, og hvad kan eleven selv vælge?
- Hvad følger med ved kopiering af forløb mellem organisationer? Elevdata deles ikke implicit.

## Kildegrundlag for teknologiforslaget

Undersøgt 9. september 2026. Verificér aktuelle versioner og licenser ved implementering.

- [Better Auth organisationer](https://better-auth.com/docs/plugins/organization)
- [Better Auth og SQLite](https://better-auth.com/docs/adapters/sqlite)
- [Bun SQLite](https://bun.sh/docs/runtime/sqlite)
- [SQLite anvendelse og skrivekonkurrence](https://sqlite.org/whentouse.html)
- [SQLite WAL](https://sqlite.org/wal.html)
- [Eksisterende arkitekturreview](../../research/architecture/README.md)
