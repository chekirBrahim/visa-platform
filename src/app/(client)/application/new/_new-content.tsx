"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, ArrowRight, Check, Upload, Loader2, FileText, X, AlertCircle,
} from "lucide-react"

type Country = {
  id: string
  code: string
  nameFr: string
  flagEmoji: string
  visaTypes: VisaType[]
}

type VisaType = {
  id: string
  name: string
  nameFr: string
  category: string
  processingDaysMin: number
  processingDaysMax: number
  feeAgency: number
  feeEmbassy: number
  feeCurrency: string
  durationDays: number | null
}

const STEPS = ["Pays & visa", "Informations", "Documents", "Confirmation"]

export default function NewApplicationContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [files, setFiles] = useState<Record<string, File>>({})
  const [referenceCode, setReferenceCode] = useState("")

  useEffect(() => {
    fetch("/api/countries")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCountries(data.data)
          const countryCode = searchParams.get("country")
          if (countryCode) {
            const found = data.data.find((c: Country) => c.code === countryCode.toUpperCase())
            if (found) {
              setSelectedCountry(found)
              if (found.visaTypes?.length === 1) setSelectedVisaType(found.visaTypes[0])
            }
          }
        }
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  const infoFields = [
    { key: "lastName",       label: "Nom de famille",           type: "text",  required: true,  placeholder: "BEN ALI" },
    { key: "firstName",      label: "Prénom",                   type: "text",  required: true,  placeholder: "Mohamed" },
    { key: "birthDate",      label: "Date de naissance",        type: "date",  required: true,  placeholder: "" },
    { key: "birthPlace",     label: "Lieu de naissance",        type: "text",  required: true,  placeholder: "Tunis" },
    { key: "nationality",    label: "Nationalité",              type: "text",  required: true,  placeholder: "Tunisienne" },
    { key: "passportNumber", label: "N° de passeport",          type: "text",  required: true,  placeholder: "A1234567" },
    { key: "passportExpiry", label: "Expiration passeport",     type: "date",  required: true,  placeholder: "" },
    { key: "email",          label: "Email",                    type: "email", required: true,  placeholder: "email@exemple.com" },
    { key: "phone",          label: "Téléphone",                type: "tel",   required: false, placeholder: "+216 XX XXX XXX" },
    { key: "address",        label: "Adresse en Tunisie",       type: "text",  required: false, placeholder: "Rue, Ville" },
    { key: "travelDate",     label: "Date de voyage prévue",    type: "date",  required: false, placeholder: "" },
    { key: "travelPurpose",  label: "Motif du voyage",          type: "text",  required: false, placeholder: "Tourisme, Affaires..." },
  ]

  const requiredDocs = [
    { key: "passport",      label: "Passeport (pages 1-5)",          required: true },
    { key: "photo",         label: "Photo biométrique",               required: true },
    { key: "bankStatement", label: "Relevé bancaire (3 mois)",        required: true },
    { key: "hotelBooking",  label: "Réservation d'hôtel",             required: selectedCountry?.code !== "US" },
    { key: "flightBooking", label: "Réservation de vol",              required: selectedCountry?.code !== "US" },
    { key: "insurancePDF",  label: "Assurance voyage",                required: ["FR","IT","DE","ES"].includes(selectedCountry?.code ?? "") },
  ]

  async function handleSubmit() {
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visaTypeId: selectedVisaType?.id,
          formTemplateId: selectedVisaType?.id,
          formData,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setReferenceCode(data.data.referenceCode)
        setStep(4)
      } else {
        setError(data.error || "Erreur lors de la soumission")
      }
    } catch {
      setError("Erreur réseau. Veuillez réessayer.")
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-slate-500 text-sm">Chargement des destinations...</p>
        </div>
      </div>
    )
  }

  /* ── Success ─────────────────────────────────────────── */
  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-white text-3xl font-black tracking-tight mb-2">Dossier soumis !</h1>
          <p className="text-slate-400 mb-8">Votre demande a été enregistrée avec succès.</p>

          <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-6 mb-6">
            <p className="text-slate-500 text-sm mb-2">Votre code de suivi</p>
            <p className="text-amber-400 text-3xl font-mono font-black tracking-wider">{referenceCode}</p>
            <p className="text-slate-600 text-xs mt-2">Conservez ce code pour suivre votre dossier à tout moment</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/track?ref=${referenceCode}`}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl py-3.5 transition-all shadow-lg shadow-amber-500/20"
            >
              Suivre mon dossier →
            </Link>
            <Link
              href="/"
              className="border border-white/10 hover:border-white/20 text-slate-400 hover:text-white font-medium rounded-xl py-3 transition-all"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Main ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Retour</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-slate-900 font-black text-xs">V</span>
            </div>
            <span className="text-white font-bold">Visa<span className="text-amber-400">TN</span></span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    i < step  ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-400" :
                    i === step ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/30" :
                    "bg-white/5 border border-white/10 text-slate-600"
                  }`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 hidden sm:block font-medium ${
                    i === step ? "text-amber-400" : i < step ? "text-emerald-400" : "text-slate-600"
                  }`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-all ${i < step ? "bg-emerald-400/40" : "bg-white/8"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 0 — Pays & visa ───────────────────────── */}
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Choisissez votre destination</h1>
            <p className="text-slate-400 text-sm mb-8">Sélectionnez le pays et le type de visa souhaité</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {countries.map(country => (
                <button
                  key={country.id}
                  onClick={() => { setSelectedCountry(country); setSelectedVisaType(null) }}
                  className={`group p-4 rounded-2xl border text-left transition-all hover:-translate-y-0.5 ${
                    selectedCountry?.id === country.id
                      ? "border-amber-400/50 bg-amber-400/8 shadow-lg shadow-amber-400/10"
                      : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                  }`}
                >
                  <div className="text-3xl mb-2.5">{country.flagEmoji}</div>
                  <div className="text-white font-semibold text-sm">{country.nameFr}</div>
                  <div className="text-slate-600 text-xs mt-0.5">{country.visaTypes?.length} type(s)</div>
                  {selectedCountry?.id === country.id && (
                    <div className="mt-2 flex items-center gap-1 text-amber-400 text-xs font-semibold">
                      <Check className="w-3 h-3" /> Sélectionné
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedCountry && selectedCountry.visaTypes?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-bold mb-3 text-base">Type de visa pour {selectedCountry.nameFr}</h2>
                <div className="space-y-2">
                  {selectedCountry.visaTypes.map(vt => (
                    <button
                      key={vt.id}
                      onClick={() => setSelectedVisaType(vt)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        selectedVisaType?.id === vt.id
                          ? "border-teal-400/40 bg-teal-400/5"
                          : "border-white/8 bg-white/3 hover:border-white/15"
                      }`}
                    >
                      <div>
                        <div className="text-white font-semibold text-sm">{vt.nameFr || vt.name}</div>
                        <div className="text-slate-500 text-xs mt-0.5">
                          Délai : {vt.processingDaysMin}–{vt.processingDaysMax} jours
                          {vt.durationDays ? ` · Validité : ${vt.durationDays}j` : ""}
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className={`font-bold text-sm ${selectedVisaType?.id === vt.id ? "text-teal-400" : "text-amber-400"}`}>
                          {Number(vt.feeAgency)} TND
                        </div>
                        <div className="text-slate-600 text-xs">frais agence</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              disabled={!selectedCountry || !selectedVisaType}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-30 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/20 hover:-translate-y-0.5"
            >
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 1 — Informations ─────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Informations personnelles</h1>
            <p className="text-slate-400 text-sm mb-8">
              {selectedVisaType?.nameFr} — {selectedCountry?.nameFr} {selectedCountry?.flagEmoji}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {infoFields.map(field => (
                <div key={field.key} className={field.key === "address" || field.key === "travelPurpose" ? "sm:col-span-2" : ""}>
                  <label className="block text-sm text-slate-300 mb-1.5 font-medium">
                    {field.label}
                    {field.required && <span className="text-amber-400 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    value={formData[field.key] ?? ""}
                    onChange={e => setFormData(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/8 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all hover:border-white/15"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-xl py-3.5 font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/20"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 — Documents ────────────────────────── */}
        {step === 2 && (
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Documents requis</h1>
            <p className="text-slate-400 text-sm mb-8">PDF ou JPEG — max 5 MB par fichier</p>

            <div className="space-y-3 mb-6">
              {requiredDocs.filter(d => d.required !== false).map(doc => (
                <div key={doc.key} className="bg-white/3 border border-white/8 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-white text-sm font-medium">{doc.label}</span>
                      {doc.required && <span className="text-amber-400 text-xs">*</span>}
                    </div>
                    {files[doc.key] && (
                      <button
                        onClick={() => setFiles(f => { const n = { ...f }; delete n[doc.key]; return n })}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {files[doc.key] ? (
                    <div className="bg-emerald-400/8 border border-emerald-400/20 rounded-xl px-3 py-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 text-sm truncate">{files[doc.key].name}</span>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-white/8 hover:border-amber-400/30 hover:bg-amber-400/3 rounded-xl px-4 py-5 text-center transition-all">
                        <Upload className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                        <p className="text-slate-500 text-xs">Cliquez pour uploader</p>
                        <p className="text-slate-700 text-xs mt-0.5">PDF, JPG, PNG — max 5 MB</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) setFiles(f => ({ ...f, [doc.key]: file }))
                        }}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-teal-400/5 border border-teal-400/15 rounded-2xl p-4 mb-6 flex gap-3">
              <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
              <p className="text-teal-300/80 text-sm">
                Les documents peuvent aussi être envoyés après la soumission depuis votre espace client.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-xl py-3.5 font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/20"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Confirmation ─────────────────────── */}
        {step === 3 && (
          <div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Confirmer votre demande</h1>
            <p className="text-slate-400 text-sm mb-8">Vérifiez les informations avant de soumettre</p>

            {/* Résumé visa */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-4">
              <div className="flex items-center gap-4 pb-4 border-b border-white/5 mb-4">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {selectedCountry?.flagEmoji}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">{selectedVisaType?.nameFr}</p>
                  <p className="text-slate-400 text-sm">{selectedCountry?.nameFr}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-black text-lg">{selectedVisaType ? Number(selectedVisaType.feeAgency) : ""} TND</p>
                  <p className="text-slate-600 text-xs">{selectedVisaType?.processingDaysMin}–{selectedVisaType?.processingDaysMax}j de traitement</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {Object.entries(formData).slice(0, 6).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-slate-600 text-xs capitalize mb-0.5">{key.replace(/([A-Z])/g, " $1").toLowerCase()}</p>
                    <p className="text-slate-300 text-sm font-medium">{val || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 mb-5">
              <p className="text-slate-400 text-sm font-medium mb-3">
                Documents ({Object.keys(files).length})
              </p>
              {Object.keys(files).length === 0 ? (
                <p className="text-slate-600 text-sm">Aucun — vous pourrez les ajouter depuis votre espace client</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(files).map(([key, file]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm truncate">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-xl py-3.5 font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-900 font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-400/20"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                  : <><Check className="w-4 h-4" /> Soumettre ma demande</>
                }
              </button>
            </div>

            <p className="text-center text-slate-700 text-xs mt-4">
              En soumettant, vous acceptez nos conditions générales de service
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
