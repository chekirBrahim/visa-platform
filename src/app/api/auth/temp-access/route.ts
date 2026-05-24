// ============================================================
// POST /api/auth/temp-access — Accès sans compte via OTP
// ============================================================
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { tempAccessSchema } from "@/lib/validations/auth"
import crypto from "crypto"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = tempAccessSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 })
    }

    const { identifier, identifierType } = parsed.data
    const otp = generateOtp()
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours

    // Créer ou mettre à jour l'accès temporaire
    await prisma.tempAccess.upsert({
      where: { identifier },
      update: {
        otpCode: otpHash,
        otpExpiresAt,
        tokenExpiresAt,
        isActive: true,
      },
      create: {
        identifier,
        identifierType,
        otpCode: otpHash,
        otpExpiresAt,
        tokenExpiresAt,
        isActive: true,
      },
    })

    // TODO: Envoyer le code OTP par email ou SMS
    // await sendOtpEmail(identifier, otp)
    // await sendOtpSms(identifier, otp)

    // En développement, retourner le code (à retirer en production !)
    const isDev = process.env.NODE_ENV === "development"

    return NextResponse.json({
      success: true,
      data: {
        message: `Code envoyé à ${identifier}`,
        expiresAt: otpExpiresAt,
        // DÉVELOPPEMENT UNIQUEMENT
        ...(isDev ? { devCode: otp } : {}),
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
