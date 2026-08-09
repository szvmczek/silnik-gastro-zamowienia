import { LegalPage } from "./LegalPage";

export function TermsPage() {
  return (
    <LegalPage
      title="Regulamin"
      field="termsOfService"
      errorMessage="Nie udało się pobrać regulaminu. Odśwież stronę."
    />
  );
}
