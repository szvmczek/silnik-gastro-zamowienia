import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { usePublicMenu } from "./hooks/usePublicMenu";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProductCard } from "./components/ProductCard";
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
    () => activeCategories.map((c) => ({ id: c.id, slug: c.slug, name: c.name })),
    [activeCategories]
  );
  const sectionIds = useMemo(() => activeCategories.map((c) => categoryAnchorId(c.slug)), [activeCategories]);

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PublicNav active="menu" onOpenCart={() => setCartOpen(true)} />

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 md:pb-16 md:pt-14">
        <div className="mb-8 md:mb-12">
          <div className="kicker mb-3">Nasze menu</div>
          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.02em] text-slate-900 md:text-[56px] md:leading-[1.02]">
            Menu
          </h1>
          <p className="mt-4 max-w-[580px] text-[16px] leading-relaxed text-slate-500">
            Wybierz kategorię i kliknij produkt, aby dopasować wariant i dodatki.
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">Ładowanie menu…</div>
        ) : null}

        {isError ? (
          <div className="py-16 text-center text-sm text-rose-600">
            Nie udało się załadować menu. Spróbuj odświeżyć stronę.
          </div>
        ) : null}

        {!isLoading && !isError && activeCategories.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-500">Brak dostępnych kategorii.</div>
        ) : null}

        {activeCategories.length > 0 ? (
          <>
            <CategoryTabs tabs={tabs} sectionIds={sectionIds} />
            <div className="mt-10 space-y-14">
              {activeCategories.map((category) => (
                <section
                  key={category.id}
                  id={categoryAnchorId(category.slug)}
                  aria-labelledby={`${categoryAnchorId(category.slug)}-title`}
                  className="scroll-mt-28"
                >
                  <div className="mb-6">
                    <div className="kicker mb-2">
                      {category.name} · {category.products.length}{" "}
                      {category.products.length === 1 ? "pozycja" : "pozycji"}
                    </div>
                    <h2
                      id={`${categoryAnchorId(category.slug)}-title`}
                      className="text-[24px] font-semibold tracking-tight text-slate-900 md:text-[28px]"
                    >
                      {category.name}
                    </h2>
                    {category.description ? (
                      <p className="mt-1.5 text-[14px] text-slate-500">{category.description}</p>
                    ) : null}
                  </div>
                  {category.products.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                      Brak produktów w tej kategorii.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {category.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          currency={currency}
                          onClick={handleOpenProduct}
                        />
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>
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
