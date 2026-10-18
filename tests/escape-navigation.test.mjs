import test from "node:test";
import assert from "node:assert/strict";
import { nextEscapeAction } from "../escape-navigation.js";

test("first Escape releases the pointer without leaving the corridor", () => {
  assert.deepEqual(
    nextEscapeAction({ started: true, memoryViewerActive: false, escapeStage: 0 }),
    { action: "release-pointer", escapeStage: 1 }
  );
});

test("second Escape exits the corridor after the pointer was released", () => {
  assert.deepEqual(
    nextEscapeAction({ started: true, memoryViewerActive: false, escapeStage: 1 }),
    { action: "exit-corridor", escapeStage: 0 }
  );
});

test("Escape closes the 3D memory viewer before changing corridor state", () => {
  assert.deepEqual(
    nextEscapeAction({ started: true, memoryViewerActive: true, escapeStage: 1 }),
    { action: "close-memory", escapeStage: 0 }
  );
});
