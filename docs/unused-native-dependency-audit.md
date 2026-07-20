# Unused native dependency audit

Audit date: 2026-07-18

No package, manifest, autolinking, or Gradle exclusion was changed during this audit.

| Finding | Introducing dependency | Used by DearDiary? | Current risk | Safe removal available? | Recommendation |
|---|---|---:|---|---|---|
| Amazon IAP receiver/classes | `react-native-purchases@10.4.2` → RevenueCat hybrid common 18.19.0 → native Purchases 10.12.0 → `purchases-store-amazon` → Amazon Appstore SDK | No; DearDiary uses the Google Play RevenueCat key/path | Low dormant component/dead-code and size surface; receiver is supplied by supported billing SDK | Not proven at the React Native wrapper level | Keep for this candidate. Ask RevenueCat whether the hybrid dependency supports a Google-only variant/exclusion, then prove purchase/restore and release compilation before removal |
| Solana Mobile Wallet Adapter | `@clerk/expo@3.3.1` → `@clerk/clerk-js@6.25.4` → wallet adapter packages → `@solana-mobile/mobile-wallet-adapter-protocol@2.2.9` → native clientlib 2.1.1 | No wallet functionality is referenced by DearDiary | Low dormant native/code-size surface; current build autolinks the module | No supported app-local exclusion was established | Keep until Clerk removes/optionalizes the Web3 chain or documents a safe exclusion; regression-test all Clerk flows before any change |
| Expo Dev Launcher/Menu release stubs | Direct `expo-dev-client@6.0.21` → dev launcher 6.0.21 and dev menu 7.0.19 | Development builds only | Low runtime exposure in this hardened APK: dev/test activities and `exp+` scheme are absent; disabled libraries still add some compile/package surface | Potentially, but exact removal impact was not isolated and development-client workflow depends on the package | Accept for trusted Preview; revisit a separate production-only dependency strategy and compare APKs |

## Evidence and size qualification

`npm ls --all`, `npm explain`, package POM/module metadata, the release dependency graph, and the final APK manifest were inspected. The temporary release graph compiled the Solana and RevenueCat native modules, confirming they are not merely JavaScript names.

The APK is 145,898,772 bytes. The unpacked `node_modules` directories for Expo dev client/launcher/menu total about 5.24 MB, but that is **not** their APK contribution. A comparative pair of otherwise identical release APKs is required to measure actual compressed/native size impact, and no new cloud build was authorized.

Current decision: these are accepted third-party/dormant-code findings, not reasons to remove supported authentication, billing, or development dependencies from the audited candidate.
