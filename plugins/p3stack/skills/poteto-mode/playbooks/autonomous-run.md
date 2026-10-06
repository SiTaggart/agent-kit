### Autonomous run

Read the installed plugin's [RUNTIME.md](../../../RUNTIME.md) first. Its native tool, model, path, and session-authorization rules apply. The user merges; this port never merges, enables auto-merge, or enters a merge queue.

**You own the exit condition. Define done, then drive to it without stopping.**

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N PRs verified and merge-ready, pixel-diff zero).
2. Pick the wake mechanism using host-native scheduling for an authorized recurring run, or bounded waits during the current turn, per RUNTIME.md. An event to watch (CI, a merge, a ref advancing) gets a watcher subagent that wakes you on the event, with a long time-based heartbeat as fallback. No event gets a fixed-interval heartbeat sized to when the result is worth re-checking.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits if it advanced and committing is within session authorization, removes only its own changes that did not help while preserving user edits. Belt-and-suspenders that "might help" gets reverted, not left to ride.
   Sequence the work via the **sequence-verifiable-units** principle skill, verifying each unit before the next instead of batching checks at the end.
4. Mid-run discoveries within the authorized program are yours. Address broken skills, related bugs, flaky verifiers, review noise, tooling failures, orphaned follow-ups, and fixable drift yourself via poteto-mode when the session authorizes that scope. Put authorized out-of-band fixes in their own PR; record unrelated discoveries for the user without silently expanding the task. Do not park reversible work for the human or use the available user-input tool. Surface only irreversible actions, genuine product or preference calls no experiment can settle, or a real dead end. Keep the predicate as the main drive, and return to it after each side fix.
5. Checkpoint every iteration via the **show-me-your-work** skill, a row for what changed and whether the predicate moved.
6. Stop when the predicate is met. A plateau is not a stop, so keep going and pivot your approach to push past it. Surface a genuine dead end rather than spinning, and never relax the predicate to declare victory.

**Reply:** the exit condition, iterations run, what landed, what was discarded, final predicate state.
