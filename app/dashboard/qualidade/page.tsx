"use client"
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle, FileWarning, UserX } from "lucide-react";
import clsx from "clsx";

export default function QualidadePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState({
    totalProjetos: 0,
    semPotencia: 0,
    semDataFechamento: 0,
    semInversor: 0,
    totalClientes: 0,
    semDocumento: 0,
    semTelefone: 0,
  });
  const [inconsistentProjetos, setInconsistentProjetos] = useState<any[]>([]);

  useEffect(() => {
    async function evaluateDataQuality() {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        
        const [projRes, cliRes] = await Promise.all([
          supabase.from('vw_projetos').select('codigo_projeto, razao_social, potencia_dc, data_fechamento, marca_inversor, status_sistema').limit(1000),
          supabase.from('vw_clientes').select('id, razao_social, cpf_cnpj, telefone').limit(1000),
        ]);

        if (projRes.error) throw projRes.error;
        if (cliRes.error) throw cliRes.error;

        const projetos = projRes.data || [];
        const clientes = cliRes.data || [];

        let semPot = 0;
        let semData = 0;
        let semInv = 0;
        const problemList: any[] = [];

        projetos.forEach((p) => {
          const issues: string[] = [];
          if (!p.potencia_dc) {
            semPot++;
            issues.push("Sem potência DC");
          }
          if (!p.data_fechamento) {
            semData++;
            issues.push("Sem data fechamento");
          }
          if (!p.marca_inversor) {
            semInv++;
            issues.push("Sem fabricante inversor");
          }

          if (issues.length > 0 && problemList.length < 15) {
            problemList.push({
              ...p,
              issues,
            });
          }
        });

        let semDoc = 0;
        let semTel = 0;
        clientes.forEach((c) => {
          if (!c.cpf_cnpj || c.cpf_cnpj.trim() === '') semDoc++;
          if (!c.telefone || c.telefone.trim() === '') semTel++;
        });

        setMetrics({
          totalProjetos: projetos.length,
          semPotencia: semPot,
          semDataFechamento: semData,
          semInversor: semInv,
          totalClientes: clientes.length,
          semDocumento: semDoc,
          semTelefone: semTel,
        });

        setInconsistentProjetos(problemList);
      } catch (err: any) {
        setError(err.message || "Erro ao auditar qualidade de dados");
      } finally {
        setLoading(false);
      }
    }

    evaluateDataQuality();
  }, []);

  const projectHealthScore = metrics.totalProjetos > 0
    ? Math.round(100 - ((metrics.semPotencia + metrics.semDataFechamento) / (metrics.totalProjetos * 2)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
            Auditoria & governança cadastral
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            Qualidade dos dados
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Diagnóstico de completude cadastral e integridade nas views do banco de dados.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-signal-warn rounded-r-md text-sm font-medium">
          Erro ao auditar: {error}
        </div>
      )}

      {/* Score Geral de Integridade */}
      <div className="bg-white p-6 rounded-lg border border-ink-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className={clsx(
            "p-3 rounded-full",
            projectHealthScore >= 80 ? "bg-gauss-100 text-gauss-900 border border-gauss-borderGreen" : "bg-[#FEF3E1] text-[#946100]"
          )}>
            {projectHealthScore >= 80 ? (
              <ShieldCheck className="w-7 h-7 text-gauss-700" strokeWidth={1.75} />
            ) : (
              <ShieldAlert className="w-7 h-7 text-[#946100]" strokeWidth={1.75} />
            )}
          </div>
          <div>
            <div className="eyebrow text-[10px]">Indicador de governança</div>
            <h3 className="text-base font-bold text-ink-900">Índice de completude cadastral</h3>
            <p className="text-xs text-ink-400 mt-0.5">
              Percentual ponderado de campos mandatórios preenchidos (potência nominal, datas de fechamento e dados cadastrais)
            </p>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-ink-900 readout">
            {loading ? "…" : `${projectHealthScore} %`}
          </span>
          <span className="text-xs font-semibold text-ink-400">índice global</span>
        </div>
      </div>

      {/* Grid de Diagnósticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 bg-white border border-ink-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-[10px]">Projetos sem potência</span>
            <AlertTriangle className="w-4 h-4 text-[#946100]" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-extrabold text-ink-900 readout">{loading ? "…" : metrics.semPotencia}</div>
          <p className="text-[11px] text-ink-400 mt-1">Registros com potência DC nula</p>
        </div>

        <div className="p-5 bg-white border border-ink-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-[10px]">Sem data de fechamento</span>
            <FileWarning className="w-4 h-4 text-[#946100]" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-extrabold text-ink-900 readout">{loading ? "…" : metrics.semDataFechamento}</div>
          <p className="text-[11px] text-ink-400 mt-1">Data de contrato não preenchida</p>
        </div>

        <div className="p-5 bg-white border border-ink-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-[10px]">Clientes sem documento</span>
            <UserX className="w-4 h-4 text-signal-warn" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-extrabold text-ink-900 readout">{loading ? "…" : metrics.semDocumento}</div>
          <p className="text-[11px] text-ink-400 mt-1">CPF ou CNPJ ausente na base</p>
        </div>

        <div className="p-5 bg-white border border-ink-200 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="eyebrow text-[10px]">Clientes sem telefone</span>
            <UserX className="w-4 h-4 text-ink-400" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-extrabold text-ink-900 readout">{loading ? "…" : metrics.semTelefone}</div>
          <p className="text-[11px] text-ink-400 mt-1">Contato telefônico pendente</p>
        </div>
      </div>

      {/* Tabela de Amostra de Inconsistências */}
      <div className="bg-white rounded-lg border border-ink-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-ink-50 border-b border-ink-200">
          <div className="eyebrow text-ink-600">Amostra de registros com campos pendentes</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider bg-white border-b border-ink-100">
              <tr>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Pendências detectadas</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-ink-400">Auditando base…</td></tr>
              ) : inconsistentProjetos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gauss-900 font-medium">
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-gauss-green" strokeWidth={1.75} />
                    Nenhuma inconsistência crítica detectada na amostra auditada!
                  </td>
                </tr>
              ) : (
                inconsistentProjetos.map((proj, idx) => (
                  <tr key={proj.codigo_projeto || idx} className="hover:bg-ink-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-ink-900">{proj.codigo_projeto}</td>
                    <td className="px-5 py-3 truncate max-w-[200px] text-ink-800 font-medium">{proj.razao_social || "Não informado"}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {proj.issues.map((issue: string, iIdx: number) => (
                          <span key={iIdx} className="badge-gauss-warn text-[10px]">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-ink-500 font-mono text-[11px]">{proj.status_sistema || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}