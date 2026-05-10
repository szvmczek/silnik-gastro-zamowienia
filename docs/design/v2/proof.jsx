// proof.jsx — 3 proof-of-concept tiles using only DS components

const ProofArtboard = () => {
  const Btn = window.DSBtn;
  const Badge = window.DSBadge;
  const FAB = window.DSFAB;
  const InfoBar = window.DSInfoBar;

  return (
    <div style={{ width: 1280, padding: '48px 56px', background: 'var(--color-bg-page)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="t-kicker t-kicker--accent" style={{ marginBottom: 10 }}>04 · Proof of concept</div>
        <h2 className="t-h2" style={{ margin: '0 0 8px 0' }}>System stoi · trzy aplikacje tokenów</h2>
        <p className="t-body" style={{ margin: 0, maxWidth: 720 }}>
          Hero block, karta produktu, admin operations card. Wszystko zbudowane z komponentów powyżej — żadnego nowego CSS, żadnego nowego koloru. Jeśli te trzy elementy działają obok siebie wizualnie, system jest spójny.
        </p>
      </div>

      {/* ─── (a) Hero block ─── */}
      <div style={{ marginBottom: 16 }}>
        <div className="t-kicker" style={{ marginBottom: 12 }}>(a) Public · Landing hero</div>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, overflow: 'hidden', marginBottom: 48 }}>
        {/* Header */}
        <div style={{ height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ font: '900 18px/1 var(--font-sans)', letterSpacing: '-0.025em' }}>Pizza Demo<span style={{ color: 'var(--color-primary)' }}>.</span></span>
            <nav style={{ display: 'flex', gap: 20, font: '500 14px/1 var(--font-sans)', color: 'var(--color-text-body)' }}>
              <span>Menu</span><span>O nas</span><span>Kontakt</span>
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>+48 22 751 00 00</span>
            <div style={{ position: 'relative' }}>
              <Btn variant="ghost" size="sm">🛒 Koszyk · 2</Btn>
            </div>
          </div>
        </div>

        {/* Hero — 5/7 split */}
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', minHeight: 480 }}>
          <div style={{ padding: '64px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="t-kicker t-kicker--accent" style={{ marginBottom: 20 }}>PIZZA DEMO</div>
            <h1 style={{ font: '900 64px/1.02 var(--font-sans)', letterSpacing: '-0.035em', margin: 0 }}>
              Smacznie<br/>i szybko<span style={{ color: 'var(--color-primary)' }}>.</span>
            </h1>
            <p className="t-body-lg" style={{ marginTop: 20, maxWidth: 380 }}>
              Zamów online. Dostawa do 35 minut.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <Btn variant="primary" size="lg">Zamów teraz</Btn>
              <Btn variant="ghost" size="lg">Zobacz menu</Btn>
            </div>
            <div style={{ display: 'flex', gap: 32, marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--color-border-subtle)' }}>
              <div>
                <div style={{ font: '800 28px/1 var(--font-sans)', letterSpacing: '-0.02em' }}>12<span style={{ color: 'var(--color-primary)', fontSize: 20 }}>+</span></div>
                <div className="t-kicker" style={{ marginTop: 6 }}>Lat na osiedlu</div>
              </div>
              <div>
                <div style={{ font: '800 28px/1 var(--font-sans)', letterSpacing: '-0.02em' }}>35'</div>
                <div className="t-kicker" style={{ marginTop: 6 }}>Średni czas</div>
              </div>
              <div>
                <div style={{ font: '800 28px/1 var(--font-sans)', letterSpacing: '-0.02em' }}>4.8<span style={{ color: 'var(--color-text-muted)', fontSize: 20 }}>/5</span></div>
                <div className="t-kicker" style={{ marginTop: 6 }}>Google · 240 ocen</div>
              </div>
            </div>
          </div>
          <div style={{
            background: 'repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)',
            position: 'relative',
            display: 'flex', alignItems: 'flex-end', padding: 32
          }}>
            <span className="t-mono" style={{
              position: 'absolute', top: 24, left: 24,
              fontSize: 11, color: 'var(--color-text-muted)',
              background: 'rgba(255,255,255,0.85)', padding: '4px 8px', borderRadius: 4
            }}>hero shot · drama food photography · 4:3</span>
            <div style={{ background: 'rgba(26,26,26,0.92)', color: '#fff', padding: '12px 16px', borderRadius: 8 }}>
              <div className="t-kicker" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>BESTSELLER</div>
              <div style={{ font: '700 16px/1.2 var(--font-sans)' }}>Mafia 40 cm · 42,90 zł</div>
            </div>
          </div>
        </div>

        {/* Info-bar */}
        <div style={{ padding: '0 32px 32px' }}>
          <InfoBar open />
        </div>
      </div>

      {/* ─── (b) Product card ─── */}
      <div style={{ marginBottom: 12 }}>
        <div className="t-kicker" style={{ marginBottom: 12 }}>(b) Public · Karta produktu</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
        {/* default */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            aspectRatio: '4/3',
            background: 'repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: 12, left: 12 }}><Badge variant="primary">Bestseller</Badge></div>
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
              <span style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 4, padding: '4px 6px', fontSize: 14 }}>🌶</span>
            </div>
            <span className="t-mono" style={{ position: 'absolute', bottom: 8, right: 12, fontSize: 10, color: 'var(--color-text-muted)' }}>4:3</span>
          </div>
          <div style={{ padding: 16 }}>
            <h3 className="t-h3" style={{ margin: 0 }}>Mafia</h3>
            <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-body)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              Pepperoni, salami, jalapeño, czerwona cebula, mozzarella, sos pomidorowy.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ font: '700 18px/1 var(--font-mono)' }}>42,90 zł</span>
              <FAB />
            </div>
          </div>
        </div>
        {/* in cart */}
        <div style={{ background: '#fff', border: '1.5px solid var(--color-primary)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            aspectRatio: '4/3',
            background: 'repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: 12, right: 12 }}><Badge variant="soft">2× w koszyku</Badge></div>
          </div>
          <div style={{ padding: 16 }}>
            <h3 className="t-h3" style={{ margin: 0 }}>Capricciosa</h3>
            <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-body)' }}>Szynka, pieczarki, mozzarella.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ font: '700 18px/1 var(--font-mono)', color: 'var(--color-primary)' }}>od 28,90 zł</span>
              <span style={{ font: '600 13px/1 var(--font-sans)', color: 'var(--color-primary)' }}>Wybierz rozmiar →</span>
            </div>
          </div>
        </div>
        {/* unavailable */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            aspectRatio: '4/3',
            background: 'repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)',
            position: 'relative', filter: 'grayscale(0.7)', opacity: 0.5
          }} />
          <div style={{ padding: 16, opacity: 0.6 }}>
            <h3 className="t-h3" style={{ margin: 0 }}>Diavola</h3>
            <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-body)' }}>Niedostępne dziś.</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <span style={{ font: '700 18px/1 var(--font-mono)', textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>34,90 zł</span>
              <FAB />
            </div>
          </div>
        </div>
      </div>

      {/* ─── (c) Admin operations card ─── */}
      <div style={{ marginBottom: 12 }}>
        <div className="t-kicker" style={{ marginBottom: 12 }}>(c) Admin · Kuchnia · karta operacyjna</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {/* NEW — urgent */}
        <div className="is-urgent" style={{
          background: 'var(--status-new-tint)', borderLeft: '4px solid var(--status-new)',
          borderRadius: 8, padding: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ font: '600 20px/1 var(--font-mono)', color: 'var(--color-text-primary)' }}>#2026-00184</div>
              <div className="t-kicker" style={{ marginTop: 6 }}>NOWE · 12 MIN TEMU 🔥</div>
            </div>
            <span style={{ font: '600 11px/1 var(--font-sans)', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#92400E', background: '#fff', padding: '4px 8px', borderRadius: 4 }}>🚗 DOSTAWA</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, font: '500 14px/1.4 var(--font-sans)' }}>
            <div>2× <strong>Mafia 40 cm</strong></div>
            <div>1× <strong>Capricciosa 30 cm</strong> <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>+ ekstra ser</span></div>
            <div>1× <strong>Coca-Cola 0.5 l</strong></div>
            <div style={{ marginTop: 4, padding: '8px 10px', background: 'rgba(245,158,11,0.18)', borderRadius: 4, font: 'italic 500 13px/1.4 var(--font-sans)', color: '#92400E' }}>
              📝 Bez cebuli na Mafii. Domofon nie działa, dzwoń.
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 13, color: 'var(--color-text-body)' }}>
            <span><strong style={{ font: '700 16px/1 var(--font-mono)' }}>112,80 zł</strong> · gotówka</span>
            <span className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>ETA 18:45</span>
          </div>
          <Btn variant="primary" size="xl" full>Przyjmij zamówienie</Btn>
        </div>

        {/* IN_PREPARATION */}
        <div style={{
          background: '#fff', borderLeft: '4px solid var(--status-prep)',
          border: '1px solid var(--color-border-card)', borderLeftWidth: 4,
          borderRadius: 8, padding: 20
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <div style={{ font: '600 20px/1 var(--font-mono)' }}>#2026-00183</div>
              <div className="t-kicker" style={{ marginTop: 6, color: 'var(--color-primary)' }}>W KUCHNI · 6 MIN</div>
            </div>
            <span style={{ font: '600 11px/1 var(--font-sans)', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#9D1B26', background: 'var(--color-primary-tint)', padding: '4px 8px', borderRadius: 4 }}>🏪 ODBIÓR</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, font: '500 14px/1.4 var(--font-sans)' }}>
            <div>1× <strong>Margherita 30 cm</strong></div>
            <div>1× <strong>Frytki duże</strong></div>
            <div>2× <strong>Lech 0.5 l</strong></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, fontSize: 13, color: 'var(--color-text-body)' }}>
            <span><strong style={{ font: '700 16px/1 var(--font-mono)' }}>54,40 zł</strong> · gotówka</span>
            <span className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Magda · 600-100-200</span>
          </div>
          <Btn variant="primary" size="xl" full>Gotowe → Wydanie</Btn>
        </div>
      </div>
    </div>
  );
};

window.ProofArtboard = ProofArtboard;
