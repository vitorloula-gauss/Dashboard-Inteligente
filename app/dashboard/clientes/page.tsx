"use client"
import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, ChevronLeft, ChevronRight, AlertCircle, Building2, User, FolderKanban, ArrowRight } from "lucide-react";
import { ClientProjectsModal } from "@/components/dashboard/client-projects-modal";
import clsx from "clsx";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);
  const pageSize = 20;

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('vw_clientes')
          .select('*')
          .order('razao_social', { ascending: true });

        if (error) {
          setError(error.message);
        } else {
          setClientes(data || []);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar clientes");
      } finally {
        setLoading(false);
      }
    }
    fetchClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    return clientes.filter((cli) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        (cli.razao_social && cli.razao_social.toLowerCase().includes(s)) ||
        (cli.cpf_cnpj && cli.cpf_cnpj.toLowerCase().includes(s)) ||
        (cli.cidade && cli.cidade.toLowerCase().includes(s)) ||
        (cli.email && cli.email.toLowerCase().includes(s)) ||
        (cli.telefone && cli.telefone.toLowerCase().includes(s))
      );
    });
  }, [clientes, search]);

  const totalPages = Math.ceil(filteredClientes.length / pageSize) || 1;
  const paginatedClientes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredClientes.slice(start, start + pageSize);
  }, [filteredClientes, page, pageSize]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
            Base de clientes
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            Clientes cadastrados
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Visualizando {filteredClientes.length} de {clientes.length} clientes. Selecione um cliente para consultar a ficha técnica dos projetos.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-signal-warn rounded-r-md text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-signal-warn" />
          <span>Erro ao carregar clientes: {error}</span>
        </div>
      )}

      {/* Busca */}
      <div className="bg-white p-4 rounded-lg border border-ink-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-ink-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nome, CPF/CNPJ, cidade, telefone…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-ink-200 rounded-md text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-gauss-green focus:ring-2 focus:ring-gauss-green/20 transition"
          />
        </div>

        <div className="eyebrow text-ink-400 hidden sm:block">
          Clique na linha para abrir o dossiê de projetos
        </div>
      </div>
      
      {/* Tabela de Clientes */}
      <div className="bg-white rounded-lg border border-ink-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider bg-ink-50 border-b border-ink-200">
              <tr>
                <th className="px-5 py-3.5">Cliente / Razão social</th>
                <th className="px-5 py-3.5">Tipo</th>
                <th className="px-5 py-3.5">CPF / CNPJ</th>
                <th className="px-5 py-3.5">Contato</th>
                <th className="px-5 py-3.5">Localização</th>
                <th className="px-5 py-3.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-gauss-green border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">Consultando base de clientes…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedClientes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-400 text-xs">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                paginatedClientes.map((cliente, idx) => {
                  const isPJ = cliente.tipo_cliente?.toLowerCase().includes("jurídica") || (cliente.cpf_cnpj && cliente.cpf_cnpj.replace(/\D/g, '').length > 11);
                  return (
                    <tr
                      key={cliente.id || idx}
                      onClick={() => setSelectedCliente(cliente)}
                      className="hover:bg-ink-50 transition-colors cursor-pointer group"
                      title="Clique para ver os projetos deste cliente"
                    >
                      <td className="px-5 py-3.5 max-w-[260px]">
                        <div className="font-semibold text-ink-900 truncate text-xs group-hover:text-gauss-green transition-colors" title={cliente.razao_social}>
                          {cliente.razao_social || "Nome não cadastrado"}
                        </div>
                        {cliente.nome_fantasia && (
                          <div className="text-[11px] text-ink-400 truncate">
                            Fantasia: {cliente.nome_fantasia}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={clsx(
                          "badge-gauss-ink text-[10px]",
                          isPJ && "border-ink-300"
                        )}>
                          {isPJ ? <Building2 className="w-3 h-3 text-ink-600" /> : <User className="w-3 h-3 text-ink-600" />}
                          {cliente.tipo_cliente || (isPJ ? "Pessoa Jurídica" : "Pessoa Física")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-600 whitespace-nowrap font-mono text-xs">
                        {cliente.cpf_cnpj || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-ink-600 text-xs">
                        {cliente.telefone && <div className="font-mono text-[11px]">{cliente.telefone}</div>}
                        {cliente.email && <div className="text-ink-400 truncate max-w-[180px] text-[11px]" title={cliente.email}>{cliente.email}</div>}
                        {!cliente.telefone && !cliente.email && <span className="text-ink-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-ink-600 whitespace-nowrap text-xs">
                        {cliente.cidade ? `${cliente.cidade.trim()}${cliente.estado ? ` - ${cliente.estado}` : ''}` : "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCliente(cliente);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gauss-100 text-gauss-900 font-semibold text-xs rounded border border-gauss-borderGreen hover:bg-gauss-300/40 transition"
                        >
                          <FolderKanban className="w-3.5 h-3.5 text-gauss-700" strokeWidth={1.75} />
                          <span>Projetos</span>
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
        {!loading && filteredClientes.length > 0 && (
          <div className="p-4 bg-ink-50 border-t border-ink-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs font-medium text-ink-500">
              Página {page} de {totalPages} ({filteredClientes.length} registros)
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

      {/* Modal com dossiê de projetos */}
      <ClientProjectsModal
        cliente={selectedCliente}
        isOpen={!!selectedCliente}
        onClose={() => setSelectedCliente(null)}
      />
    </div>
  );
}