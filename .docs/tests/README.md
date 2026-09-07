# RPD Maintainer Tests

RPD keeps one deterministic package/protocol check and focused maintainer dogfood scenarios.

| Test | Purpose | Ordinary TT/ET? |
|---|---|---|
| [Tier 0](test-tier0-static-contracts.md) | Package, version, commands, paths, links, and review protocol | No; maintainer check |
| [Tier 2](test-tier2-evidence-integrity.md) | Routing, file headers, review reuse, and AR/SS behavior | No; explicitly planned only |
| [SS checkpoints](test-tier2-ss-checkpoints.md) | Milestone commits, review scope, opt-out, and final GC | No; explicitly planned only |

Tier 0 checks structure and protocol, not the semantics of instructions. Independent review and
Tier 2 check decisions and observable outcomes; neither a matching phrase nor a few passing scenarios
prove all behavior. Ordinary wording and document length are not test assertions.

Run Tier 0 from the repository root:

```bash
sed -n '/^```sh$/,/^```$/p' .docs/tests/test-tier0-static-contracts.md | sed '1d;$d' | bash
```

Run Tier 2 only when an approved change affects RPD routing or review behavior. Its fixture reviews
are isolated maintainer evidence and never become an ordinary story's TT, ET, AR, CR, or VR rounds.
