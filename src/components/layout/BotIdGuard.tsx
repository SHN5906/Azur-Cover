"use client";

import { useEffect } from "react";
import { initBotId } from "botid/client/core";

/**
 * Initialises Vercel BotID from inside the page bundle. The package's
 * <BotIdClient> ships an inline <script>, which the nonce CSP would block;
 * calling initBotId() here means the BotID scripts are injected by already
 * trusted bundle code and pass via 'strict-dynamic'.
 */
export function BotIdGuard() {
  useEffect(() => {
    initBotId({ protect: [{ path: "/api/contact", method: "POST" }] });
  }, []);
  return null;
}
