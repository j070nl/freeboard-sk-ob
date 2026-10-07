"""Restore this release's previous static webapp, retaining cached build chunks."""
from pathlib import Path
import hashlib
import os
import shutil
import sys
import tarfile
import tempfile

release = Path(__file__).resolve().parent
archive_path = release / 'freeboard/live-before.tar.gz'
live = Path('/home/pi/.signalk/node_modules/@signalk/freeboard-sk/public')
# An optional output path lets the archive be verified without touching live files.
if len(sys.argv) == 2:
    live = Path(sys.argv[1]).resolve()
with tempfile.TemporaryDirectory(prefix='freeboard-restore-') as temp:
    with tarfile.open(archive_path) as archive:
        for member in archive.getmembers():
            relative = Path(member.name)
            if relative.is_absolute() or '..' in relative.parts or relative.parts[0] != 'public':
                raise ValueError('Unexpected backup path: ' + member.name)
            destination = Path(temp) / relative
            if member.isdir():
                destination.mkdir(parents=True, exist_ok=True)
            elif member.isfile():
                destination.parent.mkdir(parents=True, exist_ok=True)
                with archive.extractfile(member) as content, destination.open('wb') as target:
                    shutil.copyfileobj(content, target)
            else:
                raise ValueError('Unsupported backup entry: ' + member.name)
    source = Path(temp) / 'public'
    files = sorted((f for f in source.rglob('*') if f.is_file()), key=lambda f: f.name == 'index.html')
    assert (source / 'index.html').is_file()
    for file in files:
        target = live / file.relative_to(source)
        target.parent.mkdir(parents=True, exist_ok=True)
        pending = target.with_name(target.name + '.restore-tmp')
        shutil.copy2(file, pending)
        os.replace(pending, target)
        assert hashlib.sha256(target.read_bytes()).digest() == hashlib.sha256(file.read_bytes()).digest()
print('Previous Freeboard restored and verified:', live)
