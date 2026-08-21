# RPD Maintainer Tests

RPD keeps one deterministic contract check and three short maintainer dogfood scenarios.

| Test | Purpose | Ordinary TT/ET? |
|---|---|---|
| [Tier 0](test-tier0-static-contracts.md) | Static routing, review, command, version, and simplicity invariants | No; maintainer check |
| [Tier 2](test-tier2-evidence-integrity.md) | Real low-risk, protected, and focused-review behavior | No; explicitly planned only |

The former 13-agent Tier 1 routing matrix was removed. Its durable routing decisions now have static
Tier 0 assertions, while Tier 2 samples the actual behavior that static prose cannot prove.

There is no snapshot hash, verification digest, retained evidence bundle, or exact-prose mirror of
the complete skill. Tests assert decisions and observable outcomes.

Run Tier 0 from the repository root:

```bash
sed -n '/^```sh$/,/^```$/p' .docs/tests/test-tier0-static-contracts.md | sed '1d;$d' | bash
```

Run Tier 2 only when an approved change affects RPD routing or review behavior. Its fixture reviews
are isolated maintainer evidence and never become an ordinary story's TT, ET, AR, CR, or VR rounds.
