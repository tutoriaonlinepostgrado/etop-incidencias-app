import React, { useState, useEffect } from 'react';
import {
  SelectedCourseGroup,
  Course,
  Incident,
  getIncidentUniqueKey,
} from '../utils/auditLogic';
import {
  buildConsolidatedEmailReport,
  buildOutlookComposeUrl,
  copyToClipboard,
} from '../utils/clipboardHelper';
import {
  CheckSquare,
  Eye,
  Copy,
  Check,
  Mail,
  Trash2,
  X,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

interface BulkSelectionBarProps {
  selectedGroups: SelectedCourseGroup[];
  onRemoveIncident: (course: Course, incident: Incident) => void;
  onRemoveCourseIncidents: (course: Course) => void;
  onClearSelection: () => void;
  onJumpToCourse?: (course: Course) => void;
}

export const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  selectedGroups,
  onRemoveIncident,
  onRemoveCourseIncidents,
  onClearSelection,
  onJumpToCourse,
}) => {
  const [modalMode, setModalMode] = useState<'none' | 'review' | 'compose'>('none');
  const [copiedReport, setCopiedReport] = useState(false);
  const [copiedInModal, setCopiedInModal] = useState(false);
  const [outlookOpenedNotice, setOutlookOpenedNotice] = useState<string | null>(null);

  const report = buildConsolidatedEmailReport(selectedGroups);

  const [editableSubject, setEditableSubject] = useState(report.subject);
  const [editableBody, setEditableBody] = useState(report.body);

  // Sync editable draft whenever selectedGroups change
  useEffect(() => {
    setEditableSubject(report.subject);
    setEditableBody(report.body);
  }, [report.subject, report.body]);

  // Close modal if all items are removed
  useEffect(() => {
    if (report.incidentCount === 0 && modalMode !== 'none') {
      setModalMode('none');
    }
  }, [report.incidentCount, modalMode]);

  if (report.incidentCount === 0) {
    return null;
  }

  const handleCopyFullReport = async () => {
    const plain = `Asunto: ${editableSubject}\n\n${editableBody}`;
    const isUnmodified = editableSubject === report.subject && editableBody === report.body;
    const ok = await copyToClipboard({
      plainText: plain,
      htmlText: isUnmodified ? report.htmlText : undefined,
    });
    if (ok) {
      setCopiedReport(true);
      setCopiedInModal(true);
      setTimeout(() => {
        setCopiedReport(false);
        setCopiedInModal(false);
      }, 2600);
    }
  };

  const handleOpenOutlookDraft = async () => {
    // Always copy the full report to clipboard first so zero incidents are ever lost
    const plain = `Asunto: ${editableSubject}\n\n${editableBody}`;
    const isUnmodified = editableSubject === report.subject && editableBody === report.body;
    await copyToClipboard({
      plainText: editableBody,
      htmlText: isUnmodified ? report.htmlText : undefined,
    });

    const { url, isUrlTruncated } = buildOutlookComposeUrl(editableSubject, editableBody);

    // Open Outlook Web draft via anchor click to avoid window.open restrictions
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (isUrlTruncated) {
      setOutlookOpenedNotice(
        'El reporte supera el límite de caracteres de una URL de Outlook. Se copió automáticamente el reporte completo al portapapeles sin truncar ninguna incidencia: presione Ctrl+V en el cuerpo del correo de Outlook.'
      );
    } else {
      setOutlookOpenedNotice(
        'Borrador abierto en Outlook Web y respaldado automáticamente en su portapapeles.'
      );
    }
    setCopiedInModal(true);
    setTimeout(() => {
      setCopiedInModal(false);
    }, 3000);
    void plain;
  };

  return (
    <>
      {/* Sticky Compact Bulk Actions Bar */}
      <section
        aria-label="Acciones masivas de incidencias seleccionadas"
        className="sticky top-[76px] 2xl:top-[46px] z-30 mb-3 rounded-md bg-[#eff6ff] border border-[#93c5fd] shadow-xs px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1d4ed8] text-white font-bold text-[11px] tnum">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>
              {report.nrcCount} {report.nrcCount === 1 ? 'NRC seleccionado' : 'NRC seleccionados'}
            </span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-white text-[#1e3a8a] border border-[#bfdbfe] font-bold text-[11px] tnum">
            <span>
              {report.incidentCount}{' '}
              {report.incidentCount === 1
                ? 'incidencia seleccionada'
                : 'incidencias seleccionadas'}
            </span>
          </span>

          <span className="text-[11px] text-[#1e40af] hidden md:inline">
            La selección se mantiene activa entre páginas y filtros.
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Botón Revisar selección */}
          <button
            type="button"
            onClick={() => {
              setOutlookOpenedNotice(null);
              setModalMode('review');
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-[#f8fafc] text-[#1e3a8a] border border-[#93c5fd] font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#1d4ed8]" />
            <span>Revisar selección</span>
          </button>

          {/* Botón Copiar reporte */}
          <button
            type="button"
            onClick={handleCopyFullReport}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold text-[11px] border transition-colors cursor-pointer ${
              copiedReport
                ? 'bg-[#ecfdf5] text-[#059669] border-[#6ee7b7]'
                : 'bg-white hover:bg-[#f8fafc] text-[#0f172a] border-[#cbd5e1]'
            }`}
          >
            {copiedReport ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#059669]" />
                <span>¡Reporte copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#475569]" />
                <span>Copiar reporte</span>
              </>
            )}
          </button>

          {/* Botón Redactar correo */}
          <button
            type="button"
            onClick={() => {
              setOutlookOpenedNotice(null);
              setModalMode('compose');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Redactar correo</span>
          </button>

          {/* Botón Limpiar selección */}
          <button
            type="button"
            onClick={onClearSelection}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] font-semibold text-[11px] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar selección</span>
          </button>
        </div>
      </section>

      {/* Review & Consolidated Email Compose Modal */}
      {modalMode !== 'none' && (
        <div
          className="fixed inset-0 z-50 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-modal-title"
        >
          <div className="bg-white border border-[#cbd5e1] rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 id="bulk-modal-title" className="text-sm font-bold text-[#0f172a]">
                  {modalMode === 'review'
                    ? 'Revisar selección de incidencias QA2'
                    : 'Redactar correo consolidado de incidencias QA2'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] text-[11px] font-bold tnum">
                  {report.nrcCount} NRC · {report.incidentCount}{' '}
                  {report.incidentCount === 1 ? 'incidencia' : 'incidencias'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="inline-flex rounded border border-[#cbd5e1] bg-white p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setModalMode('review')}
                    className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                      modalMode === 'review'
                        ? 'bg-[#1d4ed8] text-white'
                        : 'text-[#475569] hover:text-[#0f172a]'
                    }`}
                  >
                    1. Revisar selección ({report.incidentCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode('compose')}
                    className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                      modalMode === 'compose'
                        ? 'bg-[#1d4ed8] text-white'
                        : 'text-[#475569] hover:text-[#0f172a]'
                    }`}
                  >
                    2. Borrador de correo
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="p-1.5 rounded text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60 transition-colors"
                  title="Cerrar ventana"
                  aria-label="Cerrar ventana"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {modalMode === 'review' ? (
                <div className="space-y-3">
                  <p className="text-xs text-[#475569]">
                    Revisa las incidencias seleccionadas agrupadas por NRC. Puedes quitar cualquier incidencia individual o un NRC completo antes de generar el correo consolidado.
                  </p>

                  {selectedGroups.map(({ course, incidents }) => (
                    <div
                      key={course.id || course.nrc}
                      className="border border-[#cbd5e1] rounded-md bg-white overflow-hidden"
                    >
                      <div className="px-3.5 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs">
                          <span className="font-mono font-bold text-[#0f172a] bg-white px-2 py-0.5 rounded border border-[#cbd5e1] mr-2">
                            {course.nrc}
                          </span>
                          <strong className="text-[#0f172a]">{course.curso}</strong>
                          <span className="mx-1.5 text-[#cbd5e1]">·</span>
                          <span className="text-[#475569]">Tutor: {course.tutor}</span>
                          {course.facultad && course.facultad !== '—' && (
                            <>
                              <span className="mx-1.5 text-[#cbd5e1]">·</span>
                              <span className="text-[#64748b]">{course.facultad}</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {onJumpToCourse && (
                            <button
                              type="button"
                              onClick={() => {
                                onJumpToCourse(course);
                                setModalMode('none');
                              }}
                              className="text-[11px] font-semibold text-[#1d4ed8] hover:underline"
                            >
                              Ver tarjeta NRC
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRemoveCourseIncidents(course)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#fef2f2] hover:bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] text-[10.5px] font-semibold transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Quitar NRC ({incidents.length})</span>
                          </button>
                        </div>
                      </div>

                      <div className="divide-y divide-[#f1f5f9]">
                        {incidents.map((inc) => {
                          const uKey = getIncidentUniqueKey(course, inc);
                          return (
                            <div
                              key={uKey}
                              className="px-3.5 py-2.5 flex items-start justify-between gap-3 text-xs hover:bg-[#f8fafc]"
                            >
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-[#1d4ed8]">
                                    Incidencia #{inc.idIncidencia || inc.id}
                                  </span>
                                  <span className="px-2 py-0.2 rounded-full bg-[#fffbeb] text-[#b45309] border border-[#fde68a] text-[10px] font-semibold">
                                    {inc.estadoIncidencia || '—'}
                                  </span>
                                  <span className="px-2 py-0.2 rounded bg-[#f1f5f9] text-[#334155] border border-[#e2e8f0] text-[10px] font-medium">
                                    {inc.tipoQA || '—'}
                                  </span>
                                  <span className="px-2 py-0.2 rounded bg-[#eff6ff] text-[#1e40af] border border-[#bfdbfe] text-[10px] font-medium">
                                    {inc.categoria || '—'}
                                    {inc.semanaUnidad ? ` (${inc.semanaUnidad})` : ''}
                                  </span>
                                </div>
                                <p className="text-[#1e293b] leading-relaxed">
                                  <strong>Descripción:</strong> {inc.descripcionIncidencia || '—'}
                                </p>
                                {inc.descripcionSolucion && (
                                  <p className="text-[#059669] leading-relaxed">
                                    <strong>Solución u observación:</strong> {inc.descripcionSolucion}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveIncident(course, inc)}
                                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded border border-[#fecaca] bg-white hover:bg-[#fef2f2] text-[#b91c1c] text-[11px] font-semibold transition-colors"
                                title="Quitar esta incidencia de la selección"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Quitar</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* Left column in Compose: Quick summary of selected items with ability to remove */}
                  <div className="lg:col-span-4 space-y-2.5 border border-[#e2e8f0] rounded-md p-3 bg-[#f8fafc] max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#334155]">
                        Incidencias incluidas ({report.incidentCount})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setModalMode('review')}
                        className="text-[11px] font-semibold text-[#1d4ed8] hover:underline"
                      >
                        Detalle completo
                      </button>
                    </div>

                    {selectedGroups.map(({ course, incidents }) => (
                      <div
                        key={course.id || course.nrc}
                        className="bg-white border border-[#cbd5e1] rounded p-2.5 space-y-1.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between gap-1 font-semibold text-[#0f172a]">
                          <span className="truncate">
                            {course.nrc} — {course.curso}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemoveCourseIncidents(course)}
                            className="text-[#dc2626] hover:underline text-[10px] shrink-0"
                            title="Quitar todo el NRC"
                          >
                            Quitar NRC
                          </button>
                        </div>
                        <div className="text-[10.5px] text-[#64748b]">Tutor: {course.tutor}</div>
                        <div className="space-y-1 pt-1 border-t border-[#f1f5f9]">
                          {incidents.map((inc) => (
                            <div
                              key={getIncidentUniqueKey(course, inc)}
                              className="flex items-center justify-between gap-1.5 bg-[#f8fafc] px-2 py-1 rounded border border-[#e2e8f0]"
                            >
                              <span className="truncate text-[#334155]">
                                <strong className="font-mono text-[#1d4ed8]">
                                  #{inc.idIncidencia || inc.id}
                                </strong>{' '}
                                · {inc.categoria || inc.tipoQA}
                              </span>
                              <button
                                type="button"
                                onClick={() => onRemoveIncident(course, inc)}
                                className="text-[#64748b] hover:text-[#dc2626] p-0.5 shrink-0"
                                title="Quitar esta incidencia del reporte"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right column in Compose: Editable Subject & Body */}
                  <div className="lg:col-span-8 space-y-3">
                    <div>
                      <label
                        htmlFor="consolidated-email-subject"
                        className="block text-[11px] font-bold uppercase tracking-wider text-[#334155] mb-1"
                      >
                        Asunto del correo (Editable)
                      </label>
                      <input
                        id="consolidated-email-subject"
                        type="text"
                        value={editableSubject}
                        onChange={(e) => setEditableSubject(e.target.value)}
                        className="w-full h-9 px-3 rounded border border-[#cbd5e1] bg-white text-xs font-semibold text-[#0f172a] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="consolidated-email-body"
                          className="block text-[11px] font-bold uppercase tracking-wider text-[#334155]"
                        >
                          Cuerpo del mensaje consolidado (Editable)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditableSubject(report.subject);
                            setEditableBody(report.body);
                          }}
                          className="text-[10.5px] font-semibold text-[#1d4ed8] hover:underline"
                        >
                          Restaurar texto original
                        </button>
                      </div>
                      <textarea
                        id="consolidated-email-body"
                        rows={15}
                        value={editableBody}
                        onChange={(e) => setEditableBody(e.target.value)}
                        className="w-full p-3 rounded border border-[#cbd5e1] bg-white text-xs text-[#1e293b] font-mono leading-relaxed focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
                      />
                    </div>

                    {outlookOpenedNotice && (
                      <div className="p-2.5 rounded bg-[#eff6ff] border border-[#93c5fd] text-[#1e3a8a] text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-[#1d4ed8] shrink-0 mt-0.5" />
                        <span>{outlookOpenedNotice}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={onClearSelection}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#fecaca] bg-white hover:bg-[#fef2f2] text-[#b91c1c] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar toda la selección</span>
              </button>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyFullReport}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-semibold transition-colors cursor-pointer ${
                    copiedInModal
                      ? 'bg-[#ecfdf5] border-[#6ee7b7] text-[#059669]'
                      : 'bg-white hover:bg-[#f1f5f9] border-[#cbd5e1] text-[#0f172a]'
                  }`}
                >
                  {copiedInModal ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>¡Copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#475569]" />
                      <span>Copiar reporte completo</span>
                    </>
                  )}
                </button>

                {modalMode === 'review' ? (
                  <button
                    type="button"
                    onClick={() => setModalMode('compose')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Continuar a Redactar correo →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenOutlookDraft}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#1d4ed8] hover:bg-[#1e40af] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir borrador en Outlook Web</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
