import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePublicMenu } from "./hooks/usePublicMenu";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { CategoryTabs } from "./components/CategoryTabs";
import { MenuItemRow, MenuItemRowMobile } from "./components/MenuItemRow";
import { ProductModal, type ProductModalDefaults } from "./components/ProductModal";
import { CartDrawer } from "@/features/public/cart/CartDrawer";
import { MobileCartBar } from "@/features/public/cart/MobileCartBar";
import { PublicNav } from "@/features/public/shared/PublicNav";
import { PublicFooter } from "@/features/public/shared/PublicFooter";
import { useCartStore, type CartItem } from "@/features/public/cart/cartStore";
import type { PublicProductDto } from "@/shared/api/menuApi";

function categoryAnchorId(slug: string) {
  return `cat-${slug}`;
}

export function MenuPage() {
  const { data: menu, isLoading, isError } = usePublicMenu();
  const { data: settings } = usePublicSettings();
  const [selected, setSelected] = useState<PublicProductDto | null>(null);
  const [editDefaults, setEditDefaults] = useState<ProductModalDefaults | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const removeItem = useCartStore((s) => s.removeItem);

  const activeCategories = useMemo(
    () => (menu?.categories ?? []).filter((c) => c.active),
    [menu]
  );

  const tabs = useMemo(
    () =>
      activeCategories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        count: c.products.length,
      })),
    [activeCategories]
  );
  const sectionIds = useMemo(
    () => activeCategories.map((c) => categoryAnchorId(c.slug)),
    [activeCategories]
  );

  const totalCount = useMemo(
    () => activeCategories.reduce((sum, c) => sum + c.products.length, 0),
    [activeCategories]
  );

  const categoryStartIndexes = useMemo(() => {
    const offsets: number[] = [];
    let running = 1;
    for (const c of activeCategories) {
      offsets.push(running);
      running += c.products.length;
    }
    return offsets;
  }, [activeCategories]);

  const currency = settings?.currency ?? "PLN";

  const findProductById = useCallback(
    (productId: number): PublicProductDto | null => {
      if (!menu) return null;
      for (const category of menu.categories) {
        for (const product of category.products) {
          if (product.id === productId) return product;
        }
      }
      return null;
    },
    [menu]
  );

  const handleOpenProduct = (product: PublicProductDto) => {
    setEditDefaults(null);
    setSelected(product);
  };

  const handleEditCartItem = (item: CartItem) => {
    const product = findProductById(item.productId);
    if (!product || !product.available) {
      toast.error(`Produkt "${item.productName}" jest obecnie niedostępny`);
      return;
    }
    setEditDefaults({
      variantId: item.variantId,
      addonIds: item.addons.map((a) => a.addonId),
      quantity: item.quantity,
    });
    setSelected(product);
    removeItem(item.lineKey);
    setCartOpen(false);
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      setSelected(null);
      setEditDefaults(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-900">
      <PublicNav active="menu" onOpenCart={() => setCartOpen(true)} />

      <main className="mx-auto max-w-6xl pb-28 md:pb-16">
        <header className="flex items-baseline justify-between gap-5 px-6 pb-6 pt-8 md:px-12 md:pt-10">
          <h1 className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-slate-900 md:text-[36px]">
            Menu<span className="font-normal italic">.</span>
          </h1>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400 md:text-[11px]">
            Pełna karta
          </div>
        </header>

        {isLoading ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500 md:px-12">Ładowanie menu…</div>
        ) : null}

        {isError ? (
          <div className="px-6 py-16 text-center text-sm text-rose-600 md:px-12">
            Nie udało się załadować menu. Spróbuj odświeżyć stronę.
          </div>
        ) : null}

        {!isLoading && !isError && activeCategories.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500 md:px-12">Brak dostępnych kategorii.</div>
        ) : null}

        {activeCategories.length > 0 ? (
          <>
            <CategoryTabs tabs={tabs} sectionIds={sectionIds} />

            {activeCategories.map((category, catIdx) => {
              const start = categoryStartIndexes[catIdx];
              return (
                <section
                  key={category.id}
                  id={categoryAnchorId(category.slug)}
                  aria-labelledby={`${categoryAnchorId(category.slug)}-title`}
                  className="scroll-mt-32 border-t border-slate-200"
                >
                  <div className="flex items-baseline justify-between gap-4 px-6 pb-4 pt-10 md:px-12">
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
                        {String(catIdx + 1).padStart(2, "0")} —
                      </span>
                      <h2
                        id={`${categoryAnchorId(category.slug)}-title`}
                        className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-slate-900 md:text-[36px]"
                      >
                        {category.name}
                        <span className="font-normal italic">.</span>
                      </h2>
                    </div>
                    <div className="font-mono text-[12px] tabular-nums text-slate-400">
                      {category.products.length}{" "}
                      {category.products.length === 1
                        ? "pozycja"
                        : category.products.length < 5
                          ? "pozycje"
                          : "pozycji"}
                    </div>
                  </div>

                  {category.products.length === 0 ? (
                    <div className="mx-6 mb-6 rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500 md:mx-12">
                      Brak produktów w tej kategorii.
                    </div>
                  ) : (
                    <>
                      {/* Desktop list */}
                      <div className="hidden divide-y divide-slate-100 sm:block">
                        {category.products.map((product, i) => (
                          <MenuItemRow
                            key={product.id}
                            index={start + i}
                            product={product}
                            currency={currency}
                            onClick={handleOpenProduct}
                          />
                        ))}
                      </div>
                      {/* Mobile list */}
                      <div className="divide-y divide-slate-100 sm:hidden">
                        {category.products.map((product, i) => (
                          <MenuItemRowMobile
                            key={product.id}
                            index={start + i}
                            product={product}
                            currency={currency}
                            onClick={handleOpenProduct}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </section>
              );
            })}

            <footer className="flex items-baseline justify-between border-t border-slate-200 px-6 py-10 md:px-12">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400 md:text-[11px]">
                Razem: {totalCount}{" "}
                {totalCount === 1 ? "pozycja" : totalCount < 5 ? "pozycje" : "pozycji"}
              </div>
              <div className="hidden max-w-md text-right text-[12px] leading-relaxed text-slate-500 md:block">
                Wszystkie ceny zawierają VAT. Lista alergenów dostępna na życzenie u obsługi.
              </div>
            </footer>
          </>
        ) : null}
      </main>

      <PublicFooter />

      <ProductModal
        product={selected}
        open={selected !== null}
        onOpenChange={handleModalOpenChange}
        currency={currency}
        defaults={editDefaults}
      />

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onEdit={handleEditCartItem}
      />
      <MobileCartBar onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
