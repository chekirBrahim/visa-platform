// ============================================================
// API — /api/applications
// GET : liste des dossiers (admin) ou les siens (client)
// POST : créer un nouveau dossier
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { generateReferenceCode } from "@/lib/utils"
import { z } from "zod"

const createApplicationSchema = z.object({
  visaTypeId: z.string().uuid(),
  formTemplateId: z.string().uuid(),
  formData: z.record(z.unknown()).optional(),
  travelDate: z.string().optional(),
  // Pour accès temporaire
  tempAccessToken: z.string().optional(),
})

// ─── GET /api/applications ───────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth()
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") ?? "1")
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20")
  const status = searchParams.get("status")
  const skip = (page - 1) * pageSize

  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin

  try {
    let where: Record<string, unknown> = {}

    if (!isAdmin) {
      if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 401 })
      }
      where = { userId: session.user.id }
    }

    if (status) where.status = status

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          visaType: { include: { country: true } },
          documents: { select: { id: true, reviewStatus: true } },
          stepHistory: { include: { step: true }, orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

// ─── POST /api/applications ──────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()

  try {
    const body = await req.json()
    const parsed = createApplicationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { visaTypeId, formTemplateId, formData, travelDate, tempAccessToken } = parsed.data

    // Vérifier le type de visa et le template
    const visaType = await prisma.visaType.findUnique({
      where: { id: visaTypeId, isActive: true },
      include: { country: true },
    })
    if (!visaType) {
      return NextResponse.json({ success: false, error: "Type de visa invalide" }, { status: 404 })
    }

    // Résoudre l'identité du demandeur
    const userId: string | null = session?.user?.id ?? null
    let tempAccessId: string | null = null

    if (!userId && tempAccessToken) {
      const tempAccess = await prisma.tempAccess.findUnique({
        where: { accessToken: tempAccessToken, isActive: true },
      })
      if (tempAccess && tempAccess.tokenExpiresAt > new Date()) {
        tempAccessId = tempAccess.id
      }
    }

    if (!userId && !tempAccessId) {
      return NextResponse.json(
        { success: false, error: "Authentification requise" },
        { status: 401 }
      )
    }

    // Créer le dossier
    const referenceCode = generateReferenceCode(visaType.country.code)

    const application = await prisma.application.create({
      data: {
        referenceCode,
        userId,
        tempAccessId,
        visaTypeId,
        formTemplateId,
        formData: (formData ?? {}) as Record<string, unknown>,
        status: "DRAFT",
        travelDate: travelDate ? new Date(travelDate) : null,
      },
      include: {
        visaType: { include: { country: true } },
      },
    })

    // Initialiser les étapes de traitement
    const steps = await prisma.processingStep.findMany({
      where: { visaTypeId },
      orderBy: { stepNumber: "asc" },
    })

    if (steps.length > 0) {
      await prisma.applicationStep.createMany({
        data: steps.map((step) => ({
          applicationId: application.id,
          stepId: step.id,
          status: "PENDING" as const,
        })),
      })
    }

    return NextResponse.json({ success: true, data: application }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
