import {
  legalPlaceholders,
  PRIVACY_POLICY_VERSION,
} from "@/content/legal/legalVersions";

export type LegalSection = {
  body: string[];
  title: string;
};

export const privacyPolicy = {
  effectiveDate: legalPlaceholders.effectiveDate,
  sections: [
    {
      body: [
        "DearDiary is an AI-powered journaling companion. This draft explains what data the app handles and how account deletion works. It requires legal review before public release.",
        `Operator: ${legalPlaceholders.companyName}.`,
        `Website: ${legalPlaceholders.websiteUrl}.`
      ],
      title: "Overview",
    },
    {
      body: [
        "Account sign-in and account identifiers are handled through Clerk. DearDiary may receive your Clerk user ID, name, profile image, and email address so the app can show your profile and connect your journal data to your account.",
      ],
      title: "Account Information",
    },
    {
      body: [
        "Journal entries, moods, tags, prompts, reflections, AI conversations, generated reports, achievements, and preferences may be stored on your device and synchronized with Supabase for backup and cross-device access.",
        "App Lock settings, including PIN-derived security data and biometric preferences, are stored locally on your device.",
      ],
      title: "Journal And App Data",
    },
    {
      body: [
        "DearDiary uses configured AI services to generate prompts, entry reflections, chat responses, and reports. AI responses may be incomplete or incorrect and are not medical diagnoses, treatment, therapy, or emergency assistance.",
      ],
      title: "AI Processing",
    },
    {
      body: [
        "If you enable reminders, DearDiary schedules local notifications on your device. Notification permission can be changed in your device settings or in the app.",
      ],
      title: "Notifications",
    },
    {
      body: [
        "You can export your journal from the app. Exported files are created on your device and may be shared through your operating system. You are responsible for where exported files are saved or sent.",
      ],
      title: "Export And Backup",
    },
    {
      body: [
        "You can request deletion from inside the app. Deletion removes your DearDiary cloud data, your Clerk authentication account, and user-scoped DearDiary data on the device after the server-side deletion completes.",
        "Some infrastructure backups or logs may persist for a limited period if required for operations, security, or legal obligations. This section requires legal review before release.",
      ],
      title: "Deletion And Retention",
    },
    {
      body: [
        `For privacy questions or account deletion help, contact - ${legalPlaceholders.supportEmail}.`,
      ],
      title: "Contact",
    },
    {
      body: [
        "We may update this policy as DearDiary changes. The app will show the current policy version and effective date.",
      ],
      title: "Updates",
    },
  ] satisfies LegalSection[],
  title: "Privacy Policy",
  version: PRIVACY_POLICY_VERSION,
};
