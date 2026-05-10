// landing-desktop.jsx — Homepage / (desktop, 1440 wide)
// Sections: header → closed banner? → hero → info-bar → about → hours → contact+map → footer.
// NO menu grid, NO cart sidebar — to jest landing, klient idzie z hero CTA → /menu.
// Ref: SINGLE_TENANT_NO_LOGIN.md §1 — split / vs /menu, brak loginu klienta.

const LandingDesktop = ({ tweaks = {}, onGoToMenu }) => {
  const open = !tweaks.closed;
  const showClosed = tweaks.closedBanner && tweaks.closedBanner !== 'none';

  return (
    <div style={{ width: 1440, background: 'var(--color-bg-page)', fontFamily: 'var(--font-sans)', minHeight: 3200, position: 'relative' }} data-screen-label="Landing / · desktop">
      <window.HeaderDesktop cartCount={0} currentRoute="home" />
      {showClosed && <window.ClosedBanner variant={tweaks.closedBanner} />}

      {/* HERO */}
      <section id="hero" style={{ padding: '64px 48px 56px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 6fr', gap: 56, alignItems: 'center' }}>
          <div>
            <div className="t-kicker t-kicker--accent" style={{ marginBottom: 20 }}>PIZZA DEMO · WARSZAWA</div>
            <h1 style={{ font: '900 72px/1.0 var(--font-sans)', letterSpacing: '-0.038em', margin: 0, color: 'var(--color-text-primary)' }}>
              {tweaks.heroCopy === 'ulubiona'
                ? <>Twoja ulubiona<br/>pizza, w 35 minut<span style={{ color: 'var(--color-primary)' }}>.</span></>
                : tweaks.heroCopy === 'zamow'
                  ? <>Zamów online<span style={{ color: 'var(--color-primary)' }}>.</span><br/>Dostawa do 35 minut.</>
                  : <>Smacznie<br/>i szybko<span style={{ color: 'var(--color-primary)' }}>.</span></>
              }
            </h1>
            <p className="t-body-lg" style={{ marginTop: 24, maxWidth: 440, fontSize: 18 }}>
              Klasyczne pizze, kurczaki, zapiekanki. Dostawa codziennie 11:00–22:00.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <a href="/menu" onClick={(e) => { e.preventDefault(); onGoToMenu?.(); }} style={{
                height: 56, padding: '0 28px', borderRadius: 6,
                background: 'var(--color-primary)', color: '#fff',
                font: '700 16px/56px var(--font-sans)', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 10,
              }}>Zobacz menu →</a>
              <a href="tel:+48600000000" style={{
                height: 56, padding: '0 28px', borderRadius: 6,
                background: 'transparent', color: 'var(--color-text-primary)',
                border: '1.5px solid var(--color-border-card)',
                font: '600 16px/53px var(--font-sans)', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 10,
              }}>📞 Zadzwoń</a>
            </div>
          </div>
          <div style={{
            aspectRatio: '4 / 3',
            borderRadius: 12,
            border: '1px solid var(--color-border-card)',
            overflow: 'hidden',
            background: '#f5f2ea',
          }}>
            <img src={window.HERO_PHOTO} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </section>

      <window.InfoBar open={open} />

      <window.AboutSection />
      <window.HoursSection />
      <window.ContactMapSection />

      <window.Footer />
    </div>
  );
};

window.LandingDesktop = LandingDesktop;
