// Shared UI primitives for the public site — match shadcn/slate + primary tokens.
// Exported onto window so sibling Babel scripts can use them.

const Icon = ({ name, size = 18, className = '', strokeWidth = 1.75 }) => {
  const paths = {
    menu: 'M3 6h18M3 12h18M3 18h18',
    x: 'M6 6l12 12M18 6L6 18',
    search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm9 16-4.3-4.3',
    bag: 'M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0',
    truck: 'M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    phone: 'M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z',
    mail: 'M3 6h18v12H3zM3 6l9 7 9-7',
    map: 'M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2Zm0 0v16m6-14v16',
    clock: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 4v6l4 2',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    check: 'M5 13l4 4L19 7',
    chevDown: 'M6 9l6 6 6-6',
    chevRight: 'M9 6l6 6-6 6',
    chevLeft: 'M15 6l-6 6 6 6',
    arrowRight: 'M5 12h14M13 6l6 6-6 6',
    edit: 'M4 20h4L20 8l-4-4L4 16v4Z',
    trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 8v6m0-9v.01',
    alert: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 5v5m0 3v.01',
    checkCircle: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm-3 9 2 2 4-4',
    flame: 'M12 3s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 1-3s-1 4 2 4c0-3 1-5 1-9Z',
    chef: 'M6 9a4 4 0 1 1 6-3 4 4 0 1 1 6 3v4H6V9Zm0 4h12v6H6z',
    pkg: 'M3 7l9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10',
    home: 'M3 12 12 4l9 8v9h-6v-6h-6v6H3v-9Z',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
    shoppingBag: 'M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2',
    mapPin: 'M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12Zm0-9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
    sparkles: 'M5 3v4M3 5h4M18 14v4m-2-2h4M10 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z',
    calendar: 'M3 7h18v14H3zM3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2M8 3v4m8-4v4',
    facebook: 'M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8Z',
    instagram: 'M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7Zm9 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5-1.5v.01',
    message: 'M4 4h16v12H8l-4 4V4Z',
    utensils: 'M6 3v7a2 2 0 0 0 2 2h0v9m-2-18v5m4-5v5M18 3c-2 0-3 2-3 5s1 4 3 4v9',
    filter: 'M4 5h16l-6 8v6l-4-2v-4L4 5Z',
    refresh: 'M4 12a8 8 0 0 1 14-5l3-3m-3 3h-5m9 5a8 8 0 0 1-14 5l-3 3m3-3h5',
  };
  const d = paths[name] || '';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
};

const Btn = ({ variant='primary', size='md', children, className='', as:As='button', ...rest }) => {
  const v = {
    primary: 'bg-primary text-white hover:brightness-95',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800',
    outline: 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    dangerOutline: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
    invert: 'bg-white text-slate-900 hover:bg-slate-100',
  }[variant];
  const s = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-[15px]', xl: 'h-14 px-7 text-[16px]' }[size];
  return (
    <As className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all ${v} ${s} ${className}`} {...rest}>
      {children}
    </As>
  );
};

const Badge = ({ variant='default', children, className='' }) => {
  const v = {
    default: 'bg-slate-100 text-slate-700',
    primary: 'bg-primary/10 text-primary',
    info: 'bg-sky-100 text-sky-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    muted: 'bg-slate-100 text-slate-500',
    outline: 'bg-white border border-slate-200 text-slate-700',
  }[variant];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${v} ${className}`}>{children}</span>;
};

// Photo placeholder — subtly striped, monospace label describing intended shot
const Photo = ({ ratio='4/3', label='product shot', className='', tone='warm' }) => {
  const tones = {
    warm: 'bg-[#f4ede3]',
    cool: 'bg-slate-100',
    dark: 'bg-slate-800',
  };
  const textTone = tone === 'dark' ? 'text-slate-400' : 'text-slate-500/80';
  return (
    <div className={`relative overflow-hidden ${tones[tone]} ${className}`} style={{ aspectRatio: ratio }}>
      <div className="absolute inset-0" style={{
        backgroundImage: `repeating-linear-gradient(135deg, rgba(139,69,19,0.05) 0, rgba(139,69,19,0.05) 10px, rgba(139,69,19,0.09) 10px, rgba(139,69,19,0.09) 20px)`
      }}/>
      <div className={`absolute inset-0 flex items-center justify-center`}>
        <div className={`font-mono text-[10px] tracking-[0.18em] uppercase ${textTone} px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-sm`}>{label}</div>
      </div>
    </div>
  );
};

const Nav = ({ active='home', dark=false }) => {
  const linkCls = dark ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900';
  const brandCls = dark ? 'text-white' : 'text-slate-900';
  return (
    <div className={`flex items-center justify-between px-10 h-[72px] ${dark ? '' : 'border-b border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-10">
        <div className={`font-semibold text-[17px] tracking-tight ${brandCls}`}>
          Nonna <span className="italic font-normal">Maria</span>
        </div>
        <nav className="flex items-center gap-7 text-[14px]">
          <a className={`${linkCls} ${active==='menu' ? 'font-semibold' : ''}`}>Menu</a>
          <a className={linkCls}>O nas</a>
          <a className={linkCls}>Kontakt</a>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <button className={`relative inline-flex items-center gap-2 h-10 px-3 rounded-md ${dark ? 'text-white/90 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'} text-[13px]`}>
          <Icon name="bag" size={18}/>
          <span>Koszyk</span>
          <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-[11px] font-semibold">3</span>
        </button>
        <Btn variant="primary">Zamów online</Btn>
      </div>
    </div>
  );
};

// Mobile top bar
const MobileNav = () => (
  <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200 bg-white">
    <button className="w-10 h-10 -ml-2 flex items-center justify-center text-slate-800"><Icon name="menu" size={22}/></button>
    <div className="font-semibold text-[15px] tracking-tight text-slate-900">Nonna <span className="italic font-normal">Maria</span></div>
    <button className="relative w-10 h-10 -mr-2 flex items-center justify-center text-slate-800">
      <Icon name="bag" size={20}/>
      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-semibold flex items-center justify-center">3</span>
    </button>
  </div>
);

Object.assign(window, { Icon, Btn, Badge, Photo, Nav, MobileNav });
