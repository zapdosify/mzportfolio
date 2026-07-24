"""Measure every web media asset and emit src/data/mediaDimensions.ts.

Layout must follow the assets, not hand-written guesses: the previous
hand-set `ratio` hints disagreed with the real files (landscape presentation
boards tagged `portrait`, square posters tagged `portrait`, etc.), so images
were cropped by `object-fit: cover`.

Videos have no dimensions read here — each one ships a poster frame exported
at the video's own resolution, so the poster's aspect is used for the video.

Run:  py tools/measure_media.py
"""

from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "pixel-archipelago" / "public" / "media"
IMAGES = MEDIA / "images"
OUT = ROOT / "pixel-archipelago" / "src" / "data" / "mediaDimensions.ts"

HEADER = """// GENERATED FILE — do not edit by hand.
// Regenerate with:  py tools/measure_media.py
//
// Intrinsic pixel dimensions of every image asset, measured from disk.
// Layout derives aspect ratio from these so nothing is cropped or distorted.
// Videos are keyed by their poster frame (exported at the video's resolution).

export type Dimensions = readonly [width: number, height: number];

export const mediaDimensions: Record<string, Dimensions> = {
"""

FOOTER = """};

/** Intrinsic dimensions for a public media path, if it was measured. */
export const dimensionsFor = (src?: string): Dimensions | undefined =>
  src ? mediaDimensions[src] : undefined;
"""


def main() -> None:
    if not IMAGES.is_dir():
        raise SystemExit(f"media images not found: {IMAGES}")

    rows: list[str] = []
    for path in sorted(IMAGES.rglob("*")):
        if not path.is_file():
            continue
        with Image.open(path) as im:
            w, h = im.size
        key = "/media/images/" + path.relative_to(IMAGES).as_posix()
        rows.append(f'  "{key}": [{w}, {h}],')

    OUT.write_text(HEADER + "\n".join(rows) + "\n" + FOOTER, encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(rows)} assets)")


if __name__ == "__main__":
    main()
