import React from 'react';
import { KpiStats } from '../utils/auditLogic';
import {
  ChevronUp,
  ChevronDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  CheckCheck,
  Share2,
  Layers,
  X,
} from 'lucide-react';

interface KpiMetricsRowProps {
  stats: KpiStats;
  statMode: string;
  onSelectStat: (mode: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const KpiMetricsRow: React.FC<KpiMetricsRowProps> = ({
  stats,
  statMode,
  onSelectStat,
  isCollapsed,
  onToggleCollapse,
}) => {
  const cards: Array<{
    mode: string;
    label: string;
    subLabel: string;
    value: number;
    color: string;
    accentBg: string;
    icon: React.ReactNode;
  }> = [
    {
      mode: '',
      label: 'Total NRC',
      subLabel: 'Cursos Totales',
      value: stats.total,
      color: '#1d4ed8',
      accentBg: 'bg-[#1d4ed8]',
      icon: <Layers className="w-3.5 h-3.5 text-[#1d4ed8]" />,
    },
    {
      mode: 'CON',
      label: 'Con Incidencia',
      subLabel: 'NRC Afectados',
      value: stats.conIncidencias,
      color: '#dc2626',
      accentBg: 'bg-[#dc2626]',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />,
    },
    {
      mode: 'SIN',
      label: 'Sin Incidencia',
      subLabel: 'NRC Validados',
      value: stats.sinIncidencias,
      color: '#059669',
      accentBg: 'bg-[#059669]',
      icon: <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />,
    },
    {
      mode: 'PENDQA',
      label: 'QA2 Pendiente',
      subLabel: 'Sin Registro',
      value: stats.qaPendiente,
      color: '#d97706',
      accentBg: 'bg-[#d97706]',
      icon: <Clock className="w-3.5 h-3.5 text-[#d97706]" />,
    },
    {
      mode: 'PENDINC',
      label: 'Inc. Pendientes',
      subLabel: 'En Revisión',
      value: stats.incidenciasPendientes,
      color: '#dc2626',
      accentBg: 'bg-[#dc2626]',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />,
    },
    {
      mode: 'CORR',
      label: 'Corregidas',
      subLabel: 'Solventadas',
      value: stats.corregidas,
      color: '#059669',
      accentBg: 'bg-[#059669]',
      icon: <CheckCheck className="w-3.5 h-3.5 text-[#059669]" />,
    },
    {
      mode: 'DER',
      label: 'Derivadas',
      subLabel: 'Otras Áreas',
      value: stats.derivadas,
      color: '#7c3aed',
      accentBg: 'bg-[#7c3aed]',
      icon: <Share2 className="w-3.5 h-3.5 text-[#7c3aed]" />,
    },
  ];

  const activeLabelMap: Record<string, string> = {
    CON: 'Con incidencia',
    SIN: 'Sin incidencia',
    PENDQA: 'QA2 pendiente',
    PENDINC: 'Incidencias pendientes',
    CORR: 'Corregidas',
    DER: 'Derivadas',
  };

  return (
    <section className="mb-2.5">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-1.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-[#475569]" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0f172a]">
            KPIs Operativos QA2
          </h2>
          {statMode && (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
              <span>Filtro KPI: {activeLabelMap[statMode] || statMode}</span>
              <button
                type="button"
                onClick={() => onSelectStat('')}
                className="hover:text-[#1e40af] transition-colors"
                title="Quitar filtro de KPI"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-semibold text-[#475569] hover:text-[#0f172a] bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded transition-colors"
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>Mostrar KPIs</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>Compactar</span>
            </>
          )}
        </button>
      </div>

      {/* Compact Grid of 7 KPI Cards */}
      {!isCollapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {cards.map((card) => {
            const isActive = statMode === card.mode && (card.mode !== '' || statMode === '');
            return (
              <button
                key={card.label}
                type="button"
                onClick={() => onSelectStat(card.mode)}
                className={`relative text-left px-2.5 py-2 rounded bg-white border transition-all duration-150 cursor-pointer overflow-hidden group shadow-2xs ${
                  isActive
                    ? 'border-[#1d4ed8] ring-2 ring-[#1d4ed8]/20 bg-[#eff6ff]/30'
                    : 'border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-xs'
                }`}
              >
                <span
                  className={`absolute top-0 left-0 right-0 h-0.75 ${card.accentBg} transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                  }`}
                />

                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#475569] truncate">
                    {card.label}
                  </span>
                  <span className="shrink-0">{card.icon}</span>
                </div>

                <div className="flex items-baseline justify-between gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0f172a] font-sans tnum leading-tight">
                    {card.value.toLocaleString('es-CL')}
                  </span>
                  <span className="text-[9.5px] text-[#64748b] font-medium truncate">
                    {card.subLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
