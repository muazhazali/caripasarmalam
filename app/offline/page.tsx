export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="text-6xl">📶</div>
      <h1 className="text-2xl font-bold">Tiada Sambungan Internet</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Anda sedang luar talian. Halaman ini tidak tersedia dalam cache. Sila semak sambungan internet anda dan cuba
        semula.
      </p>
      <a href="/" className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
        Cuba Semula
      </a>
    </div>
  );
}
