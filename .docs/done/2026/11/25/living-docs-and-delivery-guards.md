# Living Docs and Delivery Guards

## Summary

- RPD 3.12.0 separates living docs (current behavior; top-level `.docs/*.md` by default plus anything
  the `.docs/README.md` index or project instructions list) from story records. Later stories change
  earlier records only with a one-line superseded note; earlier records are history to confirm against
  code and living docs.
- REQ names superseded documents and changed living docs; AP adds tasks to update those living docs so
  CR and VR review them; DD marks superseded documents and maintains the index only when a living doc
  is added, superseded or changes status; `!!` reopens affected living-doc tasks.
- AP and AR identify one-way changes. SS stops once for approval before editing one the user has not
  specifically requested or approved, even in explicit RPD, while independent work continues.
- A skipped, removed or replaced planned check cannot pass without the user's approval; plan or REQ
  edits are not approval. CR blocks retired test guarantees without replacements. SS updates the plan
  before continuing after a departure and reaches a consistent point before stopping midway through a
  hard-to-undo step.
- Motivated by a Shiqu retrospective (0.14 → 0.17).

## Verification

- Tier 0 passed after the final edits.
- `~/.agents/skills/rpd` resolves to this repository's `skills/rpd/`.
- AR: 3 rounds, independent reviewer. Round 1 blocked (DD-only living-doc updates, plan-update loophole
  for skipped checks, deleted-tests exception needing a REQ); round 2 blocked ("frozen after DD"
  contradicted `!!`); round 3 passed.
- CR: 2 rounds, independent reviewer. Round 1 passed with six non-blocking findings, all fixed; round 2
  passed.
- Final VR result:

> **Living docs**
> - **Complete — definition of living docs and story records:** lines 59-65 cover the default location, the index, story records, superseded-only edits by later stories, in-place updates for `!!` and reruns, reading the index first, the history rule and report-only conflicts.
> - **Complete — REQ names superseded and changed docs:** lines 114-115.
> - **Complete — AP tasks, DD marking and lazy index:**
>   - AP adds tasks for changed living docs (122).
>   - Because they are SS tasks, CR (171) and VR (AP tasks must be complete) check them.
>   - DD marks superseded documents and updates the index only on add, supersede or status change (193-194).
>   - No one-time audit is required.
> - **Complete — CR stale-docs check:** lines 171-172.
> - **Complete — `!!` reopens living-doc tasks:** line 202.
>
> **Delivery guards**
> - **Complete — one-way changes:**
>   - AP identifies them (122-123) and AR reviews them (130).
>   - SS stops once even in explicit RPD, treats it as missing authorization and continues independent work (147-149).
>   - A one-way change found during SS goes back to AR (149-150).
> - **Complete — skipped or removed checks:** line 98 onward covers approval only in conversation or project instructions, and the required report naming the claim, who is affected, potential loss and recovery path.
> - **Complete — deleted or rewritten tests:** lines 172-173.
> - **Complete — plan updated before continuing after a departure:** lines 144-145.
> - **Complete — stopping partway through a hard-to-undo step:** lines 150-152. It applies to any stop or yield, so it covers blockers, context limits and user stops.
>
> **Package**
> - **Complete:**
>   - Version 3.12.0 in SKILL.md:10, README:8 and CHANGELOG:11.
>   - README (18, 44, 123, 130-131) and CHANGELOG match the skill.
>   - Tier 0 passed (re-run this round).
>   - `~/.agents/skills/rpd` points to `/Users/esun/Documents/Projects/rpd/skills/rpd`, checked in round 1.
> - All seven plan tasks are checked off, and the evidence matches.
>
> **What was not verified:** Tier 2 was not run. The constraints that ordinary and low-risk runs gain no new stops were checked only by reading the text, and no fixture run exercises the new stop conditions. The REQ checkboxes are still unticked; the primary agent should tick them.
>
> VR risk: non-low — consumer-facing workflow contract adds stop conditions and review blocking rules
> VR review round: 1; reviewer: reused
> VR passed: all acceptance criteria complete

## Notes

- After VR, the REQ checkboxes were ticked, the SS paragraph was reflowed, and REQ and plan wording was
  aligned with the reviewed skill text; no rule changed.
- Two REQ criteria were adjusted during CR to remove an internal inconsistency: CR checks living docs
  only (superseded notes and the index happen in DD), and the deleted-tests exemption requires the
  user's request or approval. The user has not separately reviewed these adjustments.
- Evidence limit: Tier 2 fixture runs were not performed, so "no new stops on ordinary and low-risk
  runs" rests on review of the text.
- Because `~/.agents/skills/rpd` and `~/.claude/skills/rpd` link to this repository, the new rules
  apply to every project as soon as the files change, before any push or release.
