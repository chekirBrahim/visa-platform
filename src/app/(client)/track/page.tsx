"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search, ArrowLeft, Loader2, CheckCircle, Clock, XCircle, AlertCircle, FileText, MessageCircle } from "lucide-react"
import { getStatusLabel, getStatusColor, formatDate } from "@/lib/utils"

type Application = {
  id: string
  referenceCode: string
  status: string
  createdAt: string
  updatedAt: string
  visaType: {
    name: string
    nameFr: string
    country: { nameFr: string; flagEmoji: string }
  }
  stepHistory: Array<{
    status: string
    createdAt: string
    step: { name: string; nameFr: string; stepNumber: number }
  }>
  documents: Array<{ id: string; reviewStatus: string }>
}

function StatusIcon({ status }: { status: string }) {
  if (status === "APPROVED") return <CheckCircle className="w-5 h-5 text-emerald-400" />
  if (status === "REJECTED") return <XCircle className="w-5 h-5 text-red-400" />
  if (status === "UNDER_REVIEW") return <Clock className="w-5 h-5 text-yellow-400" />
  if (status === "DOCUMENTS_PENDING") return <AlertCircle className="w-5 h-5 text-orange-400" />
  return <Clock className="w-5 h-5 text-blue-400" />
}

export default function TrackPage() {
  const searchParams = useSearchParams()
  const [refCode, setRefCode] = useState(searchParams.get("ref") ?? "")
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (searchParams.get("ref")) {
      handleSearch()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault()
    if (!refCode.trim()) return
    setLoading(true)
    setError("")
    setSearched(true)

    try {
      const res = await fetch(`/api/applications?referenceCode=${refCode.trim().toUpperCase()}`)
      const data = await res.json()
      if (data.success && data.data.items?.length > 0) {
        setApplication(data.data.items[0])
      } else {
        setApplication(null)
        setError("Aucun dossier trouvé avec ce code. Vérifiez la saisie.")
      }
    } catch {
      setError("Erreur réseau. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Accueil</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-semibold">VisaTN</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Suivre mon dossier</h1>
          <p className="text-slate-400">Entrez votre code de référence pour voir l&apos;état de votre demande</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={refCode}
              onChange={e => setRefCode(e.target.value.toUpperCase())}
              placeholder="VIS-FR-2025-12345"
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3.5 text-sm font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button
              type="submit"
              disabled={loading || !refCode.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl px-6 flex items-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? "" : "Rechercher"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && searched && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {application && (
          <div className="space-y-4">
            {/* Status card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{application.visaType.country.flagEmoji}</div>
                  <div>
                    <h2 className="text-white font-semibold">{application.visaType.nameFr || application.visaType.name}</h2>
                    <p className="text-slate-400 text-sm">{application.visaType.country.nameFr}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium ${getStatusColor(application.status)}`}>
                  <StatusIcon status={application.status} />
                  {getStatusLabel(application.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-slate-600 text-xs mb-0.5">Référence</p>
                  <p className="text-white font-mono text-sm font-medium">{application.referenceCode}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-0.5">Soumis le</p>
                  <p className="text-slate-300 text-sm">{formatDate(application.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-0.5">Documents</p>
                  <p className="text-slate-300 text-sm">{application.documents?.length ?? 0} fichier(s)</p>
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-0.5">Dernière mise à jour</p>
                  <p className="text-slate-300 text-sm">{formatDate(application.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {application.stepHistory && application.stepHistory.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  Historique du dossier
                </h3>
                <div className="space-y-4">
                  {application.stepHistory.map((entry, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                        {i < application.stepHistory.length - 1 && (
                          <div className="w-px flex-1 bg-white/5 mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-white text-sm font-medium">{entry.step?.nameFr || entry.step?.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{formatDate(entry.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                className="bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl p-4 flex items-center gap-3 transition-all"
              >
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-sm">Mon espace</p>
                  <p className="text-slate-500 text-xs">Gérer mes dossiers</p>
                </div>
              </Link>
              <Link
                href="/login"
                className="bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-xl p-4 flex items-center gap-3 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="font-medium text-sm">Messagerie</p>
                  <p className="text-slate-500 text-xs">Contacter l&apos;agence</p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {!searched && (
          <div className="text-center text-slate-600 text-sm mt-4">
            <p>Votre code de référence vous a été envoyé après soumission de votre dossier</p>
            <p className="mt-1">Format : <span className="font-mono text-slate-500">VIS-FR-2025-XXXXX</span></p>
          </div>
        )}
      </div>
    </div>
  )
}
