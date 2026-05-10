// foundations.jsx — Color, type, spacing, radii, shadow, motion grids

const Swatch = ({ name, hex, label, dark }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{
      width: '100%', height: 88, background: hex,
      borderRadius: 8,
      border: dark ? '1px solid rgba(255,255,255,.08)' : '1px solid var(--color-border-card)'
    }} />
    <div>
      <div className="t-kicker" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ font: '600 13px/1.3 var(--font-sans)', color: 'var(--color-text-primary)' }}>{name}</div>
      <div className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{hex}</div>
    </div>
  </div>
);

const SectionHead = ({ kicker, title, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <div className="t-kicker t-kicker--accent" style={{ marginBottom: 10 }}>{kicker}</div>
    <h2 className="t-h2" style={{ margin: '0 0 8px 0' }}>{title}</h2>
    {sub && <p className="t-body" style={{ margin: 0, maxWidth: 640 }}>{sub}</p>}
  </div>
);

const FoundationsArtboard = () => {
  return (
    <div style={{
      width: 1280, padding: '48px 56px', background: 'var(--color-bg-page)',
      fontFamily: 'var(--font-sans)', color: 'var(--color-text-primary)'
    }}>
      {/* ─────────── COLOR ─────────── */}
      <SectionHead kicker="01a · Color" title="Brand & neutrale" sub="Czerwony pomidorowy ciepły dorosły, off-white tła z mikroskopijnym ciepłem. Trzy kolory marki maks: primary, neutral, jeden akcent." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
        <Swatch name="primary" hex="#E63946" label="CTA · Brand · Focus ring" />
        <Swatch name="primary-hover" hex="#D62937" label="Hover/Active state" />
        <Swatch name="primary-tint" hex="#FCEEEF" label="Tinted bg · Selected radio" />
      </div>

      {/* Off-white compare row — operator-flagged decision */}
      <div style={{ marginBottom: 40, padding: 20, background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12 }}>
        <div className="t-kicker" style={{ marginBottom: 14 }}>Off-white compare · key moodboard decision</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <div style={{ height: 72, background: '#FFFFFF', borderRadius: 8, border: '1px solid var(--color-border-card)' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ font: '600 13px/1.3 var(--font-sans)' }}>Pure white</div>
              <div className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>#FFFFFF</div>
              <div className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-muted)' }}>Sterylny SaaS dashboard. Odrzucone — pizzeria nie jest panelem admina.</div>
            </div>
          </div>
          <div>
            <div style={{ height: 72, background: '#FAFAF8', borderRadius: 8, border: '1.5px solid var(--color-primary)' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ font: '600 13px/1.3 var(--font-sans)' }}>Off-white <span style={{ color: 'var(--color-primary)' }}>← chosen</span></div>
              <div className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>#FAFAF8</div>
              <div className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-muted)' }}>Ledwo ciepłe, czyste. WCAG AA dla 14px text-primary 16.4:1.</div>
            </div>
          </div>
          <div>
            <div style={{ height: 72, background: '#F5F1EB', borderRadius: 8, border: '1px solid var(--color-border-card)' }} />
            <div style={{ marginTop: 8 }}>
              <div style={{ font: '600 13px/1.3 var(--font-sans)' }}>Toscana cream</div>
              <div className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>#F5F1EB</div>
              <div className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-muted)' }}>Włoska trattoria. Odrzucone — pretensjonalne dla pizzy osiedlowej.</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <Swatch name="bg-page" hex="#FAFAF8" label="Tło strony" />
        <Swatch name="bg-card" hex="#FFFFFF" label="Karty / koszyk / modal" />
        <Swatch name="bg-section" hex="#F5F2EA" label="Sekcja 'O nas' / 'Godziny'" />
        <Swatch name="bg-dark" hex="#1A1A1A" label="Info-bar · Footer" dark />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <Swatch name="border-subtle" hex="#EDE9DF" label="Separatory sekcji" />
        <Swatch name="border-card" hex="#E5E1D6" label="Ramki kart 1.5px" />
        <Swatch name="border-strong" hex="#D4D0C2" label="Hover / aktywne ramki" />
        <Swatch name="accent-yellow" hex="#F4A261" label="Badge 'Promocja' · rzadko" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
        <Swatch name="text-primary" hex="#1A1A1A" label="Nagłówki, treść główna" dark />
        <Swatch name="text-body" hex="#4A4A45" label="Body, opisy" dark />
        <Swatch name="text-muted" hex="#6B6B66" label="Labels, kicker" dark />
        <Swatch name="text-faint" hex="#A8A59C" label="Placeholdery, disabled" />
      </div>

      <div className="t-kicker" style={{ marginBottom: 12 }}>Status colors · admin operations (locked muscle memory)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 56 }}>
        {[
          ['NEW', '#F59E0B', '#FEF3C7'],
          ['CONFIRMED', '#3B82F6', '#DBEAFE'],
          ['IN_PREP', '#E63946', '#FCEEEF'],
          ['READY', '#10B981', '#D1FAE5'],
          ['OUT_FOR_DEL', '#6366F1', '#E0E7FF'],
          ['DELIVERED', '#6B7280', '#F3F4F6'],
          ['CANCELED', '#DC2626', '#FEE2E2'],
        ].map(([n, h, t]) => (
          <div key={n} style={{ background: t, borderLeft: `4px solid ${h}`, padding: '12px 10px', borderRadius: 6 }}>
            <div className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-primary)', fontWeight: 600 }}>{n}</div>
            <div className="t-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 4 }}>{h}</div>
          </div>
        ))}
      </div>

      {/* ─────────── TYPOGRAPHY ─────────── */}
      <SectionHead kicker="01b · Type" title="Inter, brutalny kontrast wagi" sub="Tylko Inter. Charakter buduje się przez kontrast między display 900 a body 400 — nie przez różne fonty. Mono dla numerów zamówień, kodów, kwot." />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28, marginBottom: 40 }}>
        {/* Display showcase — kropka jako gest */}
        <div style={{ padding: 32, background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12 }}>
          <div className="t-kicker t-kicker--accent" style={{ marginBottom: 16 }}>PIZZA DEMO</div>
          <div className="t-display">
            Smacznie i szybko<span style={{ color: 'var(--color-primary)' }}>.</span>
          </div>
          <p className="t-body-lg" style={{ marginTop: 16, maxWidth: 520 }}>
            Zamów online. Dostawa do 35 minut.
          </p>
          <div className="t-mono" style={{ marginTop: 24, fontSize: 12, color: 'var(--color-text-muted)' }}>
            display 64px/900/-0.035em · kicker 12px/600/0.06em uppercase · body-lg 17px/400
          </div>
        </div>

        {/* Scale */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, overflow: 'hidden' }}>
          {[
            ['display', '900', '64 / 44', '-0.035em', 'Hero h1', <span>Smacznie i szybko<span style={{color:'var(--color-primary)'}}>.</span></span>, 64, 900, '-0.035em'],
            ['h1', '800', '40 / 32', '-0.025em', 'Page title', 'Sekcja landing', 40, 800, '-0.025em'],
            ['h2', '700', '28 / 24', '-0.02em', 'Subsection · modal', 'Co dziś jemy', 28, 700, '-0.02em'],
            ['h3', '700', '20 / 18', '-0.015em', 'Card title', 'Mafia 40 cm', 20, 700, '-0.015em'],
            ['body-lg', '400', '17 / 16', 'normal', 'Lead, długie opisy', 'Zamów online. Dostawa do 35 minut.', 17, 400, 'normal'],
            ['body', '400', '15 / 14', 'normal', 'Default text', 'Sos pomidorowy, mozzarella, salami pepperoni.', 15, 400, 'normal'],
            ['kicker', '600', '12 / 11', '0.06em UC', 'Editorial label', 'PIZZA DEMO · MENU', 12, 600, '0.06em'],
            ['mono', '500', '14', 'normal', 'Numery, kody', '#2026-00184', 14, 500, 'normal'],
            ['mono-xl', '600', '36', 'normal', 'Confirmation number', '2026-00184', 36, 600, 'normal'],
          ].map(([token, weight, size, ls, use, sample, px, w, lsv], i) => (
            <div key={token} style={{
              display: 'grid', gridTemplateColumns: '120px 80px 100px 110px 1fr 1.2fr',
              padding: '18px 24px', alignItems: 'center', gap: 16,
              borderBottom: i < 8 ? '1px solid var(--color-border-subtle)' : 'none'
            }}>
              <div className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 600 }}>{token}</div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>w {weight}</div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{size} px</div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{ls}</div>
              <div className="t-body-sm" style={{ color: 'var(--color-text-muted)' }}>{use}</div>
              <div style={{
                fontFamily: token.startsWith('mono') ? 'var(--font-mono)' : 'var(--font-sans)',
                fontSize: px, fontWeight: w,
                letterSpacing: lsv === 'normal' ? 'normal' : lsv,
                textTransform: token === 'kicker' ? 'uppercase' : 'none',
                lineHeight: 1.1, color: 'var(--color-text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>{sample}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── SPACING ─────────── */}
      <SectionHead kicker="01c · Spacing" title="4 px base · pizzeria potrzebuje powietrza" sub="Sekcje 80–120 px desktop. Karty padding 16–20 px. Gap między kartami 12–16 px. Container max 1280 px." />

      <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, padding: 24, marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          {[
            [1, 4], [2, 8], [3, 12], [4, 16], [5, 20], [6, 24], [8, 32], [10, 40], [12, 48], [16, 64], [20, 80], [24, 96]
          ].map(([t, px]) => (
            <div key={t} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: px, background: 'var(--color-primary-tint)',
                borderRadius: 2, borderTop: '2px solid var(--color-primary)'
              }} />
              <div className="t-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>--space-{t}</div>
              <div className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-primary)', fontWeight: 600 }}>{px}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────── RADII ─────────── */}
      <SectionHead kicker="01d · Radii" title="Hierarchia bez krzywizny" sub="Kontrole 6 px, karty 8 px, modale/sheets/info-bar 12 px. Nic powyżej 12 px na containerach — pizzeria nie jest dla dzieci." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          ['sm', 4, 'Chip · input small'],
          ['md', 6, 'Button · input default'],
          ['lg', 8, 'Karta produktu · KPI'],
          ['xl', 12, 'Modal · sheet · info-bar'],
          ['full', 9999, 'FAB + · avatar · pulse dot'],
        ].map(([t, r, use]) => (
          <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{
              height: 88, background: 'var(--color-primary-tint)', borderRadius: r,
              border: '1.5px solid var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="t-mono" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{r === 9999 ? '∞' : r + 'px'}</span>
            </div>
            <div className="t-mono" style={{ fontSize: 12, fontWeight: 600 }}>--radius-{t}</div>
            <div className="t-body-sm" style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{use}</div>
          </div>
        ))}
      </div>

      {/* ─────────── SHADOWS ─────────── */}
      <SectionHead kicker="01e · Shadows" title="Tylko modal/sheet/dropdown · zero na kartach" sub="Hierarchia kart przez ramki 1.5 px (border-card → border-strong na hover) + tło. Hover karty = ramka ciemnieje + translateY(-2px). Karty produktów, KPI tiles, kategorie — bez wyjątków." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        <div>
          <div style={{
            height: 120, background: '#fff', border: '1px solid var(--color-border-card)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="t-mono" style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>border 1.5px</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="t-mono" style={{ fontSize: 12, fontWeight: 600 }}>cards · default</div>
            <div className="t-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Brak shadow. Hierarchia przez ramkę + tło.</div>
          </div>
        </div>
        <div>
          <div style={{
            height: 120, background: '#fff', border: '1.5px solid var(--color-border-strong)',
            borderRadius: 8, transform: 'translateY(-2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="t-mono" style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>+ translateY(-2px)</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="t-mono" style={{ fontSize: 12, fontWeight: 600 }}>cards · hover</div>
            <div className="t-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>Ramka ciemnieje #D4D0C2, lift 2 px, 200 ms.</div>
          </div>
        </div>
        <div>
          <div style={{
            height: 120, background: '#fff', borderRadius: 12,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="t-mono" style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>shadow-lg</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <div className="t-mono" style={{ fontSize: 12, fontWeight: 600 }}>modal / sheet / dropdown</div>
            <div className="t-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>0 12px 32px rgba(15,18,25,.12). Tylko tu.</div>
          </div>
        </div>
      </div>

      {/* ─────────── MOTION ─────────── */}
      <SectionHead kicker="01f · Motion" title="120 / 180 / 260 ms · trust signal, nie show-off" sub="Wszystko ease-out lub smooth. Bez bounce. Bez spring overshoot. Powyżej 300 ms drażni. prefers-reduced-motion wyłącza wszystko." />

      <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, overflow: 'hidden' }}>
        {[
          ['fast', '120 ms', 'ease-out', 'Hover fill · ring focus · color swap'],
          ['base', '180 ms', 'smooth', 'Button press · toggle · chip select'],
          ['slow', '260 ms', 'smooth', 'Modal/sheet enter · drawer slide'],
          ['ios', '300 ms', 'iOS spring (0.32, 0.72, 0, 1)', 'Bottom sheet mobile'],
          ['urgent-pulse', '2.5 s loop', 'ease-in-out infinite', 'Karta admin > 10 min waiting'],
          ['dot-pulse', '1.5 s loop', 'ease-in-out infinite', 'Tracking active step ring'],
        ].map(([t, dur, ease, use], i) => (
          <div key={t} style={{
            display: 'grid', gridTemplateColumns: '160px 130px 1fr 1.4fr',
            padding: '16px 24px', gap: 16, alignItems: 'center',
            borderBottom: i < 5 ? '1px solid var(--color-border-subtle)' : 'none'
          }}>
            <div className="t-mono" style={{ fontSize: 13, fontWeight: 600 }}>--motion-{t}</div>
            <div className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{dur}</div>
            <div className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{ease}</div>
            <div className="t-body-sm" style={{ color: 'var(--color-text-body)' }}>{use}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

window.FoundationsArtboard = FoundationsArtboard;
