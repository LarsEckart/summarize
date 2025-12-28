---
summary: "Refactor guide: unify CLI + daemon override parsing."
---

# Refactor: Config Overrides Unification

Goal: single override parser for CLI + daemon.

## Steps
- [x] Inventory override paths.
  - Files: `src/run/run-settings.ts`, `src/daemon/request-settings.ts`.
- [x] Define shared override input type.
  - Flags + raw request fields + config defaults.
- [x] Create shared resolver.
  - New `resolveRunOverrides()` signature to cover both paths.
- [x] Migrate daemon.
  - Remove duplicate parsing in `request-settings`.
- [x] Migrate CLI.
  - Ensure identical precedence.
- [x] Add precedence tests.
  - Flag vs config vs request.
- [x] Verify behavior in smoke tests.

## Done When
- No duplicate override parsing.
- Tests cover precedence and defaults.

## Tests
- `pnpm -s test tests/daemon.request-settings.test.ts tests/cli.run.arg-branches.test.ts`
