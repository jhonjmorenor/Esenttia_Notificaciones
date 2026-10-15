import React, { useState } from 'react';
import { SendReportItem, ProcessType } from '../types/mail';
import { exportReportToExcel } from '../utils/excelParser';
import {
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';

interface ReportViewerProps {
  reports: SendReportItem[];
  onClearReports: () => void;
  onGoToUpload: () => void;
  activeProcess: ProcessType;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  reports,
  onClearReports,
  onGoToUpload,
  activeProcess,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.CLIENTE.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.CORREOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ASUNTO.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return r.ESTADO === statusFilter;
  });

  const sentCount = reports.filter((r) => r.ESTADO === 'ENVIADO' || r.ESTADO === 'PRUEBA').length;
  const missingCount = reports.filter((r) => r.ESTADO === 'SIN CORREO').length;
  const errorCount = reports.filter((r) => r.ESTADO === 'ERROR').length;

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Auditoría y Trazabilidad
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Reporte de Envíos de Correos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historial de despachos, destinatarios, estados de entrega y excepciones
          </p>
        </div>

        <div className="flex items-center gap-3">
          {reports.length > 0 && (
            <>
              <button
                type="button"
                onClick={onClearReports}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                title="Limpiar historial actual"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar Historial
              </button>

              <button
                type="button"
                onClick={() => exportReportToExcel(reports, activeProcess)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                Descargar Reporte Excel (.xlsx)
              </button>
            </>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            Aún no se han ejecutado envíos
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Carga un archivo Excel de pedidos y ejecuta una simulación o un envío real
            para registrar aquí los resultados y generar el informe oficial.
          </p>
          <button
            type="button"
            onClick={onGoToUpload}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Ir a Cargar Archivo
          </button>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total Procesados</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-tabular">
                {reports.length}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Exitosos / Simulados</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono-tabular">
                {sentCount}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Sin Correo (Omitidos)</div>
              <div className="text-2xl font-bold text-amber-600 mt-1 font-mono-tabular">
                {missingCount}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Con Error</div>
              <div className="text-2xl font-bold text-rose-600 mt-1 font-mono-tabular">
                {errorCount}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por cliente, correo o asunto..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ENVIADO')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  statusFilter === 'ENVIADO'
                    ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Enviados
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PRUEBA')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  statusFilter === 'PRUEBA'
                    ? 'bg-white text-blue-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Modo Prueba
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('SIN CORREO')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                  statusFilter === 'SIN CORREO'
                    ? 'bg-white text-amber-800 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sin Correo
              </button>
              {errorCount > 0 && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('ERROR')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    statusFilter === 'ERROR'
                      ? 'bg-white text-rose-800 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Errores
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">Cliente</th>
                    <th className="py-3 px-4 font-semibold">Destinatarios (TO)</th>
                    <th className="py-3 px-4 font-semibold">CC</th>
                    <th className="py-3 px-4 font-semibold">Asunto</th>
                    <th className="py-3 px-4 font-semibold text-center">Pedidos</th>
                    <th className="py-3 px-4 font-semibold">Fecha y Hora</th>
                    <th className="py-3 px-4 font-semibold text-center">Estado</th>
                    <th className="py-3 px-4 font-semibold">Detalle Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReports.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate" title={row.CLIENTE}>
                        {row.CLIENTE}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-700 max-w-xs truncate" title={row.CORREOS}>
                        {row.CORREOS || <span className="text-slate-400 italic">Ninguno</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 max-w-xs truncate" title={row.CC}>
                        {row.CC || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate" title={row.ASUNTO}>
                        {row.ASUNTO || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-center font-mono-tabular font-semibold text-slate-900">
                        {row.TOTAL_PEDIDOS}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {row.FECHA_ENVIO}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px]">
                          {row.ESTADO === 'ENVIADO' && (
                            <span className="text-emerald-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> ENVIADO
                            </span>
                          )}
                          {row.ESTADO === 'PRUEBA' && (
                            <span className="text-blue-700 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> PRUEBA
                            </span>
                          )}
                          {row.ESTADO === 'SIN CORREO' && (
                            <span className="text-amber-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> SIN CORREO
                            </span>
                          )}
                          {row.ESTADO === 'ERROR' && (
                            <span className="text-rose-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> ERROR
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-rose-600 text-[11px] max-w-xs truncate" title={row.ERROR}>
                        {row.ERROR || <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
