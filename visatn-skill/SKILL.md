---
name: visatn-project
description: Contexte complet du projet VisaTN — site web Next.js 15 pour une agence de visas tunisienne. Utiliser IMMÉDIATEMENT dès que l'utilisateur mentionne : VisaTN, visa, dossier visa, build Vercel, erreur Vercel, Prisma, Neon, NextAuth, le site, le projet, formulaire visa, agence de voyage. Même si l'utilisateur dit juste "continue", "erreur", "build", "push" — utiliser cette skill pour avoir le contexte complet du projet.
---

# Projet VisaTN — Contexte complet

## Stack technique
- **Framework**: Next.js 15 (App Router) + TypeScript strict
- **Styles**: TailwindCSS (thème dark, slate-950 base)
- **Auth**: NextAuth v5 beta (`next-auth@5.0.0-beta`)
- **BDD**: PostgreSQL via Neon + Prisma v6 + `@prisma/adapter-neon`
- **Deploy**: Vercel (avec `--legacy-peer-deps` obligatoire)
- **AI**: Anthropic Claude API

## Dossier du projet
`C:\Users\USER\Documents\Claude\Projects\Formulaire visa website`

## Commande push
```bash
git add . && git commit -m "fix: <description>" && git push
```

## Variables d'environnement Vercel requises
```
DATABASE_URL          = postgresql://... (Neon connection string)
AUTH_SECRET           = (random string 32 chars)
AUTH_URL              = https://<projet>.vercel.app
ANTHROPIC_API_KEY     = sk-ant-...
NEXT_PUBLIC_APP_URL   = https://<projet>.vercel.app
NEXT_PUBLIC_APP_NAME  = VisaTN
```

## Architecture fichiers clés
```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (client)/
│   │   ├── dashboard/page.tsx
│   │   ├── track/page.tsx + _track-content.tsx
│   │   └── application/new/page.tsx + _new-content.tsx
│   ├── (admin)/admin/dashboard/page.tsx
│   └── api/applications/ messages/ ai/ admin/
├── lib/
│   ├── auth/config.ts + edge-config.ts + index.ts
│   ├── db/client.ts
│   └── utils.ts
└── middleware.ts
```

## Règles critiques Next.js 15

### useSearchParams() → Suspense obligatoire
```tsx
// page.tsx — wrapper uniquement
import { Suspense } from "react"
import Content from "./_content"
export default function Page() {
  return <Suspense fallback={<div>...</div>}><Content /></Suspense>
}
// _content.tsx — useSearchParams ici
"use client"
export default function Content() { const p = useSearchParams(); ... }
```

### Middleware = Edge Runtime → jamais Prisma/bcrypt
```ts
import NextAuth from "next-auth"
import { edgeAuthConfig } from "@/lib/auth/edge-config"
export const { auth: middleware } = NextAuth(edgeAuthConfig)
```

### ESLint flat config
```js
import { FlatCompat } from "@eslint/eslintrc"
const compat = new FlatCompat({ baseDirectory: __dirname })
export default [...compat.extends("next/core-web-vitals", "next/typescript")]
```

### vercel.json
```json
{ "installCommand": "npm install --legacy-peer-deps" }
```

### Prisma JSON cast
```ts
formData: (formData ?? {}) as Record<string, unknown>
```

## Erreurs Vercel → fixes rapides

| Erreur | Fix |
|--------|-----|
| npm install exit 1 | `--legacy-peer-deps` dans vercel.json |
| Edge Runtime incompatible | Utiliser edge-config.ts dans middleware |
| useSearchParams sans Suspense | Wrapper page.tsx + _content.tsx enfant |
| no-unused-vars ESLint | Supprimer l'import inutilisé |
| eslint-config-next module not found | FlatCompat dans eslint.config.mjs |
| Prisma JSON type error | Cast `as Record<string, unknown>` |
| tempAccess not in include | Ajouter include Prisma manquant |

## État BDD
Si DATABASE_URL pas encore configuré :
1. Créer projet sur neon.tech
2. Copier DATABASE_URL → Vercel Settings → Env Vars
3. Terminal local : `npx prisma db push` puis `npx prisma db seed`
