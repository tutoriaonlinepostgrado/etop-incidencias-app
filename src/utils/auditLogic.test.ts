import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeText,
  formatDate,
  processRawData,
  filterCourses,
  calculateKpiStats,
  compareCursosOperativos,
  buildDeriveUrl,
  INITIAL_FILTERS,
  RawCourse,
  RawIncident
} from './auditLogic';

test('normalizeText handles accents and uppercase', () => {
  assert.equal(normalizeText('Gestión DE Calidad 2026'), 'gestion de calidad 2026');
  assert.equal(normalizeText('  Cursos & NRC  '), 'cursos & nrc');
});

test('formatDate correctly parses and formats YYYY-MM-DD', () => {
  assert.equal(formatDate('2026-10-15'), '15-10-2026');
  assert.equal(formatDate(''), '—');
  assert.equal(formatDate(null), '—');
});

test('processRawData links incidents to courses and parses statuses', () => {
  const rawCursos: RawCourse[] = [
    {
      id: 101,
      nrc: 'NRC-101',
      'nombre curso': 'Arquitectura de Software',
      'nombre programa': 'Magíster TI',
      estado: 'ACTIVO',
      tutor: 'Profesor X',
      facultad: 'Ingeniería',
      'fecha inicio': '2026-03-01',
      'fecha fin': '2026-06-30'
    },
    {
      id: 102,
      nrc: 'NRC-102',
      'nombre curso': 'Gobernanza de Datos',
      'nombre programa': 'Magíster TI',
      estado: 'PREPARACION',
      tutor: 'Profesora Y',
      facultad: 'Ingeniería',
      'fecha inicio': '2027-01-10',
      'fecha fin': '2027-04-10'
    }
  ];

  const rawIncidencias: RawIncident[] = [
    {
      id: 1,
      cursoId: 101,
      idIncidencia: 'INC-01',
      categoria: 'EVALUACIONES',
      estadoIncidencia: 'PENDIENTE',
      qaIncidencias: 'CON INCIDENCIA',
      tipoQA: 'QA2_CANVAS',
      descripcionIncidencia: 'Rúbrica sin ponderaciones en semana 2',
      descripcionSolucion: '',
      urlCanvas: 'https://canvas.example.com/courses/101'
    },
    {
      id: 2,
      cursoId: 101,
      idIncidencia: 'INC-02',
      categoria: 'LINKS',
      estadoIncidencia: 'CORREGIDA',
      qaIncidencias: 'CON INCIDENCIA',
      tipoQA: 'QA2_CANVAS',
      descripcionIncidencia: 'Enlace roto en syllabus',
      descripcionSolucion: 'Enlace actualizado'
    }
  ];

  const processed = processRawData(rawCursos, rawIncidencias);
  assert.equal(processed.length, 2);

  const course1 = processed.find(c => c.nrc === 'NRC-101');
  assert.ok(course1);
  assert.equal(course1.con.length, 2);
  assert.equal(course1.pendientes.length, 1);
  assert.equal(course1.corregidas.length, 1);
  assert.equal(course1.canvasUrl, 'https://canvas.example.com/courses/101');

  const course2 = processed.find(c => c.nrc === 'NRC-102');
  assert.ok(course2);
  assert.equal(course2.registros.length, 0); // QA2 pendiente
});

test('calculateKpiStats counts correct numbers', () => {
  const rawCursos: RawCourse[] = [
    { id: 1, nrc: 'N1', estado: 'ACTIVO' },
    { id: 2, nrc: 'N2', estado: 'ACTIVO' },
    { id: 3, nrc: 'N3', estado: 'ACTIVO' }
  ];
  const rawIncidencias: RawIncident[] = [
    { id: 10, cursoId: 1, qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'PENDIENTE' },
    { id: 11, cursoId: 1, qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'CORREGIDA' },
    { id: 12, cursoId: 2, qaIncidencias: 'SIN INCIDENCIA', estadoIncidencia: 'NO APLICA' }
    // course 3 has no incidents -> qaPendiente
  ];

  const courses = processRawData(rawCursos, rawIncidencias);
  const stats = calculateKpiStats(courses);

  assert.equal(stats.total, 3);
  assert.equal(stats.conIncidencias, 1); // Course 1 has con incidencias
  assert.equal(stats.sinIncidencias, 1); // Course 2 has sin incidencias
  assert.equal(stats.qaPendiente, 1); // Course 3 has no records
  assert.equal(stats.incidenciasPendientes, 1);
  assert.equal(stats.corregidas, 1);
  assert.equal(stats.derivadas, 0);
});

test('filterCourses filters by search text and state', () => {
  const courses = processRawData(
    [
      { id: 1, nrc: '1234_FIN', 'nombre curso': 'Finanzas Corporativas', facultad: 'Negocios', estado: 'ACTIVO' },
      { id: 2, nrc: '5678_SAL', 'nombre curso': 'Epidemiología', facultad: 'Salud', estado: 'PREPARACION' }
    ],
    []
  );

  const searchResult = filterCourses(courses, { ...INITIAL_FILTERS, q: 'finanzas' }, '');
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].nrc, '1234_FIN');

  const facResult = filterCourses(courses, { ...INITIAL_FILTERS, facultad: 'Salud' }, '');
  assert.equal(facResult.length, 1);
  assert.equal(facResult[0].nrc, '5678_SAL');
});

test('compareCursosOperativos orders ACTIVO before PREPARACION', () => {
  const c1 = processRawData([{ id: 1, nrc: 'A', estado: 'ACTIVO' }], [])[0];
  const c2 = processRawData([{ id: 2, nrc: 'B', estado: 'PREPARACION' }], [])[0];

  assert.ok(compareCursosOperativos(c1, c2) < 0);
  assert.ok(compareCursosOperativos(c2, c1) > 0);
});

test('processRawData excludes courses with codigo curso UNI118', () => {
  const rawCursos: RawCourse[] = [
    { id: 1, nrc: 'NRC-VALID', 'codigo curso': 'INF101', 'nombre curso': 'Informática' },
    { id: 2, nrc: 'NRC-UNI118', 'codigo curso': 'UNI118', 'nombre curso': 'Inducción Institucional' },
    { id: 3, nrc: 'NRC-UNI118-LOWER', 'codigo_curso': 'uni118', 'nombre curso': 'Inducción Minúscula' },
  ];

  const processed = processRawData(rawCursos, []);
  assert.equal(processed.length, 1);
  assert.equal(processed[0].nrc, 'NRC-VALID');
});

test('formatIncidentForEmail formats complete incident row for email', async () => {
  const { formatIncidentForEmail } = await import('./clipboardHelper');
  const course = processRawData(
    [{ id: 1, nrc: '2240_TEST', 'nombre curso': 'Gestión del Cambio', tutor: 'Prof. Juan', facultad: 'Ingeniería', 'fecha inicio': '2026-03-01', 'fecha fin': '2026-06-30' }],
    []
  )[0];

  const incident = {
    id: 99,
    idIncidencia: '2240_TEST_01',
    cursoId: '1',
    categoria: 'EVALUACIONES',
    estadoIncidencia: 'PENDIENTE',
    qaIncidencias: 'CON INCIDENCIA',
    tipoQA: 'QA2_CANVAS',
    urlEvidencia: 'https://example.com/evidencia.pdf',
    urlCanvas: null,
    tieneAdjuntos: true,
    descripcionIncidencia: 'Falta configurar fecha límite en cuestionario semana 3',
    descripcionSolucion: '',
    semanaUnidad: 'Semana 3'
  };

  const { plainText, htmlText } = formatIncidentForEmail(course, incident);
  assert.ok(plainText.includes('NRC: 2240_TEST'));
  assert.ok(plainText.includes('ID Incidencia: #2240_TEST_01'));
  assert.ok(plainText.includes('Falta configurar fecha límite'));
  assert.ok(htmlText.includes('2240_TEST_01'));
  assert.ok(htmlText.includes('EVALUACIONES'));
});

test('formatIncidentsForEmail formats multiple selected incidents for email', async () => {
  const { formatIncidentsForEmail } = await import('./clipboardHelper');
  const course = processRawData(
    [{ id: 1, nrc: '2240_TEST', 'nombre curso': 'Gestión del Cambio', tutor: 'Prof. Juan', facultad: 'Ingeniería', 'fecha inicio': '2026-03-01', 'fecha fin': '2026-06-30' }],
    []
  )[0];

  const inc1 = {
    id: 1,
    idIncidencia: '2240_TEST_01',
    cursoId: '1',
    categoria: 'EVALUACIONES',
    estadoIncidencia: 'PENDIENTE',
    qaIncidencias: 'CON INCIDENCIA',
    tipoQA: 'QA2_CANVAS',
    urlEvidencia: null,
    urlCanvas: null,
    tieneAdjuntos: false,
    descripcionIncidencia: 'Descripción 1',
    descripcionSolucion: '',
    semanaUnidad: 'Semana 1'
  };

  const inc2 = {
    ...inc1,
    id: 2,
    idIncidencia: '2240_TEST_02',
    categoria: 'BIBLIOGRAFIA',
    descripcionIncidencia: 'Descripción 2'
  };

  const { plainText, htmlText } = formatIncidentsForEmail(course, [inc1, inc2]);
  assert.ok(plainText.includes('REPORTE DE 2 INCIDENCIAS QA2'));
  assert.ok(plainText.includes('INCIDENCIA 1 DE 2:'));
  assert.ok(plainText.includes('INCIDENCIA 2 DE 2:'));
  assert.ok(plainText.includes('#2240_TEST_01'));
  assert.ok(plainText.includes('#2240_TEST_02'));
  assert.ok(htmlText.includes('Incidencia 1 de 2'));
  assert.ok(htmlText.includes('Incidencia 2 de 2'));
});

test('buildSelectedCourseGroups and buildConsolidatedEmailReport select 3 incidents from one NRC and 2 from another and allow removal', async () => {
  const { getIncidentUniqueKey, buildSelectedCourseGroups } = await import('./auditLogic');
  const { buildConsolidatedEmailReport } = await import('./clipboardHelper');

  const rawCursos: RawCourse[] = [
    {
      id: 1001,
      nrc: '1001_NRC_A',
      'nombre curso': 'Curso Alfa',
      tutor: 'Ana Pérez',
      facultad: 'Educación',
      estado: 'ACTIVO',
    },
    {
      id: 1002,
      nrc: '1002_NRC_B',
      'nombre curso': 'Curso Beta',
      tutor: 'Carlos Soto',
      facultad: 'Ingeniería',
      estado: 'ACTIVO',
    },
    {
      id: 1003,
      nrc: '1003_NRC_C',
      'nombre curso': 'Curso Gamma',
      tutor: 'Luis Gómez',
      facultad: 'Salud',
      estado: 'ACTIVO',
    },
  ];

  const rawIncs: RawIncident[] = [
    { id: 1, cursoId: 1001, idIncidencia: 'A-01', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'PENDIENTE', tipoQA: 'QA2_INICIAL', categoria: 'EVALUACION', descripcionIncidencia: 'Desc A1', descripcionSolucion: 'Sol A1' },
    { id: 2, cursoId: 1001, idIncidencia: 'A-02', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'CORREGIDA', tipoQA: 'QA2_INICIAL', categoria: 'SYLLABUS', descripcionIncidencia: 'Desc A2', descripcionSolucion: 'Sol A2' },
    { id: 3, cursoId: 1001, idIncidencia: 'A-03', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'DERIVADO', tipoQA: 'QA2_FINAL', categoria: 'FECHAS', descripcionIncidencia: 'Desc A3', descripcionSolucion: '' },
    { id: 4, cursoId: 1001, idIncidencia: 'A-04', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'PENDIENTE', tipoQA: 'QA2_FINAL', categoria: 'OTROS', descripcionIncidencia: 'Desc A4 No Seleccionada', descripcionSolucion: '' },
    { id: 5, cursoId: 1002, idIncidencia: 'B-01', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'PENDIENTE', tipoQA: 'QA2_INICIAL', categoria: 'LINKS', descripcionIncidencia: 'Desc B1', descripcionSolucion: 'Sol B1' },
    { id: 6, cursoId: 1002, idIncidencia: 'B-02', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'PENDIENTE', tipoQA: 'QA2_INICIAL', categoria: 'MODULOS', descripcionIncidencia: 'Desc B2', descripcionSolucion: '' },
    { id: 7, cursoId: 1002, idIncidencia: 'B-03', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'CORREGIDA', tipoQA: 'QA2_INICIAL', categoria: 'FORO', descripcionIncidencia: 'Desc B3 No Seleccionada', descripcionSolucion: '' },
    { id: 8, cursoId: 1003, idIncidencia: 'C-01', qaIncidencias: 'CON INCIDENCIA', estadoIncidencia: 'PENDIENTE', tipoQA: 'QA2_INICIAL', categoria: 'FORO', descripcionIncidencia: 'Desc C1 No Seleccionada', descripcionSolucion: '' },
  ];

  const courses = processRawData(rawCursos, rawIncs);
  const cA = courses.find((c) => c.nrc === '1001_NRC_A')!;
  const cB = courses.find((c) => c.nrc === '1002_NRC_B')!;

  // Select 3 incidents from NRC_A and 2 from NRC_B
  const selectedKeys = new Set<string>([
    getIncidentUniqueKey(cA, cA.con.find((i) => i.idIncidencia === 'A-01')!),
    getIncidentUniqueKey(cA, cA.con.find((i) => i.idIncidencia === 'A-02')!),
    getIncidentUniqueKey(cA, cA.con.find((i) => i.idIncidencia === 'A-03')!),
    getIncidentUniqueKey(cB, cB.con.find((i) => i.idIncidencia === 'B-01')!),
    getIncidentUniqueKey(cB, cB.con.find((i) => i.idIncidencia === 'B-02')!),
  ]);

  const groups = buildSelectedCourseGroups(courses, selectedKeys);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].incidents.length, 3);
  assert.equal(groups[1].incidents.length, 2);

  const report = buildConsolidatedEmailReport(groups);
  assert.equal(report.nrcCount, 2);
  assert.equal(report.incidentCount, 5);
  assert.equal(report.subject, 'ETOP | Reporte consolidado de incidencias QA2 | 2 NRC');

  // Verify exclusively those 5 incidents are included
  assert.ok(report.body.includes('NRC: 1001_NRC_A — Curso Alfa'));
  assert.ok(report.body.includes('Tutor: Ana Pérez'));
  assert.ok(report.body.includes('Facultad: Educación'));
  assert.ok(report.body.includes('Incidencia A-01'));
  assert.ok(report.body.includes('Incidencia A-02'));
  assert.ok(report.body.includes('Incidencia A-03'));
  assert.ok(!report.body.includes('Incidencia A-04'));

  assert.ok(report.body.includes('NRC: 1002_NRC_B — Curso Beta'));
  assert.ok(report.body.includes('Tutor: Carlos Soto'));
  assert.ok(report.body.includes('Incidencia B-01'));
  assert.ok(report.body.includes('Incidencia B-02'));
  assert.ok(!report.body.includes('Incidencia B-03'));
  assert.ok(!report.body.includes('1003_NRC_C'));

  // Remove 1 incident from NRC_A
  selectedKeys.delete(getIncidentUniqueKey(cA, cA.con.find((i) => i.idIncidencia === 'A-02')!));
  const groupsAfterRemove = buildSelectedCourseGroups(courses, selectedKeys);
  const reportAfterRemove = buildConsolidatedEmailReport(groupsAfterRemove);
  assert.equal(reportAfterRemove.nrcCount, 2);
  assert.equal(reportAfterRemove.incidentCount, 4);
  assert.ok(!reportAfterRemove.body.includes('Incidencia A-02'));
});



