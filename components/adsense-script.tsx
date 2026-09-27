"use client";

import { useEffect } from "react";

const ADSENSE_SCRIPT_ID = "adsbygoogle-init";

export function AdSenseScript() {
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
    if (process.env.NODE_ENV !== "production" || !clientId || document.getElementById(ADSENSE_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
