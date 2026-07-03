import { LegalDocumentScreen } from "@/components/legal/legal-document-screen";
import { privacyPolicy } from "@/content/legal/privacyPolicy";
import { getPublicEnvironment } from "@/lib/environment";

const accountDeletionUrl = getPublicEnvironment()?.accountDeletionUrl ?? null;

export default function PrivacyPolicyScreen() {
  return (
    <LegalDocumentScreen
      accountDeletionUrl={accountDeletionUrl}
      effectiveDate={privacyPolicy.effectiveDate}
      sections={privacyPolicy.sections}
      title={privacyPolicy.title}
      version={privacyPolicy.version}
    />
  );
}
