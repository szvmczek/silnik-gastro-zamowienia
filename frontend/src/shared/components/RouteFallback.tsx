import { useLocation } from "react-router-dom";
import { Skeleton } from "@/shared/components/ui/Skeleton";

export function RouteFallback() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdmin) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-6 lg:block">
          <Skeleton className="h-8 w-32" />
          <div className="mt-8 space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </aside>
        <main className="flex-1 p-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-72" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-10 w-3/4" />
        <Skeleton className="mt-2 h-10 w-1/2" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
