"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Search,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Send,
  Paperclip,
  ArrowLeft,
} from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ApplicationData {
  id: string
  referenceCode: string
  status: string
  visaType: string
  destinationCountry: string
  createdAt: string
  updatedAt: string
  applicantName?: string
  notes?: string
}

interface Message {
  id: string
  content: string
  senderType: "CLIENT" | "AGENT"
  senderUser?: { fullName: string } | null
  createdAt: string
  messageType: string
  attachmentUrl?: string | null
  attachmentName?: string | null
}

// ── Status helpers ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "En attente",
    color: "text-yellow-400",
    bg: "bg-yellow-400/10 border-yellow-400/20",
    icon: <Clock className="w-4 h-4" />,
  },
  UNDER_REVIEW: {
    label: "En cours d'examen",
    color: "text-blue-400",
    bg: "bg-blue-400/10 border-blue-400/20",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  DOCUMENTS_REQUIRED: {
    label: "Documents requis",
    color: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/20",
    icon: <FileText className="w-4 h-4" />,
  },
  APPROVED: {
    label: "Approuvé",
    color: "text-green-400",
    bg: "bg-green-400/10 border-green-400/20",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  REJECTED: {
    label: "Refusé",
    color: "text-red-400",
    bg: "bg-red-400/10 border-red-400/20",
    icon: <XCircle className="w-4 h-4" />,
  },
  COMPLETED: {
    label: "Complété",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10 border-emerald-400/20",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
}

const STEPS = [
  { key: "PENDING", label: "Reçu" },
  { key: "UNDER_REVIEW", label: "Examen" },
  { key: "APPROVED", label: "Décision" },
  { key: "COMPLETED", label: "Complété" },
]

const STEP_ORDER = ["PENDING", "UNDER_REVIEW", "DOCUMENTS_REQUIRED", "APPROVED", "REJECTED", "COMPLETED"]

function getStepIndex(status: string) {
  if (status === "REJECTED") return 2
  if (status === "APPROVED" || status === "COMPLETED") return 3
  if (status === "UNDER_REVIEW" || status === "DOCUMENTS_REQUIRED") return 1
  return 0
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function TrackContent() {
  const searchParams = useSearchParams()
  const initialRef = searchParams.get("ref") ?? ""

  const [inputValue, setInputValue] = useState(initialRef)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [tempToken, setTempToken] = useState("")
  const [activeTab, setActiveTab] = useState<"status" | "messages">("status")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-search if ref in URL
  useEffect(() => {
    if (initialRef) {
      handleSearch(initialRef)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSearch(code?: string) {
    const ref = (code ?? inputValue).trim().toUpperCase()
    if (!ref) return
    setLoading(true)
    setError("")
    setApplication(null)
    setMessages([])
    try {
      const res = await fetch(`/api/applications/track?ref=${encodeURIComponent(ref)}`)
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? "Dossier introuvable. Vérifiez votre code de référence.")
        return
      }
      setApplication(json.data.application)
      setTempToken(json.data.tempAccessToken ?? "")
      // Charger messages
      loadMessages(json.data.application.id)
    } catch {
      setError("Erreur réseau. Réessayez.")
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(applicationId: string) {
    try {
      const res = await fetch(`/api/messages?applicationId=${applicationId}`)
      const json = await res.json()
      if (json.success) setMessages(json.data)
    } catch {
      // silent
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !application) return
    setSendingMessage(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: application.id,
          content: newMessage.trim(),
          tempAccessToken: tempToken,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setMessages((prev) => [...prev, json.data])
        setNewMessage("")
      }
    } catch {
      // silent
    } finally {
      setSendingMessage(false)
    }
  }

  const statusCfg = application ? (STATUS_CONFIG[application.status] ?? STATUS_CONFIG.PENDING) : null
  const stepIndex = application ? getStepIndex(application.status) : -1

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4 text-slate-600" />
          <span className="text-white font-medium">Suivi de dossier</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Search */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Suivre mon dossier</h1>
          <p className="text-slate-400">
            Entrez votre code de référence pour consulter l&apos;état de votre demande
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ex : VTN-2024-XXXX"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono tracking-wider"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !inputValue.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Rechercher
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Application found */}
        {application && statusCfg && (
          <div className="space-y-6">
            {/* Card header */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-800/50 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Référence</p>
                  <p className="text-lg font-mono font-bold text-white">{application.referenceCode}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${statusCfg.bg} ${statusCfg.color}`}
                >
                  {statusCfg.icon}
                  {statusCfg.label}
                </div>
              </div>

              {/* Details */}
              <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Type de visa</p>
                  <p className="font-medium">{application.visaType}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Destination</p>
                  <p className="font-medium">{application.destinationCountry}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Soumis le</p>
                  <p className="font-medium">
                    {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {application.applicantName && (
                  <div>
                    <p className="text-slate-500 mb-1">Demandeur</p>
                    <p className="font-medium">{application.applicantName}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500 mb-1">Dernière mise à jour</p>
                  <p className="font-medium">
                    {new Date(application.updatedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            {application.status !== "REJECTED" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h2 className="text-sm font-medium text-slate-400 mb-6">Progression</h2>
                <div className="relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-700" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-700"
                    style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {STEPS.map((step, i) => (
                      <div key={step.key} className="flex flex-col items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                            i <= stepIndex
                              ? "bg-blue-600 border-blue-600"
                              : "bg-slate-800 border-slate-700"
                          }`}
                        >
                          {i < stepIndex ? (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          ) : i === stepIndex ? (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            i <= stepIndex ? "text-blue-400" : "text-slate-600"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rejected banner */}
            {application.status === "REJECTED" && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-400 mb-1">Demande refusée</h3>
                  <p className="text-sm text-slate-400">
                    Votre demande a été refusée. Consultez les messages ci-dessous pour plus d&apos;informations
                    ou contactez-nous directement.
                  </p>
                </div>
              </div>
            )}

            {/* Notes from agent */}
            {application.notes && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                <p className="text-xs text-blue-400 uppercase tracking-wider mb-2 font-medium">
                  Message de l&apos;agence
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">{application.notes}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="flex border-b border-slate-800">
                <button
                  onClick={() => setActiveTab("status")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "status"
                      ? "text-white border-b-2 border-blue-500 bg-slate-800/30"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Détails du statut
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === "messages"
                      ? "text-white border-b-2 border-blue-500 bg-slate-800/30"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                  {messages.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {messages.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === "status" && (
                <div className="p-6">
                  <div className="space-y-3">
                    {STEP_ORDER.map((key) => {
                      const cfg = STATUS_CONFIG[key]
                      const isCurrent = application.status === key
                      const isPast =
                        STEP_ORDER.indexOf(key) < STEP_ORDER.indexOf(application.status)
                      return (
                        <div
                          key={key}
                          className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isCurrent
                              ? `${cfg.bg} border`
                              : isPast
                              ? "opacity-40"
                              : "opacity-20"
                          }`}
                        >
                          <span className={cfg.color}>{cfg.icon}</span>
                          <span
                            className={`text-sm font-medium ${
                              isCurrent ? cfg.color : "text-slate-400"
                            }`}
                          >
                            {cfg.label}
                          </span>
                          {isCurrent && (
                            <span className="ml-auto text-xs text-slate-500">Statut actuel</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {activeTab === "messages" && (
                <div className="flex flex-col h-[420px]">
                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                        <MessageSquare className="w-8 h-8" />
                        <p className="text-sm">Aucun message pour l&apos;instant</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.senderType === "CLIENT" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                              msg.senderType === "CLIENT"
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-slate-800 text-slate-200 rounded-bl-sm"
                            }`}
                          >
                            {msg.senderType === "AGENT" && (
                              <p className="text-xs text-slate-400 mb-1 font-medium">
                                {msg.senderUser?.fullName ?? "Agent VisaTN"}
                              </p>
                            )}
                            <p>{msg.content}</p>
                            {msg.attachmentUrl && (
                              <a
                                href={msg.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 mt-2 text-xs opacity-80 hover:opacity-100 underline"
                              >
                                <Paperclip className="w-3 h-3" />
                                {msg.attachmentName ?? "Pièce jointe"}
                              </a>
                            )}
                            <p
                              className={`text-xs mt-1 ${
                                msg.senderType === "CLIENT" ? "text-blue-200" : "text-slate-500"
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t border-slate-800 p-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Écrire un message…"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim()}
                      className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingMessage ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help footer */}
        <div className="text-center text-sm text-slate-600">
          Vous avez perdu votre code de référence ?{" "}
          <Link href="/contact" className="text-blue-400 hover:text-blue-300 underline">
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  )
}
