import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Maximize2, Minimize2 } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  isPreparacionFilter: boolean;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onExpandAll,
  onCollapseAll,
  isPreparacionFilter,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: number[] = [];
  const lo = Math.max(1, currentPage - 2);
  const hi = Math.min(totalPages, currentPage + 2);
  for (let i = lo; i <= hi; i++) {
    pages.push(i);
  }

  return (
    <div className="space-y-3">
      {/* Upper Toolbar: Meta & Global Card Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#475569] pb-2 border-b border-[#e2e8f0]">
        <div>
          <span>
            CURSOS (<strong className="text-[#0f172a] font-bold tnum">{totalItems.toLocaleString('es-CL')}</strong>)
            {' · '}Mostrando{' '}
            <strong className="text-[#0f172a] font-bold tnum">
              {start}–{end}
            </strong>
          </span>
          {isPreparacionFilter && (
            <span className="text-[#059669] font-medium ml-1.5">
              (Orden: próximos inicios primero)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-[#475569]">
            <span>Filas por página:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-8 px-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] text-xs focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onExpandAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#cbd5e1] rounded text-xs font-semibold transition-colors"
          >
            <Maximize2 className="w-3 h-3 text-[#64748b]" />
            <span>Expandir</span>
          </button>

          <button
            type="button"
            onClick={onCollapseAll}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#cbd5e1] rounded text-xs font-semibold transition-colors"
          >
            <Minimize2 className="w-3 h-3 text-[#64748b]" />
            <span>Contraer</span>
          </button>
        </div>
      </div>

      {/* Pagination Page Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2 pb-4">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 flex items-center justify-center bg-white border border-[#cbd5e1] rounded text-xs text-[#475569] hover:bg-[#f8fafc] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {lo > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                className="h-8 min-w-[32px] px-2 bg-white border border-[#cbd5e1] rounded text-xs text-[#475569] hover:bg-[#f8fafc] transition-colors"
              >
                1
              </button>
              {lo > 2 && <span className="px-1 text-[#94a3b8]">…</span>}
            </>
          )}

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-8 min-w-[32px] px-2.5 rounded text-xs font-semibold transition-colors ${
                p === currentPage
                  ? 'bg-[#1d4ed8] text-white border border-[#1d4ed8] shadow-2xs'
                  : 'bg-white border border-[#cbd5e1] text-[#475569] hover:bg-[#f8fafc]'
              }`}
            >
              {p}
            </button>
          ))}

          {hi < totalPages && (
            <>
              {hi < totalPages - 1 && <span className="px-1 text-[#94a3b8]">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                className="h-8 min-w-[32px] px-2 bg-white border border-[#cbd5e1] rounded text-xs text-[#475569] hover:bg-[#f8fafc] transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 flex items-center justify-center bg-white border border-[#cbd5e1] rounded text-xs text-[#475569] hover:bg-[#f8fafc] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-[11px] text-[#64748b] ml-3 hidden sm:inline">
            Página <strong className="text-[#0f172a]">{currentPage}</strong> de {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};
