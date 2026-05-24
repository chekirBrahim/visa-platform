// GET /api/admin/dashboard — Statistiques tableau de bord
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db/client"

export async function GET() {
  const session = await auth()
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Accès refusé" }, { status: 403 })
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalApplications,
      pendingReview,
      approved,
      rejected,
      thisMonth,
      byStatus,
      byCountry,
      recentApplications,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING"] } } }),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.application.count({ where: { status: "REJECTED" } }),
      prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.application.groupBy({ by: ["status"], _count: true }),
      prisma.application.groupBy({
        by: ["visaTypeId"],
        _count: true,
        orderBy: { _count: { visaTypeId: "desc" } },
        take: 5,
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          visaType: { include: { country: true } },
          user: { select: { fullName: true, email: true } },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats: { totalApplications, pendingReview, approved, rejected, thisMonth },
        byStatus,
        byCountry,
        recentApplications,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
