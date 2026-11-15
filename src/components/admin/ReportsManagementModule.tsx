import React, { useState, useMemo } from 'react';
import { useLabPulse } from '../../context/LabPulseContext';
import { MaintenanceReport, ReportStatus, ReportType } from '../../types';
import { 
  Search, 
  X, 
  Check, 
  Wrench, 
  AlertTriangle, 
  ChevronRight,
  Maximize2,
  Calendar,
  User,
  MapPin,
  Cpu,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ShieldCheck,
  ExternalLink,
  Filter
} from 'lucide-react';

export const ReportsManagementModule: React.FC = () => {
  const { 
    reports, 
    updateReportStatus, 
    flagHardwareFromReport, 
    flagSpaceFromReport,
    openReportModal,
    addToast 
  } = useLabPulse();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'IN REPAIR' | 'RESOLVED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SPACE' | 'HARDWARE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReport, setActiveReport] = useState<MaintenanceReport | null>(null);
  const [officerNotes, setOfficerNotes] = useState('');
  const [viewingPhotoFullscreen, setViewingPhotoFullscreen] = useState<string | null>(null);

  // Top Metrics
  const metrics = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter((r) => r.status === 'PENDING').length;
    const inRepair = reports.filter((r) => r.status === 'IN REPAIR').length;
    const resolved = reports.filter((r) => r.status === 'RESOLVED').length;
    return { total, pending, inRepair, resolved };
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(q);
        const matchesTarget = r.targetName.toLowerCase().includes(q) || r.targetCodeOrTag.toLowerCase().includes(q);
        const matchesReporter = r.reportedBy.toLowerCase().includes(q) || r.reporterMatric.toLowerCase().includes(q);
        const matchesCategory = r.category.toLowerCase().includes(q);
        const matchesDesc = r.description.toLowerCase().includes(q);
        return matchesId || matchesTarget || matchesReporter || matchesCategory || matchesDesc;
      }

      return true;
    });
  }, [reports, statusFilter, typeFilter, searchQuery]);

  const handleOpenDetail = (report: MaintenanceReport) => {
    setActiveReport(report);
    setOfficerNotes(report.officerNotes || '');
  };

  const handleUpdateStatus = (status: ReportStatus) => {
    if (!activeReport) return;
    updateReportStatus(activeReport.id, status, officerNotes.trim() || undefined);
    setActiveReport({
      ...activeReport,
      status,
      officerNotes: officerNotes.trim() || undefined,
      resolvedAt: status === 'RESOLVED' ? new Date().toLocaleString() : activeReport.resolvedAt
    });
  };

  const handleFlagPassport = () => {
    if (!activeReport) return;
    flagHardwareFromReport(activeReport.id);
  };

  const handleSaveNotes = () => {
    if (!activeReport) return;
    updateReportStatus(activeReport.id, activeReport.status, officerNotes.trim() || undefined);
    addToast('Notes Saved', `Diagnostic notes updated for ticket ${activeReport.id}.`, 'info');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      
      {/* 1. CLEAN TOP HEADER WITH ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Maintenance & Defect Triage
            </h1>
            <span
              className={`font-mono tabular-nums text-xs font-medium px-2 py-0.5 rounded-md ${
                metrics.pending > 0
                  ? 'bg-amber-50 text-amber-900 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}
            >
              {metrics.pending > 0 ? `${metrics.pending} pending` : 'All nominal'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => openReportModal()}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log defect ticket</span>
        </button>
      </div>

      {/* 2. UNIFIED METRIC & FILTER STATUS BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 sm:p-2.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
        
        {/* Status Filter Segment with Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All tickets', count: metrics.total },
            { id: 'PENDING', label: 'Pending', count: metrics.pending },
            { id: 'IN REPAIR', label: 'In repair', count: metrics.inRepair },
            { id: 'RESOLVED', label: 'Resolved', count: metrics.resolved }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs font-mono px-1.5 py-0.2 rounded-md font-medium ${
                  statusFilter === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right side: Type selector & Search Bar */}
        <div className="flex items-center gap-2">
          {/* Type Segment */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'SPACE', label: 'Spaces' },
              { id: 'HARDWARE', label: 'Hardware' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTypeFilter(t.id as any)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  typeFilter === t.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by room, asset, reporter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-400 focus:bg-white text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* 3. INCIDENT TICKETS GRID */}
      {filteredReports.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 bg-white rounded-xl border border-slate-200 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-3.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            {reports.length === 0
              ? 'Zero active incident tickets'
              : 'No tickets match current filters'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {reports.length === 0
              ? 'All FCSIT physical laboratories and hardware assets are operational with 0 reported defects.'
              : 'Try clearing your search query or switching your status filter to see other incident tickets.'}
          </p>
          {reports.length === 0 ? (
            <button
              type="button"
              onClick={() => openReportModal()}
              className="mt-5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log defect ticket</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        /* Grid of Ticket Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => {
            const isSpace = report.type === 'SPACE';
            const isPending = report.status === 'PENDING';
            const isInRepair = report.status === 'IN REPAIR';
            const isResolved = report.status === 'RESOLVED';

            return (
              <div
                key={report.id}
                onClick={() => handleOpenDetail(report)}
                className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 p-4 shadow-xs transition-colors cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top Line: Ticket Code, Type Pill, Status */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold tabular-nums text-slate-900 group-hover:text-blue-900 transition-colors">
                        {report.id}
                      </span>
                      <span
                        className={`font-mono text-xs px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${
                          isSpace
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {isSpace ? <Building2 className="w-2.5 h-2.5" /> : <Cpu className="w-2.5 h-2.5" />}
                        <span>{report.type}</span>
                      </span>
                    </div>

                    <span
                      className={`font-mono text-xs font-medium px-2 py-0.5 rounded-md border ${
                        isPending
                          ? 'bg-amber-100 text-amber-950 border-amber-300'
                          : isInRepair
                          ? 'bg-slate-900 text-white border-slate-900'
                          : isResolved
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  {/* Target Asset / Facility */}
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-900 transition-colors leading-snug line-clamp-1">
                    {report.targetName}
                  </h3>

                  {/* Location or Serial Tag */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-mono">
                      {report.specificLocation || report.serialNumber || report.targetCodeOrTag}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="mt-2.5">
                    <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                      {report.category}
                    </span>
                  </div>

                  {/* Description Excerpt */}
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Card Footer: Reporter & Inspect Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{report.reportedBy}</span>
                  </div>

                  <span className="text-blue-900 font-medium flex items-center gap-1 shrink-0">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. INTERACTIVE TRIAGE INSPECTION MODAL */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => setActiveReport(null)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-10 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-semibold text-slate-900">
                    {activeReport.id}
                  </span>
                  <span
                    className={`font-mono text-xs font-medium px-2 py-0.5 rounded-md border ${
                      activeReport.type === 'SPACE'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-purple-50 text-purple-800 border-purple-200'
                    }`}
                  >
                    {activeReport.type}
                  </span>
                  <span
                    className={`font-mono text-xs font-medium px-2 py-0.5 rounded-md border ${
                      activeReport.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-950 border-amber-300'
                        : activeReport.status === 'IN REPAIR'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-200'
                    }`}
                  >
                    {activeReport.status}
                  </span>
                </div>

                <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                  {activeReport.targetName}
                </h2>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              
              {/* Meta details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs">
                <div>
                  <span className="text-xs font-medium text-slate-500 block">
                    Reported by
                  </span>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeReport.reportedBy} ({activeReport.reporterRole})
                  </div>
                  <div className="font-mono text-xs text-slate-500 mt-0.5">
                    Matric / ID: {activeReport.reporterMatric}
                  </div>
                  {activeReport.reporterEmail && (
                    <div className="text-xs text-slate-400 mt-0.5 truncate">
                      {activeReport.reporterEmail}
                    </div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-500 block">
                    Location & timestamp
                  </span>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeReport.specificLocation || activeReport.serialNumber || activeReport.targetCodeOrTag}
                  </div>
                  <div className="font-mono text-xs text-slate-500 mt-0.5">
                    Tag: {activeReport.targetCodeOrTag}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono">
                    Filed: {activeReport.timestamp}
                  </div>
                </div>
              </div>

              {/* Category & Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-500">
                    Defect symptom & details
                  </span>
                  <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                    {activeReport.category}
                  </span>
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs font-normal text-slate-800 leading-relaxed">
                  {activeReport.description}
                </div>
              </div>

              {/* Attached Photo Evidence Preview */}
              {activeReport.photoUrl && (
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                    <span>Attached fault evidence photo</span>
                    <button
                      type="button"
                      onClick={() => setViewingPhotoFullscreen(activeReport.photoUrl || null)}
                      className="text-xs font-medium text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Full resolution</span>
                    </button>
                  </div>
                  <div 
                    onClick={() => setViewingPhotoFullscreen(activeReport.photoUrl || null)}
                    className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group h-48"
                  >
                    <img
                      src={activeReport.photoUrl}
                      alt="Fault Evidence"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-slate-900/80 text-white text-xs font-mono font-medium backdrop-blur-xs">
                      Click to enlarge
                    </div>
                  </div>
                </div>
              )}

              {/* Space Quick Flag Under Repair */}
              {activeReport.type === 'SPACE' && (
                <div className="p-3.5 bg-amber-50/80 rounded-lg border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-amber-900">
                      Space availability control
                    </div>
                    <div className="text-xs text-amber-950 mt-0.5">
                      Flag facility <strong className="font-mono">{activeReport.targetName}</strong> as Under Repair to suspend student & staff reservations.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      flagSpaceFromReport(activeReport.id);
                      setActiveReport({ ...activeReport, status: 'IN REPAIR' });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    Flag space under repair
                  </button>
                </div>
              )}

              {/* Hardware Passport Quick Sync */}
              {activeReport.type === 'HARDWARE' && (
                <div className="p-3.5 bg-amber-50/80 rounded-lg border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium text-amber-900">
                      Equipment passport sync
                    </div>
                    <div className="text-xs text-amber-950 mt-0.5">
                      Flag asset <strong className="font-mono">{activeReport.targetCodeOrTag}</strong> as Under Maintenance in the hardware registry.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFlagPassport}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    Flag under repair
                  </button>
                </div>
              )}

              {/* Officer Action Notes */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                  <span>Officer action notes & log</span>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="text-xs font-medium text-slate-900 hover:underline cursor-pointer"
                  >
                    Save notes
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Record technician dispatch, spare part requisition, or repair resolution..."
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white text-slate-900 placeholder:text-slate-400"
                />
              </div>

            </div>

            {/* Modal Footer: Interactive Triage State Controls */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">
                Update status:
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('IN REPAIR')}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Mark in repair
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
                >
                  Resolve & close
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('DISMISSED')}
                  className="px-3 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Fullscreen Photo Modal */}
      {viewingPhotoFullscreen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={viewingPhotoFullscreen}
              alt="Evidence Fullscreen"
              className="max-h-[85vh] w-auto rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            <button
              type="button"
              onClick={() => setViewingPhotoFullscreen(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
