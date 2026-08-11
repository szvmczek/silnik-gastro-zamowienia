import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * „Zauważone" nowe zamówienia — wyłącznie stan UI, zero wpływu na dane.
 *
 * Licznik w nawigacji NIE jest akumulatorem zdarzeń SSE. Źródłem prawdy o tym,
 * które zamówienia są nowe, zostaje serwer (lista ze statusem NEW); ten store
 * trzyma tylko zbiór id, które admin już potwierdził wzrokowo — otwierając
 * szczegóły. Badge = zamówienia NEW spoza tego zbioru.
 *
 * Dzięki temu licznik jest odporny na przeładowanie strony i na zdarzenia
 * przegapione przy zerwanym SSE, a zamówienie wypchnięte ze statusu NEW
 * (np. przyciskiem „Potwierdź" na Kuchni) znika z badge'a samo — bez
 * potrzeby zgadywania po stronie klienta.
 */
/**
 * Zbiór jest przycinany do ostatnich N id zamiast czyszczony po liście NEW
 * z serwera. Wersja z przycinaniem po odpowiedzi API przegrywała wyścig
 * z rehydracją `persist`: gdy dane zapytania dotarły przed odtworzeniem
 * stanu z localStorage, zapis szedł na jeszcze pustym zbiorze i kasował
 * wszystkie potwierdzenia. Limit nic nie psuje, bo id zamówień nigdy się nie
 * powtarzają — stare id nie może zgasić badge'a nowemu zamówieniu.
 */
const MAX_SEEN = 200;

interface NewOrdersState {
  seenOrderIds: number[];
  /** Admin otworzył szczegóły — zamówienie przestaje pulsować. */
  acknowledge: (orderId: number) => void;
}

export const useNewOrdersStore = create<NewOrdersState>()(
  persist(
    (set) => ({
      seenOrderIds: [],
      acknowledge: (orderId) =>
        set((state) =>
          state.seenOrderIds.includes(orderId)
            ? state
            : { seenOrderIds: [...state.seenOrderIds, orderId].slice(-MAX_SEEN) },
        ),
    }),
    {
      name: "admin-seen-new-orders",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
