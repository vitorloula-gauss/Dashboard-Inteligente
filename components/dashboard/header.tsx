"use client"

export function Header() {
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());

  // Capitaliza primeiro caractere
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="flex items-center justify-between h-16 px-8 bg-white border-b border-ink-200">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-ink-900 tracking-tight">
          Sistema de gestão operacional
        </h2>
        <span className="text-ink-300 hidden md:inline">|</span>
        <span className="text-xs text-ink-500 hidden md:inline">
          {formattedDate}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div className="badge-gauss-ok">
          <span className="w-1.5 h-1.5 rounded-full bg-gauss-green animate-pulse"></span>
          <span>Supabase conectado</span>
        </div>
      </div>
    </header>
  );
}