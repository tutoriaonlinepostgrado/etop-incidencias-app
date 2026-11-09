export interface RawCourse {
  id?: number | string;
  ID?: number | string;
  nrc?: string;
  NRC?: string;
  'nombre curso'?: string;
  nombre_curso?: string;
  NOMBRE_CURSO?: string;
  'nombre programa'?: string;
  nombre_programa?: string;
  NOMBRE_PROGRAMA?: string;
  'codigo curso'?: string;
  codigo_curso?: string;
  CODIGO_CURSO?: string;
  materia?: string;
  MATERIA?: string;
  intake?: string;
  'INTAKE O VERSION'?: string;
  periodo?: string;
  PERIODO?: string;
  tutor?: string;
  'NOMBRE TUTOR'?: string;
  facultad?: string;
  FACULTAD?: string;
  estado?: string;
  ESTADO?: string;
  'fecha inicio'?: string;
  'fecha fin'?: string;
  URL_CANVAS?: string | null;
  [key: string]: unknown;
}

export interface RawIncident {
  id?: number | string;
  cursoId?: number | string;
  idIncidencia?: string;
  categoria?: string;
  estadoIncidencia?: string;
  qaIncidencias?: string;
  tipoQA?: string;
  urlEvidencia?: string | null;
  urlCanvas?: string | { Url?: string; url?: string; Value?: string; value?: string } | null;
  URL_QA2_FI_Url?: string | { Url?: string; url?: string; Value?: string; value?: string } | null;
  tieneAdjuntos?: boolean | string;
  descripcionIncidencia?: string;
  descripcionSolucion?: string;
  semanaUnidad?: string;
  semana?: string;
  [key: string]: unknown;
}

export interface Incident {
  id: string | number;
  idIncidencia: string;
  cursoId: string;
  categoria: string;
  estadoIncidencia: string;
  qaIncidencias: string;
  tipoQA: string;
  urlEvidencia: string | null;
  urlCanvas: string | null;
  tieneAdjuntos: boolean;
  descripcionIncidencia: string;
  descripcionSolucion: string;
  semanaUnidad: string;
}

export interface Course {
  id: string;
  nrc: string;
  curso: string;
  programa: string;
  codigoCurso: string;
  materia: string;
  intake: string;
  periodo: string;
  tutor: string;
  facultad: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
  canvasUrl: string;
  registros: Incident[];
  con: Incident[];
  sin: Incident[];
  pendientes: Incident[];
  corregidas: Incident[];
  derivadas: Incident[];
  _searchContent: string;
}

export interface FilterState {
  q: string;
  facultad: string;
  estadoCurso: string;
  fechaDesde: string;
  fechaHasta: string;
  qa: string;
  estadoIncidencia: string;
  tipoQa: string;
  categoria: string;
  tutor: string;
  onlyInc: boolean;
  onlyPendQa: boolean;
}

export const INITIAL_FILTERS: FilterState = {
  q: '',
  facultad: '',
  estadoCurso: '',
  fechaDesde: '',
  fechaHasta: '',
  qa: '',
  estadoIncidencia: '',
  tipoQa: '',
  categoria: '',
  tutor: '',
  onlyInc: false,
  onlyPendQa: false,
};

export const DERIVAR_URL = 'https://tutoriaonlinepostgrado.github.io/sitiowebetop/derivar_incidencia_qa2.html';
export const FORM_QA2 = 'https://forms.office.com/Pages/ResponsePage.aspx?id=k9O-jzvQ-Em-ec1eH1kPsi4Tyu2CVbdJuVyBPGyJtFxUMDZaNk5YQ05PSDRMSEFYQjRLUzNDSThWSy4u&rad59c96540044fd99690c7a9ce42bca3=';
export const SP_VIEW = 'https://unabportal365.sharepoint.com/sites/actasynrc/Lists/NRC_TUTOR_QA2_INCIDENCIA/AllItems.aspx?viewid=407aa7f0-48a8-461d-9547-327d154dcc70&env=WebViewList';
export const POWER_APPS_URL = 'https://apps.powerapps.com/play/e/default-8fbed393-d03b-49f8-be79-cd5e1f590fb2/a/c71f7c75-4561-43ed-8824-0f1cb74d1967?tenantId=8fbed393-d03b-49f8-be79-cd5e1f590fb2&hint=e935542a-ea92-4f60-8f3e-4c805f2ddd64&source=iframe';

export function normalizeText(v: unknown): string {
  return String(v ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function upperText(v: unknown): string {
  return String(v ?? '').toUpperCase().trim();
}

export function parseDate(v: unknown): Date | null {
  if (!v) return null;
  const parts = String(v).split('-').map(Number);
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  return null;
}

export function formatDate(v: unknown): string {
  const d = parseDate(v);
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function timeCurso(c: { fechaInicio?: string }): number | null {
  const d = parseDate(c.fechaInicio);
  return d && !Number.isNaN(d.getTime()) ? d.getTime() : null;
}

export function compareCursosOperativos(a: Course, b: Course): number {
  const prioridad: Record<string, number> = {
    ACTIVO: 0,
    'EN CIERRE': 1,
    PREPARACION: 2,
    CERRADO: 3,
  };
  const pa = prioridad[a.estado] ?? 9;
  const pb = prioridad[b.estado] ?? 9;
  if (pa !== pb) return pa - pb;

  const ta = timeCurso(a);
  const tb = timeCurso(b);

  if (ta === null && tb === null) {
    return String(a.nrc || '').localeCompare(String(b.nrc || ''), 'es', { numeric: true });
  }
  if (ta === null) return 1;
  if (tb === null) return -1;

  if (a.estado === 'PREPARACION') {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const now = hoy.getTime();
    const aFuture = ta >= now;
    const bFuture = tb >= now;

    if (aFuture !== bFuture) return aFuture ? -1 : 1;
    return aFuture ? ta - tb : tb - ta;
  }

  // ACTIVO / EN CIERRE / CERRADO: primero los más recientes
  return tb - ta;
}

export function extractCanvasUrl(raw: unknown): string {
  if (!raw) return '';
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const val = obj.Url ?? obj.url ?? obj.Value ?? obj.value ?? '';
    return String(val).trim();
  }
  return String(raw).trim();
}

export function buildDeriveUrl(c: Course): string {
  const rows = c.pendientes;
  const serial = rows
    .map((i) =>
      [
        i.idIncidencia || i.id || '',
        i.categoria || '',
        i.semanaUnidad || '',
        i.descripcionIncidencia || '',
        i.urlEvidencia || '',
      ]
        .map((v) => String(v).trim())
        .join('~')
    )
    .join('|');

  const params = new URLSearchParams({
    nrc: c.nrc || '',
    nombre_curso: c.curso || '',
    fecha_inicio: c.fechaInicio || '',
    url_adjunto: rows.find((i) => i.urlEvidencia)?.urlEvidencia || '',
    incidencias: serial,
  });
  return `${DERIVAR_URL}?${params.toString()}`;
}

export function buildSharePointCursoUrl(nrc: string): string {
  const sep = SP_VIEW.includes('?') ? '&' : '?';
  return `${SP_VIEW}${sep}FilterField1=Title&FilterValue1=${encodeURIComponent(nrc)}`;
}

export function processRawData(rawCursos: RawCourse[], rawIncidencias: RawIncident[]): Course[] {
  const incMap = new Map<string, Incident[]>();

  for (const i of rawIncidencias) {
    const k = String(i.cursoId ?? '').trim();
    if (!k) continue;

    const canvasUrl = extractCanvasUrl(i.urlCanvas ?? i.URL_QA2_FI_Url);
    const item: Incident = {
      id: i.id ?? '',
      idIncidencia: String(i.idIncidencia ?? i.id ?? ''),
      cursoId: k,
      categoria: String(i.categoria ?? '').trim(),
      estadoIncidencia: upperText(i.estadoIncidencia),
      qaIncidencias: upperText(i.qaIncidencias),
      tipoQA: upperText(i.tipoQA),
      urlEvidencia: i.urlEvidencia ? String(i.urlEvidencia).trim() : null,
      urlCanvas: canvasUrl || null,
      tieneAdjuntos: i.tieneAdjuntos === true || String(i.tieneAdjuntos).toLowerCase() === 'true',
      descripcionIncidencia: String(i.descripcionIncidencia ?? '').trim(),
      descripcionSolucion: String(i.descripcionSolucion ?? '').trim(),
      semanaUnidad: String(i.semanaUnidad ?? i.semana ?? '').trim(),
    };

    if (!incMap.has(k)) incMap.set(k, []);
    incMap.get(k)!.push(item);
  }

  return rawCursos
    .filter((c) => {
      const cod = upperText(c['codigo curso'] ?? c.codigo_curso ?? c.CODIGO_CURSO ?? '');
      return cod !== 'UNI118';
    })
    .map((c) => {
      const id = String(c.id ?? c.ID ?? '').trim();
      const registros = incMap.get(id) || [];
      const con = registros.filter((x) => x.qaIncidencias === 'CON INCIDENCIA');
      const sin = registros.filter((x) => x.qaIncidencias === 'SIN INCIDENCIA');
      const pendientes = con.filter((x) => x.estadoIncidencia === 'PENDIENTE');
      const corregidas = con.filter((x) => x.estadoIncidencia === 'CORREGIDA');
      const derivadas = con.filter((x) => x.estadoIncidencia === 'DERIVADO');

      const curso = String(
        c['nombre curso'] ?? c.nombre_curso ?? c.NOMBRE_CURSO ?? '—'
      ).trim();
      const programa = String(
        c['nombre programa'] ?? c.nombre_programa ?? c.NOMBRE_PROGRAMA ?? '—'
      ).trim();
      const codigoCurso = String(
        c['codigo curso'] ?? c.codigo_curso ?? c.CODIGO_CURSO ?? ''
      ).trim();
      const materia = String(c.materia ?? c.MATERIA ?? '').trim();
      const intake = String(c.intake ?? c['INTAKE O VERSION'] ?? '').trim();
      const periodo = String(c.periodo ?? c.PERIODO ?? '').trim();
      const tutor = String(c.tutor ?? c['NOMBRE TUTOR'] ?? 'Por asignar').trim();
      const facultad = String(c.facultad ?? c.FACULTAD ?? '—').trim();
      const estado = upperText(c.estado ?? c.ESTADO);
      const fechaInicio = String(c['fecha inicio'] ?? '').trim();
      const fechaFin = String(c['fecha fin'] ?? '').trim();

      const canvasFromCourse = extractCanvasUrl(c.URL_CANVAS);
      const canvasFromReg = registros.find((x) => x.urlCanvas)?.urlCanvas || '';
      const canvasUrl = canvasFromReg || canvasFromCourse || '';

      const searchContent = [
        c.nrc,
        curso,
        programa,
        codigoCurso,
        materia,
        intake,
        periodo,
        tutor,
        facultad,
        estado,
        fechaInicio,
        fechaFin,
        ...registros.flatMap((i) => [
          i.categoria,
          i.estadoIncidencia,
          i.qaIncidencias,
          i.tipoQA,
          i.descripcionIncidencia,
          i.descripcionSolucion,
        ]),
      ].join(' ');

      const processed: Course = {
        id,
        nrc: String(c.nrc ?? '').trim(),
        curso,
        programa,
        codigoCurso,
        materia,
        intake,
        periodo,
        tutor,
        facultad,
        estado,
        fechaInicio,
        fechaFin,
        canvasUrl,
        registros,
        con,
        sin,
        pendientes,
        corregidas,
        derivadas,
        _searchContent: normalizeText(searchContent),
      };

      return processed;
    })
    .sort(compareCursosOperativos);
}

export function filterCourses(
  courses: Course[],
  filters: FilterState,
  statMode: string
): Course[] {
  const q = normalizeText(filters.q);
  const {
    facultad,
    estadoCurso,
    fechaDesde,
    fechaHasta,
    qa,
    estadoIncidencia,
    tipoQa,
    categoria,
    tutor,
    onlyInc,
    onlyPendQa,
  } = filters;

  return courses.filter((c) => {
    if (q && !c._searchContent.includes(q)) return false;
    if (facultad && c.facultad !== facultad) return false;
    if (estadoCurso && c.estado !== estadoCurso) return false;

    if (fechaDesde && (!c.fechaInicio || c.fechaInicio < fechaDesde)) return false;
    if (fechaHasta && (!c.fechaInicio || c.fechaInicio > fechaHasta)) return false;

    if (tutor && c.tutor !== tutor) return false;
    if (qa === 'CON INCIDENCIA' && c.con.length === 0) return false;
    if (qa === 'SIN INCIDENCIA' && c.sin.length === 0) return false;
    if (qa === 'SIN REGISTRO' && c.registros.length > 0) return false;
    if (estadoIncidencia && !c.con.some((i) => i.estadoIncidencia === estadoIncidencia)) return false;
    if (tipoQa && !c.registros.some((i) => i.tipoQA === tipoQa)) return false;
    if (categoria && !c.registros.some((i) => i.categoria === categoria)) return false;
    if (onlyInc && c.con.length === 0) return false;
    if (onlyPendQa && c.registros.length > 0) return false;

    if (statMode === 'CON' && c.con.length === 0) return false;
    if (statMode === 'SIN' && c.sin.length === 0) return false;
    if (statMode === 'PENDQA' && c.registros.length > 0) return false;
    if (statMode === 'PENDINC' && c.pendientes.length === 0) return false;
    if (statMode === 'CORR' && c.corregidas.length === 0) return false;
    if (statMode === 'DER' && c.derivadas.length === 0) return false;

    return true;
  });
}

export interface KpiStats {
  total: number;
  conIncidencias: number;
  sinIncidencias: number;
  qaPendiente: number;
  incidenciasPendientes: number;
  corregidas: number;
  derivadas: number;
}

export function calculateKpiStats(filtered: Course[]): KpiStats {
  return {
    total: filtered.length,
    conIncidencias: filtered.filter((x) => x.con.length > 0).length,
    sinIncidencias: filtered.filter((x) => x.sin.length > 0).length,
    qaPendiente: filtered.filter((x) => x.registros.length === 0).length,
    incidenciasPendientes: filtered.reduce((acc, x) => acc + x.pendientes.length, 0),
    corregidas: filtered.reduce((acc, x) => acc + x.corregidas.length, 0),
    derivadas: filtered.reduce((acc, x) => acc + x.derivadas.length, 0),
  };
}
