# Shared Test Helpers

Every tier extracts this block with:

```sh
perl -0777 -ne 'if (/\x60\x60\x60sh\n(snapshot_hash.*?)\x60\x60\x60/s) { print $1; exit 0 } exit 1' \
  .docs/tests/test-helpers.md > "${RPD_HELPERS}"
. "${RPD_HELPERS}"
```

`snapshot_hash` and `assert_gwt_scenarios` are used by Tier 0 and Tier 2. Everything from
`terminal_review_log` down is Tier 2 only.

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
    $document =~ s/\r\n?/\n/g;
    my @scenario = ($document =~ /^## Scenario(?=[: \t]|\r?(?:\n|\z))[^\n]*(?:\n|\z)(.*?)(?=^##(?:[ \t]+|$)|\z)/msg);
    exit 1 if @scenario < $minimum;
    for my $scenario (@scenario) {
      my @steps;
      for my $line (split /\n/, $scenario) {
        if ($line =~ /^[ \t]*(?:[-*+][ \t]+|[0-9]+[.)][ \t]+)?(?:\*\*(Given|When|Then):?\*\*(?:[ \t]+|[ \t]*:[ \t]*)(.*)|(Given|When|Then)(?:[ \t]+|[ \t]*:[ \t]*)(.*))$/i) {
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
