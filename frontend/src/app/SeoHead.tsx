import { useEffect } from "react";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";

const FALLBACK_TITLE = "Pizza Showcase";
const FALLBACK_DESCRIPTION = "Zamów pizzę online — dostawa lub odbiór osobisty.";

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string
): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeMeta(attr: "name" | "property", key: string): void {
  const el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (el) {
    el.remove();
  }
}

export function SeoHead() {
  const { data } = usePublicSettings();

  useEffect(() => {
    const title = data?.name?.trim() || FALLBACK_TITLE;
    const description = data?.tagline?.trim() || FALLBACK_DESCRIPTION;
    const image = data?.logoUrl?.trim();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    if (image) {
      upsertMeta("property", "og:image", image);
    } else {
      removeMeta("property", "og:image");
    }
  }, [data?.name, data?.tagline, data?.logoUrl]);

  return null;
}
