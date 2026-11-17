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
    """Correção única para todas as fotos (celular, luz fria): mantém o rosa da loja vivo,
    aquece de leve, tira o cinza da luz fluorescente e dá um contraste "de vitrine"."""
    r, g, b = im.split()[:3]
    r = r.point(lambda c: min(255, c * 1.03 + 3))
    b = b.point(lambda c: c * 0.97)
    out = Image.merge("RGB", (r, g, b))
    out = ImageEnhance.Color(out).enhance(1.08)
    out = ImageEnhance.Contrast(out).enhance(1.07)
    return out.point(lambda c: 6 + c * (250 - 6) / 255)


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

# Open Graph 1200x630: rosa da bandeira + foto do bolo nuvem + nome
PINK, CHOC, CREME = (240, 56, 138), (58, 26, 31), (255, 246, 238)
og = Image.new("RGB", (1200, 630), PINK)
photo = ImageOps.fit(grade(ImageOps.exif_transpose(Image.open(SRC / "bolo-nuvem.jpg")).convert("RGB").reduce(3)), (430, 520), centering=(0.5, 0.62))
frame = Image.new("RGB", (450, 540), CREME); frame.paste(photo, (10, 10))
frame = frame.rotate(-4, expand=True, fillcolor=PINK, resample=Image.BICUBIC)
og.paste(frame, (720, 30))
d = ImageDraw.Draw(og)
disp = str(ROOT / "node_modules/@fontsource/shrikhand/files/shrikhand-latin-400-normal.woff2")
try:
    big = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Black.ttf", 92)
except Exception:
    big = ImageFont.load_default()
sans = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
d.text((70, 110), "CONFEITARIA ARTESANAL · PIRITUBA", font=ImageFont.truetype(sans, 22), fill=CREME)
d.text((64, 160), "Doce Beijo", font=big, fill=CREME)
d.text((64, 270), "Tati", font=big, fill=CHOC)
d.text((70, 430), "O lado doce da vida.", font=ImageFont.truetype(sans, 40), fill=CREME)
d.text((70, 500), "Bolos, doces e salgados · delivery seg. a sáb.", font=ImageFont.truetype(sans, 24), fill=CHOC)
og.save(ROOT / "public" / "og-doce-beijo-tati.jpg", "JPEG", quality=88, optimize=True)
print("og ok")
