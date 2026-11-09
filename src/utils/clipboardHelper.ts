import { Course, Incident, formatDate } from './auditLogic';

export interface EmailFormattedIncident {
  plainText: string;
  htmlText: string;
}

export function formatIncidentsForEmail(course: Course, incidents: Incident[]): EmailFormattedIncident {
  if (incidents.length === 0) {
    return { plainText: '', htmlText: '' };
  }

  const plainIncidents = incidents
    .map((incident, idx) => {
      const header = incidents.length > 1 ? `INCIDENCIA ${idx + 1} DE ${incidents.length}:` : `DETALLE DE LA INCIDENCIA:`;
      return [
        header,
        `--------------------------------------------------`,
        `• ID Incidencia: #${incident.idIncidencia || incident.id || '—'}`,
        `• Estado: ${incident.estadoIncidencia || '—'}`,
        `• Tipo QA: ${incident.tipoQA || '—'}`,
        `• Categoría: ${incident.categoria || '—'}${incident.semanaUnidad ? ` (${incident.semanaUnidad})` : ''}`,
        `• Descripción:`,
        `  ${incident.descripcionIncidencia || 'Sin descripción'}`,
        `• Solución Reportada:`,
        `  ${incident.descripcionSolucion || 'Pendiente / Sin solución'}`,
        `• Evidencia / Adjunto:`,
        `  ${incident.urlEvidencia || (incident.tieneAdjuntos ? 'Tiene adjunto registrado' : 'Sin evidencia adjunta')}`,
      ].join('\n');
    })
    .join('\n\n');

  const plainText = [
    `📋 REPORTE DE ${incidents.length === 1 ? 'INCIDENCIA' : `${incidents.length} INCIDENCIAS`} QA2 - ETOP`,
    `==================================================`,
    `NRC: ${course.nrc}`,
    `Curso: ${course.curso}`,
    `Programa: ${course.programa}`,
    `Tutor: ${course.tutor}`,
    `Facultad: ${course.facultad}`,
    `Fechas: ${formatDate(course.fechaInicio)} – ${formatDate(course.fechaFin)}`,
    ``,
    plainIncidents,
    `==================================================`,
  ].join('\n');

  const htmlRows = incidents
    .map((incident, idx) => {
      const statusBg =
        incident.estadoIncidencia === 'CORREGIDA'
          ? '#ecfdf5'
          : incident.estadoIncidencia === 'PENDIENTE'
          ? '#fffbeb'
          : '#f1f5f9';
      const statusColor =
        incident.estadoIncidencia === 'CORREGIDA'
          ? '#059669'
          : incident.estadoIncidencia === 'PENDIENTE'
          ? '#b45309'
          : '#475569';

      return `
      <div style="${idx > 0 ? 'margin-top: 12px; padding-top: 12px; border-top: 2px solid #cbd5e1;' : ''}">
        ${
          incidents.length > 1
            ? `<div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Incidencia ${idx + 1} de ${incidents.length}</div>`
            : ''
        }
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>ID Incidencia:</strong></td>
            <td style="padding: 6px 0; font-family: monospace; font-weight: bold; color: #1d4ed8;">#${incident.idIncidencia || incident.id || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b;"><strong>Estado:</strong></td>
            <td style="padding: 6px 0;"><span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">${incident.estadoIncidencia || '—'}</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b;"><strong>Categoría:</strong></td>
            <td style="padding: 6px 0; color: #0f172a;">${incident.categoria || '—'} ${incident.semanaUnidad ? `(${incident.semanaUnidad})` : ''}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b;"><strong>Tipo QA:</strong></td>
            <td style="padding: 6px 0; color: #475569;">${incident.tipoQA || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b; vertical-align: top;"><strong>Descripción:</strong></td>
            <td style="padding: 6px 0; color: #0f172a; white-space: pre-wrap;">${incident.descripcionIncidencia || '—'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 6px 0; color: #64748b; vertical-align: top;"><strong>Solución:</strong></td>
            <td style="padding: 6px 0; color: #059669; white-space: pre-wrap;">${incident.descripcionSolucion || 'Pendiente'}</td>
          </tr>
          ${
            incident.urlEvidencia
              ? `
          <tr>
            <td style="padding: 6px 0; color: #64748b;"><strong>Evidencia:</strong></td>
            <td style="padding: 6px 0;"><a href="${incident.urlEvidencia}" style="color: #1d4ed8; text-decoration: underline;" target="_blank">Ver archivo adjunto</a></td>
          </tr>`
              : ''
          }
        </table>
      </div>`;
    })
    .join('');

  const htmlText = `
<div style="font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; max-width: 650px; line-height: 1.5; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden;">
  <div style="background-color: #0f172a; color: #ffffff; padding: 10px 14px;">
    <strong style="font-size: 14px;">Reporte de ${incidents.length === 1 ? 'Incidencia' : `${incidents.length} Incidencias`} QA2 · ETOP</strong>
    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">NRC ${course.nrc} — ${course.curso}</div>
  </div>
  <div style="padding: 12px 14px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <tr>
        <td style="padding: 3px 0; color: #64748b; width: 90px;"><strong>NRC:</strong></td>
        <td style="padding: 3px 0; font-family: monospace; font-weight: bold; color: #0f172a;">${course.nrc}</td>
        <td style="padding: 3px 0; color: #64748b; width: 90px;"><strong>Tutor:</strong></td>
        <td style="padding: 3px 0; color: #0f172a;">${course.tutor}</td>
      </tr>
      <tr>
        <td style="padding: 3px 0; color: #64748b;"><strong>Facultad:</strong></td>
        <td style="padding: 3px 0; color: #0f172a;">${course.facultad}</td>
        <td style="padding: 3px 0; color: #64748b;"><strong>Período:</strong></td>
        <td style="padding: 3px 0; color: #0f172a;">${formatDate(course.fechaInicio)} – ${formatDate(course.fechaFin)}</td>
      </tr>
    </table>
  </div>
  <div style="padding: 14px;">
    ${htmlRows}
  </div>
</div>
`.trim();

  return { plainText, htmlText };
}

export function formatIncidentForEmail(course: Course, incident: Incident): EmailFormattedIncident {
  return formatIncidentsForEmail(course, [incident]);
}

export async function copyToClipboard(content: { plainText: string; htmlText?: string }): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      if (typeof ClipboardItem !== 'undefined' && content.htmlText) {
        const textBlob = new Blob([content.plainText], { type: 'text/plain' });
        const htmlBlob = new Blob([content.htmlText], { type: 'text/html' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/plain': textBlob,
            'text/html': htmlBlob,
          }),
        ]);
        return true;
      }
      await navigator.clipboard.writeText(content.plainText);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard write error, falling back to writeText:', err);
    try {
      await navigator.clipboard.writeText(content.plainText);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}
