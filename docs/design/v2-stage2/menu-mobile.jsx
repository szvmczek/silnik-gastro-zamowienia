// menu-mobile.jsx — /menu route (mobile, inside iOS frame)
// Sections: header → closed banner? → info-bar → sticky chips → menu × 5 (single column 2-col grid) → footer.
// Floating cart bar on bottom gdy items > 0.

const MenuPageMobile = ({ tweaks = {}, onOpenProduct, onOpenCart }) => {
  const cart = tweaks.cartFull ? window.CART_SAMPLE_3 : [];
  const open = !tweaks.closed;
  const showClosed = tweaks.closedBanner && tweaks.closedBanner !== 'none';

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-page)', fontFamily: 'var(--font-sans)', paddingBottom: cart.length > 0 ? 84 : 0, position: 'relative' }} data-screen-label="Menu /menu · mobile">
      <window.HeaderMobile cartCount={cart.reduce((s, i) => s + i.qty, 0)} onCartClick={onOpenCart} />
      {showClosed && <window.ClosedBanner variant={tweaks.closedBanner} />}

      <window.InfoBar open={open} compact />
      <window.CategoryChips activeId="pizze" onJump={() => {}} compact />
      <window.MobileSectionHeaderBar name="Pizze" count={8} icon="🍕" />

      <section style={{ padding: '20px 16px 40px' }}>
        <div style={{ marginBottom: 20 }}>
          <div className="t-kicker t-kicker--accent" style={{ marginBottom: 8 }}>MENU</div>
          <h1 style={{ font: '900 28px/1.05 var(--font-sans)', letterSpacing: '-0.025em', margin: 0 }}>
            Wybierz, co zjesz<span style={{ color: 'var(--color-primary)' }}>.</span>
          </h1>
        </div>
        {window.MENU.map(cat => (
          <div key={cat.id} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{cat.icon}</span>
              <h2 style={{ font: '800 22px/1.15 var(--font-sans)', letterSpacing: '-0.02em', margin: 0 }}>{cat.name}</h2>
            </div>
            <p style={{ font: '400 12px/1.4 var(--font-sans)', color: 'var(--color-text-muted)', margin: '0 0 14px' }}>{cat.sub}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {cat.items.slice(0, 4).map(it => (
                <window.ProductCard key={it.id} item={it} onOpen={onOpenProduct} onQuickAdd={() => {}} />
              ))}
            </div>
            {cat.items.length > 4 && (
              <button style={{
                marginTop: 12, width: '100%', height: 40, borderRadius: 6,
                background: '#fff', color: 'var(--color-text-primary)',
                border: '1.5px solid var(--color-border-card)', cursor: 'pointer',
                font: '600 13px/1 var(--font-sans)',
              }}>Pokaż wszystkie ({cat.items.length})</button>
            )}
          </div>
        ))}
      </section>

      <window.Footer compact />
      <window.MobileCartBar items={cart} onOpen={onOpenCart} />
    </div>
  );
};

window.MenuPageMobile = MenuPageMobile;
