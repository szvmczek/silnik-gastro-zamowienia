// Screens 13, 14, 15 — Menu management

const CategoriesList = () => (
  <div className="w-[1280px] bg-slate-50 flex">
    <Sidebar active="menu"/>
    <div className="flex-1 min-w-0">
      <TopBar title="Kategorie menu" subtitle="3 kategorie · kolejność z drag & drop"
        actions={<Btn variant="primary" size="md"><Icon name="plus" size={14}/>Dodaj kategorię</Btn>}
      />
      <div className="p-8 max-w-[860px]">
        {/* Tabs secondary nav within Menu */}
        <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
          <a className="px-4 py-3 text-[14px] font-medium text-slate-900 border-b-2 border-primary -mb-px">Kategorie</a>
          <a className="px-4 py-3 text-[14px] text-slate-500 hover:text-slate-900">Produkty</a>
          <a className="px-4 py-3 text-[14px] text-slate-500 hover:text-slate-900">Grupy dodatków</a>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          {[
            ['Pizze', 8, true, 1],
            ['Napoje', 4, true, 2],
            ['Desery', 2, true, 3],
          ].map(([name, count, active, order], i, arr)=>(
            <div key={name} className={`flex items-center gap-4 px-5 py-4 ${i<arr.length-1?'border-b border-slate-100':''} group hover:bg-slate-50`}>
              <div className="cursor-grab text-slate-300 group-hover:text-slate-500"><Icon name="menu" size={16}/></div>
              <div className="font-mono text-[11px] text-slate-400 w-6">{String(order).padStart(2,'0')}</div>
              <div className="flex-1">
                <div className="text-[15px] font-medium text-slate-900">{name}</div>
                <div className="text-[12px] text-slate-500">{count} {count===1?'produkt':count<5?'produkty':'produktów'}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-500">Aktywna</span>
                <div className="w-9 h-5 rounded-full bg-primary p-0.5 flex items-center">
                  <div className="w-4 h-4 rounded-full bg-white ml-auto shadow-sm"/>
                </div>
              </div>
              <button className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Icon name="edit" size={15}/></button>
              <button className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Icon name="trash" size={15}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProductsList = () => {
  const rows = [
    ['Margherita','Pizze','od 39 zł','2 warianty', true],
    ['Diavola','Pizze','od 44 zł','2 warianty', true],
    ['Prosciutto e funghi','Pizze','od 46 zł','2 warianty', true],
    ['Quattro formaggi','Pizze','od 48 zł','2 warianty', false],
    ['Capricciosa','Pizze','od 46 zł','2 warianty', true],
    ['Hawajska','Pizze','od 44 zł','2 warianty', true],
    ['Coca‑Cola 0,5 l','Napoje','7 zł','—', true],
    ['Pepsi 0,5 l','Napoje','7 zł','—', true],
    ['Woda gazowana','Napoje','5 zł','—', true],
    ['Tiramisu','Desery','19 zł','—', true],
    ['Panna cotta','Desery','17 zł','—', false],
  ];
  return (
    <div className="w-[1280px] bg-slate-50 flex">
      <Sidebar active="menu"/>
      <div className="flex-1 min-w-0">
        <TopBar title="Produkty" subtitle="11 produktów · 3 kategorie"
          actions={<Btn variant="primary" size="md"><Icon name="plus" size={14}/>Dodaj produkt</Btn>}
        />
        <div className="p-8">
          <div className="flex items-center gap-1 mb-6 border-b border-slate-200">
            <a className="px-4 py-3 text-[14px] text-slate-500 hover:text-slate-900">Kategorie</a>
            <a className="px-4 py-3 text-[14px] font-medium text-slate-900 border-b-2 border-primary -mb-px">Produkty</a>
            <a className="px-4 py-3 text-[14px] text-slate-500 hover:text-slate-900">Grupy dodatków</a>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Szukaj produktu..."/>
            </div>
            <button className="h-10 px-3 rounded-md border border-slate-300 bg-white text-[13px] text-slate-700 flex items-center gap-2"><Icon name="filter" size={14}/>Wszystkie kategorie<Icon name="chevDown" size={14}/></button>
            <button className="h-10 px-3 rounded-md border border-slate-300 bg-white text-[13px] text-slate-700 flex items-center gap-2">Dostępne i niedostępne<Icon name="chevDown" size={14}/></button>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{width:'64px'}}/>
                <col/>
                <col style={{width:'120px'}}/>
                <col style={{width:'120px'}}/>
                <col style={{width:'120px'}}/>
                <col style={{width:'180px'}}/>
                <col style={{width:'100px'}}/>
              </colgroup>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <Th></Th>
                  <Th>Nazwa</Th>
                  <Th>Kategoria</Th>
                  <Th align="right">Cena</Th>
                  <Th>Warianty</Th>
                  <Th>Dostępność</Th>
                  <Th align="right">Akcje</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r,i)=>(
                  <tr key={i} className={`hover:bg-slate-50 ${!r[4]?'opacity-70':''}`}>
                    <Td>
                      <div className="w-10 h-10 rounded-md overflow-hidden"><Photo ratio="1/1" label=" " tone="warm"/></div>
                    </Td>
                    <Td className="!text-[14px] !font-medium !text-slate-900">{r[0]}</Td>
                    <Td><Badge variant="outline">{r[1]}</Badge></Td>
                    <Td mono align="right" className="!text-[13px] !font-semibold !text-slate-900">{r[2]}</Td>
                    <Td className="!text-[12px] !text-slate-500">{r[3]}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-5 rounded-full p-0.5 flex items-center flex-shrink-0 ${r[4]?'bg-primary':'bg-slate-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm ${r[4]?'ml-auto':''}`}/>
                        </div>
                        <span className="text-[12px] text-slate-600">{r[4]?'Dostępny':'Niedostępny'}</span>
                      </div>
                    </Td>
                    <Td align="right">
                      <div className="inline-flex items-center gap-1">
                        <button className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Icon name="edit" size={14}/></button>
                        <button className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Icon name="trash" size={14}/></button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, help, children, required }) => (
  <div>
    <div className="flex items-baseline justify-between mb-1.5">
      <label className="text-[13px] font-medium text-slate-700">{label}{required && <span className="text-rose-600 ml-0.5">*</span>}</label>
    </div>
    {children}
    {help && <div className="text-[12px] text-slate-500 mt-1.5">{help}</div>}
  </div>
);

const ProductForm = () => (
  <div className="w-[1280px] bg-slate-50 flex">
    <Sidebar active="menu"/>
    <div className="flex-1 min-w-0">
      <div className="h-[72px] px-8 border-b border-slate-200 bg-white flex items-center">
        <a className="text-[13px] text-slate-500 hover:text-slate-900 flex items-center gap-1.5"><Icon name="chevLeft" size={14}/>Produkty</a>
      </div>
      <div className="p-8 max-w-[960px]">
        <div className="mb-6">
          <h1 className="text-[24px] font-semibold text-slate-900 tracking-tight">Edytuj produkt</h1>
          <div className="text-[13px] text-slate-500 mt-1">Margherita · ID prod_m3r1gh</div>
        </div>

        <div className="space-y-5">
          <Card title="Podstawowe" icon="utensils">
            <div className="grid grid-cols-2 gap-5">
              <Field label="Nazwa" required>
                <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px]" defaultValue="Margherita"/>
              </Field>
              <Field label="Slug" help="Używany w adresie URL">
                <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] font-mono text-slate-600" defaultValue="margherita"/>
              </Field>
              <Field label="Kategoria" required>
                <button className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[14px] text-left flex items-center justify-between">Pizze<Icon name="chevDown" size={14} className="text-slate-400"/></button>
              </Field>
              <div/>
              <div className="col-span-2">
                <Field label="Opis" help="Widoczny w menu pod nazwą. 1–2 zdania działają najlepiej.">
                  <textarea rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-[14px] leading-relaxed resize-none" defaultValue="Pomidory San Marzano, mozzarella fior di latte, świeża bazylia, oliwa extra vergine. Klasyka w najprostszej, najlepszej formie."/>
                </Field>
              </div>
            </div>
          </Card>

          <Card title="Cena" icon="bag">
            <Field label="Cena bazowa" help="Jeśli dodasz warianty poniżej, cena bazowa jest ignorowana — każdy wariant ma własną cenę.">
              <div className="relative w-48">
                <input className="h-11 w-full rounded-md border border-slate-300 pl-3 pr-10 text-[14px] font-mono" defaultValue="39.00"/>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-500">zł</span>
              </div>
            </Field>
          </Card>

          <Card title="Warianty rozmiaru" icon="plus">
            <div className="space-y-2">
              {[['30 cm','39.00'],['40 cm','49.00']].map((v,i)=>(
                <div key={i} className="flex items-center gap-3 p-3 rounded-md border border-slate-200 bg-slate-50/50">
                  <div className="cursor-grab text-slate-300"><Icon name="menu" size={14}/></div>
                  <input className="h-10 flex-1 rounded-md border border-slate-300 bg-white px-3 text-[14px]" defaultValue={v[0]}/>
                  <div className="relative w-32">
                    <input className="h-10 w-full rounded-md border border-slate-300 bg-white pl-3 pr-8 text-[14px] font-mono" defaultValue={v[1]}/>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-slate-500">zł</span>
                  </div>
                  <button className="w-9 h-9 rounded-md flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Icon name="trash" size={15}/></button>
                </div>
              ))}
              <button className="w-full h-11 rounded-md border border-dashed border-slate-300 text-[13px] text-slate-600 hover:border-primary hover:text-primary flex items-center justify-center gap-2"><Icon name="plus" size={14}/>Dodaj wariant</button>
            </div>
          </Card>

          <Card title="Zdjęcie" icon="sparkles">
            <div className="grid grid-cols-[1fr_200px] gap-4 items-start">
              <Field label="URL zdjęcia" help="Wklej link do zdjęcia. Polecamy Unsplash.com — znajdź zdjęcie, kliknij prawym → Kopiuj adres obrazu.">
                <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] font-mono text-[12px] text-slate-600" defaultValue="https://images.unsplash.com/photo-1574071318508-1cdbab80d002"/>
              </Field>
              <div>
                <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 mb-1.5">Podgląd</div>
                <Photo ratio="4/3" label="margherita" className="rounded-md"/>
              </div>
            </div>
          </Card>

          <Card title="Dostępność" icon="clock">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-md border border-slate-200">
                <div>
                  <div className="text-[14px] font-medium text-slate-900">Aktywny w menu</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Widoczny dla klientów na stronie.</div>
                </div>
                <div className="w-10 h-6 rounded-full bg-primary p-0.5 flex items-center"><div className="w-5 h-5 rounded-full bg-white shadow-sm ml-auto"/></div>
              </label>
              <label className="flex items-center justify-between p-3 rounded-md border border-slate-200">
                <div>
                  <div className="text-[14px] font-medium text-slate-900">Chwilowo niedostępny</div>
                  <div className="text-[12px] text-slate-500 mt-0.5">Widoczny, ale nie można go zamówić (np. skończyły się składniki).</div>
                </div>
                <div className="w-10 h-6 rounded-full bg-slate-200 p-0.5 flex items-center"><div className="w-5 h-5 rounded-full bg-white shadow-sm"/></div>
              </label>
            </div>
          </Card>

          <div className="flex items-center justify-between pt-2">
            <Btn variant="dangerOutline" size="md"><Icon name="trash" size={14}/>Usuń produkt</Btn>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" size="md">Anuluj</Btn>
              <Btn variant="primary" size="md">Zapisz zmiany</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { CategoriesList, ProductsList, ProductForm });
