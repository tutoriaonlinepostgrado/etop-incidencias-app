import React from 'react';
import { Incident } from '../utils/auditLogic';
import { ExternalLink, Paperclip, FileSearch } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents }) => {
  const sortedIncidents = [...incidents].sort((a, b) =>
    String(a.idIncidencia || a.id).localeCompare(String(b.idIncidencia || b.id), 'es')
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
            PENDIENTE
          </span>
        );
      case 'CORREGIDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            CORREGIDA
          </span>
        );
      case 'DERIVADO':
      case 'DERIVADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5f3ff] text-[#6b21a8] border border-[#ddd6fe]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
            DERIVADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]">
            {status || '—'}
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-x-auto border-t border-[#e2e8f0] bg-white">
      <table className="w-full text-left text-xs border-collapse min-w-[960px]">
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] text-[11px] uppercase tracking-wider font-semibold select-none">
            <th className="py-2.5 px-3 w-[12%]"># ID Incidencia</th>
            <th className="py-2.5 px-3 w-[11%]">Estado</th>
            <th className="py-2.5 px-3 w-[11%]">Tipo QA</th>
            <th className="py-2.5 px-3 w-[13%]">Categoría</th>
            <th className="py-2.5 px-3 w-[27%]">Descripción de Incidencia</th>
            <th className="py-2.5 px-3 w-[20%]">Solución Reportada</th>
            <th className="py-2.5 px-3 w-[6%] text-center">Evidencia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]">
          {sortedIncidents.map((inc) => (
            <tr
              key={inc.idIncidencia || inc.id}
              className="hover:bg-[#f8fafc] transition-colors group text-[#334155]"
            >
              <td className="py-2.5 px-3 font-data-mono font-medium text-[#1e293b] whitespace-nowrap">
                #{inc.idIncidencia || inc.id || '—'}
              </td>
              <td className="py-2.5 px-3 whitespace-nowrap">
                {getStatusBadge(inc.estadoIncidencia)}
              </td>
              <td className="py-2.5 px-3 font-medium text-[#475569] whitespace-nowrap">
                {inc.tipoQA || '—'}
              </td>
              <td className="py-2.5 px-3 font-medium text-[#0f172a]">
                <span className="px-1.5 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-[11px]">
                  {inc.categoria || '—'}
                </span>
                {inc.semanaUnidad && (
                  <span className="ml-1.5 text-[10px] text-[#64748b]">
                    ({inc.semanaUnidad})
                  </span>
                )}
              </td>
              <td className="py-2.5 px-3 text-[#1e293b] leading-relaxed break-words max-w-sm">
                {inc.descripcionIncidencia || '—'}
              </td>
              <td className="py-2.5 px-3 leading-relaxed break-words max-w-xs">
                {inc.descripcionSolucion ? (
                  <span className={inc.estadoIncidencia === 'CORREGIDA' ? 'text-[#059669] font-medium' : 'text-[#475569]'}>
                    {inc.descripcionSolucion}
                  </span>
                ) : (
                  <span className="text-[#94a3b8] italic">Sin solución registrada</span>
                )}
              </td>
              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                {inc.urlEvidencia ? (
                  <a
                    href={inc.urlEvidencia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center p-1 rounded text-[#1d4ed8] hover:bg-[#eff6ff] hover:text-[#1e40af] transition-colors"
                    title="Ver archivo de evidencia adjunto"
                  >
                    <FileSearch className="w-4 h-4" />
                  </a>
                ) : inc.tieneAdjuntos ? (
                  <span
                    className="inline-flex items-center justify-center p-1 text-[#64748b]"
                    title="Indica adjuntos en registro"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="text-[#cbd5e1]">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
