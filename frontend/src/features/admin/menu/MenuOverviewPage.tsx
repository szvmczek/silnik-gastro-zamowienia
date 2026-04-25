import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/Tabs";
import { CategoriesList } from "./categories/CategoriesList";
import { ProductsList } from "./products/ProductsList";
import { AddonGroupsList } from "./addon-groups/AddonGroupsList";

type TabKey = "categories" | "products" | "addon-groups";

const DEFAULT_TAB: TabKey = "categories";

export function MenuOverviewPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("tab") as TabKey | null;
  const active: TabKey =
    requested === "products" || requested === "addon-groups" || requested === "categories"
      ? requested
      : DEFAULT_TAB;

  const onChange = (value: string) => {
    if (value === DEFAULT_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    setParams(params, { replace: true });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="kicker">Panel</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-900">
          Menu
        </h1>
        <p className="mt-1 text-[14px] text-slate-500">
          Zarządzaj kategoriami, produktami i grupami dodatków.
        </p>
      </div>

      <Tabs value={active} onValueChange={onChange} className="space-y-6">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger
            value="categories"
            className="-mb-px rounded-none px-4 py-3 text-[14px] text-slate-500 hover:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
          >
            Kategorie
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="-mb-px rounded-none px-4 py-3 text-[14px] text-slate-500 hover:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
          >
            Produkty
          </TabsTrigger>
          <TabsTrigger
            value="addon-groups"
            className="-mb-px rounded-none px-4 py-3 text-[14px] text-slate-500 hover:text-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none"
          >
            Grupy dodatków
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoriesList />
        </TabsContent>

        <TabsContent value="products">
          <ProductsList />
        </TabsContent>

        <TabsContent value="addon-groups">
          <AddonGroupsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
