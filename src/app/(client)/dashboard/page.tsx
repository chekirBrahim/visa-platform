import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/client"
import Link from "next/link"
import { formatDate, getStatusLabel } from "@/lib/utils"

async function getApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      visaType: { include: { country: true } },
      documents: { select: { id: true, reviewStatus: true } },
      stepHistory: { include: { step: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT:       "bg-gray-100 text-gray-600",
    SUBMITTED:   "bg-blue-50 text-blue-700",
    REVIEWING:   "bg-yellow-50 text-yellow-700",
    PENDING:     "bg-orange-50 text-orange-700",
    APPROVED:    "bg-green-50 text-green-700",
    REJECTED:    "bg-red-50 text-red-700",
    COMPLETED:   "bg-emerald-50 text-emerald-700",
    CANCELLED:   "bg-gray-100 text-gray-500",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {getStatusLabel(status)}
    </span>
  )
}

function StepProgress({ steps }: { steps: Array<{ status: string; step: { stepNumber: number; name: string } }> }) {
  const total = steps.length
  const done = steps.filter((s) => s.status === "COMPLETED").length
  const pct = total ? Math.round((done / total) * 100) : 0

  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{done}/{total} étapes</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const applications = await getApplications(session.user.id)

  const stats = {
    total:     applications.length,
    draft:     applications.filter((a) => a.status === "DRAFT").length,
    inProgress: applications.filter((a) => ["SUBMITTED", "REVIEWING", "PENDING"].includes(a.status)).length,
    approved:  applications.filter((a) => a.status === "APPROVED" || a.status === "COMPLETED").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top navbar ───────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-bold text-gray-900">Visa<span className="text-blue-600">TN</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {session.user.name}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Mes dossiers</h1>
            <p className="text-gray-500 text-sm mt-1">
              Bonjour, {session.user.name?.split(" ")[0]} — suivez et gérez vos demandes de visa
            </p>
          </div>
          <Link
            href="/application/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau dossier
          </Link>
        </div>

        {/* ── Stats cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total",        value: stats.total,       color: "text-gray-900" },
            { label: "Brouillons",   value: stats.draft,       color: "text-gray-500" },
            { label: "En cours",     value: stats.inProgress,  color: "text-blue-600" },
            { label: "Approuvés",    value: stats.approved,    color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Applications list ────────────────────────────── */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Aucun dossier</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Démarrez votre première demande de visa en quelques minutes.
            </p>
            <Link
              href="/application/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Créer mon premier dossier
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/dashboard/applications/${app.id}`}
                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Flag + info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="text-3xl flex-shrink-0 mt-0.5">
                      {/* Country flag emoji map */}
                      {(app.visaType?.country?.code === "FR" && "🇫🇷") ||
                       (app.visaType?.country?.code === "IT" && "🇮🇹") ||
                       (app.visaType?.country?.code === "DE" && "🇩🇪") ||
                       (app.visaType?.country?.code === "ES" && "🇪🇸") ||
                       (app.visaType?.country?.code === "US" && "🇺🇸") ||
                       (app.visaType?.country?.code === "CA" && "🇨🇦") ||
                       (app.visaType?.country?.code === "GB" && "🇬🇧") ||
                       (app.visaType?.country?.code === "AE" && "🇦🇪") ||
                       "🌍"}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {app.visaType?.country?.nameFr ?? "Pays inconnu"}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{app.visaType?.name ?? "Visa"}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400 font-mono">{app.referenceCode}</span>
                        <span className="text-gray-200 text-xs">|</span>
                        <span className="text-xs text-gray-400">
                          Créé le {formatDate(app.createdAt.toISOString())}
                        </span>
                        {app.travelDate && (
                          <>
                            <span className="text-gray-200 text-xs">|</span>
                            <span className="text-xs text-gray-400">
                              Départ: {formatDate(app.travelDate.toISOString())}
                            </span>
                          </>
                        )}
                      </div>
                      {app.stepHistory.length > 0 && (
                        <StepProgress steps={app.stepHistory} />
                      )}
                    </div>
                  </div>

                  {/* Status + arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={app.status} />
                    <svg
                      className="w-4 h-4 text-gray-300 group-hover:text-blue-400 transition-colors"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── AI Assistant banner ──────────────────────────── */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Assistant IA Visa</p>
              <p className="text-blue-100 text-xs">Posez vos questions sur les démarches visa 24h/24</p>
            </div>
          </div>
          <Link
            href="/dashboard/ai"
            className="flex-shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors backdrop-blur-sm"
          >
            Ouvrir →
          </Link>
        </div>

      </main>
    </div>
  )
}
