import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/client"
import Link from "next/link"
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, LogOut, User, ChevronRight } from "lucide-react"
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
  if (status === "APPROVED") return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
  if (status === "REJECTED") return <XCircle className="w-3.5 h-3.5 text-red-400" />
  if (status === "DOCUMENTS_PENDING") return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
  return <Clock className="w-3.5 h-3.5 text-teal-400" />
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = session.user as { id: string; name?: string | null; email?: string | null }
  const applications = await getApplications(user.id)

  const stats = {
    total:    applications.length,
    pending:  applications.filter(a => ["SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING"].includes(a.status)).length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
  }

  const firstName = user.name?.split(" ")[0] ?? "vous"

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
              <span className="text-slate-900 font-black text-sm">V</span>
            </div>
            <span className="font-bold text-base tracking-tight">
              Visa<span className="text-amber-400">TN</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-3 py-1.5">
              <div className="w-5 h-5 bg-amber-400/20 border border-amber-400/30 rounded-full flex items-center justify-center">
                <User className="w-2.5 h-2.5 text-amber-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">{user.name ?? user.email}</span>
            </div>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 transition-colors text-sm px-2 py-1.5 rounded-lg hover:bg-red-500/5"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block text-xs">Quitter</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Welcome ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-black tracking-tight">
                Bonjour, <span className="text-amber-400">{firstName}</span>
              </h1>
            </div>
            <p className="text-slate-500 text-sm">Gérez vos demandes de visa depuis votre espace personnel</p>
          </div>
          <Link
            href="/application/new"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl px-5 py-2.5 text-sm transition-all shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </Link>
        </div>

        {/* ── Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total dossiers",  value: stats.total,    color: "text-white",        bg: "bg-white/5",        border: "border-white/8",        icon: "📁" },
            { label: "En cours",        value: stats.pending,  color: "text-teal-400",     bg: "bg-teal-400/5",     border: "border-teal-400/15",    icon: "⏳" },
            { label: "Approuvés",       value: stats.approved, color: "text-emerald-400",  bg: "bg-emerald-400/5",  border: "border-emerald-400/15", icon: "✅" },
            { label: "Refusés",         value: stats.rejected, color: "text-red-400",      bg: "bg-red-400/5",      border: "border-red-400/15",     icon: "❌" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 transition-all hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Applications ─────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Mes dossiers</h2>
            {applications.length > 0 && (
              <span className="text-slate-600 text-sm">{applications.length} dossier{applications.length > 1 ? "s" : ""}</span>
            )}
          </div>

          {applications.length === 0 ? (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-white font-bold text-lg mb-2">Aucune demande pour le moment</p>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Commencez par déposer votre première demande de visa en quelques minutes</p>
              <Link
                href="/application/new"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl px-6 py-3 text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                Nouvelle demande
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map(app => (
                <Link
                  key={app.id}
                  href={`/dashboard/${app.id}`}
                  className="group flex items-center gap-4 bg-white/3 border border-white/8 hover:border-amber-400/20 hover:bg-white/5 rounded-2xl p-4 sm:p-5 transition-all"
                >
                  {/* Flag */}
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    {app.visaType.country.flagEmoji}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold text-sm group-hover:text-amber-300 transition-colors truncate">
                          {app.visaType.nameFr || app.visaType.name}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">{app.visaType.country.nameFr}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${getStatusColor(app.status)}`}>
                          <StatusIcon status={app.status} />
                          {getStatusLabel(app.status)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/5 text-xs text-slate-600">
                      <span className="font-mono text-amber-400/60">{app.referenceCode}</span>
                      <span>{formatDate(app.createdAt)} · {app.documents?.length ?? 0} doc(s)</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
