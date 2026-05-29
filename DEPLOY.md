# Guia pas a pas — desplegar la quiniela (tot gratuït)

## On ets ara?

✅ Compte Vercel creat  
✅ Base de dades `mundial26-db` (Supabase Free) creada a Storage  

**Encara falta:** penjar el codi, crear el projecte web, connectar la base de dades i executar el SQL.

---

## PAS 1 — GitHub (recomanat, 5 min)

GitHub guarda el codi i Vercel el desplega automàticament quan hi ha canvis.

1. Entra a [github.com](https://github.com) i crea compte (si no en tens)
2. Clica **+** → **New repository**
3. Nom: `mundial-2026-quiniela` → **Public** → **Create repository**
4. Al teu PC, obre PowerShell i executa (canvia `EL_TEU_USUARI`):

```powershell
cd "c:\Users\janfc\Desktop\Mundial 2026"
git add .
git commit -m "Quiniela amb Supabase"
git branch -M main
git remote add origin https://github.com/EL_TEU_USUARI/mundial-2026-quiniela.git
git push -u origin main
```

GitHub et demanarà login la primera vegada.

> **Alternativa sense GitHub:** al PAS 2 pots fer `npx vercel --prod` des del PC. Funciona igual, però sense sincronització automàtica amb GitHub.

---

## PAS 2 — Crear el projecte a Vercel (3 min)

1. Vercel → **Add New…** → **Project**
2. **Import Git Repository** → connecta GitHub si cal
3. Selecciona el repo `mundial-2026-quiniela`
4. Deixa tot per defecte → **Deploy**
5. Espera 1–2 min → tindràs una URL com `https://mundial-2026-quiniela.vercel.app`

Ara ja tens **projecte web** + **base de dades**, però encara no connectats.

---

## PAS 3 — Connectar la base de dades al projecte (1 min)

1. Vercel → **Storage** (on ja ets)
2. Clica `mundial26-db`
3. Botó **Connect Project**
4. Selecciona el projecte que has creat al PAS 2
5. Confirma

Vercel afegeix sol les variables de Supabase al projecte.

---

## PAS 4 — Crear la taula a Supabase (2 min)

1. A la pàgina de `mundial26-db`, clica **Open in Supabase** (o similar)
2. Al dashboard de Supabase → **SQL Editor** → **New query**
3. Enganxa el contingut del fitxer `supabase/schema.sql` del projecte:

```sql
create table if not exists quiniela (
  id int primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

insert into quiniela (id, data) values (1, '{}')
on conflict (id) do nothing;
```

4. Clica **Run**

---

## PAS 5 — Variables d'entorn extra (1 min)

1. Vercel → el teu **projecte** (no Storage) → **Settings** → **Environment Variables**
2. Comprova que ja hi són (després del PAS 3):
   - `NEXT_PUBLIC_SUPABASE_URL` o `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Afegeix manualment:
   - Nom: `ADMIN_PIN`
   - Valor: el PIN que vulguis (ex: `laMevaQuiniela26`)
4. **Deployments** → ⋯ del darrer deploy → **Redeploy**

> Si falta `SUPABASE_SERVICE_ROLE_KEY`: Supabase → **Project Settings** → **API** → copia **service_role** → afegeix-la a Vercel.

---

## PAS 6 — Provar que funciona

1. Obre la URL del projecte
2. Ves a `/admin` → entra amb el teu `ADMIN_PIN`
3. Tab **Participants** → afegeix un amic de prova
4. Ves a `/prediccions` → entra amb el nom i PIN de l'amic

Si tot va bé, comparteix la URL al WhatsApp!

---

## Resum visual

```
GitHub (codi)  →  Vercel (web gratuïta)  →  Supabase (dades gratuïtes)
     ↑                    ↑                           ↑
  PAS 1               PAS 2                      ja fet ✅
                           ↕ connectar
                        PAS 3
                                              crear taula PAS 4
```

## Cost total: 0€

| Servei | Pla |
|--------|-----|
| Vercel | Hobby (gratuït) |
| Supabase | Free (gratuït) |
| GitHub | Gratuït |
