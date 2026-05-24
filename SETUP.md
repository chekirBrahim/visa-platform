# 🚀 Guide de mise en production — VisaTN

## ÉTAPE 1 — Pousser le code sur GitHub

Ouvre **PowerShell** dans le dossier du projet et lance :

```powershell
cd "C:\Users\USER\Documents\Claude\Projects\Formulaire visa website"

# Supprimer le .git cassé (si existant)
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue

# Initialiser git et pousser
git init -b main
git add .
git commit -m "feat: initial setup — Next.js 15 + Prisma + Neon"
git remote add origin https://github.com/chekirBrahim/visa-platform.git
git push -u origin main
```

✅ Dès le push, **Vercel déploie automatiquement**.

---

## ÉTAPE 2 — Créer la base de données Neon

1. Va sur [console.neon.tech](https://console.neon.tech)
2. Clique **"New Project"**
3. Remplis :
   - **Name** : `visa-platform`
   - **Region** : `eu-west-1` (Ireland) — plus proche de la Tunisie
   - **Postgres version** : 16
4. Clique **Create Project**
5. Copie la **Connection string** (format `postgresql://...`)

---

## ÉTAPE 3 — Connecter Neon à Vercel

### Option A (recommandée) — Via l'intégration Vercel :

1. Dans ton dashboard Vercel → projet `visa-platform`
2. Clique **Storage** → **Connect Store**
3. Sélectionne **Neon**
4. Choisis le projet `visa-platform` créé à l'étape 2
5. Vercel ajoute automatiquement `DATABASE_URL` dans les env vars ✅

### Option B — Manuel :

1. Vercel → Settings → Environment Variables
2. Ajoute ces variables :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@ep-xxx.eu-west-1.aws.neon.tech/visa-platform?sslmode=require` |
| `AUTH_SECRET` | (générer avec : `openssl rand -base64 32`) |
| `AUTH_URL` | `https://visa-platform.vercel.app` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `NEXT_PUBLIC_APP_URL` | `https://visa-platform.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | `VisaTN` |

---

## ÉTAPE 4 — Initialiser la base de données

Après avoir configuré `DATABASE_URL` en local dans `.env.local` :

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run db:generate

# Créer les tables (première fois)
npm run db:push

# Injecter les données initiales (7 pays, admin, etc.)
npm run db:seed
```

---

## ÉTAPE 5 — Ajouter le stockage de fichiers (Vercel Blob)

1. Vercel → ton projet → **Storage** → **Create Database** → **Blob**
2. Nomme-le `visa-documents`
3. Vercel ajoute automatiquement `BLOB_READ_WRITE_TOKEN`

---

## ÉTAPE 6 — Vérifier le déploiement

1. Vercel → **Deployments** → vérifier que le build est vert ✅
2. Ouvre `https://visa-platform.vercel.app`
3. Admin : `admin@visaplatform.tn` / `Admin@2025!`

---

## Variables d'environnement complètes (Vercel)

```env
# Obligatoires
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=https://visa-platform.vercel.app
NEXT_PUBLIC_APP_URL=https://visa-platform.vercel.app
NEXT_PUBLIC_APP_NAME=VisaTN

# IA
ANTHROPIC_API_KEY=sk-ant-...

# Fichiers
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Email (optionnel)
EMAIL_FROM=noreply@visatn.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=...
EMAIL_SERVER_PASSWORD=...
```

---

## Commandes utiles en développement

```bash
npm run dev          # Lancer en local (localhost:3000)
npm run db:studio    # Interface visuelle Prisma Studio
npm run db:seed      # Réinitialiser les données de base
npm run build        # Build de production
npm run lint         # Vérifier le code
```

---

## Structure des routes

| Route | Description |
|---|---|
| `/` | Page d'accueil |
| `/application/new` | Démarrer une demande (sans compte) |
| `/track` | Suivre un dossier |
| `/login` | Connexion |
| `/register` | Créer un compte |
| `/dashboard` | Espace client |
| `/admin/dashboard` | Backoffice admin |
| `/api/countries` | Liste des pays |
| `/api/applications` | CRUD dossiers |
| `/api/ai` | Chatbot visa |
| `/api/auth/[...]` | NextAuth |
