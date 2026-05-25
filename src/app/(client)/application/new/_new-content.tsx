"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────
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
  name: string
  fields: FormField[]
}

interface FormField {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  options: string[] | null
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
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isActive
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  isActive ? "text-blue-600" : isCompleted ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                  step < current ? "bg-blue-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Dynamic form field renderer ───────────────────────────
function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: string
  onChange: (name: string, val: string) => void
}) {
  const base =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>

      {field.type === "SELECT" && field.options ? (
        <select
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
          className={base}
        >
          <option value="">Sélectionner…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === "TEXTAREA" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          rows={3}
          className={`${base} resize-none`}
        />
      ) : field.type === "DATE" ? (
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          required={field.required}
          className={base}
        />
      ) : (
        <input
          type={field.type === "EMAIL" ? "email" : field.type === "PHONE" ? "tel" : "text"}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          placeholder={field.placeholder ?? ""}
          required={field.required}
          className={base}
        />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function NewApplicationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCountry = searchParams.get("country")

  const [step, setStep] = useState(1)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedVisaType, setSelectedVisaType] = useState<VisaType | null>(null)
  const [formTemplate, setFormTemplate] = useState<FormTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [travelDate, setTravelDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Load countries
  useEffect(() => {
    fetch("/api/countries?includeVisaTypes=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCountries(data.data)
          if (preselectedCountry) {
            const found = data.data.find((c: Country) => c.code === preselectedCountry)
            if (found) setSelectedCountry(found)
          }
        }
      })
      .catch(console.error)
  }, [preselectedCountry])

  // Load form template when visa type selected
  useEffect(() => {
    if (!selectedVisaType) return
    setLoading(true)
    fetch(`/api/form-templates?visaTypeId=${selectedVisaType.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.[0]) {
          setFormTemplate(data.data[0])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [selectedVisaType])

  function handleFieldChange(name: string, value: string) {
    setFormData((prev) => ({ ...prev, [name]: value }))
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
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la création du dossier")
      } else {
        router.push(`/dashboard/applications/${data.data.id}?created=1`)
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  const STEPS = ["Destination", "Type de visa", "Formulaire", "Confirmation"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
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
        {/* Page title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Nouvelle demande de visa</h1>
          <p className="text-gray-500 text-sm">Remplissez les informations ci-dessous pour créer votre dossier</p>
        </div>

        {/* Step indicator */}
        <StepIndicator current={step} steps={STEPS} />

        {/* ── Step 1: Choose country ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Choisissez votre destination</h2>

            {countries.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Chargement des destinations…
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {countries.map((c) => {
                  const flags: Record<string, string> = { FR:"🇫🇷", IT:"🇮🇹", DE:"🇩🇪", ES:"🇪🇸", US:"🇺🇸", CA:"🇨🇦", GB:"🇬🇧", AE:"🇦🇪", TR:"🇹🇷" }
                  const isSelected = selectedCountry?.id === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCountry(c)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-100 hover:border-blue-200 bg-white"
                      }`}
                    >
                      <span className="text-3xl mb-2">{flags[c.code] ?? "🌍"}</span>
                      <span className={`text-xs font-semibold ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                        {c.nameFr}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedCountry}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Choose visa type ── */}
        {step === 2 && selectedCountry && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-semibold text-gray-900">
                Type de visa — {selectedCountry.nameFr}
              </h2>
            </div>

            {selectedCountry.visaTypes.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                Aucun type de visa disponible pour cette destination.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedCountry.visaTypes.map((vt) => {
                  const isSelected = selectedVisaType?.id === vt.id
                  return (
                    <button
                      key={vt.id}
                      onClick={() => setSelectedVisaType(vt)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-100 hover:border-blue-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`font-semibold text-sm ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                            {vt.name}
                          </p>
                          {vt.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{vt.description}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {vt.fee && (
                            <p className="text-sm font-bold text-gray-900">{vt.fee} €</p>
                          )}
                          {vt.processingDays && (
                            <p className="text-xs text-gray-400">{vt.processingDays} jours</p>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!selectedVisaType}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Fill form ── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(2)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-semibold text-gray-900">Informations du demandeur</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Chargement du formulaire…
              </div>
            ) : formTemplate ? (
              <div className="space-y-4">
                {/* Travel date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date de voyage prévue
                    <span className="text-gray-400 font-normal ml-1">(optionnel)</span>
                  </label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white"
                  />
                </div>

                {/* Dynamic fields */}
                {formTemplate.fields.map((field) => (
                  <DynamicField
                    key={field.id}
                    field={field}
                    value={formData[field.name] ?? ""}
                    onChange={handleFieldChange}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-6 text-center">
                Aucun formulaire disponible pour ce type de visa.
              </p>
            )}

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formTemplate}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Confirm & submit ── */}
        {step === 4 && selectedCountry && selectedVisaType && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setStep(3)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-semibold text-gray-900">Confirmer votre dossier</h2>
            </div>

            {/* Summary card */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Destination</span>
                <span className="text-sm font-semibold text-gray-900">{selectedCountry.nameFr}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Type de visa</span>
                <span className="text-sm font-semibold text-gray-900">{selectedVisaType.name}</span>
              </div>
              {selectedVisaType.fee && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Frais consulaires</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedVisaType.fee} €</span>
                  </div>
                </>
              )}
              {selectedVisaType.processingDays && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Délai de traitement</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedVisaType.processingDays} jours ouvrés</span>
                  </div>
                </>
              )}
              {travelDate && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Date de voyage</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Date(travelDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </>
              )}
              <div className="h-px bg-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Champs remplis</span>
                <span className="text-sm font-semibold text-gray-900">
                  {Object.values(formData).filter(Boolean).length} / {formTemplate?.fields.length ?? 0}
                </span>
              </div>
            </div>

            {/* Info box */}
            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-700">
                Votre dossier sera créé en statut <strong>Brouillon</strong>. Vous pourrez compléter et soumettre vos documents depuis votre tableau de bord.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                ← Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Création…
                  </span>
                ) : (
                  "Créer mon dossier"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
