import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu as MenuIcon } from "lucide-react";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/shared/components/ui/Sheet";
import { CartButton } from "@/features/public/cart/CartButton";
import { cn } from "@/shared/lib/cn";

interface Props {
  active?: "home" | "menu";
  onOpenCart: () => void;
}

interface NavLinkSpec {
  label: string;
  to: string;
  isAnchor: boolean;
}

const PRIMARY_LINK_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-[rgb(var(--color-primary-hover))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]";

function buildNavLinks(onLanding: boolean): NavLinkSpec[] {
  return [
    { label: "Menu", to: "/menu", isAnchor: false },
    {
      label: "O nas",
      to: onLanding ? "#about" : "/#about",
      isAnchor: onLanding,
    },
    {
      label: "Kontakt",
      to: onLanding ? "#contact" : "/#contact",
      isAnchor: onLanding,
    },
  ];
}

export function PublicNav({ active = "home", onOpenCart }: Props) {
  const { data: settings } = usePublicSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const links = buildNavLinks(location.pathname === "/");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const brand = (
    <Link to="/" className="flex items-center gap-2">
      {settings?.logoUrl ? (
        <img
          src={settings.logoUrl}
          alt={settings?.name ?? "Logo"}
          className="h-8 w-8 rounded object-cover"
        />
      ) : null}
      <span className="text-[15px] font-semibold tracking-tight text-[rgb(var(--color-text-primary))] md:text-[17px]">
        {settings?.name ?? "Restauracja"}
      </span>
    </Link>
  );

  return (
    <header
      className={cn(
        "border-b border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card)/0.95)] backdrop-blur transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-8">
        {/* Mobile: hamburger + brand */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Otwórz menu"
                className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-md text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <div className="mb-8 mt-1 text-[15px] font-semibold tracking-tight text-[rgb(var(--color-text-primary))]">
                {settings?.name ?? "Restauracja"}
              </div>
              <nav className="flex flex-col gap-1 text-[15px]">
                {links.map((link) => {
                  const isActive = link.to === "/menu" && active === "menu";
                  const commonClass = cn(
                    "rounded-md px-3 py-2 text-[rgb(var(--color-text-body))] hover:bg-[rgb(var(--color-bg-section))] hover:text-[rgb(var(--color-text-primary))]",
                    isActive &&
                      "font-semibold text-[rgb(var(--color-text-primary))]"
                  );
                  return link.isAnchor ? (
                    <a
                      key={link.to}
                      href={link.to}
                      onClick={() => setDrawerOpen(false)}
                      className={commonClass}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setDrawerOpen(false)}
                      className={commonClass}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-8">
                <Link
                  to="/menu"
                  onClick={() => setDrawerOpen(false)}
                  className={cn(PRIMARY_LINK_CLASSES, "h-12 w-full text-base")}
                >
                  Zamów online →
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          {brand}
        </div>

        {/* Desktop: brand + nav links */}
        <div className="hidden items-center gap-10 md:flex">
          {brand}
          <nav className="flex items-center gap-7 text-[14px]">
            {links.map((link) => {
              const isActive = link.to === "/menu" && active === "menu";
              const commonClass = cn(
                "transition-colors hover:text-[rgb(var(--color-text-primary))]",
                isActive
                  ? "font-semibold text-[rgb(var(--color-text-primary))]"
                  : "text-[rgb(var(--color-text-body))]"
              );
              return link.isAnchor ? (
                <a key={link.to} href={link.to} className={commonClass}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.to} to={link.to} className={commonClass}>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right actions — F-006: phone CTA (state-based desktop/mobile) + CartButton */}
        <div className="flex items-center gap-2 md:gap-3">
          {settings?.phone ? (
            <>
              {/* Desktop: phone z pełnym labelem */}
              <a
                href={`tel:${settings.phone}`}
                className="hidden h-10 items-center gap-2 rounded-md px-3 text-[14px] font-medium text-[rgb(var(--color-text-body))] transition-colors hover:text-[rgb(var(--color-text-primary))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] md:inline-flex"
              >
                <span aria-hidden="true">📞</span>
                <span>{settings.phone}</span>
              </a>
              {/* Mobile: phone icon-only square */}
              <a
                href={`tel:${settings.phone}`}
                aria-label="Zadzwoń"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-body))] transition-colors hover:text-[rgb(var(--color-text-primary))] md:hidden"
              >
                <span aria-hidden="true">📞</span>
              </a>
            </>
          ) : null}
          <CartButton onClick={onOpenCart} />
        </div>
      </div>
    </header>
  );
}
