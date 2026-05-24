// ============================================================
// API — /api/applications/[id]
// GET : détail d'un dossier
// PATCH : mettre à jour (statut, formData, etc.)
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

// ─── GET /api/applications/[id] ──────────────────────────
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
        visaType: { include: { country: true } },
        formTemplate: { include: { fields: { orderBy: { sortOrder: "asc" } } } },
        documents: { include: { requirement: true }, orderBy: { uploadedAt: "desc" } },
        stepHistory: { include: { step: true }, orderBy: { step: { stepNumber: "asc" } } },
        messages: { orderBy: { createdAt: "asc" }, take: 50 },
        adminComments: { orderBy: { createdAt: "desc" } },
      },
    })

    if (!application) {
      return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 })
    }

    // Vérifier les droits d'accès
    const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin
    const isOwner = session?.user?.id === application.userId

    if (!isAdmin && !isOwner) {
      // Vérifier accès temporaire via header
      const tempToken = req.headers.get("x-temp-token")
      if (!tempToken || application.tempAccess?.accessToken !== tempToken) {
        return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 })
      }
    }

    return NextResponse.json({ success: true, data: application })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

// ─── PATCH /api/applications/[id] ────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin

  try {
    const body = await req.json()

    const application = await prisma.application.findUnique({ where: { id } })
    if (!application) {
      return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 })
    }

    // Seul l'admin peut changer le statut
    const updateData: Record<string, unknown> = {}

    if (isAdmin) {
      if (body.status) updateData.status = body.status
      if (body.priority) updateData.priority = body.priority
      if (body.assignedAgentId !== undefined) updateData.assignedAgentId = body.assignedAgentId
      if (body.appointmentDate) updateData.appointmentDate = new Date(body.appointmentDate)
      if (body.internalNote !== undefined) updateData.internalNote = body.internalNote

      // Log d'audit
      if (body.status && body.status !== application.status) {
        await prisma.auditLog.create({
          data: {
            actorId: session!.user!.id!,
            actorType: "ADMIN",
            action: "APPLICATION_STATUS_CHANGED",
            entityType: "Application",
            entityId: id,
            diff: { from: application.status, to: body.status },
          },
        })

        // Notifier le client
        if (application.userId) {
          await prisma.notification.create({
            data: {
              userId: application.userId,
              applicationId: id,
              type: "STATUS_CHANGE",
              channel: "IN_APP",
              title: "Statut de votre dossier mis à jour",
              body: `Votre dossier ${application.referenceCode} est maintenant : ${body.status}`,
              actionUrl: `/dashboard/applications/${id}`,
            },
          })
        }
      }
    } else {
      // Client peut uniquement mettre à jour les données du formulaire (si DRAFT)
      if (application.status !== "DRAFT") {
        return NextResponse.json(
          { success: false, error: "Impossible de modifier un dossier soumis" },
          { status: 400 }
        )
      }
      if (body.formData) updateData.formData = body.formData
      if (body.travelDate) updateData.travelDate = new Date(body.travelDate)
    }

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
