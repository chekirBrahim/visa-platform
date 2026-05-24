import { Suspense } from "react"
import NewApplicationContent from "./_new-content"

export default function NewApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewApplicationContent />
    </Suspense>
  )
}
