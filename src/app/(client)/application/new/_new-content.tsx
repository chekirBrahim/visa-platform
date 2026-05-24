"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, ArrowRight, Check, Upload, Loader2, FileText,
  X, AlertCircle,
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
    { key: "lastName", label: "Nom de famille", type: "text", required: true, placeholder: "BEN ALI" },
    { key: "firstName", label: "Prénom", type: "text", required: true, placeholder: "Mohamed" },
    { key: "birthDate", label: "Date de naissance", type: "date", required: true, placeholder: "" },
    { key: "birthPlace", label: "Lieu de naissance", type: "text", required: true, placeholder: "Tunis" },
    { key: "nationality", label: "Nationalité", type: "text", required: true, placeholder: "Tunisienne" },
    { key: "passportNumber", label: "Numéro de passeport", type: "text", required: true, placeholder: "A1234567" },
    { key: "passportExpiry", label: "Expiration passeport", type: "date", required: true, placeholder: "" },
    { key: "email", label: "Email", type: "email", required: true, placeholder: "email@exemple.com" },
    { key: "phone", label: "Téléphone", type: "tel", required: false, placeholder: "+216 XX XXX XXX" },
    { key: "address", label: "Adresse en Tunisie", type: "text", required: false, placeholder: "Rue, Ville" },
    { key: "travelDate", label: "Date de voyage prévue", type: "date", required: false, placeholder: "" },
    { key: "travelPurpose", label: "Motif du voyage", type: "text", required: false, placeholder: "Tourisme, Affaires..." },
  ]

  const requiredDocs = [
    { key: "passport", label: "Passeport (pages 1-5)", required: true },
    { key: "photo", label: "Photo biométrique", required: true },
    { key: "bankStatement", label: "Relevé bancaire (3 derniers mois)", required: true },
    { key: "hotelBooking", label: "Réservation d'hôtel", required: selectedCountry?.code !== "US" },
    { key: "flightBooking", label: "Réservation de vol", required: selectedCountry?.code !== "US" },
    { key: "insurancePDF", label: "Assurance voyage", required: selectedCountry?.code === "FR" || selectedCountry?.code === "IT" || selectedCountry?.code === "DE" || selectedCountry?.code === "ES" },
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
          formTemplateId: selectedVisaType?.id, // Simplified
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  // Success screen
  if (step === 4) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-white text-2xl font-bold mb-2">Dossier soumis !</h1>
          <p className="text-slate-400 mb-6">Votre demande a été enregistrée avec succès.</p>
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-5 mb-6">
            <p className="text-slate-400 text-sm mb-1">Votre code de suivi</p>
            <p className="text-white text-2xl font-mono font-bold">{referenceCode}</p>
            <p className="text-slate-500 text-xs mt-2">Conservez ce code pour suivre votre dossier</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href={`/track?ref=${referenceCode}`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl py-3 transition-all"
            >
              Suivre mon dossier
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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-white font-semibold">VisaTN</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i < step ? "bg-emerald-500 text-white" :
                    i === step ? "bg-blue-600 text-white" :
                    "bg-white/5 text-slate-500"
                  }`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 hidden sm:block ${i === step ? "text-white" : "text-slate-500"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 ${i < step ? "bg-emerald-500/50" : "bg-white/5"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 0 — Country & visa type */}
        {step === 0 && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Choisissez votre destination</h1>
            <p className="text-slate-400 text-sm mb-8">Sélectionnez le pays et le type de visa souhaité</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {countries.map(country => (
                <button
                  key={country.id}
                  onClick={() => { setSelectedCountry(country); setSelectedVisaType(null) }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedCountry?.id === country.id
                      ? "border-blue-500 bg-blue-600/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="text-3xl mb-2">{country.flagEmoji}</div>
                  <div className="text-white font-medium text-sm">{country.nameFr}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{country.visaTypes?.length} type(s)</div>
                </button>
              ))}
            </div>

            {selectedCountry && selectedCountry.visaTypes?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-semibold mb-3">Type de visa</h2>
                <div className="space-y-2">
                  {selectedCountry.visaTypes.map(vt => (
                    <button
                      key={vt.id}
                      onClick={() => setSelectedVisaType(vt)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedVisaType?.id === vt.id
                          ? "border-blue-500 bg-blue-600/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="text-white font-medium">{vt.nameFr || vt.name}</div>
                        <div className="text-slate-500 text-sm mt-0.5">Délai : {vt.processingDaysMin}–{vt.processingDaysMax} jours</div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 font-semibold">{Number(vt.feeAgency)} TND</div>
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
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 flex items-center justify-center gap-2 transition-all"
            >
              Continuer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 1 — Personal information */}
        {step === 1 && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Informations personnelles</h1>
            <p className="text-slate-400 text-sm mb-8">
              Visa {selectedVisaType?.nameFr} — {selectedCountry?.nameFr} {selectedCountry?.flagEmoji}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {infoFields.map(field => (
                <div key={field.key} className={field.key === "address" || field.key === "travelPurpose" ? "sm:col-span-2" : ""}>
                  <label className="block text-sm text-slate-300 mb-1.5 font-medium">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    required={field.required}
                    value={formData[field.key] ?? ""}
                    onChange={e => setFormData(f => ({ ...f, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Documents */}
        {step === 2 && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Documents requis</h1>
            <p className="text-slate-400 text-sm mb-8">Téléchargez vos documents en PDF ou JPEG (max 5 MB chacun)</p>

            <div className="space-y-3 mb-8">
              {requiredDocs.filter(d => d.required !== false).map(doc => (
                <div key={doc.key} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span className="text-white text-sm font-medium">{doc.label}</span>
                      {doc.required && <span className="text-red-400 text-xs">*</span>}
                    </div>
                    {files[doc.key] && (
                      <button
                        onClick={() => setFiles(f => { const n = { ...f }; delete n[doc.key]; return n })}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {files[doc.key] ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm">{files[doc.key].name}</span>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-lg px-4 py-5 text-center transition-all">
                        <Upload className="w-5 h-5 text-slate-600 mx-auto mb-1.5" />
                        <p className="text-slate-500 text-xs">Cliquez pour uploader ou glissez votre fichier</p>
                        <p className="text-slate-600 text-xs mt-0.5">PDF, JPG, PNG — max 5 MB</p>
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

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 flex gap-3">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-blue-300 text-sm">
                Les documents peuvent aussi être envoyés après la soumission depuis votre espace client.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
              >
                Continuer <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div>
            <h1 className="text-white text-2xl font-bold mb-1">Confirmer votre demande</h1>
            <p className="text-slate-400 text-sm mb-8">Vérifiez les informations avant de soumettre</p>

            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{selectedCountry?.flagEmoji}</div>
                <div>
                  <p className="text-white font-semibold">{selectedVisaType?.nameFr}</p>
                  <p className="text-slate-400 text-sm">{selectedCountry?.nameFr}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-blue-400 font-semibold">{selectedVisaType ? Number(selectedVisaType.feeAgency) : ""} TND</p>
                  <p className="text-slate-500 text-xs">{selectedVisaType?.processingDaysMin}–{selectedVisaType?.processingDaysMax}j de traitement</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 grid grid-cols-2 gap-y-2">
                {Object.entries(formData).slice(0, 6).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-slate-600 text-xs capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <p className="text-slate-300 text-sm">{val || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
              <p className="text-slate-400 text-sm font-medium mb-3">Documents téléchargés ({Object.keys(files).length})</p>
              {Object.keys(files).length === 0 ? (
                <p className="text-slate-600 text-sm">Aucun document — vous pourrez les ajouter depuis votre espace</p>
              ) : (
                <div className="space-y-1.5">
                  {Object.entries(files).map(([key, file]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300 text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <>Soumettre <Check className="w-4 h-4" /></>}
              </button>
            </div>

            <p className="text-center text-slate-600 text-xs mt-4">
              En soumettant, vous acceptez nos conditions générales de service
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
