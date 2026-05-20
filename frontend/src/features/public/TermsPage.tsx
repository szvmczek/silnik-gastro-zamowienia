import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicLegal } from "@/shared/api/legalApi";
import { ClosedBanner } from "@/shared/components/banners/ClosedBanner";
import { CartBottomSheet } from "@/features/public/cart/CartBottomSheet";
import { MobileCartBar } from "@/features/public/cart/MobileCartBar";
import { PublicFooter } from "@/features/public/shared/PublicFooter";
import { PublicNav } from "@/features/public/shared/PublicNav";

export function TermsPage() {
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const { data, isError, isPending } = useQuery({
    queryKey: ["public", "legal"],
    queryFn: fetchPublicLegal,
    staleTime: 60_000,
  });

  const content = data?.termsOfService?.trim() ? data.termsOfService : "Brak treści.";

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-page))] text-[rgb(var(--color-text-primary))]">
      <div className="sticky top-0 z-50">
        <ClosedBanner />
        <PublicNav active="home" onOpenCart={() => setCartOpen(true)} />
      </div>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16">
        <div className="t-kicker t-kicker--accent mb-3">ZASADY</div>
        <h1 className="text-[32px] font-black leading-[1.05] tracking-[-0.03em] md:text-[52px]">
          Regulamin
          <span className="text-[rgb(var(--color-primary))]">.</span>
        </h1>

        <section className="mt-8 rounded-2xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-5 md:p-8">
          {isPending ? (
            <p className="text-[14px] text-[rgb(var(--color-text-muted))]">
              Ładowanie treści…
            </p>
          ) : isError ? (
            <p className="text-[14px] text-[rgb(var(--status-cancelled))]">
              Nie udało się pobrać regulaminu. Odśwież stronę.
            </p>
          ) : (
            <div className="whitespace-pre-line text-[14px] leading-[1.75] text-[rgb(var(--color-text-body))] md:text-[15px]">
              {content}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />

      <CartBottomSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={() => navigate("/checkout")}
        onUpsellAdd={() => {
          setCartOpen(false);
          navigate("/menu");
        }}
      />
      <MobileCartBar onOpenCart={() => setCartOpen(true)} />
    </div>
  );
}
