import { LegalDocumentScreen } from "@/components/legal/legal-document-screen";
import { privacyPolicy } from "@/content/legal/privacyPolicy";

const accountDeletionUrl =
  process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL?.trim() || null;

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
