#!/usr/bin/env bash
# CP3b - repoint image references from .png/.jpg to the converted .webp.
# Only rewrites extensions that sit at the end of a quoted or back-ticked
# path string; every such string in these files is an image path.
set -eu
cd "$(dirname "$0")/.." || exit 1

files=(
  src/data/categories.ts
  src/data/projects.ts
  src/data/avengersExhibition.ts
  src/data/manifestoBook.ts
  src/data/solarpunkStory.ts
  src/data/siteContent.ts
  src/data/businessContent.ts
  src/data/mediaDimensions.ts
)

for f in "${files[@]}"; do
  [ -f "$f" ] || continue
  before=$(grep -cE '\.(png|jpe?g)(["`])' "$f" || true)
  sed -i -E 's/\.(png|jpe?g)(["`])/.webp\2/g' "$f"
  after=$(grep -cE '\.(png|jpe?g)(["`])' "$f" || true)
  printf '%-32s  %s -> %s remaining\n' "$f" "$before" "$after"
done

echo
echo "Any surviving raster refs under /media or /images/{categories,about}:"
grep -rnE '\.(png|jpe?g)(["`])' src/ | grep -E '/media/|/images/(categories|about)/' || echo "  none — clean"
