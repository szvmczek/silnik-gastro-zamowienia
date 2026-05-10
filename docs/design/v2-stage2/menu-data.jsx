// menu-data.jsx — 5 kategorii × 8 produktów = 40 produktów
// Realna pizzeria osiedlowa PL: Pizze · Kurczaki · Zapiekanki · Frytki & dodatki · Piwo & napoje

const MENU = [
  {
    id: 'pizze',
    icon: '🍕',
    name: 'Pizze',
    sub: 'Klasyczne i autorskie · 30, 40, 50 cm',
    items: [
      { id: 'margherita', name: 'Margherita', desc: 'Sos pomidorowy, mozzarella, oregano, bazylia.', priceFrom: 28.90, badge: null, tags: ['🌱'], img: 'pizza' },
      { id: 'mafia', name: 'Mafia', desc: 'Pepperoni, salami, jalapeño, czerwona cebula, mozzarella.', priceFrom: 42.90, badge: 'bestseller', tags: ['🌶'], img: 'pizza' },
      { id: 'pepperoni', name: 'Pepperoni', desc: 'Sos pomidorowy, mozzarella, pepperoni, oregano.', priceFrom: 35.90, badge: null, tags: ['🌶'], img: 'pizza' },
      { id: 'capricciosa', name: 'Capricciosa', desc: 'Szynka, pieczarki, karczochy, oliwki, mozzarella.', priceFrom: 38.90, badge: null, tags: [], img: 'pizza' },
      { id: 'hawajska', name: 'Hawajska', desc: 'Szynka, ananas, mozzarella, sos pomidorowy.', priceFrom: 36.90, badge: null, tags: [], img: 'pizza' },
      { id: 'wegetarianska', name: 'Wegetariańska', desc: 'Papryka, cukinia, oliwki, kukurydza, brokuły, mozzarella.', priceFrom: 36.90, badge: null, tags: ['🌱'], img: 'pizza' },
      { id: 'diavola', name: 'Diavola', desc: 'Salami pikantne, jalapeño, czerwona cebula, sos pomidorowy.', priceFrom: 39.90, badge: null, tags: ['🌶'], img: 'pizza' },
      { id: 'quattro', name: 'Quattro Formaggi', desc: 'Cztery sery: mozzarella, gorgonzola, parmezan, ser pleśniowy.', priceFrom: 42.90, badge: 'nowość', tags: ['🌱'], img: 'pizza' },
    ],
  },
  {
    id: 'kurczaki',
    icon: '🍗',
    name: 'Kurczaki',
    sub: 'Skrzydełka, stripsy, kubełki',
    items: [
      { id: 'skrzydla-bbq', name: 'Skrzydełka BBQ', desc: '8 sztuk, sos BBQ, sezamowe ziarna.', priceFrom: 24.90, badge: 'bestseller', tags: [], img: 'wings' },
      { id: 'skrzydla-hot', name: 'Skrzydełka Hot', desc: '8 sztuk, sos pikantny, blue cheese dip.', priceFrom: 24.90, badge: null, tags: ['🌶'], img: 'wings' },
      { id: 'stripsy', name: 'Stripsy', desc: '6 sztuk panierowanego filetu, sos czosnkowy.', priceFrom: 22.90, badge: null, tags: [], img: 'strips' },
      { id: 'kubełek-mini', name: 'Kubełek mini', desc: '6 skrzydełek + 4 stripsy + frytki + 2 sosy.', priceFrom: 39.90, badge: null, tags: [], img: 'bucket' },
      { id: 'kubełek-family', name: 'Kubełek Family', desc: '12 skrzydełek + 8 stripsów + 2× frytki + 4 sosy.', priceFrom: 64.90, badge: 'polecane', tags: [], img: 'bucket' },
      { id: 'nuggetsy', name: 'Nuggetsy', desc: '10 sztuk, sos miodowo-musztardowy.', priceFrom: 19.90, badge: null, tags: [], img: 'nuggets' },
      { id: 'tortilla-kurczak', name: 'Tortilla z kurczakiem', desc: 'Grillowany kurczak, sałata, pomidor, sos czosnkowy.', priceFrom: 21.90, badge: null, tags: [], img: 'tortilla' },
      { id: 'sajgonki', name: 'Sajgonki', desc: '4 sztuki z kurczakiem, sos słodko-kwaśny.', priceFrom: 14.90, badge: null, tags: [], img: 'rolls' },
    ],
  },
  {
    id: 'zapiekanki',
    icon: '🥖',
    name: 'Zapiekanki',
    sub: 'Klasyczne na bagietce',
    items: [
      { id: 'zapiekanka-klasyk', name: 'Zapiekanka klasyczna', desc: 'Pieczarki, mozzarella, sos pomidorowy, szczypiorek.', priceFrom: 14.90, badge: null, tags: ['🌱'], img: 'zapiekanka' },
      { id: 'zapiekanka-szynka', name: 'Z szynką', desc: 'Szynka, pieczarki, mozzarella, ketchup, szczypiorek.', priceFrom: 16.90, badge: null, tags: [], img: 'zapiekanka' },
      { id: 'zapiekanka-salami', name: 'Z salami', desc: 'Salami, mozzarella, sos pomidorowy, oregano.', priceFrom: 17.90, badge: null, tags: [], img: 'zapiekanka' },
      { id: 'zapiekanka-pepperoni', name: 'Pepperoni', desc: 'Pepperoni, jalapeño, mozzarella, sos pomidorowy.', priceFrom: 18.90, badge: null, tags: ['🌶'], img: 'zapiekanka' },
      { id: 'zapiekanka-kurczak', name: 'Z kurczakiem', desc: 'Grillowany kurczak, ser, sos czosnkowy.', priceFrom: 18.90, badge: 'bestseller', tags: [], img: 'zapiekanka' },
      { id: 'zapiekanka-bbq', name: 'BBQ', desc: 'Kurczak, czerwona cebula, ser, sos BBQ.', priceFrom: 19.90, badge: null, tags: [], img: 'zapiekanka' },
      { id: 'zapiekanka-mexicana', name: 'Mexicana', desc: 'Wołowina, fasola, kukurydza, jalapeño, sos pikantny.', priceFrom: 21.90, badge: null, tags: ['🌶'], img: 'zapiekanka' },
      { id: 'zapiekanka-hawajska', name: 'Hawajska', desc: 'Szynka, ananas, ser, sos słodki.', priceFrom: 18.90, badge: null, tags: [], img: 'zapiekanka' },
    ],
  },
  {
    id: 'frytki',
    icon: '🍟',
    name: 'Frytki & dodatki',
    sub: 'Frytki, sosy, sałatki',
    items: [
      { id: 'frytki-male', name: 'Frytki małe', desc: '200 g, sól.', priceFrom: 8.90, badge: null, tags: ['🌱'], img: 'fries' },
      { id: 'frytki-duze', name: 'Frytki duże', desc: '400 g, sól.', priceFrom: 13.90, badge: null, tags: ['🌱'], img: 'fries' },
      { id: 'frytki-belgijskie', name: 'Frytki belgijskie', desc: '400 g, sos czosnkowy, szczypiorek, parmezan.', priceFrom: 16.90, badge: null, tags: ['🌱'], img: 'fries' },
      { id: 'krazki-cebulowe', name: 'Krążki cebulowe', desc: '8 sztuk, panierowane, sos czosnkowy.', priceFrom: 14.90, badge: null, tags: ['🌱'], img: 'rings' },
      { id: 'sałatka-cesar', name: 'Sałatka Cezar', desc: 'Sałata, kurczak, parmezan, sos cezar, grzanki.', priceFrom: 22.90, badge: null, tags: [], img: 'salad' },
      { id: 'sałatka-grecka', name: 'Sałatka grecka', desc: 'Sałata, pomidor, ogórek, oliwki, feta, oliwa.', priceFrom: 19.90, badge: null, tags: ['🌱'], img: 'salad' },
      { id: 'sosy', name: 'Sosy 50 ml', desc: 'Czosnkowy, ketchup, BBQ, salsa, miodowo-musztardowy.', priceFrom: 2.50, badge: null, tags: [], img: 'sauce' },
      { id: 'chlebek-czosnkowy', name: 'Chlebek czosnkowy', desc: 'Bagietka, masło czosnkowe, mozzarella.', priceFrom: 12.90, badge: null, tags: ['🌱'], img: 'bread' },
    ],
  },
  {
    id: 'napoje',
    icon: '🥤',
    name: 'Piwo & napoje',
    sub: 'Coca-Cola, soki, piwo, woda',
    items: [
      { id: 'cola-330', name: 'Coca-Cola 330 ml', desc: 'Klasyczna w puszce.', priceFrom: 5.90, badge: null, tags: [], img: 'soda' },
      { id: 'cola-500', name: 'Coca-Cola 500 ml', desc: 'Butelka PET.', priceFrom: 7.90, badge: null, tags: [], img: 'soda' },
      { id: 'cola-zero', name: 'Coca-Cola Zero 500 ml', desc: 'Bez cukru.', priceFrom: 7.90, badge: null, tags: [], img: 'soda' },
      { id: 'fanta', name: 'Fanta 500 ml', desc: 'Pomarańczowa.', priceFrom: 7.90, badge: null, tags: [], img: 'soda' },
      { id: 'sok', name: 'Sok 300 ml', desc: 'Jabłko, pomarańcza, multiwitamina.', priceFrom: 6.90, badge: null, tags: [], img: 'juice' },
      { id: 'woda', name: 'Woda 500 ml', desc: 'Niegazowana / gazowana.', priceFrom: 4.90, badge: null, tags: [], img: 'water' },
      { id: 'piwo-tyskie', name: 'Tyskie 500 ml', desc: 'Lager, butelka.', priceFrom: 8.90, badge: null, tags: ['🔞'], img: 'beer' },
      { id: 'piwo-zywiec', name: 'Żywiec 500 ml', desc: 'Lager, butelka.', priceFrom: 8.90, badge: null, tags: ['🔞'], img: 'beer' },
    ],
  },
];

window.MENU = MENU;

// Cart sample data — używane w sticky sidebar i mobile bottom sheet
const CART_SAMPLE_3 = [
  { id: 'cart-1', name: 'Mafia', size: '40 cm', extras: ['+ ekstra ser', '+ jalapeño'], qty: 1, unitPrice: 47.90, note: 'Bez cebuli, dzwonić — domofon nie działa' },
  { id: 'cart-2', name: 'Skrzydełka BBQ', size: null, extras: [], qty: 1, unitPrice: 24.90, note: null },
  { id: 'cart-3', name: 'Coca-Cola', size: '500 ml', extras: [], qty: 2, unitPrice: 7.90, note: null },
];

const CART_SAMPLE_5 = [
  { id: 'cart-1', name: 'Mafia', size: '40 cm', extras: ['+ ekstra ser', '+ jalapeño'], qty: 1, unitPrice: 47.90, note: 'Bez cebuli, dzwonić — domofon nie działa' },
  { id: 'cart-2', name: 'Margherita', size: '50 cm', extras: [], qty: 1, unitPrice: 38.90, note: null },
  { id: 'cart-3', name: 'Skrzydełka BBQ', size: null, extras: [], qty: 1, unitPrice: 24.90, note: 'Dobrze przyrumienione poproszę' },
  { id: 'cart-4', name: 'Frytki belgijskie', size: null, extras: [], qty: 1, unitPrice: 16.90, note: null },
  { id: 'cart-5', name: 'Coca-Cola', size: '500 ml', extras: [], qty: 2, unitPrice: 7.90, note: null },
  { id: 'cart-6', name: 'Tyskie', size: '500 ml', extras: [], qty: 2, unitPrice: 8.90, note: null },
];

window.CART_SAMPLE_3 = CART_SAMPLE_3;
window.CART_SAMPLE_5 = CART_SAMPLE_5;
window.cartTotal = (cart) => cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);

// ─────── UPSELL POOL ───────
// Operator decyzja: produkty proste (bez wariantów) z 3 kategorii: sosy / napoje / dodatki.
// Backend (target): GET /api/public/products/upsell-suggestions?excludeIds=[...] zwraca 3 z dostępnej puli.
// Tu mock: stała pula 9 produktów, frontend wybiera pierwsze 3 niewystępujące w cart.
const UPSELL_POOL = [
  { id: 'upsell-sos-czosnk', emoji: '🥫', name: 'Sos czosnkowy',  hint: '50 ml',         price: 3.50 },
  { id: 'upsell-sos-bbq',    emoji: '🥫', name: 'Sos BBQ',         hint: '50 ml',         price: 3.50 },
  { id: 'upsell-sos-salsa',  emoji: '🥫', name: 'Sos salsa',       hint: '50 ml · pikantny', price: 3.50 },
  { id: 'upsell-cola-500',   emoji: '🥤', name: 'Coca-Cola',       hint: '0,5 l',         price: 7.90 },
  { id: 'upsell-fanta',      emoji: '🥤', name: 'Fanta',           hint: '0,5 l',         price: 7.90 },
  { id: 'upsell-woda',       emoji: '💧', name: 'Woda niegazowana',hint: '0,5 l',         price: 4.90 },
  { id: 'upsell-frytki',     emoji: '🍟', name: 'Frytki małe',     hint: '200 g',         price: 8.90 },
  { id: 'upsell-chlebek',    emoji: '🥖', name: 'Chlebek czosnkowy', hint: 'z mozzarellą', price: 12.90 },
  { id: 'upsell-krazki',     emoji: '🧅', name: 'Krążki cebulowe', hint: '8 szt.',        price: 14.90 },
];

// pickUpsell(excludeIds, count = 3) — wybiera pierwsze N produktów spoza koszyka.
// W prod backend randomizuje; tu deterministycznie żeby projekt był stabilny dla recenzenta.
window.UPSELL_POOL = UPSELL_POOL;
window.pickUpsell = (cart, count = 3) => {
  const cartIds = new Set((cart || []).map(i => i.id));
  // Próbuj też matchować po nazwie (cart sample ma "Coca-Cola" / "Frytki belgijskie" itd.)
  const cartNames = new Set((cart || []).map(i => (i.name || '').toLowerCase()));
  return UPSELL_POOL
    .filter(u => !cartIds.has(u.id) && !cartNames.has(u.name.toLowerCase()))
    .slice(0, count);
};
