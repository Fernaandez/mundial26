# Especificació del producte — Porra WC 2026

**Document viu.** Descriu com ha de funcionar i com ha de sortir la porra.  
Quan codi i text divergeixin d’aquí, aquest document té prioritat sobre el codi antic o converses passades.

**Última revisió:** maig 2026

---

## 1. Què és

- Porra **privada** entre amics/coneguts per al Mundial 2026.
- Idioma de la UI: **català** (`lang="ca"`).
- 8–12 participants, entrada **15€**, repartiment **70% · 20% · 10%**.
- Stack: Next.js, dades JSON/Supabase, desplegament simple.

---

## 2. Objectiu d’usuari

Cada participant ha de poder:

1. Predir **marcadors exactes** (90 min) de tots els partits rellevants.
2. Omplir **prediccions especials** (jugadors, seleccions, extras de grups).
3. Omplir el **quadre eliminatori** (qui passa de ronda → punts d’avancament + campió/3r).
4. Veure classificació, prediccions dels altres (només lectura) i reglament clar.

L’admin introdueix **resultats reals**, gestiona participants i fases.

---

## 3. Pestanyes de prediccions (estructura fixa)


| Pestanya      | Què s’hi introdueix                                  | Què puntua                                           |
| ------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| **Grups**     | Marcadors dels 72 partits de grups                   | 1 pt (1/X/2) + 3 bonus exacte = **4 pts** màx/partit |
| **Marcadors** | Marcadors KO **per ronda**, dins la finestra horària | Igual: 1 + 3 exacte                                  |
| **Quadre**    | Clic a bandera → qui passa cada partit KO            | Classificats per ronda + **campió** + **3r lloc**    |
| **Mundial**   | Jugadors + seleccions + extras grups                 | Puntuacions especials (no campió/3r manuals)         |


### Separació crítica (no barregar)

- **Marcadors KO** → només punts de resultat del partit.
- **Quadre** → només punts d’**avancament** (16ens, quarts, semis, campió, 3r).
- Sense quadre omplert **no** es poden sumar punts d’avancament mirant resultats reals.
- Campió i 3r es trien al **Quadre** (final + partit del 3r); es sincronitzen a dades internes en desar.

---

## 4. Finestres d’entrega (eliminatories)

Cada ronda es prediu **dins la finestra** entre:

- **Obertura:** kickoff del **darrer partit** de la fase anterior.
- **Tancament:** kickoff del **primer partit** de la ronda actual.

Exemples:


| Ronda                       | Finestra                                      |
| --------------------------- | --------------------------------------------- |
| Grups + Mundial (especials) | Fins al primer **32ens**                      |
| 32ens (marcadors + quadre)  | Darrer partit de **grups** → primer **32ens** |
| 16ens                       | Darrer **32ens** → primer **16ens**           |
| Quarts                      | Darrer **16ens** → primer quart               |
| Semis                       | Darrer quart → primera semi                   |
| 3r lloc                     | Darrera semi → partit del 3r                  |
| Final                       | Darrera semi → final                          |


Les dates concretes surten del calendari (`match-schedule.ts`) i es mostren a **Regles** via `buildSubmissionDeadlineRows()`.

**Override admin:** `groupsLocked` i `knockoutOpen` poden forçar tancat/obert (mode prova inclòs).

---

## 5. Nomenclatura de rondes (consistent arreu)


| Fase codi | Partits | Nom UI      |
| --------- | ------- | ----------- |
| `round32` | 16      | **Setzens** |
| `round16` | 8       | **Vuitens** |
| `quarter` | 4       | Quarts      |
| `semi`    | 2       | Semifinals  |
| `third`   | 1       | 3r lloc     |
| `final`   | 1       | Final       |


No usar «8ens» per `round32` ni «16ens» per la ronda de 16 partits.

---

## 6. Puntuació — resum

Valors numèrics: `SCORING_RULES` a `world-cup-2026.ts` + text a `/regles`.

### Grups

- Partits: 1 + 3 exacte.
- Ordre exacte grup: 7 pts.
- 3r que **NO** passa (dels 4 que queden fora dels 8 millors 3rs): 10 pts.
- Més GF / més GC a grups: 10 pts cadascun.
- Ordre de grups i millors 3rs: **automàtic** des dels marcadors (no manual).

### Especials (pestanya Mundial)

- Jugadors: golejador, assistent, MVP, MVP jove, porter (15–20 pts segons camp).
- Revelació (fora top 10 FIFA, arriba com a mínim a quarts): 15 pts.
- Decepció (dins top 10, eliminada abans dels 16ens): 20 pts.
- Empat golejador/assistent: vàlid si l’admin posa diversos noms separats per comes.

### Eliminatories — quadre

- Per equip encertat a **16ens**: 1 pt.
- Quarts: 5 pts/equip.
- Semis: 10 pts/equip.
- Guanyador partit **3r lloc**: 10 pts.
- **Campió**: 20 pts.

---

## 7. Admin — comportament esperat

### Resultats

- Grups: marcador i bloqueig del partit.
- KO **empat a 90 min**: cal triar **qui passa** (`knockoutWinner`); es reflecteix al quadre del torneig.
- **No** cal UI de pròrroga/penals separada — només marcador 90 min + guanyador si empat.

### Especials reals

- Jugadors: text lliure.
- Revelació / decepció: codis separats per comes (`COL, JPN`).
- **Campió i 3r**: NO es posen manualment — es deriven de la final i del partit del 3r.

### Participants

- Estat «**Conegut**» (`entryFeePaid`), no «Pagat».
- Es pot afegir/eliminar participants, mode prova (obrir tot + reset).

---

## 8. UI / copy

### Reglament (`/regles`)

- Preu: només «**15€**» (sense frase de pagar/cobrar).
- Pot: «participants × 15€» (sense límit màx. al text).
- Límits d’entrega: taula dinàmica per ronda (veure §4).
- **No** dir «evita empatar» als marcadors KO.

### Prediccions

- Targetes partit: **només banderes**, una línia, centrat.
- Placeholders jugadors: «Nom i Cognom».
- Avisos quan desar falla parcialment (fase tancada, partit bloquejat).

### Navegació

- «Prediccions de la gent» (no «Participants» sol).

### Torneig / quadre públic

- Mostra guanyador en empats KO («Passa: …»).

---

## 9. Fora d’abast (decisions preses)

- Admin de sorteigs / empats KO beyond winner pick.
- Noms d’equips en català (dades en castellà per ara).
- Enforcement legal de dates sense admin (horaris sí, toggles admin com a override).
- Quota de participants al text del pot (límit 12 segueix a config, no al reglament).

---

## 10. On viu cada cosa al codi


| Concepte             | Fitxer(s)                                       |
| -------------------- | ----------------------------------------------- |
| Valors punts + fases | `src/data/world-cup-2026.ts`                    |
| Notes reglament      | `src/data/rules-config.ts`                      |
| Finestres horàries   | `src/lib/prediction-deadlines.ts`               |
| Puntuació            | `src/lib/scoring.ts`, `knockout-advancement.ts` |
| Quadre usuari        | `PredictionBracket.tsx`                         |
| Persistència         | `src/lib/storage.ts`                            |
| Reglament UI         | `src/app/regles/page.tsx`                       |
| Admin                | `src/app/admin/page.tsx`                        |


---

## 11. Com mantenir aquest document

Actualitzar **ESPECIFICACIO.md** quan:

- Canviï una norma de puntuació o una finestra d’entrega.
- Canviï el flux de prediccions (pestanyes, què puntua què).
- S’afegeixi o elimini una funcionalitat d’admin.

Després alinear codi + `/regles` + textos UI.

---

## 12. Checklist ràpid abans de tancar un canvi

- Marcadors i quadre segueixen separats?
- Campió/3r només des del quadre?
- Finestres per ronda coherents amb calendari?
- Reglament i UI diuen el mateix?
- Empat KO a admin demana guanyador?
- Build passa (`npm run build`)?

