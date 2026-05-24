// GET /api/countries — Liste des pays actifs avec types de visas
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        visaTypes: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: {
            id: true, name: true, nameFr: true, category: true,
            durationDays: true, feeAgency: true, feeEmbassy: true,
            processingDaysMin: true, processingDaysMax: true,
          },
        },
      },
    })
    return NextResponse.json({ success: true, data: countries })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
