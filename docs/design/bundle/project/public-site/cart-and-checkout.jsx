// Screens 4 & 5 — Cart drawer + Checkout

const CartItem = ({ n, opts, qty, price, small }) => (
  <div className={`flex gap-3 py-4 ${small ? '' : ''}`}>
    <Photo ratio="1/1" label="" className={`${small ? 'w-16' : 'w-20'} rounded-lg flex-shrink-0`}/>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <div className={`font-semibold text-slate-900 ${small ? 'text-[13px]' : 'text-[14px]'}`}>{n}</div>
        <div className={`font-semibold text-slate-900 whitespace-nowrap ${small ? 'text-[13px]' : 'text-[14px]'}`}>{price}</div>
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{opts}</div>
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center h-8 rounded-md border border-slate-200">
          <button className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50"><Icon name="minus" size={12}/></button>
          <div className="w-7 text-center text-[12px] font-semibold">{qty}</div>
          <button className="w-8 h-full flex items-center justify-center text-slate-500 hover:bg-slate-50"><Icon name="plus" size={12}/></button>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Icon name="edit" size={14}/></button>
          <button className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50"><Icon name="trash" size={14}/></button>
        </div>
      </div>
    </div>
  </div>
);

// Cart drawer — desktop slide-in from right (rendered over a dimmed landing context)
const CartDrawerDesktop = () => (
  <div className="w-[1280px] h-[820px] relative bg-slate-50 overflow-hidden">
    <div className="absolute inset-0 opacity-60 pointer-events-none">
      <div className="sticky top-0"><Nav/></div>
      <div className="px-10 pt-10">
        <div className="grid grid-cols-3 gap-5">
          {Array.from({length:6}).map((_,i)=>(<div key={i}><Photo ratio="4/3" label="" className="rounded-xl"/><div className="h-20"/></div>))}
        </div>
      </div>
    </div>
    <div className="absolute inset-0 bg-slate-900/30"/>
    <div className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.18em] uppercase text-white">ekran 4 · cart drawer (desktop, sheet side=right)</div>

    <div className="absolute top-0 right-0 bottom-0 w-[440px] bg-white shadow-2xl flex flex-col">
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div className="text-[17px] font-semibold text-slate-900">Twój koszyk</div>
          <div className="text-[12px] text-slate-500">3 pozycje</div>
        </div>
        <button className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center"><Icon name="x" size={18}/></button>
      </div>
      <div className="flex-1 overflow-auto px-6 divide-y divide-slate-100">
        <CartItem n="Quattro Formaggi" opts="40 cm · +rukola" qty={1} price="62 zł"/>
        <CartItem n="Margherita DOP" opts="30 cm" qty={2} price="78 zł"/>
        <CartItem n="Tiramisu" opts="1 porcja" qty={1} price="22 zł"/>
      </div>
      <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-[13px] text-slate-500">Podsuma</div>
          <div className="text-[14px] font-semibold text-slate-900">162 zł</div>
        </div>
        <div className="text-[11px] text-slate-500 mb-4">Koszt dostawy policzymy w następnym kroku.</div>
        <Btn variant="primary" size="xl" className="w-full">Przejdź do kasy →</Btn>
      </div>
    </div>
  </div>
);

const CartDrawerEmpty = () => (
  <div className="w-[440px] h-[680px] bg-white rounded-2xl overflow-hidden border border-slate-200 flex flex-col">
    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
      <div className="text-[17px] font-semibold text-slate-900">Twój koszyk</div>
      <button className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center"><Icon name="x" size={18}/></button>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5">
        <Icon name="shoppingBag" size={26} className="text-slate-400"/>
      </div>
      <div className="text-[17px] font-semibold text-slate-900">Twój koszyk jest pusty</div>
      <div className="text-[13px] text-slate-500 mt-1.5 max-w-[260px]">Wybierz coś z menu — nasze pizze wyjeżdżają z pieca w ~90 sekund.</div>
      <Btn variant="primary" className="mt-6">Przeglądaj menu</Btn>
    </div>
  </div>
);

// Checkout — desktop, 2 cols
const CheckoutDesktop = () => (
  <div className="bg-slate-50 w-[1280px]">
    <div className="bg-white"><Nav/></div>
    <div className="px-10 py-10 grid grid-cols-[1fr_420px] gap-8">
      <div>
        <a className="text-[13px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1.5"><Icon name="chevLeft" size={14}/>Wróć do menu</a>
        <h1 className="text-[36px] font-semibold text-slate-900 tracking-tight mt-3 mb-8">Zamówienie</h1>

        {/* Contact */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 mb-5">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-4">1 · Dane kontaktowe</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Imię</label>
              <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="Anna"/>
            </div>
            <div className="col-span-1">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Telefon</label>
              <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="+48 600 123 456"/>
            </div>
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
              <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="anna.kowalska@gmail.com"/>
            </div>
          </div>
        </div>

        {/* Fulfillment */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 mb-5">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-4">2 · Typ realizacji</div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <label className="cursor-pointer rounded-lg border-2 border-primary bg-primary/5 p-5 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2.5 h-2.5 rounded-full bg-primary"/></div>
              <div>
                <div className="flex items-center gap-2 mb-0.5"><Icon name="truck" size={18} className="text-slate-700"/><div className="font-semibold text-slate-900">Dostawa</div></div>
                <div className="text-[12px] text-slate-500">~35 min pod Twoje drzwi</div>
              </div>
            </label>
            <label className="cursor-pointer rounded-lg border border-slate-200 bg-white p-5 flex items-start gap-3 hover:border-slate-300">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0 mt-0.5"/>
              <div>
                <div className="flex items-center gap-2 mb-0.5"><Icon name="shoppingBag" size={18} className="text-slate-700"/><div className="font-semibold text-slate-900">Odbiór osobisty</div></div>
                <div className="text-[12px] text-slate-500">~25 min od złożenia</div>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-4">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Ulica i numer</label>
              <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="Marszałkowska 12/5"/>
            </div>
            <div className="col-span-2">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Kod pocztowy</label>
              <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="00-017"/>
            </div>
            <div className="col-span-6">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Miasto</label>
              <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="Warszawa"/>
            </div>
            <div className="col-span-6">
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Uwagi dla kuriera <span className="font-normal text-slate-500">· opcjonalne</span></label>
              <input className="h-10 w-full rounded-md border border-slate-300 px-3 text-[14px]" placeholder="np. dzwonek nie działa, proszę zadzwonić"/>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 mb-5">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-4">3 · Metoda płatności</div>
          <label className="cursor-pointer rounded-lg border-2 border-primary bg-primary/5 p-4 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0"><div className="w-2.5 h-2.5 rounded-full bg-primary"/></div>
            <div>
              <div className="font-semibold text-slate-900 text-[14px]">Gotówka przy dostawie</div>
              <div className="text-[12px] text-slate-500">Kurier wyda resztę.</div>
            </div>
          </label>
        </div>

        {/* Notes + accept */}
        <div className="rounded-xl bg-white border border-slate-200 p-6">
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Uwagi do zamówienia <span className="font-normal text-slate-500">· opcjonalne</span></label>
          <textarea rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-[14px]" placeholder="np. bez cebuli na całym zamówieniu"/>
          <label className="flex items-start gap-2.5 text-[13px] text-slate-700 mt-5 cursor-pointer">
            <span className="w-4 h-4 rounded border border-primary bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5"><Icon name="check" size={11} strokeWidth={3}/></span>
            <span>Akceptuję <a className="underline decoration-slate-300 hover:text-primary">regulamin</a> i <a className="underline decoration-slate-300 hover:text-primary">politykę prywatności</a>.</span>
          </label>
        </div>
      </div>

      {/* Summary */}
      <div>
        <div className="sticky top-6 rounded-xl bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <div className="text-[15px] font-semibold text-slate-900">Podsumowanie</div>
          </div>
          <div className="px-6 py-3 divide-y divide-slate-100">
            {[
              ['1× Quattro Formaggi','40 cm · +rukola','62 zł'],
              ['2× Margherita DOP','30 cm','78 zł'],
              ['1× Tiramisu','','22 zł'],
            ].map(([n,o,p])=>(
              <div key={n} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-slate-900">{n}</div>
                  {o && <div className="text-[11px] text-slate-500 mt-0.5">{o}</div>}
                </div>
                <div className="text-[14px] font-semibold text-slate-900 whitespace-nowrap">{p}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-[13px]">
            <div className="flex items-center justify-between py-1"><div className="text-slate-600">Podsuma</div><div className="text-slate-900">162 zł</div></div>
            <div className="flex items-center justify-between py-1"><div className="text-slate-600">Dostawa</div><div className="text-slate-900">8 zł</div></div>
            <div className="flex items-center justify-between py-2 mt-1 border-t border-slate-200">
              <div className="text-[14px] font-semibold text-slate-900">Razem</div>
              <div className="text-[20px] font-semibold text-slate-900">170 zł</div>
            </div>
          </div>
          <div className="p-5">
            <Btn variant="primary" size="xl" className="w-full">Złóż zamówienie →</Btn>
            <div className="text-[11px] text-slate-400 text-center mt-3">Klikając potwierdzasz, że Twoje dane są poprawne.</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CheckoutMobile = () => (
  <div className="bg-slate-50 w-[375px]">
    <MobileNav/>
    <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between cursor-pointer">
      <div>
        <div className="text-[12px] text-slate-500">Podsumowanie</div>
        <div className="text-[15px] font-semibold text-slate-900">170 zł <span className="text-[12px] text-slate-500 font-normal">· 4 pozycje</span></div>
      </div>
      <Icon name="chevDown" size={18} className="text-slate-400"/>
    </div>
    <div className="px-4 py-5 space-y-4">
      <div className="rounded-xl bg-white border border-slate-200 p-5">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-3">Dane kontaktowe</div>
        <div className="space-y-3">
          <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="Anna Kowalska"/>
          <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="+48 600 123 456"/>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-slate-200 p-5">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-3">Typ realizacji</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border-2 border-primary bg-primary/5 p-3 text-center">
            <Icon name="truck" size={18} className="mx-auto text-primary"/>
            <div className="text-[13px] font-semibold text-slate-900 mt-1">Dostawa</div>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 text-center">
            <Icon name="shoppingBag" size={18} className="mx-auto text-slate-500"/>
            <div className="text-[13px] font-medium text-slate-700 mt-1">Odbiór</div>
          </div>
        </div>
        <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] mt-3" defaultValue="Marszałkowska 12/5, Warszawa"/>
      </div>
      <div className="rounded-xl bg-white border border-slate-200 p-5">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-3">Płatność</div>
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-3 flex items-center gap-2.5">
          <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-primary"/></div>
          <div className="text-[13px] font-semibold text-slate-900">Gotówka przy dostawie</div>
        </div>
      </div>
    </div>
    {/* Sticky bottom CTA */}
    <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
      <Btn variant="primary" size="xl" className="w-full">Złóż zamówienie — 170 zł</Btn>
    </div>
  </div>
);

Object.assign(window, { CartDrawerDesktop, CartDrawerEmpty, CheckoutDesktop, CheckoutMobile });
