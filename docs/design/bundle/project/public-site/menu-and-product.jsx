// Screens 2 & 3 — Menu page + product detail modal/sheet

const categories = ['Pizze', 'Napoje', 'Desery'];
const products = [
  { name:'Margherita DOP', desc:'Passata z San Marzano, mozzarella fior di latte, bazylia.', price:'od 39 zł', cat:'Pizze' },
  { name:'Diavola', desc:'Salsiccia piccante, mozzarella, oregano, oliwa z chili.', price:'od 46 zł', cat:'Pizze' },
  { name:'Quattro Formaggi', desc:'Mozzarella, gorgonzola, taleggio, grana padano.', price:'od 49 zł', cat:'Pizze' },
  { name:'Prosciutto e Funghi', desc:'Szynka dojrzewająca, pieczarki, rukola, parmezan.', price:'od 48 zł', cat:'Pizze' },
  { name:'Capricciosa', desc:'Szynka, pieczarki, karczochy, oliwki, mozzarella.', price:'od 47 zł', cat:'Pizze' },
  { name:'Tartufo', desc:'Kremowy sos truflowy, mozzarella, pieczarki, rukola.', price:'od 58 zł', cat:'Pizze', unavailable:true },
  { name:'Aqua Panna 0,5 l', desc:'Naturalna woda mineralna niegazowana.', price:'9 zł', cat:'Napoje' },
  { name:'Tiramisu', desc:'Klasyczne, z espresso i mascarpone.', price:'22 zł', cat:'Desery' },
];

const MenuDesktop = () => (
  <div className="bg-white w-[1280px]">
    <div className="sticky top-0 z-10"><Nav active="menu"/></div>

    <div className="px-10 pt-14 pb-10">
      <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-3">Nasze menu</div>
      <h1 className="text-[56px] leading-[1.02] font-semibold text-slate-900 tracking-[-0.02em]">
        Nasze <span className="italic font-normal">menu.</span>
      </h1>
      <p className="text-[16px] text-slate-500 max-w-[580px] mt-4 leading-relaxed">
        Krótki opis karty — edytowalny w panelu. Pizze w dwóch rozmiarach: 30 i 40 cm.
      </p>
    </div>

    {/* Sticky category tabs */}
    <div className="sticky top-[72px] z-[5] px-10 py-4 bg-white/85 backdrop-blur border-y border-slate-200">
      <div className="flex items-center gap-2">
        {categories.map((c,i)=>(
          <button key={c} className={`h-9 px-4 rounded-full text-[13px] font-medium transition-colors ${i===0 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{c}</button>
        ))}
        <div className="ml-auto text-[13px] text-slate-500">8 pozycji</div>
      </div>
    </div>

    <div className="px-10 py-12">
      <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-6">Pizze · 6 pozycji</div>
      <div className="grid grid-cols-3 gap-6">
        {products.filter(p=>p.cat==='Pizze').map(p=>(
          <div key={p.name} className={`group cursor-pointer rounded-xl overflow-hidden border border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-lg ${p.unavailable ? 'opacity-60' : ''}`}>
            <div className="relative">
              <Photo ratio="4/3" label={p.name.toLowerCase()}/>
              {p.unavailable && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Badge variant="muted" className="!bg-white !text-slate-700 border border-slate-200">Chwilowo niedostępne</Badge>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-semibold text-slate-900 text-[17px] tracking-tight">{p.name}</div>
                <div className="font-semibold text-slate-900 whitespace-nowrap">{p.price}</div>
              </div>
              <p className="text-[13px] text-slate-500 mt-1.5 leading-snug line-clamp-2">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-6 mt-16">Napoje · 1 pozycja</div>
      <div className="grid grid-cols-3 gap-6">
        {products.filter(p=>p.cat==='Napoje').map(p=>(
          <div key={p.name} className="flex gap-4 rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow cursor-pointer">
            <Photo ratio="1/1" label="" className="w-24 rounded-lg flex-shrink-0"/>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-900 text-[15px]">{p.name}</div>
              <p className="text-[12px] text-slate-500 mt-1 leading-snug">{p.desc}</p>
              <div className="font-semibold text-slate-900 mt-2">{p.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Product detail — desktop centered modal
const ProductModalDesktop = () => (
  <div className="w-[1000px] h-[760px] relative" style={{ background: 'rgba(15,23,42,0.55)' }}>
    <div className="absolute top-6 left-6 font-mono text-[10px] tracking-[0.18em] uppercase text-white/70">ekran 3 · modal produktu (desktop, centered dialog)</div>
    <div className="absolute inset-0 flex items-center justify-center p-10">
      <div className="w-[760px] max-h-full rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col">
        <div className="relative">
          <Photo ratio="21/9" label="quattro formaggi · hero shot"/>
          <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm"><Icon name="x" size={18}/></button>
        </div>
        <div className="p-7 overflow-auto">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[28px] font-semibold text-slate-900 tracking-tight">Quattro Formaggi</h2>
            <Badge variant="primary">Klasyk</Badge>
          </div>
          <p className="text-[14px] text-slate-600 mt-2 leading-relaxed">
            Cztery sery w harmonii: mozzarella fior di latte, gorgonzola dolce, taleggio
            i grana padano. Delikatne krople miodu akacjowego na koniec.
          </p>

          {/* Size */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[13px] font-semibold text-slate-900">Rozmiar</div>
              <div className="text-[11px] text-slate-500">Wybierz jeden</div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-3.5 rounded-md border border-slate-200 cursor-pointer hover:border-slate-300">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300"/>
                  <span className="text-[14px] text-slate-800">30 cm</span>
                </div>
                <span className="text-[14px] font-semibold text-slate-900">49 zł</span>
              </label>
              <label className="flex items-center justify-between p-3.5 rounded-md border-2 border-primary bg-primary/5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-primary"/></span>
                  <span className="text-[14px] font-semibold text-slate-900">40 cm</span>
                </div>
                <span className="text-[14px] font-semibold text-slate-900">59 zł</span>
              </label>
            </div>
          </div>

          {/* Addons */}
          <div className="mt-6">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-[13px] font-semibold text-slate-900">Dodatki</div>
              <div className="text-[11px] text-slate-500">Do 5 dodatków</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Rukola', '+3 zł', true],
                ['Pomidorki koktajlowe', '+4 zł', false],
                ['Oliwa truflowa', '+8 zł', false],
                ['Dodatkowa mozzarella', '+6 zł', false],
              ].map(([n,p,on])=>(
                <label key={n} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${on ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>
                      {on && <Icon name="check" size={11} strokeWidth={3}/>}
                    </span>
                    <span className="text-[13px] text-slate-800">{n}</span>
                  </div>
                  <span className="text-[12px] text-slate-500">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-[13px] font-semibold text-slate-900 mb-2">Uwagi do zamówienia <span className="font-normal text-slate-500">· opcjonalne</span></label>
            <textarea rows={2} placeholder="np. bez cebuli" className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary"/>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-slate-200 px-7 py-4 flex items-center gap-4">
          <div className="flex items-center h-12 rounded-md border border-slate-300">
            <button className="w-11 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50"><Icon name="minus" size={16}/></button>
            <div className="w-10 text-center text-[15px] font-semibold">1</div>
            <button className="w-11 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50"><Icon name="plus" size={16}/></button>
          </div>
          <Btn variant="primary" size="xl" className="flex-1">Dodaj do koszyka — 62 zł</Btn>
        </div>
      </div>
    </div>
  </div>
);

// Product detail — mobile bottom sheet
const ProductSheetMobile = () => (
  <div className="w-[375px] h-[760px] relative overflow-hidden rounded-[24px] bg-slate-900">
    <div className="absolute inset-0 opacity-50"><Photo ratio="" label="" className="h-full"/></div>
    <div className="absolute top-3 left-4 font-mono text-[9px] tracking-[0.18em] uppercase text-white/70">ekran 3 · mobile sheet</div>
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[20px] max-h-[88%] flex flex-col shadow-2xl">
      <div className="pt-2.5 flex justify-center"><div className="w-10 h-1 rounded-full bg-slate-300"/></div>
      <Photo ratio="16/9" label="quattro formaggi" className="mx-4 mt-3 rounded-xl"/>
      <div className="px-5 py-5 overflow-auto flex-1">
        <h2 className="text-[22px] font-semibold text-slate-900 tracking-tight">Quattro Formaggi</h2>
        <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">Mozzarella, gorgonzola, taleggio, grana padano.</p>

        <div className="mt-5">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[13px] font-semibold text-slate-900">Rozmiar</div>
            <div className="text-[11px] text-slate-500">Wybierz jeden</div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-md border border-slate-200">
              <div className="flex items-center gap-2.5"><span className="w-4 h-4 rounded-full border-2 border-slate-300"/><span className="text-[13px]">30 cm</span></div>
              <span className="text-[13px] font-semibold">49 zł</span>
            </label>
            <label className="flex items-center justify-between p-3 rounded-md border-2 border-primary bg-primary/5">
              <div className="flex items-center gap-2.5"><span className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center"><span className="w-2 h-2 rounded-full bg-primary"/></span><span className="text-[13px] font-semibold">40 cm</span></div>
              <span className="text-[13px] font-semibold">59 zł</span>
            </label>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-[13px] font-semibold text-slate-900 mb-2">Dodatki <span className="font-normal text-slate-500">· do 5</span></div>
          <div className="space-y-1.5">
            {[['Rukola','+3 zł',true],['Oliwa truflowa','+8 zł',false]].map(([n,p,on])=>(
              <label key={n} className={`flex items-center justify-between p-2.5 rounded-md border ${on ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2"><span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? 'bg-primary border-primary text-white' : 'border-slate-300'}`}>{on && <Icon name="check" size={10} strokeWidth={3}/>}</span><span className="text-[13px]">{n}</span></div>
                <span className="text-[12px] text-slate-500">{p}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4 flex items-center gap-3">
        <div className="flex items-center h-12 rounded-md border border-slate-300">
          <button className="w-10 h-full flex items-center justify-center"><Icon name="minus" size={14}/></button>
          <div className="w-8 text-center text-[14px] font-semibold">1</div>
          <button className="w-10 h-full flex items-center justify-center"><Icon name="plus" size={14}/></button>
        </div>
        <Btn variant="primary" size="lg" className="flex-1">Dodaj — 62 zł</Btn>
      </div>
    </div>
  </div>
);

Object.assign(window, { MenuDesktop, ProductModalDesktop, ProductSheetMobile });
