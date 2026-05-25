// POST /api/auth/register — Création de compte
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { registerSchema } from "@/lib/validations/auth"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { fullName, email, phone, password, nationality } = parsed.data

    // Vérifier si l'email ou téléphone existe déjà
    if (email) {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) {
        return NextResponse.json(
          { success: false, error: "Cet email est déjà utilisé" },
          { status: 409 }
        )
      }
    }

    if (phone) {
      const exists = await prisma.user.findUnique({ where: { phone } })
      if (exists) {
        return NextResponse.json(
          { success: false, error: "Ce téléphone est déjà utilisé" },
          { status: 409 }
        )
      }
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email ?? null,
        phone: phone ?? null,
        passwordHash,
        nationality: nationality ?? null,
        accountType: "FULL",
        isVerified: false,
      },
      select: { id: true, email: true, phone: true, fullName: true, createdAt: true },
    })

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[Register] Error:", msg)
    return NextResponse.json({ success: false, error: "Erreur serveur", detail: msg }, { status: 500 })
  }
}
