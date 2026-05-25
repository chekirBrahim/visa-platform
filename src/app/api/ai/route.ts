// ============================================================
// API — /api/ai
// POST : question au chatbot visa IA (Claude / OpenAI)
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { Prisma } from "@prisma/client"

const aiMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  countryCode: z.string().optional(),
  applicationId: z.string().uuid().optional(),
})

const SYSTEM_PROMPT = `Tu es un assistant expert en visas pour les citoyens tunisiens. Tu réponds en français.
Tu connais parfaitement :
- Les procédures de visa Schengen (France, Italie, Allemagne, Espagne) depuis la Tunisie
- Le processus TLSContact (prise de rendez-vous, dépôt de dossier, retrait)
- Le processus VFS Global
- Les visas USA (DS-160, entretien consulaire)
- Le visa Canada (IRCC, demande en ligne)
- Les eVisas (Turquie, Égypte, Sri Lanka, etc.)
- Les documents typiquement requis et les pièges à éviter
- Les délais de traitement et les frais consulaires

Règles :
- Sois précis, concis et bienveillant
- Donne des conseils pratiques pour éviter les refus
- Ne garantis jamais l'obtention d'un visa
- Si une question dépasse ton domaine (médical, juridique), renvoie vers un professionnel
- Réponds TOUJOURS en français`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = aiMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 400 })
    }

    const { message, sessionId, countryCode } = parsed.data

    // Récupérer ou créer la conversation
    let conversation = sessionId
      ? await prisma.aiConversation.findUnique({ where: { sessionId } })
      : null

    const history = (conversation?.messages as Array<{ role: string; content: string }>) ?? []

    // Contexte pays si fourni
    let countryContext = ""
    if (countryCode) {
      const country = await prisma.country.findUnique({
        where: { code: countryCode },
        include: {
          visaTypes: { where: { isActive: true }, take: 5 },
        },
      })
      if (country) {
        countryContext = `\nContexte actuel : L'utilisateur s'intéresse au visa ${country.nameFr}.`
      }
    }

    // Appel API IA (Anthropic Claude)
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Service IA non configuré" },
        { status: 503 }
      )
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT + countryContext,
        messages: [
          ...history.slice(-10), // Garder les 10 derniers messages
          { role: "user", content: message },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const assistantMessage = data.content[0]?.text ?? "Je n'ai pas pu générer une réponse."

    // Sauvegarder la conversation
    const newHistory = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: assistantMessage },
    ]

    if (conversation) {
      await prisma.aiConversation.update({
        where: { sessionId: conversation.sessionId },
        data: {
          messages: newHistory as Prisma.InputJsonValue,
          tokensUsed: (conversation.tokensUsed ?? 0) + ((data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0)),
        },
      })
    } else {
      const newConversation = await prisma.aiConversation.create({
        data: {
          messages: newHistory as Prisma.InputJsonValue,
          contextCountryId: null,
          tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
        },
      })
      conversation = newConversation
    }

    return NextResponse.json({
      success: true,
      data: {
        message: assistantMessage,
        sessionId: conversation?.sessionId,
      },
    })
  } catch (error) {
    console.error("AI API error:", error)
    return NextResponse.json({ success: false, error: "Erreur du service IA" }, { status: 500 })
  }
}
xtResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
  }
}
