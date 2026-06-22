import { LegalDocumentScreen } from "@/components/legal/legal-document-screen";
import { termsAndConditions } from "@/content/legal/termsAndConditions";

export default function TermsScreen() {
  return (
    <LegalDocumentScreen
      effectiveDate={termsAndConditions.effectiveDate}
      sections={termsAndConditions.sections}
      title={termsAndConditions.title}
      version={termsAndConditions.version}
    />
  );
}
