// Screen 1 — Landing (desktop + mobile)

const LandingDesktop = () => (
  <div className="bg-white w-[1280px]">
    {/* Sticky nav */}
    <div className="sticky top-0 z-10"><Nav active="home"/></div>

    {/* HERO — editorial, asymmetric */}
    <div className="px-10 pt-16 pb-20 grid grid-cols-12 gap-8 items-end">
      <div className="col-span-5">
        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-primary mb-5">Od 2011 · Mokotów, Warszawa</div>
        <h1 className="text-[88px] leading-[0.95] font-semibold text-slate-900 tracking-[-0.03em]">
          Przykładowa<br/><span className="italic font-normal">Pizzeria.</span>
        </h1>
        <p className="text-[17px] text-slate-600 leading-relaxed mt-6 max-w-[440px]">
          Krótki podtytuł redakcyjny — edytowalny w panelu admina (sekcja „Treści strony").
          Dwa zdania, spokojne, bez sprzedaży.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Btn variant="primary" size="xl">Zamów online →</Btn>
          <Btn variant="ghost" size="xl">Zobacz menu</Btn>
        </div>
        <div className="mt-10 flex items-center gap-6 text-[13px] text-slate-500">
          <div className="flex items-center gap-2"><Icon name="clock" size={16}/><span>Dziś otwarte do <span className="text-slate-900 font-medium">22:00</span></span></div>
          <div className="w-1 h-1 rounded-full bg-slate-300"/>
          <div className="flex items-center gap-2"><Icon name="truck" size={16}/>Dostawa w ~35 min</div>
        </div>
      </div>
      <div className="col-span-7">
        <Photo ratio="5/6" label="hero · pizza margherita, surowe drewno, dramatyczne światło" className="rounded-2xl"/>
      </div>
    </div>

    {/* Menu teaser */}
    <div className="px-10 py-20 border-t border-slate-200">
      <div className="flex items-end justify-between mb-10">
        <div>
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-2">Menu · wybór</div>
          <h2 className="text-[40px] font-semibold text-slate-900 tracking-[-0.015em] leading-[1.05]">Z naszego menu</h2>
        </div>
        <a className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-900 hover:text-primary">Zobacz całe menu <Icon name="arrowRight" size={16}/></a>
      </div>
      <div className="grid grid-cols-4 gap-5">
        {[
          ['Margherita DOP', 'Passata z San Marzano, fior di latte, bazylia.', 'od 39 zł'],
          ['Diavola', 'Salsiccia piccante, mozzarella, oregano.', 'od 46 zł'],
          ['Quattro Formaggi', 'Mozzarella, gorgonzola, taleggio, grana padano.', 'od 49 zł'],
          ['Prosciutto e Funghi', 'Szynka dojrzewająca, pieczarki, rukola.', 'od 48 zł'],
        ].map(([n,d,p])=>(
          <div key={n} className="group cursor-pointer">
            <Photo ratio="1/1" label={n.toLowerCase()} className="rounded-xl transition-transform duration-200 group-hover:-translate-y-1"/>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <div className="font-semibold text-slate-900 text-[16px]">{n}</div>
              <div className="font-semibold text-slate-900 whitespace-nowrap">{p}</div>
            </div>
            <p className="text-[13px] text-slate-500 mt-1 leading-snug">{d}</p>
          </div>
        ))}
      </div>
    </div>

    {/* About — editorial two-column */}
    <div className="px-10 py-24 border-t border-slate-200 bg-[#faf7f2]">
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-5">
          <Photo ratio="4/5" label="wnętrze · bar, drewno, ciepłe światło" className="rounded-2xl"/>
        </div>
        <div className="col-span-6 col-start-7 pt-8">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-3">O nas</div>
          <h2 className="text-[40px] font-semibold text-slate-900 tracking-[-0.015em] leading-[1.05] mb-7">
            Nagłówek sekcji<br/>„O nas".
          </h2>
          <div className="space-y-5 text-[16px] text-slate-600 leading-[1.75] max-w-[540px]">
            <p>Pierwszy akapit — edytowalny w panelu admina. Tu opisz historię,
              podejście, skąd bierzesz składniki. Ton spokojny, redakcyjny.</p>
            <p>Drugi akapit — dodaj szczegóły, które odróżniają lokal od sieciówek.
              Ludzie za tym, nazwy dostawców, rytuały. Dwa-trzy zdania wystarczą.</p>
          </div>
          <div className="mt-10 flex items-center gap-8">
            <div>
              <div className="text-[32px] font-semibold text-slate-900 leading-none">Stat 1</div>
              <div className="text-[12px] text-slate-500 mt-1.5">podpis</div>
            </div>
            <div className="w-px h-10 bg-slate-200"/>
            <div>
              <div className="text-[32px] font-semibold text-slate-900 leading-none">Stat 2</div>
              <div className="text-[12px] text-slate-500 mt-1.5">podpis</div>
            </div>
            <div className="w-px h-10 bg-slate-200"/>
            <div>
              <div className="text-[32px] font-semibold text-slate-900 leading-none">Stat 3</div>
              <div className="text-[12px] text-slate-500 mt-1.5">podpis</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Contact + hours */}
    <div className="px-10 py-24 border-t border-slate-200">
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-5">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-3">Kontakt</div>
          <h2 className="text-[40px] font-semibold text-slate-900 tracking-[-0.015em] leading-[1.05] mb-8">Znajdziesz nas</h2>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon name="mapPin" size={18}/></div>
              <div>
                <div className="text-[15px] font-semibold text-slate-900">ul. Puławska 24</div>
                <div className="text-[14px] text-slate-500 mt-0.5">02-512 Warszawa · Mokotów</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon name="phone" size={18}/></div>
              <div>
                <a className="text-[15px] font-semibold text-slate-900 hover:text-primary">+48 22 123 45 67</a>
                <div className="text-[14px] text-slate-500 mt-0.5">codziennie 12:00 – 22:00</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Icon name="mail" size={18}/></div>
              <div>
                <a className="text-[15px] font-semibold text-slate-900 hover:text-primary">ciao@nonnamaria.pl</a>
                <div className="text-[14px] text-slate-500 mt-0.5">odpowiadamy w 24 h</div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-3">Godziny</div>
            <div className="grid grid-cols-2 gap-y-2 text-[14px] max-w-[340px]">
              {[
                ['Poniedziałek','12:00 – 22:00'],
                ['Wtorek','12:00 – 22:00', true],
                ['Środa','12:00 – 22:00'],
                ['Czwartek','12:00 – 22:00'],
                ['Piątek','12:00 – 23:00'],
                ['Sobota','12:00 – 23:00'],
                ['Niedziela','13:00 – 21:00'],
              ].map(([d,h,active])=>(
                <React.Fragment key={d}>
                  <div className={active ? 'text-slate-900 font-semibold' : 'text-slate-600'}>
                    {active && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 align-middle"/>}
                    {d}{active && <span className="ml-2 font-mono text-[11px] text-primary">DZIŚ</span>}
                  </div>
                  <div className={active ? 'text-slate-900 font-semibold text-right' : 'text-slate-500 text-right'}>{h}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-7">
          <Photo ratio="4/3" label="mapa · OSM, pin na Puławskiej" className="rounded-2xl" tone="cool"/>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="px-10 py-10 border-t border-slate-200 bg-white">
      <div className="flex items-center justify-between text-[13px] text-slate-500">
        <div>© 2026 Nonna Maria. Wszystkie prawa zastrzeżone.</div>
        <div className="flex items-center gap-5">
          <a className="hover:text-slate-900">Regulamin</a>
          <a className="hover:text-slate-900">Polityka prywatności</a>
          <a className="text-slate-400 hover:text-slate-600 text-[12px]">Panel</a>
        </div>
      </div>
    </div>
  </div>
);

const LandingMobile = () => (
  <div className="bg-white w-[375px]">
    <MobileNav/>
    <Photo ratio="4/5" label="hero · margherita" className="w-full"/>
    <div className="px-5 pt-7 pb-6">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-primary mb-3">Od 2011 · Warszawa</div>
      <h1 className="text-[40px] leading-[0.98] font-semibold text-slate-900 tracking-[-0.02em]">
        Przykładowa <span className="italic font-normal">Pizzeria.</span>
      </h1>
      <p className="text-[14px] text-slate-600 leading-relaxed mt-4">
        Krótki podtytuł — edytowalny w panelu admina.
      </p>
      <Btn variant="primary" size="xl" className="w-full mt-6">Zamów online →</Btn>
      <div className="flex items-center justify-between text-[12px] text-slate-500 mt-5 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-1.5"><Icon name="clock" size={14}/>Dziś do <span className="text-slate-900 font-medium">22:00</span></div>
        <div className="flex items-center gap-1.5"><Icon name="truck" size={14}/>~35 min</div>
      </div>
    </div>

    <div className="px-5 py-8">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-[24px] font-semibold text-slate-900 tracking-tight">Z naszego menu</h2>
        <a className="text-[12px] font-medium text-primary">Całe menu →</a>
      </div>
      <div className="space-y-4">
        {[
          ['Margherita DOP','San Marzano, fior di latte, bazylia.','od 39 zł'],
          ['Diavola','Salsiccia piccante, mozzarella.','od 46 zł'],
          ['Quattro Formaggi','Cztery sery, orzechy włoskie.','od 49 zł'],
        ].map(([n,d,p])=>(
          <div key={n} className="flex gap-4">
            <Photo ratio="1/1" label="" className="w-24 flex-shrink-0 rounded-lg"/>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <div className="font-semibold text-slate-900 text-[15px]">{n}</div>
                <div className="font-semibold text-slate-900 text-[14px] whitespace-nowrap">{p}</div>
              </div>
              <p className="text-[12px] text-slate-500 mt-1 leading-snug">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="px-5 py-8 border-t border-slate-200 bg-[#faf7f2]">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-2">O nas</div>
      <h2 className="text-[26px] font-semibold text-slate-900 tracking-tight leading-[1.1] mb-4">
        Nagłówek „O nas".
      </h2>
      <p className="text-[14px] text-slate-600 leading-[1.7]">
        Krótki akapit redakcyjny — edytowalny w panelu admina (sekcja „Treści strony").
      </p>
    </div>

    <div className="px-5 py-8 border-t border-slate-200">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-slate-400 mb-2">Kontakt</div>
      <h2 className="text-[26px] font-semibold text-slate-900 mb-5">Znajdziesz nas</h2>
      <div className="space-y-3.5 text-[14px]">
        <div className="flex items-start gap-3"><Icon name="mapPin" size={16} className="text-slate-400 mt-0.5"/><div><div className="font-semibold text-slate-900">ul. Puławska 24</div><div className="text-slate-500 text-[13px]">02-512 Warszawa · Mokotów</div></div></div>
        <div className="flex items-start gap-3"><Icon name="phone" size={16} className="text-slate-400 mt-0.5"/><a className="font-semibold text-slate-900">+48 22 123 45 67</a></div>
      </div>
    </div>

    <div className="h-20"/>
    {/* Sticky bottom CTA */}
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3" style={{position:'sticky'}}>
      <Btn variant="primary" size="xl" className="w-full">Zamów online →</Btn>
    </div>
  </div>
);

Object.assign(window, { LandingDesktop, LandingMobile });
