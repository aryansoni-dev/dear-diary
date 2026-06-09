# DearDiary Design System

This document captures the design language currently used across DearDiary:
the splash screen, onboarding flow, auth screens, reset password flow,
verification modal, and first home tab.

The goal is to keep new screens visually consistent while the app is still
being built feature by feature.

## Design Direction

DearDiary should feel calm, private, warm, and reflective. The interface uses
soft gradients, rounded shapes, gentle shadows, and sparse copy so journaling
feels emotionally safe rather than clinical.

Prefer:

- Soft full-screen gradient backgrounds.
- Warm rose primary actions.
- Gentle pastel support colors for emotional states and feature groups.
- Centered onboarding/auth composition.
- Large touch targets and simple, direct labels.
- Small decorative accents used sparingly.

Avoid:

- Hard black backgrounds or harsh contrast.
- Dense dashboards on first-run and auth screens.
- Sharp cards, square buttons, and heavy borders.
- New one-off colors when an existing token works.
- Marketing-page layouts where the user should be doing an app task.

## Screens Analyzed

- `app/index.tsx`
- `app/(onboarding)/onboarding-screen-1.tsx`
- `app/(onboarding)/onboarding-screen-2.tsx`
- `app/(onboarding)/onboarding-screen-3.tsx`
- `app/(onboarding)/onboarding-screen-4.tsx`
- `app/(onboarding)/onboarding-screen-5.tsx`
- `components/auth/auth-screen.tsx`
- `components/auth/reset-password-screen.tsx`
- `components/auth/auth-text-field.tsx`
- `components/auth/verification-code-modal.tsx`
- `app/(tabs)/home-tab/index.tsx`

## Implementation Rules

- Use NativeWind classes for static styling.
- Use inline styles only for dynamic sizing, shadows, gradients, modal layout,
  platform behavior, and `borderCurve`.
- Keep route files small. Put reusable UI and non-trivial screen UI in
  `components/`.
- Import image assets only through `constants/images.ts`.
- Use `expo-linear-gradient` for page backgrounds and illustrated panels.
- Use `@expo/vector-icons` for icons, mainly Feather and Ionicons.
- Hide Expo Router headers on full-screen app surfaces unless the screen is a
  standard stack detail page.

## Color Tokens

Use these current values before adding new colors.

| Token | Hex | Current Usage |
| --- | --- | --- |
| `rosePrimary` | `#ff2056` | Primary buttons, active progress, links, key icons |
| `roseSoft` | `#FFDDE8` | Pastel cards, icon tiles, onboarding backgrounds |
| `roseMist` | `#FFF4FA` | Auth and home background start |
| `roseDot` | `#ffb6c7` | Decorative dots and inactive progress accents |
| `roseAccent` | `#ff8aae` | Small decorative accents |
| `roseLight` | `#FFAEC9` | Secondary decorative rose |
| `cream` | `#FAF7F2` | Default page background end |
| `lavender` | `#F4EFFA` | AI/reflection pastel sections |
| `sky` | `#DDEFFF` | Mood and calm pastel sections |
| `sage` | `#D8EEDB` | Growth, rituals, and positive states |
| `success` | `#059669` | Success helper text and positive icons |
| `infoBlue` | `#0284c7` | Insight/brain icon accent |
| `violet` | `#8b5cf6` | Mood trends accent |
| `textPrimary` | `zinc-950` | Main headings |
| `textSecondary` | `zinc-500` | Body text and descriptions |
| `textMuted` | `zinc-400` | Secondary links and privacy text |
| `borderSoft` | `zinc-200` | Inputs, secondary buttons, subtle panels |

## Gradients

Full-screen gradients are a core part of the product identity.

| Surface | Gradient |
| --- | --- |
| Auth, reset password, home | `["#FFF4FA", "#FAF7F2"]` |
| Splash and final onboarding | `["#F4EFFA", "#FFDDE8", "#FAF7F2"]` |
| Onboarding 1 | `["#FFDDE8", "#FAF7F2", "#FAF7F2"]` |
| Onboarding 2 | `["#F4EFFA", "#FAF7F2"]` |
| Onboarding 3 | `["#DDEFFF", "#FFDDE8", "#FAF7F2"]` |
| Onboarding 4 | `["#FFDDE8", "#F4EFFA"]` |

Use gradients as page backgrounds, not as tiny decorative strips. Page
backgrounds should usually fill the entire screen.

## Typography

The current app uses the default React Native font stack. Keep typography
simple and rely on size, weight, and color.

| Role | Size / Line Height | Weight | Color |
| --- | --- | --- | --- |
| Splash quote | `16 / 24` | italic serif | `zinc-500` |
| Onboarding title | `28-32 / 34-40` | bold | `zinc-950` |
| Auth title | `29 / 33` | bold | `zinc-950` |
| Home title | `30 / 36` | bold | `zinc-950` |
| Modal title | `24 / 32` | bold | `zinc-950` |
| Body copy | `14-17 / 20-30` | regular | `zinc-500` |
| Button label | `14-17 / 20-24` | bold or semibold | white or `zinc-950` |
| Input label | `12 / 20` | medium | `zinc-500` |
| Input text | `13 / 20` | medium | `zinc-900` |
| Helper text | `11 / 16` | medium | success or rose |
| Footer microcopy | `10 / 16` | semibold uppercase | `zinc-300` |

Guidelines:

- Keep headings centered on onboarding and auth screens.
- Use `tracking-tight` only on larger onboarding headings when needed.
- Use wide letter spacing only for tiny footer mantras, currently
  `letterSpacing: 3` or `tracking-[7px]`.
- Do not scale font size with viewport width. Use compact height branches when
  a screen needs to fit shorter devices.

## Spacing

Common screen padding:

- Splash: horizontal `22`, top `30` compact or `52` regular.
- Onboarding: horizontal `32`, except ritual screen uses `24`.
- Auth/reset: horizontal `24`, content max width `384`.
- Home tab placeholder: horizontal `24`.

Common vertical rhythm:

- Page top padding: `32-64` depending on screen and compact height.
- Main card top margin: `20-32`.
- Form field gap: `16`.
- Button top margin after form: `20`.
- Footer/action gap: `12-16`.

Responsive pattern:

- Splash compact threshold: `height < 680`.
- Auth compact threshold: `height < 720`.
- Onboarding compact threshold: `height < 760`.
- Prefer `useWindowDimensions()` for meaningful layout changes.

## Shape

DearDiary uses very rounded, soft geometry.

| Element | Radius |
| --- | --- |
| Primary and secondary buttons | `rounded-full` |
| Auth input containers | `rounded-2xl` |
| Small icon tiles | `rounded-2xl` |
| Auth cards and modals | `rounded-[28px]` |
| Onboarding cards | `rounded-3xl` |
| Large image frame | `rounded-[40px]` |
| Decorative dots | `rounded-full` |

Use `borderCurve: "continuous"` on large cards, inputs, and modal surfaces
when inline style is already needed.

## Shadows

Shadows are soft and tinted. They should make surfaces feel lifted, not heavy.

Common shadows:

```ts
// Primary rose button
"0 12px 28px -9px rgba(255, 32, 86, 0.7)"

// Larger onboarding rose button
"0 12px 30px -8px rgba(255, 32, 86, 0.5)"

// Auth card
"0 18px 55px -22px rgba(255, 32, 86, 0.35)"

// Verification modal
"0 18px 45px -12px rgba(0, 0, 0, 0.22)"

// Lavender illustrated cards
"0 18px 50px -15px rgba(180, 150, 230, 0.4)"
```

Use shadow inline styles, following the project styling rules.

## Components

### Primary Button

Use for main forward actions.

- Height: `52-56`, usually `h-14`.
- Width: full screen/card width.
- Shape: `rounded-full`.
- Background: `#ff2056`.
- Text: white or `rose-50`, bold or semibold.
- Shadow: rose tinted.

Examples: `Continue`, `Get Started`, `Next`, `Start Writing`, `Log In`,
`SignUp`, `Get code`, `Reset Passwd`.

### Secondary Text Link

Use for back, alternate auth routes, and low-priority choices.

- Container: `px-3` or `px-4`, `py-1`.
- Text: `text-sm` or `text-[12px]`.
- Default color: `zinc-400` or `zinc-500`.
- Emphasized inline link: `font-bold text-[#ff2056]`.

### Auth Text Field

Use `AuthTextField` for auth forms.

- Label: `12 / 20`, medium, `zinc-500`.
- Container: `h-12`, `rounded-2xl`, `border-zinc-200`, white background,
  horizontal padding `16`.
- Left icon: Feather, `14`, `#a1a1aa`.
- Text: `13 / 20`, medium, `zinc-900`.
- Placeholder: `#a1a1aa`.
- Right icon button: `size-9`, used for password visibility.
- Helper text: `11 / 16`, success green or rose error.

### Verification Code Modal

Use for email code flows.

- Modal overlay: `rgba(0, 0, 0, 0.3)`.
- Sheet position: bottom-aligned.
- Sheet: white, `rounded-[28px]`, padding `24`.
- Icon badge: `size-11`, `rounded-full`, `#FFDDE8`.
- Code slots: 6 slots, `h-12`, `rounded-2xl`, active border `#ff2056`,
  inactive border `#e4e4e7`.
- The hidden input should use `number-pad`, `one-time-code`, and max length 6.

### Social Button

Use for OAuth actions.

- Height: `40`.
- Shape: `rounded-full`.
- Background: `zinc-50`.
- Border: `zinc-200`.
- Label: `13 / 20`, semibold, `zinc-950`.
- Icon: Google image from `images.googleLogo`, Apple Ionicon.

### Progress Dots

Use on onboarding only.

- Inactive: `size-2 rounded-full` using rose at low opacity or `#ffb6c7`.
- Active: `h-2 w-6` or `w-8`, `rounded-full`, `#ff2056`.
- Final screen may show all dots active.

## Imagery And Illustration

- Use centralized imports from `constants/images.ts`.
- Current bitmap assets:
  - `images.splashLogo`
  - `images.appLogo`
  - `images.googleLogo`
  - `images.onboardingReflect`
- Onboarding can combine bitmaps, gradients, icon scenes, emojis, and simple
  decorative dots.
- Keep decorative icon scenes light. They should support the emotional concept,
  not compete with text or controls.

## Copy Style

Copy should be short, reassuring, and action-oriented.

Current voice examples:

- "Every thought deserves a place to rest."
- "Your space to reflect."
- "Reflect, understand, and grow."
- "Your thoughts are waiting for you."
- "Your journal stays private and secure."
- "Take a moment. Breathe. Begin again."

Guidelines:

- Use direct button labels.
- Keep body copy to one or two short sentences.
- Keep privacy reassurance visible on auth-like screens.
- Use emotional warmth in onboarding, but keep forms practical.

## Navigation Patterns

- Splash routes to `/onboarding-screen-1`.
- Onboarding advances one step at a time.
- Final onboarding action routes to `/signup`.
- Auth success routes to `/home-tab`.
- Protected tab routes live under `app/(tabs)/`.
- Auth routes live under `app/(auth)/`.
- Onboarding routes live under `app/(onboarding)/`.

## Future Screen Guidance

For Journal, Reflect, Insights, Calendar, and Profile screens:

- Start with the auth/home background gradient unless the screen has a clear
  emotional state that benefits from a pastel variant.
- Use `zinc-950` headings and `zinc-500` body text.
- Use rose for the single most important action.
- Use sage for growth or success states, sky for calm or mood history,
  lavender for AI and insight surfaces.
- Reuse rounded cards with white or pastel backgrounds.
- Keep repeated content cards tighter than onboarding cards. Main app screens
  should be easy to scan and use repeatedly.
- Create reusable components only when a pattern repeats or when it makes a
  route screen easier to read.

