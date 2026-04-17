export function PlaceholderLanding() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Pizza Showcase</h1>
        <p className="text-slate-600">Projekt w budowie - Bootstrap zakonczony, Faza 1 przed nami.</p>
        <div className="flex gap-3 justify-center">
          <a href="/menu" className="text-primary underline">Menu</a>
          <span className="text-slate-300">|</span>
          <a href="/admin/login" className="text-primary underline">Admin</a>
        </div>
      </div>
    </main>
  );
}
