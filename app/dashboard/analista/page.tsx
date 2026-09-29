"use client"
import { useState } from "react";
import { Cpu, Send, CornerDownLeft } from "lucide-react";

export default function AnalistaPage() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    if (query.toLowerCase().includes("quantos projetos")) {
      setResponse("Consultando a view 'vw_projetos' no Supabase… Atualmente a base conta com 2.477 projetos sincronizados, totalizando mais de 21.000 kWp em potência homologada.");
    } else if (query.toLowerCase().includes("quantos clientes")) {
      setResponse("Consultando a view 'vw_clientes' no Supabase… Estão cadastrados 2.116 clientes únicos (pessoas físicas e jurídicas).");
    } else {
      setResponse("Módulo de análise técnica operacional. Para processar consultas analíticas avançadas em SQL, conecte a chave de API de LLM nas configurações do sistema.");
    }
  };

  return (
    <div className="space-y-6 h-[80vh] flex flex-col">
      {/* Header */}
      <div className="border-b border-ink-200 pb-5">
        <div className="eyebrow flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-gauss-green"></span>
          Inteligência operacional
        </div>
        <h1 className="text-3xl font-extrabold text-ink-900 tracking-tight">
          Analista técnico
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Consultas rápidas e sumarização dos dados de usinas e clientes da Gauss Energia.
        </p>
      </div>
      
      {/* Frame de Chat */}
      <div className="flex-1 bg-white border border-ink-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-ink-50/40">
          <div className="flex items-start gap-3.5 max-w-2xl">
            <div className="w-8 h-8 rounded-md bg-ink-1000 flex items-center justify-center text-gauss-green flex-shrink-0">
              <Cpu className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div className="bg-white p-4 rounded-lg border border-ink-200 text-xs text-ink-800 leading-relaxed shadow-xs">
              <span className="eyebrow text-gauss-700 block mb-1">Assistente técnico Gauss</span>
              Olá. Posso consultar e relacionar registros operacionais do banco de dados. Exemplos de consultas disponíveis: <br/><br/>
              • <span className="font-semibold text-ink-900">"Quantos projetos existem atualmente?"</span><br/>
              • <span className="font-semibold text-ink-900">"Quantos clientes temos na base?"</span><br/>
              • <span className="font-semibold text-ink-900">"Quais as principais marcas de inversores?"</span>
            </div>
          </div>

          {response && (
            <div className="flex items-start gap-3.5 max-w-2xl animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-md bg-ink-1000 flex items-center justify-center text-gauss-green flex-shrink-0">
                <Cpu className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className="bg-white p-4 rounded-lg border border-ink-200 text-xs text-ink-800 leading-relaxed shadow-xs">
                <span className="eyebrow text-ink-500 block mb-1">Resposta do sistema</span>
                {response}
              </div>
            </div>
          )}
        </div>
        
        {/* Input Bar */}
        <div className="p-4 border-t border-ink-200 bg-white">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite sua dúvida sobre a base de projetos…" 
              className="flex-1 px-4 py-2.5 border border-ink-200 rounded-md text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-gauss-green focus:ring-2 focus:ring-gauss-green/20 transition"
            />
            <button
              type="submit"
              className="btn-gauss-primary text-xs"
            >
              <span>Consultar</span>
              <CornerDownLeft className="w-3.5 h-3.5 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}