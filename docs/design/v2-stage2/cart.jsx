// cart.jsx — Sticky cart sidebar (desktop) + mobile floating bar + bottom sheet.
// Three states for sidebar: empty / 3 items / 5+ items (with scroll + free-delivery filled).

const { useState: useStateCart } = React;

// ─────── CART ITEM ROW ───────
const CartRow = ({ item, onQty, onRemove, editingNote, onEditNote, onSaveNote }) => {
  const [hover, setHover] = useStateCart(false);
  const lineTotal = item.unitPrice * item.qty;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '14px 0',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <h4 style={{ font: '600 14px/1.25 var(--font-sans)', margin: 0, color: 'var(--color-text-primary)' }}>
              {item.name}{item.size && <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}> · {item.size}</span>}
            </h4>
            <span style={{ font: '600 14px/1 var(--font-mono)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              {lineTotal.toFixed(2).replace('.', ',')} zł
            </span>
          </div>
          {item.extras.length > 0 && (
            <div style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--color-text-muted)', marginTop: 3 }}>
              {item.extras.join(' · ')}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {/* Qty stepper */}
        <div style={{ display: 'inline-flex', border: '1.5px solid var(--color-border-card)', borderRadius: 4, overflow: 'hidden', height: 28 }}>
          <button onClick={() => onQty?.(item.id, item.qty - 1)} style={{ width: 28, background: '#fff', border: 'none', cursor: 'pointer', font: '600 14px/1 var(--font-sans)', color: 'var(--color-text-primary)' }}>−</button>
          <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: '1.5px solid var(--color-border-card)', borderRight: '1.5px solid var(--color-border-card)', font: '600 13px/1 var(--font-sans)' }}>{item.qty}</div>
          <button onClick={() => onQty?.(item.id, item.qty + 1)} style={{ width: 28, background: '#fff', border: 'none', cursor: 'pointer', font: '600 14px/1 var(--font-sans)', color: 'var(--color-primary)' }}>+</button>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => onEditNote?.(item.id)} style={{
            height: 28, padding: '0 8px', borderRadius: 4,
            background: item.note ? 'var(--color-primary-tint)' : '#fff',
            color: item.note ? 'var(--color-primary)' : 'var(--color-text-muted)',
            border: item.note ? 'none' : '1.5px solid var(--color-border-card)',
            font: '500 11px/1 var(--font-sans)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ fontSize: 12 }}>{item.note ? '📝' : '＋'}</span>
            {item.note ? 'uwaga' : 'dodaj uwagę'}
          </button>
          <button onClick={() => onRemove?.(item.id)} style={{
            width: 28, height: 28, borderRadius: 4,
            background: hover ? '#FEE2E2' : '#fff',
            color: hover ? 'var(--status-cancelled)' : 'var(--color-text-faint)',
            border: '1.5px solid var(--color-border-card)',
            cursor: 'pointer', fontSize: 13,
            transition: 'all 120ms var(--motion-ease)',
          }}>×</button>
        </div>
      </div>

      {item.note && !editingNote && (
        <div style={{
          background: 'var(--color-primary-tint)',
          padding: '8px 10px', borderRadius: 4,
          font: '400 12px/1.4 var(--font-sans)', color: 'var(--color-text-primary)',
          fontStyle: 'italic',
        }}>
          „{item.note}"
        </div>
      )}
      {editingNote && (
        <div>
          <textarea
            defaultValue={item.note || ''}
            placeholder="Bez cebuli, dzwonić — domofon nie działa"
            maxLength={200}
            style={{
              width: '100%', minHeight: 64, padding: '8px 10px',
              border: '1.5px solid var(--color-primary)',
              borderRadius: 4, font: '400 12px/1.4 var(--font-sans)',
              resize: 'vertical', boxSizing: 'border-box',
              background: '#fff',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span className="t-mono" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>0 / 200</span>
            <button onClick={() => onSaveNote?.(item.id)} style={{
              height: 24, padding: '0 10px', borderRadius: 4,
              background: 'var(--color-primary)', color: '#fff',
              border: 'none', cursor: 'pointer', font: '600 11px/1 var(--font-sans)',
            }}>Zapisz</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────── UPSELL SECTION ("A może jeszcze?") ───────
// Pozycja: PRZED sumą/dostawą/totalami, po liście pozycji koszyka.
// 3 kompaktowe karty ~64px: emoji + nazwa + mała hint linia + cena mono + FAB +.
// Klik + → fade+slide-down out (200ms), w prod następny element “wjedzie” na jego miejsce.
// Empty: gdy pula upsell pusta → cała sekcja znika (operator: bez “wszystko już dodane”).
const UpsellSection = ({ cart, onAdd, compact = false }) => {
  const [removed, setRemoved] = useStateCart(new Set());
  const suggestions = (window.pickUpsell ? window.pickUpsell(cart, 3) : []).filter(s => !removed.has(s.id));
  if (suggestions.length === 0) return null;

  const handleAdd = (item) => {
    setRemoved(prev => new Set(prev).add(item.id));
    onAdd?.(item);
  };

  return (
    <div style={{ marginTop: 4, paddingTop: 16, borderTop: '1px dashed var(--color-border-card)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="t-kicker" style={{ color: 'var(--color-text-muted)' }}>A może jeszcze?</span>
        <span className="t-mono" style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>
          {suggestions.length} sugesti{suggestions.length === 1 ? 'a' : 'e'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {suggestions.map(item => (
          <UpsellRow key={item.id} item={item} onAdd={handleAdd} compact={compact} />
        ))}
      </div>
    </div>
  );
};

const UpsellRow = ({ item, onAdd, compact }) => {
  const [hover, setHover] = useStateCart(false);
  const [leaving, setLeaving] = useStateCart(false);

  const handleClick = () => {
    setLeaving(true);
    setTimeout(() => onAdd?.(item), 200);
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 12px',
        background: '#fff',
        border: hover ? '1.5px solid var(--color-border-strong)' : '1px solid var(--color-border-card)',
        borderRadius: 6,
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 200ms var(--motion-ease), transform 200ms var(--motion-ease), border-color 120ms var(--motion-ease)',
        minHeight: 56,
      }}>
      <span style={{ fontSize: 22, flexShrink: 0, width: 28, textAlign: 'center' }}>{item.emoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '600 13.5px/1.2 var(--font-sans)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
        </div>
        {item.hint && (
          <div style={{ font: '400 11.5px/1.3 var(--font-sans)', color: 'var(--color-text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.hint}
          </div>
        )}
      </div>
      <span style={{ font: '700 13.5px/1 var(--font-mono)', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
        {item.price.toFixed(2).replace('.', ',')} zł
      </span>
      <button
        onClick={handleClick}
        aria-label={`Dodaj ${item.name}`}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-primary)', color: '#fff',
          border: 'none', cursor: 'pointer',
          font: '400 20px/1 var(--font-sans)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transform: hover ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 120ms var(--motion-ease)',
        }}>+</button>
    </div>
  );
};

// ─────── CART SIDEBAR (desktop, 360px) ───────
const CartSidebar = ({ items = [], onQty, onRemove, onAddUpsell, deliveryThreshold = 50, minOrder = 30, showUpsell = false }) => {
  const subtotal = window.cartTotal(items);
  const remaining = Math.max(0, deliveryThreshold - subtotal);
  const reachedFree = remaining === 0;
  const belowMin = subtotal > 0 && subtotal < minOrder;
  const empty = items.length === 0;
  const [editingId, setEditingId] = useStateCart(null);

  return (
    <aside style={{
      width: 360, flexShrink: 0,
      background: '#fff',
      border: '1px solid var(--color-border-card)',
      borderRadius: 12,
      display: 'flex', flexDirection: 'column',
      maxHeight: 'calc(100vh - 140px)',
      position: 'sticky', top: 140,
    }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div className="t-kicker t-kicker--accent" style={{ marginBottom: 6 }}>Twój koszyk</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 style={{ font: '700 22px/1.1 var(--font-sans)', letterSpacing: '-0.02em', margin: 0 }}>
            {empty ? 'Pusty' : `${items.length} ${items.length === 1 ? 'pozycja' : items.length < 5 ? 'pozycje' : 'pozycji'}`}
          </h2>
          {!empty && (
            <span className="t-mono" style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>
              {items.reduce((s, i) => s + i.qty, 0)} szt.
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      {empty ? (
        <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12, flex: 1, justifyContent: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🛒</div>
          <div>
            <h3 style={{ font: '700 16px/1.3 var(--font-sans)', margin: 0, color: 'var(--color-text-primary)' }}>Tu pojawi się Twoje zamówienie</h3>
            <p className="t-body-sm" style={{ marginTop: 6, maxWidth: 240, color: 'var(--color-text-muted)' }}>
              Wybierz coś z menu — minimum zamówienia 30 zł.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px' }}>
          {items.map(it => (
            <CartRow
              key={it.id}
              item={it}
              editingNote={editingId === it.id}
              onQty={onQty}
              onRemove={onRemove}
              onEditNote={(id) => setEditingId(editingId === id ? null : id)}
              onSaveNote={() => setEditingId(null)}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {!empty && (
        <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--color-border-subtle)' }}>
          {/* upsell — PRZED totals, klient widzi sugestię zanim doliczy sumę */}
          {showUpsell && (
            <div style={{ marginBottom: 14, marginTop: -4 }}>
              <UpsellSection cart={items} onAdd={onAddUpsell} />
            </div>
          )}
          {/* free delivery progress */}
          <div style={{
            background: reachedFree ? 'var(--color-primary-tint)' : 'var(--color-bg-section)',
            padding: '10px 12px', borderRadius: 6, marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <span style={{ font: '500 12px/1.3 var(--font-sans)', color: reachedFree ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                {reachedFree
                  ? <><strong>Darmowa dostawa</strong> 🎉</>
                  : <>Brakuje <strong style={{ fontFamily: 'var(--font-mono)' }}>{remaining.toFixed(2).replace('.', ',')} zł</strong> do darmowej dostawy</>
                }
              </span>
            </div>
            <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (subtotal / deliveryThreshold) * 100)}%`, height: '100%', background: 'var(--color-primary)' }} />
            </div>
          </div>

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, font: '400 13px/1 var(--font-sans)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-body)' }}>
              <span>Suma</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{subtotal.toFixed(2).replace('.', ',')} zł</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-body)' }}>
              <span>Dostawa</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{reachedFree ? '0,00 zł' : '8,00 zł'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 8, borderTop: '1px dashed var(--color-border-card)', font: '700 16px/1 var(--font-sans)', color: 'var(--color-text-primary)' }}>
              <span>Do zapłaty</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18 }}>{(subtotal + (reachedFree ? 0 : 8)).toFixed(2).replace('.', ',')} zł</span>
            </div>
          </div>

          {belowMin && (
            <div style={{
              background: 'var(--color-primary-tint)', color: 'var(--color-primary)',
              padding: '8px 10px', borderRadius: 4, marginBottom: 12,
              font: '500 12px/1.4 var(--font-sans)',
            }}>
              Brakuje <strong style={{ fontFamily: 'var(--font-mono)' }}>{(minOrder - subtotal).toFixed(2).replace('.', ',')} zł</strong> do minimum zamówienia.
            </div>
          )}

          <button disabled={belowMin} style={{
            width: '100%', height: 52, borderRadius: 6,
            background: belowMin ? 'var(--color-border-card)' : 'var(--color-primary)',
            color: belowMin ? 'var(--color-text-muted)' : '#fff',
            border: 'none', cursor: belowMin ? 'not-allowed' : 'pointer',
            font: '700 15px/1 var(--font-sans)', letterSpacing: '-0.005em',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {belowMin ? `Minimum 30 zł` : `Złóż zamówienie · ${(subtotal + (reachedFree ? 0 : 8)).toFixed(2).replace('.', ',')} zł`}
          </button>

          <button style={{
            width: '100%', height: 36, marginTop: 8,
            background: 'transparent', border: 'none', cursor: 'pointer',
            font: '500 12px/1 var(--font-sans)', color: 'var(--color-text-muted)',
          }}>
            ← Wróć do menu
          </button>
        </div>
      )}
    </aside>
  );
};

// ─────── MOBILE FLOATING CART BAR ───────
const MobileCartBar = ({ items = [], onOpen }) => {
  if (items.length === 0) return null;
  const subtotal = window.cartTotal(items);
  const qty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <button onClick={onOpen} style={{
      position: 'absolute',
      left: 12, right: 12, bottom: 12,
      height: 56,
      background: 'var(--color-primary)', color: '#fff',
      border: 'none', borderRadius: 8, cursor: 'pointer',
      padding: '0 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 8px 24px rgba(230,57,70,0.32)',
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          font: '700 13px/1 var(--font-mono)',
        }}>{qty}</span>
        <span style={{ font: '700 15px/1 var(--font-sans)' }}>Koszyk</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ font: '700 15px/1 var(--font-mono)' }}>
          {subtotal.toFixed(2).replace('.', ',')} zł
        </span>
        <span style={{ fontSize: 14 }}>›</span>
      </div>
    </button>
  );
};

Object.assign(window, { CartRow, CartSidebar, MobileCartBar, UpsellSection, CartBottomSheet });

// ─────── MOBILE BOTTOM SHEET CART ───────
// Pełnoekranowy sheet (375 × 100% iOS frame) — używany gdy klient klika ikonę koszyka w nav.
// Wszystko w jednym scrollu: header z X → lista pozycji → upsell → totals → CTA.
// Upsell ląduje w naturalnym miejscu (po liście, przed totals) zgodnie z requestem.
function CartBottomSheet({ items = [], onClose, onQty, onRemove, onAddUpsell, deliveryThreshold = 50, minOrder = 30 }) {
  const subtotal = window.cartTotal(items);
  const remaining = Math.max(0, deliveryThreshold - subtotal);
  const reachedFree = remaining === 0;
  const belowMin = subtotal > 0 && subtotal < minOrder;
  const empty = items.length === 0;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(15,23,42,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      zIndex: 100,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
        width: '100%', maxHeight: '92%',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Drag handle */}
        <div style={{ paddingTop: 8, paddingBottom: 4, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--color-border-card)' }} />
        </div>
        {/* Header */}
        <div style={{ padding: '8px 16px 16px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="t-kicker t-kicker--accent" style={{ marginBottom: 4 }}>Twój koszyk</div>
            <h2 style={{ font: '700 19px/1.1 var(--font-sans)', letterSpacing: '-0.02em', margin: 0 }}>
              {empty ? 'Pusty' : `${items.length} ${items.length === 1 ? 'pozycja' : items.length < 5 ? 'pozycje' : 'pozycji'}`}
            </h2>
          </div>
          <button onClick={onClose} aria-label="Zamknij" style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--color-bg-section)', color: 'var(--color-text-primary)',
            border: 'none', cursor: 'pointer', fontSize: 18,
          }}>×</button>
        </div>
        {/* Body — scroll */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px' }}>
          {items.map(it => (
            <CartRow key={it.id} item={it} onQty={onQty} onRemove={onRemove} />
          ))}
          <UpsellSection cart={items} onAdd={onAddUpsell} compact />
        </div>
        {/* Footer */}
        {!empty && (
          <div style={{ padding: '14px 16px 18px', borderTop: '1px solid var(--color-border-subtle)' }}>
            <div style={{
              background: reachedFree ? 'var(--color-primary-tint)' : 'var(--color-bg-section)',
              padding: '8px 10px', borderRadius: 6, marginBottom: 12,
              font: '500 12px/1.3 var(--font-sans)',
              color: reachedFree ? 'var(--color-primary)' : 'var(--color-text-primary)',
            }}>
              {reachedFree
                ? <><strong>Darmowa dostawa</strong> 🎉</>
                : <>Brakuje <strong style={{ fontFamily: 'var(--font-mono)' }}>{remaining.toFixed(2).replace('.', ',')} zł</strong> do darmowej dostawy</>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 12, font: '700 16px/1 var(--font-sans)' }}>
              <span>Do zapłaty</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18 }}>
                {(subtotal + (reachedFree ? 0 : 8)).toFixed(2).replace('.', ',')} zł
              </span>
            </div>
            <button disabled={belowMin} style={{
              width: '100%', height: 52, borderRadius: 6,
              background: belowMin ? 'var(--color-border-card)' : 'var(--color-primary)',
              color: belowMin ? 'var(--color-text-muted)' : '#fff',
              border: 'none', cursor: belowMin ? 'not-allowed' : 'pointer',
              font: '700 15px/1 var(--font-sans)',
            }}>
              {belowMin
                ? `Minimum 30 zł · brakuje ${(minOrder - subtotal).toFixed(2).replace('.', ',')} zł`
                : `Złóż zamówienie · ${(subtotal + (reachedFree ? 0 : 8)).toFixed(2).replace('.', ',')} zł`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
window.CartBottomSheet = CartBottomSheet;
