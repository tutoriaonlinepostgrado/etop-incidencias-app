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
  RawIncident
} from './utils/auditLogic';
import { Navbar } from './components/Navbar';
import { SidebarFilters } from './components/SidebarFilters';
import { KpiMetricsRow } from './components/KpiMetricsRow';
import { CourseCard } from './components/CourseCard';
import { ManagementDrawer } from './components/ManagementDrawer';
import { PaginationControls } from './components/PaginationControls';
import {
  AlertCircle,
  RefreshCw,
  Search,
  FilterX,
  SlidersHorizontal,
  FileCheck2
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
  const [filtersOpen, setFiltersOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [kpiCollapsed, setKpiCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [openCourseIds, setOpenCourseIds] = useState<Set<string>>(new Set());

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

    // Auto-collapse sidebar on smaller screens initially
    if (window.innerWidth < 1280) {
      setFiltersOpen(false);
    }

    // Global keyboard shortcut: press '/' to focus search input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setFiltersOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 150);
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col font-sans">
      {/* Topnav (Hidden if embedded) */}
      {!isEmbedded && !isFocused && (
        <Navbar
          onToggleFilters={() => setFiltersOpen((prev) => !prev)}
          filtersOpen={filtersOpen}
          onFocusSearch={() => {
            setFiltersOpen(true);
            setTimeout(() => searchInputRef.current?.focus(), 150);
          }}
          onRefresh={() => fetchData(true)}
          isRefreshing={refreshing}
          totalCourses={courses.length}
          lastUpdated={lastUpdated}
        />
      )}

      {/* Main Container Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Filters */}
        {!isFocused && <SidebarFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
          facultades={filterOptions.facultades}
          estadosCurso={filterOptions.estadosCurso}
          estadosInc={filterOptions.estadosInc}
          tiposQa={filterOptions.tiposQa}
          categorias={filterOptions.categorias}
          tutores={filterOptions.tutores}
          searchInputRef={searchInputRef}
          isOpen={filtersOpen}
          onCloseMobile={() => setFiltersOpen(false)}
        />}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Quick Toggle for Mobile / Tablets */}
            {!isFocused && !filtersOpen && (
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-[#1d4ed8] border border-[#cbd5e1] hover:border-[#93c5fd] rounded shadow-2xs transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Mostrar panel de filtros</span>
                </button>
              </div>
            )}

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

      {/* Footer */}
      {!isEmbedded && (
        <footer className="bg-white border-t border-[#e2e8f0] py-3 px-4 text-center text-xs text-[#64748b] select-none">
          <p>
            Portal ETOP · Gobernanza Académica & Control de Calidad · Datos sincrónicos desde{' '}
            <span className="font-mono text-[#0f172a] font-medium">nrcs.json</span> e{' '}
            <span className="font-mono text-[#0f172a] font-medium">incidencias.json</span>
          </p>
        </footer>
      )}

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
