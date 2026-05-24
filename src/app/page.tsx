// ============================================================
// Landing Page — VisaTN
// Design premium inspiré Stripe / Revolut
// ============================================================

import Link from "next/link"

const COUNTRIES = [
  { code: "FR", flag: "🇫🇷", name: "France",       sub: "Schengen • TLSContact", color: "#003189", delay: "0ms"   },
  { code: "IT", flag: "🇮🇹", name: "Italie",        sub: "Schengen • TLSContact", color: "#009246", delay: "60ms"  },
  { code: "DE", flag: "🇩🇪", name: "Allemagne",     sub: "Schengen • TLSContact", color: "#DD0000", delay: "120ms" },
  { code: "ES", flag: "🇪🇸", name: "Espagne",       sub: "Schengen • VFS Global", color: "#c60b1e", delay: "180ms" },
  { code: "US", flag: "🇺🇸", name: "États-Unis",    sub: "Ambassade directe",     color: "#3C3B6E", delay: "240ms" },
  { code: "CA", flag: "🇨🇦", name: "Canada",        sub: "En ligne • IRCC",       color: "#D80621", delay: "300ms" },
  { code: "EVISA", flag: "🌐", name: "eVisa", sub: "Multi-destinations",    color: "#0066FF", delay: "360ms" },
]

const STEPS = [
  { n: "01", title: "Choisissez votre pays",     desc: "Sélectionnez la destination et le type de visa souhaité" },
  { n: "02", title: "Remplissez le formulaire",  desc: "Formulaire guidé, adapté aux exigences de chaque ambassade" },
  { n: "03", title: "Envoyez vos documents",     desc: "Upload sécurisé. Nos experts vérifient chaque pièce" },
  { n: "04", title: "Suivez votre dossier",      desc: "Tableau de bord en temps réel + notifications WhatsApp/email" },
]

const STATS = [
  { value: "98%",    label: "Taux d'approbation" },
  { value: "5 000+", label: "Visas traités" },
  { value: "7",      label: "Pays couverts" },
  { value: "24h",    label: "Délai de vérification" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}>
        <nav style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "var(--gradient-hero)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18,
            }}>🛂</div>
            <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
              Visa<span style={{ color: "var(--primary)" }}>TN</span>
            </span>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link href="/application/new" style={{
              padding: "9px 20px",
              borderRadius: 10,
              background: "transparent",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              transition: "color 0.2s",
            }}>
              Suivi dossier
            </Link>
            <Link href="/login" style={{
              padding: "9px 20px",
              borderRadius: 10,
              background: "transparent",
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              border: "1.5px solid var(--border)",
            }}>
              Connexion
            </Link>
            <Link href="/application/new" className="btn-primary" style={{ fontSize: 14, padding: "9px 20px" }}>
              Commencer →
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section style={{
        background: "linear-gradient(160deg, #F0F6FF 0%, #FFFFFF 50%, #F5F0FF 100%)",
        padding: "96px 24px 80px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{
          position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }} className="animate-fade-in">
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--primary-light)",
            color: "var(--primary)",
            borderRadius: 20, padding: "6px 16px",
            fontSize: 13, fontWeight: 600,
            marginBottom: 24,
          }}>
            <span>✦</span> Agence certifiée — Tunis, Tunisie
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            marginBottom: 20,
          }}>
            Votre visa,{" "}
            <span className="gradient-text">traité par des experts</span>
          </h1>

          <p style={{
            fontSize: 18,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: 40,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}>
            Déposez votre dossier en ligne en quelques minutes.
            Nos experts s&apos;occupent de tout — de TLSContact à l&apos;ambassade.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/application/new" className="btn-primary" style={{ fontSize: 16, padding: "14px 32px" }}>
              Démarrer une demande
            </Link>
            <Link href="/track" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px",
              borderRadius: 10,
              border: "1.5px solid var(--border)",
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: 16,
              textDecoration: "none",
              background: "white",
              transition: "box-shadow 0.2s",
            }}>
              🔍 Suivre mon dossier
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────── */}
      <section style={{
        background: "var(--primary)",
        padding: "32px 24px",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              padding: "8px 0",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.15)" : "none",
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "white", letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pays ───────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "var(--background)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>
              Choisissez votre destination
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              Formulaire dédié, documents adaptés, et suivi personnalisé pour chaque pays
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {COUNTRIES.map((c) => (
              <Link
                key={c.code}
                href={`/application/new?country=${c.code}`}
                className="card card-hover animate-fade-in"
                style={{
                  padding: "28px 24px",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  animationDelay: c.delay,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0,
                  height: 3,
                  background: c.color,
                  borderRadius: "16px 16px 0 0",
                }} />
                <span style={{ fontSize: 44 }}>{c.flag}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{c.sub}</div>
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600, color: "var(--primary)",
                  marginTop: "auto",
                }}>
                  Démarrer →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ──────────────────────────────── */}
      <section style={{ padding: "80px 24px", background: "var(--surface-2)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-1px", marginBottom: 12 }}>
              Simple comme bonjour
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
              Pas besoin de créer un compte pour commencer
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ position: "relative" }}>
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: "absolute", top: 28, left: "calc(50% + 32px)",
                    right: "-12px", height: 2,
                    background: "var(--border)",
                    display: "none", // visible only on desktop via CSS
                  }} />
                )}
                <div className="card" style={{ padding: 28, textAlign: "center" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    fontWeight: 800, fontSize: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                  }}>
                    {s.n}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ──────────────────────────────────────── */}
      <section style={{
        padding: "80px 24px",
        background: "var(--gradient-hero)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "white", letterSpacing: "-1px", marginBottom: 16 }}>
            Prêt à obtenir votre visa ?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, marginBottom: 32 }}>
            Commencez sans créer de compte. Accédez à votre dossier avec juste votre email ou téléphone.
          </p>
          <Link href="/application/new" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "white", color: "var(--primary)",
            padding: "16px 36px", borderRadius: 12,
            fontWeight: 700, fontSize: 16,
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}>
            Commencer ma demande →
          </Link>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer style={{
        background: "var(--text-primary)",
        color: "rgba(255,255,255,0.5)",
        padding: "32px 24px",
        textAlign: "center",
        fontSize: 13,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
            Visa<span style={{ color: "var(--primary)" }}>TN</span>
          </div>
          <p>© {new Date().getFullYear()} VisaTN — Tous droits réservés · Tunis, Tunisie</p>
        </div>
      </footer>
    </div>
  )
}
