import React, { useState } from 'react';
import { SmtpConfig } from '../types/mail';
import { X, CheckCircle2, AlertCircle, RefreshCw, Key, Shield, Server } from 'lucide-react';

interface SmtpConfigModalProps {
  config: SmtpConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: SmtpConfig) => void;
}

export const SmtpConfigModal: React.FC<SmtpConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<SmtpConfig>({ ...config });
  const [showPassword, setShowPassword] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const applyPreset = (type: 'office365' | 'gmail' | 'custom') => {
    if (type === 'office365') {
      setForm((prev) => ({
        ...prev,
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        senderName: 'Servicio al Cliente - Esenttia',
      }));
    } else if (type === 'gmail') {
      setForm((prev) => ({
        ...prev,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
      }));
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/verify-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (err: unknown) {
      const error = err as Error;
      setTestResult({
        success: false,
        message: `Error de red o conexión: ${error.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuración del Servidor SMTP
              </h2>
              <p className="text-xs text-slate-500">
                Parámetros de conexión para envío de correos
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Presets */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Servidores Preconfigurados
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('office365')}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 text-slate-700 transition-colors text-center"
              >
                Office 365 (Esenttia)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('gmail')}
                className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 text-slate-700 transition-colors text-center"
              >
                Google Workspace / Gmail
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Servidor Host SMTP
              </label>
              <input
                type="text"
                required
                value={form.host}
                onChange={(e) => setForm({ ...form, host: e.target.value })}
                placeholder="smtp.office365.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Puerto
              </label>
              <input
                type="number"
                required
                value={form.port}
                onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
                placeholder="587"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Nombre Visible de Remitente
            </label>
            <input
              type="text"
              value={form.senderName}
              onChange={(e) => setForm({ ...form, senderName: e.target.value })}
              placeholder="Servicio al Cliente - Esenttia"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Usuario / Correo Remitente
            </label>
            <input
              type="email"
              required
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              placeholder="sac@esenttia.co"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">
                Contraseña o App Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-blue-900 hover:underline"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password || ''}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white font-mono"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Para Office 365 con MFA o Gmail, utiliza una "Contraseña de aplicación" generada en tu cuenta.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="smtp-secure"
              checked={form.secure}
              onChange={(e) => setForm({ ...form, secure: e.target.checked })}
              className="rounded border-slate-300 text-blue-900 focus:ring-blue-900"
            />
            <label htmlFor="smtp-secure" className="text-xs text-slate-700 cursor-pointer">
              Conexión SSL directa (Puerto 465). Dejar desmarcado para STARTTLS (Puerto 587).
            </label>
          </div>

          {/* Test connection result notice */}
          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{testResult.message}</div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !form.host || !form.user || !form.password}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Probando...' : 'Probar Conexión'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Guardar Configuración
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
