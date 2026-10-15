import React, { useState } from 'react';
import { ClientGroup, EmailTemplateConfig, SmtpConfig } from '../types/mail';
import { generateEmailHtml } from '../utils/htmlGenerator';
import { X, Send, Copy, Check, Code, Eye, AlertCircle } from 'lucide-react';

interface EmailPreviewModalProps {
  group: ClientGroup | null;
  onClose: () => void;
  config: EmailTemplateConfig;
  smtpConfig: SmtpConfig;
  onSendSingleTest: (group: ClientGroup, targetEmail: string) => Promise<{ success: boolean; message: string }>;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  group,
  onClose,
  config,
  smtpConfig,
  onSendSingleTest,
}) => {
  if (!group) return null;

  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  const [copied, setCopied] = useState(false);
  const [testEmail, setTestEmail] = useState(smtpConfig.user || 'jhon.moreno@konecta.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const previewHtml = generateEmailHtml(group, config, 'preview');
  const rawHtmlForSmtp = generateEmailHtml(group, config, 'smtp');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawHtmlForSmtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      setTestResult({ success: false, message: 'Ingresa un correo electrónico válido.' });
      return;
    }

    setIsSendingTest(true);
    setTestResult(null);

    const res = await onSendSingleTest(group, testEmail);
    setTestResult(res);
    setIsSendingTest(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Vista previa del correo: {group.cliente}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{group.items.length} pedidos consolidados</span>
              <span aria-hidden="true">·</span>
              <span>Plantilla HTML institucional</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle visual vs code */}
            <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => setViewMode('visual')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'visual'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Visual
              </button>
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'code'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                HTML
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mail Metadata bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white text-xs space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="w-16 text-slate-400 font-semibold shrink-0">De:</span>
            <span className="text-slate-700 font-mono text-[11px]">
              {smtpConfig.senderName} &lt;{smtpConfig.user}&gt;
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="w-16 text-slate-400 font-semibold shrink-0">Para (TO):</span>
            <span className="text-slate-900 font-mono text-[11px] font-medium">
              {group.to.length > 0 ? group.to.join(', ') : <span className="text-amber-600">Sin correo en archivo</span>}
            </span>
          </div>

          {group.cc.length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="w-16 text-slate-400 font-semibold shrink-0">CC:</span>
              <span className="text-slate-600 font-mono text-[11px]">
                {group.cc.join(', ')}
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-2">
            <span className="w-16 text-slate-400 font-semibold shrink-0">Asunto:</span>
            <span className="text-slate-900 font-semibold">{group.asunto}</span>
          </div>
        </div>

        {/* Body Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          {viewMode === 'visual' ? (
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          ) : (
            <div className="relative max-w-3xl mx-auto">
              <button
                type="button"
                onClick={handleCopyCode}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-200 hover:text-white rounded-md text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar HTML'}
              </button>
              <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px]">
                {rawHtmlForSmtp}
              </pre>
            </div>
          )}
        </div>

        {/* Footer: Send single test action */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Enviar prueba individual a:
            </span>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
            <button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              {isSendingTest ? 'Enviando...' : 'Enviar Prueba'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>

        {testResult && (
          <div
            className={`px-4 py-2.5 text-xs border-t ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {testResult.message}
          </div>
        )}
      </div>
    </div>
  );
};
