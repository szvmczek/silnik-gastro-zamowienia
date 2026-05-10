/* app.jsx — Stage 3 admin redesign canvas
   Composes all 9 frames into design_canvas with sections + tweaks. */

const { useState } = React;

const DEFAULTS = window.__STAGE3_DEFAULTS;

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  const tone = t.tone;
  const density = t.density;
  const soundOn = t.soundOn;
  const sse = t.sseSimulate;
  const manualClose = t.manualClose;
  const hi = t.highlightItemNote;
  const newCount = t.newOrderCount;

  const common = { tone, density, soundOn, manualClose, newCount, highlightNote: hi };

  return (
    <>
      <DesignCanvas title="Pizza Demo · Stage 3 — Admin Redesign"
        subtitle="9 ekranów · desktop 1440 + tablet 1024 + mobile 375. Token-tone: warm/cool · density · sound · SSE sim · manual-close · item-note highlight.">

        <DCSection id="auth" title="0 · Logowanie">
          <DCArtboard id="login-desktop" label="/admin/login · desktop 1440" width={1440} height={900}>
            <window.LoginFrame {...common} />
          </DCArtboard>
          <DCArtboard id="login-error" label="/admin/login · błąd uwierzytelnienia" width={1440} height={900}>
            <window.LoginFrame {...common} error />
          </DCArtboard>
        </DCSection>

        <DCSection id="ops" title="1 · Operacje · codzienna praca">
          <DCArtboard id="dashboard" label="/admin · Pulpit (desktop 1440)" width={1440} height={1100}>
            <window.DashboardFrame {...common} />
          </DCArtboard>
          <DCArtboard id="kitchen" label="/admin/kitchen · Kuchnia · desktop 1440 (priorytet #1)" width={1440} height={980}>
            <window.KitchenFrame {...common} sseSimulate={sse} />
          </DCArtboard>
          <DCArtboard id="kitchen-tablet" label="/admin/kitchen · tablet 1024 (compact)" width={1024} height={980}>
            <window.KitchenFrame {...common} density="compact" sseSimulate={sse} />
          </DCArtboard>
          <DCArtboard id="pickup" label="/admin/pickup · Wydanie · focal: imię klienta" width={1440} height={900}>
            <window.PickupFrame {...common} />
          </DCArtboard>
          <DCArtboard id="delivery-desktop" label="/admin/delivery · Dostawa · desktop" width={1440} height={900}>
            <window.DeliveryFrame {...common} />
          </DCArtboard>
          <DCArtboard id="delivery-mobile" label="/admin/delivery · mobile 375 (kurier)" width={420} height={860}>
            <window.DeliveryFrame {...common} mobile />
          </DCArtboard>
        </DCSection>

        <DCSection id="archive" title="2 · Archiwum · zarządzanie zamówieniami">
          <DCArtboard id="orders" label="/admin/orders · Wszystkie zamówienia (tabela + filtry)" width={1440} height={1000}>
            <window.OrdersFrame {...common} />
          </DCArtboard>
          <DCArtboard id="orders-flash" label="/admin/orders · wariant: nowe zamówienie just-landed (zielony flash)" width={1440} height={1000}>
            <window.OrdersFrame {...common} flashNew />
          </DCArtboard>
          <DCArtboard id="order-detail" label="/admin/orders/1042 · detal + notka żółta + timeline" width={1440} height={1000}>
            <window.OrderDetailFrame {...common} />
          </DCArtboard>
          <DCArtboard id="order-eta" label="/admin/orders/1042 · dialog: zmień ETA" width={1440} height={1000}>
            <window.OrderDetailFrame {...common} dialog="eta" />
          </DCArtboard>
          <DCArtboard id="order-cancel" label="/admin/orders/1042 · dialog: anuluj zamówienie" width={1440} height={1000}>
            <window.OrderDetailFrame {...common} dialog="cancel" />
          </DCArtboard>
        </DCSection>

        <DCSection id="config" title="3 · Konfiguracja · menu i restauracja">
          <DCArtboard id="menu-products" label="/admin/menu · Produkty (tabela + drag handles)" width={1440} height={900}>
            <window.MenuFrame {...common} activeTab="products" />
          </DCArtboard>
          <DCArtboard id="menu-categories" label="/admin/menu · Kategorie" width={1440} height={700}>
            <window.MenuFrame {...common} activeTab="categories" />
          </DCArtboard>
          <DCArtboard id="product-edit" label="/admin/menu/products/1 · Edycja produktu" width={1440} height={1100}>
            <window.ProductEditFrame {...common} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Wygląd" />
        <TweakRadio label="Tonacja" value={tone}
          options={[{value: "warm", label: "Ciepła"}, {value: "cool", label: "Chłodna"}]}
          onChange={(v) => setTweak("tone", v)} />
        <TweakRadio label="Gęstość" value={density}
          options={[{value: "comfortable", label: "Wygodna"}, {value: "compact", label: "Kompakt"}]}
          onChange={(v) => setTweak("density", v)} />

        <TweakSection label="Operacje" />
        <TweakToggle label="Wyróżnij notki klienta" value={hi}
          onChange={(v) => setTweak("highlightItemNote", v)} />
        <TweakToggle label="Symuluj SSE (live update)" value={sse}
          onChange={(v) => setTweak("sseSimulate", v)} />
        <TweakToggle label="Powiadomienia dźwiękowe" value={soundOn}
          onChange={(v) => setTweak("soundOn", v)} />
        <TweakToggle label="Tryb: manualnie zamknięte" value={manualClose}
          onChange={(v) => setTweak("manualClose", v)} />

        <TweakSection label="Dane demo" />
        <TweakSlider label="Liczba nowych zamówień (badge)"
          value={newCount} min={0} max={20} step={1}
          onChange={(v) => setTweak("newOrderCount", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
