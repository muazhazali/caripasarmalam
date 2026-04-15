"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 pb-16 md:pb-0">
      <div className="text-center space-y-4 max-w-md">
        <div className="text-5xl">🥲</div>
        <h2 className="text-xl font-semibold text-foreground">Sesuatu tidak kena</h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong loading this page. Try again or come back later.
        </p>
        {error.digest && <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>}
        <button
          onClick={reset}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          Cuba lagi
        </button>
      </div>
    </div>
  );
}
