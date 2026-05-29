# Quiniela Mundial 2026

Quiniela entre amics per al Mundial 2026 (i reutilitzable per Eurocopa).

## Començar

```bash
npm install
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000)

## Funcionalitats

- **Registre** de participants (8-12) amb PIN personal
- **Prediccions per fases**: especials, grups, 32ens, 8ens, quarts, semis, 3r lloc, final
- **Marcador exacte** per cada partit
- **Prediccions especials**: campió, subcampió, 3r, golejador, total gols, classificacions de grups
- **Classificació** en temps real amb desglossament per fase
- **Premis** automàtics (50% / 30% / 20%) sobre 15€ per persona
- **Panel admin** per introduir resultats i marcar pagaments

## PIN Admin

Per defecte: `mundial2026` (canvia'l editant `data/quiniela.json` després del primer inici)

## Sistema de puntuació

| Fase | Marcador exacte | Resultat + diff | Resultat |
|------|----------------|-----------------|----------|
| Grups | 4 pts | 2 pts | 1 pt |
| Eliminatories | 8 pts | 4 pts | 2 pts |

Prediccions especials: campió (20), subcampió (12), 3r (8), golejador (10), ordre grups (6/grup), etc.

Veure `/regles` per al reglament complet.

## Estructura

- `src/data/world-cup-2026.ts` — equips, grups i partits
- `src/lib/scoring.ts` — càlcul de punts
- `src/lib/storage.ts` — persistència JSON
- `data/quiniela.json` — dades (generat automàticament)

## Eurocopa

Per adaptar-ho a Eurocopa, crea un fitxer similar a `world-cup-2026.ts` amb 24 equips, 6 grups i l'estructura d'eliminatòries corresponent.
