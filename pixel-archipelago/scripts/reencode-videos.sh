#!/usr/bin/env bash
# CP3a - re-encode every public/media video at CRF 20 (visually transparent),
# faststart for progressive playback. Same .mp4 path -> no code changes.
# Replaces the original only when the result is >=8% smaller.
set -u
cd "$(dirname "$0")/.." || exit 1
root="public/media/videos"
log="scripts/reencode-videos.log"
: > "$log"

mapfile -t files < <(find "$root" -type f -name '*.mp4' | sort)
tb=0; ta=0; kept=0; skipped=0

for f in "${files[@]}"; do
  before=$(stat -c%s "$f")
  tmp="${f%.mp4}.__reenc.mp4"
  # -nostdin: ffmpeg must NOT read the shell's stdin (it is our file list source)
  ffmpeg -nostdin -hide_banner -loglevel error -y -i "$f" \
    -c:v libx264 -crf 20 -preset fast -pix_fmt yuv420p \
    -movflags +faststart \
    -c:a aac -b:a 128k -ac 2 \
    "$tmp" 2>>"$log"
  if [ ! -s "$tmp" ]; then
    echo "FAIL   ${f#public/media/videos/}" | tee -a "$log"
    rm -f "$tmp"; tb=$((tb+before)); ta=$((ta+before)); skipped=$((skipped+1)); continue
  fi
  after=$(stat -c%s "$tmp")
  tb=$((tb+before))
  if [ "$after" -lt $((before*92/100)) ]; then
    mv -f "$tmp" "$f"; ta=$((ta+after)); kept=$((kept+1))
    awk -v b="$before" -v a="$after" -v n="${f#public/media/videos/}" \
      'BEGIN{printf "SHRINK %7.1f -> %6.1f MB  %s\n", b/1048576, a/1048576, n}' | tee -a "$log"
  else
    rm -f "$tmp"; ta=$((ta+before)); skipped=$((skipped+1))
    awk -v b="$before" -v n="${f#public/media/videos/}" \
      'BEGIN{printf "KEEP   %7.1f MB (not worth re-encoding)  %s\n", b/1048576, n}' | tee -a "$log"
  fi
done

awk -v k="$kept" -v s="$skipped" -v b="$tb" -v a="$ta" \
  'BEGIN{printf "\nDONE  %d re-encoded, %d kept.  %.1f MB -> %.1f MB\n", k, s, b/1048576, a/1048576}' | tee -a "$log"
