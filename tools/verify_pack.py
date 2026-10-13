"""Verify the implementation pack, not the future application redesign."""
from pathlib import Path
import hashlib
import json
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]

def sha256(path):
    with path.open('rb') as stream:
        h = hashlib.sha256()
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()

checks = []

def check(name, passed, detail):
    checks.append({'check': name, 'passed': bool(passed), 'detail': detail})

manifest_path = ROOT / 'PACK_MANIFEST.json'
if not manifest_path.exists():
    print('Missing PACK_MANIFEST.json', file=sys.stderr)
    raise SystemExit(1)

manifest = json.loads(manifest_path.read_text())
errors = []
for row in manifest['files']:
    path = ROOT / row['path']
    if not path.is_file():
        errors.append('Missing: ' + row['path'])
    elif path.stat().st_size != row['bytes'] or sha256(path) != row['sha256']:
        errors.append('Changed: ' + row['path'])
check('Manifest integrity', not errors, errors or str(len(manifest['files'])) + ' files match')

baseline = json.loads((ROOT / 'context/WEBSITE_SOURCE_MANIFEST.json').read_text())
errors = [row['path'] for row in baseline['files']
          if not (ROOT / row['path']).is_file() or sha256(ROOT / row['path']) != row['sha256']]
check('Unchanged V5.1 baseline', not errors, errors or str(len(baseline['files'])) + ' original files match')
package = json.loads((ROOT / 'app/package.json').read_text())
check('Baseline version', package.get('version') == '5.1.0', package.get('version'))

refs = json.loads((ROOT / 'references/etsy/REFERENCE_MANIFEST.json').read_text())
check('Thirty Etsy references', len(refs['files']) == 30 and refs['selected_image_count'] == 30,
      {'web': sum(row['platform'] == 'web' for row in refs['files']),
       'ios': sum(row['platform'] == 'ios' for row in refs['files'])})
png_errors = []
for row in refs['files']:
    path = ROOT / row['path']
    with path.open('rb') as stream:
        header = stream.read(24)
    if len(header) != 24 or header[:8] != b'\x89PNG\r\n\x1a\n':
        png_errors.append(row['path'])
        continue
    width, height = struct.unpack('>II', header[16:24])
    if width < 100 or height < 100:
        png_errors.append(row['path'])
check('Reference PNG structure', not png_errors, png_errors or '30 non-empty PNG headers verified')

sora = ROOT / 'app/public/assets/cabinet.glb'
check('Sora model identity', sha256(sora) == '18cf94f5d342f9949d5b100bde3968dfc14b1746c3cb47570cf930ab55c9d742',
      {'bytes': sora.stat().st_size, 'sha256': sha256(sora)})
check('Prebuilt Sora matches source asset', sha256(sora) == sha256(ROOT / 'app/dist/assets/cabinet.glb'),
      'source/prebuilt cabinet identity')

html = (ROOT / 'app/dist/index.html').read_text()
check('Observed live build identifiers',
      '/assets/index-BxwkETk1.js' in html and '/assets/index-Dfho1xh3.css' in html,
      'Observed on live root on 2026-10-13, not a complete independent deployment-byte audit')

required = ['START_HERE.md', 'AGENTS.md', 'brief/APPROVED_BRIEF.md',
            'brief/PRODUCT_AND_JOURNEYS.md', 'brief/MARKETPLACE.md', 'brief/BRAND.md',
            'brief/3D_AND_ASSETS.md', 'brief/MOBILE_AND_PERFORMANCE.md',
            'brief/PREPARED_EXPERIENCES.md', 'brief/IMPLEMENTATION.md',
            'quality/REVIEW_AND_REVISION.md', 'quality/FINISHED_DELIVERABLE.md',
            'quality/ACCEPTANCE_CHECKLIST.md', 'skills/ROUTING.md',
            'references/brand/Brand_Guideline_Reference_2026.pdf']
missing = [name for name in required if not (ROOT / name).is_file()]
check('Required pack entries', not missing, missing or 'all entries present')

brief = (ROOT / 'brief/APPROVED_BRIEF.md').read_text()
check('Approved scope recorded', all(term in brief for term in [
    'Sora cabinet', 'Arca chair', 'Batu table', 'Rimba sideboard', 'Lino sofa', 'Nara lounge',
    'Populated prepared workspace', 'Adaptive automatic loading']),
    'approved products, seller entrance and adaptive policy')
review = (ROOT / 'quality/REVIEW_AND_REVISION.md').read_text()
check('Review calibration', all(term in review for term in [
    '8: acceptable', '8.5: great', '9.5: amazing', '10: a defensible breakthrough',
    'up to four', 'independent', 'Mobile performance is a release gate']),
    'strict evidence and release criteria')

deploy_sources = ['app/package-lock.json', 'app/vercel.json', 'app/src/main.js',
                  'app/src/engine.js', 'app/public/fonts/OFL.txt', 'app/THIRD_PARTY_LICENSES.txt']
check('Source and deployment essentials', all((ROOT / path).is_file() for path in deploy_sources),
      deploy_sources)

bad_paths = [str(path.relative_to(ROOT)) for path in ROOT.rglob('*')
             if path.is_file() and any(part in {'node_modules', '__pycache__', '.git'}
                                      for part in path.relative_to(ROOT).parts)]
check('No dependency/cache trees', not bad_paths, bad_paths or 'none')

passed = all(row['passed'] for row in checks)
report = {'scope': 'Prompt-pack structural and byte-integrity verification only',
          'passed': passed, 'checks': checks,
          'limits': ['No future redesign has been implemented or tested by this script.',
                     'Reference selection was by filenames, not individual visual ranking.',
                     'Physical mobile performance requires separate implementation evidence.']}
(ROOT / 'PACK_VALIDATION.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'passed': passed, 'checks': len(checks),
                  'failed': [row for row in checks if not row['passed']]}, indent=2))
raise SystemExit(0 if passed else 1)
