# Home Mood Check-In

## Data Source

The Home mood check-in uses the standalone `mood_logs` model from `DB.md`.
These logs are separate from journal entries, so saving a Home mood does not
create or update a journal entry.

The UI reuses the canonical mood metadata from `constants/moods.ts`, including
the existing mood IDs, labels, colors, and ordering:

- `happy`
- `calm`
- `sad`
- `motivated`
- `anxious`
- `grateful`

The selected mood display uses the matching animated emoji asset from
`assets/animated-emojis/`.

## Record Ownership

Mood check-ins are owned by the signed-in Clerk user through `MoodLog.userId`.
Home scopes local mood logs by the active journal user ID, which is already
managed by the app lock and authentication flow.

## Local Persistence

Saving from Home creates one local `MoodLog` for the current local day when no
Home check-in exists yet. The local record maps to `mood_logs` columns:

- `id`
- `user_id`
- `mood`
- `note`
- `intensity`
- `created_at`
- `updated_at`
- `deleted_at`

Home does not set `note` or `intensity`; both remain `null`.

If a mood log already exists for the current local day, Home updates that log's
`mood` instead of creating another one. The local store sets `updatedAt` and
marks the log `syncStatus: "pending"`.

## Cloud Synchronization

Home does not call Supabase directly. After local save succeeds, it requests the
existing auto-sync flow with the `mood_change` reason.

The sync pipeline now:

- pushes pending local mood logs to `mood_logs`
- pulls remote mood logs for the current user
- merges newer remote records into local storage
- marks pushed logs as `synced`
- marks failed cloud pushes as `failed`

Local success is shown before cloud sync completes. Offline saves remain on the
device and sync later through the existing reconnect behavior.

## Update Rules

Home keeps draft selection separate from saved selection:

- Selecting a mood only updates local UI state.
- Pressing `Log mood` creates today's `MoodLog`.
- Pressing `Update mood` updates today's existing `MoodLog`.
- Selecting the already saved mood does not write the same mood again.

If more than one legacy mood log exists for a day, Home updates the most
recently updated one and does not create a new duplicate.

## Date Grouping

Home groups check-ins by the user's local calendar date using
`createLocalDateKey` from `lib/calendar/dateUtils.ts`. It does not derive the day
from an ISO string slice, so logs saved near midnight remain grouped by local
time.

## Insights Impact

Home mood logs are now independent from journal entries. Existing journal-based
Insights, Calendar, and Reports continue to read entry moods exactly as before.
The Home change does not alter insight derivation utilities.

Future mood-log-specific insights can read `useMoodLogStore` or the synced
`mood_logs` table without changing journal entries.
