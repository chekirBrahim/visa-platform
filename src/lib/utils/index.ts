import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ─── Classe CSS utilitaire (Tailwind + clsx) ──────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Génération de code de référence dossier ─────────────
export function generateReferenceCode(countryCode: string): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `VIS-${countryCode.toUpperCase()}-${year}-${random}`
}

// ─── Formatage de date en français ────────────────────────
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...options,
  })
}

// ─── Formatage de taille de fichier ───────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

// ─── Statut vers label français ───────────────────────────
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumis',
  DOCUMENTS_PENDING: 'Documents manquants',
  UNDER_REVIEW: 'En cours d\'examen',
  SENT_TO_EMBASSY: 'Envoyé à l\'ambassade',
  AT_EMBASSY: 'Traitement ambassade',
  APPROVED: 'Visa accordé ✓',
  REJECTED: 'Visa refusé',
  CANCELLED: 'Annulé',
  ADDITIONAL_INFO: 'Informations requises',
}

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  DOCUMENTS_PENDING: 'bg-orange-100 text-orange-700',
  UNDER_REVIEW: 'bg-purple-100 text-purple-700',
  SENT_TO_EMBASSY: 'bg-indigo-100 text-indigo-700',
  AT_EMBASSY: 'bg-cyan-100 text-cyan-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  ADDITIONAL_INFO: 'bg-yellow-100 text-yellow-700',
}

// ─── Validation email ─────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ─── Validation téléphone tunisien ────────────────────────
export function isValidTunisianPhone(phone: string): boolean {
  return /^(\+216)?[0-9]{8}$/.test(phone.replace(/\s/g, ''))
}

// ─── Délai (sleep) ────────────────────────────────────────
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
