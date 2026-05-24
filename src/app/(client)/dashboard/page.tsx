import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/client"
import Link from "next/link"
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, LogOut, User } from "lucide-react"
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils"

async function getApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      visaType: { include: { country: true } },
      documents: { select: { id: true, reviewStatus: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

function StatusIcon({ status }: { status: string }) {
  if (status === "APPROVED") return <CheckCircle className="w-4 h-4 text-emerald-400" />
  if (status === "REJECTED") return <XCircle className="w-4 h-4 text-red-400" />
  if (status === "DOCUMENTS_PENDING") return <AlertCircle className="w-4 h-4 text-orange-400" />
  return <Clock className="w-4 h-4 text-blue-400" />
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as { id: string; name?: string | null; email?: string | null }
  const applications = await getApplications(user.id)

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ["SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING"].includes(a.status)).length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold">V</span>
            </div>
            <span className="text-white font-semibold">VisaTN</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <User className="w-4 h-4" />
              <span>{user.name ?? user.email}</span>
            </div>
            <Link
              href="/api/auth/signout"
              className="text-slate-500 hover:text-white transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-white text-2xl font-bold">
              Bonjour, {user.name?.split(" ")[0] ?? "Bonjour"} 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">Gérez vos demandes de visa</p>
          </div>
          <Link
            href="/application/new"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "En cours", value: stats.pending, color: "text-blue-400" },
            { label: "Approuvés", value: stats.approved, color: "text-emerald-400" },
            { label: "Refusés", value: stats.rejected, color: "text-red-400" },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-slate-500 text-xs mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Applications list */}
        <div>
          <h2 className="text-white font-semibold mb-4">Mes dossiers</h2>

          {applications.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Aucune demande</p>
              <p className="text-slate-500 text-sm mb-5">Commencez par déposer votre première demande de visa</p>
              <Link
                href="/application/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Nouvelle demande
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => (
                <Link
                  key={app.id}
                  href={`/dashboard/${app.id}`}
                  className="block bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/8 rounded-xl p-5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{app.visaType.country.flagEmoji}</div>
                      <div>
                        <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                          {app.visaType.nameFr || app.visaType.name}
                        </p>
                        <p className="text-slate-500 text-sm">{app.visaType.country.nameFr}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${getStatusColor(app.status)}`}>
                        <StatusIcon status={app.status} />
                        {getStatusLabel(app.status)}
                      </span>
                      <p className="text-slate-600 text-xs font-mono">{app.referenceCode}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                    <span>Soumis le {formatDate(app.createdAt)}</span>
                    <span>{app.documents?.length ?? 0} document(s)</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
