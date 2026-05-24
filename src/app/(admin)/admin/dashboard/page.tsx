import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/client"
import Link from "next/link"
import {
  Users, FileText, CheckCircle, XCircle, Clock,
  TrendingUp, Shield, LogOut, Settings, ChevronRight
} from "lucide-react"
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils"

async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalApplications,
    pendingReview,
    approved,
    rejected,
    thisMonth,
    recentApplications,
    byStatus,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({
      where: { status: { in: ["SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING"] } },
    }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.application.count({ where: { status: "REJECTED" } }),
    prisma.application.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.application.findMany({
      take: 15,
      orderBy: { createdAt: "desc" },
      include: {
        visaType: { include: { country: true } },
        user: { select: { fullName: true, email: true } },
      },
    }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ])

  return { totalApplications, pendingReview, approved, rejected, thisMonth, recentApplications, byStatus }
}

const STATUS_OPTIONS = [
  "SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING", "APPROVED", "REJECTED", "DRAFT"
]

export default async function AdminDashboardPage() {
  const session = await auth()
  const isAdmin = (session?.user as { isAdmin?: boolean })?.isAdmin
  if (!isAdmin) redirect("/login")

  const data = await getDashboardData()

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-56 bg-slate-900 border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">VisaTN Admin</p>
              <p className="text-slate-500 text-xs">Backoffice</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: "/admin/dashboard", icon: TrendingUp, label: "Tableau de bord", active: true },
            { href: "/admin/applications", icon: FileText, label: "Dossiers" },
            { href: "/admin/clients", icon: Users, label: "Clients" },
            { href: "/admin/countries", icon: Shield, label: "Pays & Visas" },
            { href: "/admin/settings", icon: Settings, label: "Paramètres" },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                item.active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{session?.user?.email}</p>
              <p className="text-slate-500 text-xs">Administrateur</p>
            </div>
          </div>
          <Link
            href="/api/auth/signout"
            className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-red-400 text-sm transition-colors rounded-xl hover:bg-red-500/5"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-56">
        {/* Top bar */}
        <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl px-6 py-4">
          <h1 className="text-white text-lg font-semibold">Tableau de bord</h1>
        </div>

        <div className="p-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total dossiers", value: data.totalApplications, icon: FileText, color: "text-white", bg: "bg-white/5" },
              { label: "En attente", value: data.pendingReview, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/5" },
              { label: "Approuvés", value: data.approved, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/5" },
              { label: "Refusés", value: data.rejected, icon: XCircle, color: "text-red-400", bg: "bg-red-500/5" },
              { label: "Ce mois", value: data.thisMonth, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/5" },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} border border-white/10 rounded-xl p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 text-xs">{stat.label}</p>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent applications */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-semibold">Derniers dossiers</h2>
              <Link href="/admin/applications" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
                Voir tout <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Référence", "Client", "Destination", "Statut", "Date", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs text-slate-500 font-medium px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map(app => (
                    <tr key={app.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm text-slate-300">{app.referenceCode}</span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white text-sm">{app.user?.fullName ?? "Accès temporaire"}</p>
                        <p className="text-slate-500 text-xs">{app.user?.email ?? "—"}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span>{app.visaType.country.flagEmoji}</span>
                          <span className="text-slate-300 text-sm">{app.visaType.country.nameFr}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm">
                        {formatDate(app.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/applications/${app.id}`}
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors"
                        >
                          Voir <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.recentApplications.length === 0 && (
                <div className="text-center py-12 text-slate-600">
                  Aucun dossier pour le moment
                </div>
              )}
            </div>
          </div>

          {/* Status distribution */}
          {data.byStatus.length > 0 && (
            <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-white font-semibold mb-5">Répartition par statut</h2>
              <div className="space-y-3">
                {data.byStatus.map(item => {
                  const pct = data.totalApplications > 0
                    ? Math.round((item._count / data.totalApplications) * 100)
                    : 0
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300 text-sm">{getStatusLabel(item.status)}</span>
                        <span className="text-slate-400 text-sm">{item._count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
