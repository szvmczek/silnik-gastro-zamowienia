import { useQuery } from "@tanstack/react-query";
import {
  fetchPublicOpeningHours,
  type DayOfWeek,
  type OpeningHoursDto,
} from "@/shared/api/openingHoursApi";

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
  // Intl hour12:false may emit "24" at midnight — normalize to 0.
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

export interface RestaurantOpenState {
  isOpen: boolean;
  isLoading: boolean;
  todayHours: OpeningHoursDto | null;
}

export function useIsRestaurantOpen(): RestaurantOpenState {
  const query = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
  });

  // Fail-open: dopóki nie mamy pewnych danych, nie blokujemy zamawiania.
  if (query.isPending || query.isError || !query.data) {
    return { isOpen: true, isLoading: query.isPending, todayHours: null };
  }

  const now = resolveNowInWarsaw();
  if (!now) {
    return { isOpen: true, isLoading: false, todayHours: null };
  }

  const todayHours = query.data.find((h) => h.dayOfWeek === now.day) ?? null;
  if (!todayHours || todayHours.closed) {
    return { isOpen: false, isLoading: false, todayHours };
  }
  const open = parseHHMM(todayHours.openTime);
  const close = parseHHMM(todayHours.closeTime);
  if (open === null || close === null) {
    return { isOpen: false, isLoading: false, todayHours };
  }
  const isOpen =
    close > open
      ? now.minutes >= open && now.minutes < close
      : now.minutes >= open || now.minutes < close; // przekracza północ
  return { isOpen, isLoading: false, todayHours };
}
