// Screen 11 — Orders list (TABLE layout — columns aligned, single baseline)

const FilterChip = ({ active, children, onClick }) => (
  <button onClick={onClick} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium transition-colors ${
    active ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
  }`}>
    {children}
    {active && <Icon name="x" size={12}/>}
  </button>
);

const Th = ({ children, className='', align='left' }) => (
  <th className={`px-4 py-2.5 text-[11px] font-mono tracking-[0.15em] uppercase text-slate-400 font-medium text-${align} ${className}`}>{children}</th>
);
const Td = ({ children, className='', mono=false, align='left' }) => (
  <td className={`px-4 py-3.5 text-[13px] text-slate-700 align-middle text-${align} ${mono?'font-mono':''} ${className}`}>{children}</td>
);

const OrdersTable = ({ rows }) => (
  <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
    <table className="w-full table-fixed border-collapse">
      <colgroup>
        <col style={{width:'148px'}}/>
        <col style={{width:'108px'}}/>
        <col/>
        <col style={{width:'84px'}}/>
        <col style={{width:'108px'}}/>
        <col style={{width:'160px'}}/>
        <col style={{width:'72px'}}/>
        <col style={{width:'96px'}}/>
      </colgroup>
      <thead className="bg-slate-50 border-b border-slate-200">
        <tr>
          <Th>Numer</Th>
          <Th>Złożone</Th>
          <Th>Klient</Th>
          <Th>Pozycje</Th>
          <Th>Typ</Th>
          <Th>Status</Th>
          <Th>ETA</Th>
          <Th align="right">Kwota</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r,i)=>{
          const fresh = r[10];
          return (
            <tr key={i} className={`group hover:bg-slate-50 cursor-pointer ${fresh?'bg-primary/[0.03]':''}`}>
              <Td mono className="!text-[15px] !text-slate-900 font-semibold">
                <div className="flex items-center gap-2">
                  {fresh && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0"/>}
                  <span className={fresh?'':'pl-[14px]'}>{r[0]}</span>
                </div>
              </Td>
              <Td>
                <div className="text-[13px] text-slate-700 leading-tight">{r[1]}</div>
                <div className="font-mono text-[11px] text-slate-400 mt-0.5">{r[2]}</div>
              </Td>
              <Td>
                <div className="text-[13px] font-medium text-slate-900 truncate">{r[3]}</div>
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">{r[4]}</div>
              </Td>
              <Td className="!text-slate-600">{r[5]}</Td>
              <Td>
                <div className="inline-flex items-center gap-1.5 text-[13px] text-slate-600">
                  <Icon name={r[7]==='DELIVERY'?'truck':'shoppingBag'} size={14} className="text-slate-400"/>
                  {r[7]==='DELIVERY'?'Dostawa':'Odbiór'}
                </div>
              </Td>
              <Td><StatusBadge status={r[8]}/></Td>
              <Td mono className="!text-slate-500 !text-[12px]">{r[9] || '—'}</Td>
              <Td mono align="right" className="!text-[14px] !font-semibold !text-slate-900">{r[6]}</Td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

const OrdersList = () => {
  const rows = [
    ['2026‑00127','2 min','14:32','Piotr Marczak','+48 608 221 504','2 poz.','67 zł','DELIVERY','NEW','—', true],
    ['2026‑00126','8 min','14:26','Katarzyna Sobańska','+48 512 889 103','4 poz.','142 zł','DELIVERY','CONFIRMED','15:00'],
    ['2026‑00125','14 min','14:20','Marcin Wrzeszcz','+48 606 774 221','1 poz.','46 zł','PICKUP','IN_PREPARATION','14:45'],
    ['2026‑00124','22 min','14:12','Ewa Kornacka','+48 501 332 998','3 poz.','98 zł','DELIVERY','READY','14:50'],
    ['2026‑00123','35 min','13:59','Anna Kowalska','+48 733 100 234','4 poz.','170 zł','DELIVERY','OUT_FOR_DELIVERY','14:35'],
    ['2026‑00122','58 min','13:36','Tomasz Lewandowski','+48 693 221 887','2 poz.','79 zł','PICKUP','DELIVERED','—'],
    ['2026‑00121','1 h 12 min','13:22','Michał B.','+48 509 887 221','5 poz.','186 zł','DELIVERY','DELIVERED','—'],
    ['2026‑00120','1 h 40 min','12:54','Joanna P.','+48 604 112 776','1 poz.','42 zł','PICKUP','CANCELED','—'],
  ];
  return (
    <div className="w-[1280px] bg-slate-50 flex">
      <Sidebar active="orders"/>
      <div className="flex-1 min-w-0">
        <TopBar title="Zamówienia" subtitle="48 dzisiaj · 6 aktywnych"
          actions={<>
            <Btn variant="outline" size="md"><Icon name="refresh" size={14}/>Odśwież</Btn>
            <Btn variant="outline" size="md"><Icon name="calendar" size={14}/>Dziś</Btn>
          </>}
        />
        <div className="p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-[12px] font-mono tracking-[0.15em] uppercase text-slate-400 mr-2">
              <Icon name="filter" size={13}/>Filtry
            </div>
            <FilterChip active>Nowe</FilterChip>
            <FilterChip active>W przygotowaniu</FilterChip>
            <FilterChip>Potwierdzone</FilterChip>
            <FilterChip>Gotowe</FilterChip>
            <FilterChip>W dostawie</FilterChip>
            <FilterChip>Dostarczone</FilterChip>
            <div className="w-px h-5 bg-slate-200 mx-2"/>
            <FilterChip>Wszystkie typy</FilterChip>
            <FilterChip active>Dostawa</FilterChip>
            <div className="ml-auto">
              <button className="text-[12px] text-primary font-medium hover:underline">Wyczyść filtry</button>
            </div>
          </div>

          <OrdersTable rows={rows}/>

          <div className="flex items-center justify-between mt-6">
            <div className="text-[12px] text-slate-500">Pokazano 1–8 z 48</div>
            <div className="flex items-center gap-1">
              <button className="h-9 w-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-400"><Icon name="chevLeft" size={14}/></button>
              <button className="h-9 w-9 rounded-md bg-slate-900 text-white text-[13px] font-medium">1</button>
              <button className="h-9 w-9 rounded-md text-slate-700 hover:bg-slate-100 text-[13px]">2</button>
              <button className="h-9 w-9 rounded-md text-slate-700 hover:bg-slate-100 text-[13px]">3</button>
              <button className="h-9 w-9 rounded-md text-slate-700 hover:bg-slate-100 text-[13px]">4</button>
              <button className="h-9 w-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50"><Icon name="chevRight" size={14}/></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersListEmpty = () => (
  <div className="w-[1280px] bg-slate-50 flex">
    <Sidebar active="orders"/>
    <div className="flex-1 min-w-0">
      <TopBar title="Zamówienia"/>
      <div className="p-8">
        <div className="flex items-center gap-2 mb-4">
          <FilterChip active>Anulowane</FilterChip>
          <FilterChip active>Dziś</FilterChip>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 py-20 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Icon name="bag" size={22}/>
          </div>
          <div className="text-[15px] font-semibold text-slate-900">Brak zamówień dla wybranych filtrów</div>
          <div className="text-[13px] text-slate-500 mt-1 max-w-sm">Spróbuj zmienić zakres dat lub wyczyścić filtry aby zobaczyć wszystkie zamówienia.</div>
          <Btn variant="outline" size="md" className="mt-5">Wyczyść filtry</Btn>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { OrdersList, OrdersListEmpty, OrdersTable, Th, Td });
