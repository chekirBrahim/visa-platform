// ============================================================
// SEED — Données initiales de la plateforme visa
// ============================================================

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ── Compte Admin ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@2024!", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@visatn.com" },
    update: {},
    create: {
      email: "admin@visatn.com",
      fullName: "Administrateur VisaTN",
      passwordHash: adminPassword,
      isVerified: true,
    },
  })
  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: "SUPER_ADMIN",
      canManageForms: true,
      canManageCountries: true,
    },
  })
  console.log("✅ Admin:", adminUser.email, "/ Admin@2024!")

  // ── Pays + Types de visa ──────────────────────────────────
  type VisaInput = {
    name: string; nameFr: string; category: "TOURISME"|"ETUDES"|"TRAVAIL"|"AFFAIRES"|"FAMILLE"|"TRANSIT"|"EVISA"
    feeAgency: number; feeEmbassy: number; feeCurrency: string
    processingDaysMin: number; processingDaysMax: number; durationDays?: number
  }
  const data: Array<{ code: string; nameFr: string; nameEn: string; flagEmoji: string; visas: VisaInput[] }> = [
    {
      code: "FR", nameFr: "France", nameEn: "France", flagEmoji: "🇫🇷",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme",         category: "TOURISME", feeAgency: 150, feeEmbassy: 80,  feeCurrency: "EUR", processingDaysMin: 10, processingDaysMax: 20, durationDays: 90 },
        { name: "STUDENT",  nameFr: "Visa Étudiant",         category: "ETUDES",   feeAgency: 200, feeEmbassy: 99,  feeCurrency: "EUR", processingDaysMin: 15, processingDaysMax: 30 },
        { name: "WORK",     nameFr: "Visa Travail",          category: "TRAVAIL",  feeAgency: 250, feeEmbassy: 99,  feeCurrency: "EUR", processingDaysMin: 20, processingDaysMax: 45 },
        { name: "FAMILY",   nameFr: "Regroupement Familial", category: "FAMILLE",  feeAgency: 300, feeEmbassy: 99,  feeCurrency: "EUR", processingDaysMin: 30, processingDaysMax: 60 },
      ],
    },
    {
      code: "DE", nameFr: "Allemagne", nameEn: "Germany", flagEmoji: "🇩🇪",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme", category: "TOURISME", feeAgency: 150, feeEmbassy: 80, feeCurrency: "EUR", processingDaysMin: 10, processingDaysMax: 20, durationDays: 90 },
        { name: "WORK",     nameFr: "Visa Travail",  category: "TRAVAIL",  feeAgency: 250, feeEmbassy: 75, feeCurrency: "EUR", processingDaysMin: 20, processingDaysMax: 45 },
      ],
    },
    {
      code: "IT", nameFr: "Italie", nameEn: "Italy", flagEmoji: "🇮🇹",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme", category: "TOURISME", feeAgency: 150, feeEmbassy: 80, feeCurrency: "EUR", processingDaysMin: 10, processingDaysMax: 20, durationDays: 90 },
        { name: "STUDENT",  nameFr: "Visa Étudiant", category: "ETUDES",   feeAgency: 200, feeEmbassy: 75, feeCurrency: "EUR", processingDaysMin: 15, processingDaysMax: 30 },
      ],
    },
    {
      code: "ES", nameFr: "Espagne", nameEn: "Spain", flagEmoji: "🇪🇸",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme", category: "TOURISME", feeAgency: 150, feeEmbassy: 80, feeCurrency: "EUR", processingDaysMin: 10, processingDaysMax: 20, durationDays: 90 },
        { name: "WORK",     nameFr: "Visa Travail",  category: "TRAVAIL",  feeAgency: 250, feeEmbassy: 75, feeCurrency: "EUR", processingDaysMin: 20, processingDaysMax: 45 },
      ],
    },
    {
      code: "US", nameFr: "États-Unis", nameEn: "United States", flagEmoji: "🇺🇸",
      visas: [
        { name: "TOURIST",  nameFr: "Visa B1/B2 Tourisme", category: "TOURISME", feeAgency: 300, feeEmbassy: 160, feeCurrency: "USD", processingDaysMin: 30, processingDaysMax: 90 },
        { name: "STUDENT",  nameFr: "Visa F1 Étudiant",    category: "ETUDES",   feeAgency: 350, feeEmbassy: 160, feeCurrency: "USD", processingDaysMin: 30, processingDaysMax: 60 },
        { name: "WORK",     nameFr: "Visa H1B Travail",    category: "TRAVAIL",  feeAgency: 400, feeEmbassy: 190, feeCurrency: "USD", processingDaysMin: 60, processingDaysMax: 120 },
      ],
    },
    {
      code: "CA", nameFr: "Canada", nameEn: "Canada", flagEmoji: "🇨🇦",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme",     category: "TOURISME", feeAgency: 250, feeEmbassy: 100, feeCurrency: "CAD", processingDaysMin: 15, processingDaysMax: 30 },
        { name: "STUDENT",  nameFr: "Permis d'études",   category: "ETUDES",   feeAgency: 300, feeEmbassy: 150, feeCurrency: "CAD", processingDaysMin: 20, processingDaysMax: 45 },
        { name: "WORK",     nameFr: "Permis de travail", category: "TRAVAIL",  feeAgency: 350, feeEmbassy: 155, feeCurrency: "CAD", processingDaysMin: 30, processingDaysMax: 60 },
      ],
    },
    {
      code: "GB", nameFr: "Royaume-Uni", nameEn: "United Kingdom", flagEmoji: "🇬🇧",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Visiteur",  category: "TOURISME", feeAgency: 250, feeEmbassy: 115, feeCurrency: "GBP", processingDaysMin: 10, processingDaysMax: 20 },
        { name: "STUDENT",  nameFr: "Visa Étudiant",  category: "ETUDES",   feeAgency: 400, feeEmbassy: 363, feeCurrency: "GBP", processingDaysMin: 15, processingDaysMax: 30 },
      ],
    },
    {
      code: "TR", nameFr: "Turquie", nameEn: "Turkey", flagEmoji: "🇹🇷",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme", category: "TOURISME", feeAgency: 100, feeEmbassy: 50, feeCurrency: "USD", processingDaysMin: 3, processingDaysMax: 10, durationDays: 30 },
      ],
    },
    {
      code: "AE", nameFr: "Émirats Arabes Unis", nameEn: "UAE", flagEmoji: "🇦🇪",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme 30j", category: "TOURISME", feeAgency: 200, feeEmbassy: 90,  feeCurrency: "USD", processingDaysMin: 3, processingDaysMax: 7, durationDays: 30 },
        { name: "WORK",     nameFr: "Visa Travail",      category: "TRAVAIL",  feeAgency: 300, feeEmbassy: 150, feeCurrency: "USD", processingDaysMin: 7, processingDaysMax: 20 },
      ],
    },
    {
      code: "CN", nameFr: "Chine", nameEn: "China", flagEmoji: "🇨🇳",
      visas: [
        { name: "TOURIST",  nameFr: "Visa Tourisme L",  category: "TOURISME", feeAgency: 250, feeEmbassy: 140, feeCurrency: "USD", processingDaysMin: 5, processingDaysMax: 15 },
        { name: "BUSINESS", nameFr: "Visa Affaires M",  category: "AFFAIRES", feeAgency: 250, feeEmbassy: 140, feeCurrency: "USD", processingDaysMin: 5, processingDaysMax: 15 },
      ],
    },
  ]

  for (const c of data) {
    const country = await prisma.country.upsert({
      where: { code: c.code },
      update: {},
      create: { code: c.code, nameFr: c.nameFr, nameEn: c.nameEn, flagEmoji: c.flagEmoji, isActive: true },
    })
    for (const vt of c.visas) {
      await prisma.visaType.create({
        data: {
          countryId: country.id,
          name: vt.name,
          nameFr: vt.nameFr,
          category: vt.category,
          feeAgency: vt.feeAgency,
          feeEmbassy: vt.feeEmbassy,
          feeCurrency: vt.feeCurrency,
          processingDaysMin: vt.processingDaysMin,
          processingDaysMax: vt.processingDaysMax,
          durationDays: vt.durationDays ?? null,
          isActive: true,
        },
      }).catch(() => {}) // ignore duplicates
    }
    console.log(`  ${c.flagEmoji} ${c.nameFr} — ${c.visas.length} visa(s)`)
  }

  console.log("\n✨ Seed terminé!")
  console.log("📧 Admin: admin@visatn.com / Admin@2024!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
