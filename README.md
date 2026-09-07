# RPD - Requirements, Planning, and Development Workflow

An AI agent skill that provides a structured workflow for requirements, planning, architecture review, implementation, verification, review, documentation, E2E execution, and commit. Works with Claude Code, Cursor, Copilot, Codex, Windsurf, Cline, Aider, and other AI coding tools.
![Diagram of RPD routing a request by risk: a direct path that implements, tests, and stops after code review, and a planned path that runs REQ, AP, AR, SS with code review, TT, ET, VR, and DD; below them the full RPD sequence through GC, and the `!!` restart path that stops at DD without GC.](rpd-loop.png)

RPD gives you 12 workflow commands you can use in conversation to drive a systematic development process.

**Version:** `3.11.0`

The installable [skills/rpd/SKILL.md](skills/rpd/SKILL.md) is the normative workflow contract. This
README explains why RPD exists and how to use it.

## Why RPD

1. **Fast to invoke**: two- and three-letter command keywords keep prompts short and reduce friction during implementation, review, and iteration.
2. **Built on context engineering and spec-driven development**: spec-driven development helps you start correctly; RPD helps you finish correctly and improve the project's working context over time.
3. **PDCA-compatible with review gates**: the workflow follows a Plan-Do-Check-Act shape and adds explicit review gates as safety rails before work moves forward.
4. **Creates a searchable project knowledge base**: requirements, plans, tests, and completion notes accumulate into documentation that reduces technical debt and long-term context loss.
5. **Preserves intent alongside code history**: combining the history of intent with the history of code gives humans and AI agents a stable map of what the team meant, making the system easier to hand off, extend, and change safely over time.
6. **Safer incremental change**: separating requirements, planning, implementation, testing, and review reduces the chance of skipping key checks or jumping from idea straight into risky code changes.
7. **Better onboarding and recovery**: when work is interrupted or handed to a new contributor, the requirement, plan, test, and done docs make it much easier to resume with the right context.
8. **Simple to learn and use**: the command set is small, the stages are easy to remember, and the workflow is straightforward enough to adopt without heavy process overhead.

## Quick Start

```text
Install RPD skill from GitHub yysun/rpd
```

The installable skill lives in `skills/rpd/`. Repository documentation, the workflow diagram, and everything under `.docs/` stay outside that directory and are not copied into client skill installations.

This repository uses RPD on itself: its requirements, plans, and maintainer checks are tracked in git under `.docs/`, following the same artifact paths the skill writes in any project. The compact maintainer suite lives under `.docs/tests/`.

Maintainers: test instructions live in [.docs/tests/README.md](.docs/tests/README.md).

## Workflow

### 1. Recommended: Full RPD workflow

Use `RPD` as the default for feature work when you want the workflow to carry a requirement through
planning, implementation, verification, documentation, and commit. It runs automatic review loops for
architecture, code, and requirement completion without pausing for human approval between stages,
except for clarification, blockers, destructive actions, or external writes.

```text
RPD Implement JWT authentication
```

Sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`

`*` means the review or completion stage loops until no major issues remain. `?` means the stage runs only when the current story has a matching E2E test spec. `AP` creates or updates the E2E spec when the story needs one. `RPD` must not enter `SS` until `AR` has reviewed REQ, AP, and any E2E spec, fixed blocking doc/spec flaws in place, and explicitly reported an AR pass.

Create E2E specs for executable user flows, observable public or external boundaries, and
regression-prone critical paths. Skip them for pure internals without such a surface unless requested.
Each scenario must define its initial conditions, ordered executable actions, and observable expected
outcomes. Given/When/Then suits compact behaviors; numbered steps suit longer multi-step flows.

### 2. Targeted command workflow

Use an individual command when you want to run or resume a particular stage instead of starting the
complete workflow. For example, start requirement work with:

```text
REQ Implement JWT authentication
```

Follow with `AP` to create the architecture plan and needed E2E specs, `AR` to review and fix blocking
requirement, plan, or E2E spec flaws, `SS` to implement step-by-step, `TT` to run unit and integration
tests and fix failures, `CR` to review code, `ET` to execute and fix applicable story E2E scenarios,
`VR` to verify requirement completion, `DD` to document completed work, and `GC` to commit.

Typical sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`

`SS` automatically saves complete, independently revertible implementation milestones as local
commits, records verification status, and continues. These commits do not establish acceptance,
replace CR/TT/ET/VR, or push. CR reviews the whole story from its recorded Git base, including both
milestone commits and remaining changes. GC finalizes delivery with any work still uncommitted.
An explicit instruction not to commit overrides SS checkpointing.

`AP` should be proportional to the work. A useful plan records the relevant goal, context, decisions,
ordered executable checkbox tasks, validation, and real risks. It has no mandatory phase count. Each
task should name a concrete file, behavior, artifact, or command so `SS` can execute it without
rediscovering the architecture. AR, CR, VR, DD, GC, staging, and committing are workflow stages or
delivery actions, not plan tasks.

`AR` challenges weak or unclear requirements and plans instead of merely checking completeness. When
a consequential choice remains, it offers viable options with real tradeoffs, recommends one, asks
only what is necessary, and stops once the plan is clear enough to implement.

### 3. Automatic routing for ordinary requests

You do not need a workflow command for every request:

- Explanation, diagnosis, review, requirements, and planning requests stay read-only.
- A clear request to implement or fix something authorizes implementation without a special command.
- Clear, localized, reversible work with straightforward verification takes the direct path: implement,
  verify, and stop after CR. A narrow protected-surface edit does not escalate merely because of its
  location.
- Material protected-boundary changes, coordinated cross-component design, difficult rollback,
  significant blast radius, or consequential uncertainty remaining after focused inspection take the
  planned path through DD. Explicit `RPD` is the only unconditional full-process trigger and continues
  through GC.
- Explicit commands select their named stage; the installable skill defines the exact authorization
  and risk rules.

### 4. Correct and restart the current story: `!!`

Use `!!` when a requirement changes after a story already exists:

```
!! SSO is enterprise-only; remove the fallback login flow
```

The command reconciles the latest correction across the current story's REQ, AP, and E2E spec. It removes contradictions, reopens acceptance criteria and plan tasks whose evidence is stale, invalidates the previous AR pass, and then runs `AR* → SS(+CR*) → TT → ET? → VR* → DD`.

`!!` is approval to continue through implementation and documented completion after AR passes,
including SS milestone commits. It does not run final GC; invoke GC separately to finalize delivery.
It also stops when no current story can be identified, when the target story is ambiguous, or for
the same blockers, destructive actions, and external writes that pause RPD.


## Artifact paths used by the RPD workflow

```
.docs/
├── reqs/{yyyy}/{mm}/{dd}/req-{name}.md
├── plans/{yyyy}/{mm}/{dd}/plan-{name}.md
├── tests/test-{name}.md  # optional existing E2E spec
└── done/{yyyy}/{mm}/{dd}/{name}.md
```
`{name}` is a short kebab-case story slug (for example: `user-auth`, `offline-sync`) reused across related docs and commands. If omitted, the skill derives one from the requirement or task description, announces it, and continues unless the slug is ambiguous, collides with an unrelated story, or could attach work to the wrong docs.

REQ, AP, and DD keep the date from when the doc was first created; later updates modify the existing doc in place. E2E test specs are created during AP when needed, then reused by ET.

The **current story** — what `!!`, `VR`, and mid-sequence `RPD` operate on — is the story you name, otherwise the one already worked on in the session, otherwise the REQ doc with the most recent creation or substantive content change. Checkbox-only edits, such as `VR` acceptance updates, do not make an older story current, and the skill asks when two stories are equally plausible.

## Commands Reference

| Command | Purpose |
|---------|----------|
| `REQ` | Document requirements |
| `AP` | Create architecture plan and needed E2E specs; then trigger the required AR gate |
| `AR` | Review architecture and fix blocking requirement, plan, or E2E spec flaws before implementation |
| `SS` | Implement the plan and save local milestone commits |
| `TT` | Run unit and integration tests and fix failures |
| `ET` | Run E2E tests and fix failures |
| `CR` | Code review |
| `VR` | Verify the requirement is fully implemented in code and docs; if not, refine AP, run SS, CR, TT, ET when applicable, update docs, then verify again |
| `DD` | Document completed work and preserve the complete final VR result |
| `GC` | Finalize delivery and commit remaining story changes |
| `!!` | Reconcile the current story, restart through verified DD, and stop before GC |
| `RPD` | Full end-to-end flow with AR, CR, and VR loops |

## Working context and verification

File headers help a new agent locate responsibilities, important constraints, and design reasons.
RPD reuses existing module documentation and updates it when those facts change. Source edits do
not need a running change log in the header; Git records that history.

Review independence and reviewer reuse keep implementation assumptions from carrying unchecked into
review. Results expose risk, review round, reviewer reuse, material findings, and a clear verdict.
Acceptance verification ties completion to evidence; DD preserves the final VR result verbatim so a
later contributor can see what was actually established.

Reviews follow the story base and relevant inputs rather than freezing the entire repository.
Unrelated work and commits preserving reviewed inputs and scope leave existing conclusions valid.
Material input changes need affected-area reassessment; expanded scope, protected-boundary changes,
uncertain reach, or a different reviewer require full review. Reviewers remain read-only.

The skill is the single source for [authorization and risk routing](skills/rpd/SKILL.md#intent-and-routing),
[review rules](skills/rpd/SKILL.md#review-contract), [file headers](skills/rpd/SKILL.md#file-comment-blocks),
and [stage contracts](skills/rpd/SKILL.md#commands). Maintainer validation is documented separately in
[the test guide](.docs/tests/README.md).

## License

MIT
