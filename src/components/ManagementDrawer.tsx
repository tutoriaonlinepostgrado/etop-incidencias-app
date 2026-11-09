import React, { useEffect, useState } from 'react';
import { X, ExternalLink, RefreshCw, ShieldAlert } from 'lucide-react';

interface ManagementDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nrc: string;
  courseName: string;
  powerAppsBaseUrl: string;
}

export const ManagementDrawer: React.FC<ManagementDrawerProps> = ({
  isOpen,
  onClose,
  nrc,
  courseName,
  powerAppsBaseUrl,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const fullUrl = `${powerAppsBaseUrl}&nrc=${encodeURIComponent(nrc)}`;

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6">
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-title"
          className="w-screen max-w-2xl bg-white shadow-2xl border-l border-[#cbd5e1] flex flex-col transform transition-transform animate-in slide-in-from-right duration-200"
        >
          {/* Header */}
          <header className="px-4 py-3 bg-[#0f172a] text-white flex items-center justify-between border-b border-[#334155] shrink-0">
            <div className="min-w-0 pr-4">
              <h2 id="drawer-title" className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                Gestión Operativa · Power Apps
              </h2>
              <p className="text-xs text-[#94a3b8] truncate mt-0.5">
                <span className="font-mono text-[#93c5fd] font-semibold">{nrc}</span> — {courseName}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-[#1e293b] hover:bg-[#334155] text-white border border-[#334155] rounded transition-colors"
              >
                <span>Abrir aparte</span>
                <ExternalLink className="w-3 h-3 text-[#94a3b8]" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded hover:bg-[#1e293b] text-[#94a3b8] hover:text-white transition-colors"
                aria-label="Cerrar panel de gestión"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Iframe Viewport */}
          <div className="relative flex-1 bg-[#f8fafc] overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-[#64748b] bg-white z-10">
                <RefreshCw className="w-6 h-6 animate-spin text-[#1d4ed8]" />
                <span className="font-medium">Cargando Power Apps para {nrc}…</span>
              </div>
            )}
            <iframe
              src={fullUrl}
              title={`Gestión de incidencias para NRC ${nrc}`}
              className="w-full h-full border-0"
              onLoad={() => setIsLoading(false)}
              allow="clipboard-read; clipboard-write"
            />
          </div>
        </aside>
      </div>
    </div>
  );
};
