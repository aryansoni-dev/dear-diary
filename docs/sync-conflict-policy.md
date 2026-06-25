# DearDiary Sync Conflict Policy

Audit date: 2026-06-25

This document records the current implemented policy. It does not introduce a new merge algorithm.

## Journal Entries

- Entries are scoped by `userId` and `id`.
- Remote rows whose `userId` does not match the requested user are skipped.
- Missing local entry plus matching remote user creates a local synced entry.
- If both local and remote exist, the larger parsed `updatedAt` timestamp wins.
- If timestamps are equal and all cloud fields match, the local entry is marked `synced`.
- If timestamps are equal but content differs, the local entry is kept and the remote row is skipped. The local entry is not marked synced unless the cloud data matches.
- Soft-deleted entries are represented by `deletedAt`; they remain in `allEntries` for tombstone sync and are hidden from visible `entries`.
- Invalid timestamps are treated as the oldest possible value during merge, after persisted/remote validation has already attempted to reject malformed records.

## Mood Logs

- Mood logs are user-owned records and should be deduped by `userId:id`.
- During this audit, hydration dedupe was fixed to preserve same-ID records that belong to different users.

## Safety Notes

- Sync is single-flight per active run through `requestSync`.
- A sync request for another user while a run is active is rejected as retryable instead of joining the old promise.
- Long-running sync stages must verify the active user before applying pulled data.
- Account deletion blocks new sync/write work through `useAccountDeletionStore.deletionInProgress`.

