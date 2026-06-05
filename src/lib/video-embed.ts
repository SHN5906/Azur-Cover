// Détecte le type d'URL vidéo (YouTube/Vimeo/fichier direct) et calcule l'URL
// d'embed correspondante. Permet aux admins de coller n'importe quelle URL
// publique (lien de partage, embed, raccourci youtu.be, .mp4 sur Blob) sans
// se soucier du format final.

export type VideoEmbed =
  | { kind: "youtube"; embedUrl: string; title: string }
  | { kind: "vimeo"; embedUrl: string; title: string }
  | { kind: "file"; src: string; mime: string };

/** YouTube video IDs are 11 alphanumeric/dash/underscore chars. */
const YT_ID_RE = /^[\w-]{1,20}$/;

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = url.pathname.slice(1).split("/")[0] || null;
  } else if (host === "youtube.com" || host === "m.youtube.com") {
    const v = url.searchParams.get("v");
    if (v) {
      id = v;
    } else {
      // /embed/<id> ou /shorts/<id>
      const match = url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/);
      id = match?.[1] ?? null;
    }
  }
  // Validate ID shape — reject anything that doesn't look like a real YT id
  // to avoid injecting arbitrary strings into the embed URL (INFO-02).
  return id && YT_ID_RE.test(id) ? id : null;
}

function vimeoId(url: URL): string | null {
  if (!url.hostname.includes("vimeo.com")) return null;
  const m = url.pathname.match(/\/(\d+)/);
  return m?.[1] ?? null;
}

function fileMime(pathname: string): string | null {
  const ext = pathname.toLowerCase().split(".").pop();
  switch (ext) {
    case "mp4":
    case "m4v":
      return "video/mp4";
    case "webm":
      return "video/webm";
    case "mov":
      return "video/quicktime";
    default:
      return null;
  }
}

export function parseVideoEmbed(rawUrl: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const yt = youtubeId(url);
  if (yt) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube.com/embed/${yt}?rel=0`,
      title: "Vidéo YouTube du chantier",
    };
  }
  const vm = vimeoId(url);
  if (vm) {
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vm}`,
      title: "Vidéo Vimeo du chantier",
    };
  }
  const mime = fileMime(url.pathname);
  if (mime) {
    return { kind: "file", src: url.toString(), mime };
  }
  return null;
}
