import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/Tabs";
import { CategoriesList } from "./categories/CategoriesList";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Menu</h1>
        <p className="mt-1 text-sm text-slate-500">
          Zarządzaj kategoriami, produktami i grupami dodatków.
        </p>
      </div>

      <Tabs value={active} onValueChange={onChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Kategorie</TabsTrigger>
          <TabsTrigger value="products">Produkty</TabsTrigger>
          <TabsTrigger value="addon-groups">Grupy dodatków</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoriesList />
        </TabsContent>

        <TabsContent value="products">
          <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            Lista produktów pojawi się w M12.
          </div>
        </TabsContent>

        <TabsContent value="addon-groups">
          <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
            Grupy dodatków pojawią się w M15.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
