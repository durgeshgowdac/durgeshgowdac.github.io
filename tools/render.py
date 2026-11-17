"""Draw everything the docs show, from one build file (.build/art.json, written by registry.tsx).

    render.py [parts] [sheets] [scenes] [--no-bg]        (no step named = all three)

parts    every registered part, in both themes, as a tightly cropped SVG with every var() / color-mix() / class baked into
         plain values (art/parts/<theme>/<Name>.svg); the home-theme version of each also as a 1024 px transparent PNG.
         The cutaways (tight crops of a scene's moving parts) are baked the same way: art/scenes/<id>-<theme>.svg.
sheets   the group sheets for illustrations.md (art/sheets/<group>-<theme>.svg) and the contact sheets for
         characters.md (art/characters/<group>.png). Both are composed from the SVGs baked above, so a drawing
         is rendered once and reused everywhere.
scenes   every scene photographed in a browser with the site's own stylesheet (art/scenes/<id>-<theme>.png, 2x).
         Strips keep their sky gradient unless --no-bg is given.

Real CSS (globals.css, @imports inlined in order) + real fonts + the real theme switch (data-theme) in every step, so a colour
change on the site shows up in the next run.
"""
import json, os, re, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..'))
BUILD = os.path.join(HERE, '.build')
OUT = os.path.join(REPO, 'art')
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
STEPS = set(ARGS) or {'parts', 'sheets', 'scenes'}
NO_BG = '--no-bg' in sys.argv
PAD = 3            # units of air around a part's bounds
PNG_PX = 1024      # longest side of a part PNG

def inline_css(path):
    src = open(path).read(); base = os.path.dirname(path)
    return re.sub(r"@import\s+'([^']+)';", lambda m: inline_css(os.path.join(base, m.group(1))), src)

CSS = inline_css(os.path.join(REPO, 'app', 'globals.css'))
# element-marks.css is imported by the components that use it, not by globals.css; the faction colours (--mark-empire …) live there
CSS += '\n' + inline_css(os.path.join(REPO, 'app', 'styles', 'element-marks.css'))
FONTS = ''
for fam, files in {'DM Mono': [('300', 'normal', 'dm-mono-latin-300-normal'), ('300', 'italic', 'dm-mono-latin-300-italic'), ('400', 'normal', 'dm-mono-latin-400-normal'), ('500', 'normal', 'dm-mono-latin-500-normal')],
                   'DM Serif Display': [('400', 'normal', 'dm-serif-display-latin-400-normal'), ('400', 'italic', 'dm-serif-display-latin-400-italic')]}.items():
    for w, st, f in files:
        p = os.path.join(REPO, 'app', 'fonts', f + '.woff2')
        if os.path.exists(p): FONTS += f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:{st};src:url('file://{p}') format('woff2')}}\n"

data = json.load(open(os.path.join(BUILD, 'art.json')))
chars = json.load(open(os.path.join(HERE, 'characters.json')))
THEMES = ('light', 'dark')

# ── the baker: runs in the page, turns one live <svg> into a self-contained one ──
BAKE_JS = r"""
(svg) => {
  const NS = 'http://www.w3.org/2000/svg';
  const probe = document.createElementNS(NS, 'g'); svg.appendChild(probe);
  const cv = document.createElement('canvas').getContext('2d');
  const toHex = (c) => { cv.fillStyle = '#000'; cv.fillStyle = c; return cv.fillStyle; };
  const COLOR = new Set(['fill', 'stroke', 'stop-color', 'color', 'flood-color']);
  const needs = (v) => /var\(|color-mix|currentcolor/i.test(v);
  const resolve = (prop, val, el) => {
    el.parentNode.appendChild(probe); probe.style.cssText = ''; probe.style.setProperty(prop, val);
    let r = getComputedStyle(probe).getPropertyValue(prop);
    if (/currentcolor/i.test(val) && prop !== 'color') r = val.replace(/currentcolor/ig, getComputedStyle(el).color);
    return COLOR.has(prop) ? toHex(r) : r;
  };
  // 1. anything a stylesheet class does (speech-bubble text, show/hide rules) becomes plain style, then the class goes
  const BASE = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-dasharray', 'opacity', 'fill-opacity', 'stroke-opacity', 'display', 'visibility'];
  const TEXT = ['font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'paint-order'];
  const SKIP = { opacity: '1', 'fill-opacity': '1', 'stroke-opacity': '1', display: 'inline', visibility: 'visible', 'stroke-dasharray': 'none' };
  for (const el of svg.querySelectorAll('[class]')) {
    if (el.namespaceURI !== NS) continue;
    const tag = el.tagName.toLowerCase(), cs = getComputedStyle(el);
    const props = tag === 'g' ? ['display', 'visibility', 'opacity'] : (tag === 'text' || tag === 'tspan') ? BASE.concat(TEXT) : BASE;
    const add = props.map(p => [p, cs.getPropertyValue(p)]).filter(([p, v]) => v && SKIP[p] !== v).map(([p, v]) => `${p}:${v}`).join(';');
    if (add) el.setAttribute('style', (el.getAttribute('style') ? el.getAttribute('style') + ';' : '') + add);
    el.removeAttribute('class');
  }
  // 2. every var() / color-mix() / currentColor left in an attribute or style becomes a hex colour
  for (const el of svg.querySelectorAll('*')) {
    if (el === probe) continue;
    for (const a of ['fill', 'stroke', 'stop-color', 'color']) {
      const v = el.getAttribute(a); if (v && needs(v)) el.setAttribute(a, resolve(a, v, el));
    }
    const st = el.getAttribute('style');
    if (st && needs(st)) {
      const decls = st.split(';').map(s => s.trim()).filter(Boolean).map(d => { const i = d.indexOf(':'); return [d.slice(0, i).trim(), d.slice(i + 1).trim()]; });
      el.setAttribute('style', decls.map(([p, v]) => `${p}:${needs(v) ? resolve(p, v, el) : v}`).join(';'));
    }
  }
  probe.remove();
}
"""
BOUNDS_JS = """() => { const s = document.querySelector('#host svg'); const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  while (s.firstChild) g.appendChild(s.firstChild); s.appendChild(g); const b = g.getBBox(); return [b.x, b.y, b.width, b.height]; }"""
THEME_JS = """() => { const cv = document.createElement('canvas').getContext('2d'); const cs = getComputedStyle(document.documentElement);
  const hex = v => { cv.fillStyle = '#000'; cv.fillStyle = v.trim(); return cv.fillStyle; };
  return { bg: hex(cs.getPropertyValue('--bg')), ink: hex(cs.getPropertyValue('--sc-line')) }; }"""

def strip_motion(s):
    return re.sub(r'<(animate|animatetransform|animatemotion|set)\b[^>]*?(/>|>.*?</\1>)', '', s, flags=re.I | re.S)

class Baker:
    """One Chromium page per theme, loaded once with the real stylesheet; every part is dropped into it, baked, and read back."""
    def __init__(self, browser):
        self.pages = {}; self.colors = {}
        for t in THEMES:
            html = (f'<!doctype html><html data-theme="{t}"><head><meta charset="utf-8"><style>{FONTS}{CSS}\nbody{{margin:0;background:transparent}} *,*::before,*::after{{animation:none!important;transition:none!important}}</style></head>'
                    f'<body><div id="host"></div></body></html>')
            tmp = os.path.join(BUILD, f'bake-{t}.html'); open(tmp, 'w').write(html)
            pg = browser.new_page(viewport={'width': 1000, 'height': 1000}); pg.goto('file://' + tmp); pg.wait_for_timeout(200)
            self.pages[t] = pg; self.colors[t] = pg.evaluate(THEME_JS)
    def bake(self, markup, theme, marks=False, view=None, backdrop=False):
        pg = self.pages[theme]; inner = strip_motion(markup)
        # strip the wrapper <svg> React gave us (marks and a few parts render their own); we supply the frame
        if marks: frame = '0 0 24 24'; size = 480
        elif view: frame = ' '.join(map(str, view)); size = 800
        else: frame = '-600 -600 1200 1200'; size = 1200
        pg.evaluate("(h) => { document.getElementById('host').innerHTML = h }",
                    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{frame}" width="{size}" height="{size}" style="color:var(--sc-line);overflow:visible">{inner}</svg>')
        x, y, w, h = pg.evaluate(BOUNDS_JS)
        pg.evaluate(BAKE_JS, pg.query_selector('#host svg'))
        if marks: x, y, w, h = 0, 0, 24, 24
        elif view: x, y, w, h = view
        pad = 10 if backdrop else (0 if view else PAD)
        vx, vy, vw, vh = x - pad, y - pad, w + 2 * pad, h + 2 * pad
        k = PNG_PX / max(vw, vh)
        pg.evaluate("([vx,vy,vw,vh]) => { const s = document.querySelector('#host svg'); s.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`); s.removeAttribute('style'); s.removeAttribute('width'); s.removeAttribute('height'); }", [vx, vy, vw, vh])
        svg = pg.evaluate("() => document.querySelector('#host svg').outerHTML")
        svg = svg.replace('<svg ', f'<svg width="{round(vw * k)}" height="{round(vh * k)}" ', 1)
        if backdrop:   # a cutaway sits on its own paper, so it reads on a light or a dark page
            svg = re.sub(r'(<svg[^>]*>)', lambda m: m.group(1) + f'<rect x="{vx}" y="{vy}" width="{vw}" height="{vh}" rx="{min(vw, vh) * 0.03:.1f}" fill="{self.colors[theme]["bg"]}"/>', svg, count=1)
        svg = re.sub(r' data-part=""', '', svg)
        svg = re.sub(r'\sclass="[^"]*"', '', svg)
        left = len(re.findall(r'var\(--[^)]*\)|color-mix', svg))
        return {'svg': svg, 'w': round(vw * k), 'h': round(vh * k), 'vb': (vx, vy, vw, vh), 'left': left}

def write(path, text, mode='w'):
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, mode).write(text)

def png_of(browser, svg, w, h, path, bg=None, scale=1):
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=scale); pg = ctx.new_page()
    pg.set_content(f'<html style="background:{bg or "transparent"}"><body style="margin:0">{svg}</body></html>')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    pg.screenshot(path=path, omit_background=bg is None, clip={'x': 0, 'y': 0, 'width': w, 'height': h}); ctx.close()

# ───────────────────────── sheets ─────────────────────────
def sheet(items, theme, colors, cols, cell, art_h, kmax, lab=11):
    """items: [(label, baked)] → one SVG. Cells are bottom-aligned (parts stand on a ground line), shrunk to fit, never blown up past kmax."""
    cw, ch = cell; rows = -(-len(items) // cols); W, H = cols * cw + 24, rows * ch + 24
    bg, ink = colors['bg'], colors['ink']; body = []
    for i, (label, b) in enumerate(items):
        cx, cy = 12 + (i % cols) * cw, 12 + (i // cols) * ch
        vx, vy, vw, vh = b['vb']; k = min((cw - 20) / vw, art_h / vh, kmax); w, h = vw * k, vh * k
        pre = f'p{i}-'; inner = b['svg'][b['svg'].index('>') + 1: b['svg'].rindex('</svg>')]
        for n in set(re.findall(r'\bid="([^"]+)"', inner)):
            inner = inner.replace(f'id="{n}"', f'id="{pre}{n}"').replace(f'url(#{n})', f'url(#{pre}{n})').replace(f'href="#{n}"', f'href="#{pre}{n}"')
        body.append(f'<svg x="{cx + (cw - w) / 2:.1f}" y="{cy + 8 + art_h - h:.1f}" width="{w:.1f}" height="{h:.1f}" viewBox="{vx} {vy} {vw} {vh}" overflow="visible" style="color:{ink}">{inner}</svg>')
        body.append(f'<text x="{cx + cw / 2}" y="{cy + art_h + 8 + lab + 8}" text-anchor="middle" font-family="DM Mono, ui-monospace, Menlo, monospace" font-size="{lab}" fill="{ink}" fill-opacity="0.7">{label}</text>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" rx="12" fill="{bg}"/>'
            f'<rect x=".5" y=".5" width="{W - 1}" height="{H - 1}" rx="12" fill="none" stroke="{ink}" stroke-opacity="0.14"/>' + ''.join(body) + '</svg>'), W, H

with sync_playwright() as p:
    browser = p.chromium.launch()
    os.makedirs(BUILD, exist_ok=True)
    baked = {}   # (part id, theme) -> baked svg
    if STEPS & {'parts', 'sheets'}:
        bk = Baker(browser); dirty = 0
        for g in data['groups']:
            for part in g['parts']:
                b = bk.bake(part['svg'], part['theme'], marks=g['marks']); baked[(part['id'], part['theme'])] = b; dirty += b['left']
                if 'parts' in STEPS:
                    write(f"{OUT}/parts/{part['theme']}/{part['id']}.svg", b['svg'])
                    if part['home']: png_of(browser, b['svg'], b['w'], b['h'], f"{OUT}/parts/{part['theme']}/{part['id']}.png")
        for c in data['cutaways']:
            b = bk.bake(c['svg'], c['theme'], view=c['view'], backdrop=True); dirty += b['left']
            if 'parts' in STEPS: write(f"{OUT}/scenes/{c['id']}-{c['theme']}.svg", b['svg'])
        n = len(baked)
        if 'parts' in STEPS: print(f"parts: {n} baked ({n // 2} drawings x2 themes), {len(data['cutaways'])} cutaways, unresolved colours: {dirty}")
        if 'sheets' in STEPS:
            for g in data['groups']:
                for t in g['sheets']:
                    items = [(i[4:] if g['marks'] else i, baked[(i, t)]) for i in g['ids']]
                    small = g['marks']
                    svg, W, H = sheet(items, t, bk.colors[t], cols=min(len(items), 8 if len(items) > 12 else 6), cell=(110, 110) if small else (150, 150), art_h=84 if small else 112, kmax=3.5 if small else 2)
                    write(f"{OUT}/sheets/{g['id']}-{t}.svg", svg)
            for g in chars['groups']:
                t = g['theme']; small = g['id'].startswith('marks')
                items = [(m['name'].split(' (')[0], baked[(m['part'], t)]) for m in g['members']]
                svg, W, H = sheet(items, t, bk.colors[t], cols=min(len(items), 4 if len(items) <= 8 else 7), cell=(150, 150) if small else (190, 190), art_h=100 if small else 150, kmax=3.5 if small else 1.7, lab=12)
                png_of(browser, svg, W, H, f"{OUT}/characters/{g['id']}.png", bg='transparent', scale=2)
            print(f"sheets: {sum(len(g['sheets']) for g in data['groups'])} group sheets, {len(chars['groups'])} contact sheets")
        for pg in bk.pages.values(): pg.close()

    if 'scenes' in STEPS:
        extra = '.card-art{background:none!important;border:0!important}' if NO_BG else ''
        for r in data['renders']:
            name = f"{r['id']}-{r['theme']}"
            html = (f"<!doctype html><html data-theme=\"{r['theme']}\"><head><meta charset=\"utf-8\"><style>{FONTS}{CSS}\n"
                    f".card-art{{margin:0!important}} body{{margin:0;overflow:visible}} #stage{{width:{r['w']}px;{'' if r['bg'] == 'strip' else 'background:var(--bg);'}}}\n"
                    f"*,*::before,*::after{{transition:none!important}}{extra}</style></head><body><div id=\"stage\">{r['svg']}</div></body></html>")
            tmp = os.path.join(BUILD, name + '.html'); open(tmp, 'w').write(html)
            ctx = browser.new_context(viewport={'width': max(r['w'], 900), 'height': max(r['h'], 700)}, device_scale_factor=2, reduced_motion='reduce')
            pg = ctx.new_page(); pg.goto('file://' + tmp); pg.wait_for_timeout(400)
            el = pg.query_selector('#stage ' + r['shot']) or pg.query_selector('#stage')
            os.makedirs(f'{OUT}/scenes', exist_ok=True)
            el.screenshot(path=f'{OUT}/scenes/{name}.png', omit_background=NO_BG)
            box = el.bounding_box(); print(f"scene {name:34s} {round(box['width'])}x{round(box['height'])}")
            ctx.close(); os.remove(tmp)
    browser.close()