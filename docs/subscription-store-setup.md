# RevenueCat Setup

- [ ] Project created
- [ ] iOS app configured
- [ ] Android app configured
- [ ] Entitlement `DearDiary Pro` created
- [ ] Offering `default` created
- [ ] Monthly product attached
- [ ] Yearly product attached
- [ ] Products synced from stores
- [ ] Sandbox testing configured
- [ ] Webhooks configured if used
- [ ] API keys added to EAS environments
- [ ] `REVENUECAT_SECRET_API_KEY` added to Supabase Edge Function secrets

# Google Play

- [ ] Subscription/base plan created
- [ ] Monthly plan price set
- [ ] Yearly plan price set
- [ ] India price set to Rs 349/month
- [ ] India yearly price set
- [ ] Global monthly price at least $4.99 equivalent
- [ ] Test license accounts configured
- [ ] App uploaded to internal testing track if required

## Google Play Step-by-Step

Use the Play Console app whose package name is `com.aryan.deardiary`.

1. Open Play Console and create or select the DearDiary app.
2. Complete the app setup items required before monetization, including the payments profile/merchant setup if Play asks for it.
3. Upload a signed Android build to an internal testing track. Billing products often cannot be tested reliably until Google Play has a signed artifact for the same package name.
4. Go to **Monetize with Play > Products > Subscriptions**.
5. Create the monthly subscription:
   - Product ID: `deardiary_pro_monthly`
   - Name: `DearDiary Pro Monthly`
   - Description/internal note: `Monthly DearDiary Pro subscription`
6. Add an auto-renewing base plan to the monthly subscription:
   - Base plan ID: `monthly`
   - Billing period: Monthly
   - Country/region availability: include India and all launch countries
   - India price: Rs 349/month
   - Global fallback: at least USD 4.99 equivalent
   - Activate the base plan
7. Create the yearly subscription:
   - Product ID: `deardiary_pro_yearly`
   - Name: `DearDiary Pro Yearly`
   - Description/internal note: `Yearly DearDiary Pro subscription`
8. Add an auto-renewing base plan to the yearly subscription:
   - Base plan ID: `yearly`
   - Billing period: Yearly
   - Country/region availability: include India and all launch countries
   - India price: Rs 2,999/year recommended
   - Global fallback: USD 39.99 or USD 49.99 equivalent
   - Activate the base plan
9. In Google Cloud Console, enable the Google Play Android Developer API and Google Play Developer Reporting API for the linked project.
10. Create a service account for RevenueCat and download a JSON key.
11. In Play Console **Users and permissions**, invite the service account email and grant the app permissions RevenueCat needs:
    - View app information and download bulk reports
    - View financial data, orders, and cancellation survey response
    - Manage orders and subscriptions
12. In RevenueCat, open project `DearDiary` > Android app `DearDiary Android` and upload the service account JSON under Google Play service credentials.
13. Wait for RevenueCat credential validation. RevenueCat notes this can take up to 36 hours.
14. Confirm RevenueCat product records match:
    - Monthly Android product: `deardiary_pro_monthly:monthly`
    - Yearly Android product: `deardiary_pro_yearly:yearly`
15. Confirm RevenueCat offering `default` has:
    - `$rc_monthly` attached to the monthly Android product
    - `$rc_annual` attached to the yearly Android product
16. Confirm RevenueCat entitlement `DearDiary Pro` has both Android products attached.
17. Add Google Play license testers in Play Console.
18. Build and install an Android Preview/Internal APK/AAB from the internal track, then test purchases outside Expo Go.

# App Store

- [ ] Auto-renewable subscription group created
- [ ] Monthly product created
- [ ] Yearly product created
- [ ] India pricing set
- [ ] Global pricing set
- [ ] Sandbox testers configured
