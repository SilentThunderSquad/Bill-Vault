---
phase: 01
slug: db-storage-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-20
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- src/tests/security/` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- src/tests/security/`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DBST-01 | integration | `npm test -- -t "RLS enabled"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | DBST-02 | integration | `npm test -- -t "Owner-Only access"` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | DBST-03 | integration | `npm test -- -t "Storage policies"` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | DBST-04 | integration | `npm test -- -t "Audit triggers"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/tests/security/rls.test.ts` — stubs for DBST-01, DBST-02
- [ ] `src/tests/security/storage.test.ts` — stubs for DBST-03
- [ ] `src/tests/security/audit.test.ts` — stubs for DBST-04
- [ ] `vitest` and `@supabase/supabase-js` installation in dev dependencies

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Malware scan rejection | DBST-03 | Requires Cloudmersive API interaction | Upload a dummy "EICAR" test file and verify deletion/rejection. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

---
