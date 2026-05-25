import Link from "next/link"

const COUNTRIES = [
  { code: "FR", flag: "🇫🇷", name: "France",        sub: "Schengen · TLSContact",  color: "from-blue-600 to-blue-800" },
  { code: "IT", flag: "🇮🇹", name: "Italie",         sub: "Schengen · TLSContact",  color: "from-green-600 to-green-800" },
  { code: "DE", flag: "🇩🇪", name: "Allemagne",      sub: "Schengen · TLSContact",  color: "from-yellow-600 to-yellow-800" },
  { code: "ES", flag: "🇪🇸", name: "Espagne",        sub: "Schengen · VFS Global",  color: "from-red-600 to-red-800" },
  { code: "US", flag: "🇺🇸", name: "États-Unis",     sub: "Ambassade directe",      color: "from-indigo-600 to-indigo-800" },
  { code: "CA", flag: "🇨🇦", name: "Canada",         sub: "En ligne · IRCC",        color: "from-red-700 to-red-900" },
  { code: "GB", flag: "🇬🇧", name: "Royaume-Uni",    sub: "UK Visas",               color: "from-purple-600 to-purple-800" },
  { code: "AE", flag: "🇦🇪", name: "Émirats",        sub: "eVisa rapide",           color: "from-amber-600 to-amber-800" },
]

const STEPS = [
  { n: "01", icon: "🗺️", title: "Choisissez votre pays",    desc: "Sélectionnez la destination et le type de visa souhaité" },
  { n: "02", icon: "📋", title: "Remplissez le formulaire", desc: "Formulaire guidé, adapté aux exigences de chaque ambassade" },
  { n: "03", icon: "📁", title: "Envoyez vos documents",    desc: "Upload sécurisé. Nos experts vérifient chaque pièce" },
  { n: "04", icon: "📡", title: "Suivez en temps réel",     desc: "Tableau de bord + notifications email à chaque étape" },
]

const STATS = [
  { value: "98%",    label: "Taux d'approbation", icon: "✦" },
  { value: "5 000+", label: "Visas traités",       icon: "✦" },
  { value: "8",      label: "Pays couverts",       icon: "✦" },
  { value: "24h",    label: "Délai de vérification", icon: "✦" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ── Navbar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-slate-900 font-black text-sm">V</span>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Visa<span className="text-amber-400">TN</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/track" className="hidden sm:block px-4 py-2 text-sm text-slate-400 hover:text-white font-medium transition-colors rounded-lg hover:bg-white/5">
              Suivi dossier
            </Link>
            <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white font-medium border border-white/10 rounded-lg hover:border-white/20 transition-all">
              Connexion
            </Link>
            <Link href="/application/new" className="px-4 py-2 text-sm font-semibold bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-lg transition-all shadow-lg shadow-amber-500/20">
              Commencer →
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-teal-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-indigo-500/6 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Agence certifiée — Tunis, Tunisie
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            Votre visa,{" "}
            <span className="relative">
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-teal-400 bg-clip-text text-transparent">
                traité par des experts
              </span>
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            Déposez votre dossier en ligne en quelques minutes.
            Nos conseillers s&apos;occupent de tout — de TLSContact à l&apos;ambassade.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/application/new" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-base transition-all shadow-xl shadow-amber-500/25 hover:shadow-amber-400/30 hover:-translate-y-0.5">
              Démarrer une demande
              <span className="text-xl">→</span>
            </Link>
            <Link href="/track" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold rounded-xl text-base transition-all">
              🔍 Suivre mon dossier
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-5 text-center backdrop-blur-sm hover:border-amber-400/20 transition-all group">
              <div className="text-3xl font-black text-amber-400 group-hover:scale-105 transition-transform">{s.value}</div>
              <div className="text-slate-500 text-xs mt-1.5 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pays ─────────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Choisissez votre{" "}
              <span className="text-teal-400">destination</span>
            </h2>
            <p className="text-slate-400 text-base">Formulaire dédié et suivi personnalisé pour chaque pays</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/application/new?country=${c.code}`}
                className="group relative bg-white/5 border border-white/8 hover:border-white/20 rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 overflow-hidden"
              >
                {/* Gradient shine on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl`} />

                <div className="relative">
                  <span className="text-4xl block mb-3">{c.flag}</span>
                  <div className="font-bold text-white text-base mb-0.5">{c.name}</div>
                  <div className="text-slate-500 text-xs mb-4">{c.sub}</div>
                  <div className="text-amber-400 text-xs font-semibold group-hover:gap-2 flex items-center gap-1 transition-all">
                    Démarrer <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ────────────────────────────── */}
      <section className="px-6 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/3 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
              Simple comme{" "}
              <span className="text-teal-400">bonjour</span>
            </h2>
            <p className="text-slate-400">Pas besoin de créer un compte pour commencer</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={i} className="relative bg-white/5 border border-white/8 rounded-2xl p-6 hover:border-teal-400/20 transition-all group">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-2.5 w-5 h-px bg-white/10 z-10" />
                )}
                <div className="w-10 h-10 rounded-xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-lg mb-4 group-hover:bg-teal-400/15 transition-colors">
                  {s.icon}
                </div>
                <div className="text-xs text-teal-400 font-bold mb-1.5 tracking-wider">{s.n}</div>
                <div className="font-bold text-white text-sm mb-2">{s.title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-teal-500/10 to-amber-500/10 rounded-3xl blur-2xl" />
          <div className="relative bg-white/5 border border-white/10 rounded-3xl p-12">
            <div className="text-4xl mb-4">🛂</div>
            <h2 className="text-3xl font-black tracking-tight mb-3">
              Prêt à obtenir votre visa ?
            </h2>
            <p className="text-slate-400 mb-8">
              Commencez sans créer de compte. Accédez à votre dossier avec juste votre email.
            </p>
            <Link href="/application/new" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold rounded-xl text-base transition-all shadow-xl shadow-amber-500/20 hover:-translate-y-0.5">
              Commencer ma demande →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-amber-400 flex items-center justify-center">
              <span className="text-slate-900 font-black text-xs">V</span>
            </div>
            <span className="font-bold">Visa<span className="text-amber-400">TN</span></span>
          </div>
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} VisaTN — Tous droits réservés · Tunis, Tunisie</p>
        </div>
      </footer>
    </div>
  )
}
