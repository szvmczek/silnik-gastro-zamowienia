// Screens 6 & 7 — Order confirmation + public tracking

const Confirmation = () => (
  <div className="bg-slate-50 w-[1280px] min-h-[820px]">
    <div className="bg-white"><Nav/></div>
    <div className="flex justify-center pt-16 pb-20 px-10">
      <div className="w-[580px]">
        <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center shadow-sm">
          <div className="relative inline-flex">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="checkCircle" size={32} strokeWidth={2} className="text-primary"/>
            </div>
          </div>
          <h1 className="text-[36px] font-semibold text-slate-900 tracking-tight mt-5">Dziękujemy za zamówienie!</h1>
          <p className="text-[15px] text-slate-500 mt-3 max-w-[440px] mx-auto leading-relaxed">
            Link do śledzenia zamówienia został wysłany na <span className="text-slate-700">anna.kowalska@gmail.com</span>. Możesz go też otworzyć teraz.
          </p>
          <div className="mt-7 py-5 px-6 rounded-xl bg-slate-50 border border-slate-200 inline-block">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400">Numer zamówienia</div>
            <div className="mt-1 font-mono text-[32px] font-semibold text-slate-900 tracking-tight">2026‑00123</div>
          </div>
          <div className="mt-8">
            <Btn variant="primary" size="xl" className="w-full md:w-auto md:px-10">Śledź zamówienie →</Btn>
          </div>
          <a className="block mt-5 text-[13px] text-slate-500 hover:text-slate-900">← Wróć do menu</a>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 mt-5 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="text-[14px] font-semibold text-slate-900">Podsumowanie</div>
            <div className="text-[13px] text-slate-500">~35 min</div>
          </div>
          <div className="px-6 py-2 divide-y divide-slate-100">
            {[['1× Quattro Formaggi','40 cm · +rukola','62 zł'],['2× Margherita DOP','30 cm','78 zł'],['1× Tiramisu','','22 zł'],['','Dostawa','8 zł']].map(([n,o,p],i)=>(
              <div key={i} className="py-3 flex items-start justify-between">
                <div>{n && <div className="text-[13px] font-medium text-slate-900">{n}</div>}<div className="text-[12px] text-slate-500">{o}</div></div>
                <div className="text-[13px] font-semibold text-slate-900">{p}</div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[14px] font-semibold text-slate-900">Razem</div>
            <div className="text-[20px] font-semibold text-slate-900">170 zł</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TrackingDesktop = () => {
  const steps = [
    { label: 'Przyjęte', time:'18:12', done: true },
    { label: 'Potwierdzone', time:'18:13', done: true },
    { label: 'W przygotowaniu', time:'18:18', active: true },
    { label: 'Gotowe', time:'~18:32' },
    { label: 'W drodze', time:'~18:36' },
    { label: 'Dostarczone', time:'~18:45' },
  ];
  return (
    <div className="bg-slate-50 w-[1280px]">
      <div className="bg-white"><Nav/></div>
      <div className="px-10 py-12 max-w-[980px] mx-auto">
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400">Zamówienie</div>
            <h1 className="mt-1 font-mono text-[44px] font-semibold text-slate-900 tracking-tight leading-none">2026‑00123</h1>
            <div className="mt-2 text-[14px] text-slate-500">Złożone 5 min temu · Dostawa do ul. Marszałkowska 12/5</div>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-slate-400">
            <Icon name="refresh" size={14} className="text-emerald-500"/> Ostatnia aktualizacja: 3 sek. temu
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl bg-white border border-slate-200 p-10">
          <div className="flex items-start justify-between relative">
            <div className="absolute top-5 left-10 right-10 h-[2px] bg-slate-200"/>
            <div className="absolute top-5 left-10 h-[2px] bg-emerald-500" style={{ width: `calc((100% - 80px) * ${2/5})` }}/>
            {steps.map((s,i)=>(
              <div key={s.label} className="relative flex flex-col items-center w-[130px]">
                <div className="relative">
                  {s.active && (
                    <>
                      <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(255,107,53,0.35)' }}/>
                      <div className="absolute -inset-1 rounded-full border-2 border-primary/40"/>
                    </>
                  )}
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                    s.done ? 'bg-emerald-500 text-white' : s.active ? 'bg-primary text-white' : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {s.done ? <Icon name="check" size={16} strokeWidth={3}/> : (
                      i===0?<Icon name="checkCircle" size={16}/>:
                      i===1?<Icon name="checkCircle" size={16}/>:
                      i===2?<Icon name="flame" size={16}/>:
                      i===3?<Icon name="pkg" size={16}/>:
                      i===4?<Icon name="truck" size={16}/>:
                            <Icon name="home" size={16}/>
                    )}
                  </div>
                </div>
                <div className={`text-[12px] mt-3 text-center font-medium ${s.active ? 'text-slate-900' : s.done ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</div>
                <div className="font-mono text-[10px] text-slate-400 mt-0.5">{s.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ETA + support */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-5 mt-5">
          <div className="rounded-2xl bg-slate-900 text-white p-8">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/50">Przewidywany czas dostawy</div>
            <div className="mt-2 flex items-baseline gap-4">
              <div className="font-mono text-[64px] font-semibold leading-none tracking-tight">18:45</div>
              <div className="text-[14px] text-white/70">za ~17 minut</div>
            </div>
            <div className="mt-6 h-1 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: '32%' }}/>
            </div>
            <div className="flex items-center justify-between text-[11px] text-white/50 mt-2">
              <span>Przygotowujemy</span><span>Dostarczone</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-8 flex flex-col">
            <div className="text-[14px] font-semibold text-slate-900">Masz pytanie do restauracji?</div>
            <div className="text-[13px] text-slate-500 mt-1">Chętnie odpowiemy — godziny otwarcia 12:00 – 22:00.</div>
            <div className="mt-auto pt-5">
              <Btn variant="outline" size="lg" className="w-full">
                <Icon name="phone" size={16}/>+48 22 123 45 67
              </Btn>
            </div>
          </div>
        </div>

        {/* Details collapsed */}
        <div className="rounded-2xl bg-white border border-slate-200 mt-5">
          <button className="w-full px-6 py-5 flex items-center justify-between">
            <div className="text-[14px] font-semibold text-slate-900">Szczegóły zamówienia · 4 pozycje</div>
            <div className="flex items-center gap-2 text-[13px] text-slate-500">170 zł <Icon name="chevDown" size={16}/></div>
          </button>
        </div>
      </div>
    </div>
  );
};

const TrackingMobile = () => {
  const steps = [
    { label: 'Przyjęte', time:'18:12', done: true },
    { label: 'Potwierdzone', time:'18:13', done: true },
    { label: 'W przygotowaniu', time:'18:18', active: true },
    { label: 'Gotowe', time:'~18:32' },
    { label: 'W drodze', time:'~18:36' },
    { label: 'Dostarczone', time:'~18:45' },
  ];
  return (
    <div className="bg-slate-50 w-[375px]">
      <MobileNav/>
      <div className="px-5 py-6">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400">Zamówienie</div>
        <div className="font-mono text-[32px] font-semibold text-slate-900 tracking-tight leading-none mt-1">2026‑00123</div>
        <div className="text-[12px] text-slate-500 mt-1.5">Złożone 5 min temu · Dostawa</div>

        <div className="mt-5 rounded-2xl bg-slate-900 text-white p-5">
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/50">Przewidywany czas</div>
          <div className="mt-1 font-mono text-[40px] font-semibold leading-none">18:45</div>
          <div className="text-[12px] text-white/70 mt-1">za ~17 minut</div>
          <div className="mt-4 h-1 rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width:'32%' }}/></div>
        </div>

        <div className="mt-5 rounded-2xl bg-white border border-slate-200 p-5">
          <div className="space-y-5">
            {steps.map((s,i)=>(
              <div key={s.label} className="flex items-start gap-3 relative">
                {i < steps.length-1 && <div className="absolute left-[15px] top-[34px] bottom-[-20px] w-px bg-slate-200"/>}
                <div className="relative flex-shrink-0">
                  {s.active && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(255,107,53,0.35)' }}/>}
                  <div className={`relative w-[30px] h-[30px] rounded-full flex items-center justify-center ${
                    s.done ? 'bg-emerald-500 text-white' : s.active ? 'bg-primary text-white' : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}>
                    {s.done ? <Icon name="check" size={12} strokeWidth={3}/> :
                      (i===2?<Icon name="flame" size={12}/>:i===4?<Icon name="truck" size={12}/>:i===5?<Icon name="home" size={12}/>:<Icon name="checkCircle" size={12}/>)}
                  </div>
                </div>
                <div className="flex-1 flex items-start justify-between">
                  <div>
                    <div className={`text-[13px] font-medium ${s.active ? 'text-slate-900' : s.done ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</div>
                    {s.active && <div className="text-[11px] text-primary mt-0.5">W toku — pizza jest w piecu</div>}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">{s.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Btn variant="outline" size="lg" className="w-full mt-5">
          <Icon name="phone" size={16}/>Zadzwoń do restauracji
        </Btn>

        <div className="text-[11px] text-slate-400 mt-4 flex items-center gap-1.5 justify-center">
          <Icon name="refresh" size={12}/> Ostatnia aktualizacja: 3 sek. temu
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Confirmation, TrackingDesktop, TrackingMobile });
