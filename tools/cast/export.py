import json, re, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))   # repo root
BUILD = os.path.join(HERE, '.build')                       # parts.json from render-cast.tsx
OUT = os.path.join(REPO, 'cast')                           # writes cast/svg and cast/png
css = open(f'{REPO}/app/styles/base.css').read()

def block(selector):
    i = css.index(selector + ' {') if (selector + ' {') in css else css.index(selector + '{')
    j = css.index('{', i); depth = 0
    for k in range(j, len(css)):
        depth += css[k] == '{'; depth -= css[k] == '}'
        if depth == 0: return css[j+1:k]
light = block(':root'); dark = block('[data-theme="dark"]')
marks = re.search(r':root \{([^}]*--mark-empire[^}]*)\}', open(f'{REPO}/app/styles/element-marks.css').read()).group(1)
light += marks
THEME = {'light': f':root{{{light}}}', 'dark': f':root{{{light}}}\n:root{{{dark}}}'}

parts = json.load(open(f'{BUILD}/parts.json'))
os.makedirs(f'{OUT}/svg', exist_ok=True); os.makedirs(f'{OUT}/png', exist_ok=True)

BAKE_JS = r"""
(svg) => {
  const probe = document.createElementNS('http://www.w3.org/2000/svg','g'); svg.appendChild(probe);
  const cv = document.createElement('canvas').getContext('2d');
  const toHex = (c) => { cv.fillStyle = '#000'; cv.fillStyle = c; return cv.fillStyle; };
  const COLOR = new Set(['fill','stroke','stop-color','color','flood-color']);
  const needs = (v) => /var\(|color-mix|currentcolor/i.test(v);
  const resolve = (prop, val, el) => {
    el.parentNode.appendChild(probe); probe.style.cssText = ''; probe.style.setProperty(prop === 'color' ? 'color' : prop, val);
    const cs = getComputedStyle(probe); let r = cs.getPropertyValue(prop);
    if (/currentcolor/i.test(val) && prop !== 'color') r = val.replace(/currentcolor/ig, getComputedStyle(el).color);
    return COLOR.has(prop) ? toHex(r) : r;
  };
  for (const el of svg.querySelectorAll('*')) {
    if (el === probe) continue;
    for (const a of ['fill','stroke','stop-color','color']) {
      const v = el.getAttribute(a);
      if (v && needs(v)) el.setAttribute(a, resolve(a, v, el));
    }
    const st = el.getAttribute('style');
    if (st && needs(st)) {
      const decls = st.split(';').map(s => s.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); return [d.slice(0,i).trim(), d.slice(i+1).trim()] });
      el.setAttribute('style', decls.map(([p,v]) => `${p}:${needs(v) ? resolve(p, v, el) : v}`).join(';'));
    }
  }
  probe.remove();
}
"""

def run():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, d in parts.items():
            pad, scale_px = 3, 1024
            inner = re.sub(r'<(animate|animatetransform|animatemotion|set)\b[^>]*?(/>|>.*?</\1>)', '', d['svg'], flags=re.I | re.S)
            if d['marks']:
                vb = (0, 0, 24, 24); body = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="480" height="480" style="color:var(--sc-line)">{inner}</svg>'
                body = re.sub(r'^<svg[^>]*>', '', inner) if False else body
            else:
                body = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-400 -400 800 800" width="800" height="800" style="color:var(--sc-line)">{inner}</svg>'
            pg = b.new_page(viewport={'width': 900, 'height': 900})
            pg.set_content(f'<html data-theme="{"dark" if d["theme"]=="dark" else "light"}"><style>{THEME[d["theme"]]} body{{margin:0;background:transparent}}</style><body>{body}</body></html>')
            pg.evaluate("(s)=>{}", None)
            x, y, w, h = pg.evaluate("""() => { const s=document.querySelector('svg'); const g=document.createElementNS('http://www.w3.org/2000/svg','g'); while(s.firstChild) g.appendChild(s.firstChild); s.appendChild(g); const bb=g.getBBox(); return [bb.x,bb.y,bb.width,bb.height]; }""")
            if d['marks']:
                x, y, w, h = 0, 0, 24, 24
            # unwrap again isn't needed; keep group (harmless)
            pg.evaluate(BAKE_JS, pg.query_selector('svg'))
            vx, vy, vw, vh = x - pad, y - pad, w + 2 * pad, h + 2 * pad
            k = scale_px / max(vw, vh)
            pg.evaluate("""([vx,vy,vw,vh,k]) => { const s=document.querySelector('svg'); s.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`); s.setAttribute('width', vw*k); s.setAttribute('height', vh*k); s.removeAttribute('style'); }""", [vx, vy, vw, vh, k])
            svg = pg.evaluate("() => document.querySelector('svg').outerHTML")
            svg = re.sub(r'\s(width|height)="[^"]*"', '', svg, count=2)
            svg = svg.replace('<svg ', '<svg width="%d" height="%d" ' % (round(vw * k), round(vh * k)), 1)
            left = [m for m in re.findall(r'var\(--[^)]*\)|color-mix', svg)]
            open(f'{OUT}/svg/{name}.svg', 'w').write(svg)
            pg.set_viewport_size({'width': round(vw * k), 'height': round(vh * k)})
            pg.set_content(f'<html style="background:transparent"><body style="margin:0">{svg}</body></html>')
            pg.screenshot(path=f'{OUT}/png/{name}.png', omit_background=True, clip={'x': 0, 'y': 0, 'width': round(vw * k), 'height': round(vh * k)})
            print(f'{name:22s} {round(vw*k)}x{round(vh*k)}  unresolved={len(left)}')
            pg.close()
        b.close()
run()
