// GET /api/form-templates?visaTypeId=xxx
// Returns the published template for a visa type, or auto-creates a basic one.

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

const DEFAULT_FIELDS = [
  { fieldKey: "full_name",       labelFr: "Nom complet",              fieldType: "TEXT",     isRequired: true,  sortOrder: 1 },
  { fieldKey: "birth_date",      labelFr: "Date de naissance",        fieldType: "DATE",     isRequired: true,  sortOrder: 2 },
  { fieldKey: "birth_place",     labelFr: "Lieu de naissance",        fieldType: "TEXT",     isRequired: true,  sortOrder: 3 },
  { fieldKey: "nationality",     labelFr: "Nationalité",              fieldType: "TEXT",     isRequired: true,  sortOrder: 4, placeholder: "Tunisienne" },
  { fieldKey: "passport_number", labelFr: "Numéro de passeport",      fieldType: "TEXT",     isRequired: true,  sortOrder: 5 },
  { fieldKey: "passport_expiry", labelFr: "Date d'expiration du passeport", fieldType: "DATE", isRequired: true, sortOrder: 6 },
  { fieldKey: "address",         labelFr: "Adresse complète",         fieldType: "TEXTAREA", isRequired: true,  sortOrder: 7 },
  { fieldKey: "profession",      labelFr: "Profession",               fieldType: "TEXT",     isRequired: false, sortOrder: 8 },
  { fieldKey: "employer",        labelFr: "Employeur / Établissement", fieldType: "TEXT",    isRequired: false, sortOrder: 9 },
  { fieldKey: "visit_purpose",   labelFr: "Motif du voyage",          fieldType: "SELECT",   isRequired: true,  sortOrder: 10,
    options: ["Tourisme", "Affaires", "Famille/Amis", "Études", "Médical", "Transit", "Autre"] },
  { fieldKey: "accommodation",   labelFr: "Hébergement prévu",        fieldType: "TEXTAREA", isRequired: false, sortOrder: 11 },
  { fieldKey: "prev_visas",      labelFr: "Visas précédents (si applicable)", fieldType: "TEXTAREA", isRequired: false, sortOrder: 12 },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const visaTypeId = searchParams.get("visaTypeId")

  if (!visaTypeId) {
    return NextResponse.json({ success: false, error: "visaTypeId requis" }, { status: 400 })
  }

  try {
    // Check visa type exists
    const visaType = await prisma.visaType.findUnique({ where: { id: visaTypeId, isActive: true } })
    if (!visaType) {
      return NextResponse.json({ success: false, error: "Type de visa introuvable" }, { status: 404 })
    }

    // Find existing published template
    let template = await prisma.formTemplate.findFirst({
      where: { visaTypeId, isPublished: true },
      include: { fields: { orderBy: { sortOrder: "asc" } } },
    })

    // Auto-create default template if none exists
    if (!template) {
      template = await prisma.formTemplate.create({
        data: {
          visaTypeId,
          isPublished: true,
          publishedAt: new Date(),
          sections: [{ key: "personal_info", labelFr: "Informations personnelles" }],
          fields: {
            create: DEFAULT_FIELDS.map((f) => ({
              sectionKey: "personal_info",
              fieldKey: f.fieldKey,
              fieldType: f.fieldType as "TEXT" | "DATE" | "TEXTAREA" | "SELECT",
              labelFr: f.labelFr,
              placeholder: (f as { placeholder?: string }).placeholder ?? null,
              isRequired: f.isRequired,
              sortOrder: f.sortOrder,
              options: (f as { options?: string[] }).options
                ? JSON.stringify((f as { options: string[] }).options)
                : null,
            })),
          },
        },
        include: { fields: { orderBy: { sortOrder: "asc" } } },
      })
    }

    return NextResponse.json({ success: true, data: [template] })
  } catch (err) {
    console.error("[form-templates] error:", err)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
