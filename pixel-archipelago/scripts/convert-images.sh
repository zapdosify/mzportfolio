#!/usr/bin/env bash
# CP3b - site images -> WebP. Originals kept until verified.
#   * downscale anything wider than 2560px (nobody displays more)
#   * quality 88 (conservative; these are decor / gallery stills)
#   * aspect ratio preserved to <0.1%, so mediaDimensions values stay valid
set -u
cd "$(dirname "$0")/.." || exit 1
log="scripts/convert-images.log"; : > "$log"
tb=0; ta=0; n=0; fail=0

mapfile -t files < <(
  find public/images/categories -type f -name '*.png'
  find public/media/images -type f \( -name '*.png' -o -name '*.jpg' \)
  echo public/images/about/about-avatar.png
)

for src in "${files[@]}"; do
  [ -f "$src" ] || continue
  out="${src%.*}.webp"
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$src" \
    -vf "scale='min(2560,iw)':-2:flags=lanczos" \
    -c:v libwebp -quality 88 -compression_level 4 -metadata:s:v:0 handler_name= \
    "$out" 2>>"$log"
  if [ ! -s "$out" ]; then echo "FAIL $src" >> "$log"; fail=$((fail+1)); continue; fi
  b=$(stat -c%s "$src"); a=$(stat -c%s "$out")
  tb=$((tb+b)); ta=$((ta+a)); n=$((n+1))
  awk -v b="$b" -v a="$a" -v f="$src" 'BEGIN{printf "%8.0f -> %7.0f KB  %s\n", b/1024, a/1024, f}' >> "$log"
done

awk -v n="$n" -v x="$fail" -v b="$tb" -v a="$ta" \
  'BEGIN{printf "\nDONE  %d converted, %d failed.  %.1f MB -> %.1f MB\n", n, x, b/1048576, a/1048576}' >> "$log"
