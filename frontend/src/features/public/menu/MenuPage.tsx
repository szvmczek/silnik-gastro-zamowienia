import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePublicMenu } from "./hooks/usePublicMenu";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { CategoryTabs } from "./components/CategoryTabs";
import { ProductCard } from "./components/ProductCard";
import type { PublicProductDto } from "@/shared/api/menuApi";

function categoryAnchorId(slug: string) {
  return `cat-${slug}`;
}

export function MenuPage() {
  const { data: menu, isLoading, isError } = usePublicMenu();
  const { data: settings } = usePublicSettings();
  const [selected, setSelected] = useState<PublicProductDto | null>(null);

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings?.name ?? "Logo"}
                className="h-8 w-8 rounded object-cover"
              />
            ) : null}
            <span className="text-lg font-semibold text-slate-900">
              {settings?.name ?? "Restauracja"}
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-primary">
              Strona główna
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Menu</h1>
          <p className="mt-1 text-sm text-slate-600">
            Wybierz kategorię i kliknij produkt, aby zobaczyć szczegóły.
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
            <div className="mt-6 space-y-10">
              {activeCategories.map((category) => (
                <section
                  key={category.id}
                  id={categoryAnchorId(category.slug)}
                  aria-labelledby={`${categoryAnchorId(category.slug)}-title`}
                  className="scroll-mt-28"
                >
                  <div className="mb-4">
                    <h2
                      id={`${categoryAnchorId(category.slug)}-title`}
                      className="text-xl font-semibold text-slate-900"
                    >
                      {category.name}
                    </h2>
                    {category.description ? (
                      <p className="mt-1 text-sm text-slate-600">{category.description}</p>
                    ) : null}
                  </div>
                  {category.products.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
                      Brak produktów w tej kategorii.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {category.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          currency={currency}
                          onClick={setSelected}
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

      {selected ? (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto max-w-md rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <span>
              Wybrano: <strong>{selected.name}</strong> — modal w M10.
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              Zamknij
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
