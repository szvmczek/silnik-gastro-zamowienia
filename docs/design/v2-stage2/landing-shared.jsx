// landing-shared.jsx — shared building blocks used across landing artboards.
// Header, info-bar, free-delivery progress, product card, category chip, footer, banner.
// Goal: every desktop+mobile artboard composes these — single source of truth for hover states.

const { useState, useRef, useEffect } = React;

// ─────── PHOTO PLACEHOLDER ───────
// Striped technical placeholder for any product/hero shot we don't have a real photo for.
// Operator approved imagery strategy: real Unsplash hero, striped placeholder elsewhere.
const StripedPlaceholder = ({ label, ratio = '4 / 3', radius = 8, captionSize = 11 }) => (
  <div style={{
    aspectRatio: ratio,
    background: 'repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)',
    borderRadius: radius,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '100%',
  }}>
    <span style={{
      font: `500 ${captionSize}px/1 var(--font-mono)`,
      color: 'var(--color-text-muted)', letterSpacing: '0.02em',
    }}>{label || 'product shot · 4:3'}</span>
  </div>
);

// Real Unsplash hero — pizza top-down, on a wooden board.
// Used ONLY in hero. All product cards keep striped placeholder per operator brief
// ("real-world Pani Kasia won't have 40 photos on day one — system must look right empty").
const HERO_PHOTO = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80';

// ─────── HEADER (top bar, desktop) ───────
// Sticky on scroll. Logo + nav (Menu / O nas / Kontakt) + telefon + koszyk (badge tylko gdy >0).
// Single-tenant: brak loginu klienta, brak "Śledź zamówienie" (tracking only via /track/:token URL).
// `currentRoute` highlights aktywną pozycję nav: 'home' | 'menu'.
const HeaderDesktop = ({ cartCount = 0, onCartClick, currentRoute = 'home' }) => {
  const navItems = [
    { label: 'Menu',    href: '/menu', kind: 'route', route: 'menu' },
    { label: 'O nas',   href: '#about',   kind: 'anchor' },
    { label: 'Kontakt', href: '#contact', kind: 'anchor' },
  ];
  return (
    <header style={{
      height: 72, background: '#fff',
      borderBottom: '1px solid var(--color-border-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
        <a href="/" style={{ font: '900 22px/1 var(--font-sans)', letterSpacing: '-0.02em', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
          Pizza Demo<span style={{ color: 'var(--color-primary)' }}>.</span>
        </a>
        <nav style={{ display: 'flex', gap: 28 }}>
          {navItems.map(item => {
            const active = item.route && item.route === currentRoute;
            return (
              <a key={item.label} href={item.href} style={{
                font: `${active ? '700' : '500'} 14px/1 var(--font-sans)`,
                color: active ? 'var(--color-text-primary)' : 'var(--color-text-body)',
                textDecoration: 'none',
                borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                paddingBottom: 4,
              }}>{item.label}</a>
            );
          })}
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="tel:+48600000000" style={{ font: '500 14px/1 var(--font-sans)', color: 'var(--color-text-body)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>📞</span> +48 600 000 000
        </a>
        <button onClick={onCartClick} aria-label="Koszyk" style={{
          height: 40, minWidth: 40, padding: cartCount > 0 ? '0 14px 0 12px' : '0', borderRadius: 6,
          background: cartCount > 0 ? 'var(--color-primary)' : '#fff',
          color: cartCount > 0 ? '#fff' : 'var(--color-text-primary)',
          border: cartCount > 0 ? 'none' : '1.5px solid var(--color-border-card)',
          font: '600 14px/1 var(--font-sans)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: 16 }}>🛒</span>
          {cartCount > 0 && <span style={{ fontFamily: 'var(--font-mono)' }}>{cartCount}</span>}
        </button>
      </div>
    </header>
  );
};

// Mobile header — kompaktowy 56 px, logo + telefon + ikona koszyka (gdy >0). Brak hamburgera —
// nawigacja sekcyjna anchor-mi w-page; menu jest osobnym route /menu (CTA z hero).
const HeaderMobile = ({ cartCount = 0, onCartClick }) => (
  <header style={{
    height: 56, background: '#fff',
    borderBottom: '1px solid var(--color-border-card)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px',
    position: 'sticky', top: 0, zIndex: 50,
  }}>
    <a href="/" style={{ font: '900 18px/1 var(--font-sans)', letterSpacing: '-0.02em', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
      Pizza Demo<span style={{ color: 'var(--color-primary)' }}>.</span>
    </a>
    <div style={{ display: 'flex', gap: 8 }}>
      <a href="tel:+48600000000" aria-label="Zadzwoń" style={{ width: 40, height: 40, borderRadius: 6, background: '#fff', border: '1.5px solid var(--color-border-card)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', fontSize: 16 }}>📞</a>
      {cartCount > 0 && (
        <button onClick={onCartClick} aria-label="Koszyk" style={{
          height: 40, padding: '0 12px', borderRadius: 6,
          background: 'var(--color-primary)', color: '#fff', border: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          font: '600 13px/1 var(--font-sans)',
        }}>
          <span style={{ fontSize: 15 }}>🛒</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{cartCount}</span>
        </button>
      )}
    </div>
  </header>
);

// ─────── INFO BAR (signature pattern) ───────
const InfoBar = ({ open = true, compact = false }) => (
  <div style={{
    background: 'var(--color-bg-dark)', color: 'var(--color-text-on-dark)',
    padding: compact ? '14px 16px' : '20px 48px',
    display: 'flex', alignItems: 'center', gap: compact ? 16 : 32, flexWrap: 'wrap',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: open ? '#10B981' : '#DC2626' }} className={open ? 'is-pulsing-green' : ''} />
      <span style={{ font: `600 ${compact ? 13 : 14}px/1 var(--font-sans)` }}>{open ? 'Otwarte teraz · do 22:00' : 'Zamknięte · otwieramy o 11:00'}</span>
    </div>
    {!compact && <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)' }} />}
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: compact ? 14 : 16 }}>🚗</span>
      <span style={{ font: `400 ${compact ? 13 : 14}px/1 var(--font-sans)`, color: 'rgba(255,255,255,0.85)' }}>Dostawa <strong style={{ color: '#fff' }}>35 min</strong></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: compact ? 14 : 16 }}>💰</span>
      <span style={{ font: `400 ${compact ? 13 : 14}px/1 var(--font-sans)`, color: 'rgba(255,255,255,0.85)' }}>Min. <strong style={{ color: '#fff' }}>30 zł</strong></span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: compact ? 14 : 16 }}>🛵</span>
      <span style={{ font: `400 ${compact ? 13 : 14}px/1 var(--font-sans)`, color: 'rgba(255,255,255,0.85)' }}>Dowóz od <strong style={{ color: '#fff' }}>8 zł</strong></span>
    </div>
  </div>
);

// ─────── FREE DELIVERY PROGRESS ───────
// Sticky strip below header. Shows ONLY when cart > 0 (per operator).
// At threshold (50zł) → success state, primary tint background.
const FreeDeliveryProgress = ({ subtotal, threshold = 50 }) => {
  if (subtotal <= 0) return null;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  const reached = remaining === 0;

  return (
    <div style={{
      background: reached ? 'var(--color-primary-tint)' : '#fff',
      borderBottom: '1px solid var(--color-border-card)',
      padding: '10px 48px',
      display: 'flex', alignItems: 'center', gap: 14,
      position: 'sticky', top: 72, zIndex: 49,
    }}>
      <span style={{ fontSize: 14 }}>{reached ? '🎉' : '🛵'}</span>
      <span style={{ font: '500 13px/1.4 var(--font-sans)', color: reached ? 'var(--color-primary)' : 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
        {reached
          ? <>Masz <strong>darmową dostawę</strong>.</>
          : <>Brakuje <strong style={{ fontFamily: 'var(--font-mono)' }}>{remaining.toFixed(2).replace('.', ',')} zł</strong> do darmowej dostawy.</>
        }
      </span>
      <div style={{ flex: 1, height: 6, background: 'var(--color-border-card)', borderRadius: 3, overflow: 'hidden', maxWidth: 360 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 240ms var(--motion-ease)' }} />
      </div>
      <span className="t-mono" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
        {subtotal.toFixed(2).replace('.', ',')} / {threshold} zł
      </span>
    </div>
  );
};

// ─────── CATEGORY CHIPS (sticky scroll-spy) ───────
const CategoryChips = ({ activeId, onJump, compact = false }) => (
  <div style={{
    background: 'var(--color-bg-page)',
    borderBottom: '1px solid var(--color-border-card)',
    padding: compact ? '12px 16px' : '14px 48px',
    display: 'flex', gap: 8, overflowX: 'auto',
    position: 'sticky', top: compact ? 56 : 72, zIndex: 48,
  }}>
    {window.MENU.map(cat => {
      const active = activeId === cat.id;
      return (
        <button key={cat.id} onClick={() => onJump?.(cat.id)} style={{
          height: 36, padding: '0 14px', borderRadius: 4,
          border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border-card)',
          background: active ? 'var(--color-primary-tint)' : '#fff',
          color: active ? 'var(--color-primary)' : 'var(--color-text-body)',
          font: '600 13px/1 var(--font-sans)', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          whiteSpace: 'nowrap', flexShrink: 0,
          transition: 'all 120ms var(--motion-ease)',
        }}>
          <span>{cat.icon}</span> {cat.name}
        </button>
      );
    })}
  </div>
);

// ─────── MOBILE SECTION HEADER BAR ───────
// Subtelny pasek pod sticky chips na mobile (< 768). Pomaga w środku długiego scrolla
// (5 kategorii × 8 produktów → ~40 pozycji w 1 kolumnie). Ratio: tabs są małe i łatwo zgubić
// się, jaka kategoria jest aktywna. Wysokość 32 px, primary tint, scroll-spy aktualizuje.
// Pattern z Glovo mobile.
const MobileSectionHeaderBar = ({ name, count, icon }) => (
  <div style={{
    background: 'var(--color-primary-tint)',
    borderBottom: '1px solid var(--color-border-card)',
    height: 32,
    padding: '0 16px',
    display: 'flex', alignItems: 'center', gap: 8,
    position: 'sticky', top: 56 + 60, zIndex: 47, // header(56) + chips(~60) bo compact ma 12+36+12
  }}>
    {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
    <span style={{ font: '600 13px/1 var(--font-sans)', color: 'var(--color-primary)', letterSpacing: '-0.005em' }}>
      {name}
    </span>
    {typeof count === 'number' && (
      <>
        <span style={{ color: 'var(--color-primary)', opacity: 0.4, fontSize: 11 }}>·</span>
        <span className="t-mono" style={{ fontSize: 11.5, color: 'var(--color-primary)', opacity: 0.75 }}>
          {count} pozycji
        </span>
      </>
    )}
  </div>
);

// ─────── PRODUCT CARD ───────
// Default + hover state — hover handled by inline state, since global :hover doesn't work
// reliably inside DCArtboard (transformed scale context).
const ProductCard = ({ item, onOpen, onQuickAdd }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onOpen?.(item)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: hover ? '1.5px solid var(--color-border-strong)' : '1px solid var(--color-border-card)',
        borderRadius: 8,
        padding: 16,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'transform 200ms var(--motion-ease), border-color 120ms var(--motion-ease)',
        cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative',
      }}>
      <div style={{ position: 'relative' }}>
        <StripedPlaceholder label={`${item.img} · 4:3`} ratio="4 / 3" radius={6} />
        {item.badge && (
          <span style={{
            position: 'absolute', top: 8, left: 8,
            background: item.badge === 'bestseller' ? 'var(--color-primary)' : item.badge === 'nowość' ? 'var(--color-accent-yellow)' : 'var(--color-bg-dark)',
            color: item.badge === 'nowość' ? '#1A1A1A' : '#fff',
            font: '600 10px/1 var(--font-sans)', letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '5px 7px', borderRadius: 4,
          }}>{item.badge}</span>
        )}
        {item.tags && item.tags.length > 0 && (
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
            {item.tags.map(t => (
              <span key={t} style={{ width: 24, height: 24, borderRadius: 4, background: 'rgba(255,255,255,0.92)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>{t}</span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 64 }}>
        <h3 style={{ font: '700 16px/1.2 var(--font-sans)', letterSpacing: '-0.015em', margin: 0, color: 'var(--color-text-primary)' }}>{item.name}</h3>
        <p style={{ font: '400 13px/1.45 var(--font-sans)', color: 'var(--color-text-body)', margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{item.desc}</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div>
          <span style={{ font: '600 17px/1 var(--font-mono)', color: 'var(--color-text-primary)' }}>
            {item.priceFrom.toFixed(2).replace('.', ',')} zł
          </span>
          {item.priceFrom > 25 && <span style={{ font: '400 11px/1 var(--font-sans)', color: 'var(--color-text-muted)', marginLeft: 6 }}>od</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onQuickAdd?.(item); }} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--color-primary)', color: '#fff',
          border: 'none', cursor: 'pointer',
          font: '400 22px/1 var(--font-sans)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transform: hover ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 120ms var(--motion-ease)',
        }}>+</button>
      </div>
    </div>
  );
};

// ─────── ABOUT / HOURS / CONTACT (homepage sections) ───────
// Sekcje "O nas", "Godziny otwarcia", "Kontakt + mapa" — wyłącznie na homepage /.
// Klient pierwszy raz wchodzi na pizzademo.pl → widzi co to za miejsce → klika "Zobacz menu".
// Operator mówi: bez storytellingu. Konkretnie: rok założenia, krasnaludzia kuchnia, zdjecia placeholder.

const AboutSection = ({ compact = false }) => {
  const pad = compact ? '40px 16px' : '80px 48px';
  const cols = compact ? '1fr' : '5fr 6fr';
  return (
    <section id="about" style={{ padding: pad, background: '#fff', borderTop: '1px solid var(--color-border-card)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: compact ? 24 : 64, alignItems: 'center' }}>
        <div>
          <div className="t-kicker t-kicker--accent" style={{ marginBottom: compact ? 12 : 16 }}>O NAS</div>
          <h2 style={{ font: `800 ${compact ? 28 : 44}px/1.1 var(--font-sans)`, letterSpacing: '-0.025em', margin: 0, color: 'var(--color-text-primary)' }}>
            Pizzeria od <span style={{ color: 'var(--color-primary)' }}>2018</span>.<br/>
            W rodzinnej kuchni.
          </h2>
          <p style={{ font: `400 ${compact ? 15 : 17}px/1.6 var(--font-sans)`, color: 'var(--color-text-body)', marginTop: compact ? 16 : 24, maxWidth: 480 }}>
            Robimy klasyczne pizze, kurczaki i zapiekanki na cienkim, własnym ciescie.
            Codziennie świeże składniki, własny sos pomidorowy.
            Dostawa w Warszawie i okolicach.
          </p>
          <div style={{ display: 'flex', gap: compact ? 16 : 32, marginTop: compact ? 24 : 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{ font: `700 ${compact ? 24 : 32}px/1 var(--font-mono)`, color: 'var(--color-text-primary)' }}>8</div>
              <div style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--color-text-muted)', marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>lat na rynku</div>
            </div>
            <div>
              <div style={{ font: `700 ${compact ? 24 : 32}px/1 var(--font-mono)`, color: 'var(--color-text-primary)' }}>40+</div>
              <div style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--color-text-muted)', marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>pozycji w menu</div>
            </div>
            <div>
              <div style={{ font: `700 ${compact ? 24 : 32}px/1 var(--font-mono)`, color: 'var(--color-text-primary)' }}>35 min</div>
              <div style={{ font: '500 12px/1 var(--font-sans)', color: 'var(--color-text-muted)', marginTop: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>średni czas dostawy</div>
            </div>
          </div>
        </div>
        {!compact && (
          <div style={{
            aspectRatio: '4 / 3',
            borderRadius: 12,
            border: '1px solid var(--color-border-card)',
            overflow: 'hidden',
          }}>
            <StripedPlaceholder label="team / wnetrze · 4:3" ratio="4 / 3" radius={0} captionSize={13} />
          </div>
        )}
      </div>
    </section>
  );
};

const HoursSection = ({ compact = false }) => {
  const days = [
    { label: 'Poniedziałek', hrs: '11:00 – 22:00' },
    { label: 'Wtorek',       hrs: '11:00 – 22:00' },
    { label: 'Środa',        hrs: '11:00 – 22:00' },
    { label: 'Czwartek',     hrs: '11:00 – 22:00' },
    { label: 'Piątek',       hrs: '11:00 – 23:00' },
    { label: 'Sobota',       hrs: '12:00 – 23:00' },
    { label: 'Niedziela',    hrs: '12:00 – 22:00' },
  ];
  const today = 4; // piątek mock-up; w prod z new Date().getDay()
  return (
    <section id="hours" style={{ padding: compact ? '40px 16px' : '80px 48px', background: 'var(--color-bg-page)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="t-kicker t-kicker--accent" style={{ marginBottom: compact ? 12 : 16, textAlign: 'center' }}>GODZINY OTWARCIA</div>
        <h2 style={{ font: `800 ${compact ? 26 : 40}px/1.1 var(--font-sans)`, letterSpacing: '-0.025em', margin: 0, color: 'var(--color-text-primary)', textAlign: 'center' }}>
          Codziennie. Bez wyjątków<span style={{ color: 'var(--color-primary)' }}>.</span>
        </h2>
        <div style={{ marginTop: compact ? 24 : 36, background: '#fff', borderRadius: 12, border: '1px solid var(--color-border-card)', overflow: 'hidden' }}>
          {days.map((d, i) => {
            const isToday = i === today;
            return (
              <div key={d.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: compact ? '14px 16px' : '16px 24px',
                borderBottom: i === days.length - 1 ? 'none' : '1px solid var(--color-border-card)',
                background: isToday ? 'var(--color-primary-tint)' : 'transparent',
              }}>
                <span style={{
                  font: `${isToday ? '700' : '500'} ${compact ? 14 : 15}px/1 var(--font-sans)`,
                  color: isToday ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                }}>
                  {d.label}
                  {isToday && <span style={{ font: '700 10px/1 var(--font-sans)', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'var(--color-primary)', color: '#fff', padding: '4px 6px', borderRadius: 3 }}>dziś</span>}
                </span>
                <span style={{
                  font: `${isToday ? '700' : '500'} ${compact ? 14 : 15}px/1 var(--font-mono)`,
                  color: isToday ? 'var(--color-primary)' : 'var(--color-text-body)',
                }}>{d.hrs}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const ContactMapSection = ({ compact = false }) => {
  // OSM iframe — publiczne, bez API key. Centrum Warszawa, mock pin.
  const osmSrc = 'https://www.openstreetmap.org/export/embed.html?bbox=21.0050%2C52.2270%2C21.0250%2C52.2370&layer=mapnik&marker=52.2320%2C21.0150';
  return (
    <section id="contact" style={{ padding: compact ? '40px 16px' : '80px 48px', background: '#fff', borderTop: '1px solid var(--color-border-card)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: compact ? 24 : 64 }}>
        <div>
          <div className="t-kicker t-kicker--accent" style={{ marginBottom: compact ? 12 : 16 }}>KONTAKT</div>
          <h2 style={{ font: `800 ${compact ? 28 : 40}px/1.1 var(--font-sans)`, letterSpacing: '-0.025em', margin: 0, color: 'var(--color-text-primary)' }}>
            Zadzwoń albo zamów online<span style={{ color: 'var(--color-primary)' }}>.</span>
          </h2>
          <div style={{ marginTop: compact ? 24 : 36, display: 'flex', flexDirection: 'column', gap: compact ? 16 : 20 }}>
            <div>
              <div className="t-kicker" style={{ color: 'var(--color-text-muted)', marginBottom: 6 }}>ADRES</div>
              <div style={{ font: `500 ${compact ? 15 : 16}px/1.4 var(--font-sans)`, color: 'var(--color-text-primary)' }}>
                ul. Warszawska 12<br/>00-000 Warszawa
              </div>
            </div>
            <div>
              <div className="t-kicker" style={{ color: 'var(--color-text-muted)', marginBottom: 6 }}>TELEFON</div>
              <a href="tel:+48600000000" style={{ font: `600 ${compact ? 17 : 20}px/1 var(--font-mono)`, color: 'var(--color-text-primary)', textDecoration: 'none' }}>+48 600 000 000</a>
            </div>
            <div>
              <div className="t-kicker" style={{ color: 'var(--color-text-muted)', marginBottom: 6 }}>E-MAIL</div>
              <a href="mailto:kontakt@pizzademo.pl" style={{ font: `500 ${compact ? 14 : 15}px/1 var(--font-sans)`, color: 'var(--color-text-body)', textDecoration: 'none' }}>kontakt@pizzademo.pl</a>
            </div>
            <div>
              <div className="t-kicker" style={{ color: 'var(--color-text-muted)', marginBottom: 6 }}>STREFA DOSTAWY</div>
              <div style={{ font: `400 ${compact ? 14 : 15}px/1.5 var(--font-sans)`, color: 'var(--color-text-body)' }}>
                Warszawa Centrum, Mokotów, Wola, Ochota.<br/>
                <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>Sprawdź swój adres →</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{
          aspectRatio: compact ? '4 / 3' : '1 / 1',
          borderRadius: 12, overflow: 'hidden',
          border: '1px solid var(--color-border-card)',
          minHeight: compact ? 240 : 0,
        }}>
          <iframe
            title="Mapa"
            src={osmSrc}
            style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

// ─────── FOOTER ───────
const Footer = ({ compact = false }) => (
  <footer style={{
    background: 'var(--color-bg-dark)', color: 'var(--color-text-on-dark)',
    padding: compact ? '40px 16px 24px' : '64px 48px 32px',
  }}>
    <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '2fr 1fr 1fr 1fr', gap: compact ? 32 : 64, marginBottom: compact ? 32 : 48 }}>
      <div>
        <span style={{ font: '900 28px/1 var(--font-sans)', letterSpacing: '-0.02em' }}>
          Pizza Demo<span style={{ color: 'var(--color-primary)' }}>.</span>
        </span>
        <p style={{ font: '400 14px/1.55 var(--font-sans)', color: 'rgba(255,255,255,0.7)', marginTop: 16, maxWidth: 320 }}>
          Pizzeria od 2018. Dostawa codziennie 11:00–22:00.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {['Facebook', 'Instagram'].map(s => (
            <a key={s} href="#" style={{
              width: 36, height: 36, borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', textDecoration: 'none', font: '500 11px/1 var(--font-sans)',
            }}>{s[0]}</a>
          ))}
        </div>
      </div>
      <div>
        <div className="t-kicker" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Kontakt</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, font: '500 14px/1.4 var(--font-sans)' }}>
          <a href="tel:+48600000000" style={{ color: '#fff', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>+48 600 000 000</a>
          <a href="mailto:kontakt@pizzademo.pl" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>kontakt@pizzademo.pl</a>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>ul. Warszawska 12, Warszawa</span>
        </div>
      </div>
      <div>
        <div className="t-kicker" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Godziny</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, font: '500 14px/1.4 var(--font-sans)' }}>
          <span>Pn–Pt: <span style={{ color: 'rgba(255,255,255,0.7)' }}>11:00 – 22:00</span></span>
          <span>Sb–Nd: <span style={{ color: 'rgba(255,255,255,0.7)' }}>12:00 – 23:00</span></span>
        </div>
      </div>
      <div>
        <div className="t-kicker" style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>Informacje</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, font: '500 14px/1.4 var(--font-sans)' }}>
          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Regulamin</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Polityka prywatności</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Strefa dostawy</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Kontakt</a>
        </div>
      </div>
    </div>
    <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
      <span style={{ font: '400 12px/1 var(--font-sans)', color: 'rgba(255,255,255,0.5)' }}>© 2026 Pizza Demo. Wszystkie prawa zastrzeżone.</span>
      <span className="t-mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>v2.0 · od 2018</span>
    </div>
  </footer>
);

// ─────── CLOSED BANNER ───────
const ClosedBanner = ({ variant = 'planned' }) => {
  const map = {
    planned:    { icon: '🌙', text: <>Otwieramy o <strong>11:00</strong>. Możesz przeglądać menu, ale zamówienia przyjmujemy od rana.</> },
    until:      { icon: '⚠',  text: <>Tymczasowo zamknięte do <strong>19:00</strong> — awaria pieca. Przepraszamy.</> },
    indefinite: { icon: '⚠',  text: <>Tymczasowo zamknięte. Wrócimy jak najszybciej.</> },
  };
  const { icon, text } = map[variant];
  return (
    <div style={{
      background: '#FEE2E2', color: '#991B1B',
      padding: '14px 48px',
      display: 'flex', alignItems: 'center', gap: 12,
      font: '500 14px/1.4 var(--font-sans)',
      borderBottom: '1px solid #FCA5A5',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ flex: 1 }}>{text}</span>
    </div>
  );
};

Object.assign(window, {
  StripedPlaceholder, HERO_PHOTO,
  HeaderDesktop, HeaderMobile,
  InfoBar, FreeDeliveryProgress, CategoryChips, MobileSectionHeaderBar,
  ProductCard, Footer, ClosedBanner,
  AboutSection, HoursSection, ContactMapSection,
});
