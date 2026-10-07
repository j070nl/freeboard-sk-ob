from pathlib import Path
import datetime,hashlib,json,os,shutil,subprocess,tarfile
# Refuse publication without the reviewed build, focused regression tests and browser smoke check.
build_log=Path('/tmp/openbridge-release-build-final.log').read_text()
test_log=Path('/tmp/openbridge-release-focused-tests.log').read_text()
assert '[build-web] Build complete' in build_log
assert '4 passed (4)' in test_log and 'Uncaught Exception' not in test_log and 'Unhandled' not in test_log
assert json.loads(Path('/tmp/approved-browser-results.json').read_text())['errors'] == []
stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d-%H%M%S')
release=Path('/home/pi/freeboard-releases')/(stamp+'-approved-openbridge')
release.mkdir(parents=True)
apps=[('freeboard',Path('/home/pi/freeboard-openbridge'),Path('/home/pi/.signalk/node_modules/@signalk/freeboard-sk/public'))]
exclude={'night-preview','autopilot-example','autopilot-review','openbridge-review','theme-sync-preview.html','resource-review'}
manifests={}
for name,repo,live in apps:
 out=release/name;out.mkdir()
 with tarfile.open(out/'live-before.tar.gz','w:gz') as archive:archive.add(live,arcname='public')
 (out/'source.patch').write_bytes(subprocess.check_output(['git','diff','--binary'],cwd=repo))
 (out/'source-status.txt').write_bytes(subprocess.check_output(['git','status','--short'],cwd=repo))
 with tarfile.open(out/'new-source-files.tar.gz','w:gz') as archive:
  for f in subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=repo,text=True).splitlines():
   if (repo/f).is_file():archive.add(repo/f,arcname=f)
 source=out/'public';source.mkdir()
 for file in (repo/'public').rglob('*'):
  rel=file.relative_to(repo/'public')
  if file.is_file() and rel.parts[0] not in exclude:
   target=source/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(file,target)
 manifests[name]={str(f.relative_to(source)):hashlib.sha256(f.read_bytes()).hexdigest() for f in source.rglob('*') if f.is_file()}
 (out/'manifest.json').write_text(json.dumps(manifests[name],indent=2))
# Keep the pre-integration source tree and the exact validation evidence.
shutil.copy2('/tmp/freeboard-source-before-approved-release.tar.gz', release/'source-before-integration.tar.gz')
shutil.copy2(Path(__file__).with_name('rollback.py'), release/'rollback.py')
for name in ('openbridge-release-build-final.log', 'openbridge-release-tests.log', 'openbridge-release-focused-tests.log', 'approved-browser-results.json'):
 file=Path('/tmp')/name
 if file.exists(): shutil.copy2(file,release/name)
# Verify that the backup can be read before changing any live asset.
for name,repo,live in apps:
 with tarfile.open(release/name/'live-before.tar.gz') as archive:
  assert archive.extractfile('public/index.html').read() == (live/'index.html').read_bytes()
(release/'README.txt').write_text('Restore previous Freeboard web files with:\npython3 '+str(release/'rollback.py')+'\n\nRoutes, waypoints, settings, helper plugin and Skip are not part of this release.\nSource edits: /home/pi/freeboard-openbridge/src. Source-before-integration.tar.gz holds the pre-release workspace sources; freeboard/source.patch plus new-source-files.tar.gz capture the deployed changes against the existing git checkout.\n')
# Backup and release snapshot are complete before changing live files.
for name,repo,live in apps:
 source=release/name/'public'
 files=sorted(manifests[name],key=lambda p:p=='index.html')
 for rel in files:
  target=live/rel;target.parent.mkdir(parents=True,exist_ok=True)
  temp=target.with_name(target.name+'.openbridge-publish-tmp')
  shutil.copy2(source/rel,temp);os.replace(temp,target)
 for rel,digest in manifests[name].items():
  assert hashlib.sha256((live/rel).read_bytes()).hexdigest()==digest,(name,rel)
 print(name,'published and verified:',len(files),'files',flush=True)
(release/'release.json').write_text(json.dumps({'createdUtc':stamp,'apps':{name:{'repository':str(repo),'live':str(live),'files':len(manifests[name])} for name,repo,live in apps},'excludedReviewFixtures':sorted(exclude),'strategy':'assets first, index last; old assets retained; static web files only'},indent=2))
Path('/tmp/openbridge-approved-release.txt').write_text(str(release))
print('Release and backups:',release)
