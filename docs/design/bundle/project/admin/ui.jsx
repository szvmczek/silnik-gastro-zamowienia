// Admin shared UI — reuses primitives from public-site/ui.jsx (Icon, Btn, Badge)
// Adds admin shell: sidebar, topbar, status badge mapping.

const StatusBadge = ({ status, size='sm' }) => {
  const m = {
    NEW: ['Nowe','primary'],
    CONFIRMED: ['Potwierdzone','info'],
    IN_PREPARATION: ['W przygotowaniu','warning'],
    READY: ['Gotowe','success'],
    OUT_FOR_DELIVERY: ['W drodze','warning'],
    DELIVERED: ['Dostarczone','muted'],
    CANCELED: ['Anulowane','danger'],
  };
  const [label, variant] = m[status];
  const sz = size === 'lg' ? 'px-3 py-1 text-[13px]' : 'px-2.5 py-0.5 text-xs';
  const v = {
    primary: 'bg-primary/10 text-primary',
    info: 'bg-sky-100 text-sky-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    muted: 'bg-slate-100 text-slate-500',
  }[variant];
  return <span className={`inline-flex items-center rounded-full font-medium ${v} ${sz}`}>{label}</span>;
};

const Sidebar = ({ active='orders' }) => {
  const links = [
    ['dashboard','Dashboard','layoutDashboard'],
    ['orders','Zamówienia','bag'],
    ['menu','Menu','utensils'],
    ['settings','Ustawienia','clock'],
  ];
  return (
    <aside className="w-[240px] bg-white border-r border-slate-200 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="text-[11px] font-mono tracking-[0.22em] uppercase text-slate-400">Panel</div>
        <div className="text-[15px] font-semibold text-slate-900 tracking-tight mt-1">Nonna <span className="italic font-normal">Maria</span></div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(([k,l,ic])=>(
          <a key={k} className={`flex items-center gap-2.5 h-10 px-3 rounded-md text-[14px] cursor-pointer ${active===k?'bg-primary/10 text-primary font-medium':'text-slate-600 hover:bg-slate-100'}`}>
            <Icon name={ic==='layoutDashboard'?'sparkles':ic} size={16}/>{l}
          </a>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5 h-10 px-2">
          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-600">AK</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-slate-900 truncate">Anna K.</div>
            <div className="text-[11px] text-slate-500 truncate">admin</div>
          </div>
          <Icon name="chevDown" size={14} className="text-slate-400"/>
        </div>
      </div>
    </aside>
  );
};

const TopBar = ({ title, subtitle, actions }) => (
  <div className="h-[72px] px-8 border-b border-slate-200 bg-white flex items-center justify-between">
    <div>
      <h1 className="text-[20px] font-semibold text-slate-900 tracking-tight">{title}</h1>
      {subtitle && <div className="text-[12px] text-slate-500 mt-0.5">{subtitle}</div>}
    </div>
    <div className="flex items-center gap-2">{actions}</div>
  </div>
);

Object.assign(window, { StatusBadge, Sidebar, TopBar });
