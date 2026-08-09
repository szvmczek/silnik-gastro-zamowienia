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

  return (
    <ol className="mt-6">
      {steps.map((step, index) => {
        const isDone = activeIndex > index;
        const isCurrent = activeIndex === index;
        const isLast = index === steps.length - 1;
        return (
          <li key={step.label} className="flex gap-4">
            <div className="flex w-4 flex-none flex-col items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "mt-[3px] h-3.5 w-3.5 flex-none rounded-full",
                  isDone && "bg-primary",
                  isCurrent && "bg-primary motion-safe:animate-piec-amber",
                  !isDone && !isCurrent && "border-2 border-piec-ink/25",
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
  );
}
