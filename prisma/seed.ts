// ============================================================
// SEED — Données initiales de la plateforme visa
// Commande : npm run db:seed
// ============================================================

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── 1. Pays ──────────────────────────────────────────────
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { code: 'FR' },
      update: {},
      create: {
        code: 'FR', nameFr: 'France', nameAr: 'فرنسا', nameEn: 'France',
        flagEmoji: '🇫🇷', processingCenter: 'TLS_CONTACT',
        tlsUrl: 'https://fr.tlscontact.com/visa/tn/TUN2FR',
        embassyUrl: 'https://tn.ambafrance.org',
        isActive: true, sortOrder: 1,
        processingInfoFr: 'Les rendez-vous se prennent sur TLSContact. Prévoir 15 jours minimum.',
      },
    }),
    prisma.country.upsert({
      where: { code: 'IT' },
      update: {},
      create: {
        code: 'IT', nameFr: 'Italie', nameAr: 'إيطاليا', nameEn: 'Italy',
        flagEmoji: '🇮🇹', processingCenter: 'TLS_CONTACT',
        tlsUrl: 'https://it.tlscontact.com/visa/tn/TUN2IT',
        isActive: true, sortOrder: 2,
      },
    }),
    prisma.country.upsert({
      where: { code: 'DE' },
      update: {},
      create: {
        code: 'DE', nameFr: 'Allemagne', nameAr: 'ألمانيا', nameEn: 'Germany',
        flagEmoji: '🇩🇪', processingCenter: 'TLS_CONTACT',
        tlsUrl: 'https://de.tlscontact.com/visa/tn/TUN2DE',
        isActive: true, sortOrder: 3,
      },
    }),
    prisma.country.upsert({
      where: { code: 'ES' },
      update: {},
      create: {
        code: 'ES', nameFr: 'Espagne', nameAr: 'إسبانيا', nameEn: 'Spain',
        flagEmoji: '🇪🇸', processingCenter: 'VFS_GLOBAL',
        isActive: true, sortOrder: 4,
      },
    }),
    prisma.country.upsert({
      where: { code: 'US' },
      update: {},
      create: {
        code: 'US', nameFr: 'États-Unis', nameAr: 'الولايات المتحدة', nameEn: 'United States',
        flagEmoji: '🇺🇸', processingCenter: 'EMBASSY_DIRECT',
        embassyUrl: 'https://tn.usembassy.gov/visas-fr/',
        isActive: true, sortOrder: 5,
        processingInfoFr: 'Entretien consulaire obligatoire. Délai : 4 à 8 semaines.',
      },
    }),
    prisma.country.upsert({
      where: { code: 'CA' },
      update: {},
      create: {
        code: 'CA', nameFr: 'Canada', nameAr: 'كندا', nameEn: 'Canada',
        flagEmoji: '🇨🇦', processingCenter: 'ONLINE',
        embassyUrl: 'https://www.canada.ca/fr/immigration-refugies-citoyennete.html',
        isActive: true, sortOrder: 6,
        processingInfoFr: 'Demande en ligne via IRCC. Délai : 2 à 4 semaines.',
      },
    }),
    prisma.country.upsert({
      where: { code: 'EVISA' },
      update: {},
      create: {
        code: 'EVISA', nameFr: 'eVisa', nameAr: 'تأشيرة إلكترونية', nameEn: 'eVisa',
        flagEmoji: '🌐', processingCenter: 'ONLINE',
        isActive: true, sortOrder: 7,
        description: 'Visas électroniques pour plusieurs destinations (Turquie, Égypte, Sri Lanka...)',
      },
    }),
  ])

  console.log(`✅ ${countries.length} pays créés`)

  // ─── 2. Types de visas France ─────────────────────────────
  const franceTourisme = await prisma.visaType.upsert({
    where: { id: 'vt-fr-tourisme' },
    update: {},
    create: {
      id: 'vt-fr-tourisme',
      countryId: countries[0].id,
      name: 'Visa Schengen Tourisme',
      nameFr: 'Visa Schengen Tourisme',
      category: 'TOURISME',
      durationDays: 90,
      feeAgency: 150,
      feeEmbassy: 90,
      processingDaysMin: 10,
      processingDaysMax: 21,
      requiresAppointment: true,
      isActive: true,
      description: 'Visa court séjour pour tourisme en France et espace Schengen',
      refusalTips: 'Fournir des justificatifs de revenus stables, billets retour, réservations hôtel',
    },
  })

  // ─── 3. Étapes de traitement France Tourisme ──────────────
  const steps = [
    { stepNumber: 1, nameFr: 'Réception du dossier', descriptionFr: 'Votre dossier a été reçu et enregistré', isClientVisible: true, estimatedDays: 1, iconName: 'FileCheck' },
    { stepNumber: 2, nameFr: 'Vérification des documents', descriptionFr: 'Vérification de la complétude et conformité des documents', isClientVisible: true, estimatedDays: 2, iconName: 'Search' },
    { stepNumber: 3, nameFr: 'Prise de rendez-vous TLS', descriptionFr: 'Réservation de votre rendez-vous au centre TLSContact', isClientVisible: true, estimatedDays: 3, iconName: 'Calendar' },
    { stepNumber: 4, nameFr: 'Soumission à l\'ambassade', descriptionFr: 'Dossier transmis à l\'ambassade de France', isClientVisible: true, estimatedDays: 5, iconName: 'Send' },
    { stepNumber: 5, nameFr: 'Traitement consulaire', descriptionFr: 'Votre dossier est en cours d\'examen par le consulat', isClientVisible: true, estimatedDays: 10, iconName: 'Clock' },
    { stepNumber: 6, nameFr: 'Décision finale', descriptionFr: 'Le consulat a rendu sa décision', isClientVisible: true, estimatedDays: 1, iconName: 'CheckCircle' },
  ]

  for (const step of steps) {
    await prisma.processingStep.upsert({
      where: { visaTypeId_stepNumber: { visaTypeId: franceTourisme.id, stepNumber: step.stepNumber } },
      update: {},
      create: { visaTypeId: franceTourisme.id, ...step },
    })
  }

  console.log(`✅ Étapes de traitement créées pour France Tourisme`)

  // ─── 4. Documents requis France Tourisme ──────────────────
  const docRequirements = [
    { docKey: 'passport', nameFr: 'Passeport valide', isMandatory: true, acceptedFormats: ['pdf', 'jpg', 'jpeg'], maxSizeMb: 5, sortOrder: 1 },
    { docKey: 'photo', nameFr: 'Photo d\'identité biométrique', isMandatory: true, acceptedFormats: ['jpg', 'jpeg', 'png'], maxSizeMb: 2, sortOrder: 2 },
    { docKey: 'bank_statement', nameFr: 'Relevé bancaire (3 derniers mois)', isMandatory: true, acceptedFormats: ['pdf'], maxSizeMb: 10, sortOrder: 3 },
    { docKey: 'work_certificate', nameFr: 'Attestation de travail', isMandatory: true, acceptedFormats: ['pdf', 'jpg'], maxSizeMb: 5, sortOrder: 4 },
    { docKey: 'hotel_booking', nameFr: 'Réservation hôtel / Invitation', isMandatory: true, acceptedFormats: ['pdf'], maxSizeMb: 5, sortOrder: 5 },
    { docKey: 'flight_booking', nameFr: 'Réservation de vol aller-retour', isMandatory: true, acceptedFormats: ['pdf'], maxSizeMb: 5, sortOrder: 6 },
    { docKey: 'travel_insurance', nameFr: 'Assurance voyage (min 30 000€)', isMandatory: true, acceptedFormats: ['pdf'], maxSizeMb: 5, sortOrder: 7 },
    { docKey: 'civil_status', nameFr: 'Acte de naissance / Livret de famille', isMandatory: false, acceptedFormats: ['pdf', 'jpg'], maxSizeMb: 5, sortOrder: 8 },
  ]

  for (const doc of docRequirements) {
    await prisma.documentRequirement.upsert({
      where: { visaTypeId_docKey: { visaTypeId: franceTourisme.id, docKey: doc.docKey } },
      update: {},
      create: { visaTypeId: franceTourisme.id, ...doc },
    })
  }

  console.log(`✅ Documents requis créés pour France Tourisme`)

  // ─── 5. Compte Super Admin ────────────────────────────────
  const adminEmail = 'admin@visaplatform.tn'
  const adminPasswordHash = await bcrypt.hash('Admin@2025!', 12)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: 'Super Administrateur',
      passwordHash: adminPasswordHash,
      accountType: 'FULL',
      isVerified: true,
    },
  })

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      role: 'SUPER_ADMIN',
      permissions: { all: true },
      canManageForms: true,
      canManageCountries: true,
    },
  })

  console.log(`✅ Admin créé: ${adminEmail} / Admin@2025!`)
  console.log('🎉 Seeding terminé !')
}

main()
  .catch((e) => {
    console.error('❌ Erreur seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
