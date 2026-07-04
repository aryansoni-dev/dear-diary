import assert from "node:assert/strict";

import { buildReportSourceSnapshotInput as buildClientSnapshotInput } from "../lib/insights/reportSourceSnapshot.ts";
import { buildReportSourceSnapshotInput as buildServerSnapshotInput } from "../supabase/functions/_shared/buildReportSourceSnapshot.ts";

const clientInput = buildClientSnapshotInput(
  [
    {
      id: "entry-b",
      updatedAt: "2026-07-04T17:47:54.069Z",
    },
    {
      id: "entry-a",
      updatedAt: "2026-07-04T17:40:00.000Z",
    },
  ],
  [
    {
      id: "mood-a",
      updatedAt: "2026-07-04T17:42:00.000Z",
    },
  ],
);

const serverInput = buildServerSnapshotInput(
  [
    {
      content: "",
      created_at: "2026-07-04T10:00:00+00:00",
      id: "entry-a",
      mood: null,
      prompt: null,
      tags: [],
      title: "",
      type: "free_write",
      updated_at: "2026-07-04T17:40:00+00:00",
    },
    {
      content: "",
      created_at: "2026-07-04T11:00:00+00:00",
      id: "entry-b",
      mood: null,
      prompt: null,
      tags: [],
      title: "",
      type: "free_write",
      updated_at: "2026-07-04T17:47:54.069+00:00",
    },
  ],
  [
    {
      created_at: "2026-07-04T12:00:00+00:00",
      id: "mood-a",
      mood: "calm",
      updated_at: "2026-07-04T17:42:00+00:00",
    },
  ],
);

assert.equal(
  clientInput,
  serverInput,
  "Client and server snapshots should normalize equivalent timestamps identically.",
);

assert.equal(
  clientInput,
  [
    "entry:entry-a:2026-07-04T17:40:00.000Z",
    "entry:entry-b:2026-07-04T17:47:54.069Z",
    "mood:mood-a:2026-07-04T17:42:00.000Z",
  ].join("|"),
  "Snapshot sources should be sorted deterministically.",
);
