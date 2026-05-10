// components.jsx — Buttons, badges, inputs, cards, modal, chip, stepper, toast, status pills

const SH = ({ kicker, title, sub }) => (
  <div style={{ marginBottom: 28 }}>
    <div className="t-kicker t-kicker--accent" style={{ marginBottom: 10 }}>{kicker}</div>
    <h2 className="t-h2" style={{ margin: '0 0 8px 0' }}>{title}</h2>
    {sub && <p className="t-body" style={{ margin: 0, maxWidth: 640 }}>{sub}</p>}
  </div>
);

const Card = ({ title, children }) => (
  <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 12, padding: 24 }}>
    <div className="t-kicker" style={{ marginBottom: 16 }}>{title}</div>
    {children}
  </div>
);

// ─────── Buttons ───────
const btnBase = {
  font: '600 14px/1 var(--font-sans)',
  letterSpacing: '-0.005em',
  border: 'none', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  gap: 8, borderRadius: 6,
  transition: 'all var(--motion-fast) var(--motion-ease)',
};
const Btn = ({ variant = 'primary', size = 'md', children, disabled, full }) => {
  const sizes = {
    sm: { height: 32, padding: '0 12px', fontSize: 13 },
    md: { height: 44, padding: '0 18px' },
    lg: { height: 48, padding: '0 22px', fontSize: 15 },
    xl: { height: 56, padding: '0 28px', fontSize: 16 },
  };
  const variants = {
    primary: { background: 'var(--color-primary)', color: '#fff' },
    'primary-hover': { background: 'var(--color-primary-hover)', color: '#fff' },
    secondary: { background: 'var(--color-bg-dark)', color: 'var(--color-text-on-dark)' },
    ghost: { background: 'transparent', color: 'var(--color-text-primary)', border: '1.5px solid var(--color-border-card)' },
    'ghost-hover': { background: 'var(--color-bg-section)', color: 'var(--color-text-primary)', border: '1.5px solid var(--color-border-strong)' },
    danger: { background: '#fff', color: 'var(--status-cancelled)', border: '1.5px solid var(--status-cancelled)' },
    link: { background: 'transparent', color: 'var(--color-primary)', height: 'auto', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 },
  };
  return (
    <button disabled={disabled} style={{
      ...btnBase, ...sizes[size], ...variants[variant],
      width: full ? '100%' : 'auto',
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}>{children}</button>
  );
};

// ─────── Badge ───────
const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: { background: 'var(--color-primary)', color: '#fff' },
    accent: { background: 'var(--color-accent-yellow)', color: '#1A1A1A' },
    new: { background: 'var(--status-new-tint)', color: '#92400E', border: '1px solid #F59E0B' },
    inverse: { background: 'var(--color-bg-dark)', color: '#fff' },
    soft: { background: 'var(--color-primary-tint)', color: 'var(--color-primary)' },
  };
  return (
    <span style={{
      ...variants[variant],
      font: '600 11px/1 var(--font-sans)', letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '6px 8px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4
    }}>{children}</span>
  );
};

// ─────── Status pill ───────
const StatusPill = ({ status }) => {
  const map = {
    NEW: ['Nowe', '#92400E', 'var(--status-new-tint)', '#F59E0B'],
    CONFIRMED: ['Przyjęte', '#1E40AF', 'var(--status-confirmed-tint)', '#3B82F6'],
    IN_PREPARATION: ['W kuchni', '#9D1B26', 'var(--status-prep-tint)', '#E63946'],
    READY: ['Gotowe', '#065F46', 'var(--status-ready-tint)', '#10B981'],
    OUT_FOR_DELIVERY: ['W drodze', '#3730A3', 'var(--status-out-tint)', '#6366F1'],
    DELIVERED: ['Dostarczone', '#374151', 'var(--status-delivered-tint)', '#6B7280'],
    CANCELED: ['Anulowane', '#991B1B', 'var(--status-cancelled-tint)', '#DC2626'],
  };
  const [label, fg, bg, dot] = map[status];
  return (
    <span style={{
      background: bg, color: fg, padding: '6px 10px', borderRadius: 9999,
      font: '600 12px/1 var(--font-sans)', display: 'inline-flex', alignItems: 'center', gap: 6
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
      {label}
    </span>
  );
};

// ─────── Input ───────
const Input = ({ label, value = '', placeholder, error, hint, type = 'text' }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <span className="t-kicker" style={{ color: 'var(--color-text-muted)' }}>{label}</span>}
    <div style={{
      height: 44, padding: '0 14px', borderRadius: 6,
      background: '#fff',
      border: error ? '1.5px solid var(--status-cancelled)' : '1.5px solid var(--color-border-card)',
      display: 'flex', alignItems: 'center',
      font: '400 15px/1 var(--font-sans)',
      color: value ? 'var(--color-text-primary)' : 'var(--color-text-faint)'
    }}>{value || placeholder}</div>
    {hint && !error && <span className="t-body-sm" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{hint}</span>}
    {error && <span className="t-body-sm" style={{ fontSize: 12, color: 'var(--status-cancelled)' }}>{error}</span>}
  </label>
);

// ─────── Stepper ───────
const Stepper = ({ value = 2 }) => (
  <div style={{ display: 'inline-flex', border: '1.5px solid var(--color-border-card)', borderRadius: 6, overflow: 'hidden', height: 36 }}>
    <button style={{ width: 36, background: '#fff', border: 'none', cursor: 'pointer', font: '600 16px/1 var(--font-sans)', color: 'var(--color-text-primary)' }}>−</button>
    <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1.5px solid var(--color-border-card)', borderRight: '1.5px solid var(--color-border-card)', font: '600 14px/1 var(--font-sans)' }}>{value}</div>
    <button style={{ width: 36, background: '#fff', border: 'none', cursor: 'pointer', font: '600 16px/1 var(--font-sans)', color: 'var(--color-primary)' }}>+</button>
  </div>
);

// ─────── Chip ───────
const Chip = ({ children, active, icon }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    height: 32, padding: '0 12px', borderRadius: 4,
    border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border-card)',
    background: active ? 'var(--color-primary-tint)' : '#fff',
    color: active ? 'var(--color-primary)' : 'var(--color-text-body)',
    font: '600 13px/1 var(--font-sans)', cursor: 'pointer',
  }}>{icon}{children}</span>
);

// ─────── FAB + ───────
const FAB = ({ size = 44 }) => (
  <button style={{
    width: size, height: size, borderRadius: '50%',
    background: 'var(--color-primary)', color: '#fff',
    border: 'none', cursor: 'pointer',
    font: `400 ${size === 44 ? 22 : 20}px/1 var(--font-sans)`,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
  }}>+</button>
);

const ComponentsArtboard = () => {
  return (
    <div style={{ width: 1280, padding: '48px 56px', background: 'var(--color-bg-page)', fontFamily: 'var(--font-sans)' }}>

      {/* Buttons */}
      <SH kicker="02a · Buttons" title="Primary, secondary, ghost, danger" sub="Heights 32 / 44 / 48 / 56. Primary CTA na akcjach głównych — koszyk, checkout, status change. Secondary (czarny) gdy primary zarezerwowany dla brand moment." />
      <Card title="Variants × sizes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Btn variant="primary" size="sm">Akcja</Btn>
            <Btn variant="primary" size="md">Dodaj do koszyka</Btn>
            <Btn variant="primary" size="lg">Złóż zamówienie</Btn>
            <Btn variant="primary" size="xl">Przyjmij zamówienie</Btn>
            <span className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>primary · 32/44/48/56</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Btn variant="primary-hover" size="md">Hover state</Btn>
            <Btn variant="primary" size="md" disabled>Disabled</Btn>
            <Btn variant="secondary" size="md">Zadzwoń do restauracji</Btn>
            <Btn variant="ghost" size="md">Zobacz menu</Btn>
            <Btn variant="ghost-hover" size="md">Ghost · hover</Btn>
            <Btn variant="danger" size="md">Anuluj zamówienie</Btn>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Btn variant="link">Zapomniałeś hasła?</Btn>
            <FAB />
            <FAB size={36} />
            <span className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>FAB 44px (mobile target) / 36px (sidebar koszyka)</span>
          </div>
        </div>
      </Card>

      <div style={{ height: 32 }} />

      {/* Badges + Status */}
      <SH kicker="02b · Badges & status" title="Punktowe akcenty, lockowane statusy" sub="Badge produkt — bestseller / nowość / promocja. Tylko jeden naraz. Status pill — admin operations, locked palette." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Product badges (max 1 per karta)">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge variant="primary">Bestseller</Badge>
            <Badge variant="accent">Nowość</Badge>
            <Badge variant="soft">−15%</Badge>
            <Badge variant="inverse">Polecane</Badge>
            <Badge variant="new">📝 3</Badge>
          </div>
          <div className="t-body-sm" style={{ color: 'var(--color-text-muted)', marginTop: 16 }}>
            Ostre i wege — ikony 🌶 🌱 nie badge'y. Lewy górny róg karty 8 px.
          </div>
        </Card>
        <Card title="Status pills · admin operations">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusPill status="NEW" />
            <StatusPill status="CONFIRMED" />
            <StatusPill status="IN_PREPARATION" />
            <StatusPill status="READY" />
            <StatusPill status="OUT_FOR_DELIVERY" />
            <StatusPill status="DELIVERED" />
            <StatusPill status="CANCELED" />
          </div>
        </Card>
      </div>

      <div style={{ height: 32 }} />

      {/* Inputs */}
      <SH kicker="02c · Inputs & forms" title="Czytelność > sprytność" sub="Border 1.5 px, focus ring primary 3 px @ 25% alpha. Walidacja inline z micro-copy 12 px pod polem. Polski format adresu." />
      <Card title="Form controls">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          <Input label="Imię" value="Magda" />
          <Input label="Telefon" placeholder="+48 600 000 000" />
          <Input label="Kod pocztowy" value="05-092" />
          <Input label="Email" placeholder="ty@adres.pl" hint="Wyślemy tu link do śledzenia." />
          <Input label="Miasto" value="Warszawa" />
          <Input label="Ulica i numer" value="" placeholder="np. Warszawska 12/4" error="To pole jest wymagane." />
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Stepper value={2} />
          <Chip>30 cm</Chip>
          <Chip active>40 cm · 42,90 zł</Chip>
          <Chip>Wymagane</Chip>
          <Chip icon="🌶">Ostre</Chip>
          <Chip icon="🌱">Wege</Chip>
        </div>
      </Card>

      <div style={{ height: 32 }} />

      {/* Cards */}
      <SH kicker="02d · Cards" title="Hierarchia bez shadow" sub="Default: ramka 1 px border-card. Hover: ramka 1.5 px border-strong + translateY(-2px) 200 ms. Selected (radio cards): 2 px primary + primary-tint bg." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div style={{ background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: 8, padding: 20 }}>
          <div className="t-kicker" style={{ marginBottom: 8 }}>Default</div>
          <h3 className="t-h3" style={{ margin: 0 }}>Mafia 40 cm</h3>
          <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-body)' }}>Pepperoni, salami, jalapeño, mozzarella.</p>
          <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>42,90 zł</div>
        </div>
        <div style={{ background: '#fff', border: '1.5px solid var(--color-border-strong)', borderRadius: 8, padding: 20, transform: 'translateY(-2px)' }}>
          <div className="t-kicker" style={{ marginBottom: 8 }}>Hover</div>
          <h3 className="t-h3" style={{ margin: 0 }}>Mafia 40 cm</h3>
          <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-body)' }}>Pepperoni, salami, jalapeño, mozzarella.</p>
          <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600 }}>42,90 zł</div>
        </div>
        <div style={{ background: 'var(--color-primary-tint)', border: '2px solid var(--color-primary)', borderRadius: 8, padding: 19 }}>
          <div className="t-kicker t-kicker--accent" style={{ marginBottom: 8 }}>Selected (radio)</div>
          <h3 className="t-h3" style={{ margin: 0, color: 'var(--color-primary)' }}>40 cm</h3>
          <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-primary)' }}>Wybrane do koszyka.</p>
          <div style={{ marginTop: 16, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: 'var(--color-primary)' }}>42,90 zł</div>
        </div>
      </div>

      <div style={{ height: 32 }} />

      {/* Modal + Toast */}
      <SH kicker="02e · Overlays" title="Modal · sheet · toast" sub="Modal max 600 px, radius 12, shadow-lg. Sheet bottom 90 vh z handle 36×4. Toast slide-in z góry, auto-dismiss 2 s." />
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* Modal mock */}
        <div style={{ position: 'relative', height: 360, background: 'rgba(0,0,0,0.5)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 380, background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: 140,
              background: 'repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>product shot · 4:3</span>
            </div>
            <div style={{ padding: 20 }}>
              <h3 className="t-h2" style={{ margin: 0, fontSize: 22 }}>Mafia</h3>
              <p className="t-body-sm" style={{ marginTop: 6, color: 'var(--color-text-body)' }}>Pepperoni, salami, jalapeño, czerwona cebula, mozzarella, sos pomidorowy.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--color-border-subtle)' }}>
                <Stepper value={1} />
                <div style={{ flex: 1 }}><Btn variant="primary" size="lg" full>Dodaj · 42,90 zł</Btn></div>
              </div>
            </div>
          </div>
        </div>
        {/* Toast & sheet handle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Toast · success">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'var(--color-bg-dark)', color: '#fff',
              padding: '12px 16px', borderRadius: 8,
              font: '500 14px/1.2 var(--font-sans)', boxShadow: 'var(--shadow-lg)'
            }}>
              <span style={{ color: '#10B981' }}>✓</span> Dodano do koszyka
            </div>
            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--color-bg-dark)', color: '#fff', padding: '12px 16px', borderRadius: 8, font: '500 14px/1.2 var(--font-sans)' }}>
              Status: <span style={{ fontFamily: 'var(--font-mono)' }}>#2026-00184</span> → Gotowe
            </div>
          </Card>
          <Card title="Bottom sheet handle">
            <div style={{ height: 80, background: '#fff', border: '1px solid var(--color-border-card)', borderRadius: '12px 12px 0 0', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{
                position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
                width: 36, height: 4, background: 'var(--color-border-strong)', borderRadius: 2
              }} />
              <div className="t-body-sm" style={{ position: 'absolute', bottom: 14, left: 16, color: 'var(--color-text-muted)' }}>swipe-down zamyka · 300 ms iOS spring</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Banner closed */}
      <div style={{ height: 32 }} />
      <SH kicker="02f · Banner & alerts" title="Restaurant closed · global" sub="Pojawia się na każdym ekranie publicznym gdy isOpenNow() = false. Polling 60 s. Bez X — znika sam." />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '14px 20px', borderRadius: 8, font: '500 14px/1.4 var(--font-sans)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠</span> Tymczasowo zamknięte. Otwieramy o <strong>11:00</strong>.
        </div>
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '14px 20px', borderRadius: 8, font: '500 14px/1.4 var(--font-sans)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>⚠</span> Tymczasowo zamknięte do <strong>19:00</strong>. Awaria pieca.
        </div>
        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '14px 20px', borderRadius: 8, font: '500 14px/1.4 var(--font-sans)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🎉</span> Brakuje <strong>8 zł</strong> do darmowej dostawy.
        </div>
        <div style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary)', padding: '14px 20px', borderRadius: 8, font: '500 14px/1.4 var(--font-sans)', display: 'flex', alignItems: 'center', gap: 10 }}>
          Brakuje <strong>5 zł</strong> do minimum zamówienia (30 zł).
        </div>
      </div>
    </div>
  );
};

window.ComponentsArtboard = ComponentsArtboard;
window.DSBtn = Btn;
window.DSBadge = Badge;
window.DSStatusPill = StatusPill;
window.DSStepper = Stepper;
window.DSChip = Chip;
window.DSFAB = FAB;
