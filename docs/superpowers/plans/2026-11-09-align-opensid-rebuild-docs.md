# Align OpenSID Rebuild Documentation Implementation Plan

> **For agentic workers:** Implement this documentation plan in order. Keep each slice small and verify it before proceeding.

**Goal:** Make active project documentation state that the target is an original rebuild of all inventoried OpenSID features except OpenDK-specific functionality and SMS.

**Architecture:** Preserve existing `OS-*` status evidence, clarify that 111 IDs are the current mapped baseline rather than the full target, and document OpenDK/SMS as explicit exclusions. Update authoritative docs first, then pointers and historical-context docs; do not change product code or feature statuses.

**Tech Stack:** Markdown, existing Vitest register-parity test, Prettier.

**Spec:** `docs/superpowers/specs/2026-11-09-opensid-rebuild-scope-design.md`

## Global Constraints

- Include every OpenSID feature found in the source, including optional or disabled modules, after behavior-level inventory.
- Exclude only OpenDK-specific integrations/workflows and all SMS functionality.
- Preserve local village functionality that remains useful without OpenDK.
- Treat the 111 existing catalog IDs as the current mapped baseline, not the total target.
- Keep feature status unchanged unless code and test evidence changes; this task changes documentation only.
- Source snapshot: OpenSID `v2607.0.1`, commit `661a8884a8d02c26b1877d1cdddda0a06dd41361`, dated 2026-07-24.
- Do not delete existing specs, research notes, or archived documents.

## Review Focus

- Existing status counts remain 57 ✅, 54 🟡, 0 🔴, and 0 ⚪ for the current 111 feature IDs; keep baseline and exclusion counts distinct.
- Scope language must not turn OpenDK-only sync/export/message workflows into local product requirements, nor exclude local reports/data that function without OpenDK.
- No wording may imply SMS, OpenDK, email, WhatsApp, or TTE statuses changed during this documentation-only task.
- Historical research and archived docs must not be presented as active scope/status authority.
- Internal links and register/catalog ID parity continue to pass.

---

### Task 1: Correct the authoritative scope and status definitions

**Files:**
- Modify: `docs/KATALOG-FITUR-OPENSID.md`
- Modify: `docs/PARITAS-OPENSID.md`
- Modify: `src/db/paritas-register.test.ts` only if explicit exclusion records require a distinct, accurately tested catalog/register convention.

**Interfaces:**
- The current `OS-*` feature rows remain status-bearing requirements.
- OpenDK and SMS exclusions must be separately and unambiguously identifiable without counting them as completed/in-progress target features.

- [ ] Update catalog purpose, source snapshot metadata, inventory method, explicit exclusions, and 111-ID baseline language.
- [ ] Update parity scope, counts, and completion criteria without changing per-feature implementation statuses.
- [ ] Run the focused parity-register test and resolve any real catalog/register inconsistency without weakening assertions.

### Task 2: Align roadmap and repository-facing instructions

**Files:**
- Modify: `docs/RENCANA-PERBAIKAN.md`
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/ARCHITECTURE.md` only where its scope reference needs clarification.

**Interfaces:**
- Roadmap refers to a complete audited inventory, not “all 111 IDs” as the final product.
- New feature work references the catalog’s inclusion/exclusion policy and existing per-ID evidence.

- [ ] Replace claims that uncatalogued OpenSID features are out of scope.
- [ ] State the agreed OpenDK/SMS exceptions and preserve local independent behavior.
- [ ] Keep historical status counts clearly dated and marked as the current mapped baseline.

### Task 3: Repair documentation navigation and historical-source references

**Files:**
- Modify: `docs/README.md`
- Modify: `docs/riset/README.md`
- Modify: `docs/riset/LAMPIRAN-09-INTEGRASI-KEAMANAN.md` only where its optional-service wording conflicts with active scope.
- Modify: `docs/superpowers/specs/2026-11-09-close-catalog-gaps-design.md` to mark it superseded, not delete it.
- Modify: `docs/superpowers/specs/2026-11-09-opensid-rebuild-scope-design.md` if implementation decisions need recording.

- [ ] Identify authoritative scope, status, roadmap, and architecture documents in the navigation map.
- [ ] Replace the stale local Linux source path with the verified source snapshot identity.
- [ ] Add approved design and this plan to the documentation index.
- [ ] Mark the earlier 111-ID-only design as superseded by the approved scope design.

### Task 4: Validate the documentation-only change

**Files:** All files modified by Tasks 1–3.

- [ ] Run `npm run test -- src/db/paritas-register.test.ts`.
- [ ] Run `npx prettier --check` on changed Markdown files.
- [ ] Search active docs for contradictory scope claims and old source paths.
- [ ] Check the final diff to confirm no feature-status claims or product code changed.
