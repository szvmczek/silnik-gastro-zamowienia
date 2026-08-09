import { LegalPage } from "./LegalPage";

export function PrivacyPage() {
  return (
    <LegalPage
      title="Polityka prywatności"
      field="privacyPolicy"
      errorMessage="Nie udało się pobrać polityki prywatności. Odśwież stronę."
    />
  );
}
