import { useQuery } from "@tanstack/react-query";
import {
  fetchPublicOpeningHours,
  type DayOfWeek,
  type OpeningHoursDto,
} from "@/shared/api/openingHoursApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { cn } from "@/shared/lib/cn";

/* InfoBar — czarny pasek 4-modułowy widoczny pod hero (LandingPage) i pod
   sticky banner+nav wrapper (MenuPage M-019). Renderuje:
   1. Status (pulse dot + "Otwarte teraz · do HH:MM" / "Zamknięte · otwieramy
      o HH:MM") — zawsze widoczny.
   2. Czas dostawy — gdy settings.defaultPreparationMinutes != null.
   3. Min. zamówienia — gdy settings.minOrderAmount != null.
   4. Koszt dowozu — gdy settings.deliveryFee != null.

   Pola 2-4 są Faza 5 M1 backend delta (patrz settingsApi.ts) — graceful skip
   gdy backend ich jeszcze nie zwraca. Status wystarczy do MVP-min.

   Bez własnego sticky — wrapper (LandingPage / MenuPage M-018/M-019) sticky'uje
   banner+nav. InfoBar siedzi natural-flow pod wrapperem. */

// NOTE: helpers duplikowane z ClosedBanner.tsx / InfoBar.tsx. Świadoma izolacja
// per-komponent (rule of three) — refactor do shared/lib/openingHours.ts gdy
// pojawi się 3-ci konsument (kandydaci: TrackingPage M-026, AdminLayout
// "closing soon" warning).

const TIME_ZONE = "Europe/Warsaw";
const DAY_MAP: Record<string, DayOfWeek> = {
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
  Sunday: "SUNDAY",
};
const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface NowInWarsaw {
  day: DayOfWeek;
  minutes: number;
}

function resolveNowInWarsaw(): NowInWarsaw | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  if (!weekday || !hour || !minute) return null;
  const day = DAY_MAP[weekday];
  if (!day) return null;
  const h = Number.parseInt(hour, 10) % 24;
  const m = Number.parseInt(minute, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return { day, minutes: h * 60 + m };
}

function parseHHMM(time: string | null): number | null {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = Number.parseInt(match[1], 10);
  const m = Number.parseInt(match[2], 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function formatHHMM(time: string | null): string | null {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function nextOpeningTime(
  hours: OpeningHoursDto[],
  now: NowInWarsaw
): string | null {
  const todayIdx = DAY_ORDER.indexOf(now.day);
  if (todayIdx < 0) return null;
  for (let i = 1; i <= 7; i += 1) {
    const dayIdx = (todayIdx + i) % 7;
    const day = DAY_ORDER[dayIdx];
    const entry = hours.find((h) => h.dayOfWeek === day);
    if (!entry || entry.closed) continue;
    const open = formatHHMM(entry.openTime);
    if (open) return open;
  }
  return null;
}

interface OpenStatus {
  isOpen: boolean;
  closeTime: string | null;
  nextOpenTime: string | null;
}

function resolveOpenStatus(
  hours: OpeningHoursDto[] | undefined,
  now: NowInWarsaw | null
): OpenStatus | null {
  if (!hours || !now) return null;

  const today = hours.find((h) => h.dayOfWeek === now.day);
  if (!today) return null;

  if (today.closed) {
    return {
      isOpen: false,
      closeTime: null,
      nextOpenTime: nextOpeningTime(hours, now),
    };
  }

  const open = parseHHMM(today.openTime);
  const close = parseHHMM(today.closeTime);
  if (open === null || close === null) return null;

  const crossesMidnight = close <= open;
  const isOpen = crossesMidnight
    ? now.minutes >= open || now.minutes < close
    : now.minutes >= open && now.minutes < close;

  if (isOpen) {
    return {
      isOpen: true,
      closeTime: formatHHMM(today.closeTime),
      nextOpenTime: null,
    };
  }

  if (!crossesMidnight && now.minutes < open) {
    return {
      isOpen: false,
      closeTime: null,
      nextOpenTime: formatHHMM(today.openTime),
    };
  }

  return {
    isOpen: false,
    closeTime: null,
    nextOpenTime: nextOpeningTime(hours, now),
  };
}

function formatPLN(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} zł`;
}

interface Props {
  compact?: boolean;
}

export function InfoBar({ compact = false }: Props) {
  const { data: hours } = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
  });
  const { data: settings } = usePublicSettings();

  const now = resolveNowInWarsaw();
  const status = resolveOpenStatus(hours, now);

  const prepMinutes = settings?.defaultPreparationMinutes;
  const minOrder = settings?.minOrderAmount;
  const deliveryFee = settings?.deliveryFee;

  const statusLabel =
    status === null
      ? "Sprawdzamy godziny…"
      : status.isOpen
        ? status.closeTime
          ? `Otwarte teraz · do ${status.closeTime}`
          : "Otwarte teraz"
        : status.nextOpenTime
          ? `Zamknięte · otwieramy o ${status.nextOpenTime}`
          : "Zamknięte";

  const isOpen = status?.isOpen ?? false;

  const modules: ModuleSpec[] = [];
  if (prepMinutes != null) {
    modules.push({ icon: "🚗", label: "Dostawa", value: `${prepMinutes} min` });
  }
  if (minOrder != null) {
    modules.push({ icon: "💰", label: "Min.", value: formatPLN(minOrder) });
  }
  if (deliveryFee != null) {
    modules.push({ icon: "🛵", label: "Dowóz od", value: formatPLN(deliveryFee) });
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text-on-dark))]",
        compact ? "gap-x-4 gap-y-2 px-4 py-3.5" : "gap-x-8 gap-y-3 px-12 py-5"
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isOpen ? "bg-[#10B981] is-pulsing-green" : "bg-[#DC2626]"
          )}
          aria-hidden="true"
        />
        <span
          className={cn(
            "font-semibold",
            compact ? "text-[13px]" : "text-[14px]"
          )}
        >
          {statusLabel}
        </span>
      </div>

      {modules.map((m, i) => (
        <div key={`${m.label}-${i}`} className="flex items-center gap-2">
          {!compact && (
            <span
              className="hidden h-5 w-px bg-white/15 md:block"
              aria-hidden="true"
            />
          )}
          <span className="flex items-center gap-1.5">
            <span className={compact ? "text-[14px]" : "text-base"}>
              {m.icon}
            </span>
            <span
              className={cn(
                "text-white/85",
                compact ? "text-[13px]" : "text-[14px]"
              )}
            >
              {m.label}{" "}
              <strong className="font-semibold text-white">{m.value}</strong>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

interface ModuleSpec {
  icon: string;
  label: string;
  value: string;
}
