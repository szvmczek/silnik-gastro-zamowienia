// menu-desktop.jsx — /menu route (desktop, 1440 wide)
// Sections: header (currentRoute="menu") → closed banner? → info-bar → free-delivery? → sticky chips → menu × 5 + sticky cart sidebar 360 → footer.
// To jest pełen menu+cart artboard, przeniesiony z poprzedniej landing-desktop.

const MenuPageDesktop = ({ tweaks = {}, onOpenProduct }) => {
  const cart = tweaks.cartFull ? window.CART_SAMPLE_3 : [];
  const [activeCat, setActiveCat] = React.useState('pizze');
  const open = !tweaks.closed;
  const showFreeDelivery = tweaks.freeDelivery !== false && cart.length > 0;
  const showClosed = tweaks.closedBanner && tweaks.closedBanner !== 'none';

  return (
    <div style={{ width: 1440, background: 'var(--color-bg-page)', fontFamily: 'var(--font-sans)', minHeight: 4400, position: 'relative' }} data-screen-label="Menu /menu · desktop">
      <window.HeaderDesktop cartCount={cart.reduce((s, i) => s + i.qty, 0)} currentRoute="menu" />
      {showClosed && <window.ClosedBanner variant={tweaks.closedBanner} />}

      <window.InfoBar open={open} />
      {showFreeDelivery && <window.FreeDeliveryProgress subtotal={window.cartTotal(cart)} />}
      <window.CategoryChips activeId={activeCat} onJump={setActiveCat} />

      {/* MENU + CART SIDEBAR */}
      <section style={{ padding: '40px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'flex-start' }}>
        <div>
          <div style={{ marginBottom: 32 }}>
            <div className="t-kicker t-kicker--accent" style={{ marginBottom: 12 }}>MENU</div>
            <h1 style={{ font: '900 48px/1.05 var(--font-sans)', letterSpacing: '-0.03em', margin: 0 }}>
              Wybierz, co zjesz<span style={{ color: 'var(--color-primary)' }}>.</span>
            </h1>
          </div>
          {window.MENU.map(cat => (
            <div key={cat.id} id={cat.id} style={{ marginBottom: 56 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 32 }}>{cat.icon}</span>
                <h2 style={{ font: '800 36px/1.1 var(--font-sans)', letterSpacing: '-0.025em', margin: 0 }}>{cat.name}</h2>
                <span className="t-mono" style={{ fontSize: 13, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                  {cat.items.length} pozycji
                </span>
              </div>
              <p className="t-body" style={{ margin: '0 0 20px', color: 'var(--color-text-muted)' }}>{cat.sub}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {cat.items.map(it => (
                  <window.ProductCard key={it.id} item={it} onOpen={onOpenProduct} onQuickAdd={() => {}} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <window.CartSidebar items={cart} showUpsell={tweaks.showUpsell !== false} />
      </section>

      <window.Footer />
    </div>
  );
};

window.MenuPageDesktop = MenuPageDesktop;
