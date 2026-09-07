# Compact RPD Skill

## Problem

RPD repeats permissions, review timing, and verification ownership across sections and mirrors much
of its contract in README. Literal-prose tests make equivalent edits look like regressions. File
headers help agents start without prior context, but per-edit change notes create stale documentation.

## Requirement

Shorten the single-file skill while preserving its workflow decisions. Keep file headers as a map of
responsibilities, important constraints, and design reasons; reuse existing module documentation and
update it only when those facts change. Remove the requirement to record recent edits in headers.

## Acceptance Criteria

- [x] The skill is materially shorter than the 2,197-word baseline, remains self-contained, and defines
      each shared rule once where practical. Compression must not omit a workflow guarantee.
- [x] All 12 commands, intent-based authorization, risk routing, stage endpoints, AR's execution ban,
      SS/CR/TT/ET responsibilities, independent review and reuse, exact review disclosures/verdicts,
      evidence-backed VR, final VR preservation in DD, and GC scope remain intact.
- [x] Source edits retain useful file headers describing responsibilities, constraints, and design
      reasons. Existing equivalent module documentation is reused; updates follow semantic changes
      to that description, not every source edit. Headers omit code inventories and change histories.
- [x] README preserves the product argument and four usage paths while linking to the normative
      contract instead of maintaining a second detailed rule set. Version and changelog agree.
- [x] Static checks cover package structure and actual protocol literals without locking ordinary
      explanatory wording. Behavioral validation covers low-risk routing, AR-to-SS feasibility,
      reviewer reuse, and the new header behavior; independent CR checks the final contract.
- [x] Skill validation, static checks, focused behavioral evidence, and diff checks pass. The global
      installation remains a symlink to this repository's skill.

## Constraints and Non-Goals

- The only intended workflow behavior change is the file-header policy agreed in the conversation.
- Do not add a GPT-6 mode, new commands, fixed word limits, new approval gates, or auxiliary runtime
  files. Do not commit or publish.
- Preserve evidence limits, conditional feasibility commitments, and primary-agent ownership of edits.

## Open Questions

None.
