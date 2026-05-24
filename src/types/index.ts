// ============================================================
// Global Types — Visa Platform
// ============================================================

export type {
  User,
  TempAccess,
  Session,
  Country,
  VisaType,
  FormTemplate,
  FormField,
  Application,
  ProcessingStep,
  ApplicationStep,
  Document,
  DocumentRequirement,
  Message,
  Notification,
  AdminComment,
  Admin,
  AuditLog,
  AiConversation,
} from '@prisma/client'

export type {
  AccountType,
  IdentifierType,
  VisaCategory,
  ProcessingCenter,
  FieldType,
  ApplicationStatus,
  ApplicationPriority,
  StepStatus,
  DocumentReviewStatus,
  MessageSenderType,
  MessageType,
  NotificationType,
  NotificationChannel,
  AdminRole,
} from '@prisma/client'

// ─── Application avec relations ───────────────────────────
export type ApplicationWithRelations = import('@prisma/client').Application & {
  user?: import('@prisma/client').User | null
  tempAccess?: import('@prisma/client').TempAccess | null
  visaType: import('@prisma/client').VisaType & {
    country: import('@prisma/client').Country
  }
  documents: import('@prisma/client').Document[]
  stepHistory: (import('@prisma/client').ApplicationStep & {
    step: import('@prisma/client').ProcessingStep
  })[]
  messages: import('@prisma/client').Message[]
  adminComments: import('@prisma/client').AdminComment[]
}

// ─── Réponses API ─────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ─── Formulaire dynamique ─────────────────────────────────
export interface FormSection {
  key: string
  titleFr: string
  titleAr?: string
  icon?: string
  order: number
}

export interface FormDataValues {
  [key: string]: string | string[] | boolean | number | null
}

// ─── Accès temporaire ─────────────────────────────────────
export interface TempSession {
  accessToken: string
  identifier: string
  identifierType: 'EMAIL' | 'PHONE'
  applications: string[] // IDs des dossiers
}

// ─── Dashboard Admin ──────────────────────────────────────
export interface DashboardStats {
  totalApplications: number
  pendingReview: number
  approved: number
  rejected: number
  thisMonth: number
  revenue: number
}
