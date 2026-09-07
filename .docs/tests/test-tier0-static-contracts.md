# Tier 0 - Package and Protocol Checks

Run the single block from the repository root with Python 3. It checks parseable structure, metadata,
links, and externally consumed protocol literals. It does not establish the meaning of instructions;
review and Tier 2 cover that. Rephrasing ordinary guidance must not require changing these assertions.

```sh
set -euo pipefail
python3 - <<'PY'
import json
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

root = Path.cwd()
skill_path = root / 'skills/rpd/SKILL.md'
skill = skill_path.read_text()
readme = (root / 'README.md').read_text()
changelog = (root / 'CHANGELOG.md').read_text()

frontmatter = re.match(r'\A---\n(.*?)\n---\n', skill, re.S)
assert frontmatter, 'Missing skill frontmatter'
assert re.search(r'^name:\s*rpd\s*$', frontmatter[1], re.M), 'Invalid skill name'
assert re.search(r'^description:\s*\S', frontmatter[1], re.M), 'Missing description'

version_pattern = r'^\*\*Version:\*\* `(\d+\.\d+\.\d+)`$'
versions = re.findall(version_pattern, skill, re.M)
assert len(versions) == 1, 'Expected one skill version'
assert re.findall(version_pattern, readme, re.M) == versions, 'README version differs'
assert re.findall(r'^## \[([^]]+)\]', changelog, re.M)[0] == versions[0], 'Changelog version differs'

expected_commands = {'REQ', 'AP', 'AR', 'SS', 'TT', 'ET', 'CR', 'VR', 'DD', 'GC', '!!', 'RPD'}
commands = re.findall(r'^- \*\*([A-Z!]+)\*\*', skill, re.M)
assert len(commands) == len(expected_commands) and set(commands) == expected_commands, commands

for path in (
    '.docs/reqs/{yyyy}/{mm}/{dd}/req-{name}.md',
    '.docs/plans/{yyyy}/{mm}/{dd}/plan-{name}.md',
    '.docs/tests/test-{name}.md',
    '.docs/done/{yyyy}/{mm}/{dd}/{name}.md',
):
    assert f'`{path}`' in skill, f'Missing artifact path: {path}'

protocol = (
    'STAGE risk: low|non-low — <reason>',
    'STAGE review round: <n>; reviewer: <new|reused|not applicable>',
    'AR passed: no blocking architecture flaws',
    'AR fixed: <summary>; rerun result passed',
    'AR blocked: <reason>',
    'CR passed: no major findings',
    'CR fixed: <summary>; rerun result passed',
    'CR blocked: <reason>',
    'VR passed: all acceptance criteria complete',
    'VR incomplete: <missing work>',
)
for literal in protocol:
    assert f'`{literal}`' in skill, f'Missing review protocol: {literal}'

runtime_files = {p.relative_to(skill_path.parent).as_posix()
                 for p in skill_path.parent.rglob('*') if p.is_file()}
assert runtime_files == {'SKILL.md'}, runtime_files
assert 'skills/rpd/SKILL.md' in readme, 'README must link the normative skill'

for doc in (skill_path, root / 'README.md', root / '.docs/tests/README.md'):
    for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', doc.read_text()):
        url = urlsplit(target)
        if url.scheme or url.netloc:
            continue
        linked = (doc.parent / unquote(url.path)).resolve() if url.path else doc
        assert linked.exists(), f'{doc}: missing link {target}'
        if url.fragment and linked.suffix == '.md':
            headings = re.findall(r'^#{1,6}\s+(.+)$', linked.read_text(), re.M)
            anchors = {re.sub(r'[^\w\- ]', '', h.lower()).replace(' ', '-') for h in headings}
            assert unquote(url.fragment) in anchors, f'{doc}: missing anchor {target}'

for package in (root / '.docs/tests/fixtures').rglob('package.json'):
    command = json.loads(package.read_text()).get('scripts', {}).get('test')
    assert command is None or command == 'node --test', f'Unexpected fixture command: {package}'

print('Tier 0 passed')
PY
```
