# Cuts the two Tremor spike sheets (art/animations/src/, 3 x 2 grids of growth frames on transparency)
# into 6-frame strips for the game: src/img/fx/tremor_side.png and src/img/fx/tremor_up.png.
# Every frame sits on the bottom of a shared box: the upright spike centred, the side spike from its left end,
# so it grows out toward its tip (to the right; the game mirrors it for the other way).
# Usage: python3 scripts/cut-tremor.py   (needs Pillow)
from PIL import Image
import os
ROOT = os.path.join(os.path.dirname(__file__), '..')
FAINT, SOLID, OUT_H = 24, 240, 96  # alpha cut-offs (as in cut-sheets.js) and output frame height

def frames(path):
    im = Image.open(path).convert('RGBA')
    a = im.getchannel('A').point(lambda v: 0 if v < FAINT else 255 if v >= SOLID else v)
    im.putalpha(a)
    cw, ch = im.width // 3, im.height // 2
    out = []
    for r in range(2):
        for c in range(3):
            cell = im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
            out.append(cell.crop(cell.getbbox()))
    return out

for name in ('side', 'up'):
    fr = frames(os.path.join(ROOT, 'art/animations/src/tremor_spike_%s.webp' % name))
    W = max(f.width for f in fr) + 8; H = max(f.height for f in fr) + 4
    scale = OUT_H / H; fw = round(W * scale)
    strip = Image.new('RGBA', (fw * len(fr), OUT_H), (0, 0, 0, 0))
    for i, f in enumerate(fr):
        g = f.resize((max(1, round(f.width * scale)), max(1, round(f.height * scale))), Image.LANCZOS)
        x = 3 if name == 'side' else (fw - g.width) // 2
        strip.alpha_composite(g, (i * fw + x, OUT_H - g.height - 1))
    strip.save(os.path.join(ROOT, 'src/img/fx/tremor_%s.png' % name), optimize=True)
    print(name, 'frame', fw, 'x', OUT_H)
