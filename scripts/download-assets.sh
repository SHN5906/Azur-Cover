#!/usr/bin/env bash
# Downloads every Wix-hosted asset used by the site into public/.
# Idempotent: skips files that already exist.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p \
  public/images/clients \
  public/images/solutions \
  public/images/sectors \
  public/images/realisations \
  public/images/methodology \
  public/images/characters \
  public/images/hero \
  public/video

dl() {
  local url="$1"
  local dest="$2"
  if [[ -f "$dest" ]]; then
    echo "·  skip $dest"
  else
    echo "↓  $dest"
    curl -sL --max-time 60 "$url" -o "$dest.tmp" && mv "$dest.tmp" "$dest"
  fi
}

# --- Clients (13) ---------------------------------------------------------
WIX="https://static.wixstatic.com/media"
dl "$WIX/443900_152c33aa843f43a5ab0096727851a5d6~mv2.png" public/images/clients/thales.png
dl "$WIX/443900_e61e95fe064c42aea3979ea2d6c77330~mv2.png" public/images/clients/metropole-nice.png
dl "$WIX/443900_3dd4b7d30c5b48dcaf2b8ccee63434c5~mv2.png" public/images/clients/ch-grasse.png
dl "$WIX/443900_09eee79fad1c4331b957022a5afa5dd7~mv2.jpg" public/images/clients/antibes.jpg
dl "$WIX/443900_3141bb8504d94a7b94bfd936952cbd3e~mv2.png" public/images/clients/fayence.png
dl "$WIX/443900_34bb049dcce743359af7c7dabe5663c9~mv2.jpg" public/images/clients/intermarche.jpg
dl "$WIX/443900_2e1aca9fa4c54fb498e8d3e9362f4349~mv2.webp" public/images/clients/netto.webp
dl "$WIX/443900_13ca0569e91d496899ce424334185c4a~mv2.jpg" public/images/clients/u-express.jpg
dl "$WIX/443900_6364d023c6cf4389909d46b9bbcc3847~mv2.png" public/images/clients/promocash.png
dl "$WIX/443900_4903402005d14e0d88532ee668fa7801~mv2.png" public/images/clients/satoriz.png
dl "$WIX/443900_a4a3cb13ed7b49ee97d4cead91c955be~mv2.png" public/images/clients/ligier.png
dl "$WIX/443900_9bb6bca943bc4c8186151ef1aa460b64~mv2.jpg" public/images/clients/marcel-fils.jpg
dl "$WIX/443900_c946b94b4f5a4fe0ab438b5efcc8705d~mv2.png" public/images/clients/groupe-braja.png

# --- Solutions (4 planètes) ----------------------------------------------
dl "$WIX/443900_a29e1d678ae643499f7d5a501cbf15d2~mv2.png" public/images/solutions/etancheite.png
dl "$WIX/443900_a3cdedd2708241c7a996f23dc834ab16~mv2.jpg" public/images/solutions/cool-roofing.jpg
dl "$WIX/443900_4e7752e4d747405abc8db167b991cc69~mv2.jpg" public/images/solutions/azur-reflect.jpg
dl "$WIX/443900_66e590b02ee94032a2101efe0648cb4e~mv2.png" public/images/solutions/autres.png

# --- Réalisations (3) ----------------------------------------------------
dl "$WIX/443900_d4ee3055b1984377a585457e21086402~mv2.png" public/images/realisations/promocash.png
dl "$WIX/443900_381b5b6cd3de4f70a2ce573493d9b169~mv2.png" public/images/realisations/ecole-cannes.png
dl "$WIX/443900_52a484b0cc3d4fe49b55c80f4d8c6e9d~mv2.jpg" public/images/realisations/netto.jpg

# --- Méthodologie (4 photos illustratives) -------------------------------
dl "$WIX/443900_36e316374c3b45348daa30af655bec86~mv2.png" public/images/methodology/01-audit.png
dl "$WIX/443900_fe552326f7df48678e7ab2d3f8b3df28~mv2.png" public/images/methodology/02-preconisation.png
dl "$WIX/443900_0815b1fa26ee4fa58df1957faa8bde3e~mv2.png" public/images/methodology/03-mise-en-oeuvre.png
dl "$WIX/443900_833155368dc34c658c08439527459cf0~mv2.png" public/images/methodology/04-controle.png

# --- Personnages vidéo (2) -----------------------------------------------
dl "$WIX/443900_fa5666258b55471d93544cc4ceed7b22~mv2.png" public/images/characters/left.png
dl "$WIX/443900_8a4e779d5dfd428fa6a63485ce9711a7~mv2.png" public/images/characters/right.png

# --- Hero ----------------------------------------------------------------
dl "$WIX/443900_b380f6264cfd43e18a26d49a34181712~mv2.jpg" public/images/hero/building.jpg

# --- Secteurs (réutilisation des photos réalisations / hero) -------------
# Pas de photos dédiées sectorielles sur le Wix actuel : on réemploie.
cp -n public/images/realisations/promocash.png  public/images/sectors/industrie.png   2>/dev/null || true
cp -n public/images/realisations/ecole-cannes.png public/images/sectors/collectivites.png 2>/dev/null || true
cp -n public/images/realisations/netto.jpg      public/images/sectors/tertiaire.jpg    2>/dev/null || true

# --- Vidéo ---------------------------------------------------------------
dl "https://video.wixstatic.com/video/443900_b9b5d0fa83394c9cb8d820c9b6461080/1080p/mp4/file.mp4" public/video/azur-cover-presentation.mp4

# --- Encodage 720p + poster (si ffmpeg dispo) ----------------------------
if command -v ffmpeg >/dev/null 2>&1; then
  if [[ ! -f public/video/azur-cover-presentation-720p.mp4 ]]; then
    echo "↻  encoding 720p"
    ffmpeg -loglevel error -y -i public/video/azur-cover-presentation.mp4 \
      -vf scale=-2:720 -c:v libx264 -crf 23 -preset slow \
      -c:a aac -b:a 128k public/video/azur-cover-presentation-720p.mp4
  fi
  if [[ ! -f public/video/azur-cover-poster.jpg ]]; then
    echo "↻  poster frame"
    ffmpeg -loglevel error -y -i public/video/azur-cover-presentation.mp4 \
      -ss 00:00:03 -vframes 1 -q:v 2 public/video/azur-cover-poster.jpg
  fi
fi

# --- Down-sample des fichiers > 2 Mo via sips (macOS) --------------------
if command -v sips >/dev/null 2>&1; then
  while IFS= read -r f; do
    size=$(stat -f%z "$f")
    if (( size > 2000000 )); then
      echo "↳  downscale $(basename "$f") ($((size/1024)) Ko)"
      ext="${f##*.}"
      if [[ "$ext" == "png" || "$ext" == "PNG" ]]; then
        # Convert big PNG photos to JPEG (kept as .jpg sibling)
        sips -s format jpeg -s formatOptions 82 --resampleWidth 2200 "$f" --out "${f%.*}.jpg" >/dev/null
        rm "$f"
      else
        sips --resampleWidth 2200 -s formatOptions 82 "$f" --out "$f" >/dev/null
      fi
    fi
  done < <(find public/images -type f \( -name "*.jpg" -o -name "*.png" \))
fi

echo
echo "✅  All assets in place."
