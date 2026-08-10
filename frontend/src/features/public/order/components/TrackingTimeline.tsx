import { cn } from "@/shared/lib/cn";
import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";
import { currentStepIndex, trackingSteps } from "../lib/trackingSteps";

interface Props {
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
}

/**
 * Pionowa oś kroków z paczki. Mapowanie statusów na kroki żyje
 * w lib/trackingSteps (D-05) — komponent tylko rysuje.
 */
export function TrackingTimeline({ status, fulfillmentType }: Props) {
  const steps = trackingSteps(fulfillmentType);
  const activeIndex = currentStepIndex(status, fulfillmentType);
  const activeStep = activeIndex >= 0 ? steps[activeIndex] : null;

  return (
    <>
      {/* Baner stanu — sama pulsująca kropka na osi jest zbyt subtelna,
          żeby nieść komunikat. aria-live, bo przy pollingu co 15 s stan
          zmienia się bez przeładowania strony. */}
      {activeStep ? (
        <section
          aria-live="polite"
          className="mt-4 rounded-2xl border border-primary/35 bg-primary/[0.08] px-4 py-3.5"
        >
          <p className="flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[2px] text-primary">
            <span
              aria-hidden="true"
              className="h-2 w-2 flex-none rounded-full bg-primary motion-safe:animate-piec-amber"
            />
            Krok {activeIndex + 1} z {steps.length}
          </p>
          <p className="mt-1.5 font-display text-[clamp(22px,5.5vw,28px)] leading-[1.15] tracking-[1px]">
            {activeStep.headline}
          </p>
          <p className="mt-1 text-[13.5px] leading-[1.55] text-piec-ink/70">
            {activeStep.detail}
          </p>
        </section>
      ) : null}

      <ol className="mt-6">
      {steps.map((step, index) => {
        const isDone = activeIndex > index;
        const isCurrent = activeIndex === index;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.label} className="flex gap-4">
            {/* w-5, nie w-4 — aktywna kropka jest większa i ma ring. */}
            <div className="flex w-5 flex-none flex-col items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-[3px] flex-none rounded-full",
                  isDone && "h-3.5 w-3.5 bg-primary",
                  // Aktywny krok większy i w ringu — kropka wielkości
                  // pozostałych ginęła na ciemnym tle.
                  isCurrent &&
                    "h-[18px] w-[18px] bg-primary ring-4 ring-primary/25 motion-safe:animate-piec-amber",
                  !isDone && !isCurrent && "h-3.5 w-3.5 border-2 border-piec-ink/25",
                )}
              />
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "min-h-[30px] w-0.5 flex-1",
                    isDone ? "bg-primary" : "bg-piec-ink/15",
                  )}
                />
              ) : null}
            </div>
            <div className="pb-6">
              <p
                className={cn(
                  "text-[15.5px]",
                  isDone || isCurrent
                    ? "font-bold text-piec-ink"
                    : "font-semibold text-piec-ink/45",
                )}
              >
                {step.label}
                {isCurrent ? <span className="sr-only"> — aktualny etap</span> : null}
              </p>
              {isCurrent && step.hint ? (
                <p className="mt-0.5 text-[13.5px] text-piec-ink/60">{step.hint}</p>
              ) : null}
            </div>
          </li>
        );
      })}
      </ol>
    </>
  );
}
