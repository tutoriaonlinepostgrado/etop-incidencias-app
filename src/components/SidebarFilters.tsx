import React from 'react';
import { FilterState } from '../utils/auditLogic';
import { Search, X, RotateCcw, Filter, ChevronLeft } from 'lucide-react';

interface SidebarFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  facultades: string[];
  estadosCurso: string[];
  estadosInc: string[];
  tiposQa: string[];
  categorias: string[];
  tutores: string[];
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onChange,
  onClear,
  facultades,
  estadosCurso,
  estadosInc,
  tiposQa,
  categorias,
  tutores,
  searchInputRef,
  isOpen,
  onCloseMobile,
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
    filters.onlyPendQa;

  return (
    <aside
      className={`bg-white border-r border-[#e2e8f0] transition-all duration-200 ease-in-out shrink-0 overflow-y-auto ${
        isOpen
          ? 'w-full sm:w-52 md:w-56 p-3 block'
          : 'w-0 p-0 border-r-transparent hidden md:hidden'
      }`}
      aria-label="Filtros de búsqueda"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#1d4ed8]" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#0f172a]">
            Filtros
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] font-semibold text-[#1d4ed8] hover:text-[#1e40af] transition-colors"
            >
              Limpiar
            </button>
          )}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded text-[#64748b] hover:text-[#0f172a] sm:hidden"
              title="Cerrar panel de filtros"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2.5 text-[11px]">
        {/* Search */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Búsqueda General
          </label>
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={filters.q}
              onChange={(e) => updateField('q', e.target.value)}
              placeholder="NRC, curso, tutor…"
              className="w-full h-8 pl-7 pr-6 bg-white border border-[#cbd5e1] rounded text-[#0f172a] placeholder-[#94a3b8] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all"
            />
            <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-2 top-2.5 pointer-events-none" />
            {filters.q && (
              <button
                type="button"
                onClick={() => updateField('q', '')}
                className="absolute right-1.5 top-2 text-[#94a3b8] hover:text-[#475569]"
                title="Borrar texto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Facultad */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Facultad
          </label>
          <select
            value={filters.facultad}
            onChange={(e) => updateField('facultad', e.target.value)}
            className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all truncate"
          >
            <option value="">Todas</option>
            {facultades.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Estado del Curso */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Estado Curso
          </label>
          <select
            value={filters.estadoCurso}
            onChange={(e) => updateField('estadoCurso', e.target.value)}
            className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all"
          >
            <option value="">Todos</option>
            {estadosCurso.map((ec) => (
              <option key={ec} value={ec}>
                {ec}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha Inicio Rango */}
        <div className="space-y-1.5">
          <div>
            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#475569] mb-0.5">
              Inicio Desde
            </label>
            <input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => updateField('fechaDesde', e.target.value)}
              className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[9.5px] font-bold uppercase tracking-wider text-[#475569] mb-0.5">
              Inicio Hasta
            </label>
            <input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => updateField('fechaHasta', e.target.value)}
              className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all"
            />
          </div>
        </div>

        {/* Estado QA2 */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Estado QA2
          </label>
          <select
            value={filters.qa}
            onChange={(e) => updateField('qa', e.target.value)}
            className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all"
          >
            <option value="">Todos</option>
            <option value="CON INCIDENCIA">Con incidencia</option>
            <option value="SIN INCIDENCIA">Sin incidencia</option>
            <option value="SIN REGISTRO">QA2 pendiente</option>
          </select>
        </div>

        {/* Estado Incidencia */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Estado Incidencia
          </label>
          <select
            value={filters.estadoIncidencia}
            onChange={(e) => updateField('estadoIncidencia', e.target.value)}
            className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all"
          >
            <option value="">Todos</option>
            {estadosInc.map((ei) => (
              <option key={ei} value={ei}>
                {ei}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de QA */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Tipo de QA
          </label>
          <select
            value={filters.tipoQa}
            onChange={(e) => updateField('tipoQa', e.target.value)}
            className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all truncate"
          >
            <option value="">Todos</option>
            {tiposQa.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Categoría
          </label>
          <select
            value={filters.categoria}
            onChange={(e) => updateField('categoria', e.target.value)}
            className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all truncate"
          >
            <option value="">Todas</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Tutor */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
            Tutor
          </label>
          <select
            value={filters.tutor}
            onChange={(e) => updateField('tutor', e.target.value)}
            className="w-full h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-[11px] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]/20 transition-all truncate"
          >
            <option value="">Todos</option>
            {tutores.map((tut) => (
              <option key={tut} value={tut}>
                {tut}
              </option>
            ))}
          </select>
        </div>

        {/* Boolean checkboxes */}
        <div className="pt-2 border-t border-[#e2e8f0] space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#334155]">
            <input
              type="checkbox"
              checked={filters.onlyInc}
              onChange={(e) => updateField('onlyInc', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#cbd5e1] text-[#1d4ed8] focus:ring-[#1d4ed8]/20 accent-[#1d4ed8]"
            />
            <span className="text-[11px]">Solo con incidencias</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-[#334155]">
            <input
              type="checkbox"
              checked={filters.onlyPendQa}
              onChange={(e) => updateField('onlyPendQa', e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[#cbd5e1] text-[#1d4ed8] focus:ring-[#1d4ed8]/20 accent-[#1d4ed8]"
            />
            <span className="text-[11px]">Solo pendientes QA2</span>
          </label>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClear}
            className="w-full h-8 flex items-center justify-center gap-1.5 bg-white hover:bg-[#f8fafc] text-[#1e293b] border border-[#cbd5e1] rounded text-[11px] font-semibold tracking-wide transition-all shadow-2xs btn-executive-active"
          >
            <RotateCcw className="w-3 h-3 text-[#64748b]" />
            <span>Limpiar filtros</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
