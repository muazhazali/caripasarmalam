"use client";

import { useEffect } from "react";

const ADSENSE_SCRIPT_ID = "adsbygoogle-init";
const ADSENSE_CLIENT_ID = "ca-pub-3393623405576068";

export function AdSenseScript() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || document.getElementById(ADSENSE_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
