// Screens 8, 9, 10 — Admin login, shell reference, dashboard

const AdminLogin = () => (
  <div className="w-[1280px] h-[820px] bg-slate-50 flex items-center justify-center">
    <div className="w-[420px]">
      <div className="text-center mb-7">
        <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-slate-400">Panel administracyjny</div>
        <div className="text-[24px] font-semibold text-slate-900 tracking-tight mt-1">Nonna <span className="italic font-normal">Maria</span></div>
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
        <h1 className="text-[22px] font-semibold text-slate-900 tracking-tight">Zaloguj się</h1>
        <p className="text-[13px] text-slate-500 mt-1">Panel dostępny dla uprawnionych pracowników.</p>

        <div className="mt-6 rounded-md bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-[13px] text-rose-700">
          <Icon name="alert" size={16} className="flex-shrink-0 mt-0.5"/>
          <div>Nieprawidłowy email lub hasło.</div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Email</label>
            <input className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="anna@nonnamaria.pl"/>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">Hasło</label>
            <input type="password" className="h-11 w-full rounded-md border border-slate-300 px-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary" defaultValue="••••••••"/>
          </div>
          <Btn variant="primary" size="xl" className="w-full">Zaloguj się</Btn>
        </div>
      </div>
      <div className="text-center mt-5">
        <a className="text-[12px] text-slate-400 hover:text-slate-700">← Wróć na stronę</a>
      </div>
    </div>
  </div>
);

const KpiTile = ({ label, value, icon, delta, highlight }) => (
  <div className={`rounded-xl border ${highlight?'border-primary/30 bg-primary/[0.03]':'border-slate-200 bg-white'} p-6 hover:shadow-sm transition-shadow cursor-pointer`}>
    <div className="flex items-center justify-between">
      <div className="text-[13px] text-slate-500 flex items-center gap-2">
        <span className={`w-6 h-6 rounded-md flex items-center justify-center ${highlight?'bg-primary/10 text-primary':'bg-slate-100 text-slate-500'}`}><Icon name={icon} size={14}/></span>
        {label}
      </div>
      <Icon name="chevRight" size={16} className="text-slate-300"/>
    </div>
    <div className="mt-5 font-mono text-[48px] font-semibold text-slate-900 leading-none tracking-tight">{value}</div>
    {delta && <div className={`mt-3 text-[12px] font-medium ${delta.startsWith('+')?'text-emerald-700':'text-slate-500'}`}>{delta}</div>}
  </div>
);

const AdminDashboard = () => (
  <div className="w-[1280px] bg-slate-50 flex">
    <Sidebar active="dashboard"/>
    <div className="flex-1 min-w-0">
      <TopBar title="Dashboard" subtitle="Wtorek, 22 kwietnia 2026"
        actions={<>
          <Btn variant="outline" size="md"><Icon name="refresh" size={14}/>Odśwież</Btn>
        </>}
      />
      <div className="p-8">
        <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400 mb-4">Dziś</div>
        <div className="grid grid-cols-3 gap-5">
          <KpiTile label="Nowe dzisiaj" value="12" icon="sparkles" delta="+3 vs wczoraj" highlight/>
          <KpiTile label="W przygotowaniu" value="4" icon="flame" delta="kuchnia zajęta"/>
          <KpiTile label="Do dostawy / wydania" value="6" icon="truck" delta="2 czekają na kuriera"/>
        </div>

        <div className="mt-10 flex items-baseline justify-between mb-4">
          <div className="font-mono text-[11px] tracking-[0.22em] uppercase text-slate-400">Ostatnie zamówienia</div>
          <a className="text-[13px] font-medium text-slate-700 hover:text-primary">Zobacz wszystkie →</a>
        </div>
        <div className="rounded-xl bg-white border border-slate-200 overflow-hidden">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{width:'148px'}}/>
              <col style={{width:'108px'}}/>
              <col/>
              <col style={{width:'80px'}}/>
              <col style={{width:'108px'}}/>
              <col style={{width:'160px'}}/>
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
                <Th align="right">Kwota</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['2026‑00127','2 min temu','Piotr M.','2 poz.','67 zł','NEW','DELIVERY', true],
                ['2026‑00126','8 min temu','Katarzyna S.','4 poz.','142 zł','IN_PREPARATION','DELIVERY'],
                ['2026‑00125','14 min temu','Marcin W.','1 poz.','46 zł','READY','PICKUP'],
                ['2026‑00124','22 min temu','Ewa K.','3 poz.','98 zł','OUT_FOR_DELIVERY','DELIVERY'],
                ['2026‑00123','35 min temu','Anna Kowalska','4 poz.','170 zł','DELIVERED','DELIVERY'],
              ].map(([n,t,c,p,sum,st,ft,fresh])=>(
                <tr key={n} className={`hover:bg-slate-50 cursor-pointer ${fresh?'bg-primary/[0.03]':''}`}>
                  <Td mono className="!text-[15px] !text-slate-900 font-semibold">
                    <div className="flex items-center gap-2">
                      {fresh && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0"/>}
                      <span className={fresh?'':'pl-[14px]'}>{n}</span>
                    </div>
                  </Td>
                  <Td className="!text-[12px] !text-slate-500">{t}</Td>
                  <Td className="!text-[13px] !text-slate-900 !font-medium truncate">{c}</Td>
                  <Td className="!text-[12px] !text-slate-600">{p}</Td>
                  <Td>
                    <div className="inline-flex items-center gap-1.5 text-[13px] text-slate-600">
                      <Icon name={ft==='DELIVERY'?'truck':'shoppingBag'} size={14} className="text-slate-400"/>
                      {ft==='DELIVERY'?'Dostawa':'Odbiór'}
                    </div>
                  </Td>
                  <Td><StatusBadge status={st}/></Td>
                  <Td mono align="right" className="!text-[14px] !font-semibold !text-slate-900">{sum}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { AdminLogin, AdminDashboard });
