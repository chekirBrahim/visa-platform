import Link from "next/link"

const COUNTRIES = [
  { code: "FR", flag: "🇫🇷", name: "France",        sub: "Schengen · TLSContact"  },
  { code: "IT", flag: "🇮🇹", name: "Italie",         sub: "Schengen · TLSContact"  },
  { code: "DE", flag: "🇩🇪", name: "Allemagne",      sub: "Schengen · TLSContact"  },
  { code: "ES", flag: "🇪🇸", name: "Espagne",        sub: "Schengen · VFS Global"  },
  { code: "US", flag: "🇺🇸", name: "États-Unis",     sub: "Ambassade directe"      },
  { code: "CA", flag: "🇨🇦", name: "Canada",         sub: "En ligne · IRCC"        },
  { code: "GB", flag: "🇬🇧", name: "Royaume-Uni",    sub: "UK Visas"               },
  { code: "AE", flag: "🇦🇪", name: "Émirats",        sub: "eVisa rapide"           },
]

const STEPS = [
  { n: "01", title: "Choisissez votre destination",  desc: "Sélectionnez le pays et le type de visa souhaité parmi nos 8 destinations disponibles." },
  { n: "02", title: "Remplissez le formulaire",       desc: "Formulaire intelligent, adapté aux exigences spécifiques de chaque ambassade." },
  { n: "03", title: "Envoyez vos documents",          desc: "Téléversez vos pièces en toute sécurité. Nos experts vérifient chaque document." },
  { n: "04", title: "Suivez en temps réel",           desc: "Tableau de bord personnalisé et notifications à chaque étape de votre dossier." },
]

const STATS = [
  { value: "98%",    label: "Taux d'approbation"   },
  { value: "5 000+", label: "Visas traités"         },
  { value: "8",      label: "Pays couverts"         },
  { value: "24h",    label: "Délai de vérification" },
]

const FEATURES = [
  { icon: "🔒", title: "100% sécurisé",        desc: "Vos données personnelles et documents sont chiffrés et protégés selon les standards les plus stricts." },
  { icon: "⚡", title: "Traitement express",   desc: "Vos dossiers sont vérifiés en moins de 24h par des experts visa certifiés." },
  { icon: "📍", title: "Suivi en temps réel",  desc: "Consultez l'état de votre dossier à tout moment depuis votre espace client." },
  { icon: "🤝", title: "Accompagnement dédié", desc: "Un conseiller attitré répond à toutes vos questions tout au long de la procédure." },
  { icon: "🌍", title: "8 destinations",       desc: "France, Italie, Allemagne, Espagne, USA, Canada, Royaume-Uni, Émirats — et plus à venir." },
  { icon: "🤖", title: "Assistant IA intégré", desc: "Posez vos questions visa 24/7 à notre assistant intelligent spécialisé Tunisie → Monde." },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Navbar ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">V</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900">
              Visa<span className="text-blue-600">TN</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#comment-ca-marche" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Comment ça marche
            </a>
            <a href="#destinations" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Destinations
            </a>
            <Link href="/track" className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Suivi dossier
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              Commencer →
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Agence certifiée — Tunis, Tunisie
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-gray-900 mb-6">
            Votre visa,{" "}
            <span className="text-blue-600">traité par des experts</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Déposez votre dossier en ligne, suivez chaque étape en temps réel et obtenez votre visa en toute sérénité — depuis la Tunisie.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-200 text-base"
            >
              Démarrer mon dossier
            </Link>
            <Link
              href="/track"
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 transition-colors text-base"
            >
              Suivre un dossier existant
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-black text-gray-900">{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ────────────────────────────── */}
      <section id="comment-ca-marche" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Simple, rapide, efficace</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              4 étapes suffisent pour confier votre dossier à nos experts et voyager l&apos;esprit libre.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.n}>
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4">
                  {step.n}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Commencer maintenant →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Destinations ─────────────────────────────────── */}
      <section id="destinations" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">8 destinations couvertes</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Nous traitons les demandes de visa pour les destinations les plus demandées depuis la Tunisie.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/register?country=${c.code}`}
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all text-center"
              >
                <div className="text-4xl mb-3">{c.flag}</div>
                <div className="font-semibold text-gray-900 text-sm">{c.name}</div>
                <div className="text-xs text-gray-400 mt-1">{c.sub}</div>
                <div className="mt-3 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Déposer un dossier →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Pourquoi choisir VisaTN ?</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Expertise humaine et technologie pour maximiser vos chances d&apos;obtenir votre visa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Prêt à voyager ?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Créez votre compte gratuitement et déposez votre premier dossier en moins de 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl transition-colors"
            >
              Créer un compte gratuit
            </Link>
            <Link
              href="/track"
              className="px-8 py-3.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl border border-blue-400 transition-colors"
            >
              Suivre mon dossier
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-semibold text-white">VisaTN</span>
            <span className="text-gray-600 text-sm ml-2">— Agence visa certifiée, Tunis</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Connexion</Link>
            <Link href="/register" className="hover:text-white transition-colors">Inscription</Link>
            <Link href="/track" className="hover:text-white transition-colors">Suivi dossier</Link>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} VisaTN. Tous droits réservés.</p>
        </div>
      </footer>

    </div>
  )
}
