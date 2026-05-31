# Guia per agents (Cursor / IA)

Abans de canviar **normes, puntuació, prediccions, admin o textos de reglament**, llegeix:

**[docs/ESPECIFICACIO.md](./docs/ESPECIFICACIO.md)**

Aquest fitxer és la font de veritat del **com ha d’estar** el producte (objectiu, fluxos, copy, límits).  
El codi implementa; si divergeix, cal alinear codi o actualitzar l’especificació explícitament.

## Ordre de consulta

1. `docs/ESPECIFICACIO.md` — intenció i normes de producte
2. `src/data/rules-config.ts` + `src/data/world-cup-2026.ts` — valors numèrics
3. Codi de scoring / storage / UI

## Convencions tècniques

- UI en **català**; canvis mínims i coherents amb l’existent.
- Després de canvis rellevants: `npm run build`.
- Sempre fer commit/push.

