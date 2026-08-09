import { prefersReducedMotion } from "./prefersReducedMotion";

/** Element-kotwica koszyka; nawigacja publiczna oznacza nim pigułkę koszyka. */
export const CART_ANCHOR_ATTR = "data-cart-anchor";

/**
 * Lot do koszyka z paczki designu: kropka w kolorze akcentu startuje ze
 * środka klikniętego elementu i leci do pigułki koszyka, gasnąc po drodze.
 *
 * Świadomie poza Reactem — to czysta dekoracja, która nie powinna
 * powodować re-renderu ani żyć w drzewie komponentów. Kropka jest
 * pointer-events:none i sprząta się po sobie.
 */
export function flyToCart(from: Element | null | undefined): void {
  if (!from || prefersReducedMotion()) return;

  const target = document.querySelector(`[${CART_ANCHOR_ATTR}]`);
  const start = from.getBoundingClientRect();
  const end = target
    ? target.getBoundingClientRect()
    : new DOMRect(window.innerWidth - 60, 14, 30, 30);

  const dot = document.createElement("div");
  dot.style.cssText = [
    "position:fixed",
    "z-index:90",
    "width:16px",
    "height:16px",
    "border-radius:99px",
    "background:rgb(var(--color-primary))",
    "box-shadow:0 4px 14px rgb(var(--color-primary) / .5)",
    "pointer-events:none",
    "transition:transform .26s cubic-bezier(.4,0,.5,1),opacity .26s ease-in",
    `left:${start.left + start.width / 2 - 8}px`,
    `top:${start.top + start.height / 2 - 8}px`,
  ].join(";");
  document.body.appendChild(dot);

  const dx = end.left + end.width / 2 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);

  requestAnimationFrame(() => {
    dot.style.transform = `translate(${dx}px, ${dy}px) scale(.4)`;
    dot.style.opacity = "0";
  });

  window.setTimeout(() => dot.remove(), 320);
}
