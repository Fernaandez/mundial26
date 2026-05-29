# Què cal fer vs el Quickstart de Vercel

El quickstart de Vercel és per una app **nova de zero** amb taula `notes`.
La nostra quiniela **ja està feta** — només cal 2 coses teves.

---

## ✅ Ja fet (per tu o per mi)

| Pas Vercel | La nostra app |
|------------|---------------|
| Compte Vercel | ✅ |
| Base de dades `mundial26-db` (Supabase Free) | ✅ |
| App Next.js | ✅ (ja al GitHub `mundial26`) |
| Variables d'entorn Supabase | ✅ (les tens al panell) |

---

## ❌ NO cal fer (són del template genèric)

| Pas Vercel | Per què NO |
|------------|------------|
| **2. Create Next.js app** (`with-supabase`) | Ja tenim la nostra app |
| **5. Query notes** (`app/notes/page.tsx`) | No usem taula `notes` |
| **6. npm run dev** local | Opcional, no cal per posar-la en línia |

---

## ⚠️ SÍ cal fer TU (2 passos importants)

### PAS A — Crear la taula CORRECTA a Supabase

El quickstart diu crear taula `notes`. **Nosaltres necessitem `quiniela`.**

1. Vercel → Storage → `mundial26-db` → **Open in Supabase**
2. **SQL Editor** → **New query**
3. Enganxa i **Run**:

```sql
create table if not exists quiniela (
  id int primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

insert into quiniela (id, data) values (1, '{}')
on conflict (id) do nothing;

alter table quiniela disable row level security;
```

4. Comprova: **Table Editor** → ha d'aparèixer taula **`quiniela`** (NO `notes`)

### PAS B — Connectar la DB al projecte web + Redeploy

1. Vercel → Storage → `mundial26-db` → **Connect Project**
2. Selecciona el projecte de la quiniela (no només la base de dades sola)
3. Afegeix `ADMIN_PIN` si encara no la tens (Settings → Environment Variables)
4. **Deployments** → **Redeploy** (desactiva cache si pots)

---

## Comprovar que tot va bé

Obre al navegador:

```
https://LA-TEVA-URL.vercel.app/api/health
```

Ha de sortir:
```json
{ "ok": true, "version": "2026-05-29-b", "supabase": true, "supabaseUrlSet": true }
```

Després prova `/registre` o `/admin`.

---

## Variables que Vercel ja t'ha donat (no cal copiar-les a mà si Connect Project funciona)

- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` o `SUPABASE_PUBLISHABLE_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_SECRET_KEY` ✅

Les de `POSTGRES_*` **no les necessitem** — la nostra app usa l'API de Supabase, no Postgres directe.
