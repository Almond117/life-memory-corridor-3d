export function nextEscapeAction({ started, memoryViewerActive, escapeStage }) {
  if (!started) return { action: "none", escapeStage: 0 };
  if (memoryViewerActive) return { action: "close-memory", escapeStage: 0 };
  if (escapeStage === 0) return { action: "release-pointer", escapeStage: 1 };
  return { action: "exit-corridor", escapeStage: 0 };
}
