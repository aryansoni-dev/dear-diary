import {
  legalPlaceholders,
  TERMS_VERSION,
} from "@/content/legal/legalVersions";
import type { LegalSection } from "@/content/legal/privacyPolicy";

export const termsAndConditions = {
  effectiveDate: legalPlaceholders.termsEffectiveDate,
  sections: [
    {
      body: [
        `These Terms are a draft between you and ${legalPlaceholders.companyName}. They require legal review before public release.`,
      ],
      title: "Acceptance",
    },
    {
      body: [
        "You are responsible for keeping your sign-in credentials secure and for activity on your account. Use DearDiary only for lawful, personal reflection and journaling.",
      ],
      title: "Account Responsibilities",
    },
    {
      body: [
        "Your journal content belongs to you. You grant DearDiary the limited permission needed to store, sync, process, display, export, and delete your content as part of the app experience.",
      ],
      title: "Your Content",
    },
    {
      body: [
        "DearDiary AI features are reflective tools. AI-generated content may be incomplete or incorrect and is not medical advice, diagnosis, therapy, emergency service, or a substitute for professional care.",
        "AI features are subject to fair-use limits. DearDiary Pro provides higher AI usage, but it does not provide unlimited AI access.",
      ],
      title: "AI Features",
    },
    {
      body: [
        "DearDiary Pro is an optional auto-renewing subscription that unlocks premium AI-powered reflections, reports, emotional patterns, and advanced insights. Prices are shown in the app from the App Store or Google Play through RevenueCat and may vary by region, taxes, and store configuration.",
        "Subscriptions renew automatically unless cancelled through your App Store or Google Play account settings before renewal. Purchase, renewal, cancellation, refund, and billing support are handled by the relevant store.",
        "You can use Restore purchases in the app to ask RevenueCat and the store to restore an active entitlement. Restoration only unlocks Pro when the store and RevenueCat report an active Pro entitlement.",
      ],
      title: "Subscriptions",
    },
    {
      body: [
        "DearDiary may be unavailable from time to time. You are responsible for exporting or backing up content you want to keep outside the app.",
      ],
      title: "Availability And Backups",
    },
    {
      body: [
        "You may delete your account and associated DearDiary data through the app. Deletion is permanent once completed and cannot be undone.",
        "Account deletion does not cancel an active App Store or Google Play subscription. If you subscribed to DearDiary Pro, manage or cancel it through your store account settings.",
      ],
      title: "Account Deletion",
    },
    {
      body: [
        "DearDiary, including its design, branding, software, and generated app materials, is protected by intellectual property laws. Legal ownership details require review before release.",
      ],
      title: "Intellectual Property",
    },
    {
      body: [
        "Limitations of liability, warranties, governing law, and dispute terms require legal review and should not be considered final in this draft.",
      ],
      title: "Legal Limitations",
    },
    {
      body: [
        "We may update these Terms as the app changes. Continued use after updates means you accept the updated Terms where legally permitted.",
      ],
      title: "Changes",
    },
    {
      body: [`Questions can be sent to ${legalPlaceholders.supportEmail}.`],
      title: "Contact",
    },
  ] satisfies LegalSection[],
  title: "Terms And Conditions",
  version: TERMS_VERSION,
};
