import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Course,
  FilterState,
  INITIAL_FILTERS,
  processRawData,
  filterCourses,
  calculateKpiStats,
  POWER_APPS_URL,
  RawCourse,
  RawIncident,
  Incident,
  buildSelectedCourseGroups,
  getIncidentUniqueKey
} from './utils/auditLogic';
import { TopFilterBar } from './components/TopFilterBar';
import { BulkSelectionBar } from './components/BulkSelectionBar';
import { KpiMetricsRow } from './components/KpiMetricsRow';
import { CourseCard } from './components/CourseCard';
import { ManagementDrawer } from './components/ManagementDrawer';
import { PaginationControls } from './components/PaginationControls';
import {
  AlertCircle,
  RefreshCw,
  Search,
  FilterX
} from 'lucide-react';

const BASE_URL = 'https://raw.githubusercontent.com/tutoriaonlinepostgrado/sitiowebetop/main/';
const URLS = {
  cursos: `${BASE_URL}nrcs.json`,
  incidencias: `${BASE_URL}incidencias.json`,
};

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('—');

  // Interactive controls state
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [statMode, setStatMode] = useState<string>('');
  const [kpiCollapsed, setKpiCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [openCourseIds, setOpenCourseIds] = useState<Set<string>>(new Set());
  // La selección pertenece a la sesión de la vista completa, no a la página
  // o los filtros visibles; así se pueden combinar incidencias de muchos NRC.
  const [selectedIncidentKeys, setSelectedIncidentKeys] = useState<Set<string>>(
    () => new Set()
  );

  // Management Drawer state
  const [drawer, setDrawer] = useState<{
    isOpen: boolean;
    nrc: string;
    courseName: string;
  }>({
    isOpen: false,
    nrc: '',
    courseName: '',
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const focusedNrc = useMemo(() => new URLSearchParams(window.location.search).get('nrc')?.trim() || '', []);
  const isFocused = useMemo(() => new URLSearchParams(window.location.search).get('vista') === 'curso' && !!focusedNrc, [focusedNrc]);
  // Embedded mode detection (?embedded=1)
  const isEmbedded = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).get('embedded') === '1';
  }, []);

  // Fetch data
  const fetchData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const stamp = `?t=${Date.now()}`;
      const [resCursos, resIncs] = await Promise.all([
        fetch(URLS.cursos + stamp),
        fetch(URLS.incidencias + stamp),
      ]);

      if (!resCursos.ok || !resIncs.ok) {
        throw new Error(
          `Error de conexión: nrcs.json status ${resCursos.status}, incidencias.json status ${resIncs.status}`
        );
      }

      const rawCursos = (await resCursos.json()) as RawCourse[];
      const rawIncs = (await resIncs.json()) as RawIncident[];

      const processed = processRawData(
        Array.isArray(rawCursos) ? rawCursos : [],
        Array.isArray(rawIncs) ? rawIncs : []
      );

      setCourses(processed);
      // Conservar selecciones de registros todavía existentes después de refrescar,
      // evitando que una incidencia eliminada permanezca en el estado global.
      setSelectedIncidentKeys((previous) => {
        if (previous.size === 0) return previous;
        const valid = new Set(processed.flatMap((course) =>
          course.con.map((inc) => getIncidentUniqueKey(course, inc))
        ));
        return new Set([...previous].filter((key) => valid.has(key)));
      });
      setLastUpdated(
        new Date().toLocaleDateString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      );

      // Handle ?nrc= direct deep link if present
      const directNrc = new URLSearchParams(window.location.search).get('nrc')?.trim();
      if (directNrc) {
        setFilters((prev) => ({ ...prev, q: directNrc }));
        const match = processed.find(
          (c) => c.nrc.toLowerCase() === directNrc.toLowerCase()
        );
        if (match) {
          setOpenCourseIds(new Set([match.id]));
        }
      }
    } catch (err: unknown) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al cargar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Atajo de búsqueda: no interceptar escritura en campos editables.
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.key === '/' && !e.ctrlKey && !e.metaKey &&
          !target?.closest('input, textarea, select, [contenteditable="true"]')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter options lists extracted from data
  const filterOptions = useMemo(() => {
    const facultades = [
      ...new Set(courses.map((c) => c.facultad).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, 'es'));

    const estadosCurso = [
      ...new Set(courses.map((c) => c.estado).filter(Boolean)),
    ].sort();

    const tutores = [
      ...new Set(courses.map((c) => c.tutor).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, 'es'));

    const estadosInc = [
      ...new Set(courses.flatMap((c) => c.con.map((i) => i.estadoIncidencia)).filter(Boolean)),
    ].sort();

    const tiposQa = [
      ...new Set(courses.flatMap((c) => c.registros.map((i) => i.tipoQA)).filter(Boolean)),
    ].sort();

    const categorias = [
      ...new Set(courses.flatMap((c) => c.registros.map((i) => i.categoria)).filter(Boolean)),
    ].sort((a, b) => a.localeCompare(b, 'es'));

    return { facultades, estadosCurso, tutores, estadosInc, tiposQa, categorias };
  }, [courses]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    if (isFocused) return courses.filter(c => c.nrc.trim().toLowerCase() === focusedNrc.toLowerCase());
    return filterCourses(courses, filters, statMode);
  }, [courses, filters, statMode, isFocused, focusedNrc]);

  // La selección se calcula sobre TODOS los cursos cargados, nunca sobre
  // el resultado filtrado o paginado. Mantener los grupos por NRC.
  const selectedGroups = useMemo(
    () => buildSelectedCourseGroups(courses, selectedIncidentKeys),
    [courses, selectedIncidentKeys]
  );

  // KPI Metrics calculation
  const stats = useMemo(() => {
    return calculateKpiStats(filteredCourses);
  }, [filteredCourses]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, statMode, pageSize]);

  // Slice for current page
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // Accordion toggle handlers
  const handleToggleCourse = (id: string) => {
    setOpenCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAllVisible = () => {
    setOpenCourseIds((prev) => {
      const next = new Set(prev);
      paginatedCourses.forEach((c) => next.add(c.id));
      return next;
    });
  };

  const handleCollapseAllVisible = () => {
    setOpenCourseIds(new Set());
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setStatMode('');
  };

  const handleStatToggle = (mode: string) => {
    setStatMode((prev) => (prev === mode ? '' : mode));
  };

  const toggleSelectedIncident = (course: Course, inc: Incident) => {
    const key = getIncidentUniqueKey(course, inc);
    setSelectedIncidentKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAllCourseIncidents = (course: Course) => {
    setSelectedIncidentKeys((previous) => {
      const next = new Set(previous);
      for (const inc of course.con) next.add(getIncidentUniqueKey(course, inc));
      return next;
    });
  };

  const deselectAllCourseIncidents = (course: Course) => {
    setSelectedIncidentKeys((previous) => {
      const next = new Set(previous);
      for (const inc of course.con) next.delete(getIncidentUniqueKey(course, inc));
      return next;
    });
  };

  if (isFocused) {
    const course = courses.find(c => c.nrc.trim().toLowerCase() === focusedNrc.toLowerCase());
    const records = course?.con || [];
    return (
      <div className="min-h-screen bg-white text-slate-800 font-sans">
        <main className="px-3 py-3 space-y-3 max-w-2xl mx-auto">
          {loading && <p className="text-sm text-slate-500 py-8 text-center">Cargando incidencias del NRC…</p>}
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}<button className="block mt-2 underline" onClick={() => fetchData(true)}>Reintentar</button></div>}
          {!loading && !error && !course && <p className="text-sm text-slate-600 p-4">No se encontró el NRC {focusedNrc} en el catálogo.</p>}
          {!loading && !error && course && <>
            <header className="space-y-1 border-b border-slate-200 pb-3">
              <div className="text-xs font-semibold text-blue-800 break-all">{course.nrc}</div>
              <h1 className="text-base font-bold leading-snug">{course.curso}</h1>
              <div className="text-xs text-slate-500">{course.tutor ? 'Tutor: ' + course.tutor : course.programa}</div>
              <div className="text-xs font-semibold">{records.length} {records.length === 1 ? 'incidencia registrada' : 'incidencias registradas'}</div>
            </header>
            {records.length === 0 ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">No hay incidencias registradas para este curso.</div> :
              records.map((inc, idx) => (
                <article key={inc.idIncidencia || String(inc.id) || idx} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm">Incidencia {idx + 1}</strong>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800">{inc.estadoIncidencia || 'Sin estado'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {inc.tipoQA && <span className="rounded bg-blue-50 px-2 py-1 text-blue-800">{inc.tipoQA}</span>}
                    {inc.categoria && <span className="rounded bg-slate-100 px-2 py-1 text-slate-700">{inc.categoria}</span>}
                    {inc.semanaUnidad && <span className="rounded bg-slate-100 px-2 py-1">{inc.semanaUnidad}</span>}
                  </div>
                  <section className="space-y-1"><h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Descripción</h2><p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{inc.descripcionIncidencia || 'Sin descripción'}</p></section>
                  {inc.descripcionSolucion && <section className="space-y-1 border-t border-slate-100 pt-2"><h2 className="text-xs font-bold uppercase tracking-wide text-slate-500">Solución registrada</h2><p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{inc.descripcionSolucion}</p></section>}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {(inc.urlCanvas || course.canvasUrl) && <a className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-3 text-center font-semibold text-blue-800" href={inc.urlCanvas || course.canvasUrl} target="_blank" rel="noopener noreferrer">Abrir Canvas ↗</a>}
                    {inc.urlEvidencia && <a className="rounded-lg border border-slate-200 px-2 py-3 text-center font-semibold" href={inc.urlEvidencia} target="_blank" rel="noopener noreferrer">Ver evidencia ↗</a>}
                    <button className="rounded-lg border border-violet-200 bg-violet-50 px-2 py-3 text-center font-semibold text-violet-800" onClick={() => setDrawer({isOpen:true,nrc:course.nrc,courseName:course.curso})}>Gestionar ↗</button>
                  </div>
                </article>
              ))
            }
          </>}
        </main>
        <ManagementDrawer isOpen={drawer.isOpen} onClose={() => setDrawer(prev => ({...prev,isOpen:false}))} nrc={drawer.nrc} courseName={drawer.courseName} powerAppsBaseUrl={POWER_APPS_URL}/>
      </div>
    );
  }

  return (
    <div className="h-screen min-h-0 bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      {/* Los filtros reemplazan al encabezado original y ocupan todo el ancho. */}
      <TopFilterBar
        filters={filters}
        statMode={statMode}
        onChange={setFilters}
        onClear={handleClearFilters}
        onRefresh={() => fetchData(true)}
        isRefreshing={refreshing}
        totalCourses={courses.length}
        filteredCount={filteredCourses.length}
        lastUpdated={lastUpdated}
        facultades={filterOptions.facultades}
        estadosCurso={filterOptions.estadosCurso}
        estadosInc={filterOptions.estadosInc}
        tiposQa={filterOptions.tiposQa}
        categorias={filterOptions.categorias}
        tutores={filterOptions.tutores}
        searchInputRef={searchInputRef}
        isEmbedded={isEmbedded}
      />

      {/* El listado se desplaza sin ocupar el ancho de un panel lateral. */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <main className="flex-1 min-w-0 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4" id="etop-incidencias-list">
          <div className="w-full mx-auto space-y-4">
            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded border border-[#fecaca] bg-[#fef2f2] text-[#991b1b] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#dc2626]" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchData(true)}
                  className="px-2.5 py-1 bg-white border border-[#fecaca] text-[#b91c1c] rounded font-semibold hover:bg-[#fee2e2]"
                >
                  Reintentar
                </button>
              </div>
            )}

            {/* Loading Spinner */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#64748b]">
                <RefreshCw className="w-8 h-8 animate-spin text-[#1d4ed8]" />
                <span className="text-sm font-medium">
                  Cargando consolidado de cursos e incidencias QA2…
                </span>
                <span className="text-xs text-[#94a3b8]">
                  Sincronizando desde el repositorio institucional
                </span>
              </div>
            ) : (
              <>
                {/* KPI Metrics Summary Row */}
                {!isFocused && <KpiMetricsRow
                  stats={stats}
                  statMode={statMode}
                  onSelectStat={handleStatToggle}
                  isCollapsed={kpiCollapsed}
                  onToggleCollapse={() => setKpiCollapsed((prev) => !prev)}
                />}

                {/* Selección global: persiste entre páginas y cambios de filtros. */}
                <BulkSelectionBar
                  selectedGroups={selectedGroups}
                  onRemoveIncident={toggleSelectedIncident}
                  onRemoveCourseIncidents={deselectAllCourseIncidents}
                  onClearSelection={() => setSelectedIncidentKeys(new Set())}
                />

                {/* Pagination Controls and Card List Header */}
                {!isFocused && <PaginationControls
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalItems={filteredCourses.length}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 120, behavior: 'smooth' });
                  }}
                  onPageSizeChange={setPageSize}
                  onExpandAll={handleExpandAllVisible}
                  onCollapseAll={handleCollapseAllVisible}
                  isPreparacionFilter={filters.estadoCurso === 'PREPARACION'}
                />}

                {/* Course Card Accordion List */}
                <div className="space-y-2.5">
                  {filteredCourses.length > 0 ? (
                    (isFocused ? filteredCourses : paginatedCourses).map((course) => (
                      <CourseCard
                        key={course.id || course.nrc}
                        course={course}
                        isOpen={isFocused || openCourseIds.has(course.id)}
                        onToggle={() => handleToggleCourse(course.id)}
                        onOpenPowerApp={(nrc, courseName) => {
                          setDrawer({
                            isOpen: true,
                            nrc,
                            courseName,
                          });
                        }}
                        selectedIncidentKeys={selectedIncidentKeys}
                        onToggleIncident={toggleSelectedIncident}
                        onSelectAllCourseIncidents={selectAllCourseIncidents}
                        onDeselectAllCourseIncidents={deselectAllCourseIncidents}
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center bg-white border border-[#e2e8f0] rounded">
                      <FilterX className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                      <h3 className="text-sm font-semibold text-[#0f172a]">
                        {isFocused ? 'No se encontraron incidencias para este NRC' : 'No se encontraron cursos coincidentes'}
                      </h3>
                      <p className="text-xs text-[#64748b] mt-1 max-w-sm mx-auto">
                        Intenta ajustar los términos de búsqueda o limpiar los filtros seleccionados.
                      </p>
                      {!isFocused && <button
                        type="button"
                        onClick={handleClearFilters}
                        className="mt-3 px-3 py-1.5 bg-[#1d4ed8] text-white text-xs font-medium rounded hover:bg-[#1e40af] transition-colors"
                      >
                        Limpiar todos los filtros
                      </button>}
                    </div>
                  )}
                </div>

                {/* Bottom Pagination when there are courses */}
                {!isFocused && paginatedCourses.length > 0 && (
                  <div className="pt-2">
                    <PaginationControls
                      currentPage={currentPage}
                      pageSize={pageSize}
                      totalItems={filteredCourses.length}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      onPageSizeChange={setPageSize}
                      onExpandAll={handleExpandAllVisible}
                      onCollapseAll={handleCollapseAllVisible}
                      isPreparacionFilter={filters.estadoCurso === 'PREPARACION'}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Slide-over Power Apps Drawer */}
      <ManagementDrawer
        isOpen={drawer.isOpen}
        onClose={() => setDrawer((prev) => ({ ...prev, isOpen: false }))}
        nrc={drawer.nrc}
        courseName={drawer.courseName}
        powerAppsBaseUrl={POWER_APPS_URL}
      />
    </div>
  );
}
