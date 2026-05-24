# 🇹🇳 VisaTN — Plateforme de Traitement de Visas

Plateforme moderne pour une agence tunisienne de traitement de visas.

## Stack Technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Langage | TypeScript |
| Style | TailwindCSS v4 |
| Base de données | PostgreSQL via **Neon** (serverless) |
| ORM | **Prisma** v6 |
| Auth | NextAuth v5 |
| IA | Claude (Anthropic) |
| Storage | Vercel Blob |
| Déploiement | **Vercel** |

## Démarrage rapide

```bash
npm install
cp .env.example .env.local   # Remplir DATABASE_URL avec Neon
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## Compte Admin par défaut (après seed)
- Email : admin@visaplatform.tn
- Password : Admin@2025!

## Structure
```
src/app/(auth)        → Login/Register
src/app/(client)      → Dashboard client, dossiers, suivi
src/app/(admin)       → Backoffice admin
src/app/api           → Routes API
src/components        → Composants UI/forms/chat/ai
src/lib/db            → Client Prisma (Neon)
prisma/schema.prisma  → Schéma 17 tables
prisma/seed.ts        → Données initiales
```
