// Screens 16, 17, 18 — Settings (general, hours, content)

const SField = ({ label, help, children }) => (
  <div>
    <label className="block text-[13px] font-medium text-slate-700 mb-1.5">{label}</label>
    {children}
    {help && <div className="text-[12px] text-slate-500 mt-1.5">{help}</div>}
  </div>
);

const SettingsNav = ({ active }) => (
  <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
    {[['general','Ogólne'],['hours','Godziny otwarcia'],['content','Treści strony']].map(([k,l])=>(
      <a key={k} className={`px-4 py-3 text-[14px] ${active===k?'font-medium text-slate-900 border-b-2 border-primary -mb-px':'text-slate-500 hover:text-slate-900'}`}>{l}</a>
    ))}
  </div>
);

const SettingsGeneral = () => {
  const swatches = ['#FF6B35','#D4482F','#B8363B','#9C5729','#4F6D3B','#2E5A4F'];
  return (
    <div className="w-[1280px] bg-slate-50 flex">
      <Sidebar active="settings"/>
      <div className="flex-1 min-w-0">
        <TopBar title="Ustawienia"
          actions={<>
            <Btn variant="ghost" size="md">Anuluj</Btn>
            <Btn variant="primary" size="md"><Icon name="check" size={14}/>Zapisz zmiany</Btn>
          </>}
        />
        <div className="p-8 max-w-[960px]">
          <SettingsNav active="general"/>

          <div className="space-y-5">
            <Card title="Informacje o restauracji" icon="utensils">
              <div className="grid grid-cols-2 gap-5">
                <SField label="Nazwa">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="Nonna Maria"/>
                </SField>
                <SField label="Slogan" help="Widoczny pod nazwą w hero.">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="Neapolitańska pizza w sercu Warszawy"/>
                </SField>
                <SField label="Email kontaktowy">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="kontakt@nonnamaria.pl"/>
                </SField>
                <SField label="Telefon">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] font-mono" defaultValue="+48 22 555 12 34"/>
                </SField>
                <div className="col-span-2">
                  <SField label="Adres">
                    <textarea rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-[14px] resize-none" defaultValue="ul. Mokotowska 28&#10;00‑561 Warszawa"/>
                  </SField>
                </div>
                <div className="col-span-2">
                  <SField label="Link do Google Maps" help="Wklej link do lokalizacji w Google Maps.">
                    <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] font-mono text-[12px] text-slate-600" defaultValue="https://maps.google.com/?q=Mokotowska+28+Warszawa"/>
                  </SField>
                </div>
              </div>
            </Card>

            <Card title="Kolor marki" icon="sparkles">
              <div className="grid grid-cols-[1fr_320px] gap-8">
                <div>
                  <SField label="Wartość HEX" help={'Tak będzie wyglądać kolor marki na stronie klienta. Zmiana zapisze się po kliknięciu „Zapisz".'}>
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-md border border-slate-200" style={{background:'#FF6B35'}}/>
                      <input className="h-11 flex-1 rounded-md border border-slate-300 px-3 text-[14px] font-mono" defaultValue="#FF6B35"/>
                    </div>
                  </SField>
                  <div className="mt-5">
                    <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-2">Sugerowane</div>
                    <div className="flex items-center gap-2">
                      {swatches.map((c,i)=>(
                        <button key={c} className={`w-10 h-10 rounded-md border-2 transition-all ${i===0?'border-slate-900 scale-105':'border-transparent hover:scale-105'}`} style={{background:c}}/>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                  <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-4 flex items-center gap-1.5">
                    <Icon name="sparkles" size={12}/>Podgląd live
                  </div>
                  <div className="space-y-3">
                    <Btn variant="primary" size="md" className="w-full">Zamów online</Btn>
                    <div className="flex items-center justify-center">
                      <a className="text-[13px] font-medium text-primary underline underline-offset-4">Zobacz całe menu →</a>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="primary">Nowe</Badge>
                      <Badge variant="outline">Dostawa</Badge>
                    </div>
                    <div className="rounded-md bg-white border border-slate-200 p-3">
                      <div className="text-[13px] font-medium text-slate-900">Margherita</div>
                      <div className="text-[12px] text-slate-500">Klasyka neapolitańska</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="font-mono text-[13px] text-primary font-semibold">od 39 zł</div>
                        <button className="h-8 px-3 rounded-md bg-primary text-white text-[12px] font-medium">Dodaj</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsHours = () => {
  const days = [
    ['Poniedziałek','12:00','22:00',true],
    ['Wtorek','12:00','22:00',true],
    ['Środa','12:00','22:00',true],
    ['Czwartek','12:00','23:00',true],
    ['Piątek','12:00','23:00',true],
    ['Sobota','12:00','23:00',true],
    ['Niedziela','','',false],
  ];
  return (
    <div className="w-[1280px] bg-slate-50 flex">
      <Sidebar active="settings"/>
      <div className="flex-1 min-w-0">
        <TopBar title="Ustawienia"
          actions={<Btn variant="primary" size="md"><Icon name="check" size={14}/>Zapisz zmiany</Btn>}
        />
        <div className="p-8 max-w-[960px]">
          <SettingsNav active="hours"/>

          <Card title="Godziny otwarcia" icon="clock">
            <div className="divide-y divide-slate-100 -mx-2">
              {days.map(([name,from,to,open],i)=>(
                <div key={name} className="flex items-center gap-5 px-2 py-4 group">
                  <div className="w-36 text-[14px] font-medium text-slate-900">{name}</div>
                  <div className="flex items-center gap-2.5 w-44">
                    <div className={`w-10 h-6 rounded-full p-0.5 flex items-center ${open?'bg-primary':'bg-slate-200'}`}>
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm ${open?'ml-auto':''}`}/>
                    </div>
                    <span className={`text-[13px] ${open?'text-slate-900':'text-slate-400'}`}>{open?'Otwarte':'Zamknięte'}</span>
                  </div>
                  {open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input className="h-10 w-24 rounded-md border border-slate-300 px-3 text-[14px] font-mono text-center" defaultValue={from}/>
                      <span className="text-[13px] text-slate-400">—</span>
                      <input className="h-10 w-24 rounded-md border border-slate-300 px-3 text-[14px] font-mono text-center" defaultValue={to}/>
                    </div>
                  ) : (
                    <div className="flex-1 text-[13px] text-slate-400">Zamknięte cały dzień</div>
                  )}
                  <button className="h-9 px-3 rounded-md text-[12px] text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-100 flex items-center gap-1.5">
                    <Icon name="edit" size={13}/>Skopiuj godziny
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <div className="mt-5 rounded-md bg-sky-50 border border-sky-200 p-4 flex items-start gap-3 text-[13px] text-sky-900">
            <Icon name="info" size={16} className="flex-shrink-0 mt-0.5"/>
            <div>
              <strong>Tylko regularny tydzień.</strong> Wyjątki świąteczne i specjalne godziny będą dostępne w kolejnej wersji panelu.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsContent = () => (
  <div className="w-[1280px] bg-slate-50 flex">
    <Sidebar active="settings"/>
    <div className="flex-1 min-w-0">
      <TopBar title="Ustawienia"
        actions={<Btn variant="primary" size="md"><Icon name="check" size={14}/>Zapisz zmiany</Btn>}
      />
      <div className="p-8">
        <SettingsNav active="content"/>

        <div className="grid grid-cols-[1fr_420px] gap-6">
          {/* Forms */}
          <div className="space-y-5">
            <Card title="Hero (strona główna)" icon="sparkles">
              <div className="space-y-5">
                <SField label="Tytuł">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[16px] font-semibold" defaultValue="Nonna Maria."/>
                </SField>
                <SField label="Podtytuł" help="1–2 zdania. Krótko, bez metafor.">
                  <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-[14px] resize-none" defaultValue="Neapolitańska pizza w sercu Mokotowa. Ciasto dojrzewające 48 godzin, piec opalany drewnem, prawdziwa mozzarella fior di latte."/>
                </SField>
                <SField label="Tekst przycisku CTA">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="Zamów online"/>
                </SField>
                <SField label="URL zdjęcia hero">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] font-mono text-[12px] text-slate-600" defaultValue="https://images.unsplash.com/photo-1513104890138-7c749659a591"/>
                </SField>
              </div>
            </Card>

            <Card title="O nas" icon="message">
              <div className="space-y-5">
                <SField label="Nagłówek">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[15px] font-semibold" defaultValue="Rodzinna pizzeria od 2019 roku."/>
                </SField>
                <SField label="Tekst" help="Dłuższy akapit, editorial. Markdown lub zwykły tekst.">
                  <textarea rows={8} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-[14px] leading-relaxed resize-none" defaultValue="Zaczęliśmy od jednego pieca i dwóch rodzajów pizzy. Dziś, siedem lat później, nadal trzymamy się tego, co ważne: ciasto dojrzewa u nas minimum 48 godzin, mąka jest typu 00 prosto z Neapolu, a każda pizza wypieka się w piecu opalanym drewnem bukowym w temperaturze 400°C — przez dokładnie 90 sekund.&#10;&#10;Nie robimy rzeczy na skróty. I mamy nadzieję, że to czuć."/>
                </SField>
                <SField label="URL zdjęcia">
                  <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] font-mono text-[12px] text-slate-600" defaultValue="https://images.unsplash.com/photo-1590947132387"/>
                </SField>
              </div>
            </Card>
          </div>

          {/* Live preview */}
          <div className="sticky top-8">
            <div className="text-[11px] font-mono tracking-[0.18em] uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <Icon name="sparkles" size={12}/>Podgląd live
            </div>
            <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
              <div className="relative">
                <Photo ratio="4/3" label="pizza hero" tone="warm"/>
                <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black/40 to-transparent">
                  <div className="text-white text-[22px] font-semibold tracking-tight leading-tight">Nonna <span className="italic font-normal">Maria.</span></div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[13px] text-slate-700 leading-relaxed">Neapolitańska pizza w sercu Mokotowa. Ciasto dojrzewające 48 godzin, piec opalany drewnem, prawdziwa mozzarella fior di latte.</p>
                <button className="mt-4 h-10 px-4 rounded-md bg-primary text-white text-[13px] font-medium w-full">Zamów online</button>
              </div>
              <div className="border-t border-slate-100 p-5">
                <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-2">O nas</div>
                <div className="text-[15px] font-semibold text-slate-900 tracking-tight mb-2">Rodzinna pizzeria od 2019 roku.</div>
                <p className="text-[12px] text-slate-600 leading-relaxed line-clamp-6">Zaczęliśmy od jednego pieca i dwóch rodzajów pizzy. Dziś, siedem lat później, nadal trzymamy się tego, co ważne: ciasto dojrzewa u nas minimum 48 godzin, mąka jest typu 00 prosto z Neapolu...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { SettingsGeneral, SettingsHours, SettingsContent });
