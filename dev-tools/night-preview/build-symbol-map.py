"""Build isolated preview assets; never modify production assets or navigation code."""
from pathlib import Path
import re
import shutil
import json
import runpy

repo = Path(__file__).resolve().parents[2]
public = repo / 'public'
source = repo / 'dev-tools/night-preview'
icons = repo / 'node_modules/@oicl/openbridge-webcomponents/dist/icons'
assets = source / 'symbols'
assets.mkdir(exist_ok=True)
runpy.run_path(str(source / 'build-poi-symbols.py'))

def paths(name):
    text = (icons / f'icon-{name}.js').read_text()
    svg = re.search(r'this.icon = svg`(.*?)`;', text, re.S).group(1)
    return re.findall(r'<path\b[^>]*\bd="([^"]+)"[^>]*/>', svg)

def svg(name, width, height, transform, colors):
    content = ''.join(f'<path d="{path}" fill="{colors[min(i, len(colors)-1)]}" fill-rule="evenodd" stroke="#111111" stroke-width="0.45" stroke-linejoin="round"/>' for i, path in enumerate(paths(name)))
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}"><title>OpenBridge {name} — Freeboard preview</title><g transform="{transform}">{content}</g></svg>\n'

# Align each official 24px shape to the EXISTING registry anchor in image pixels.
# Changing canvas size does not change the pixel anchor or geographic coordinate.
specs = {
 'vessels/ais_self.svg': ('own-ship-iec', 19, 45, 'translate(9.5 22.5) scale(1.4) translate(-12 -12)', ['#2687ff']),
 'vessels/ais_active.svg': ('ais-target-activated-filled', 32, 32, 'translate(17 16) scale(1.2) translate(-12 -12)', ['#ff00ff', '#111111']),
 'waypoints/waypoint.svg': ('waypoint-optional-iec', 24, 36, 'translate(12 24) scale(1.5) translate(-12 -12)', ['#ff9955'])
}
for path, spec in specs.items():
    target = assets / path
    target.parent.mkdir(exist_ok=True)
    target.write_text(svg(*spec))

out = public / 'night-preview/map'
out.mkdir(parents=True, exist_ok=True)
media = out / 'media'
if not media.exists(): media.symlink_to(public / 'media', target_is_directory=True)
for file in public.iterdir():
    if file.is_file():
        target = out / file.name
        if target.is_symlink() or target.exists(): target.unlink()
        target.symlink_to(file)
for file in (public / 'assets').rglob('*'):
    if not file.is_file(): continue
    target = out / file.relative_to(public)
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.is_symlink() or target.exists(): target.unlink()
    relative = str(file.relative_to(public / 'assets/img')) if file.is_relative_to(public / 'assets/img') else ''
    if relative in specs: shutil.copy2(assets / relative, target)
    else: target.symlink_to(file)
shutil.copy2(source / 'index.html', public / 'night-preview/index.html')
(assets / 'manifest.json').write_text(json.dumps({k:{'source':v[0],'width':v[1],'height':v[2],'transform':v[3],'colors':v[4]} for k,v in specs.items()}, indent=2)+'\n')
print('Isolated preview map ready; 3 assets replaced, all production assets untouched.')

# The own-vessel renderer uses PNG; focused AIS uses the matching SVG.
if (assets / 'vessels/self.png').exists():
    target = out / 'assets/img/vessels/self.png'
    if target.is_symlink() or target.exists(): target.unlink()
    shutil.copy2(assets / 'vessels/self.png', target)

# POI overrides are shared by MatIconRegistry's picker and the map registry.
poi = assets / 'poi'
if poi.exists():
    for file in poi.glob('*.svg'):
        target = out / 'assets/img/poi' / file.name
        if target.is_symlink() or target.exists(): target.unlink()
        shutil.copy2(file, target)

# Install preview-only label rendering before the application starts.
index = out / 'index.html'
if index.is_symlink() or index.exists(): index.unlink()
html = (public / 'index.html').read_text()
splash = (source / 'loading-screen.html').read_text()
html = re.sub(r'<app-root>.*?</app-root>', lambda _: '<app-root>' + splash + '</app-root>', html, count=1, flags=re.S)
index.write_text(html.replace('<head>', '<head><link rel="stylesheet" href="panel-preview.css"><script src="panel-preview.js"></script><script src="label-preview.js"></script>', 1))
shutil.copy2(source / 'label-preview.js', out / 'label-preview.js')

for name in ("panel-preview.js", "panel-preview.css"):
    shutil.copy2(source / name, out / name)

# A persistent view for design review; the real startup has no artificial delay.
review = '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Freeboard loading preview</title>' + splash + """
<style>body{margin:0}.preview-themes{position:fixed;top:16px;right:16px;z-index:10000;display:flex;gap:8px}.preview-themes button{background:transparent;color:inherit;border:1px solid currentColor;border-radius:4px;padding:10px;cursor:pointer}.preview-themes{color:var(--fb-text,#d6dce1)}</style>
<nav class="preview-themes" aria-label="Preview theme"><button data-mode="day">Dag</button><button data-mode="dusk">Schemer</button><button data-mode="night">Nacht</button></nav>
<script>const colors={day:['#fcfcfc','#1f1f1f','#535353'],dusk:['#252525','#f7f7f7','#b5b5b5'],night:['#000','#eaa75e','#b78249']};document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{const c=colors[b.dataset.mode];['--fb-component','--fb-text','--fb-text-secondary'].forEach((key,i)=>document.documentElement.style.setProperty(key,c[i]));document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)))});document.querySelector('[data-mode=night]').click();</script></html>"""
(public / 'night-preview/loading.html').write_text(review)
