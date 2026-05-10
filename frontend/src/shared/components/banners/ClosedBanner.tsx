import { useQuery } from "@tanstack/react-query";
import {
  fetchPublicOpeningHours,
  type DayOfWeek,
  type OpeningHoursDto,
} from "@/shared/api/openingHoursApi";
import { Icon } from "@/shared/components/ui/Icon";

/* ClosedBanner — sticky banner top-of-page widoczny gdy restauracja jest
   zamknieta. Render: czerwone tlo (UX_BIBLE §1: #B91C1C), bialy tekst,
   ~48px wysokosci, ikona zegara z M-006 Icon set.

   Mount point: Warstwa 3 wpina w LandingPage / MenuPage (M-018 / M-019).

   Data source: lokalne useQuery z queryKey ["public","opening-hours"]
   shared z useIsRestaurantOpen przez TanStack Query cache. refetchInterval
   to per-observer prop -- inni konsumenci hooka zostaja z staleTime: 60_000
   bez aktywnego polling; to intencjonalna izolacja per-consumer, nie problem.
   Hook useIsRestaurantOpen nietkniety. */

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

type BannerVariant = "planned" | "outsideHours" | "manual";

interface BannerState {
  variant: BannerVariant;
  message: string;
}

function resolveBannerState(
  hours: OpeningHoursDto[] | undefined,
  now: NowInWarsaw | null
): BannerState | null {
  // TODO(Faza 5 M1): branch 'manual' wymaga RestaurantSettings.manualClosedReason
  //                  + manualClosedUntil w backendzie. Patrz docs/PHASES.md gap M1.
  // Wariant typeunion zachowany; logika zostanie podpieta gdy API doda pole.

  if (!hours || !now) return null;

  const today = hours.find((h) => h.dayOfWeek === now.day);
  if (!today) return null;

  // Pelny dzien zamkniety (closed flag) lub po godzinie zamkniecia
  if (today.closed) {
    const nextOpen = nextOpeningTime(hours, now);
    return {
      variant: "outsideHours",
      message: nextOpen
        ? `Aktualnie zamknięte. Otwieramy o ${nextOpen}.`
        : "Aktualnie zamknięte.",
    };
  }

  const open = parseHHMM(today.openTime);
  const close = parseHHMM(today.closeTime);
  if (open === null || close === null) return null;

  const crossesMidnight = close <= open;
  const isOpen = crossesMidnight
    ? now.minutes >= open || now.minutes < close
    : now.minutes >= open && now.minutes < close;

  if (isOpen) return null;

  // Otwarte pozniej dzis -- planned
  if (!crossesMidnight && now.minutes < open) {
    const todayOpen = formatHHMM(today.openTime);
    return {
      variant: "planned",
      message: todayOpen
        ? `Otwieramy dzisiaj o ${todayOpen}.`
        : "Aktualnie zamknięte.",
    };
  }

  // Po godzinie zamkniecia -- outsideHours
  const nextOpen = nextOpeningTime(hours, now);
  return {
    variant: "outsideHours",
    message: nextOpen
      ? `Aktualnie zamknięte. Otwieramy o ${nextOpen}.`
      : "Aktualnie zamknięte.",
  };
}

export function ClosedBanner() {
  const { data } = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const now = resolveNowInWarsaw();
  const state = resolveBannerState(data, now);
  if (!state) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-40 flex min-h-[48px] items-center justify-center gap-2.5 bg-[#B91C1C] px-4 py-2 text-white"
    >
      <Icon name="clock" size={18} className="shrink-0" />
      <span className="text-[14px] font-medium">{state.message}</span>
    </div>
  );
}
