import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Proxy authentifié : valide le JWT et vérifie ADMIN_EMAIL en amont des
// pages /admin/*. La présence d'un cookie n'est plus suffisante — on
// décode et compare l'email. Défense en profondeur côté pages via
// `requireAdmin()`.
export default auth((req) => {
  const pathname = req.nextUrl.pathname;

  // Public : login et endpoints d'auth
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const sessionEmail = req.auth?.user?.email?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  if (!sessionEmail) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?from=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  if (!adminEmail || sessionEmail !== adminEmail) {
    // Email connecté mais non-admin : on ne révèle pas l'existence de /admin,
    // on renvoie sur la page d'accueil. Le DAL `requireAdmin` renverra
    // forbidden() si la route est atteinte malgré tout.
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
