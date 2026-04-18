import { Link } from "react-router-dom";
import { useAuth } from "@/shared/auth/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/Card";

const tiles = [
  {
    to: "/admin/settings",
    title: "Ustawienia restauracji",
    description: "Nazwa, kolor marki, dane kontaktowe, waluta.",
  },
  {
    to: "/admin/opening-hours",
    title: "Godziny otwarcia",
    description: "Edytuj godziny dla wszystkich dni tygodnia.",
  },
  {
    to: "/admin/page-content",
    title: "Treści stron",
    description: "Sekcje Hero i O nas na landingu.",
  },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Witaj, {user?.displayName ?? "Administrator"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Zarządzaj wizerunkiem restauracji w jednym miejscu. Kolejne moduły (menu,
          zamówienia) pojawią się w następnych fazach.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link
            key={tile.to}
            to={tile.to}
            className="transition-transform hover:-translate-y-0.5"
          >
            <Card className="h-full hover:border-primary">
              <CardHeader>
                <CardTitle>{tile.title}</CardTitle>
                <CardDescription>{tile.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-primary">Otwórz →</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
