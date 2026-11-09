import React, { useState } from 'react';
import { Course, Incident, formatDate, buildDeriveUrl, buildSharePointCursoUrl, FORM_QA2 } from '../utils/auditLogic';
import { formatIncidentsForEmail, copyToClipboard } from '../utils/clipboardHelper';
import { IncidentTable } from './IncidentTable';
import {
  ChevronDown,
  Calendar,
  Building2,
  Bookmark,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Send,
  Edit3,
  MailCheck
} from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isOpen: boolean;
  onToggle: () => void;
  onOpenPowerApp: (nrc: string, courseName: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isOpen,
  onToggle,
  onOpenPowerApp,
}) => {
  const [copiedState, setCopiedState] = useState<'none' | 'row' | 'nrc'>('none');
  const [copiedIncidentId, setCopiedIncidentId] = useState<string | null>(null);

  // Set of selected incident IDs within this course (defaults to first incident if present, can be freely deselected or multi-selected)
  const [selectedIncidentIds, setSelectedIncidentIds] = useState<Set<string>>(() => {
    if (course.con.length > 0) {
      const sorted = [...course.con].sort((a, b) =>
        String(a.idIncidencia || a.id).localeCompare(String(b.idIncidencia || b.id), 'es')
      );
      const firstId = sorted[0].idIncidencia || String(sorted[0].id);
      return new Set([firstId]);
    }
    return new Set();
  });

  const cnt = course.con.length;
  const hasSin = course.sin.length > 0;

  // Border and accent color
  const accentColor = cnt
    ? 'border-l-[#dc2626]'
    : hasSin
    ? 'border-l-[#059669]'
    : 'border-l-[#d97706]';

  const handleToggleIncident = (inc: Incident) => {
    const key = inc.idIncidencia || String(inc.id);
    setSelectedIncidentIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allIds = course.con.map((inc) => inc.idIncidencia || String(inc.id));
    setSelectedIncidentIds(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedIncidentIds(new Set());
  };

  // Get sorted selected incidents
  const selectedIncidents = [...course.con]
    .sort((a, b) =>
      String(a.idIncidencia || a.id).localeCompare(String(b.idIncidencia || b.id), 'es')
    )
    .filter((inc) => selectedIncidentIds.has(inc.idIncidencia || String(inc.id)));

  // Copy selected rows or a single specific incident for email
  const handleCopyRowsForEmail = async (singleIncident?: Incident, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const listToCopy = singleIncident ? [singleIncident] : selectedIncidents;

    if (listToCopy.length > 0) {
      const formatted = formatIncidentsForEmail(course, listToCopy);
      const ok = await copyToClipboard(formatted);
      if (ok) {
        setCopiedState('row');
        if (singleIncident) {
          setCopiedIncidentId(singleIncident.idIncidencia || String(singleIncident.id));
        }
        setTimeout(() => {
          setCopiedState('none');
          setCopiedIncidentId(null);
        }, 2500);
      }
    }
  };

  // Copy just NRC
  const handleCopyNrcOnly = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(course.nrc);
      setCopiedState('nrc');
      setTimeout(() => setCopiedState('none'), 2000);
    }
  };

  const deriveUrl = buildDeriveUrl(course);
  const sharePointUrl = buildSharePointCursoUrl(course.nrc);

  // Label for the main email copy button
  const getCopyButtonLabel = () => {
    if (selectedIncidents.length === 0) {
      return 'Selecciona fila(s) para copiar';
    }
    if (selectedIncidents.length === 1) {
      const idStr = selectedIncidents[0].idIncidencia || selectedIncidents[0].id;
      return `Copiar fila para correo (#${idStr})`;
    }
    return `Copiar ${selectedIncidents.length} filas para correo`;
  };

  return (
    <article
      data-nrc={course.nrc}
      data-id={course.id}
      className={`bg-white border border-[#e2e8f0] border-l-4 ${accentColor} rounded shadow-2xs transition-all duration-150 overflow-hidden ${
        isOpen ? 'ring-1 ring-[#cbd5e1]' : 'hover:border-[#cbd5e1]'
      }`}
    >
      {/* Clickable Header */}
      <div
        onClick={onToggle}
        className="flex items-start sm:items-center justify-between gap-3 p-3.5 cursor-pointer hover:bg-[#f8fafc] transition-colors select-none"
      >
        <div className="flex-1 min-w-0">
          {/* Top Line: NRC & Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-data-mono text-xs sm:text-sm font-bold text-[#0f172a] bg-[#f1f5f9] px-2 py-0.5 rounded border border-[#e2e8f0]">
              {course.nrc}
            </span>

            {/* Main Status Badge */}
            {cnt > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
                CON {cnt} {cnt === 1 ? 'INCIDENCIA' : 'INCIDENCIAS'}
              </span>
            ) : hasSin ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                SIN INCIDENCIAS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d97706]" />
                QA2 PENDIENTE
              </span>
            )}

            {/* Breakdown Counter Pills */}
            {course.pendientes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
                {course.pendientes.length} pendiente{course.pendientes.length === 1 ? '' : 's'}
              </span>
            )}
            {course.corregidas.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                {course.corregidas.length} corregida{course.corregidas.length === 1 ? '' : 's'}
              </span>
            )}
            {course.derivadas.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f5f3ff] text-[#6b21a8] border border-[#ddd6fe]">
                {course.derivadas.length} derivada{course.derivadas.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {/* Course, Program, Tutor & Faculty */}
          <div className="text-xs text-[#475569] leading-snug line-clamp-1 mb-2">
            <strong className="text-[#0f172a] font-semibold">{course.curso}</strong>
            <span className="mx-1.5 text-[#cbd5e1]">·</span>
            <span>{course.programa}</span>
            <span className="mx-1.5 text-[#cbd5e1]">·</span>
            <span className="text-[#334155]">
              Tutor: <span className="font-medium">{course.tutor}</span>
            </span>
          </div>

          {/* Meta Tags Row */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0] font-medium">
              <Calendar className="w-3 h-3 text-[#64748b]" />
              <span className="tnum">
                {formatDate(course.fechaInicio)} – {formatDate(course.fechaFin)}
              </span>
            </span>

            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] font-semibold uppercase text-[10px] tracking-wide">
              {course.estado || '—'}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]">
              <Building2 className="w-3 h-3 text-[#64748b]" />
              <span>{course.facultad}</span>
            </span>

            {course.intake && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]">
                <Bookmark className="w-3 h-3 text-[#64748b]" />
                <span className="truncate max-w-[150px]">{course.intake}</span>
              </span>
            )}

            {course.codigoCurso && (
              <span className="px-1.5 py-0.5 rounded bg-[#f8fafc] text-[#475569] border border-[#e2e8f0] text-[10px] font-mono">
                {course.codigoCurso}
              </span>
            )}

            {course.materia && (
              <span className="px-1.5 py-0.5 rounded bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0] text-[10px] font-mono">
                {course.materia}
              </span>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div className="pt-1 sm:pt-0">
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded border border-[#cbd5e1] bg-white text-[#64748b] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#1d4ed8] border-[#1d4ed8]' : 'hover:text-[#0f172a]'
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Expanded Accordion Body */}
      {isOpen && (
        <div className="border-t border-[#e2e8f0] bg-[#f8fafc]">
          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-2.5 bg-[#f1f5f9] border-b border-[#e2e8f0] flex-wrap text-xs">
            {/* Completar QA2 Form */}
            <a
              href={`${FORM_QA2}${encodeURIComponent(course.id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded text-xs font-medium transition-colors shadow-2xs btn-executive-active"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completar QA2</span>
            </a>

            {/* Canvas Link */}
            {course.canvasUrl ? (
              <a
                href={course.canvasUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#eff6ff] text-[#1d4ed8] border border-[#cbd5e1] hover:border-[#93c5fd] rounded text-xs font-medium transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ir a Canvas</span>
              </a>
            ) : null}

            {/* Derivar Incidencia Generator */}
            <a
              href={course.pendientes.length > 0 ? deriveUrl : '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!course.pendientes.length) e.preventDefault();
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                course.pendientes.length > 0
                  ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a] hover:bg-[#fef3c7]'
                  : 'bg-white text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed opacity-60'
              }`}
              title={
                course.pendientes.length > 0
                  ? 'Generar correo de derivación'
                  : 'Sin incidencias pendientes para derivar'
              }
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                Derivar incidencia
                {course.pendientes.length > 1 ? ` (${course.pendientes.length})` : ''}
              </span>
            </a>

            {/* SharePoint Course URL */}
            <a
              href={sharePointUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#cbd5e1] rounded text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#64748b]" />
              <span>SharePoint</span>
            </a>

            {/* Power Apps Slide-Over Drawer */}
            <button
              type="button"
              onClick={() => onOpenPowerApp(course.nrc, course.curso)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f3ff] hover:bg-[#ede9fe] text-[#6b21a8] border border-[#ddd6fe] rounded text-xs font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Gestionar</span>
            </button>

            {/* Action Group: Copiar Fila(s) para Correo / Copiar NRC */}
            <div className="ml-auto flex items-center gap-1.5">
              {cnt > 0 ? (
                <button
                  type="button"
                  disabled={selectedIncidents.length === 0 && copiedState !== 'row'}
                  onClick={(e) => handleCopyRowsForEmail(undefined, e)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all shadow-2xs ${
                    copiedState === 'row'
                      ? 'bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]'
                      : selectedIncidents.length === 0
                      ? 'bg-white text-[#94a3b8] border border-[#cbd5e1] cursor-not-allowed opacity-70'
                      : 'bg-[#1d4ed8] hover:bg-[#1e40af] text-white'
                  }`}
                  title={
                    selectedIncidents.length > 0
                      ? `Copiar ${selectedIncidents.length} incidencia(s) seleccionada(s) formateadas para correo`
                      : 'Marca al menos una fila en la tabla para copiarla'
                  }
                >
                  {copiedState === 'row' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>
                        ¡{selectedIncidents.length > 1 ? `${selectedIncidents.length} filas copiadas` : 'Fila copiada'} para correo!
                      </span>
                    </>
                  ) : (
                    <>
                      <MailCheck className="w-3.5 h-3.5" />
                      <span>{getCopyButtonLabel()}</span>
                    </>
                  )}
                </button>
              ) : null}

              {/* Copiar solo NRC */}
              <button
                type="button"
                onClick={handleCopyNrcOnly}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-[#f8fafc] text-[#475569] border border-[#cbd5e1] rounded text-xs font-medium transition-colors"
                title="Copiar únicamente el código NRC al portapapeles"
              >
                {copiedState === 'nrc' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#059669]" />
                    <span className="text-[#059669]">NRC copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#64748b]" />
                    <span>Copiar NRC</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* High Density Table or Empty State */}
          {cnt > 0 ? (
            <IncidentTable
              incidents={course.con}
              selectedIncidentIds={selectedIncidentIds}
              onToggleIncident={handleToggleIncident}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onCopyIncident={(inc) => handleCopyRowsForEmail(inc)}
              copiedIncidentId={copiedIncidentId}
            />
          ) : hasSin ? (
            <div className="p-5 text-center bg-white border-t border-[#e2e8f0]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#059669] text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>QA2 revisado — Sin incidencias registradas en este curso.</span>
              </div>
            </div>
          ) : (
            <div className="p-5 text-center bg-white border-t border-[#e2e8f0]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#b45309] text-xs font-semibold">
                <Clock className="w-4 h-4" />
                <span>Auditoría QA2 aún no realizada o sin registro para este NRC.</span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
