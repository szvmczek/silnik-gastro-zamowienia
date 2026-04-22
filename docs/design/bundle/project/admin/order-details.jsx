// Screen 12 — Order details (HEART of admin) + modals

const NextStepCta = ({ label, helper }) => (
  <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-6">
    <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-primary/80 mb-3">Następny krok</div>
    <button className="w-full h-16 rounded-lg bg-primary text-white font-semibold text-[17px] flex items-center justify-center gap-3 hover:brightness-95 transition shadow-sm">
      {label}
      <Icon name="arrowRight" size={20}/>
    </button>
    <div className="mt-3.5 text-[12px] text-slate-600 flex items-start gap-2">
      <Icon name="info" size={13} className="text-slate-400 mt-0.5 flex-shrink-0"/>
      <span dangerouslySetInnerHTML={{__html: helper}}/>
    </div>
  </div>
);

const Card = ({ title, icon, actions, children, className='' }) => (
  <div className={`rounded-xl bg-white border border-slate-200 ${className}`}>
    {title && (
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2 text-[12px] font-mono tracking-[0.18em] uppercase text-slate-500">
          {icon && <Icon name={icon} size={14}/>}
          {title}
        </div>
        {actions}
      </div>
    )}
    <div className="p-5">{children}</div>
  </div>
);

const OrderDetails = () => (
  <div className="w-[1280px] bg-slate-50 flex">
    <Sidebar active="orders"/>
    <div className="flex-1 min-w-0">
      <div className="h-[72px] px-8 border-b border-slate-200 bg-white flex items-center">
        <a className="text-[13px] text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
          <Icon name="chevLeft" size={14}/>Wszystkie zamówienia
        </a>
      </div>

      <div className="p-8">
        {/* Header block */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="font-mono text-[40px] font-semibold text-slate-900 leading-none tracking-tight">2026‑00126</div>
              <StatusBadge status="IN_PREPARATION" size="lg"/>
            </div>
            <div className="text-[13px] text-slate-500 flex items-center gap-3">
              <span className="flex items-center gap-1.5"><Icon name="clock" size={13}/>Złożone 22 minuty temu · dziś 14:12</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1.5"><Icon name="truck" size={13}/>Dostawa</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="outline" size="md"><Icon name="refresh" size={14}/>Odśwież</Btn>
          </div>
        </div>

        {/* NEXT STEP — dominant action block */}
        <div className="grid grid-cols-[1fr_auto] gap-4 mb-8">
          <NextStepCta
            label="Oznacz jako gotowe do wydania"
            helper='Po tym kroku status zmieni się na <strong class="text-slate-900">Gotowe</strong>. Następnie (przy dostawie): <strong class="text-slate-900">W drodze → Dostarczone</strong>.'
          />
          <div className="flex flex-col gap-2 pt-9">
            <Btn variant="outline" size="lg"><Icon name="clock" size={15}/>Zmień ETA</Btn>
            <Btn variant="dangerOutline" size="lg"><Icon name="x" size={15}/>Anuluj zamówienie</Btn>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[1fr_420px] gap-6">
          {/* Column 1 */}
          <div className="space-y-5">
            <Card title="Dane klienta" icon="user">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Imię i nazwisko</div>
                  <div className="text-[14px] font-medium text-slate-900">Katarzyna Sobańska</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Telefon</div>
                  <a className="text-[14px] font-medium text-primary flex items-center gap-1.5"><Icon name="phone" size={13}/>+48 512 889 103</a>
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Email</div>
                  <div className="text-[14px] text-slate-700">kat.sobanska@gmail.com</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Typ realizacji</div>
                  <div className="text-[14px] font-medium text-slate-900 flex items-center gap-1.5"><Icon name="truck" size={13}/>Dostawa</div>
                </div>
                <div className="col-span-2">
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Adres dostawy</div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-[14px] text-slate-900 leading-snug">
                      ul. Nowogrodzka 42 m. 18<br/>
                      <span className="text-slate-600">00‑695 Warszawa</span>
                    </div>
                    <Btn variant="outline" size="sm"><Icon name="mapPin" size={13}/>Otwórz w mapie</Btn>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Pozycje zamówienia" icon="utensils">
              <div className="divide-y divide-slate-100 -mx-2">
                {[
                  ['Margherita 40 cm','Bazowy: pomidorowy · Dodatki: rukola, oliwa bazyliowa','1','59','59'],
                  ['Diavola 40 cm','Bazowy: pomidorowy · Dodatki: dodatkowe chilli','1','64','64'],
                  ['Pepsi 0,5 l','—','2','7','14'],
                  ['Tiramisu','—','1','19','19'],
                ].map((r,i)=>(
                  <div key={i} className="px-2 py-3.5 flex items-start gap-4">
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-slate-900">{r[0]}</div>
                      <div className="text-[12px] text-slate-500 mt-0.5">{r[1]}</div>
                    </div>
                    <div className="text-[13px] text-slate-500 w-10">× {r[2]}</div>
                    <div className="text-[13px] text-slate-500 w-14 text-right">{r[3]} zł</div>
                    <div className="font-mono text-[14px] font-semibold text-slate-900 w-16 text-right">{r[4]} zł</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-[13px] text-slate-600"><span>Suma pozycji</span><span>156 zł</span></div>
                <div className="flex justify-between text-[13px] text-slate-600"><span>Dostawa</span><span>—</span></div>
                <div className="flex justify-between text-[15px] font-semibold text-slate-900 pt-2 border-t border-slate-100"><span>Do zapłaty</span><span className="font-mono">156 zł</span></div>
              </div>
            </Card>

            <Card title="Płatność" icon="bag">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Metoda</div>
                  <div className="text-[14px] font-medium text-slate-900">Gotówka przy dostawie</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Kwota</div>
                  <div className="font-mono text-[14px] font-semibold text-slate-900">156 zł</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1">Status</div>
                  <Badge variant="warning">Oczekuje</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="space-y-5">
            {/* Customer notes — highlighted */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-center gap-2 text-[12px] font-mono tracking-[0.18em] uppercase text-amber-800 mb-2.5">
                <Icon name="message" size={14}/>Uwagi od klienta
              </div>
              <p className="text-[14px] text-slate-800 leading-relaxed">Proszę zadzwonić kiedy kurier będzie na miejscu, domofon nie działa. Bez cebuli na Diavoli!</p>
            </div>

            {/* ETA card */}
            <div className="rounded-xl bg-slate-900 text-white p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-white/60">Przewidywany czas</div>
                <Btn variant="ghost" size="sm" className="!text-white/70 hover:!bg-white/10"><Icon name="edit" size={13}/>Edytuj</Btn>
              </div>
              <div className="font-mono text-[48px] font-semibold leading-none tracking-tight">15:00</div>
              <div className="text-[13px] text-white/70 mt-2">za ~16 minut</div>
            </div>

            <Card title="Historia statusów" icon="clock">
              <div className="space-y-4">
                {[
                  ['IN_PREPARATION','W przygotowaniu','14:22','anna@','Kuchnia: 2 pozycje'],
                  ['CONFIRMED','Potwierdzone','14:15','anna@',''],
                  ['NEW','Przyjęte','14:12','system','Złożenie zamówienia'],
                ].map((r,i,arr)=>(
                  <div key={i} className="flex gap-3 relative">
                    {i<arr.length-1 && <div className="absolute left-[5px] top-4 bottom-[-16px] w-px bg-slate-200"/>}
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${i===0?'bg-primary ring-4 ring-primary/20':'bg-slate-300'}`}/>
                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <div className="text-[13px] font-medium text-slate-900">{r[1]}</div>
                        <div className="font-mono text-[11px] text-slate-400">{r[2]}</div>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">przez {r[3]}{r[4] && ` · ${r[4]}`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modal: Set ETA
const SetEtaModal = () => (
  <div className="w-[640px] h-[560px] bg-slate-900/60 flex items-center justify-center p-8">
    <div className="w-[480px] rounded-xl bg-white shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-start justify-between">
        <div>
          <h2 className="text-[18px] font-semibold text-slate-900">Ustaw przewidywany czas</h2>
          <p className="text-[13px] text-slate-500 mt-1">Klient zobaczy ETA na stronie śledzenia zamówienia.</p>
        </div>
        <button className="w-8 h-8 -m-1 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100"><Icon name="x" size={16}/></button>
      </div>
      <div className="p-6">
        <div className="text-[12px] font-mono tracking-[0.18em] uppercase text-slate-400 mb-3">Szybki wybór</div>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {['+10 min','+20 min','+30 min','+45 min','+60 min'].map((l,i)=>(
            <button key={i} className={`h-12 rounded-md text-[13px] font-medium transition-colors ${i===2?'bg-primary text-white':'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{l}</button>
          ))}
        </div>
        <div className="text-[12px] font-mono tracking-[0.18em] uppercase text-slate-400 mb-3">Lub konkretny czas</div>
        <div className="flex items-center gap-3">
          <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] font-mono focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="15:00"/>
          <div className="text-[13px] text-slate-500 whitespace-nowrap">za ~16 min</div>
        </div>
      </div>
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
        <Btn variant="ghost" size="md">Anuluj</Btn>
        <Btn variant="primary" size="md">Zapisz ETA</Btn>
      </div>
    </div>
  </div>
);

// Modal: Cancel order
const CancelOrderModal = () => (
  <div className="w-[640px] h-[680px] bg-slate-900/60 flex items-center justify-center p-8">
    <div className="w-[520px] rounded-xl bg-white shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600"><Icon name="alert" size={18}/></div>
          <h2 className="text-[18px] font-semibold text-slate-900">Anulować zamówienie 2026‑00126?</h2>
        </div>
        <p className="text-[13px] text-slate-600 leading-relaxed mt-2">Klient <strong>Katarzyna Sobańska</strong> zostanie powiadomiony emailem, a status zamówienia zmieni się na <strong>Anulowane</strong>. Operacja jest nieodwracalna.</p>
      </div>
      <div className="p-6">
        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Powód anulowania <span className="text-rose-600">*</span></label>
        <textarea rows={4} placeholder="np. Brak składników, przeciążona kuchnia, kontakt z klientem niemożliwy..." className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary resize-none"/>
        <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
          <input type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-rose-600"/>
          <span className="text-[13px] text-slate-700 leading-snug">Rozumiem, że klient zostanie powiadomiony o anulowaniu i ta operacja jest nieodwracalna.</span>
        </label>
      </div>
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <Btn variant="ghost" size="md">Zachowaj zamówienie</Btn>
        <Btn variant="danger" size="md">Anuluj zamówienie</Btn>
      </div>
    </div>
  </div>
);

Object.assign(window, { OrderDetails, SetEtaModal, CancelOrderModal });
