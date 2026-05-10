import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { usePublicMenu } from "./hooks/usePublicMenu";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProductModal, type ProductModalDefaults } from "./components/ProductModal";
import { ClosedBanner } from "@/shared/components/banners/ClosedBanner";
import { InfoBar } from "@/shared/components/info-bar/InfoBar";
import { ProductCard } from "@/shared/components/product/ProductCard";
import { CartBottomSheet } from "@/features/public/cart/CartBottomSheet";
import { CartSidebar } from "@/features/public/cart/CartSidebar";
import { FreeDeliveryProgress } from "@/features/public/cart/FreeDeliveryProgress";
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
  const navigate = useNavigate();
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

  const handleCheckout = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  const handleBrowseMenu = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-page))] text-[rgb(var(--color-text-primary))]">
      <div className="sticky top-0 z-50">
        <ClosedBanner />
        <PublicNav active="menu" onOpenCart={() => setCartOpen(true)} />
        <FreeDeliveryProgress />
      </div>

      <InfoBar />

      {activeCategories.length > 0 ? (
        <CategoryTabs tabs={tabs} sectionIds={sectionIds} />
      ) : null}

      <main className="mx-auto w-full max-w-7xl pb-28 lg:pb-16">
        <div className="px-6 pt-8 md:px-12 md:pt-10 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <header className="flex items-baseline justify-between gap-5 pb-6">
              <h1 className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[rgb(var(--color-text-primary))] md:text-[36px]">
                Menu<span className="font-normal italic">.</span>
              </h1>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--color-text-faint))] md:text-[11px]">
                Pełna karta
              </div>
            </header>

            {isLoading ? (
              <div className="py-16 text-center text-sm text-[rgb(var(--color-text-muted))]">
                Ładowanie menu…
              </div>
            ) : null}

            {isError ? (
              <div className="py-16 text-center text-sm text-rose-600">
                Nie udało się załadować menu. Spróbuj odświeżyć stronę.
              </div>
            ) : null}

            {!isLoading && !isError && activeCategories.length === 0 ? (
              <div className="py-16 text-center text-sm text-[rgb(var(--color-text-muted))]">
                Brak dostępnych kategorii.
              </div>
            ) : null}

            {activeCategories.map((category, catIdx) => (
              <section
                key={category.id}
                id={categoryAnchorId(category.slug)}
                aria-labelledby={`${categoryAnchorId(category.slug)}-title`}
                className="scroll-mt-32 border-t border-[rgb(var(--color-border-card))] pt-10 first:border-t-0 first:pt-0"
              >
                <div className="flex items-baseline justify-between gap-4 pb-5">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--color-text-faint))]">
                      {String(catIdx + 1).padStart(2, "0")} —
                    </span>
                    <h2
                      id={`${categoryAnchorId(category.slug)}-title`}
                      className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-[rgb(var(--color-text-primary))] md:text-[34px]"
                    >
                      {category.name}
                      <span className="font-normal italic">.</span>
                    </h2>
                  </div>
                  <div className="font-mono text-[12px] tabular-nums text-[rgb(var(--color-text-faint))]">
                    {category.products.length}{" "}
                    {category.products.length === 1
                      ? "pozycja"
                      : category.products.length < 5
                        ? "pozycje"
                        : "pozycji"}
                  </div>
                </div>

                {category.products.length === 0 ? (
                  <div className="mb-6 rounded-lg border border-dashed border-[rgb(var(--color-border-card))] py-8 text-center text-sm text-[rgb(var(--color-text-muted))]">
                    Brak produktów w tej kategorii.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pb-8 sm:gap-4 xl:grid-cols-3">
                    {category.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        currency={currency}
                        onOpen={handleOpenProduct}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}

            {activeCategories.length > 0 ? (
              <footer className="flex items-baseline justify-between border-t border-[rgb(var(--color-border-card))] py-10">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--color-text-faint))] md:text-[11px]">
                  Razem: {totalCount}{" "}
                  {totalCount === 1 ? "pozycja" : totalCount < 5 ? "pozycje" : "pozycji"}
                </div>
                <div className="hidden max-w-md text-right text-[12px] leading-relaxed text-[rgb(var(--color-text-muted))] md:block">
                  Wszystkie ceny zawierają VAT. Lista alergenów dostępna na życzenie u obsługi.
                </div>
              </footer>
            ) : null}
          </div>

          <CartSidebar
            className="hidden lg:flex"
            onCheckout={handleCheckout}
            onBrowseMenu={handleBrowseMenu}
            onUpsellAdd={handleOpenProduct}
            onEditItem={handleEditCartItem}
          />
        </div>
      </main>

      <PublicFooter />

      <ProductModal
        product={selected}
        open={selected !== null}
        onOpenChange={handleModalOpenChange}
        currency={currency}
        defaults={editDefaults}
      />

      <CartBottomSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
        onUpsellAdd={(p) => {
          setCartOpen(false);
          handleOpenProduct(p);
        }}
        onEditItem={handleEditCartItem}
      />
      <MobileCartBar onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
