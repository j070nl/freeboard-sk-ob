"""Generate preview-only POI assets; keep resource IDs, canvas and anchor stable."""
from pathlib import Path
import json
import re

repo=Path(__file__).resolve().parents[2]
source=repo/'src/assets/img/poi'
out=repo/'dev-tools/night-preview/symbols/poi'
out.mkdir(parents=True,exist_ok=True)
icons=repo/'node_modules/@oicl/openbridge-webcomponents/dist/icons'
matching={
 'anchorage':'anchor-iec',
 'fuel':'energy-petrol',
 'ferry':'ship-carferry',
 'dock':'harbour-berthing',
 'radio-call-point':'com-radio',
 'notice-to-mariners':'info'
}
# Reserved nautical warning/flag colors are deliberately outside this migration.
preserve={'hazard','dive-site'}
colors={'#ff6600':'#394b59','#00ff00':'#2e594a','#ff00ff':'#4d4561','#ff01ff':'#4d4561','#0000ff':'#334d64'}
manifest={}
for file in sorted(source.glob('*.svg')):
 if file.stem in preserve:continue
 name=matching.get(file.stem)
 if name:
  component=(icons/f'icon-{name}.js').read_text()
  original=re.search(r'this.icon = svg`(.*?)`;',component,re.S).group(1)
  glyph=re.sub(r'<svg\b[^>]*>', '<svg x="6" y="2" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">',original,count=1)
  result=f'''<svg xmlns="http://www.w3.org/2000/svg" width="37" height="37" viewBox="0 0 37 37"><title>{file.stem} — OpenBridge preview</title><path d="M5 1H32Q36 1 36 5V25Q36 29 32 29H10L1 37V5Q1 1 5 1Z" fill="#26343e" stroke="#c7d1d9" stroke-width="1"/><g color="#e2e8ed">{glyph}</g></svg>\n'''
 else:
  # Retain original glyph geometry, including all transforms, masks and gradients.
  result=file.read_text()
  for old,new in colors.items():result=re.sub(re.escape(old),new,result,flags=re.I)
 (out/file.name).write_text(result)
 manifest[file.name]={'source':f'OpenBridge {name}' if name else 'Original Freeboard geometry; subdued POI palette','anchor':[1,37],'scale':0.65}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'{len(manifest)} POI assets prepared: {len(matching)} official replacements, {len(manifest)-len(matching)} palette updates; hazard/diving flags unchanged.')
