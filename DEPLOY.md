# Desplegament a Vercel (gratuït)

## Què necessito de tu (5 minuts)

1. **Compte Vercel** gratuït → [vercel.com/signup](https://vercel.com/signup) (amb GitHub és el més ràpid)
2. **Compte GitHub** gratuït → [github.com/signup](https://github.com/signup) (si no en tens)
3. Passa'm o configura tu:
   - Un **token de Vercel** (Settings → Tokens) **O**
   - Fes login tu mateix quan et demani el navegador

## Passos automàtics (jo ho faig)

```bash
git init
git add .
git commit -m "Quiniela Mundial 2026"
npx vercel --prod
```

## Base de dades (obligatori en línia)

Vercel no guarda fitxers. Cal connectar **Vercel KV** (Redis gratuït):

1. Vercel Dashboard → el teu projecte → **Storage** → **Create Database** → **KV**
2. Connecta'l al projecte (afegeix les variables automàticament)
3. Redeploy

## Variables d'entorn a Vercel

| Variable | Valor |
|----------|-------|
| `ADMIN_PIN` | El PIN que vulguis per admin (ex: `laMevaQuiniela26`) |
| `KV_REST_API_URL` | (auto quan connectes KV) |
| `KV_REST_API_TOKEN` | (auto quan connectes KV) |

## Registrar amics

Tu (admin) afegeix participants des de `/admin`:
- PIN admin per defecte: `mundial2026` (canvia'l amb `ADMIN_PIN`)
- Afegir nom + PIN per cada amic
- Passa'ls el nom i PIN per entrar a **Prediccions**

## URL final

Després del deploy tindràs una URL com:
`https://mundial-2026-quiniela.vercel.app`

Comparteix-la al grup de WhatsApp!
