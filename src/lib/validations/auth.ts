import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
})

export const registerSchema = z.object({
  fullName: z.string().min(2, "Nom trop court").max(100),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().min(8).max(15).optional(),
  password: z
    .string()
    .min(8, "Minimum 8 caractères")
    .regex(/[A-Z]/, "Une majuscule requise")
    .regex(/[0-9]/, "Un chiffre requis"),
  nationality: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: "Email ou téléphone requis",
})

export const tempAccessSchema = z.object({
  identifier: z.string().min(5, "Email ou téléphone invalide"),
  identifierType: z.enum(["EMAIL", "PHONE"]),
})

export const otpVerifySchema = z.object({
  identifier: z.string(),
  code: z.string().length(6, "Code à 6 chiffres"),
  purpose: z.enum(["LOGIN", "VERIFY_EMAIL", "VERIFY_PHONE", "RESET_PASSWORD"]),
})

export const resetPasswordSchema = z.object({
  email: z.string().email(),
})

export const newPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TempAccessInput = z.infer<typeof tempAccessSchema>
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>
