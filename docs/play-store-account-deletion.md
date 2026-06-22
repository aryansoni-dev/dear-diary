# Play Store Account Deletion Preparation

DearDiary now supports in-app account deletion from the existing Profile account action, renamed to **Delete My Data and Account**.

## Public URL Requirement

Google Play also requires an externally accessible account-deletion page. This repository does not include a landing-page project, so no public route was created here.

Configure this placeholder when a public page exists:

```txt
EXPO_PUBLIC_ACCOUNT_DELETION_URL=https://[Website URL]/account-deletion
```

The public page must:

- Explain how signed-in users delete their account inside DearDiary.
- Offer a support-based deletion request when the app is inaccessible.
- Explain what data is deleted.
- Explain any legally retained data, if applicable.
- Use the placeholder support contact `[Support Email]` until a real reviewed address exists.
- Verify account ownership before deletion.

Do not create a public endpoint that deletes accounts based only on an email address.
