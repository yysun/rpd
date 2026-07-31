# E2E Scenarios: Intent-Based RPD Routing

## Purpose

Prove that ordinary natural-language requests route by implementation intent and concrete risk, while explicit workflow commands retain their own stage scope. All execution cases use isolated temporary Git repositories created from the deterministic fixtures under `fixtures/intent-based-routing/`.

## Common Execution Procedure

1. Run setup and every assertion block with Bash fail-fast semantics: `set -euo pipefail`.
2. Resolve the temporary base with `RPD_TMP_ROOT="${RPD_TMP_ROOT:-${TMPDIR:-/tmp}}"`, then create one unique temporary root with `E2E_ROOT="$(mktemp -d "${RPD_TMP_ROOT%/}/rpd-intent-routing-e2e.XXXXXX")"`, export it, and record the absolute value. Set `RPD_TMP_ROOT` explicitly to override the default base.
3. For each case below, create `E2E_ROOT/<case>`, copy the named fixture with `cp -R "FIXTURE_ROOT/." "E2E_ROOT/<case>/"` so dotfiles such as `.gitignore` are preserved, and copy the revised repository `skills/rpd/SKILL.md` to `E2E_ROOT/<case>/SKILL.md`. Replace `FIXTURE_ROOT` and the destination with their absolute paths before running the command.
4. Initialize an isolated Git repository in each case, configure the synthetic identity `RPD Test <rpd@example.invalid>`, add every seeded file, and commit with message `seed routing fixture`. Save `git -C "E2E_ROOT/<case>" rev-parse HEAD` as `E2E_ROOT/<case>-seed-sha.txt`.
5. Replace the literals `CASE_ROOT`, `EVIDENCE_ROOT`, `CASE_NAME`, and `COMMIT_POLICY` in the case prompt and fixed evidence suffix with that case's absolute path, the absolute `E2E_ROOT`, the case name, and the case's commit policy before dispatch. For `public-api-bug`, `security-fix`, `external-contract`, and `bang-restart`, use `Follow only the selected route's commit authorization; this evidence contract neither requires nor forbids GC.` For every other case, use `Do not commit.` Append the resolved evidence suffix and save the fully resolved prompt with exactly one terminal file-storage LF as `E2E_ROOT/<case>-prompt.txt`. Start one fresh execution agent per case with no inherited conversation when supported, otherwise with the runtime's smallest task-local context. Give it only the resolved prompt, isolated case root, copied skill, and evidence contract; never reuse an execution agent across cases. Dispatch the bytes before the storage LF as its exact user message.
6. Reserve reviewer capacity for every execution case that requires AR, CR, or VR. Use the current runtime's collaboration/subagent surface and require independent reviewers to work read-only. After each reviewer completes, require the implementation agent to save the reviewer final response verbatim outside the case repository as `EVIDENCE_ROOT/CASE_NAME-<phase>-review-<attempt>.log`, numbering attempts by completion order with zero-padded integers. Preserve blocked attempts; the highest attempt number is terminal. Before replying, require the implementation agent to save the exact text of its own final response as `EVIDENCE_ROOT/CASE_NAME-result.log`.
7. Immediately before each reviewer is spawned, have the implementation agent compute the stage-aware stable snapshot hash defined below, save it as `EVIDENCE_ROOT/CASE_NAME-PHASE-snapshot-<attempt>.txt` using the same zero-padded attempt number as the review log, and include it in the reviewer input. Require the reviewer to recompute that phase's hash, compare initial and final Git state, and end with the fixed evidence fields below. A review attempt is invalid if its initial hash differs from the supplied hash or its final hash/state differs from its initial state.
8. For AR, require at least one passing review attempt whose evidence shows that `src/**` and `test/**` had no changes and the verification digest was absent; this is the observable pre-implementation gate available from the current collaboration surface. Also require the terminal AR attempt to pass the current plan. A completion-loop plan repair may legitimately rerun AR after implementation, so a later terminal attempt may report source/test changes without erasing proof of the earlier gate. For a blocked AR, require the terminal decision to block and require no source/test changes. For VR, scope completion-order evidence to the current story's `{name}.md`: when no matching completion document is tracked at `HEAD`, require it to remain absent and report `Completion document before VR decision: ABSENT`; when a matching document is tracked at `HEAD`, require it to remain byte-identical to `HEAD` and report `Completion document before VR decision: UNCHANGED`. A new or modified matching completion document before the terminal VR decision blocks the review. Unrelated historical completion documents do not affect this check.
9. For CR, include `.verification-ran` in the stable snapshot. The fixture creates that ignored marker only after `node --test` succeeds and stores a SHA-256 digest of the current `package.json`, `src/**`, and `test/**` inputs. Require the terminal CR reviewer to recompute the digest read-only with `node scripts/verification-digest.js`, report a match, and review a snapshot whose hash equals the final CR-stage case snapshot hash. The shared `snapshot_hash` function normalizes REQ acceptance markers for every stage and AP task markers inside `## Phased Tasks` for AR/CR only; VR retains raw AP markers. It excludes `.docs/done` because DD runs after review. A later source, test, plan-content, E2E spec, test-command, or non-checkbox requirement change invalidates the snapshot evidence.
10. Before the test operator runs any verification command, require `.verification-ran` for cases that should implement. Only then may the operator rerun `npm test`.
11. Before inspecting working-tree changes, require the current `HEAD` to equal the saved seed SHA. Then run the case's remaining assertions, including its uncommitted path allowlist when it changes files. Any non-zero command fails the scenario immediately.
12. Temporary repositories, resolved prompts, reviewer logs, result logs, and sentinels are disposable. Report their absolute root but do not copy them into the source repository.

Fixed evidence suffix:

```text
COMMIT_POLICY The evidence root is EVIDENCE_ROOT and the case name is CASE_NAME. Select workflow stages only from the request and `CASE_ROOT/SKILL.md`; this evidence contract is conditional and does not require or authorize AR, CR, or VR. A direct-path implementation ends after CR, and a read-only or stage-scoped request must not add review stages that its selected route does not own. Before each AR, CR, or VR reviewer that the selected route actually requires is spawned, set `RPD_REVIEW_PHASE` to that phase and compute its stable snapshot hash with this exact command from any working directory: `(cd CASE_ROOT && (find . \( -path './.git' -o -path './.docs/done' \) -prune -o -type f -print0 | sort -z | while IFS= read -r -d '' file; do printf '%s\0' "$file"; if [[ "$file" == ./.docs/reqs/* ]]; then perl -pe 's/^- \[[ x]\]/- [ ]/' "$file"; elif [[ "${RPD_REVIEW_PHASE}" != VR && "$file" == ./.docs/plans/* ]]; then perl -pe 'if (/^## Phased Tasks$/) { $in_tasks = 1 } elsif ($in_tasks && /^## /) { $in_tasks = 0 } if ($in_tasks) { s/^- \[[ x]\]/- [ ]/ }' "$file"; else cat "$file"; fi; printf '\0'; done) | shasum -a 256 | awk '{print $1}')`. Save the supplied hash as `EVIDENCE_ROOT/CASE_NAME-<phase>-snapshot-<attempt>.txt`, substituting the current phase and using the review attempt's zero-padded number; include it in the reviewer input, and ask the reviewer to recompute it with the same phase and command. REQ acceptance markers are normalized for every phase. AP task markers inside `## Phased Tasks` are normalized for AR/CR only; VR retains raw AP markers. `.docs/done` is excluded because DD runs after review. Any other requirement, plan-content, E2E, source, test, command, or artifact change alters the hash. The ignored `CASE_ROOT/.verification-ran` file must be absent during AR. The fixture writes it only after `npm test` succeeds; its content is the SHA-256 digest of the current `package.json`, `src/**`, and `test/**` inputs. During CR and VR, require the reviewer to run this exact read-only comparison: `test "$(tr -d '\n' < CASE_ROOT/.verification-ran)" = "$(cd CASE_ROOT && node scripts/verification-digest.js)"`. Report `Verification digest: MATCH` only when that command exits 0; report `MISMATCH` when it exits non-zero, and `ABSENT` when the marker does not exist. `Source/test changes` describes whether the reviewed snapshot has Git-visible `src/**` or `test/**` changes relative to `HEAD`; it does not describe whether the reviewer mutated files. `Snapshot unchanged` separately records that the reviewer left the snapshot unchanged. Before a VR decision, resolve the current story's `{name}.md` under `CASE_ROOT/.docs/done`. If no matching path is tracked at `HEAD`, require no matching file in the working tree and report `Completion document before VR decision: ABSENT`. If one matching path is tracked at `HEAD`, require it to be byte-identical to `HEAD` and report `Completion document before VR decision: UNCHANGED`. Block VR if the matching completion document is new or modified before the decision; ignore unrelated done docs. Put the completion-document evidence line before the acceptance-criteria matrix. Require the VR reviewer to include the acceptance-criteria evidence matrix before the fixed evidence block. Ask every reviewer to end its response with exactly these six lines:
`Phase: AR`, `Phase: CR`, or `Phase: VR`
`Decision: PASS` or `Decision: BLOCK`
`Snapshot: <64-lowercase-hex SHA-256>`
`Source/test changes: NONE` or `Source/test changes: PRESENT`
`Verification digest: MATCH`, `Verification digest: MISMATCH`, or `Verification digest: ABSENT`
`Snapshot unchanged: YES` or `Snapshot unchanged: NO`
After each reviewer completes, save its final response verbatim before continuing. Use the exact uppercase phase filenames EVIDENCE_ROOT/CASE_NAME-AR-review-<attempt>.log, EVIDENCE_ROOT/CASE_NAME-CR-review-<attempt>.log, and EVIDENCE_ROOT/CASE_NAME-VR-review-<attempt>.log. Number attempts by completion order as 01, 02, and so on. Preserve every blocked attempt. Before replying, save the exact text of your own final response to EVIDENCE_ROOT/CASE_NAME-result.log. In that final response, include the exact line `Verification: PASS — npm test (exit 0)` only if that command actually exited 0. Include the exact line `AR: PASS — no blocking architecture flaws` only after terminal AR passes. Include the exact line `CR: PASS — no major findings` only after terminal CR passes. Include the exact line `VR: PASS — all acceptance criteria complete` only after terminal VR passes. When the selected route runs ET, include `ET: PASS — <matching test filename or repository-relative path>` only after executing the matching Markdown scenarios successfully. For a completed bug-fix implementation, also include non-empty lines beginning `Symptom:`, `Root cause:`, `Affected path:`, `Fix:`, and `Result:`. The test operator will compare these claims with the saved reviewer responses and final repository state.
```

Prepend these helpers to every assertion block that inspects AR, CR, or reviewed snapshots:

```sh
snapshot_hash() {
  local case_root="$1"
  local review_phase="$2"
  (
    cd "${case_root}"
    find . \( -path './.git' -o -path './.docs/done' \) -prune -o -type f -print0 |
      sort -z |
      while IFS= read -r -d '' file
      do
        printf '%s\0' "${file}"
        if [[ "${file}" == ./.docs/reqs/* ]]
        then
          perl -pe 's/^- \[[ x]\]/- [ ]/' "${file}"
        elif [[ "${review_phase}" != VR && "${file}" == ./.docs/plans/* ]]
        then
          perl -pe 'if (/^## Phased Tasks$/) { $in_tasks = 1 } elsif ($in_tasks && /^## /) { $in_tasks = 0 } if ($in_tasks) { s/^- \[[ x]\]/- [ ]/ }' "${file}"
        else
          cat "${file}"
        fi
        printf '\0'
      done
  ) | shasum -a 256 | awk '{print $1}'
}

assert_gwt_scenarios() {
  local scenario_file="$1"
  local minimum_count="$2"
  perl -0777 -e '
    my ($minimum, $path) = @ARGV;
    open my $handle, "<", $path or exit 1;
    local $/;
    my $document = <$handle>;
    my @scenario = ($document =~ /^## Scenario(?=[: \t]|\r?(?:\n|\z))[^\n]*(?:\n|\z)(.*?)(?=^## |\z)/msg);
    exit 1 if @scenario < $minimum;
    for my $scenario (@scenario) {
      my @steps;
      for my $line (split /\n/, $scenario) {
        if ($line =~ /^[ \t]*(?:[-*+][ \t]+|[0-9]+[.)][ \t]+)?(?:\*\*(Given|When|Then):?\*\*[ \t]*:?[ \t]*(.*)|(Given|When|Then)(?:[ \t]+|[ \t]*:[ \t]*)(.*))$/i) {
          my $label = lc($1 // $3);
          my $body = $2 // $4;
          $body =~ s/^\s+|\s+$//g;
          exit 1 unless length $body;
          push @steps, $label;
        }
      }
      my %seen;
      my %rank = (given => 1, when => 2, then => 3);
      my $previous = 0;
      for my $step (@steps) {
        exit 1 if $rank{$step} < $previous;
        $previous = $rank{$step};
        $seen{$step} = 1;
      }
      exit 1 unless $seen{given} && $seen{when} && $seen{then};
    }
  ' "${minimum_count}" "${scenario_file}"
}

assert_public_status_semantics() {
  local scenario_file="$1"
  perl -0777 -e '
    my ($path) = @ARGV;
    open my $handle, "<", $path or exit 1;
    local $/;
    my $document = <$handle>;
    my @scenario = ($document =~ /^## Scenario(?=[: \t]|\r?(?:\n|\z))[^\n]*(?:\n|\z)(.*?)(?=^## |\z)/msg);
    for my $scenario (@scenario) {
      my @step;
      while ($scenario =~ /(?:\A|\n)[ \t]*(?:[-*+][ \t]+|[0-9]+[.)][ \t]+)?(?:\*\*(?:Given|When|Then):?\*\*[ \t]*:?[ \t]*([^\n]+)|(?:Given|When|Then)(?:[ \t]+|[ \t]*:[ \t]*)([^\n]+))/ig) {
        push @step, $1 // $2;
      }
      my @then;
      while ($scenario =~ /(?:\A|\n)[ \t]*(?:[-*+][ \t]+|[0-9]+[.)][ \t]+)?(?:\*\*Then:?\*\*[ \t]*:?[ \t]*([^\n]+)|Then(?:[ \t]+|[ \t]*:[ \t]*)([^\n]+))/ig) {
        push @then, $1 // $2;
      }
      exit 0 if grep(/(?:public|status)/i, @step)
        && grep(/(?:request|call|get)/i, @step)
        && grep(!/\b(?:not|never|no|rejects?|unsupported|unready)\b/i
          && /\A(?:the[ \t]+)?(?:public[ \t]+)?(?:response|status[ \t]+response)\b.*\bstate\b`?[ \t]*(?::|=|is|equals?)[ \t]*["\x27\x60]?ready\b/i, @then);
    }
    exit 1;
  ' "${scenario_file}"
}

assert_security_auth_semantics() {
  local scenario_file="$1"
  perl -0777 -e '
    my ($path) = @ARGV;
    open my $handle, "<", $path or exit 1;
    local $/;
    my $document = <$handle>;
    my @scenario = ($document =~ /^## Scenario(?=[: \t]|\r?(?:\n|\z))[^\n]*(?:\n|\z)(.*?)(?=^## |\z)/msg);
    my (@disabled_index, @enabled_index);
    for my $index (0 .. $#scenario) {
      my $scenario = $scenario[$index];
      my @given;
      while ($scenario =~ /(?:\A|\n)[ \t]*(?:[-*+][ \t]+|[0-9]+[.)][ \t]+)?(?:\*\*Given:?\*\*[ \t]*:?[ \t]*([^\n]+)|Given(?:[ \t]+|[ \t]*:[ \t]*)([^\n]+))/ig) {
        push @given, $1 // $2;
      }
      my @then;
      while ($scenario =~ /(?:\A|\n)[ \t]*(?:[-*+][ \t]+|[0-9]+[.)][ \t]+)?(?:\*\*Then:?\*\*[ \t]*:?[ \t]*([^\n]+)|Then(?:[ \t]+|[ \t]*:[ \t]*)([^\n]+))/ig) {
        push @then, $1 // $2;
      }
      push @disabled_index, $index if grep(!/\b(?:not|never|no|rather|instead)\b/i
        && (/\A(?:an?[ \t]+)?disabled[ \t]+user\b/i
          || /\A(?:an?[ \t]+)?user\b.*\bdisabled\b`?(?:[ \t]+property)?[ \t]+(?:is|equals?|set[ \t]+to)[ \t]+`?true\b`?/i), @given) && grep {
        !/(?:\bnot\b|\bnever\b|\bcannot\b|\b[[:alpha:]]+n.t\b).*?(?:\breturns?\b|\bresult[ \t]+(?:is|equals?)\b)/i
          && /(?:\breturns?\b|\bresult[ \t]+(?:is|equals?)\b)[ \t]+`?false`?/i
      } @then;
      push @enabled_index, $index if grep(!/\b(?:not|never|no|rather|instead)\b/i
        && (/\A(?:an?[ \t]+)?enabled[ \t]+user\b/i
          || /\A(?:an?[ \t]+)?user\b.*\bdisabled\b`?(?:[ \t]+property)?[ \t]+(?:is|equals?|set[ \t]+to)[ \t]+`?false\b`?/i), @given) && grep {
        !/(?:\bnot\b|\bnever\b|\bcannot\b|\b[[:alpha:]]+n.t\b).*?(?:\breturns?\b|\bresult[ \t]+(?:is|equals?)\b)/i
          && /(?:\breturns?\b|\bresult[ \t]+(?:is|equals?)\b)[ \t]+`?true`?/i
      } @then;
    }
    for my $disabled_index (@disabled_index) {
      for my $enabled_index (@enabled_index) {
        exit 0 if $disabled_index != $enabled_index;
      }
    }
    exit 1;
  ' "${scenario_file}"
}

assert_external_contract_semantics() {
  local scenario_file="$1"
  perl -0777 -e '
    my ($path) = @ARGV;
    open my $handle, "<", $path or exit 1;
    local $/;
    my $document = <$handle>;
    my @scenario = ($document =~ /^## Scenario(?=[: \t]|\r?(?:\n|\z))[^\n]*(?:\n|\z)(.*?)(?=^## |\z)/msg);
    my ($v2, $retry) = (0, 0);
    for my $scenario (@scenario) {
      my @then;
      while ($scenario =~ /(?:\A|\n)[ \t]*(?:[-*+][ \t]+|[0-9]+[.)][ \t]+)?(?:\*\*Then:?\*\*[ \t]*:?[ \t]*([^\n]+)|Then(?:[ \t]+|[ \t]*:[ \t]*)([^\n]+))/ig) {
        push @then, $1 // $2;
      }
      $v2 ||= grep {
        !/\b(?:not|never|no|rejects?|unsupported|disabled)\b/i
          && (/\A(?:the[ \t]+)?(?:request[ \t]+)?(?:endpoint|url)\b[ \t]+(?:uses?|targets?|is|equals?)[ \t]+`?(?:https?:\/\/[^ \t`]+\/)?v2(?:\/|\b)/i
            || /\A(?:the[ \t]+)?delivery\b[ \t]+(?:uses?|targets?)[ \t]+`?v2(?:\/|\b)/i
            || /\A(?:the[ \t]+)?delivery\b[ \t]+sends?[ \t]+to[ \t]+`?v2(?:\/|\b)/i)
      } @then;
      $retry ||= grep {
        !/\b(?:not|never|no|rejects?|unsupported|disabled|disallowed|forbidden|zero)\b/i
          && (/\A(?:the[ \t]+)?(?:delivery(?:[ \t]+request)?|request|webhook|service|implementation)\b[ \t]+(?:preserves?|enables?|keeps?|maintains?|uses?)[ \t]+(?:the[ \t]+)?retr(?:y|ies)\b/i
            || /\A(?:the[ \t]+)?(?:delivery(?:[ \t]+request)?|request|webhook|service|implementation)\b[ \t]+allows?[ \t]+(?:(?:[0-9]+|one|two|three|four|five)[ \t]+)?retr(?:y|ies)\b/i
            || /\Aretr(?:y|ies)\b(?:[ \t]+behavior)?[ \t]+(?:is|are)[ \t]+(?:preserved|allowed|enabled|maintained)\b/i)
      } @then;
    }
    exit($v2 && $retry ? 0 : 1);
  ' "${scenario_file}"
}

terminal_review_log() {
  local case_name="$1"
  local phase="$2"
  find "${E2E_ROOT}" -maxdepth 1 -type f -name "${case_name}-${phase}-review-[0-9][0-9].log" |
    sort |
    tail -n 1
}

assert_no_review_phase() {
  local case_name="$1"
  local phase="$2"
  test -z "$(find "${E2E_ROOT}" -maxdepth 1 -type f -name "${case_name}-${phase}-review-[0-9][0-9].log" -print)"
}

assert_no_et_claim() {
  local case_name="$1"
  ! rg -q '^ET: PASS' "${E2E_ROOT}/${case_name}-result.log"
}

assert_review_log() {
  local case_name="$1"
  local phase="$2"
  local decision="$3"
  local review_log="$4"
  local reviewed_hash
  local snapshot_file
  local attempt
  local terminal_block
  test -n "${review_log}" || return 1
  attempt="$(basename "${review_log}" | sed -E 's/.*-review-([0-9][0-9])\.log/\1/')"
  snapshot_file="${E2E_ROOT}/${case_name}-${phase}-snapshot-${attempt}.txt"
  test -f "${snapshot_file}" || return 1
  test "$(rg -c '^Phase: (AR|CR|VR)$' "${review_log}")" = 1 || return 1
  test "$(rg -c '^Decision: (PASS|BLOCK)$' "${review_log}")" = 1 || return 1
  test "$(rg -c '^Snapshot: [0-9a-f]{64}$' "${review_log}")" = 1 || return 1
  test "$(rg -c '^Source/test changes: (NONE|PRESENT)$' "${review_log}")" = 1 || return 1
  test "$(rg -c '^Verification digest: (MATCH|MISMATCH|ABSENT)$' "${review_log}")" = 1 || return 1
  test "$(rg -c '^Snapshot unchanged: (YES|NO)$' "${review_log}")" = 1 || return 1
  terminal_block="$(tail -n 6 "${review_log}")"
  test "$(printf '%s\n' "${terminal_block}" | sed -n '1p')" = "Phase: ${phase}" || return 1
  test "$(printf '%s\n' "${terminal_block}" | sed -n '2p')" = "Decision: ${decision}" || return 1
  printf '%s\n' "${terminal_block}" | sed -n '3p' | rg -x 'Snapshot: [0-9a-f]{64}' || return 1
  printf '%s\n' "${terminal_block}" | sed -n '4p' | rg -x 'Source/test changes: (NONE|PRESENT)' || return 1
  printf '%s\n' "${terminal_block}" | sed -n '5p' | rg -x 'Verification digest: (MATCH|MISMATCH|ABSENT)' || return 1
  test "$(printf '%s\n' "${terminal_block}" | sed -n '6p')" = 'Snapshot unchanged: YES' || return 1
  reviewed_hash="$(sed -n 's/^Snapshot: //p' "${review_log}")"
  test "$(tr -d '\n' < "${snapshot_file}")" = "${reviewed_hash}" || return 1
}

assert_terminal_review() {
  local case_name="$1"
  local phase="$2"
  local decision="$3"
  local review_log
  review_log="$(terminal_review_log "${case_name}" "${phase}")"
  assert_review_log "${case_name}" "${phase}" "${decision}" "${review_log}"
}

assert_ar_before_code() {
  local case_name="$1"
  local review_log
  local pre_code_pass=0
  while IFS= read -r review_log
  do
    if assert_review_log "${case_name}" AR PASS "${review_log}" && \
      rg -Fxq 'Source/test changes: NONE' "${review_log}" && \
      rg -Fxq 'Verification digest: ABSENT' "${review_log}" && \
      rg -Fxq 'Snapshot unchanged: YES' "${review_log}"
    then
      pre_code_pass=1
      break
    fi
  done < <(find "${E2E_ROOT}" -maxdepth 1 -type f -name "${case_name}-AR-review-[0-9][0-9].log" | sort)
  test "${pre_code_pass}" = 1 || return 1
  assert_terminal_review "${case_name}" AR PASS
}

assert_ar_blocked() {
  local case_name="$1"
  local review_log
  assert_terminal_review "${case_name}" AR BLOCK
  review_log="$(terminal_review_log "${case_name}" AR)"
  rg -Fx 'Source/test changes: NONE' "${review_log}"
  rg -Fx 'Verification digest: ABSENT' "${review_log}"
}

assert_cr_final() {
  local case_name="$1"
  local review_log
  local reviewed_hash
  local final_hash
  local recorded_digest
  local current_digest
  assert_cr_passed "${case_name}"
  review_log="$(terminal_review_log "${case_name}" CR)"
  recorded_digest="$(tr -d '\n' < "${E2E_ROOT}/${case_name}/.verification-ran")"
  current_digest="$(cd "${E2E_ROOT}/${case_name}" && node scripts/verification-digest.js)"
  test "${recorded_digest}" = "${current_digest}"
  reviewed_hash="$(sed -n 's/^Snapshot: //p' "${review_log}")"
  final_hash="$(snapshot_hash "${E2E_ROOT}/${case_name}" CR)"
  test "${reviewed_hash}" = "${final_hash}"
}

assert_cr_passed() {
  local case_name="$1"
  local review_log
  assert_terminal_review "${case_name}" CR PASS
  review_log="$(terminal_review_log "${case_name}" CR)"
  rg -Fx 'Source/test changes: PRESENT' "${review_log}"
  rg -Fx 'Verification digest: MATCH' "${review_log}"
}

assert_vr_passed() {
  local case_name="$1"
  local review_log
  local reviewed_hash
  local final_hash
  assert_terminal_review "${case_name}" VR PASS
  review_log="$(terminal_review_log "${case_name}" VR)"
  rg -Fx 'Source/test changes: PRESENT' "${review_log}"
  rg -Fx 'Verification digest: MATCH' "${review_log}"
  reviewed_hash="$(sed -n 's/^Snapshot: //p' "${review_log}")"
  final_hash="$(snapshot_hash "${E2E_ROOT}/${case_name}" VR)"
  test "${reviewed_hash}" = "${final_hash}"
}

assert_dd_after_vr() {
  local case_name="$1"
  local done_name="$2"
  local expected_before="$3"
  local case_root
  local done_path
  local done_rel
  local review_log
  assert_vr_passed "${case_name}"
  case_root="${E2E_ROOT}/${case_name}"
  review_log="$(terminal_review_log "${case_name}" VR)"
  rg -Fx "Completion document before VR decision: ${expected_before}" "${review_log}"
  test "$(find "${case_root}/.docs/done" -type f -name "${done_name}" | wc -l | tr -d ' ')" = 1
  done_path="$(find "${case_root}/.docs/done" -type f -name "${done_name}")"
  if [ "${expected_before}" = UNCHANGED ]
  then
    done_rel="${done_path#${case_root}/}"
    test "$(git -C "${case_root}" rev-parse "HEAD:${done_rel}")" != "$(git -C "${case_root}" hash-object "${done_path}")"
  fi
}
```

Case-to-fixture mapping:

| Case | Fixture |
|---|---|
| `internal-bug` | `internal-bug` |
| `internal-change` | `internal-change` |
| `public-api-bug` | `public-api-bug` |
| `uncertain-profile-bug` | `uncertain-profile-bug` |
| `security-fix` | `security-fix` |
| `external-contract` | `external-contract` |
| `explicit-ap` | `public-api-bug` plus the stated seed REQ |
| `explicit-ar` | `public-api-bug` plus the stated seed REQ and AP |
| `explicit-req` | `internal-bug` |
| `explicit-dd` | `bang-restart` |
| `read-only` | `internal-bug` |
| `bang-restart` | `bang-restart` |
| `bang-missing` | `internal-bug` |
| `bang-ambiguous` | `internal-bug` plus the two stated seed REQs |

## Scenario 1 - Localized low-risk bug fix uses the direct path

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Fix the internal formatValue bug so empty input returns an empty string.
```

Expected behavior:

- Focused inspection supports every direct-path condition.
- The agent localizes the failure, fixes `src/format-value.js`, uses the seeded regression test, runs `npm test`, and runs CR.
- No REQ, AP, AR, or other `.docs/` artifact is created.
- The final response reports symptom, root cause, affected path, fix, exact verification, and CR result.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/internal-bug" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/internal-bug-seed-sha.txt")"
test "$(git -C "${E2E_ROOT}/internal-bug" status --short)" = " M src/format-value.js"
test ! -e "${E2E_ROOT}/internal-bug/.docs"
test -f "${E2E_ROOT}/internal-bug/.verification-ran"
npm --prefix "${E2E_ROOT}/internal-bug" test
rg -i 'root cause|cause' "${E2E_ROOT}/internal-bug-result.log"
for label in 'Symptom:' 'Root cause:' 'Affected path:' 'Fix:' 'Result:'
do
  rg -e "^${label}.+" "${E2E_ROOT}/internal-bug-result.log"
done
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/internal-bug-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/internal-bug-result.log"
assert_cr_final internal-bug
assert_no_review_phase internal-bug AR
assert_no_review_phase internal-bug VR
assert_no_et_claim internal-bug
```

## Scenario 2 - Low-risk non-bug change uses the shared direct contract

Fixture: `fixtures/intent-based-routing/internal-change`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Update the internal renderLabel helper to trim surrounding whitespace and add focused coverage.
```

Expected behavior:

- The agent supports every direct-path condition from repository evidence.
- It changes only `src/labels.js` and `test/labels.test.js`, runs `npm test`, and runs CR.
- It does not create `.docs/`.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/internal-change" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/internal-change-seed-sha.txt")"
test "$(git -C "${E2E_ROOT}/internal-change" status --short | wc -l | tr -d ' ')" = 2
git -C "${E2E_ROOT}/internal-change" status --short | rg '^ M src/labels\.js$'
git -C "${E2E_ROOT}/internal-change" status --short | rg '^ M test/labels\.test\.js$'
test ! -e "${E2E_ROOT}/internal-change/.docs"
test -f "${E2E_ROOT}/internal-change/.verification-ran"
npm --prefix "${E2E_ROOT}/internal-change" test
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/internal-change-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/internal-change-result.log"
assert_cr_final internal-change
assert_no_review_phase internal-change AR
assert_no_review_phase internal-change VR
assert_no_et_claim internal-change
```

## Scenario 3 - Planned public-contract bug continues after AR

Fixture: `fixtures/intent-based-routing/public-api-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug public-status. Fix the public status response so it returns the documented state field instead of status.
```

Expected behavior:

- Public API impact disqualifies direct execution even though the code change is small.
- RPD creates REQ and AP, runs AR, continues automatically through implementation, tests, CR, the matching Markdown E2E scenario, VR, and DD.
- The final response reports root cause and verification; it does not ask the user to invoke SS.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/public-api-bug" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/public-api-bug-seed-sha.txt")"
test "$(find "${E2E_ROOT}/public-api-bug/.docs/reqs" -type f -name 'req-public-status.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/public-api-bug/.docs/plans" -type f -name 'plan-public-status.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/public-api-bug/.docs/tests" -type f -name 'test-public-status.md' | wc -l | tr -d ' ')" = 1
public_req="$(find "${E2E_ROOT}/public-api-bug/.docs/reqs" -type f -name 'req-public-status.md')"
public_plan="$(find "${E2E_ROOT}/public-api-bug/.docs/plans" -type f -name 'plan-public-status.md')"
public_e2e="${E2E_ROOT}/public-api-bug/.docs/tests/test-public-status.md"
assert_gwt_scenarios "${public_e2e}" 1
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*public status response(?:(?!\n## ).)*\bstate\b/s && /## Acceptance Criteria\n\n(?:(?!\n## ).)*\bstate\b/s ? 0 : 1)' "${public_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/status-api\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${public_plan}"
assert_public_status_semantics "${public_e2e}"
test -z "$(git -C "${E2E_ROOT}/public-api-bug" status --short --untracked-files=all | awk '{print $2}' | rg -v '^(src/status-api\.js|\.docs/reqs/.*/req-public-status\.md|\.docs/plans/.*/plan-public-status\.md|\.docs/tests/test-public-status\.md|\.docs/done/.*/public-status\.md)$')"
git -C "${E2E_ROOT}/public-api-bug" status --short | rg ' M src/status-api\.js'
test -f "${E2E_ROOT}/public-api-bug/.verification-ran"
npm --prefix "${E2E_ROOT}/public-api-bug" test
rg -i 'AR passed|AR fixed' "${E2E_ROOT}/public-api-bug-result.log"
rg -i 'root cause|cause' "${E2E_ROOT}/public-api-bug-result.log"
for label in 'Symptom:' 'Root cause:' 'Affected path:' 'Fix:' 'Result:'
do
  rg -e "^${label}.+" "${E2E_ROOT}/public-api-bug-result.log"
done
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/public-api-bug-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/public-api-bug-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/public-api-bug-result.log"
rg -Fx 'VR: PASS — all acceptance criteria complete' "${E2E_ROOT}/public-api-bug-result.log"
rg -x 'ET: PASS — (\.docs/tests/)?test-public-status\.md' "${E2E_ROOT}/public-api-bug-result.log"
assert_ar_before_code public-api-bug
assert_cr_final public-api-bug
assert_dd_after_vr public-api-bug public-status.md ABSENT
! rg -q '^GC:' "${E2E_ROOT}/public-api-bug-result.log"
! rg -i 'invoke SS|ask.*SS|run SS to implement' "${E2E_ROOT}/public-api-bug-result.log"
```

## Scenario 4 - Material uncertainty selects planning and may block safely

Fixture: `fixtures/intent-based-routing/uncertain-profile-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug profile-display-name. Fix the reported bug where display names disappear after saving. Reports do not establish whether blank names should be rejected or preserved.
```

Expected behavior:

- The missing behavioral contract makes direct-path evidence unavailable.
- RPD creates REQ and AP and runs AR.
- It must not guess the product behavior or edit `src/profile.js` or `src/store.js`; it may stop on the unresolved blocking question.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/uncertain-profile-bug" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/uncertain-profile-bug-seed-sha.txt")"
test "$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/reqs" -type f -name 'req-profile-display-name.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/plans" -type f -name 'plan-profile-display-name.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/tests" -type f -name 'test-profile-display-name.md' | wc -l | tr -d ' ')" = 1
uncertain_req="$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/reqs" -type f -name 'req-profile-display-name.md')"
uncertain_plan="$(find "${E2E_ROOT}/uncertain-profile-bug/.docs/plans" -type f -name 'plan-profile-display-name.md')"
uncertain_e2e="${E2E_ROOT}/uncertain-profile-bug/.docs/tests/test-profile-display-name.md"
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*display name/is && /## Open Questions\n\n(?:(?!\n## ).)*(reject|preserv)(?:(?!\n## ).)*(blank|empty)/is ? 0 : 1)' "${uncertain_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/(profile|store)\.js/s && /## Validation\n\n(?:(?!\n## ).)*\S(?:(?!\n## ).)*/s && /## Rollback \/ Risk\n\n(?:(?!\n## ).)*\S(?:(?!\n## ).)*/s ? 0 : 1)' "${uncertain_plan}"
rg -i 'block|open question|blank|empty' "${uncertain_e2e}"
test -z "$(git -C "${E2E_ROOT}/uncertain-profile-bug" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/(reqs/.*/req-profile-display-name\.md|plans/.*/plan-profile-display-name\.md|tests/test-profile-display-name\.md)$')"
test -z "$(git -C "${E2E_ROOT}/uncertain-profile-bug" status --short -- src/profile.js src/store.js)"
test ! -e "${E2E_ROOT}/uncertain-profile-bug/.docs/done"
rg -i 'block|open question|clarif|reject.*blank|preserv.*blank' "${E2E_ROOT}/uncertain-profile-bug-result.log"
assert_ar_blocked uncertain-profile-bug
assert_no_review_phase uncertain-profile-bug CR
assert_no_review_phase uncertain-profile-bug VR
assert_no_et_claim uncertain-profile-bug
```

## Scenario 5 - Security-sensitive implementation selects planning

Fixture: `fixtures/intent-based-routing/security-fix`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug disabled-user-auth. Fix authentication so disabled users cannot pass credential verification.
```

Expected behavior:

- Authentication and security impact force REQ/AP/AR.
- RPD does not use the direct path, regardless of diff size.
- AR passes, implementation continues, enabled-user and mismatched-credential behavior remain covered, and verification, CR, ET, VR, and DD run.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/security-fix" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/security-fix-seed-sha.txt")"
test "$(find "${E2E_ROOT}/security-fix/.docs/reqs" -type f -name 'req-disabled-user-auth.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/security-fix/.docs/plans" -type f -name 'plan-disabled-user-auth.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/security-fix/.docs/tests" -type f -name 'test-disabled-user-auth.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/security-fix/.docs/done" -type f -name 'disabled-user-auth.md' | wc -l | tr -d ' ')" = 1
security_req="$(find "${E2E_ROOT}/security-fix/.docs/reqs" -type f -name 'req-disabled-user-auth.md')"
security_plan="$(find "${E2E_ROOT}/security-fix/.docs/plans" -type f -name 'plan-disabled-user-auth.md')"
security_e2e="${E2E_ROOT}/security-fix/.docs/tests/test-disabled-user-auth.md"
assert_gwt_scenarios "${security_e2e}" 2
perl -0777 -ne 'exit(/## Requirement\n\n(?=(?:(?!\n## ).)*disabled)(?=(?:(?!\n## ).)*auth)(?:(?!\n## ).)*/is && /## Acceptance Criteria\n\n(?=(?:(?!\n## ).)*disabled)(?=(?:(?!\n## ).)*(?:cannot|fail|reject))(?=(?:(?!\n## ).)*auth)(?=(?:(?!\n## ).)*enabled)(?:(?!\n## ).)*/is ? 0 : 1)' "${security_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/authenticate\.js(?:(?!\n## ).)*test\/authenticate\.test\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${security_plan}"
assert_security_auth_semantics "${security_e2e}"
test -z "$(git -C "${E2E_ROOT}/security-fix" status --short --untracked-files=all | awk '{print $2}' | rg -v '^(src/authenticate\.js|test/authenticate\.test\.js|\.docs/reqs/.*/req-disabled-user-auth\.md|\.docs/plans/.*/plan-disabled-user-auth\.md|\.docs/tests/test-disabled-user-auth\.md|\.docs/done/.*/disabled-user-auth\.md)$')"
rg -i 'AR passed|AR fixed' "${E2E_ROOT}/security-fix-result.log"
git -C "${E2E_ROOT}/security-fix" status --short -- src/authenticate.js | rg '^ M src/authenticate\.js$'
git -C "${E2E_ROOT}/security-fix" status --short -- test/authenticate.test.js | rg '^ M test/authenticate\.test\.js$'
mismatch_mutant="$(mktemp -d "${TMPDIR:-/tmp}/rpd-security-mismatch.XXXXXX")"
cp -R "${E2E_ROOT}/security-fix/." "${mismatch_mutant}/"
printf '%s\n' \
  'export function authenticate(user, suppliedCredential) {' \
  '  return user.disabled !== true;' \
  '}' > "${mismatch_mutant}/src/authenticate.js"
if npm --prefix "${mismatch_mutant}" test
then
  echo "mismatched-credential regression test did not reject the credential-bypass mutant" >&2
  exit 1
fi
test -f "${E2E_ROOT}/security-fix/.verification-ran"
npm --prefix "${E2E_ROOT}/security-fix" test
for label in 'Symptom:' 'Root cause:' 'Affected path:' 'Fix:' 'Result:'
do
  rg -e "^${label}.+" "${E2E_ROOT}/security-fix-result.log"
done
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/security-fix-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/security-fix-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/security-fix-result.log"
rg -Fx 'VR: PASS — all acceptance criteria complete' "${E2E_ROOT}/security-fix-result.log"
rg -x 'ET: PASS — (\.docs/tests/)?test-disabled-user-auth\.md' "${E2E_ROOT}/security-fix-result.log"
assert_ar_before_code security-fix
assert_cr_final security-fix
assert_dd_after_vr security-fix disabled-user-auth.md ABSENT
! rg -q '^GC:' "${E2E_ROOT}/security-fix-result.log"
```

## Scenario 6 - External dependency contract selects planning

Fixture: `fixtures/intent-based-routing/external-contract`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Use story slug partner-webhook-v2. Update partner webhook delivery from the v1 endpoint contract to v2 and preserve retry behavior.
```

Expected behavior:

- The external integration and dependency contract force REQ/AP/AR.
- RPD does not use the direct path.
- Passed AR continues into implementation without a second approval through verified DD.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/external-contract" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/external-contract-seed-sha.txt")"
test "$(find "${E2E_ROOT}/external-contract/.docs/reqs" -type f -name 'req-partner-webhook-v2.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/external-contract/.docs/plans" -type f -name 'plan-partner-webhook-v2.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/external-contract/.docs/tests" -type f -name 'test-partner-webhook-v2.md' | wc -l | tr -d ' ')" = 1
test "$(find "${E2E_ROOT}/external-contract/.docs/done" -type f -name 'partner-webhook-v2.md' | wc -l | tr -d ' ')" = 1
external_req="$(find "${E2E_ROOT}/external-contract/.docs/reqs" -type f -name 'req-partner-webhook-v2.md')"
external_plan="$(find "${E2E_ROOT}/external-contract/.docs/plans" -type f -name 'plan-partner-webhook-v2.md')"
external_e2e="${E2E_ROOT}/external-contract/.docs/tests/test-partner-webhook-v2.md"
assert_gwt_scenarios "${external_e2e}" 2
perl -0777 -ne 'exit(/## Requirement\n\n(?:(?!\n## ).)*v2(?:(?!\n## ).)*retry/is && /## Acceptance Criteria\n\n(?:(?!\n## ).)*v2(?:(?!\n## ).)*retry/is ? 0 : 1)' "${external_req}"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*src\/webhook\.js(?:(?!\n## ).)*test\/webhook\.test\.js/s && /## Validation\n\n(?:(?!\n## ).)*npm test/s && /## Rollback \/ Risk\n\n.+/s ? 0 : 1)' "${external_plan}"
assert_external_contract_semantics "${external_e2e}"
test -z "$(git -C "${E2E_ROOT}/external-contract" status --short --untracked-files=all | awk '{print $2}' | rg -v '^(src/webhook\.js|test/webhook\.test\.js|\.docs/reqs/.*/req-partner-webhook-v2\.md|\.docs/plans/.*/plan-partner-webhook-v2\.md|\.docs/tests/test-partner-webhook-v2\.md|\.docs/done/.*/partner-webhook-v2\.md)$')"
rg -i 'AR passed|AR fixed' "${E2E_ROOT}/external-contract-result.log"
git -C "${E2E_ROOT}/external-contract" status --short -- src/webhook.js | rg '^ M src/webhook\.js$'
git -C "${E2E_ROOT}/external-contract" status --short -- test/webhook.test.js | rg '^ M test/webhook\.test\.js$'
v1_mutant="$(mktemp -d "${TMPDIR:-/tmp}/rpd-webhook-v1.XXXXXX")"
cp -R "${E2E_ROOT}/external-contract/." "${v1_mutant}/"
printf '%s\n' \
  'export function webhookRequest(event) {' \
  '  return { url: "https://partner.example.invalid/v1/events", retries: 3, body: event };' \
  '}' > "${v1_mutant}/src/webhook.js"
if npm --prefix "${v1_mutant}" test
then
  echo "partner-contract tests did not reject the v1 endpoint mutant" >&2
  exit 1
fi
retry_mutant="$(mktemp -d "${TMPDIR:-/tmp}/rpd-webhook-retry.XXXXXX")"
cp -R "${E2E_ROOT}/external-contract/." "${retry_mutant}/"
printf '%s\n' \
  'export function webhookRequest(event) {' \
  '  return { url: "https://partner.example.invalid/v2/events", retries: 0, body: event };' \
  '}' > "${retry_mutant}/src/webhook.js"
if npm --prefix "${retry_mutant}" test
then
  echo "partner-contract tests did not reject the disabled-retry mutant" >&2
  exit 1
fi
test -f "${E2E_ROOT}/external-contract/.verification-ran"
npm --prefix "${E2E_ROOT}/external-contract" test
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/external-contract-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/external-contract-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/external-contract-result.log"
rg -Fx 'VR: PASS — all acceptance criteria complete' "${E2E_ROOT}/external-contract-result.log"
rg -x 'ET: PASS — (\.docs/tests/)?test-partner-webhook-v2\.md' "${E2E_ROOT}/external-contract-result.log"
assert_ar_before_code external-contract
assert_cr_final external-contract
assert_dd_after_vr external-contract partner-webhook-v2.md ABSENT
! rg -q '^GC:' "${E2E_ROOT}/external-contract-result.log"
! rg -i 'invoke SS|ask.*SS|run SS to implement' "${E2E_ROOT}/external-contract-result.log"
```

## Scenario 7 - Explicit AP remains stage-scoped

Fixture: `fixtures/intent-based-routing/public-api-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` to `CASE_ROOT/.docs/reqs/2026/07/27/req-public-status.md` before the seed commit.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. AP: plan how to implement the public status response change.
```

Expected behavior:

- AP creates or updates the plan and auto-runs AR.
- Mentioning implementation in the AP argument does not authorize source changes or auto-continuation.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/explicit-ap" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/explicit-ap-seed-sha.txt")"
test "$(find "${E2E_ROOT}/explicit-ap/.docs/plans" -type f -name 'plan-public-status.md' | wc -l | tr -d ' ')" = 1
git -C "${E2E_ROOT}/explicit-ap" diff --exit-code -- .docs/reqs/2026/07/27/req-public-status.md
test -z "$(git -C "${E2E_ROOT}/explicit-ap" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/(plans/.*/plan-public-status\.md|tests/test-public-status\.md)$')"
rg -i 'AR passed|AR fixed|block' "${E2E_ROOT}/explicit-ap-result.log"
assert_ar_before_code explicit-ap
assert_no_review_phase explicit-ap CR
assert_no_review_phase explicit-ap VR
assert_no_et_claim explicit-ap
```

## Scenario 8 - Explicit AR remains stage-scoped

Fixture: `fixtures/intent-based-routing/public-api-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` and `fixtures/intent-based-routing/seed/plan-public-status.md` to their canonical dated REQ and AP paths before the seed commit.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. AR: review the public status plan before implementation.
```

Expected behavior:

- AR reviews and, if necessary, corrects existing REQ/AP artifacts.
- Mentioning future implementation does not authorize source changes or auto-continuation.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/explicit-ar" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/explicit-ar-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/explicit-ar" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/(reqs/2026/07/27/req-public-status\.md|plans/2026/07/27/plan-public-status\.md|tests/test-public-status\.md)$')"
rg -i 'AR passed|AR fixed|block' "${E2E_ROOT}/explicit-ar-result.log"
assert_ar_before_code explicit-ar
assert_no_review_phase explicit-ar CR
assert_no_review_phase explicit-ar VR
assert_no_et_claim explicit-ar
```

## Scenario 9 - Explicit REQ remains documentation-only

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. REQ: require formatValue to return an empty string for empty input.
```

Expected behavior:

- Only a REQ document is created.
- Source, tests, and configuration remain unchanged.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/explicit-req" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/explicit-req-seed-sha.txt")"
test "$(find "${E2E_ROOT}/explicit-req/.docs/reqs" -type f -name 'req-*.md' | wc -l | tr -d ' ')" = 1
test ! -e "${E2E_ROOT}/explicit-req/.docs/plans"
test -z "$(git -C "${E2E_ROOT}/explicit-req" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/reqs/.*/req-[a-z0-9-]+\.md$')"
assert_no_review_phase explicit-req AR
assert_no_review_phase explicit-req CR
assert_no_review_phase explicit-req VR
assert_no_et_claim explicit-req
```

## Scenario 10 - Read-only diagnosis does not become implementation

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. Explain why formatValue returns the wrong value for empty input.
```

Expected behavior:

- The agent diagnoses and explains the bug.
- It makes no repository changes and creates no workflow artifacts.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/read-only" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/read-only-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/read-only" status --short)"
test ! -e "${E2E_ROOT}/read-only/.docs"
assert_no_review_phase read-only AR
assert_no_review_phase read-only CR
assert_no_review_phase read-only VR
assert_no_et_claim read-only
rg -i 'root cause|because|falsy' "${E2E_ROOT}/read-only-result.log"
```

## Scenario 11 - Explicit `!!` reconciles and restarts the current story

Fixture: `fixtures/intent-based-routing/bang-restart`

The fixture is a previously completed `public-status` story. Its REQ acceptance criteria and AP tasks are checked, its E2E spec requires the `state` field, and its source and focused test currently satisfy that old contract.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence files to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status. !! The public status response must now return only `{ "health": "ready" }`; replace the old `state` field, preserve the readiness value, and do not add a compatibility alias. After reconciling the current REQ, AP, and E2E spec, but before spawning the first AR reviewer or editing `src/**` or `test/**`, copy the reconciled REQ to `EVIDENCE_ROOT/bang-restart-reconciled-req.md`, the reconciled AP to `EVIDENCE_ROOT/bang-restart-reconciled-plan.md`, and the reconciled E2E spec to `EVIDENCE_ROOT/bang-restart-reconciled-test.md`. In your final response include the exact line `ET: PASS — test-public-status.md` only after executing the reconciled Markdown E2E scenario successfully and `DD: PASS — completion document written` only after DD is written.
```

Expected behavior:

- `!!` resolves the existing `public-status` story and updates its existing REQ, AP, and E2E spec in place.
- Reconciliation replaces the old contract rather than appending a contradictory requirement, unchecks the stale acceptance criteria, reopens affected AP tasks, and invalidates the old AR pass.
- Reconciliation removes workflow-stage and delivery bookkeeping from AP checkbox tasks so every remaining task can finish before VR.
- A new AR runs against reconciled docs before any source or focused-test edit.
- After AR passes, the command continues without another approval through implementation, CR, TT, ET, VR, and DD, then stops.
- VR checks the reconciled acceptance criteria, DD records completion, and Git history remains unchanged.

Assertions:

```sh
seed_sha="$(cat "${E2E_ROOT}/bang-restart-seed-sha.txt")"
test "$(git -C "${E2E_ROOT}/bang-restart" rev-parse HEAD)" = "${seed_sha}"

test -f "${E2E_ROOT}/bang-restart-reconciled-req.md"
test -f "${E2E_ROOT}/bang-restart-reconciled-plan.md"
test -f "${E2E_ROOT}/bang-restart-reconciled-test.md"
perl -0777 -ne 'exit(/## Requirement\n\n(?=(?:(?!\n## ).)*`health`)(?=(?:(?!\n## ).)*\bread(?:y|iness)\b)(?:(?!\n## ).)*/s && /## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[ \].*health(?:(?!\n## ).)*- \[ \].*(test|cover)/s && !/## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[x\]/s ? 0 : 1)' \
  "${E2E_ROOT}/bang-restart-reconciled-req.md"
perl -0777 -ne 'exit(/## Phased Tasks\n\n(?:(?!\n## ).)*- \[ \].*src\/status-api\.js(?:(?!\n## ).)*- \[ \].*test\/status-api\.test\.js/s ? 0 : 1)' \
  "${E2E_ROOT}/bang-restart-reconciled-plan.md"
! rg -ni '^- \[[ x]\][ \t]+(?:Run|invoke)[ \t]+(?:AR|CR|VR|DD|GC)\b|^- \[[ x]\][ \t]+(?:Stage|Commit|Push|Open(?: a)? pull request)\b' \
  "${E2E_ROOT}/bang-restart-reconciled-plan.md"
rg -i 'health[^[:alnum:]]+ready' "${E2E_ROOT}/bang-restart-reconciled-test.md"
! rg -i 'state[^[:alnum:]]+ready' "${E2E_ROOT}/bang-restart-reconciled-test.md"

current_req="${E2E_ROOT}/bang-restart/.docs/reqs/2026/07/27/req-public-status.md"
current_plan="${E2E_ROOT}/bang-restart/.docs/plans/2026/07/27/plan-public-status.md"
current_e2e="${E2E_ROOT}/bang-restart/.docs/tests/test-public-status.md"
perl -0777 -ne 'exit(/## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[x\].*health(?:(?!\n## ).)*- \[x\].*(test|cover)/s && !/## Acceptance Criteria\n\n(?:(?!\n## ).)*- \[ \]/s ? 0 : 1)' "${current_req}"
test -z "$(rg '^- \[ \]' "${current_plan}" || true)"
! rg -ni '^- \[[ x]\][ \t]+(?:Run|invoke)[ \t]+(?:AR|CR|VR|DD|GC)\b|^- \[[ x]\][ \t]+(?:Stage|Commit|Push|Open(?: a)? pull request)\b' \
  "${current_plan}"
rg -i 'health[^[:alnum:]]+ready' "${current_e2e}"
! rg -i 'state[^[:alnum:]]+ready' "${current_e2e}"
rg -i '\bhealth\b' "${E2E_ROOT}/bang-restart/src/status-api.js"
! rg -i '\bstate\b' "${E2E_ROOT}/bang-restart/src/status-api.js"
rg -i '\bhealth\b' "${E2E_ROOT}/bang-restart/test/status-api.test.js"
! rg -i '\bstate\b' "${E2E_ROOT}/bang-restart/test/status-api.test.js"

test -z "$(git -C "${E2E_ROOT}/bang-restart" status --short --untracked-files=all | awk '{print $2}' | rg -v '^(src/status-api\.js|test/status-api\.test\.js|\.docs/reqs/2026/07/27/req-public-status\.md|\.docs/plans/2026/07/27/plan-public-status\.md|\.docs/tests/test-public-status\.md|\.docs/done/.*/public-status\.md)$')"
test -f "${E2E_ROOT}/bang-restart/.verification-ran"
npm --prefix "${E2E_ROOT}/bang-restart" test
assert_ar_before_code bang-restart
assert_cr_final bang-restart
assert_dd_after_vr bang-restart public-status.md UNCHANGED
rg -i '\bhealth\b' "$(find "${E2E_ROOT}/bang-restart/.docs/done" -type f -name 'public-status.md')"
rg -Fx 'AR: PASS — no blocking architecture flaws' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'CR: PASS — no major findings' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'VR: PASS — all acceptance criteria complete' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'Verification: PASS — npm test (exit 0)' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'ET: PASS — test-public-status.md' "${E2E_ROOT}/bang-restart-result.log"
rg -Fx 'DD: PASS — completion document written' "${E2E_ROOT}/bang-restart-result.log"
! rg -q '^GC:' "${E2E_ROOT}/bang-restart-result.log"
```

## Scenario 12 - `!!` blocks when no current story exists

Fixture: `fixtures/intent-based-routing/internal-bug`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. !! Empty formatted values must now use a dash.
```

Expected behavior:

- No current REQ exists, so the command cannot safely determine a story.
- The agent asks for targeted clarification and does not create a story, plan, test spec, source change, review, or commit.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/bang-missing" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/bang-missing-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/bang-missing" status --short)"
test ! -e "${E2E_ROOT}/bang-missing/.docs"
assert_no_review_phase bang-missing AR
assert_no_review_phase bang-missing CR
assert_no_review_phase bang-missing VR
assert_no_et_claim bang-missing
rg -i 'no current story|requires a current story|no story (is )?established|name the existing story|current story.*(missing|not found|identify)|which story|clarif' "${E2E_ROOT}/bang-missing-result.log"
```

## Scenario 13 - `!!` blocks when the target story is ambiguous

Fixture: `fixtures/intent-based-routing/internal-bug`

Setup addition: copy `fixtures/intent-based-routing/seed/req-public-status.md` and `fixtures/intent-based-routing/seed/req-format-value.md` to `CASE_ROOT/.docs/reqs/2026/07/27/` before the seed commit.

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. !! This correction belongs to one of two stories, `public-status` or `format-value`, but I have not determined which one: use the `health` field instead.
```

Expected behavior:

- The message explicitly identifies two plausible target stories and does not select one.
- The agent asks which story to update and makes no repository, review, or commit change.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/bang-ambiguous" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/bang-ambiguous-seed-sha.txt")"
test -z "$(git -C "${E2E_ROOT}/bang-ambiguous" status --short)"
assert_no_review_phase bang-ambiguous AR
assert_no_review_phase bang-ambiguous CR
assert_no_review_phase bang-ambiguous VR
assert_no_et_claim bang-ambiguous
rg -i 'ambiguous|which story|public-status.*format-value|format-value.*public-status|clarif' "${E2E_ROOT}/bang-ambiguous-result.log"
```

## Scenario 14 - Explicit DD remains documentation-only

Fixture: `fixtures/intent-based-routing/bang-restart`

Exact prompt:

```text
Use CASE_ROOT as the only repository; write only required reviewer/result evidence logs to EVIDENCE_ROOT. Read ./SKILL.md completely. The current story is public-status, its implementation and verification are complete, and its existing REQ, AP, E2E spec, source, and focused test are current. DD: write the completion summary only.
```

Expected behavior:

- DD creates one concise completion document for `public-status`.
- Source, tests, requirements, plans, the E2E spec, Git history, and review evidence remain unchanged.

Assertions:

```sh
test "$(git -C "${E2E_ROOT}/explicit-dd" rev-parse HEAD)" = "$(cat "${E2E_ROOT}/explicit-dd-seed-sha.txt")"
test "$(find "${E2E_ROOT}/explicit-dd/.docs/done" -type f -name 'public-status.md' | wc -l | tr -d ' ')" = 1
test -z "$(git -C "${E2E_ROOT}/explicit-dd" status --short --untracked-files=all | awk '{print $2}' | rg -v '^\.docs/done/.*/public-status\.md$')"
assert_no_review_phase explicit-dd AR
assert_no_review_phase explicit-dd CR
assert_no_review_phase explicit-dd VR
assert_no_et_claim explicit-dd
rg -i 'completion|summary|DD' "${E2E_ROOT}/explicit-dd-result.log"
```

## Scenario 15 - File count and diff size are not routing rules

Scenarios 2 and 3 form the comparison:

- Scenario 2 may touch two internal files yet remains direct because every risk condition is supported.
- Scenario 3 changes only one small source module yet must plan because it changes a public contract.

Require both scenarios to pass; do not add a numeric file-count, line-count, or effort assertion.

## Scenario 16 - Static routing and command contracts are exact

Run these static assertions against the revised source repository:
Execute the block from a temporary script file or as one complete `bash -c` string, not by piping it to Bash. The `npx skills add` command may consume piped standard input and prevent later assertions from running.

```sh
set -e
RPD_HELPER_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/rpd-static-helpers.XXXXXX")"
perl -0777 -ne 'if (/Prepend these helpers.*?\x60\x60\x60sh\n(.*?)\x60\x60\x60/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-intent-based-routing.md > "${RPD_HELPER_ROOT}/helpers.sh"
. "${RPD_HELPER_ROOT}/helpers.sh"
test -z "$(rg -n '\bDF\b|Diagnose and fix root cause' skills/rpd/SKILL.md README.md || true)"
test -z "$(rg -n '\bWT\b|story worktrees|WT may|WT and' skills/rpd/SKILL.md README.md || true)"
test -z "$(rg -n 'without an explicit implementation command|then stop unless' skills/rpd/SKILL.md README.md || true)"
test "$(rg -c 'rpd-loop\.png' README.md)" = 1
test -s rpd-loop.png
file rpd-loop.png | rg -F 'PNG image data'
test ! -e SKILL.md
test ! -e skills/rpd/rpd-loop.png
test -d .docs/tests
test ! -e tests
test -z "$(rg -n '^/?\.docs/?$' .gitignore || true)"
test -f .docs/tests/fixtures/intent-based-routing/bang-restart/.docs/reqs/2026/07/27/req-public-status.md
for tracked_path in .docs/reqs .docs/plans .docs/tests \
  .docs/tests/fixtures/intent-based-routing/bang-restart/.docs/reqs/2026/07/27/req-public-status.md
do
  if git check-ignore -q "${tracked_path}"
  then
    echo "${tracked_path} is incorrectly ignored" >&2
    exit 1
  fi
  test -n "$(git ls-files "${tracked_path}")"
done
test -z "$(find skills/rpd -type d -name tests -print)"
test -z "$(find skills/rpd -path '*/.docs/tests*' -print)"
RPD_TMP_ROOT="${RPD_TMP_ROOT:-${TMPDIR:-/tmp}}"
RPD_SOURCE_ROOT="$(pwd)"
RPD_INSTALL_ROOT="$(mktemp -d "${RPD_TMP_ROOT%/}/rpd-client-install.XXXXXX")"
(
  cd "${RPD_INSTALL_ROOT}"
  npx --yes skills@latest add "${RPD_SOURCE_ROOT}" --skill rpd --agent codex --copy --yes
)
test -f "${RPD_INSTALL_ROOT}/.agents/skills/rpd/SKILL.md"
test ! -e "${RPD_INSTALL_ROOT}/.agents/skills/rpd/rpd-loop.png"
test ! -e "${RPD_INSTALL_ROOT}/.agents/skills/rpd/README.md"
test -z "$(find "${RPD_INSTALL_ROOT}/.agents/skills/rpd" -type d -name tests -print)"
test -z "$(find "${RPD_INSTALL_ROOT}/.agents/skills/rpd" -path '*/.docs/tests*' -print)"
RPD_SKILL_VALIDATOR="${RPD_SKILL_VALIDATOR:-${HOME}/.codex/skills/.system/skill-creator/scripts/quick_validate.py}"
if [ -f "${RPD_SKILL_VALIDATOR}" ]
then
  python3 "${RPD_SKILL_VALIDATOR}" skills/rpd
else
  echo "skipping frontmatter validation: set RPD_SKILL_VALIDATOR to a skill-creator quick_validate.py path" >&2
fi
perl -0777 -ne 'if (/\A---\n(.*?)\n---\n/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/frontmatter.txt"
test -z "$(rg -n '^(metadata:|[[:space:]]*version:|[[:space:]]*repository:)' "${E2E_ROOT}/frontmatter.txt" || true)"
test "$(rg -c '^\*\*Version:\*\* `[0-9]+\.[0-9]+\.[0-9]+`$' skills/rpd/SKILL.md)" = 1
perl -0777 -ne 'if (/intent: (.*?)\. A command token/s) { $value = $1; $value =~ s/\s+/ /g; print $value; exit 0 } exit 1' \
  "${E2E_ROOT}/frontmatter.txt" > "${E2E_ROOT}/trigger-commands.txt"
test "$(cat "${E2E_ROOT}/trigger-commands.txt")" = 'RPD, REQ, AP, AR, SS, TT, ET, CR, VR, DD, GC, or !!'
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/skill-intent-routing.txt"
perl -0777 -ne 'if (/(?:\A|\n)## Intent Routing\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' README.md > "${E2E_ROOT}/readme-intent-routing.txt"
cmp "${E2E_ROOT}/skill-intent-routing.txt" "${E2E_ROOT}/readme-intent-routing.txt"
for contract in "${E2E_ROOT}/skill-intent-routing.txt" "${E2E_ROOT}/readme-intent-routing.txt"
do
  for term in \
    'localized' 'existing pattern' 'public API' 'schema' 'persistence' \
    'migration' 'authentication' 'security' 'privacy' 'external integration' \
    'dependency contract' 'infrastructure' 'deployment' 'concurrency' \
    'performance' 'availability' 'reliability' 'reversible' \
    'expected behavior' 'verification'
  do
    rg -Fi "${term}" "${contract}"
  done
  rg -Fi 'false, uncertain, or unsupported' "${contract}"
  for intent in 'explanation' 'diagnosis' 'review' 'requirements' 'planning' 'architecture review'
  do
    rg -Fi "${intent}" "${contract}"
  done
done
rg -i -e 'explicit.*REQ.*AP.*AR.*DD.*stage|REQ.*AP.*AR.*DD.*documented' "${E2E_ROOT}/skill-intent-routing.txt"
rg -i -e 'explicit.*!!.*current-story.*restart|!!.*correction.*restart' "${E2E_ROOT}/skill-intent-routing.txt"
rg -i -e 'explicit.*CR.*VR.*documented behavior|explicit CR and VR.*documented behavior' "${E2E_ROOT}/skill-intent-routing.txt"
for command in REQ AP AR DD
do
  RPD_STAGE="${command}" perl -0777 -ne 'my $command = $ENV{RPD_STAGE}; if (/(?:\A|\n)- \*\*\Q$command\E\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
    skills/rpd/SKILL.md > "${E2E_ROOT}/${command}-section.txt"
  rg -i -e 'do not (implement|edit source)|documentation-only|only.*documented|only.*worktree' "${E2E_ROOT}/${command}-section.txt"
done
rg -F 'AR blocked: <flaw and why it cannot be resolved in place>' "${E2E_ROOT}/AR-section.txt"
rg -F '`AR blocked` is not a pass' "${E2E_ROOT}/AR-section.txt"
rg -Fi 'not a literal value a later release invalidates' "${E2E_ROOT}/REQ-section.txt"
rg -F 'Planned-routing terminus' "${E2E_ROOT}/skill-intent-routing.txt"
rg -F 'SS(+CR*) → TT → ET? → VR* → DD' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'Run DD only after VR passes' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'stop without a completion document' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'Run GC only when the user asks for it' "${E2E_ROOT}/skill-intent-routing.txt"
rg -F 'Direct-path terminus' "${E2E_ROOT}/skill-intent-routing.txt"
rg -Fi 'direct implementation ends after CR and creates no `.docs` artifacts' "${E2E_ROOT}/skill-intent-routing.txt"
for contract in \
  'A blocking open question about expected behavior does not exempt this from creating AP' \
  'let AR report `AR blocked` on it rather than stopping after REQ alone'
do
  rg -F "${contract}" "${E2E_ROOT}/skill-intent-routing.txt"
  rg -F "${contract}" "${E2E_ROOT}/readme-intent-routing.txt"
done
rg -Fi 'classify by the story'\''s subject matter' "${E2E_ROOT}/AP-section.txt"
rg -Fi 'even when currently implemented as a single pure function' "${E2E_ROOT}/AP-section.txt"
perl -0777 -ne 'if (/(?:\A|\n)(Create E2E specs .*?)(?=\n\n)/s) { print $1; exit 0 } exit 1' \
  README.md > "${E2E_ROOT}/readme-e2e-guidance.txt"
for term in 'public API' 'consumer contract'
do
  rg -Fi "${term}" "${E2E_ROOT}/AP-section.txt"
  rg -Fi "${term}" "${E2E_ROOT}/readme-e2e-guidance.txt"
done
rg -Fi 'pure function' "${E2E_ROOT}/AP-section.txt"
rg -Fi 'pure function' "${E2E_ROOT}/readme-e2e-guidance.txt"
rg -Fi 'no live' "${E2E_ROOT}/AP-section.txt"
rg -Fi 'no live' "${E2E_ROOT}/readme-e2e-guidance.txt"
rg -F 'Each `## Scenario` section must contain one or more non-empty Given, When, and Then steps, grouped in that order.' "${E2E_ROOT}/AP-section.txt"
rg -F 'Allow ordinary Markdown list markers followed by whitespace and blank lines between those steps.' "${E2E_ROOT}/AP-section.txt"
for contract in \
  'Do not add workflow bookkeeping as plan tasks' \
  'Finish and check every plan task before the final VR decision'
do
  rg -F "${contract}" "${E2E_ROOT}/AP-section.txt"
  rg -F "${contract}" README.md
done
rg -i 'AP checkbox tasks.*implementation.*verification.*workflow bookkeeping.*AR.*CR.*VR.*DD.*GC.*complete before VR' \
  .docs/reqs/2026/07/27/req-intent-based-routing.md
rg -i 'Keep AP checkbox state coherent.*exclude workflow-stage.*require every task complete before final VR' \
  .docs/plans/2026/07/27/plan-intent-based-routing.md
for artifact in \
  .docs/reqs/2026/07/27/req-intent-based-routing.md \
  .docs/plans/2026/07/27/plan-intent-based-routing.md
do
  rg -i 'checkbox-marker-only.*task text|checkbox-marker-only.*task'\''s text' "${artifact}"
  rg -i 'text.*order.*scope.*all other plan content.*unchanged' "${artifact}"
done
! rg -ni '^- \[[ x]\][ \t]+(?:Run|invoke)[ \t]+(?:AR|CR|VR|DD|GC)\b|^- \[[ x]\][ \t]+(?:Stage|Commit|Push|Open(?: a)? pull request)\b' \
  .docs/plans/2026/07/27/plan-intent-based-routing.md
printf '%s\n' \
  '## Scenario: malformed labels' \
  'Forgiven the public status helper exists' \
  'Whenever a consumer requests it' \
  'The strengthened response uses state ready' \
  > "${E2E_ROOT}/malformed-scenario-labels.md"
! perl -0777 -ne 'exit(/\n[ \t-]*(?:\*\*Given:?\*\*|Given)[ \t]*:?[ \t]+.*\n[ \t-]*(?:\*\*When:?\*\*|When)[ \t]*:?[ \t]+.*\n[ \t-]*(?:\*\*Then:?\*\*|Then)[ \t]*:?[ \t]+/is ? 0 : 1)' \
  "${E2E_ROOT}/malformed-scenario-labels.md"
printf '%s\n' \
  '## Scenario: v2 contract with numbered bold labels and spacing' \
  '1. **Given:** a partner webhook exists' \
  '* Given: the v2 contract is active' \
  '' \
  '2) **When:** webhookRequest builds the request' \
  '' \
  '- **Then:** the endpoint uses v2' \
  '+ **Then:** the supplied body is preserved' \
  '' \
  '## Scenario: retry contract with ordinary list markers' \
  '* Given: a partner webhook exists' \
  '+ When: webhookRequest builds the request' \
  '2. When: delivery is retried' \
  '- Then: retry behavior is preserved' \
  > "${E2E_ROOT}/well-formed-external-scenarios.md"
assert_gwt_scenarios "${E2E_ROOT}/well-formed-external-scenarios.md" 2
rg -i '\bv2\b' "${E2E_ROOT}/well-formed-external-scenarios.md"
rg -i '\bretr(y|ies)\b' "${E2E_ROOT}/well-formed-external-scenarios.md"
printf '%s\n' \
  '## Scenario: v2 contract with empty precondition' \
  'Given:' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  '' \
  '## Scenario: retry contract with empty precondition' \
  'Given:' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  > "${E2E_ROOT}/empty-external-scenarios.md"
! assert_gwt_scenarios "${E2E_ROOT}/empty-external-scenarios.md" 2
printf '%s\n' \
  '## Scenario: v2 contract in reversed order' \
  'When webhookRequest builds the request' \
  'Given a partner webhook exists' \
  'Then the endpoint uses v2' \
  '' \
  '## Scenario: retry contract in reversed order' \
  'When webhookRequest builds the request' \
  'Given a partner webhook exists' \
  'Then retry behavior is preserved' \
  > "${E2E_ROOT}/reversed-external-scenarios.md"
! assert_gwt_scenarios "${E2E_ROOT}/reversed-external-scenarios.md" 2
printf '%s\n' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  '' \
  '## Scenario: only one owned retry scenario' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  > "${E2E_ROOT}/preamble-plus-one-scenario.md"
! assert_gwt_scenarios "${E2E_ROOT}/preamble-plus-one-scenario.md" 2
printf '%s\n' \
  '## Scenario: valid v2 contract' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  '' \
  '## Scenario: valid retry contract' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  '' \
  '## Scenario: malformed extra scenario' \
  'When a request starts' \
  'Given the contract exists' \
  'Then it fails' \
  > "${E2E_ROOT}/mixed-valid-malformed-scenarios.md"
! assert_gwt_scenarios "${E2E_ROOT}/mixed-valid-malformed-scenarios.md" 2
printf '%s\n' \
  '## Scenario: duplicate and out-of-order steps' \
  'Given a partner webhook exists' \
  'Then the endpoint uses v2' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  > "${E2E_ROOT}/duplicate-out-of-order-scenario.md"
! assert_gwt_scenarios "${E2E_ROOT}/duplicate-out-of-order-scenario.md" 1
printf '%s\n' \
  '## Scenario: invalid list-marker spacing' \
  '-Given a partner webhook exists' \
  '1.When webhookRequest builds the request' \
  '+Then retry behavior is preserved' \
  > "${E2E_ROOT}/invalid-marker-spacing-scenario.md"
! assert_gwt_scenarios "${E2E_ROOT}/invalid-marker-spacing-scenario.md" 1
printf '%s\n' \
  '## Scenario: label-prefix lookalikes' \
  'Givenly a partner webhook exists' \
  'Whenever webhookRequest builds the request' \
  'Thenable the endpoint uses v2' \
  > "${E2E_ROOT}/label-prefix-lookalikes.md"
! assert_gwt_scenarios "${E2E_ROOT}/label-prefix-lookalikes.md" 1
printf '%s\n' \
  '## Scenario: malformed public outcome decoy' \
  '- Given a consumer calls the public status API' \
  '- When the consumer requests readiness' \
  '- Then the response is available' \
  '-Then the response has state ready' \
  > "${E2E_ROOT}/malformed-public-semantic-decoy.md"
assert_gwt_scenarios "${E2E_ROOT}/malformed-public-semantic-decoy.md" 1
! assert_public_status_semantics "${E2E_ROOT}/malformed-public-semantic-decoy.md"
printf '%s\n' \
  '## Scenario: negated public outcome' \
  '- Given a consumer calls the public status API' \
  '- When the consumer requests readiness' \
  '- Then the response state is not ready' \
  > "${E2E_ROOT}/negated-public-outcome.md"
assert_gwt_scenarios "${E2E_ROOT}/negated-public-outcome.md" 1
! assert_public_status_semantics "${E2E_ROOT}/negated-public-outcome.md"
printf '%s\n' \
  '## Scenario: opposite public value' \
  '- Given a consumer calls the public status API' \
  '- When the consumer requests readiness' \
  '- Then the response state is pending instead of ready' \
  > "${E2E_ROOT}/opposite-public-value.md"
assert_gwt_scenarios "${E2E_ROOT}/opposite-public-value.md" 1
! assert_public_status_semantics "${E2E_ROOT}/opposite-public-value.md"
printf '%s\n' \
  '## Scenario: malformed disabled outcome decoy' \
  '- Given a disabled user supplies a matching credential' \
  '- When authentication runs' \
  '- Then authentication completes' \
  '-Then authentication returns false' \
  '' \
  '## Scenario: malformed enabled outcome decoy' \
  '- Given an enabled user supplies a matching credential' \
  '- When authentication runs' \
  '- Then authentication completes' \
  '-Then authentication returns true' \
  > "${E2E_ROOT}/malformed-security-semantic-decoy.md"
assert_gwt_scenarios "${E2E_ROOT}/malformed-security-semantic-decoy.md" 2
! assert_security_auth_semantics "${E2E_ROOT}/malformed-security-semantic-decoy.md"
printf '%s\n' \
  '## Scenario: contradictory auth evidence' \
  '- Given a disabled user with `disabled` set to `true` is also described as enabled' \
  '- When authentication runs' \
  '- Then authentication returns false' \
  '- Then authentication returns true' \
  '' \
  '## Scenario: unrelated valid structure' \
  '- Given an audit event exists' \
  '- When the event is recorded' \
  '- Then the audit record is available' \
  > "${E2E_ROOT}/same-scenario-security-proof.md"
assert_gwt_scenarios "${E2E_ROOT}/same-scenario-security-proof.md" 2
! assert_security_auth_semantics "${E2E_ROOT}/same-scenario-security-proof.md"
printf '%s\n' \
  '## Scenario: negated disabled precondition' \
  '- Given a user whose disabled property is not true' \
  '- When authentication runs' \
  '- Then authentication returns false' \
  '' \
  '## Scenario: negated enabled precondition' \
  '- Given a user who is not enabled and has disabled set to false' \
  '- When authentication runs' \
  '- Then authentication returns true' \
  > "${E2E_ROOT}/negated-security-preconditions.md"
assert_gwt_scenarios "${E2E_ROOT}/negated-security-preconditions.md" 2
! assert_security_auth_semantics "${E2E_ROOT}/negated-security-preconditions.md"
printf '%s\n' \
  '## Scenario: disabled adjective form' \
  '- Given a disabled user supplies a matching credential' \
  '- When authentication runs' \
  '- Then authentication returns false' \
  '' \
  '## Scenario: enabled adjective form' \
  '- Given an enabled user supplies a matching credential' \
  '- When authentication runs' \
  '- Then authentication returns true' \
  > "${E2E_ROOT}/adjective-security-preconditions.md"
assert_gwt_scenarios "${E2E_ROOT}/adjective-security-preconditions.md" 2
assert_security_auth_semantics "${E2E_ROOT}/adjective-security-preconditions.md"
printf '%s\n' \
  '## Scenario: opposite disabled property' \
  '- Given a user has disabled set to false rather than true' \
  '- When authentication runs' \
  '- Then authentication returns false' \
  '' \
  '## Scenario: opposite enabled adjective' \
  '- Given a user is disabled rather than enabled' \
  '- When authentication runs' \
  '- Then authentication returns true' \
  > "${E2E_ROOT}/opposite-security-preconditions.md"
assert_gwt_scenarios "${E2E_ROOT}/opposite-security-preconditions.md" 2
! assert_security_auth_semantics "${E2E_ROOT}/opposite-security-preconditions.md"
printf '%s\n' \
  '## Scenario: prose-only v2 decoy' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then the request is available' \
  'The endpoint mentions v2 only in prose.' \
  '' \
  '## Scenario: prose-only retry decoy' \
  '- Given a delivery exists' \
  '- When delivery runs' \
  '- Then the result is recorded' \
  'Retry behavior appears only in prose.' \
  > "${E2E_ROOT}/prose-only-external-semantics.md"
assert_gwt_scenarios "${E2E_ROOT}/prose-only-external-semantics.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/prose-only-external-semantics.md"
printf '%s\n' \
  '## Scenario: combined external evidence' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then the endpoint uses v2' \
  '- Then retry behavior is preserved' \
  '' \
  '## Scenario: unrelated external structure' \
  '- Given a delivery exists' \
  '- When delivery runs' \
  '- Then the result is recorded' \
  > "${E2E_ROOT}/same-scenario-external-proof.md"
assert_gwt_scenarios "${E2E_ROOT}/same-scenario-external-proof.md" 2
assert_external_contract_semantics "${E2E_ROOT}/same-scenario-external-proof.md"
printf '%s\n' \
  '## Scenario: opposite v2 outcome' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then the partner rejects v2 and the endpoint remains v1' \
  '' \
  '## Scenario: opposite retry outcome' \
  '- Given a delivery exists' \
  '- When delivery runs' \
  '- Then retry is unsupported and disabled' \
  > "${E2E_ROOT}/opposite-external-outcomes.md"
assert_gwt_scenarios "${E2E_ROOT}/opposite-external-outcomes.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/opposite-external-outcomes.md"
printf '%s\n' \
  '## Scenario: post-term v2 negation' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then v2 is not used and the endpoint remains v1' \
  '' \
  '## Scenario: affirmative retry control' \
  '- Given a delivery exists' \
  '- When delivery runs' \
  '- Then retry behavior is preserved' \
  > "${E2E_ROOT}/post-term-negated-v2.md"
assert_gwt_scenarios "${E2E_ROOT}/post-term-negated-v2.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/post-term-negated-v2.md"
printf '%s\n' \
  '## Scenario: v1 instead of v2' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then the endpoint is v1 instead of v2' \
  '' \
  '## Scenario: affirmative retry control' \
  '- Given a delivery exists' \
  '- When delivery runs' \
  '- Then retry behavior is preserved' \
  > "${E2E_ROOT}/v1-instead-of-v2.md"
assert_gwt_scenarios "${E2E_ROOT}/v1-instead-of-v2.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/v1-instead-of-v2.md"
printf '%s\n' \
  '## Scenario: affirmative v2 control' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then the endpoint uses v2' \
  '' \
  '## Scenario: non-retry preservation decoy' \
  '- Given a delivery exists' \
  '- When delivery runs' \
  '- Then delivery preserves v1 behavior instead of retry' \
  > "${E2E_ROOT}/non-retry-preservation.md"
assert_gwt_scenarios "${E2E_ROOT}/non-retry-preservation.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/non-retry-preservation.md"
printf '%s\n' \
  '## Scenario: affirmative v2 control' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then the endpoint uses v2' \
  '' \
  '## Scenario: documentation retry decoy' \
  '- Given documentation exists' \
  '- When the wording is reviewed' \
  '- Then the documentation uses retry terminology' \
  > "${E2E_ROOT}/documentation-only-retry.md"
assert_gwt_scenarios "${E2E_ROOT}/documentation-only-retry.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/documentation-only-retry.md"
printf '%s\n' \
  '## Scenario: documentation-prefixed v2 clause' \
  '- Given a partner contract exists' \
  '- When documentation is reviewed' \
  '- Then the documentation says the endpoint uses v2' \
  '' \
  '## Scenario: documentation-prefixed retry clause' \
  '- Given documentation exists' \
  '- When the wording is reviewed' \
  '- Then the documentation says delivery uses retry' \
  > "${E2E_ROOT}/documentation-prefixed-external.md"
assert_gwt_scenarios "${E2E_ROOT}/documentation-prefixed-external.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/documentation-prefixed-external.md"
printf '%s\n' \
  '## Scenario: v2 mention only' \
  '- Given a partner contract exists' \
  '- When a request is built' \
  '- Then the notes mention v2' \
  '' \
  '## Scenario: retry mention only' \
  '- Given a delivery exists' \
  '- When delivery runs' \
  '- Then retry behavior is discussed' \
  > "${E2E_ROOT}/mention-only-external-outcomes.md"
assert_gwt_scenarios "${E2E_ROOT}/mention-only-external-outcomes.md" 2
! assert_external_contract_semantics "${E2E_ROOT}/mention-only-external-outcomes.md"
printf '%s\n' \
  '## Scenario' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  > "${E2E_ROOT}/bare-scenario-heading.md"
assert_gwt_scenarios "${E2E_ROOT}/bare-scenario-heading.md" 1
printf '%s\n' \
  '## Scenarios: plural lookalike' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  '' \
  '## Scenariofoo' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  '' \
  '## Scenario1foo' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  '' \
  '## Scenario-title' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  > "${E2E_ROOT}/invalid-scenario-heading-boundary.md"
! assert_gwt_scenarios "${E2E_ROOT}/invalid-scenario-heading-boundary.md" 1
printf '%s\n' \
  '## Scenario: valid before empty middle' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  '' \
  '## Scenario: whitespace-only middle' \
  '   ' \
  '## Scenario: valid after empty middle' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then retry behavior is preserved' \
  > "${E2E_ROOT}/empty-middle-scenario.md"
! assert_gwt_scenarios "${E2E_ROOT}/empty-middle-scenario.md" 2
printf '%s\n' \
  '## Scenario: empty before sibling heading' \
  '' \
  '## Notes' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  > "${E2E_ROOT}/sibling-heading-escape.md"
! assert_gwt_scenarios "${E2E_ROOT}/sibling-heading-escape.md" 1
printf '%s\n' \
  '## Scenario: valid before trailing empty' \
  'Given a partner webhook exists' \
  'When webhookRequest builds the request' \
  'Then the endpoint uses v2' \
  '' \
  > "${E2E_ROOT}/trailing-empty-scenario.md"
printf '%s' '## Scenario: trailing empty' >> "${E2E_ROOT}/trailing-empty-scenario.md"
! assert_gwt_scenarios "${E2E_ROOT}/trailing-empty-scenario.md" 1
printf '%s\n' \
  'Then authentication is not false' \
  'Then authentication does not return false' \
  'Then authentication is not true' \
  'Then authentication does not return true' \
  'Then authentication never returns false' \
  'Then authentication no longer returns true' \
  'Then authentication does not return false' \
  'Then authentication cannot return false' \
  'Then authentication does not equal true' \
  'Then authentication cannot equal true' \
  'Then authentication result is not false' \
  'Then authentication result never equals false' \
  'Then authentication result cannot equal true' \
  'Then it is not true that authentication result is false' \
  'Then the service cannot report that authentication result is false' \
  'Then the caller does not observe that authentication result equals true' \
  "Then it isn't true that authentication result is false" \
  "Then it won't report that authentication result equals true" \
  "Then it shouldn't indicate that authentication result is false" \
  > "${E2E_ROOT}/negated-boolean-outcomes.md"
! perl -0777 -ne 'exit(/\n[ \t-]*(?:\*\*Then:?\*\*|Then)[ \t]*:?[ \t]+(?![^\n]*(?:\bnot\b|\bnever\b|\bcannot\b|\b[[:alpha:]]+n.t\b)[^\n]*\bresult[ \t]+(?:is|equals?))[^\n]*\bresult[ \t]+(?:is|equals?)[ \t]+(?:`?(?:false|true)`?)/is ? 0 : 1)' \
  "${E2E_ROOT}/negated-boolean-outcomes.md"
printf '%s\n' \
  'Then authentication result is false, not true' \
  'Then authentication result is true, not false' \
  > "${E2E_ROOT}/affirmative-boolean-outcomes.md"
for outcome in false true
do
  OUTCOME="${outcome}" perl -0777 -ne 'my $outcome = $ENV{OUTCOME}; exit(/\n?[ \t-]*(?:\*\*Then:?\*\*|Then)[ \t]*:?[ \t]+(?![^\n]*(?:\bnot\b|\bnever\b|\bcannot\b|\b[[:alpha:]]+n.t\b)[^\n]*\bresult[ \t]+(?:is|equals?))[^\n]*\bresult[ \t]+(?:is|equals?)[ \t]+`?\Q$outcome\E`?/is ? 0 : 1)' \
    "${E2E_ROOT}/affirmative-boolean-outcomes.md"
done
perl -0777 -ne 'if (/(?:\A|\n)## Conventions\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/conventions.txt"
rg -F 'Sequence notation' "${E2E_ROOT}/conventions.txt"
rg -F 'Command-like intent' "${E2E_ROOT}/conventions.txt"
rg -F 'Current story' "${E2E_ROOT}/conventions.txt"
perl -0777 -ne 'if (/(?:\A|\n)## Independent Review Delegation\n(.*?)(?=\n## )/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${E2E_ROOT}/independent-review-delegation.txt"
sed -n '/^## Notes$/,/^## License$/p' README.md > "${E2E_ROOT}/readme-notes.txt"
for contract in \
  'Reuse the same independent subagent for every rerun within one AR, CR, or VR stage while it remains available and independent.' \
  "On every rerun, give that reviewer the new stable snapshot and raw artifacts and require the stage's full checklist; do not limit the review to prior findings." \
  'Start a new independent reviewer when the next stage begins, or when the current reviewer is unavailable, has contributed to artifacts under review, or modified the reviewed snapshot.'
do
  rg -F "${contract}" "${E2E_ROOT}/independent-review-delegation.txt"
  rg -F "${contract}" "${E2E_ROOT}/readme-notes.txt"
done
test -z "$(rg -F 'Prefer fresh reviewer context' skills/rpd/SKILL.md README.md || true)"
for contract in \
  'requires a rerun before the stage is complete' \
  'updating REQ acceptance-criteria checkboxes to record a VR reviewer'\''s determination' \
  'updating only AP task checkbox markers to record completed work'
do
  rg -F "${contract}" "${E2E_ROOT}/independent-review-delegation.txt"
  rg -F "${contract}" "${E2E_ROOT}/readme-notes.txt"
done
for contract in \
  'task'\''s text, order, scope, and all other plan content remain unchanged' \
  'does not require rerunning AR or CR'
do
  rg -F "${contract}" "${E2E_ROOT}/independent-review-delegation.txt"
  rg -F "${contract}" "${E2E_ROOT}/readme-notes.txt"
done
rg -F './.docs/plans/*' .docs/tests/test-intent-based-routing.md
rg -F 'review_phase}" != VR' .docs/tests/test-intent-based-routing.md
rg -F '^## Phased Tasks$' .docs/tests/test-intent-based-routing.md
rg -F 'snapshot-<attempt>.txt' .docs/tests/test-intent-based-routing.md
test -z "$(rg -F 'not solely for editorial corrections' skills/rpd/SKILL.md || true)"
for command in CR VR
do
  RPD_STAGE="${command}" perl -0777 -ne 'my $command = $ENV{RPD_STAGE}; if (/(?:\A|\n)- \*\*\Q$command\E\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
    skills/rpd/SKILL.md > "${E2E_ROOT}/${command}-section.txt"
done
rg -F 'Do not pass VR while any AP task remains unchecked.' "${E2E_ROOT}/VR-section.txt"
rg -F 'VR` does not pass while any AP task remains unchecked.' README.md
rg -F 'Stale, contradictory, or incomplete REQ, AP, or test docs' "${E2E_ROOT}/VR-section.txt"
rg -F 'Stale, contradictory, or incomplete REQ, AP, or test docs' README.md
rg -F 'Do not require a DD completion document to exist or be current before VR passes' "${E2E_ROOT}/VR-section.txt"
rg -F 'Do not require a DD completion document to exist or be current before VR passes' README.md
rg -F '`3.6.0` is an owner-directed compatibility exception' CHANGELOG.md
rg -F 'CR passed: no major findings' "${E2E_ROOT}/CR-section.txt"
rg -F 'CR fixed: <summary>; rerun result passed' "${E2E_ROOT}/CR-section.txt"
rg -F 'VR passed: all acceptance criteria complete' "${E2E_ROOT}/VR-section.txt"
rg -F 'VR incomplete: <summary of missing work>' "${E2E_ROOT}/VR-section.txt"
for section in AR CR VR
do
  rg -Fi 'verbatim' "${E2E_ROOT}/${section}-section.txt"
  rg -Fi 'neither substitutes for the other' "${E2E_ROOT}/${section}-section.txt"
done
perl -0777 -ne 'if (/(?:\A|\n)- \*\*!!\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' \
  skills/rpd/SKILL.md > "${E2E_ROOT}/bang-section.txt"
for contract in \
  'current story' \
  'without approval between stages' \
  'any earlier AR pass is stale' \
  'AR* → SS(+CR*) → TT → ET? → VR* → DD' \
  'does not authorize GC' \
  'stop without committing' \
  'before AR explicitly passes'
do
  rg -F "${contract}" "${E2E_ROOT}/bang-section.txt"
done
test -z "$(rg -n '`!!` is documentation-only|!!.*do not authorize source changes|REQ, AP, AR, DD, and `!!`' skills/rpd/SKILL.md README.md | rg -v 'reconciliation step of `!!` is documentation-only' || true)"
perl -0777 -ne 'if (/(?:\A|\n)- \*\*SS\*\*:(.*?)(?=\n- \*\*[A-Z!]+\*\*:)/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/ss-section.txt"
rg -Fi 'approved plan' "${E2E_ROOT}/ss-section.txt"
rg -Fi 'switch to planned routing' "${E2E_ROOT}/ss-section.txt"
! rg -Fi 'direct path' "${E2E_ROOT}/ss-section.txt"
rg -F '.docs/done/{yyyy}/{mm}/{dd}/{name}.md' skills/rpd/SKILL.md
rg -F 'done/{yyyy}/{mm}/{dd}/{name}.md' README.md
rg -F 'Sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`' skills/rpd/SKILL.md
rg -F 'Sequence: `REQ → AP → AR* → SS(+CR*) → TT → ET? → VR* → DD → GC`' README.md
perl -0777 -ne 'if (/(?:\A|\n)## Command Keywords\n(.*?)(?=\n## Documentation Structure)/s) { print $1; exit 0 } exit 1' skills/rpd/SKILL.md > "${E2E_ROOT}/command-keywords.txt"
test "$(rg -c '^- \*\*[^*]+\*\*:' "${E2E_ROOT}/command-keywords.txt")" = 12
for command in REQ AP AR SS TT ET CR VR DD GC '!!' RPD
do
  test "$(rg -c "^- \\*\\*${command}\\*\\*:" "${E2E_ROOT}/command-keywords.txt")" = 1
done
sed -n '/^## Commands Reference$/,/^## Notes$/p' README.md > "${E2E_ROOT}/commands-reference.txt"
test "$(rg -c '^\| `[A-Z!]+` \|' "${E2E_ROOT}/commands-reference.txt")" = 12
for command in REQ AP AR SS TT ET CR VR DD GC '!!' RPD
do
  test "$(rg -c "^\\| \`${command}\` \\|" "${E2E_ROOT}/commands-reference.txt")" = 1
done
```

The exact 12-row count plus one match for every expected command rejects missing, duplicate, and unexpected command rows. The explicit absence check rejects residual `WT` contract text. Ordinary bug-fix duties are proved by Scenarios 1 and 3 rather than a replacement alias.
