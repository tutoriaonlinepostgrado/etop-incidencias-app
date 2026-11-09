import React from 'react';
import { Incident } from '../utils/auditLogic';
import { FileSearch, Paperclip, Copy, Check, CheckSquare, Square } from 'lucide-react';

interface IncidentTableProps {
  incidents: Incident[];
  selectedIncidentIds: Set<string>;
  onToggleIncident: (incident: Incident) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCopyIncident: (incident: Incident) => void;
  copiedIncidentId: string | null;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  selectedIncidentIds,
  onToggleIncident,
  onSelectAll,
  onDeselectAll,
  onCopyIncident,
  copiedIncidentId,
}) => {
  const sortedIncidents = [...incidents].sort((a, b) =>
    String(a.idIncidencia || a.id).localeCompare(String(b.idIncidencia || b.id), 'es')
  );

  const allSelected =
    sortedIncidents.length > 0 &&
    sortedIncidents.every((inc) => selectedIncidentIds.has(inc.idIncidencia || String(inc.id)));

  const someSelected = selectedIncidentIds.size > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
            PENDIENTE
          </span>
        );
      case 'CORREGIDA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
            CORREGIDA
          </span>
        );
      case 'DERIVADO':
      case 'DERIVADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#f5f3ff] text-[#6b21a8] border border-[#ddd6fe]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
            DERIVADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#f1f5f9] text-[#475569] border border-[#cbd5e1]">
            {status || '—'}
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-x-auto border-t border-[#e2e8f0] bg-white">
      {/* Sub-header with selection controls */}
      <div className="px-3 py-1.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748b]">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#334155]">
            Selecciona una o más filas para copiar por correo (haz clic de nuevo para deseleccionar):
          </span>
          {someSelected ? (
            <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] text-[10.5px] font-semibold tnum">
              {selectedIncidentIds.size} seleccionada{selectedIncidentIds.size === 1 ? '' : 's'}
            </span>
          ) : (
            <span className="text-[10.5px] text-[#94a3b8] italic">
              Ninguna fila seleccionada
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white hover:bg-[#f1f5f9] text-[#1d4ed8] border border-[#cbd5e1] text-[10.5px] font-semibold transition-colors"
          >
            {allSelected ? (
              <>
                <Square className="w-3 h-3" />
                <span>Deseleccionar todas</span>
              </>
            ) : (
              <>
                <CheckSquare className="w-3 h-3" />
                <span>Seleccionar todas ({sortedIncidents.length})</span>
              </>
            )}
          </button>

          {someSelected && !allSelected && (
            <button
              type="button"
              onClick={onDeselectAll}
              className="text-[10.5px] font-semibold text-[#64748b] hover:text-[#dc2626] transition-colors px-1.5 py-0.5"
            >
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      <table className="w-full text-left text-xs border-collapse min-w-[960px]">
        <thead>
          <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#475569] text-[10.5px] uppercase tracking-wider font-semibold select-none">
            <th className="py-2.5 px-3 w-[4%] text-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => (allSelected ? onDeselectAll() : onSelectAll())}
                className="w-3.5 h-3.5 rounded border-[#cbd5e1] text-[#1d4ed8] focus:ring-[#1d4ed8]/20 accent-[#1d4ed8] cursor-pointer"
                title={allSelected ? 'Deseleccionar todas las incidencias' : 'Seleccionar todas las incidencias'}
                aria-label="Seleccionar o deseleccionar todas las incidencias"
              />
            </th>
            <th className="py-2.5 px-3 w-[12%]"># ID Incidencia</th>
            <th className="py-2.5 px-3 w-[10%]">Estado</th>
            <th className="py-2.5 px-3 w-[10%]">Tipo QA</th>
            <th className="py-2.5 px-3 w-[12%]">Categoría</th>
            <th className="py-2.5 px-3 w-[26%]">Descripción de Incidencia</th>
            <th className="py-2.5 px-3 w-[18%]">Solución Reportada</th>
            <th className="py-2.5 px-2 w-[4%] text-center">Evidencia</th>
            <th className="py-2.5 px-3 w-[4%] text-center">Copiar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1f5f9]">
          {sortedIncidents.map((inc) => {
            const incKey = inc.idIncidencia || String(inc.id);
            const isSelected = selectedIncidentIds.has(incKey);
            const isCopied = copiedIncidentId === incKey;

            return (
              <tr
                key={incKey}
                onClick={() => onToggleIncident(inc)}
                className={`cursor-pointer transition-colors group text-[#334155] ${
                  isSelected
                    ? 'bg-[#eff6ff] border-l-2 border-l-[#1d4ed8]'
                    : 'hover:bg-[#f8fafc]'
                }`}
                title={isSelected ? 'Haz clic para deseleccionar esta incidencia' : 'Haz clic para seleccionar esta incidencia'}
              >
                {/* Checkbox Multi-Selector */}
                <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleIncident(inc)}
                    className="w-3.5 h-3.5 rounded border-[#cbd5e1] text-[#1d4ed8] focus:ring-[#1d4ed8]/20 accent-[#1d4ed8] cursor-pointer"
                    title={isSelected ? 'Deseleccionar esta incidencia' : 'Seleccionar esta incidencia'}
                    aria-label={`Seleccionar incidencia ${incKey}`}
                  />
                </td>

                {/* ID */}
                <td className="py-2.5 px-3 font-data-mono font-medium text-[#1e293b] whitespace-nowrap">
                  #{inc.idIncidencia || inc.id || '—'}
                </td>

                {/* Status */}
                <td className="py-2.5 px-3 whitespace-nowrap">
                  {getStatusBadge(inc.estadoIncidencia)}
                </td>

                {/* Type QA */}
                <td className="py-2.5 px-3 font-medium text-[#475569] whitespace-nowrap">
                  {inc.tipoQA || '—'}
                </td>

                {/* Category */}
                <td className="py-2.5 px-3 font-medium text-[#0f172a]">
                  <span className="px-1.5 py-0.5 rounded bg-[#f1f5f9] border border-[#e2e8f0] text-[10.5px]">
                    {inc.categoria || '—'}
                  </span>
                  {inc.semanaUnidad && (
                    <span className="ml-1 text-[10px] text-[#64748b]">
                      ({inc.semanaUnidad})
                    </span>
                  )}
                </td>

                {/* Description */}
                <td className="py-2.5 px-3 text-[#1e293b] leading-relaxed break-words max-w-sm">
                  {inc.descripcionIncidencia || '—'}
                </td>

                {/* Solution */}
                <td className="py-2.5 px-3 leading-relaxed break-words max-w-xs">
                  {inc.descripcionSolucion ? (
                    <span
                      className={
                        inc.estadoIncidencia === 'CORREGIDA'
                          ? 'text-[#059669] font-medium'
                          : 'text-[#475569]'
                      }
                    >
                      {inc.descripcionSolucion}
                    </span>
                  ) : (
                    <span className="text-[#94a3b8] italic text-[11px]">Sin solución registrada</span>
                  )}
                </td>

                {/* Evidence Link */}
                <td
                  className="py-2.5 px-2 text-center whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
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

                {/* Copy Row Button */}
                <td
                  className="py-2.5 px-3 text-center whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onCopyIncident(inc)}
                    className={`inline-flex items-center justify-center p-1.5 rounded transition-all ${
                      isCopied
                        ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                        : 'bg-white hover:bg-[#eff6ff] text-[#475569] hover:text-[#1d4ed8] border border-[#cbd5e1]'
                    }`}
                    title="Copiar únicamente esta fila para correo"
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
