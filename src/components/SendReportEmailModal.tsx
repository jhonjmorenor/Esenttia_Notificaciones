import React, { useState, useEffect } from 'react';
import { SendReportItem, ProcessType, SmtpConfig } from '../types/mail';
import {
  generateReportExcelBase64,
  exportReportToExcel,
} from '../utils/excelParser';
import { generateReportEmailHtml } from '../utils/htmlGenerator';
import {
  Mail,
  Send,
  X,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Info,
  Server,
  FileText,
} from 'lucide-react';

interface SendReportEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: SendReportItem[];
  activeProcess: ProcessType;
  smtpConfig: SmtpConfig;
  isTestMode: boolean;
}

export const SendReportEmailModal: React.FC<SendReportEmailModalProps> = ({
  isOpen,
  onClose,
  reports,
  activeProcess,
  smtpConfig,
  isTestMode,
}) => {
  if (!isOpen) return null;

  const [toInput, setToInput] = useState<string>(() => {
    try {
      return localStorage.getItem('automail_report_recipients') || smtpConfig.user || '';
    } catch {
      return smtpConfig.user || '';
    }
  });

  const [ccInput, setCcInput] = useState<string>(() => {
    try {
      return localStorage.getItem('automail_report_cc') || '';
    } catch {
      return '';
    }
  });

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  
  const processLabel =
    activeProcess === 'vip'
      ? 'VIP'
      : activeProcess === 'despachados'
      ? 'Despachados'
      : activeProcess === 'pendientes'
      ? 'Pendientes'
      : 'Fechas';

  const [subject, setSubject] = useState<string>(
    `Reporte Consolidado de Envíos de Correos - ${processLabel} - ${dateStr}`
  );
  const [notes, setNotes] = useState<string>('');
  const [attachExcel, setAttachExcel] = useState<boolean>(true);
  const [showHtmlPreview, setShowHtmlPreview] = useState<boolean>(false);

  const [isSending, setIsSending] = useState<boolean>(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    recipient?: string;
  } | null>(null);

  // Calculate metrics
  const total = reports.length;
  const sentCount = reports.filter((r) => r.ESTADO === 'ENVIADO' || r.ESTADO === 'PRUEBA').length;
  const missingCount = reports.filter((r) => r.ESTADO === 'SIN CORREO').length;
  const errorCount = reports.filter((r) => r.ESTADO === 'ERROR').length;

  // File name
  const { fileName } = generateReportExcelBase64(reports, activeProcess);

  // Generate HTML preview
  const previewHtml = generateReportEmailHtml(reports, activeProcess, notes, 'preview');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    const recipients = toInput
      .split(/[;,]/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      setResult({
        success: false,
        message: 'Por favor ingresa al menos un correo destinatario (Para/To).',
      });
      return;
    }

    const ccList = ccInput
      .split(/[;,]/)
      .map((e) => e.trim())
      .filter(Boolean);

    setIsSending(true);

    try {
      // Save recipient preferences for next time
      try {
        localStorage.setItem('automail_report_recipients', toInput.trim());
        localStorage.setItem('automail_report_cc', ccInput.trim());
      } catch {
        // ignore storage errors
      }

      // Generate base64 excel if attached
      let excelBase64 = '';
      if (attachExcel) {
        const generated = generateReportExcelBase64(reports, activeProcess);
        excelBase64 = generated.base64;
      }

      const emailHtml = generateReportEmailHtml(reports, activeProcess, notes, 'smtp');

      const response = await fetch('/api/send-report-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: smtpConfig,
          to: recipients,
          cc: ccList,
          subject: subject.trim(),
          html: emailHtml,
          excelBase64: attachExcel ? excelBase64 : undefined,
          excelFileName: attachExcel ? fileName : undefined,
          isTestMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || 'El informe ha sido enviado satisfactoriamente.',
          recipient: recipients.join(', '),
        });
      } else {
        setResult({
          success: false,
          message: data.message || 'Error al conectar con el servidor de correo.',
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setResult({
        success: false,
        message: error.message || 'Error de conexión con el servidor de despacho.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Enviar Informe de Envíos por Correo
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-800 uppercase">
                  {processLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Envía el resumen ejecutivo y el archivo Excel adjunto (.xlsx) con auditoría completa
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metrics summary banner */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-900" />
              <span className="font-semibold text-slate-800">
                Contenido del informe:
              </span>
              <span className="text-slate-600 font-medium">
                {total} registro{total !== 1 ? 's' : ''} consolidado{total !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold font-mono text-[11px]">
                {sentCount} exitosos
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold font-mono text-[11px]">
                {missingCount} sin correo
              </span>
              {errorCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-semibold font-mono text-[11px]">
                  {errorCount} error{errorCount !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Test mode or SMTP warning */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              isTestMode
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 shrink-0" />
              <span>
                {isTestMode ? (
                  <>
                    <strong>Modo Prueba activo:</strong> El envío del informe será simulado en pantalla sin emitir correos reales al exterior.
                  </>
                ) : (
                  <>
                    <strong>Modo Real activo:</strong> Se enviará mediante el servidor SMTP configurado (
                    <code>{smtpConfig.host || 'smtp.office365.com'}</code> desde <code>{smtpConfig.user}</code>).
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Result Alert if available */}
          {result && (
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                result.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold text-sm">
                  {result.success ? '¡Informe despachado con éxito!' : 'Error al enviar el informe'}
                </div>
                <p className="mt-0.5 text-xs">{result.message}</p>
                {result.recipient && (
                  <p className="mt-1 text-[11px] font-mono text-emerald-700">
                    Destinatario(s): {result.recipient}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form id="report-email-form" onSubmit={handleSend} className="space-y-4">
            {/* Destinatarios TO */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Destinatario(s) (Para / To)</span>
                  <span className="text-rose-500">*</span>
                </label>
                {smtpConfig.user && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!toInput) {
                        setToInput(smtpConfig.user);
                      } else if (!toInput.includes(smtpConfig.user)) {
                        setToInput(`${toInput}; ${smtpConfig.user}`);
                      }
                    }}
                    className="text-[11px] text-blue-900 hover:text-blue-700 font-medium underline transition-colors"
                  >
                    Usar mi correo SMTP ({smtpConfig.user})
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                placeholder="ej: supervisor@esenttia.co; sac@esenttia.co"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white bg-slate-50"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Puedes ingresar varias direcciones separadas por coma (,) o punto y coma (;).
              </p>
            </div>

            {/* Destinatarios CC */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                En copia (CC opcional)
              </label>
              <input
                type="text"
                value={ccInput}
                onChange={(e) => setCcInput(e.target.value)}
                placeholder="ej: gerencia@esenttia.co; auditoria@esenttia.co"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white bg-slate-50"
              />
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Asunto del correo
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white bg-slate-50 font-medium"
              />
            </div>

            {/* Observaciones o notas adicionales */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Observaciones o notas adicionales (opcional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ej: Informe de despachos correspondientes a la jornada de la mañana..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white bg-slate-50 resize-none"
              />
            </div>

            {/* Attachment preview Card */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={attachExcel}
                  onChange={(e) => setAttachExcel(e.target.checked)}
                  className="w-4 h-4 text-blue-900 rounded-sm border-slate-300 focus:ring-blue-900"
                />
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800">
                      Adjuntar archivo Excel oficial:
                    </span>
                    <span className="ml-1 text-slate-600 font-mono text-[11px]">
                      {fileName}
                    </span>
                  </div>
                </div>
              </label>

              <button
                type="button"
                onClick={() => exportReportToExcel(reports, activeProcess)}
                className="px-2.5 py-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-md border border-emerald-200 transition-colors flex items-center gap-1.5 shrink-0"
                title="Descargar copia del archivo a tu equipo"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar copia
              </button>
            </div>

            {/* HTML Preview Toggle */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>{showHtmlPreview ? 'Ocultar vista previa del correo' : 'Ver vista previa del cuerpo del correo'}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-normal">
                  {showHtmlPreview ? 'Cerrar vista' : 'Previsualizar formato HTML'}
                </span>
              </button>

              {showHtmlPreview && (
                <div className="p-4 bg-white border-t border-slate-200 max-h-72 overflow-y-auto">
                  <div
                    className="border border-slate-100 rounded-lg p-2 text-xs"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => exportReportToExcel(reports, activeProcess)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Descargar Excel (.xlsx)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cerrar
            </button>

            <button
              type="submit"
              form="report-email-form"
              disabled={isSending || reports.length === 0}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando Informe...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Informe por Correo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
