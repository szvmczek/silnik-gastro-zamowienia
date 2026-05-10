// landing-mobile.jsx — Homepage / (mobile, inside iOS frame)
// Sections: header → closed banner? → hero → info-bar → about → hours → contact+map → footer.
// Hero CTA → /menu. Brak menu i cart sidebar tutaj.

const LandingMobile = ({ tweaks = {}, onGoToMenu }) => {
  const open = !tweaks.closed;
  const showClosed = tweaks.closedBanner && tweaks.closedBanner !== 'none';

  return (
    <div style={{ width: '100%', minHeight: '100%', background: 'var(--color-bg-page)', fontFamily: 'var(--font-sans)', position: 'relative' }} data-screen-label="Landing / · mobile">
      <window.HeaderMobile cartCount={0} />
      {showClosed && <window.ClosedBanner variant={tweaks.closedBanner} />}

      {/* HERO mobile */}
      <section style={{ padding: '24px 16px 28px' }}>
        <div className="t-kicker t-kicker--accent" style={{ marginBottom: 14 }}>PIZZA DEMO · WARSZAWA</div>
        <h1 style={{ font: '900 36px/1.05 var(--font-sans)', letterSpacing: '-0.03em', margin: 0, color: 'var(--color-text-primary)' }}>
          Smacznie<br/>i szybko<span style={{ color: 'var(--color-primary)' }}>.</span>
        </h1>
        <p style={{ font: '400 15px/1.55 var(--font-sans)', color: 'var(--color-text-body)', margin: '12px 0 20px' }}>
          Klasyczne pizze, kurczaki, zapiekanki. Codziennie 11:00–22:00.
        </p>
        <div style={{
          aspectRatio: '4 / 3',
          borderRadius: 10,
          border: '1px solid var(--color-border-card)',
          overflow: 'hidden',
          background: '#f5f2ea',
          marginBottom: 16,
        }}>
          <img src={window.HERO_PHOTO} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <a href="/menu" onClick={(e) => { e.preventDefault(); onGoToMenu?.(); }} style={{
          width: '100%', height: 52, borderRadius: 6,
          background: 'var(--color-primary)', color: '#fff',
          font: '700 15px/52px var(--font-sans)', textDecoration: 'none',
          textAlign: 'center', display: 'block', boxSizing: 'border-box',
        }}>Zobacz menu →</a>
        <a href="tel:+48600000000" style={{
          width: '100%', height: 48, borderRadius: 6, marginTop: 10,
          background: 'transparent', color: 'var(--color-text-primary)',
          border: '1.5px solid var(--color-border-card)',
          font: '600 14px/45px var(--font-sans)', textDecoration: 'none',
          textAlign: 'center', display: 'block', boxSizing: 'border-box',
        }}>📞 Zadzwoń</a>
      </section>

      <window.InfoBar open={open} compact />

      <window.AboutSection compact />
      <window.HoursSection compact />
      <window.ContactMapSection compact />

      <window.Footer compact />
    </div>
  );
};

window.LandingMobile = LandingMobile;
