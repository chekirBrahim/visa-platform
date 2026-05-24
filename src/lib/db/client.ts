// ============================================================
// Prisma Client — Neon Serverless Adapter
// Connexion optimisée pour Vercel Edge/Serverless
// ============================================================

import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Configuration WebSocket pour les environnements non-browser
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws
}

// Singleton pattern pour éviter les connexions multiples en dev (Next.js HMR)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL!

  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
