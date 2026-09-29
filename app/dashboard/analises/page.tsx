"use client"
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { LineChart as LineChartIcon, Zap, AlertCircle } from "lucide-react";

export default function AnalisesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cidadesData, setCidadesData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [inversoresData, setInversoresData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadMetrics() {
      setLoading(true);
      setError("");
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('vw_projetos')
          .select('cidade, potencia_dc, status_sistema, marca_inversor')
          .limit(1000);

        if (error) throw error;

        const cidadesMap: Record<string, number> = {};
        const statusMap: Record<string, number> = {};
        const inversoresMap: Record<string, number> = {};

        data?.forEach((p) => {
          const cid = p.cidade ? p.cidade.trim() : "Outros";
          const kwp = Number(p.potencia_dc) || 0;
          cidadesMap[cid] = (cidadesMap[cid] || 0) + kwp;

          const st = p.status_sistema || "Indefinido";
          statusMap[st] = (statusMap[st] || 0) + 1;

          if (p.marca_inversor) {
            const inv = p.marca_inversor.trim();
            inversoresMap[inv] = (inversoresMap[inv] || 0) + 1;
          }
        });

        const topCidades = Object.entries(cidadesMap)
          .map(([name, value]) => ({ name, value: Math.round(value) }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        const stList = Object.entries(statusMap).map(([name, value]) => ({
          name,
          value,
        }));

        const topInversores = Object.entries(inversoresMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setCidadesData(topCidades);
        setStatusData(stList);
        setInversoresData(topInversores);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar análises");
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, []);

  // Cores estritas do Gauss Design System v2: #39B54A (Gauss Green), #D9534F (Warn), #969C97 (Ink 400)
  const GAUSS_GREEN = "#39B54A";
  const GAUSS_GREEN_DARK = "#2A8D38";
  const INK_LIGHT_GREEN = "#8FD79A";
  const SIGNAL_WARN = "#D9534F";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-ink-200 pb-5">
        <div>
          <div className="eyebrow flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
            BI & inteligência técnica
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
            Indicadores e métricas
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Distribuição de potência instalada, status operacional e fabricantes de equipamentos.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border-l-4 border-signal-warn rounded-r-md text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-signal-warn" />
          <span>Erro ao carregar dados: {error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-ink-500 font-medium bg-white rounded-lg border border-ink-200 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-gauss-green border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs">Processando métricas e indicadores operacionais…</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico 1: Top Cidades por Potência */}
          <div className="bg-white p-6 rounded-lg border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="eyebrow text-[10px]">Geografia da frota</div>
                <h3 className="text-base font-bold text-ink-900">Top cidades por potência DC instalada</h3>
                <p className="text-xs text-ink-400 mt-0.5">Soma da potência nominal (kWp) por município</p>
              </div>
              <Zap className="w-4 h-4 text-gauss-green" strokeWidth={1.75} />
            </div>
            <div className="h-64 w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cidadesData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" unit=" kWp" fontSize={11} stroke="#969C97" />
                    <YAxis dataKey="name" type="category" fontSize={11} width={100} stroke="#475149" />
                    <Tooltip
                      formatter={(value: any) => [`${Number(value).toLocaleString('pt-BR')} kWp`, "Potência"]}
                      contentStyle={{ backgroundColor: "#07100A", border: "none", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px" }}
                    />
                    <Bar dataKey="value" fill={GAUSS_GREEN} radius={[0, 4, 4, 0]}>
                      {cidadesData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === 0 ? GAUSS_GREEN : index === 1 ? GAUSS_GREEN_DARK : INK_LIGHT_GREEN}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Gráfico 2: Distribuição de Status */}
          <div className="bg-white p-6 rounded-lg border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="eyebrow text-[10px]">Cronograma de execução</div>
                <h3 className="text-base font-bold text-ink-900">Distribuição por status operacional</h3>
                <p className="text-xs text-ink-400 mt-0.5">Projetos em dia (OnTrack) vs atrasados (Overdue)</p>
              </div>
              <LineChartIcon className="w-4 h-4 text-gauss-green" strokeWidth={1.75} />
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)} %)`}
                    >
                      {statusData.map((entry, index) => {
                        const color = entry.name?.toLowerCase() === "overdue" ? SIGNAL_WARN : GAUSS_GREEN;
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#07100A", border: "none", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Gráfico 3: Fabricantes de Inversores */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-ink-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="eyebrow text-[10px]">Engenharia de fornecimento</div>
                <h3 className="text-base font-bold text-ink-900">Fabricantes de inversores mais utilizados</h3>
                <p className="text-xs text-ink-400 mt-0.5">Volume de usinas por fabricante de inversor fotovoltaico</p>
              </div>
            </div>
            <div className="h-64 w-full">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inversoresData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={11} stroke="#475149" />
                    <YAxis fontSize={11} stroke="#969C97" />
                    <Tooltip
                      formatter={(value: any) => [`${value} projetos`, "Total"]}
                      contentStyle={{ backgroundColor: "#07100A", border: "none", borderRadius: "6px", color: "#FFFFFF", fontSize: "12px" }}
                    />
                    <Bar dataKey="value" fill={GAUSS_GREEN} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}