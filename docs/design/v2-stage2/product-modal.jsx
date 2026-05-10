// product-modal.jsx — Modal (desktop) and bottom sheet (mobile) with size + extras configurator.
// Size 30/40/50, dynamic price; extras are radio cards-as-checkboxes; qty stepper; add to cart CTA.

const { useState: useStateModal } = React;

const SIZE_PRICES = {
  '30': { label: '30 cm', mul: 1.0, persons: '1 osoba' },
  '40': { label: '40 cm', mul: 1.5, persons: '2 osoby' },
  '50': { label: '50 cm', mul: 2.0, persons: '3-4 osoby' },
};

const EXTRAS = [
  { id: 'cheese', label: 'Ekstra ser', price: 5.00 },
  { id: 'jalapeno', label: 'Jalapeño', price: 3.00 },
  { id: 'mushroom', label: 'Pieczarki', price: 3.00 },
  { id: 'olives', label: 'Oliwki', price: 3.00 },
  { id: 'onion', label: 'Czerwona cebula', price: 2.50 },
  { id: 'corn', label: 'Kukurydza', price: 2.50 },
  { id: 'pepper', label: 'Papryka', price: 3.00 },
  { id: 'arugula', label: 'Rukola', price: 4.00 },
];

const ProductConfigurator = ({ item, mobile = false }) => {
  const [size, setSize] = useStateModal('40');
  const [extras, setExtras] = useStateModal(['cheese', 'jalapeno']);
  const [qty, setQty] = useStateModal(1);

  const basePrice = (item?.priceFrom || 28.90);
  const sizeMul = SIZE_PRICES[size].mul;
  const extrasTotal = extras.reduce((s, eid) => s + (EXTRAS.find(e => e.id === eid)?.price || 0), 0);
  const lineTotal = (basePrice * sizeMul + extrasTotal) * qty;

  const toggleExtra = (id) => {
    setExtras(extras.includes(id) ? extras.filter(e => e !== id) : [...extras, id]);
  };

  const isPizza = item?.id?.startsWith?.('mafia') || item?.id?.startsWith?.('margherita') || item?.priceFrom > 25;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <div style={{ position: 'relative', height: mobile ? 200 : 240 }}>
        <window.StripedPlaceholder label="product shot · 4:3" radius={0} ratio={mobile ? '375 / 200' : '600 / 240'} />
        {item?.badge && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: item.badge === 'bestseller' ? 'var(--color-primary)' : 'var(--color-bg-dark)',
            color: '#fff',
            font: '600 11px/1 var(--font-sans)', letterSpacing: '0.04em', textTransform: 'uppercase',
            padding: '6px 8px', borderRadius: 4,
          }}>{item.badge}</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: mobile ? '20px 16px' : '24px 28px', overflowY: 'auto', flex: 1 }}>
        <h2 style={{ font: `700 ${mobile ? 22 : 26}px/1.15 var(--font-sans)`, letterSpacing: '-0.02em', margin: 0, color: 'var(--color-text-primary)' }}>
          {item?.name || 'Produkt'}
        </h2>
        <p style={{ font: '400 14px/1.55 var(--font-sans)', color: 'var(--color-text-body)', margin: '8px 0 0' }}>
          {item?.desc || ''}
        </p>

        {/* Size selector — pizza only */}
        {isPizza && (
          <div style={{ marginTop: 22 }}>
            <div className="t-kicker" style={{ marginBottom: 10 }}>Rozmiar</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {Object.entries(SIZE_PRICES).map(([key, s]) => {
                const active = size === key;
                const price = (basePrice * s.mul).toFixed(2).replace('.', ',');
                return (
                  <button key={key} onClick={() => setSize(key)} style={{
                    padding: '12px 10px', borderRadius: 6,
                    background: active ? 'var(--color-primary-tint)' : '#fff',
                    border: active ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border-card)',
                    cursor: 'pointer', textAlign: 'center',
                    display: 'flex', flexDirection: 'column', gap: 4,
                    color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  }}>
                    <span style={{ font: '700 16px/1 var(--font-sans)' }}>{s.label}</span>
                    <span style={{ font: '500 11px/1 var(--font-sans)', color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{s.persons}</span>
                    <span style={{ font: '600 13px/1 var(--font-mono)', marginTop: 2 }}>{price} zł</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Extras */}
        {isPizza && (
          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <span className="t-kicker">Dodatki</span>
              <span className="t-body-sm" style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>opcjonalnie</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(2, 1fr)', gap: 8 }}>
              {EXTRAS.map(e => {
                const active = extras.includes(e.id);
                return (
                  <button key={e.id} onClick={() => toggleExtra(e.id)} style={{
                    padding: '10px 12px', borderRadius: 6,
                    background: active ? 'var(--color-primary-tint)' : '#fff',
                    border: active ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border-card)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    font: '500 13px/1.2 var(--font-sans)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 3,
                        background: active ? 'var(--color-primary)' : '#fff',
                        border: active ? 'none' : '1.5px solid var(--color-border-strong)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', font: '700 11px/1 var(--font-sans)',
                      }}>{active ? '✓' : ''}</span>
                      {e.label}
                    </span>
                    <span style={{ font: '600 12px/1 var(--font-mono)', color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>+{e.price.toFixed(2).replace('.', ',')}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Note input — always */}
        <div style={{ marginTop: 22 }}>
          <div className="t-kicker" style={{ marginBottom: 10 }}>Uwagi do zamówienia</div>
          <textarea
            placeholder="np. Bez cebuli, dzwonić — domofon nie działa"
            maxLength={200}
            style={{
              width: '100%', minHeight: 64, padding: '10px 12px',
              border: '1.5px solid var(--color-border-card)',
              borderRadius: 6, font: '400 14px/1.5 var(--font-sans)',
              resize: 'vertical', boxSizing: 'border-box', background: '#fff',
            }}
          />
          <div style={{ textAlign: 'right' }}><span className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>0 / 200</span></div>
        </div>
      </div>

      {/* Footer — sticky add-to-cart */}
      <div style={{
        padding: mobile ? '12px 16px' : '16px 28px',
        borderTop: '1px solid var(--color-border-subtle)',
        background: '#fff',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ display: 'inline-flex', border: '1.5px solid var(--color-border-card)', borderRadius: 6, overflow: 'hidden', height: 48, flexShrink: 0 }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 44, background: '#fff', border: 'none', cursor: 'pointer', font: '600 18px/1 var(--font-sans)' }}>−</button>
          <div style={{ width: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1.5px solid var(--color-border-card)', borderRight: '1.5px solid var(--color-border-card)', font: '700 16px/1 var(--font-sans)' }}>{qty}</div>
          <button onClick={() => setQty(qty + 1)} style={{ width: 44, background: '#fff', border: 'none', cursor: 'pointer', font: '600 18px/1 var(--font-sans)', color: 'var(--color-primary)' }}>+</button>
        </div>
        <button style={{
          flex: 1, height: 48, borderRadius: 6,
          background: 'var(--color-primary)', color: '#fff',
          border: 'none', cursor: 'pointer',
          font: '700 14px/1 var(--font-sans)', letterSpacing: '-0.005em',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          Dodaj · {lineTotal.toFixed(2).replace('.', ',')} zł
        </button>
      </div>
    </div>
  );
};

// Desktop modal — centered, max 600 wide, shadow-lg
const ProductModalDesktop = ({ item, onClose }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
    <div style={{ width: 600, maxHeight: '90%', background: '#fff', borderRadius: 12, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 12, right: 12, zIndex: 2,
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
        font: '400 18px/1 var(--font-sans)', color: 'var(--color-text-primary)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>✕</button>
      <ProductConfigurator item={item} />
    </div>
  </div>
);

// Mobile sheet — bottom sheet 90vh, handle, swipe-down
const ProductSheetMobile = ({ item, onClose }) => (
  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 60 }}>
    <div style={{ height: '90%', background: '#fff', borderRadius: '16px 16px 0 0', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 36, height: 4, background: 'var(--color-border-strong)', borderRadius: 2, zIndex: 2 }} />
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 12, zIndex: 2,
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
        font: '400 16px/1 var(--font-sans)',
      }}>✕</button>
      <ProductConfigurator item={item} mobile />
    </div>
  </div>
);

Object.assign(window, { ProductConfigurator, ProductModalDesktop, ProductSheetMobile });
