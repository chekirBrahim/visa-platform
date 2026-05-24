import { Suspense } from "react"
import TrackContent from "./_track-content"

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackContent />
    </Suspense>
  )
}
