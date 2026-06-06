# AI IDE Implementation Rules

1. The AI IDE must strictly follow the current active phase document (`docs/planning/phase_1_mvp.md`). Do not implement features from future phases.

2. Do not change the selected tech stack or data structures without asking.

3. Keep the styling scope strictly to mobile-first responsive (mobile + desktop).

4. **Session Handover Rule (CRITICAL):** Before stopping a task or ending a session, the AI IDE MUST create or update a file named `docs/planning/handover.md`. This file must contain:
   - Current Status (What is currently working).
   - Last Modified Files.
   - The exact next logical task to execute based on the Milestones.

5. **End-of-Day Handover (CRITICAL):** When pausing work mid-day or at end-of-day, the AI MUST update `docs/planning/handover.md` with:
   - What was accomplished today.
   - Where work stopped (exact state).
   - What to pick up next.

6. **Phase Completion Rule (CRITICAL):** When completing all tasks in a phase, the AI MUST:
   - Update `docs/planning/handover.md` with completion summary.
   - Run `rtk git add .` and `rtk git commit -m "feat: complete Phase X — <summary>"`.
   - Verify the build passes before committing.

7. Start any new session by reading `docs/planning/handover.md` if it exists.
