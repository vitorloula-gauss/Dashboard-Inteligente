"use client"
import { useEffect, useState, useMemo, type MouseEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Zap,
  Calendar,
  Building,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  PlusSquare,
  FileText,
  User,
  Building2,
  Layers,
  Cpu,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import clsx from "clsx";

interface ClientProjectsModalProps {
  cliente: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientProjectsModal({ cliente, isOpen, onClose }: ClientProjectsModalProps) {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    if (!isOpen || !cliente) {
      setProjetos([]);
      setError("");
      setExpandedProjects({});
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    async function fetchClientProjects() {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        
        let { data, error } = await supabase
          .from("vw_projetos")
          .select("*")
          .eq("cliente_id", cliente.id)
          .order("codigo_projeto", { ascending: true });

        if (error) throw error;

        if ((!data || data.length === 0) && cliente.cpf_cnpj) {
          const fallback = await supabase
            .from("vw_projetos")
            .select("*")
            .eq("cpf_cnpj", cliente.cpf_cnpj)
            .order("codigo_projeto", { ascending: true });

          if (!fallback.error && fallback.data) {
            data = fallback.data;
          }
        }

        setProjetos(data || []);
        if (data && data.length > 0) {
          const initialExpanded: Record<string, boolean> = {};
          data.forEach((p, idx) => {
            initialExpanded[p.codigo_projeto || idx] = true;
          });
          setExpandedProjects(initialExpanded);
        }
      } catch (err: any) {
        setError(err.message || "Erro ao carregar os projetos do cliente");
      } finally {
        setLoading(false);
      }
    }

    fetchClientProjects();

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, cliente, onClose]);

  const toggleExpand = (code: string) => {
    setExpandedProjects((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const totalPotencia = useMemo(() => {
    return projetos.reduce((acc, p) => acc + (Number(p.potencia_dc) || 0), 0);
  }, [projetos]);

  // Copia o valor completo e exibe uma confirmação visual.
  const copyValue = async (value: string) => {
    if (!value || value === "—" || value === "…") return;

    try {
      await navigator.clipboard.writeText(value);
      setCopyFeedback(`Copiado: ${value}`);
      window.setTimeout(() => setCopyFeedback(""), 2200);
    } catch (copyError) {
      console.error("Não foi possível copiar o campo:", copyError);
      setCopyFeedback("Não foi possível copiar. Verifique a permissão do navegador.");
      window.setTimeout(() => setCopyFeedback(""), 3000);
    }
  };

  // Permite copiar valores dos campos sem interferir em botões e links.
  const handleCopyField = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, svg")) return;

    const field = target.closest<HTMLElement>("span, p, h2, div");
    if (!field) return;

    const className = typeof field.className === "string" ? field.className : "";
    if (/(text-ink-400|text-ink-500|eyebrow|uppercase)/.test(className)) return;
    if (field.children.length > 0 && !["SPAN", "P", "H2"].includes(field.tagName)) return;

    const value = field.innerText?.trim();
    if (value) void copyValue(value);
  };

  if (!isOpen || !cliente) return null;

  const isPJ =
    cliente.tipo_cliente?.toLowerCase().includes("jurídica") ||
    (cliente.cpf_cnpj && cliente.cpf_cnpj.replace(/\D/g, "").length > 11);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-1000/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div onClick={handleCopyField} className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-ink-200 z-10 [&_span:not(.text-ink-400):not(.text-ink-500)]:cursor-copy [&_p]:cursor-copy [&_h2]:cursor-copy">
        {copyFeedback && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] max-w-[calc(100vw-2rem)] rounded-lg bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-xl break-words"
          >
            <span className="inline-flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">✓</span>
              <span>{copyFeedback}</span>
            </span>
          </div>
        )}
        {/* Cabeçalho do Modal */}
        <div className="p-6 bg-ink-50 border-b border-ink-200 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-gauss-ink text-[10px]">
                {isPJ ? <Building2 className="w-3 h-3 text-ink-600" /> : <User className="w-3 h-3 text-ink-600" />}
                {cliente.tipo_cliente || (isPJ ? "Pessoa Jurídica" : "Pessoa Física")}
              </span>
              {cliente.cpf_cnpj && (
                <span className="font-mono text-[11px] text-ink-700 bg-white px-2 py-0.5 rounded border border-ink-200 font-semibold">
                  CPF/CNPJ: {cliente.cpf_cnpj}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-ink-900 tracking-tight break-words">
              {cliente.razao_social || "Nome não informado"}
            </h2>

            {cliente.nome_fantasia && (
              <p className="text-xs text-ink-600 font-semibold break-words">
                Nome fantasia: {cliente.nome_fantasia}
              </p>
            )}

            {/* Contato e Localização Completos sem corte */}
            <div className="bg-white p-3 rounded border border-ink-200 space-y-1.5 text-xs text-ink-700">
              <div className="flex flex-wrap gap-x-5 gap-y-1">
                {cliente.telefone && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-ink-400" strokeWidth={1.75} />
                    <span>{cliente.telefone}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 text-ink-400" strokeWidth={1.75} />
                    <span>{cliente.email}</span>
                  </div>
                )}
                {(cliente.cidade || cliente.estado) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gauss-green" strokeWidth={1.75} />
                    <span className="font-medium">
                      {cliente.cidade ? cliente.cidade.trim() : ""}{cliente.estado ? ` - ${cliente.estado}` : ""}
                    </span>
                  </div>
                )}
              </div>

              {cliente.endereco && (
                <div className="text-ink-600 text-xs break-words pt-0.5 border-t border-ink-50">
                  <span className="text-ink-400">Endereço: </span>
                  {cliente.endereco} {cliente.cep ? `(CEP: ${cliente.cep})` : ""}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Resumo do Cliente */}
            <div className="text-right hidden sm:block bg-white p-3.5 rounded border border-ink-200">
              <div className="eyebrow text-[10px]">Total de projetos</div>
              <div className="text-2xl font-black text-ink-900 readout">
                {loading ? "…" : projetos.length}
              </div>
              {totalPotencia > 0 && (
                <div className="text-xs font-bold text-gauss-700 readout mt-0.5">
                  {totalPotencia.toLocaleString("pt-BR")} kWp acumulado
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-md text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition"
              title="Fechar (Esc)"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal: Projetos */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 border-l-4 border-signal-warn rounded-r-md text-xs font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-ink-500 font-medium">
              <div className="w-8 h-8 border-2 border-gauss-green border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Buscando usinas e projetos no Supabase…</span>
            </div>
          ) : projetos.length === 0 ? (
            <div className="py-16 text-center text-ink-500 bg-white rounded-lg border border-dashed border-ink-200 p-8">
              <FileText className="w-10 h-10 text-ink-300 mx-auto mb-3" strokeWidth={1.75} />
              <h4 className="text-sm font-bold text-ink-800">Nenhum projeto associado</h4>
              <p className="text-xs text-ink-400 max-w-md mx-auto mt-1">
                Não foram localizados registros de projetos para este cliente nas tabelas consolidadas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="eyebrow flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
                  Projetos do cliente ({projetos.length})
                </div>
                <span className="text-[11px] text-ink-400">
                  Clique no projeto para recolher ou expandir
                </span>
              </div>

              {projetos.map((proj, idx) => {
                const projKey = proj.codigo_projeto || `proj-${idx}`;
                const isExpanded = expandedProjects[projKey] ?? true;
                const isAumento = proj.codigo_projeto && proj.codigo_projeto.includes(".");
                const isOverdue = proj.status_sistema?.toLowerCase() === "overdue";

                return (
                  <div
                    key={projKey}
                    className="border border-ink-200 rounded-lg bg-white shadow-xs overflow-hidden transition-all"
                  >
                    {/* Header do Card */}
                    <div
                      className="p-4 bg-white hover:bg-ink-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors select-none border-b border-ink-100"
                    >
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="font-mono text-sm font-bold text-ink-900 flex items-center gap-2">
                          {isAumento ? (
                            <PlusSquare className="w-4 h-4 text-gauss-700 flex-shrink-0" strokeWidth={1.75} />
                          ) : (
                            <Layers className="w-4 h-4 text-gauss-green flex-shrink-0" strokeWidth={1.75} />
                          )}
                          <button
                            type="button"
                            onClick={() => void copyValue(String(proj.codigo_projeto || "Sem código"))}
                            className="cursor-copy text-left hover:text-gauss-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gauss-green rounded"
                            title="Clique para copiar o código do projeto"
                            aria-label={`Copiar código do projeto ${proj.codigo_projeto || "Sem código"}`}
                          >
                            {proj.codigo_projeto || "Sem código"}
                          </button>
                        </div>

                        {isAumento && (
                          <span className="badge-gauss-ink text-[10px] bg-gauss-100 text-gauss-900 border-gauss-borderGreen">
                            Aumento / expansão
                          </span>
                        )}

                        <span className={isOverdue ? "badge-gauss-warn" : "badge-gauss-ok"}>
                          <span className={clsx(
                            "w-1.5 h-1.5 rounded-full",
                            isOverdue ? "bg-[#946100]" : "bg-gauss-green"
                          )}></span>
                          {proj.status_sistema || "OnTrack"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-medium text-ink-600">
                        {proj.potencia_dc && (
                          <div className="flex items-center gap-1 font-bold text-gauss-700 readout">
                            <Zap className="w-3.5 h-3.5 text-gauss-green" strokeWidth={1.75} />
                            {Number(proj.potencia_dc).toLocaleString("pt-BR")} kWp
                          </div>
                        )}
                        {proj.cidade && (
                          <div className="text-ink-600 font-medium hidden sm:block text-[11px]">
                            {proj.cidade.trim()}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleExpand(projKey)}
                          className="text-ink-400 p-1 hover:text-ink-700 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gauss-green"
                          aria-label={isExpanded ? "Recolher projeto" : "Expandir projeto"}
                          title={isExpanded ? "Recolher projeto" : "Expandir projeto"}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Detalhes Técnicos Completos */}
                    {isExpanded && (
                      <div className="p-5 space-y-4 text-xs bg-white">
                        {/* Grade 3 Colunas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Coluna 1: Potência e Elétrica */}
                          <div className="p-3.5 bg-ink-50 rounded-md border border-ink-100 space-y-2.5">
                            <div className="eyebrow text-[10px] flex items-center gap-1.5 border-b border-ink-200 pb-1.5">
                              <Zap className="w-3 h-3 text-gauss-green" strokeWidth={1.75} />
                              Potência & elétrica
                            </div>
                            <div className="space-y-2 pt-1">
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Potência DC:</span>
                                <span className="font-bold text-ink-900 text-xs readout">
                                  {proj.potencia_dc ? `${Number(proj.potencia_dc).toLocaleString("pt-BR")} kWp` : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Potência AC:</span>
                                <span className="font-bold text-ink-900 text-xs readout">
                                  {proj.potencia_ac ? `${Number(proj.potencia_ac).toLocaleString("pt-BR")} kW` : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Concessionária DC:</span>
                                <span className="font-semibold text-ink-800 text-xs readout">
                                  {proj.potencia_dc_coelba ? `${proj.potencia_dc_coelba} kWp` : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Concessionária AC:</span>
                                <span className="font-semibold text-ink-800 text-xs readout">
                                  {proj.potencia_ac_coelba ? `${proj.potencia_ac_coelba} kW` : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Tensão / Fases:</span>
                                <span className="font-semibold text-ink-800 text-xs">
                                  {proj.tensao || "—"} {proj.fases ? `(${proj.fases})` : ""}
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-500 text-[10px] block">Tipo de telhado:</span>
                                <span className="font-semibold text-ink-900 text-xs block mt-0.5 break-words">
                                  {proj.tipo_telhado || "Não informado"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Coluna 2: Módulos e Inversores */}
                          <div className="p-3.5 bg-ink-50 rounded-md border border-ink-100 space-y-2.5">
                            <div className="eyebrow text-[10px] flex items-center gap-1.5 border-b border-ink-200 pb-1.5">
                              <Cpu className="w-3 h-3 text-gauss-700" strokeWidth={1.75} />
                              Módulos & inversores
                            </div>
                            <div className="space-y-2.5 pt-1">
                              <div>
                                <span className="text-ink-500 text-[10px] block">Módulos fotovoltaicos</span>
                                <span className="font-semibold text-ink-900 text-xs leading-relaxed block mt-0.5 break-words">
                                  {proj.qtd_potencia_modulos || "Não especificado"}
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-500 text-[10px] block">Inversores</span>
                                <span className="font-semibold text-ink-900 text-xs leading-relaxed block mt-0.5 break-words">
                                  {proj.qtd_potencia_inversores || proj.marca_inversor || "Não especificado"}
                                </span>
                              </div>
                              <div>
                                <span className="text-ink-500 text-[10px] block">Fabricante</span>
                                <span className="font-bold text-gauss-900 text-xs block mt-0.5 break-words">
                                  {proj.marca_inversor || "—"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Coluna 3: Comercial & Faturamento */}
                          <div className="p-3.5 bg-ink-50 rounded-md border border-ink-100 space-y-2.5">
                            <div className="eyebrow text-[10px] flex items-center gap-1.5 border-b border-ink-200 pb-1.5">
                              <Building className="w-3 h-3 text-ink-600" strokeWidth={1.75} />
                              Comercial & faturamento
                            </div>
                            <div className="space-y-2 pt-1">
                              <div>
                                <span className="text-ink-500 text-[10px] block">Conta contrato</span>
                                <span className="font-mono font-bold text-ink-900 text-xs block mt-0.5 break-words">
                                  {proj.conta_contrato || "—"}
                                </span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Valor fechado:</span>
                                <span className="font-bold text-ink-900 text-xs readout">
                                  {proj.valor_fechado
                                    ? `R$ ${Number(proj.valor_fechado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Classe / Tarifa:</span>
                                <span className="font-semibold text-ink-800 text-xs break-words">
                                  {proj.classe_consumidor?.trim() || "—"} {proj.modalidade_tarifaria ? `(${proj.modalidade_tarifaria})` : ""}
                                </span>
                              </div>
                              <div className="flex justify-between items-baseline border-b border-ink-100 pb-1">
                                <span className="text-ink-500 text-[10px]">Comercial:</span>
                                <span className="font-semibold text-ink-800 text-xs break-words">{proj.contato_comercial || "—"}</span>
                              </div>
                              <div>
                                <span className="text-ink-500 text-[10px] block">Garantia estendida:</span>
                                <span className="font-semibold text-ink-800 text-xs block mt-0.5 break-words">{proj.garantia_estendida || "Padrão de fábrica"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cronograma */}
                        <div className="p-3.5 bg-ink-50 rounded-md border border-ink-100">
                          <div className="eyebrow text-[10px] flex items-center gap-1.5 mb-2">
                            <Calendar className="w-3 h-3 text-ink-500" strokeWidth={1.75} />
                            Cronograma de marcos
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <div className="p-2 bg-white rounded border border-ink-100">
                              <span className="text-ink-400 block text-[10px]">Fechamento</span>
                              <span className="font-mono font-bold text-ink-900 text-xs block mt-0.5">{proj.data_fechamento || "—"}</span>
                            </div>
                            <div className="p-2 bg-white rounded border border-ink-100">
                              <span className="text-ink-400 block text-[10px]">Contrato</span>
                              <span className="font-mono font-bold text-ink-900 text-xs block mt-0.5">{proj.data_contrato || "—"}</span>
                            </div>
                            <div className="p-2 bg-white rounded border border-ink-100">
                              <span className="text-ink-400 block text-[10px]">Aprovação</span>
                              <span className="font-mono font-bold text-ink-900 text-xs block mt-0.5">{proj.data_aprovacao || "—"}</span>
                            </div>
                            <div className="p-2 bg-white rounded border border-ink-100">
                              <span className="text-ink-400 block text-[10px]">Vistoria</span>
                              <span className="font-mono font-bold text-ink-900 text-xs block mt-0.5">{proj.data_vistoria || "—"}</span>
                            </div>
                            <div className="p-2 bg-gauss-100 rounded border border-gauss-borderGreen">
                              <span className="text-gauss-900 block text-[10px] font-bold">Troca do medidor</span>
                              <span className="font-mono font-bold text-gauss-900 text-xs block mt-0.5">{proj.data_troca_medidor || "—"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Links e Maps */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 text-xs text-ink-600 border-t border-ink-100">
                          <div className="flex items-center gap-3 flex-wrap">
                            {proj.link_maps && (
                              <a
                                href={proj.link_maps}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-gauss-100 text-gauss-900 border border-gauss-borderGreen hover:bg-gauss-300/40 transition font-semibold text-xs whitespace-nowrap"
                              >
                                <MapPin className="w-3.5 h-3.5 text-gauss-700" strokeWidth={1.75} />
                                <span>Coordenadas no Google Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {proj.process_run_id && (
                              <span className="text-ink-500 font-mono text-[11px] bg-ink-50 px-2 py-0.5 rounded border border-ink-100 break-all">
                                Run ID: {proj.process_run_id}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-ink-400">
                            Última atualização: {proj.ultima_atualizacao ? new Date(proj.ultima_atualizacao).toLocaleString("pt-BR") : "—"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-ink-50 border-t border-ink-200 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gauss-secondary text-xs"
          >
            Fechar dossiê
          </button>
        </div>
      </div>
    </div>
  );
}
