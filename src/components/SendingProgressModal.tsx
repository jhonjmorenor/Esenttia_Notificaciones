import React, { useEffect, useRef } from 'react';
import { ClientGroup, SendReportItem } from '../types/mail';
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  Square,
  FileSpreadsheet,
  Download,
  Clock,
  Send,
  X,
} from 'lucide-react';
import { exportReportToExcel } from '../utils/excelParser';

export interface SendingLogEntry {
  timestamp: string;
  client: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

interface SendingProgressModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  isPaused: boolean;
  onPauseResume: () => void;
  onStop: () => void;
  currentIndex: number;
  totalCount: number;
  currentClient: string;
  logs: SendingLogEntry[];
  reports: SendReportItem[];
  isFinished: boolean;
  onClose: () => void;
  onViewReportsTab: () => void;
  isTestMode: boolean;
  activeProcess: import('../types/mail').ProcessType;
}

export const SendingProgressModal: React.FC<SendingProgressModalProps> = ({
  isOpen,
  isProcessing,
  isPaused,
  onPauseResume,
  onStop,
  currentIndex,
  totalCount,
  currentClient,
  logs,
  reports,
  isFinished,
  onClose,
  onViewReportsTab,
  isTestMode,
  activeProcess,
}) => {
  if (!isOpen) return null;

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const percentage = totalCount > 0 ? Math.min(100, Math.round((currentIndex / totalCount) * 100)) : 0;
  const successCount = reports.filter((r) => r.ESTADO === 'ENVIADO' || r.ESTADO === 'PRUEBA').length;
  const warningCount = reports.filter((r) => r.ESTADO === 'SIN CORREO').length;
  const errorCount = reports.filter((r) => r.ESTADO === 'ERROR').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                isFinished
                  ? 'bg-emerald-600'
                  : isTestMode
                  ? 'bg-amber-600'
                  : 'bg-blue-900'
              }`}
            >
              {isFinished ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <RefreshCw className={`w-4 h-4 ${isProcessing && !isPaused ? 'animate-spin' : ''}`} />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isFinished
                  ? 'Proceso de Envío Finalizado'
                  : isPaused
                  ? 'Envío en Pausa'
                  : isTestMode
                  ? 'Simulación de Envíos en Curso'
                  : 'Despacho de Correos en Curso'}
              </h2>
              <p className="text-xs text-slate-500">
                {isTestMode
                  ? 'Modo Prueba: validando destinatarios y tablas sin enviar correos reales'
                  : 'Conectado a servidor SMTP con pausas de seguridad entre envíos'}
              </p>
            </div>
          </div>

          {isFinished && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress status bar */}
        <div className="p-6 bg-white border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800">
              Progreso: {currentIndex} de {totalCount} clientes
            </span>
            <span className="font-bold font-mono text-blue-900 text-sm">
              {percentage}%
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isFinished
                  ? 'bg-emerald-600'
                  : isTestMode
                  ? 'bg-amber-500'
                  : 'bg-blue-900'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Current client notice */}
          {!isFinished && currentClient && (
            <div className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span className="text-slate-400 font-medium">Procesando ahora:</span>
              <span className="font-bold text-slate-900 truncate">{currentClient}</span>
            </div>
          )}

          {/* Mini counters */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-100">
              <div className="font-bold font-mono text-sm">{successCount}</div>
              <div className="text-[11px]">Exitosos / Simulados</div>
            </div>
            <div className="bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-100">
              <div className="font-bold font-mono text-sm">{warningCount}</div>
              <div className="text-[11px]">Sin Correo (Omitidos)</div>
            </div>
            <div className="bg-rose-50 text-rose-800 p-2 rounded-lg border border-rose-100">
              <div className="font-bold font-mono text-sm">{errorCount}</div>
              <div className="text-[11px]">Errores</div>
            </div>
          </div>
        </div>

        {/* Live Terminal Log */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950 font-mono text-xs text-slate-200 max-h-64 space-y-1.5">
          <div className="text-slate-500 pb-1 border-b border-slate-800">
            --- Consola de Despacho en Tiempo Real ---
          </div>
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-500 shrink-0 text-[11px]">{log.timestamp}</span>
              <span
                className={`font-semibold shrink-0 text-[11px] ${
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'warn'
                    ? 'text-amber-400'
                    : log.type === 'error'
                    ? 'text-rose-400'
                    : 'text-blue-400'
                }`}
              >
                [{log.type.toUpperCase()}]
              </span>
              <span className="text-slate-300 break-words">{log.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          {!isFinished ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPauseResume}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-blue-900" />
                      Reanudar
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-slate-600" />
                      Pausar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onStop}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200"
                >
                  <Square className="w-3 h-3 fill-current" />
                  Detener
                </button>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Pausa aleatoria 2-4s entre envíos</span>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => exportReportToExcel(reports, activeProcess)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                Descargar Reporte Excel (.xlsx)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onViewReportsTab}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-semibold transition-colors"
                >
                  Ver Tabla de Reportes
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
