import React from 'react';
import { FilterState } from '../utils/auditLogic';
import {
  Search,
  X,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface TopFilterBarProps {
  filters: FilterState;
  statMode: string;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  facultades: string[];
  estadosCurso: string[];
  estadosInc: string[];
  tiposQa: string[];
  categorias: string[];
  tutores: string[];
  searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const TopFilterBar: React.FC<TopFilterBarProps> = ({
  filters,
  statMode,
  onChange,
  onClear,
  onRefresh,
  isRefreshing,
  lastUpdated,
  facultades,
  estadosCurso,
  estadosInc,
  tiposQa,
  categorias,
  tutores,
  searchInputRef,
}) => {
  const updateField = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    Boolean(filters.q) ||
    Boolean(filters.facultad) ||
    Boolean(filters.estadoCurso) ||
    Boolean(filters.fechaDesde) ||
    Boolean(filters.fechaHasta) ||
    Boolean(filters.qa) ||
    Boolean(filters.estadoIncidencia) ||
    Boolean(filters.tipoQa) ||
    Boolean(filters.categoria) ||
    Boolean(filters.tutor) ||
    filters.onlyInc ||
    filters.onlyPendQa ||
    Boolean(statMode);

  const selectBaseClass = (active: boolean) =>
    `h-7 w-full px-2 pr-6 rounded border text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] transition-colors truncate ${
      active
        ? 'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8] font-semibold'
        : 'bg-white border-[#cbd5e1] text-[#334155] hover:border-[#94a3b8]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xs border-b border-[#cbd5e1] shadow-xs select-none">
      <div className="w-full px-3 py-2 sm:px-4 space-y-1.5">
        {/* Filtros compactos: máximo dos filas en escritorio y ancho completo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 2xl:grid-cols-7 gap-1.5 items-center">
          {/* Search Input (NRC, Curso, Programa, Tutor, Código) */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 relative min-w-0">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.q}
              onChange={(e) => updateField('q', e.target.value)}
              placeholder="Buscar NRC, curso, tutor, código… (/)"
              aria-label="Buscar NRC, curso, programa, tutor o código"
              className={`h-7 w-full pl-7 pr-6 rounded border text-[11px] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] transition-colors ${
                filters.q
                  ? 'bg-[#eff6ff] border-[#3b82f6] text-[#0f172a] font-semibold'
                  : 'bg-[#f8fafc] border-[#cbd5e1] text-[#0f172a] placeholder-[#64748b] focus:bg-white'
              }`}
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => updateField('q', '')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#dc2626] p-0.5"
                title="Limpiar texto de búsqueda"
                aria-label="Limpiar texto de búsqueda"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Facultad */}
          <div className="min-w-0 2xl:flex-1">
            <select
              value={filters.facultad}
              onChange={(e) => updateField('facultad', e.target.value)}
              aria-label="Filtrar por Facultad"
              className={selectBaseClass(Boolean(filters.facultad))}
              title="Filtrar por Facultad"
            >
              <option value="">Facultad (Todas)</option>
              {facultades.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Tutor */}
          <div className="min-w-0 2xl:flex-1">
            <select
              value={filters.tutor}
              onChange={(e) => updateField('tutor', e.target.value)}
              aria-label="Filtrar por Tutor"
              className={selectBaseClass(Boolean(filters.tutor))}
              title="Filtrar por Tutor"
            >
              <option value="">Tutor (Todos)</option>
              {tutores.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Curso */}
          <div className="min-w-0 2xl:flex-1">
            <select
              value={filters.estadoCurso}
              onChange={(e) => updateField('estadoCurso', e.target.value)}
              aria-label="Filtrar por Estado del Curso"
              className={selectBaseClass(Boolean(filters.estadoCurso))}
              title="Filtrar por Estado del Curso"
            >
              <option value="">Estado Curso (Todos)</option>
              {estadosCurso.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Resultado QA2 */}
          <div className="min-w-0 2xl:flex-1">
            <select
              value={filters.qa}
              onChange={(e) => updateField('qa', e.target.value)}
              aria-label="Filtrar por Resultado QA2"
              className={selectBaseClass(Boolean(filters.qa))}
              title="Filtrar por Resultado QA2"
            >
              <option value="">Resultado QA2 (Todos)</option>
              <option value="CON INCIDENCIA">Con incidencia</option>
              <option value="SIN INCIDENCIA">Sin incidencia</option>
              <option value="SIN REGISTRO">QA2 pendiente (Sin registro)</option>
            </select>
          </div>

          {/* Estado Incidencia */}
          <div className="min-w-0 2xl:flex-1">
            <select
              value={filters.estadoIncidencia}
              onChange={(e) => updateField('estadoIncidencia', e.target.value)}
              aria-label="Filtrar por Estado de Incidencia"
              className={selectBaseClass(Boolean(filters.estadoIncidencia))}
              title="Filtrar por Estado de Incidencia"
            >
              <option value="">Estado Inc. (Todos)</option>
              {estadosInc.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo QA */}
          <div className="min-w-0 2xl:flex-1">
            <select
              value={filters.tipoQa}
              onChange={(e) => updateField('tipoQa', e.target.value)}
              aria-label="Filtrar por Tipo de QA"
              className={selectBaseClass(Boolean(filters.tipoQa))}
              title="Filtrar por Tipo de QA"
            >
              <option value="">Tipo QA (Todos)</option>
              {tiposQa.map((tq) => (
                <option key={tq} value={tq}>
                  {tq}
                </option>
              ))}
            </select>
          </div>

          {/* Categoría */}
          <div className="min-w-0 2xl:flex-1">
            <select
              value={filters.categoria}
              onChange={(e) => updateField('categoria', e.target.value)}
              aria-label="Filtrar por Categoría de Incidencia"
              className={selectBaseClass(Boolean(filters.categoria))}
              title="Filtrar por Categoría"
            >
              <option value="">Categoría (Todas)</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Rango Fechas Inicio (Desde - Hasta) */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 flex items-center gap-1 min-w-0">
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => updateField('fechaDesde', e.target.value)}
              aria-label="Fecha inicio desde"
              title="Fecha inicio desde"
              className={`h-7 w-1/2 px-1.5 rounded border text-[10.5px] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] ${
                filters.fechaDesde
                  ? 'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8] font-semibold'
                  : 'bg-white border-[#cbd5e1] text-[#475569]'
              }`}
            />
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => updateField('fechaHasta', e.target.value)}
              aria-label="Fecha inicio hasta"
              title="Fecha inicio hasta"
              className={`h-7 w-1/2 px-1.5 rounded border text-[10.5px] focus:outline-none focus:ring-1 focus:ring-[#1d4ed8] ${
                filters.fechaHasta
                  ? 'bg-[#eff6ff] border-[#3b82f6] text-[#1d4ed8] font-semibold'
                  : 'bg-white border-[#cbd5e1] text-[#475569]'
              }`}
            />
          </div>

          {/* Action Buttons: Quick Toggles + Limpiar filtros + Actualizar */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-2 2xl:w-auto 2xl:shrink-0 flex items-center justify-end gap-1 flex-nowrap">
            {/* Quick Toggles */}
            <button
              type="button"
              onClick={() => updateField('onlyInc', !filters.onlyInc)}
              className={`h-7 px-2 rounded border text-[10.5px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                filters.onlyInc
                  ? 'bg-[#fef2f2] border-[#f87171] text-[#b91c1c]'
                  : 'bg-[#f8fafc] border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
              }`}
              title="Mostrar solo cursos con incidencias registradas"
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline 2xl:hidden">Solo Inc.</span>
              <span className="sm:hidden">Inc.</span>
            </button>

            <button
              type="button"
              onClick={() => updateField('onlyPendQa', !filters.onlyPendQa)}
              className={`h-7 px-2 rounded border text-[10.5px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                filters.onlyPendQa
                  ? 'bg-[#fffbeb] border-[#fbbf24] text-[#b45309]'
                  : 'bg-[#f8fafc] border-[#cbd5e1] text-[#475569] hover:bg-[#f1f5f9]'
              }`}
              title="Mostrar solo cursos con QA2 pendiente (sin registro)"
            >
              <Clock className="w-3 h-3 shrink-0" />
              <span className="hidden sm:inline 2xl:hidden">Pend. QA2</span>
              <span className="sm:hidden">Pend.</span>
            </button>

            {/* Limpiar filtros */}
            <button
              type="button"
              onClick={onClear}
              disabled={!hasActiveFilters}
              className={`h-7 px-2.5 rounded border text-[11px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap ${
                hasActiveFilters
                  ? 'bg-[#fef2f2] border-[#fca5a5] text-[#b91c1c] hover:bg-[#fee2e2] cursor-pointer'
                  : 'bg-[#f8fafc] border-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
              }`}
              title="Restablecer todos los filtros aplicados"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span>Limpiar filtros</span>
            </button>

            {/* Actualizar */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-7 px-2.5 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-[11px] font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap disabled:opacity-60 shadow-2xs cursor-pointer"
              title={`Recargar datos desde repositorio (Última consulta: ${lastUpdated})`}
            >
              <RefreshCw className={`w-3 h-3 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Actualizando…' : 'Actualizar'}</span>
            </button>


          </div>
        </div>
      </div>
    </header>
  );
};
