// ============================================================
// Utility functions
// ============================================================

/**
 * Generate a unique reference code for a visa application
 * Format: VIS-{COUNTRY}-{YEAR}-{RANDOM}
 * Example: VIS-FR-2025-84721
 */
export function generateReferenceCode(countryCode: string): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10000 + Math.random() * 90000)
  return `VIS-${countryCode.toUpperCase()}-${year}-${random}`
}

/**
 * Format a date to French locale string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate a string to a max length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + "..."
}

/**
 * Status label in French
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Brouillon",
    SUBMITTED: "Soumis",
    UNDER_REVIEW: "En cours d'examen",
    DOCUMENTS_PENDING: "Documents manquants",
    APPROVED: "Approuvé",
    REJECTED: "Refusé",
    CANCELLED: "Annulé",
    WITHDRAWN: "Retiré",
  }
  return labels[status] ?? status
}

/**
 * Status color classes (Tailwind)
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    SUBMITTED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    UNDER_REVIEW: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    DOCUMENTS_PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    APPROVED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
    CANCELLED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    WITHDRAWN: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  }
  return colors[status] ?? "bg-slate-500/10 text-slate-400 border-slate-500/20"
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * cn — merge Tailwind class names (simple version without clsx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}
