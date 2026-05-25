"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Country {
  id: string
  code: string
  nameFr: string
  visaTypes: VisaType[]
}

interface VisaType {
  id: string
  name: string
  description: string | null
  processingDays: number | null
  fee: number | null
}

interface FormTemplate {
  id: string
  fields: FormField[]
}

interface FormField {
  id: string
  fieldKey: string
  labelFr: string
  fieldType: string
  isRequired: boolean
  options: unknown
  placeholder: string | null
  sortOrder: number
}

// ── Step indicator ────────────────────────────────────────
function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const step = i + 1
        const isCompleted = step < current
        const isActive = step === current
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                isCompleted ? "bg-blue-600 text-white" :
                isActive ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                "bg-gray-100 text-gray-400"
              }`}>
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : step}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                isActive ? "text-blue-600" : isCompleted ? "text-blue-400" : "text-gray-400"
              }`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 mb-5 rounded-full ${step < current ? "bg-blue-500" : "bg-gray-200"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Dynamic form field ────────────────────────────────────
function DynamicField({ field, value, onChange }: {
  field: FormField
  value: string
  onChange: (key: string, val: string) => void
}) {
  const base = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
  const opts: string[] = Array.isArray(field.options)
    ? field.options as string[]
    : typeof field.options === "string"
      ? JSON.parse(field.options as string)
      : []

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {field.labelFr}
        {field.isRequired && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.fieldType === "SELECT" ? (
        <select value={value} onChange={(e) => onChange(field.fieldKey, e.target.value)} required={field.isRequired} className={base}>
          <option value="">Sélectionner…</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.fieldType === "TEXTAREA" ? (
        <textarea value={value} onChange={(e) => onChange(field.fieldKey, e.target.value)} placeholder={field.placeholder ?? ""} required={field.isRequired} rows={3} className={`${base} resize-none`} />
      ) : field.fieldType === "DATE" ? (
        <input type="date" value={value} onChange={(e) => onChange(field.fieldKey, e.target.value)} required={field.isRequired} className={base} />
      ) : (
        <input
          type={field.fieldType === "EMAIL" ? "email" : field.fieldType === "PHONE" ? "tel" : "text"}
          value={value}
          onChange={(e) => onChange(field.fieldKey, e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.isRequired}
          className={base}
        />
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────
export default function NewApplicationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCountry = searchParams.get("country")

  const [step, setStep] = useState(1)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(null)
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null)
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [travelDate, setTravelDate] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const FLAGS: Record<string, string> = { FR:"🇫🇷", IT:"🇮🇹", DE:"🇩🇪", ES:"🇪🇸", US:"🇺🇸", CA:"🇨🇦", GB:"🇬🇧", AE:"🇦🇪", TR:"🇹🇷", CN:"🇨🇳" }

  useEffect(() => {
    fetch("/api/countries?includeVisaTypes=true")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setCountries(data.data)
          if (preselectedCountry) {
            const found = data.data.find((c: Country) => c.code === preselectedCountry)
            if (found) setSelectedCountry(found)
          }
        }
      })
  }, [preselectedCountry])

  useEffect(() => {
    if (!selectedVisaType) return
    setLoadingTemplate(true)
    setFormTemplate(null)
    fetch(`/api/form-templates?visaTypeId=${selectedVisaType.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.[0]) setFormTemplate(data.data[0])
      })
      .catch(console.error)
      .finally(() => setLoadingTemplate(false))
  }, [selectedVisaType])

  function handleField(key: string, val: string) {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    if (!selectedVisaType || !formTemplate) return
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visaTypeId: selectedVisaType.id,
          formTemplateId: formTemplate.id,
          formData,
          travelDate: travelDate || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error ?? "Erreur lors de la création du dossier")
      else router.push(`/dashboard`)
    } catch {
      setError("Une erreur est survenue. Réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  const STEPS = ["Destination", "Type de visa", "Formulaire", "Confirmation"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Mes dossiers
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-bold text-sm text-gray-900">Visa<span className="text-blue-600">TN</span></span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Nouvelle demande de visa</h1>
          <p className="text-gray-500 text-sm">Remplissez les informations ci-dessous pour créer votre dossier</p>
        </div>

        <StepIndicator current={step} steps={STEPS} />

        {/* ── Étape 1 : Destination ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Choisissez votre destination</h2>
            {countries.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Chargement…
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {countries.map((c) => (
                  <button key={c.id} onClick={() => setSelectedCountry(c)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${selectedCountry?.id === c.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-200 bg-white"}`}>
                    <span className="text-3xl mb-2">{FLAGS[c.code] ?? "🌍"}</span>
                    <span className={`text-xs font-semibold ${selectedCountry?.id === c.id ? "text-blue-700" : "text-gray-700"}`}>{c.nameFr}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={() => setStep(2)} disabled={!selectedCountry}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 2 : Type de visa ── */}
        {step === 2 && selectedCountry && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-base font-semibold text-gray-900">Type de visa — {selectedCountry.nameFr}</h2>
            </div>
            {selectedCountry.visaTypes.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">Aucun type de visa disponible pour cette destination.</p>
            ) : (
              <div className="space-y-3">
                {selectedCountry.visaTypes.map((vt) => (
                  <button key={vt.id} onClick={() => setSelectedVisaType(vt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedVisaType?.id === vt.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-200 bg-white"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`font-semibold text-sm ${selectedVisaType?.id === vt.id ? "text-blue-700" : "text-gray-900"}`}>{vt.name}</p>
                        {vt.description && <p className="text-xs text-gray-500 mt-0.5">{vt.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        {vt.fee && <p className="text-sm font-bold text-gray-900">{vt.fee} €</p>}
                        {vt.processingDays && <p className="text-xs text-gray-400">{vt.processingDays} jours</p>}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm">← Retour</button>
              <button onClick={() => setStep(3)} disabled={!selectedVisaType}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Formulaire ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-base font-semibold text-gray-900">Informations du demandeur</h2>
            </div>

            {loadingTemplate ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Chargement du formulaire…
              </div>
            ) : formTemplate ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date de voyage prévue <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <input type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white" />
                </div>
                {formTemplate.fields.map((field) => (
                  <DynamicField key={field.id} field={field} value={formData[field.fieldKey] ?? ""} onChange={handleField} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-red-500">Impossible de charger le formulaire. Réessayez.</p>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm">← Retour</button>
              <button onClick={() => setStep(4)} disabled={!formTemplate}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 4 : Confirmation ── */}
        {step === 4 && selectedCountry && selectedVisaType && formTemplate && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(3)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <h2 className="text-base font-semibold text-gray-900">Confirmer votre dossier</h2>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6 space-y-3">
              {[
                { label: "Destination",       value: selectedCountry.nameFr },
                { label: "Type de visa",       value: selectedVisaType.name },
                ...(selectedVisaType.fee        ? [{ label: "Frais consulaires",   value: `${selectedVisaType.fee} €` }] : []),
                ...(selectedVisaType.processingDays ? [{ label: "Délai de traitement", value: `${selectedVisaType.processingDays} jours` }] : []),
                ...(travelDate ? [{ label: "Date de voyage", value: new Date(travelDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) }] : []),
                { label: "Champs remplis", value: `${Object.values(formData).filter(Boolean).length} / ${formTemplate.fields.length}` },
              ].map((row, i, arr) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{row.value}</span>
                  </div>
                  {i < arr.length - 1 && <div className="h-px bg-gray-100 mt-3" />}
                </div>
              ))}
            </div>

            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-700">
                Votre dossier sera créé en statut <strong>Brouillon</strong>. Vous pourrez compléter vos documents depuis votre tableau de bord.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm">← Retour</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Création…
                  </span>
                ) : "Créer mon dossier ✓"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
