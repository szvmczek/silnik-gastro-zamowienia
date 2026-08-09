import { useMemo } from "react";
import { usePublicMenu } from "./hooks/usePublicMenu";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { CategoryChips } from "./components/CategoryChips";
import { MenuProductCard } from "./components/MenuProductCard";
import { SimpleProductRow } from "./components/SimpleProductRow";
import { MenuSkeleton } from "./components/MenuSkeleton";
import { ClosedNotice } from "@/features/public/shared/ClosedNotice";
import { PiecHeader } from "@/features/public/shared/PiecHeader";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { PiecFooter } from "@/features/public/shared/PiecFooter";
import { CartPill } from "@/features/public/shared/CartPill";
import { CartActionBar } from "@/features/public/cart/CartActionBar";
import { formatPhoneDisplay } from "@/shared/lib/formatPhone";
import type { PublicCategoryDto } from "@/shared/api/menuApi";

function anchorId(slug: string) {
  return `cat-${slug}`;
}

/**
 * Kategoria, w której żaden produkt nie ma wariantów ani grup dodatków,
 * nie potrzebuje konfiguratora — paczka renderuje takie pozycje jako
 * listę wierszy z przyciskiem +. To sosy, napoje i desery.
 */
function isSimpleCategory(category: PublicCategoryDto): boolean {
  return (
    category.products.length > 0 &&
    category.products.every((p) => p.variants.length === 0 && p.addonGroups.length === 0)
  );
}

export function MenuPage() {
  const { data: menu, isLoading, isError } = usePublicMenu();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const categories = useMemo(
    () => (menu?.categories ?? []).filter((c) => c.active && c.products.length > 0),
    [menu],
  );

  const chips = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name, sectionId: anchorId(c.slug) })),
    [categories],
  );

  return (
    <>
      <PiecHeader actions={<CartPill emptyVariant="label" />}>
        <CategoryChips chips={chips} />
      </PiecHeader>

      <ClosedNotice />

      <PiecShell className="pt-5">
        <h1 className="font-display text-[clamp(44px,10vw,64px)] tracking-[2px]">Menu</h1>
        <p className="mt-1 text-sm leading-[1.6] text-piec-ink/60">
          Rozmiar, dodatki i sosy wybierzesz po kliknięciu „Wybierz".
        </p>
      </PiecShell>

      {isLoading ? <MenuSkeleton /> : null}

      {isError ? (
        <PiecShell className="py-16 text-center text-sm text-piec-warnSoft">
          Nie udało się załadować menu. Spróbuj odświeżyć stronę.
        </PiecShell>
      ) : null}

      {!isLoading && !isError && categories.length === 0 ? (
        <PiecShell className="py-16 text-center text-sm text-piec-ink/55">
          Menu jest chwilowo puste.
        </PiecShell>
      ) : null}

      {categories.map((category) => {
        const simple = isSimpleCategory(category);
        const solo = !simple && category.products.length === 1;
        return (
          <section
            key={category.id}
            id={anchorId(category.slug)}
            aria-labelledby={`${anchorId(category.slug)}-title`}
            className="scroll-mt-40"
          >
            <PiecShell className="pt-8">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h2
                  id={`${anchorId(category.slug)}-title`}
                  className="font-display text-[27px] tracking-[1.5px] text-primary"
                >
                  {category.name}
                </h2>
                {category.description ? (
                  <span className="text-[13px] text-piec-ink/50">{category.description}</span>
                ) : null}
              </div>

              {simple ? (
                <div className="mt-1.5 grid gap-x-11 [grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr))]">
                  {category.products.map((product) => (
                    <SimpleProductRow key={product.id} product={product} currency={currency} />
                  ))}
                </div>
              ) : (
                <div
                  data-stagger="1"
                  className="mt-3.5 grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(clamp(150px,26vw,250px),1fr))] max-[430px]:!grid-cols-2 max-[430px]:!gap-2.5"
                >
                  {category.products.map((product) => (
                    <MenuProductCard
                      key={product.id}
                      product={product}
                      currency={currency}
                      solo={solo}
                    />
                  ))}
                </div>
              )}
            </PiecShell>
          </section>
        );
      })}

      {settings?.phone ? (
        <PiecShell className="py-6 text-[13.5px] leading-[1.6] text-piec-ink/50">
          Czegoś brakuje? Zadzwoń —{" "}
          <a href={`tel:${settings.phone}`} className="text-primary">
            {formatPhoneDisplay(settings.phone)}
          </a>
          .
        </PiecShell>
      ) : null}

      <PiecFooter />
      <CartActionBar />
    </>
  );
}
