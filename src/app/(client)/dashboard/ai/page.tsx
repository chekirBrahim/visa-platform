"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour ! Je suis votre assistant visa IA. Je peux répondre à toutes vos questions sur les procédures visa depuis la Tunisie : Schengen, USA, Canada, UK, eVisa... Comment puis-je vous aider ?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput("")
    setMessages(prev => [...prev, { role: "user", content: text }])
    setLoading(true)

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.data.message }])
        if (data.data.sessionId) setSessionId(data.data.sessionId)
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue. Réessayez." }])
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue. Réessayez." }])
    } finally {
      setLoading(false)
    }
  }

  const SUGGESTIONS = [
    "Quels documents pour un visa Schengen ?",
    "Comment prendre RDV TLSContact ?",
    "Délai visa USA depuis Tunis ?",
    "Visa Canada : comment faire ?",
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-bold text-sm text-gray-900">Assistant <span className="text-blue-600">IA Visa</span></span>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-6 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
              msg.role === "assistant" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {msg.role === "assistant" ? "🤖" : "Moi"}
            </div>
            {/* Bubble */}
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === "assistant"
                ? "bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm"
                : "bg-blue-600 text-white rounded-tr-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-sm">🤖</div>
            <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only if 1 message) */}
      {messages.length === 1 && (
        <div className="max-w-3xl mx-auto w-full px-6 pb-4">
          <p className="text-xs text-gray-400 mb-2 font-medium">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => setInput(s)}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-100 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question sur votre visa…"
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm">
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
