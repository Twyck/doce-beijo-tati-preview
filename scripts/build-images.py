"""Gera as versões responsivas (WebP) de assets-src/ em public/img/ e a imagem Open Graph.

Uso: python3 scripts/build-images.py
Fonte: fotos públicas do Instagram @docebeijotati e da ficha "Doce beijo tati" no Google Maps.
Nenhuma foto de banco de imagens ou gerada.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageEnhance

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src"
OUT = ROOT / "public" / "img"
OUT.mkdir(parents=True, exist_ok=True)

WIDTHS = [480, 800, 1200, 1600, 2400]


def grade(im):
    """Correção única para todas as fotos (celular, luz fria, paredes rosa-choque):
    acalma o magenta sem tirar o rosa da marca, aquece de leve e suaviza o contraste,
    para que todas pareçam da mesma sessão."""
    hsv = im.convert("HSV")
    h, s, v = hsv.split()
    hd, sd = h.load(), s.load()
    W, H = im.size
    for y in range(H):
        for x in range(W):
            hue = hd[x, y]  # 0-255 → 0-360°
            if hue >= 205 or hue <= 6:  # rosa/magenta (≈290°–360°)
                sd[x, y] = int(sd[x, y] * 0.58)
    out = Image.merge("HSV", (h, s, v)).convert("RGB")
    r, g, b = out.split()
    r = r.point(lambda c: min(255, c * 1.02 + 2))
    b = b.point(lambda c: c * 0.95)
    out = Image.merge("RGB", (r, g, b))
    out = ImageEnhance.Color(out).enhance(0.88)
    out = ImageEnhance.Contrast(out).enhance(1.04)
    return out.point(lambda c: 10 + c * (246 - 10) / 255)


manifest = {}

for f in sorted([p for p in SRC.iterdir() if p.suffix in (".jpg", ".png", ".webp")]):
    im = ImageOps.exif_transpose(Image.open(f))
    alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info
    im = im.convert("RGBA" if alpha else "RGB")
    if im.width > 2400:
        im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
    if not alpha:
        im = grade(im)
    w, h = im.size
    sizes = sorted(set([x for x in WIDTHS if x < w] + [min(w, WIDTHS[-1])]))
    for tw in sizes:
        th = round(h * tw / w)
        im.resize((tw, th), Image.LANCZOS).save(OUT / f"{f.stem}-{tw}.webp", "WEBP", quality=80, method=6)
    manifest[f.stem] = {"w": w, "h": h, "sizes": sizes}
    print(f.stem, w, h, sizes)

(ROOT / "src" / "images.json").write_text(json.dumps(manifest, indent=2))

# Open Graph 1200x630: chantilly + foto do bolo nuvem + nome
CREME, CACAU, ROSA = (247, 241, 234), (42, 29, 23), (166, 92, 99)
og = Image.new("RGB", (1200, 630), CREME)
photo = ImageOps.fit(grade(ImageOps.exif_transpose(Image.open(SRC / "bolo-nuvem.jpg")).convert("RGB").reduce(3)), (520, 630), centering=(0.5, 0.62))
og.paste(photo, (680, 0))
d = ImageDraw.Draw(og)
serif = "/System/Library/Fonts/Supplemental/Georgia Italic.ttf"
serif_r = "/System/Library/Fonts/Supplemental/Georgia.ttf"
sans = "/System/Library/Fonts/Supplemental/Arial.ttf"
d.text((70, 120), "CONFEITARIA ARTESANAL · VILA ZAT, PIRITUBA", font=ImageFont.truetype(sans, 20), fill=ROSA)
d.text((66, 170), "Doce Beijo Tati", font=ImageFont.truetype(serif, 84), fill=CACAU)
d.text((70, 300), "O lado doce da vida.", font=ImageFont.truetype(serif_r, 44), fill=CACAU)
d.text((70, 480), "Bolos, doces e salgados · delivery seg. a sáb.", font=ImageFont.truetype(sans, 24), fill=CACAU)
og.save(ROOT / "public" / "og-doce-beijo-tati.jpg", "JPEG", quality=86, optimize=True)
print("og ok")
