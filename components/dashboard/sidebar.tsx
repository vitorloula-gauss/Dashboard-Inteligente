"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  PlusSquare,
  Users,
  LineChart,
  ShieldCheck,
  RefreshCw,
  Cpu
} from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projetos", href: "/dashboard/projetos", icon: FolderKanban },
  { name: "Projetos de aumento", href: "/dashboard/aumentos", icon: PlusSquare },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "Indicadores", href: "/dashboard/analises", icon: LineChart },
  { name: "Qualidade de dados", href: "/dashboard/qualidade", icon: ShieldCheck },
  { name: "Sincronização", href: "/dashboard/sincronizacao", icon: RefreshCw },
  { name: "Analista técnico", href: "/dashboard/analista", icon: Cpu },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-ink-1000 text-ink-300 border-r border-ink-800 h-full select-none">
      {/* Brand Header: Lockup Oficial Gauss (Marca de 3 listras + Bebas Neue + SOLAR · BESS · EV) */}
      <div className="flex items-center gap-3.5 h-20 border-b border-ink-800 px-6">
        {/* SVG da Marca Oficial de 3 listras verdes */}
        <svg
          viewBox="-3 -3 156 98"
          className="w-10 h-7 flex-shrink-0"
          role="img"
          aria-label="Marca Gauss"
        >
          <polygon
            points="0,0 27,0 37,16 0,16"
            fill="#1B5D24"
            stroke="#1B5D24"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <polygon
            points="61,0 150,0 150,16 72,16"
            fill="#1B5D24"
            stroke="#1B5D24"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <polygon
            points="0,38 44,38 54,54 0,54"
            fill="#39B54A"
            stroke="#39B54A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <polygon
            points="78,38 150,38 150,54 89,54"
            fill="#39B54A"
            stroke="#39B54A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <polygon
            points="0,76 61,76 71,92 0,92"
            fill="#8FD79A"
            stroke="#8FD79A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <polygon
            points="96,76 150,76 150,92 106,92"
            fill="#8FD79A"
            stroke="#8FD79A"
            strokeWidth="5"
            strokeLinejoin="round"
          />
        </svg>

        <div className="flex flex-col">
          <span className="font-wordmark text-2xl tracking-[0.08em] text-white leading-none">
            GAUSS
          </span>
          <span className="text-[9px] font-semibold tracking-[0.2em] uppercase text-gauss-green mt-1">
            Solar · Bess · EV
          </span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-5">
        <div className="px-4 mb-3">
          <span className="eyebrow text-ink-500 text-[10px]">Módulos operacionais</span>
        </div>
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-md transition-all",
                    isActive
                      ? "bg-ink-900 text-gauss-green border-l-2 border-gauss-green shadow-xs"
                      : "text-ink-400 hover:bg-ink-900/50 hover:text-white border-l-2 border-transparent"
                  )}
                >
                  <item.icon
                    className={clsx(
                      "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                      isActive ? "text-gauss-green" : "text-ink-500"
                    )}
                    strokeWidth={1.75}
                  />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-ink-800 text-[11px] text-ink-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gauss-green animate-pulse"></div>
          <span className="font-mono text-[10px]">v2.4.0 · Supabase</span>
        </div>
        <span className="text-[10px] text-ink-600 font-mono">PROD</span>
      </div>
    </div>
  );
}