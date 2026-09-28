"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Construction, Home, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const CONFETTI_COLORS = ["#f59e0b", "#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa"];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  color: string;
  duration: number;
}

function ConfettiBurst() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const next: ConfettiPiece[] = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: 4 + Math.random() * 92,
        delay: Math.random() * 0.35,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 0.9 + Math.random() * 0.6,
      }));
      setPieces(next);
    }, 0);
    const cleanup = setTimeout(() => setPieces([]), 2200);
    return () => {
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="wip-confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export function WipBanner() {
  const { t } = useLanguage();

  return (
    <div className="relative wip-card overflow-hidden rounded-2xl border-2 border-amber-300/60 dark:border-amber-500/40 bg-gradient-to-br from-amber-50 via-card to-orange-50 dark:from-amber-950/30 dark:via-card dark:to-orange-950/20 p-6 md:p-8 text-center shadow-sm">
      <ConfettiBurst />

      {/* twinkling sparkles */}
      <Sparkles
        aria-hidden="true"
        className="wip-twinkle absolute left-5 top-5 h-4 w-4 text-amber-400"
        style={{ animationDelay: "0s" }}
      />
      <Sparkles
        aria-hidden="true"
        className="wip-twinkle absolute right-8 top-9 h-3 w-3 text-orange-400"
        style={{ animationDelay: "0.8s" }}
      />
      <Sparkles
        aria-hidden="true"
        className="wip-twinkle absolute right-14 bottom-6 h-5 w-5 text-amber-300"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400/20 dark:bg-amber-400/10">
        <Construction className="wip-wiggle h-8 w-8 text-amber-500 dark:text-amber-400" />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold wip-shimmer-text mb-2">{t.wipTitle}</h2>
      <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-1">{t.wipSubtitle}</p>
      <p className="text-xs text-muted-foreground/80 mb-5">{t.wipHint}</p>

      <Button asChild variant="outline" size="sm" className="wip-wiggle-hover">
        <Link href="/">
          <Home className="h-4 w-4 mr-2" />
          {t.backToDirectory}
        </Link>
      </Button>
    </div>
  );
}

export default WipBanner;
