import { useEffect } from "react";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { applyPrimaryColor } from "@/shared/theme/themeLoader";

export function ThemeBootstrap() {
  const { data } = usePublicSettings();

  useEffect(() => {
    if (data?.primaryColor) {
      applyPrimaryColor(data.primaryColor);
    }
  }, [data?.primaryColor]);

  return null;
}
