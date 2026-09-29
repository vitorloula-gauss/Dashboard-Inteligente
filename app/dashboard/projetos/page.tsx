"use client"
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, ChevronLeft, ChevronRight, Filter, AlertCircle, FileText, ArrowRight } from "lucide-react";
import { ProjectDetailModal } from "@/components/dashboard/project-detail-modal";
import clsx from "clsx";

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const pageSize = 20;

  useEffect(() => {
    async function fetchProjetos() {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('vw_projetos')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          setError(error.message);
        } else {
          setProjetos(data || []);
        }
      } catch (err: any) {
        setError(err.message || "Erro desconhecido ao carregar projetos");
      } finally {
        setLoading(false);
      }
    }
    fetchProjetos();
  }, []);

  const filteredProjetos = useMemo(() => {
    return projetos.filter((proj) => {
      const matchSearch =
        !search ||
        (proj.codigo_projeto && proj.codigo_projeto.toLowerCase().includes(search.toLowerCase())) ||
        (proj.razao_social && proj.razao_social.toLowerCase().includes(search.toLowerCase())) ||
        (proj.cidade && proj.cidade.toLowerCase().includes(search.toLowerCase())) ||
        (proj.marca_inversor && proj.marca_inversor.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === "all" ||
        (proj.status_sistema && proj.status_sistema.toLowerCase() === statusFilter.toLowerCase());

      return matchSearch && matchStatus;
    });
  }, [projetos, search, statusFilter]);

  const totalPages = Math.ceil(filteredProjetos.length / pageSize) || 1;
  const paginatedProjetos = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProjetos.slice(start, start + pageSize);
  }, [filteredProjetos, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
            Listagem geral
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            Projetos cadastrados
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Visualizando {filteredProjetos.length} de {projetos.length} projetos sincronizados via Process Street. Clique em um projeto para abrir a ficha técnica completa.
          </p>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-signal-warn rounded-r-md text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-signal-warn" />
          <span>Erro ao carregar: {error}</span>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-lg border border-ink-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-ink-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por código, cliente, cidade…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-ink-200 rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-gauss-green focus:ring-2 focus:ring-gauss-green/20 transition"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <span className="eyebrow text-ink-400 hidden lg:block">
            Clique na linha para ver os detalhes
          </span>

          <div className="flex items-center gap-2">
            <div className="eyebrow text-ink-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-ink-400" strokeWidth={1.75} />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-ink-200 rounded-md text-xs font-semibold text-ink-700 bg-white focus:outline-none focus:border-gauss-green transition"
            >
              <option value="all">Todos os status</option>
              <option value="OnTrack">OnTrack (em dia)</option>
              <option value="Overdue">Overdue (atrasado)</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tabela de Projetos */}
      <div className="bg-white rounded-lg border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider bg-ink-50 border-b border-ink-200">
              <tr>
                <th className="px-5 py-3.5">Código</th>
                <th className="px-5 py-3.5">Cliente / Razão social</th>
                <th className="px-5 py-3.5">Cidade</th>
                <th className="px-5 py-3.5">Potência DC</th>
                <th className="px-5 py-3.5">Inversor</th>
                <th className="px-5 py-3.5">Data fechamento</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-ink-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-gauss-green border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Consultando base de dados…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedProjetos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-ink-400 text-xs">
                    Nenhum projeto encontrado para o filtro selecionado.
                  </td>
                </tr>
              ) : (
                paginatedProjetos.map((proj) => {
                  const isOverdue = proj.status_sistema?.toLowerCase() === "overdue";
                  return (
                    <tr
                      key={proj.codigo_projeto || proj.process_run_id}
                      onClick={() => setSelectedProject(proj)}
                      className="hover:bg-ink-50 transition-colors cursor-pointer group"
                      title="Clique para abrir a ficha técnica do projeto"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-ink-900 whitespace-nowrap text-xs group-hover:text-gauss-green transition-colors">
                        {proj.codigo_projeto || "—"}
                      </td>
                      <td className="px-5 py-3.5 max-w-[240px] truncate">
                        <div className="font-semibold text-ink-800 truncate text-xs" title={proj.razao_social}>
                          {proj.razao_social || "Não informado"}
                        </div>
                        {proj.contato_comercial && (
                          <div className="text-[11px] text-ink-400 truncate">
                            Comercial: {proj.contato_comercial}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-ink-600 whitespace-nowrap text-xs">
                        {proj.cidade?.trim() || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-ink-800 whitespace-nowrap readout text-xs">
                        {proj.potencia_dc ? `${Number(proj.potencia_dc).toLocaleString('pt-BR')} kWp` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-ink-500 max-w-[180px] truncate text-xs" title={proj.qtd_potencia_inversores || proj.marca_inversor}>
                        {proj.qtd_potencia_inversores || proj.marca_inversor || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-ink-500 whitespace-nowrap font-mono text-[11px]">
                        {proj.data_fechamento || proj.data_troca_medidor || "—"}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={isOverdue ? "badge-gauss-warn" : "badge-gauss-ok"}>
                          <span className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            isOverdue ? "bg-[#946100]" : "bg-gauss-green"
                          )}></span>
                          {proj.status_sistema || "OnTrack"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(proj);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gauss-100 text-gauss-900 font-semibold text-xs rounded border border-gauss-borderGreen hover:bg-gauss-300/40 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-gauss-700" strokeWidth={1.75} />
                          <span>Ficha</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {!loading && filteredProjetos.length > 0 && (
          <div className="p-4 bg-ink-50 border-t border-ink-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-medium text-ink-500">
              Página {page} de {totalPages} ({filteredProjetos.length} registros)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-ink-200 rounded-md bg-white text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 border border-ink-200 rounded-md bg-white text-ink-600 hover:bg-ink-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                title="Próxima página"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal com todas as informações do projeto */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}