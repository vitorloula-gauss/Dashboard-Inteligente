"use client"
import { useEffect } from "react";
import {
  X,
  Zap,
  Calendar,
  Building,
  MapPin,
  ExternalLink,
  PlusSquare,
  Layers,
  Cpu,
  Clock,
  ShieldCheck,
  FileText,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import clsx from "clsx";

interface ProjectDetailModalProps {
  project: any | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatFieldLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  useEffect(() => {
    if (!isOpen || !project) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, project, onClose]);

  if (!isOpen || !project) return null;

  const isAumento = project.codigo_projeto && project.codigo_projeto.includes(".");
  const isOverdue = project.status_sistema?.toLowerCase() === "overdue";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-1000/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-5xl max-h-[94vh] bg-white rounded-lg shadow-lg flex flex-col overflow-hidden border border-ink-200 z-10">
        {/* Cabeçalho do Modal */}
        <div className="p-6 bg-ink-50 border-b border-ink-200 flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="eyebrow flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
                Ficha técnica completa de usina
              </span>

              {isAumento && (
                <span className="badge-gauss-ink text-[10px] bg-gauss-100 text-gauss-900 border-gauss-borderGreen font-semibold">
                  Aumento / expansão
                </span>
              )}

              <span className={isOverdue ? "badge-gauss-warn" : "badge-gauss-ok"}>
                <span className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  isOverdue ? "bg-[#946100]" : "bg-gauss-green"
                )}></span>
                {project.status_sistema || "OnTrack"}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-2xl font-mono font-extrabold text-ink-900 tracking-tight flex items-center gap-2">
                {isAumento ? (
                  <PlusSquare className="w-5 h-5 text-gauss-700 flex-shrink-0" strokeWidth={1.75} />
                ) : (
                  <Layers className="w-5 h-5 text-gauss-green flex-shrink-0" strokeWidth={1.75} />
                )}
                {project.codigo_projeto || "Sem código"}
              </h2>

              {project.cidade && (
                <span className="text-xs text-ink-600 font-medium flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-ink-200">
                  <MapPin className="w-3.5 h-3.5 text-gauss-green" strokeWidth={1.75} />
                  {project.cidade.trim()}
                </span>
              )}
            </div>

            {/* Informações Completas do Cliente */}
            <div className="bg-white p-3 rounded border border-ink-200 space-y-1">
              <div className="text-sm font-bold text-ink-900 break-words">
                {project.razao_social || "Razão social não informada"}
              </div>

              {project.nome_fantasia && (
                <div className="text-xs text-ink-600 font-medium break-words">
                  Nome fantasia: {project.nome_fantasia}
                </div>
              )}

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-600 pt-1">
                {project.cpf_cnpj && (
                  <div className="font-mono text-ink-700">
                    CPF/CNPJ: <span className="font-semibold">{project.cpf_cnpj}</span>
                  </div>
                )}
                {project.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-ink-400" strokeWidth={1.75} />
                    <span>{project.telefone}</span>
                  </div>
                )}
                {project.email && (
                  <div className="flex items-center gap-1 break-all">
                    <Mail className="w-3 h-3 text-ink-400" strokeWidth={1.75} />
                    <span>{project.email}</span>
                  </div>
                )}
                {project.cliente_id && (
                  <div className="font-mono text-[10px] text-ink-400">
                    ID Cliente: {project.cliente_id}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 self-end md:self-auto">
            {/* Indicador de Potência Principal */}
            <div className="text-right bg-white p-3.5 rounded border border-ink-200 max-w-full min-w-0">
              <div className="eyebrow text-[10px]">Potência nominal DC</div>
              <div className="text-2xl font-black text-gauss-700 readout">
                {project.potencia_dc ? `${Number(project.potencia_dc).toLocaleString("pt-BR")} kWp` : "—"}
              </div>
              {project.potencia_ac && (
                <div className="text-xs font-semibold text-ink-600 readout mt-0.5">
                  Inversor: {Number(project.potencia_ac).toLocaleString("pt-BR")} kW AC
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-md text-ink-400 hover:text-ink-900 hover:bg-ink-100 transition"
              title="Fechar ficha técnica (Esc)"
            >
              <X className="w-5 h-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Corpo do Modal com Todos os Dados Detalhados */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5 bg-background">
          {/* Grade de Especificações Técnicas e Comerciais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bloco 1: Potência & Elétrica */}
            <div className="p-4 bg-white rounded-lg border border-ink-200 shadow-xs space-y-3">
              <div className="eyebrow text-[10px] flex items-center gap-1.5 border-b border-ink-100 pb-2">
                <Zap className="w-3.5 h-3.5 text-gauss-green" strokeWidth={1.75} />
                Potência & parâmetros elétricos
              </div>
              <div className="space-y-2.5">
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Potência DC:</span>
                  <span className="min-w-0 max-w-full font-bold text-ink-900 text-xs readout break-words [overflow-wrap:anywhere]">
                    {project.potencia_dc ? `${Number(project.potencia_dc).toLocaleString("pt-BR")} kWp` : "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Potência AC:</span>
                  <span className="min-w-0 max-w-full font-bold text-ink-900 text-xs readout break-words [overflow-wrap:anywhere]">
                    {project.potencia_ac ? `${Number(project.potencia_ac).toLocaleString("pt-BR")} kW` : "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Potência Coelba DC:</span>
                  <span className="min-w-0 max-w-full font-semibold text-ink-800 text-xs readout break-words [overflow-wrap:anywhere]">
                    {project.potencia_dc_coelba ? `${Number(project.potencia_dc_coelba).toLocaleString("pt-BR")} kWp` : "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Potência Coelba AC:</span>
                  <span className="min-w-0 max-w-full font-semibold text-ink-800 text-xs readout break-words [overflow-wrap:anywhere]">
                    {project.potencia_ac_coelba ? `${Number(project.potencia_ac_coelba).toLocaleString("pt-BR")} kW` : "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Nível de tensão:</span>
                  <span className="font-semibold text-ink-800 text-xs">{project.tensao || "—"}</span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Fases elétricas:</span>
                  <span className="font-semibold text-ink-800 text-xs">{project.fases || "—"}</span>
                </div>
                <div>
                  <span className="text-ink-500 text-[11px] block">Tipo de telhado / estrutura:</span>
                  <span className="font-semibold text-ink-900 text-xs block mt-0.5 break-words">
                    {project.tipo_telhado || "Não informado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 2: Módulos & Inversores */}
            <div className="p-4 bg-white rounded-lg border border-ink-200 shadow-xs space-y-3">
              <div className="eyebrow text-[10px] flex items-center gap-1.5 border-b border-ink-100 pb-2">
                <Cpu className="w-3.5 h-3.5 text-gauss-700" strokeWidth={1.75} />
                Módulos & inversores fotovoltaicos
              </div>
              <div className="space-y-3">
                <div className="bg-ink-50 p-2.5 rounded border border-ink-100">
                  <span className="text-ink-500 text-[10px] uppercase font-bold block">Módulos fotovoltaicos</span>
                  <span className="font-semibold text-ink-900 text-xs leading-relaxed block mt-1 break-words">
                    {project.qtd_potencia_modulos || "Não especificado na base"}
                  </span>
                </div>
                <div className="bg-ink-50 p-2.5 rounded border border-ink-100">
                  <span className="text-ink-500 text-[10px] uppercase font-bold block">Inversores</span>
                  <span className="font-semibold text-ink-900 text-xs leading-relaxed block mt-1 break-words">
                    {project.qtd_potencia_inversores || "Não especificado na base"}
                  </span>
                </div>
                <div className="bg-ink-50 p-2.5 rounded border border-ink-100">
                  <span className="text-ink-500 text-[10px] uppercase font-bold block">Fabricante do inversor</span>
                  <span className="font-bold text-gauss-900 text-xs block mt-1 break-words">
                    {project.marca_inversor || "Não informado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Bloco 3: Comercial & Faturamento */}
            <div className="p-4 bg-white rounded-lg border border-ink-200 shadow-xs space-y-3">
              <div className="eyebrow text-[10px] flex items-center gap-1.5 border-b border-ink-100 pb-2">
                <Building className="w-3.5 h-3.5 text-ink-600" strokeWidth={1.75} />
                Dados comerciais & faturamento
              </div>
              <div className="space-y-2.5">
                <div>
                  <span className="text-ink-500 text-[10px] block">Conta contrato</span>
                  <span className="font-mono font-bold text-ink-900 text-xs block mt-0.5 break-words">
                    {project.conta_contrato || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Valor fechado:</span>
                  <span className="min-w-0 max-w-full font-bold text-ink-900 text-xs readout break-words [overflow-wrap:anywhere]">
                    {project.valor_fechado
                      ? `R$ ${Number(project.valor_fechado).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Classe de consumo:</span>
                  <span className="min-w-0 max-w-full font-semibold text-ink-800 text-xs break-words [overflow-wrap:anywhere]">
                    {project.classe_consumidor?.trim() || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Modalidade tarifária:</span>
                  <span className="min-w-0 max-w-full font-semibold text-ink-800 text-xs break-words [overflow-wrap:anywhere]">
                    {project.modalidade_tarifaria || "—"}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Contato comercial:</span>
                  <span className="min-w-0 max-w-full font-semibold text-ink-800 text-xs break-words [overflow-wrap:anywhere]">{project.contato_comercial || "—"}</span>
                </div>
                <div className="flex flex-wrap justify-between items-start gap-x-3 gap-y-1 border-b border-ink-50 pb-1">
                  <span className="text-ink-500 text-[11px]">Troca de grupo:</span>
                  <span className="min-w-0 max-w-full font-semibold text-ink-800 text-xs break-words [overflow-wrap:anywhere]">{project.troca_grupo || "—"}</span>
                </div>
                <div>
                  <span className="text-ink-500 text-[10px] block">Garantia estendida</span>
                  <span className="font-semibold text-ink-800 text-xs block mt-0.5 break-words">
                    {project.garantia_estendida || "Padrão de fábrica"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cronograma de Marcos & Homologação */}
          <div className="p-4 bg-white rounded-lg border border-ink-200 shadow-xs space-y-3">
            <div className="eyebrow text-[10px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.75} />
              Cronograma detalhado de marcos & concessionária
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-ink-50 rounded border border-ink-100">
                <span className="text-ink-500 block text-[10px] font-medium">Data de fechamento</span>
                <span className="font-mono font-bold text-ink-900 text-xs block mt-1">
                  {project.data_fechamento || "—"}
                </span>
              </div>
              <div className="p-3 bg-ink-50 rounded border border-ink-100">
                <span className="text-ink-500 block text-[10px] font-medium">Data do contrato</span>
                <span className="font-mono font-bold text-ink-900 text-xs block mt-1">
                  {project.data_contrato || "—"}
                </span>
              </div>
              <div className="p-3 bg-ink-50 rounded border border-ink-100">
                <span className="text-ink-500 block text-[10px] font-medium">Aprovação de projeto</span>
                <span className="font-mono font-bold text-ink-900 text-xs block mt-1">
                  {project.data_aprovacao || "—"}
                </span>
                {project.projeto_aprovado && (
                  <span className="text-[10px] text-gauss-700 block mt-0.5">Status: {project.projeto_aprovado}</span>
                )}
              </div>
              <div className="p-3 bg-ink-50 rounded border border-ink-100">
                <span className="text-ink-500 block text-[10px] font-medium">Vistoria técnica</span>
                <span className="font-mono font-bold text-ink-900 text-xs block mt-1">
                  {project.data_vistoria || "—"}
                </span>
                {project.vistoria_aprovada && (
                  <span className="text-[10px] text-gauss-700 block mt-0.5">Status: {project.vistoria_aprovada}</span>
                )}
              </div>
              <div className="p-3 bg-gauss-100 rounded border border-gauss-borderGreen">
                <span className="text-gauss-900 block text-[10px] font-bold">Troca do medidor</span>
                <span className="font-mono font-bold text-gauss-900 text-xs block mt-1">
                  {project.data_troca_medidor || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Relação integral de todos os campos recebidos do banco */}
          <section className="p-4 bg-white rounded-lg border border-ink-200 shadow-xs space-y-3">
            <div className="eyebrow text-[10px] flex items-center gap-1.5 border-b border-ink-100 pb-2">
              <FileText className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.75} />
              Todos os campos do registro
            </div>
            <p className="text-xs text-ink-500">
              Lista completa dos campos recebidos para este projeto, incluindo campos adicionais que não possuem uma seção específica nesta ficha.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(project).map(([key, value]) => (
                <div key={key} className="min-w-0 p-3 bg-ink-50 rounded border border-ink-100">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-ink-500 mb-1 break-words">
                    {formatFieldLabel(key)}
                  </div>
                  <div className="text-xs text-ink-900 whitespace-pre-wrap break-all [overflow-wrap:anywhere]">
                    {formatFieldValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dados de Integração e Localização */}
          <div className="p-4 bg-white rounded-lg border border-ink-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <div className="space-y-1.5 flex-1">
              <div className="eyebrow text-[10px]">Process Street & Rastreabilidade de sincronização</div>
              <div className="flex items-center gap-3 text-ink-700 font-mono text-[11px] flex-wrap">
                {project.process_run_id && (
                  <span className="bg-ink-100 px-2.5 py-1 rounded border border-ink-200 break-all">
                    Run ID: {project.process_run_id}
                  </span>
                )}
                {project.process_workflow_id && (
                  <span className="bg-ink-100 px-2.5 py-1 rounded border border-ink-200 break-all">
                    Workflow: {project.process_workflow_id}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-ink-500 flex flex-wrap gap-x-4 pt-1">
                {project.created_at && (
                  <div>Criado em: {new Date(project.created_at).toLocaleString("pt-BR")}</div>
                )}
                {project.ultima_atualizacao && (
                  <div>Última atualização: {new Date(project.ultima_atualizacao).toLocaleString("pt-BR")}</div>
                )}
              </div>
            </div>

            {project.link_maps && (
              <a
                href={project.link_maps}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gauss-primary text-xs whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-ink-50 border-t border-ink-200 flex justify-end">
          <button
            onClick={onClose}
            className="btn-gauss-secondary text-xs"
          >
            Fechar ficha técnica
          </button>
        </div>
      </div>
    </div>
  );
}
