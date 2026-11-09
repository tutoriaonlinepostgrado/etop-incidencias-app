import React from 'react';
import {
  Search,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Layers,
  ChevronRight
} from 'lucide-react';

interface NavbarProps {
  onToggleFilters: () => void;
  filtersOpen: boolean;
  onFocusSearch: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  totalCourses: number;
  lastUpdated: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleFilters,
  filtersOpen,
  onFocusSearch,
  onRefresh,
  isRefreshing,
  totalCourses,
  lastUpdated,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0f172a] text-[#f8fafc] border-b border-[#1e293b] shadow-sm select-none">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: Brand & Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleFilters}
            className={`p-2 rounded border transition-colors flex items-center justify-center ${
              filtersOpen
                ? 'bg-[#1e293b] text-white border-[#334155] hover:bg-[#334155]'
                : 'bg-[#1e293b]/60 text-[#94a3b8] border-[#334155]/60 hover:text-white hover:bg-[#1e293b]'
            }`}
            title={filtersOpen ? 'Ocultar panel de filtros' : 'Mostrar panel de filtros'}
            aria-label="Alternar filtros"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 pl-1 border-l border-[#334155]">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d4ed8] animate-pulse"></span>
              <span className="absolute w-4 h-4 rounded-full bg-[#1d4ed8]/30"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white font-sans">
                  Incidencias ETOP
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1e293b] text-[#93c5fd] border border-[#334155]">
                  QA2
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8] leading-none mt-0.5 hidden md:block">
                Gobernanza Académica & Auditoría de Calidad
              </p>
            </div>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            type="button"
            onClick={onFocusSearch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:text-white rounded hover:bg-[#1e293b] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Buscar NRC</span>
            <kbd className="text-[10px] bg-[#1e293b] border border-[#334155] rounded px-1 text-[#64748b]">
              /
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1e293b] rounded border border-[#334155]"
          >
            <Layers className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Consolidado</span>
          </button>

          <a
            href="https://tutoriaonlinepostgrado.github.io/sitiowebetop/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#94a3b8] hover:text-white rounded hover:bg-[#1e293b] transition-colors"
          >
            <span>Portal ETOP</span>
            <ExternalLink className="w-3 h-3 text-[#64748b]" />
          </a>
        </nav>

        {/* Right: Meta Status & Refresh */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[11px] text-[#94a3b8]">
              Fecha de consulta:{' '}
              <strong className="text-white font-medium">{lastUpdated}</strong>
            </span>
            <span className="text-[10px] text-[#64748b]">
              <span className="tnum font-semibold text-[#93c5fd]">{totalCourses}</span> NRCs cargados
            </span>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155] rounded transition-colors disabled:opacity-50"
            title="Recargar datos desde GitHub"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#3b82f6]' : 'text-[#94a3b8]'}`} />
            <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
