import {
  Check,
  CircleCheck,
  ClipboardCheck,
  Flame,
  Home,
  PackageCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { OrderStatus } from "@/shared/api/orderApi";

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Przyjęte",
  CONFIRMED: "Potwierdzone",
  IN_PREPARATION: "W przygotowaniu",
  READY: "Gotowe",
  OUT_FOR_DELIVERY: "W drodze",
  DELIVERED: "Dostarczone",
  CANCELED: "Anulowane",
};

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
  NEW: CircleCheck,
  CONFIRMED: ClipboardCheck,
  IN_PREPARATION: Flame,
  READY: PackageCheck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Home,
  CANCELED: CircleCheck,
};

interface TrackingTimelineProps {
  timeline: OrderStatus[];
  currentIndex: number;
}

export function TrackingTimeline({ timeline, currentIndex }: TrackingTimelineProps) {
  const lastDoneSegment = Math.max(0, currentIndex);
  const totalSegments = Math.max(1, timeline.length - 1);
  const progressPct = (lastDoneSegment / totalSegments) * 100;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-10">
      {/* Desktop — horizontal */}
      <div className="relative hidden lg:block">
        <div className="relative flex items-start justify-between">
          <div className="absolute left-5 right-5 top-5 h-[2px] bg-slate-200" />
          <div
            className="absolute left-5 top-5 h-[2px] bg-emerald-500 transition-all duration-slow"
            style={{ width: `calc((100% - 40px) * ${progressPct / 100})` }}
          />
          {timeline.map((status, idx) => (
            <TimelineStep
              key={status}
              status={status}
              idx={idx}
              currentIndex={currentIndex}
              layout="horizontal"
              total={timeline.length}
            />
          ))}
        </div>
      </div>

      {/* Mobile — vertical */}
      <ol className="space-y-5 lg:hidden">
        {timeline.map((status, idx) => (
          <TimelineStep
            key={status}
            status={status}
            idx={idx}
            currentIndex={currentIndex}
            layout="vertical"
            total={timeline.length}
          />
        ))}
      </ol>
    </section>
  );
}

interface StepProps {
  status: OrderStatus;
  idx: number;
  currentIndex: number;
  layout: "horizontal" | "vertical";
  total: number;
}

function TimelineStep({ status, idx, currentIndex, layout, total }: StepProps) {
  const done = idx < currentIndex;
  const active = idx === currentIndex;
  const isLast = idx === total - 1;
  const Icon = STATUS_ICONS[status];

  const dot = (
    <div className="relative">
      {active ? (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/35 animate-ping" />
          <span className="absolute -inset-1 rounded-full border-2 border-primary/40" />
        </>
      ) : null}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-colors",
          layout === "horizontal" ? "h-10 w-10" : "h-[30px] w-[30px]",
          done
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-primary text-white animate-dotpulse"
              : "border-2 border-slate-200 bg-white text-slate-400"
        )}
      >
        {done ? (
          <Check
            className={layout === "horizontal" ? "h-4 w-4" : "h-3 w-3"}
            strokeWidth={3}
          />
        ) : (
          <Icon
            className={layout === "horizontal" ? "h-4 w-4" : "h-3 w-3"}
          />
        )}
      </div>
    </div>
  );

  if (layout === "horizontal") {
    return (
      <div className="relative flex flex-col items-center" style={{ width: `${100 / total}%` }}>
        {dot}
        <div
          className={cn(
            "mt-3 text-center text-[12px] font-medium",
            active ? "text-slate-900" : done ? "text-slate-700" : "text-slate-400"
          )}
        >
          {STATUS_LABELS[status]}
        </div>
      </div>
    );
  }

  return (
    <li className="relative flex items-start gap-3">
      {!isLast ? (
        <div
          className={cn(
            "absolute left-[15px] top-[34px] bottom-[-20px] w-px",
            done ? "bg-emerald-500" : "bg-slate-200"
          )}
        />
      ) : null}
      <div className="shrink-0">{dot}</div>
      <div className="flex-1 pt-1">
        <div
          className={cn(
            "text-[13px] font-medium",
            active ? "text-slate-900" : done ? "text-slate-700" : "text-slate-400"
          )}
        >
          {STATUS_LABELS[status]}
        </div>
      </div>
    </li>
  );
}

export { STATUS_LABELS };
