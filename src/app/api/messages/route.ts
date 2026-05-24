// ============================================================
// API — /api/messages
// POST : envoyer un message
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { z } from "zod"

const sendMessageSchema = z.object({
  applicationId: z.string().uuid(),
  content: z.string().min(1).max(2000),
  messageType: z.enum(["TEXT", "DOCUMENT"]).default("TEXT"),
  attachmentUrl: z.string().url().optional(),
  attachmentName: z.string().optional(),
  tempAccessToken: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const applicationId = searchParams.get("applicationId")
  if (!applicationId) {
    return NextResponse.json({ success: false, error: "applicationId requis" }, { status: 400 })
  }

  try {
    const messages = await prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
      include: {
        senderUser: { select: { id: true, fullName: true } },
      },
    })
    return NextResponse.json({ success: true, data: messages })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()

  try {
    const body = await req.json()
    const parsed = sendMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 })
    }

    const { applicationId, content, messageType, attachmentUrl, attachmentName, tempAccessToken } = parsed.data

    // Vérifier accès au dossier
    const application = await prisma.application.findUnique({ where: { id: applicationId } })
    if (!application) {
      return NextResponse.json({ success: false, error: "Dossier introuvable" }, { status: 404 })
    }

    const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin
    const isOwner = session?.user?.id === application.userId
    let isTempOwner = false

    if (!isOwner && !isAdmin && tempAccessToken) {
      const tempAccess = await prisma.tempAccess.findUnique({ where: { accessToken: tempAccessToken } })
      isTempOwner = tempAccess?.id === application.tempAccessId
    }

    if (!isOwner && !isAdmin && !isTempOwner) {
      return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        applicationId,
        senderType: isAdmin ? "AGENT" : "CLIENT",
        senderUserId: session?.user?.id ?? null,
        content,
        messageType,
        attachmentUrl,
        attachmentName,
      },
    })

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
