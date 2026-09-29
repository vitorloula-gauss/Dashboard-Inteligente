"use client"
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, FolderKanban, Zap, AlertCircle, TrendingUp, CheckCircle2, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { ProjectDetailModal } from "@/components/dashboard/project-detail-modal";
import Link from "next/link";
import clsx from "clsx";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    totalProjetos: 0,
    totalClientes: 0,
    totalPotenciaKwp: 0,
    totalAumentos: 0,
    onTrack: 0,
    overdue: 0,
  });
  const [recentProjetos, setRecentProjetos] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      
      const [{ count: projetosCount, error: projErr }, { count: clientesCount, error: cliErr }] = await Promise.all([
        supabase.from('vw_projetos').select('*', { count: 'exact', head: true }),
        supabase.from('vw_clientes').select('*', { count: 'exact', head: true })
      ]);

      if (projErr || cliErr) {
        throw new Error(projErr?.message || cliErr?.message);
      }

      const { data: sampleData, error: sampleErr } = await supabase
        .from('vw_projetos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (sampleErr) throw sampleErr;

      let kwpSum = 0;
      let onTrackCount = 0;
      let overdueCount = 0;
      let aumentosCount = 0;

      sampleData?.forEach((p) => {
        if (p.potencia_dc) kwpSum += Number(p.potencia_dc);
        if (p.status_sistema === 'OnTrack') onTrackCount++;
        if (p.status_sistema === 'Overdue') overdueCount++;
        if (p.codigo_projeto && p.codigo_projeto.includes('.')) aumentosCount++;
      });

      setStats({
        totalProjetos: projetosCount || 0,
        totalClientes: clientesCount || 0,
        totalPotenciaKwp: Math.round(kwpSum),
        totalAumentos: aumentosCount,
        onTrack: onTrackCount,
        overdue: overdueCount,
      });

      setRecentProjetos(sampleData?.slice(0, 6) || []);
    } catch (err: any) {
      setError(err.message || "Erro ao consultar Supabase");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
            Visão geral operacional
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            Painel operacional
          </h1>
          <p className="text-ink-500 mt-1 text-sm font-normal">
            Acompanhamento técnico e comercial da frota de usinas solares Gauss Energia.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="btn-gauss-primary disabled:opacity-50"
        >
          <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
          <span>{loading ? "Carregando…" : "Atualizar dados"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-signal-warn rounded-r-md flex items-center text-sm font-medium">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 text-signal-warn" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de Cards de Estatísticas estilo Gauss Design System */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          eyebrow="Base instalada"
          title="Total de projetos"
          value={loading ? "…" : stats.totalProjetos.toLocaleString('pt-BR')}
          note="Sincronizados via Process Street"
          icon={FolderKanban}
          accent={true}
        />
        <StatCard
          eyebrow="Clientes ativos"
          title="Total de clientes"
          value={loading ? "…" : stats.totalClientes.toLocaleString('pt-BR')}
          note="Pessoas físicas e jurídicas"
          icon={Users}
        />
        <StatCard
          eyebrow="Potência amostral"
          title="Potência DC instalada"
          value={loading ? "…" : `${stats.totalPotenciaKwp.toLocaleString('pt-BR')} kWp`}
          note="Soma dos últimos 100 projetos"
          icon={Zap}
        />
        <StatCard
          eyebrow="Status de entregas"
          title="Projetos em dia vs atrasados"
          value={loading ? "…" : `${stats.onTrack} / ${stats.overdue}`}
          note="OnTrack / Overdue (amostra)"
          icon={TrendingUp}
        />
      </div>

      {/* Seção com Saúde Operacional e Tabela de Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card de Saúde Operacional */}
        <div className="bg-white p-6 rounded-lg border border-ink-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="eyebrow mb-1">Diagnóstico operacional</div>
            <h3 className="text-base font-bold text-ink-900 mb-1">
              Saúde operacional dos projetos
            </h3>
            <p className="text-xs text-ink-400 mb-5">
              Classificação por conformidade com o cronograma estabelecido
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-gauss-100 rounded-md border border-gauss-borderGreen">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gauss-900" />
                  <span className="text-xs font-semibold text-gauss-900">Em dia (OnTrack)</span>
                </div>
                <span className="text-sm font-bold text-gauss-900 readout">
                  {loading ? "…" : stats.onTrack}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#FEF3E1] rounded-md border border-[#F5D8A0]">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#946100]" />
                  <span className="text-xs font-semibold text-[#946100]">Atrasados (Overdue)</span>
                </div>
                <span className="text-sm font-bold text-[#946100] readout">
                  {loading ? "…" : stats.overdue}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between">
            <span className="text-xs text-ink-500 font-medium">Expansões detectadas:</span>
            <span className="badge-gauss-ok font-mono text-[10px]">
              {loading ? "…" : `${stats.totalAumentos} aumentos`}
            </span>
          </div>
        </div>

        {/* Tabela de Projetos Recentes */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-ink-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-ink-50 border-b border-ink-200 flex justify-between items-center">
            <div className="eyebrow text-ink-600">Últimos projetos sincronizados</div>
            <Link
              href="/dashboard/projetos"
              className="text-xs font-semibold text-gauss-green hover:text-gauss-700 flex items-center gap-1 transition"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider bg-white border-b border-ink-100">
                <tr>
                  <th className="px-5 py-3">Código</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Cidade</th>
                  <th className="px-5 py-3">Potência</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-400">
                      Carregando dados…
                    </td>
                  </tr>
                ) : recentProjetos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-400">
                      Nenhum projeto encontrado.
                    </td>
                  </tr>
                ) : (
                  recentProjetos.map((p) => {
                    const isOverdue = p.status_sistema?.toLowerCase() === "overdue";
                    return (
                      <tr
                        key={p.codigo_projeto}
                        onClick={() => setSelectedProject(p)}
                        className="hover:bg-ink-50 transition-colors cursor-pointer group"
                        title="Clique para ver a ficha técnica deste projeto"
                      >
                        <td className="px-5 py-3 font-mono font-bold text-ink-900 group-hover:text-gauss-green transition-colors">
                          {p.codigo_projeto}
                        </td>
                        <td className="px-5 py-3 truncate max-w-[190px] font-medium text-ink-800" title={p.razao_social}>
                          {p.razao_social || "—"}
                        </td>
                        <td className="px-5 py-3 text-ink-500">
                          {p.cidade?.trim() || "—"}
                        </td>
                        <td className="px-5 py-3 font-semibold text-ink-800 readout">
                          {p.potencia_dc ? `${Number(p.potencia_dc).toLocaleString('pt-BR')} kWp` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={isOverdue ? "badge-gauss-warn" : "badge-gauss-ok"}>
                            <span className={clsx(
                              "w-1.5 h-1.5 rounded-full",
                              isOverdue ? "bg-[#946100]" : "bg-gauss-green"
                            )}></span>
                            {p.status_sistema || "OnTrack"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal da Usina */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}

function StatCard({ eyebrow, title, value, note, icon: Icon, accent = false }: any) {
  return (
    <div className={clsx(
      "p-5 rounded-lg border shadow-sm flex flex-col justify-between transition-all",
      accent
        ? "bg-white border-gauss-green shadow-glowGreen"
        : "bg-white border-ink-200 hover:border-ink-300"
    )}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="eyebrow text-[10px]">{eyebrow}</span>
          <Icon className={clsx("w-4 h-4", accent ? "text-gauss-green" : "text-ink-400")} strokeWidth={1.75} />
        </div>
        <h3 className="text-xs font-semibold text-ink-600 mb-2">{title}</h3>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-ink-900 readout tracking-tight">
          {value}
        </div>
        {note && <p className="text-[11px] text-ink-400 mt-1.5">{note}</p>}
      </div>
    </div>
  );
}