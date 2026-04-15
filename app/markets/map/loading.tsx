export default function Loading() {
  return (
    <div className="animate-pulse pb-16 md:pb-0">
      {/* Map placeholder */}
      <div className="w-full bg-muted" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 opacity-40">
            <div className="h-12 w-12 rounded-full bg-muted-foreground/30" />
            <div className="h-4 w-24 bg-muted-foreground/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
