"use client"
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, Search, ChevronLeft, ChevronRight, CheckCircle2, Database, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function SincronizacaoPage() {
  const [cacheItems, setCacheItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  async function fetchCache() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('vw_cache_projetos')
        .select('*')
        .order('process_updated_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setCacheItems(data || []);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao carregar sincronizações");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCache();
  }, []);

  const filteredItems = useMemo(() => {
    return cacheItems.filter((item) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (item.codigo_projeto && item.codigo_projeto.toLowerCase().includes(s)) ||
        (item.process_run_id && item.process_run_id.toLowerCase().includes(s))
      );
    });
  }, [cacheItems, search]);

  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const latestSync = cacheItems.length > 0 && cacheItems[0].process_updated_at
    ? new Date(cacheItems[0].process_updated_at).toLocaleString('pt-BR')
    : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
            Integração n8n & Process Street
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            Status de sincronização
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Monitoramento das execuções de fluxo e cache de projetos ({cacheItems.length} registros no cache).
          </p>
        </div>
        <button
          onClick={fetchCache}
          disabled={loading}
          className="btn-gauss-primary disabled:opacity-50 text-xs"
        >
          <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} />
          <span>Sincronizar visão</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-signal-warn rounded-r-md text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-signal-warn" />
          <span>Erro ao carregar: {error}</span>
        </div>
      )}

      {/* Cards de Métricas de Sincronização */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 bg-white border border-ink-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-[10px]">Total em cache</span>
            <Database className="w-4 h-4 text-gauss-green" strokeWidth={1.75} />
          </div>
          <div className="text-3xl font-extrabold text-ink-900 readout">
            {loading ? "…" : cacheItems.length.toLocaleString('pt-BR')}
          </div>
          <p className="text-[11px] text-ink-400 mt-1">Indexados na view <code>vw_cache_projetos</code></p>
        </div>

        <div className="p-5 bg-white border border-ink-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-[10px]">Última atualização registrada</span>
            <CheckCircle2 className="w-4 h-4 text-gauss-green" strokeWidth={1.75} />
          </div>
          <div className="text-base font-bold text-ink-900 mt-2 font-mono">{loading ? "…" : latestSync}</div>
          <p className="text-[11px] text-ink-400 mt-1">Timestamp mais recente recebido do n8n</p>
        </div>

        <div className="p-5 bg-white border border-ink-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-[10px]">Webhook & pipeline</span>
            <div className="w-2 h-2 rounded-full bg-gauss-green animate-pulse"></div>
          </div>
          <div className="text-base font-bold text-gauss-700 mt-2">Ativo & operacional</div>
          <p className="text-[11px] text-ink-400 mt-1">Fluxos Process Street atualizados</p>
        </div>
      </div>

      {/* Busca */}
      <div className="bg-white p-4 rounded-lg border border-ink-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-ink-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por código de projeto ou Run ID…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-ink-200 rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-gauss-green focus:ring-2 focus:ring-gauss-green/20 transition"
          />
        </div>
      </div>

      {/* Tabela de Runs */}
      <div className="bg-white rounded-lg border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider bg-ink-50 border-b border-ink-200">
              <tr>
                <th className="px-5 py-3.5">Código do projeto</th>
                <th className="px-5 py-3.5">Process Street Run ID</th>
                <th className="px-5 py-3.5">Data/hora da sincronização</th>
                <th className="px-5 py-3.5">Status de cache</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-ink-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-gauss-green border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Consultando cache de sincronização…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-ink-400 text-xs">
                    Nenhum registro encontrado no cache.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => (
                  <tr key={item.process_run_id || idx} className="hover:bg-ink-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-ink-900 text-xs">
                      {item.codigo_projeto || "—"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-600">
                      {item.process_run_id || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-ink-600 font-mono">
                      {item.process_updated_at ? new Date(item.process_updated_at).toLocaleString('pt-BR') : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="badge-gauss-ok">
                        <CheckCircle2 className="w-3 h-3 text-gauss-900" strokeWidth={1.75} />
                        Sincronizado
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && filteredItems.length > 0 && (
          <div className="p-4 bg-ink-50 border-t border-ink-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-medium text-ink-500">
              Página {page} de {totalPages} ({filteredItems.length} registros)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-ink-200 rounded-md bg-white text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 border border-ink-200 rounded-md bg-white text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}