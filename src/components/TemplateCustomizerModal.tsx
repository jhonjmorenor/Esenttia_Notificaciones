import React, { useState } from 'react';
import { EmailTemplateConfig } from '../types/mail';
import {
  TEMPLATE_FECHAS,
  TEMPLATE_PENDIENTES,
  TEMPLATE_DESPACHADOS,
  TEMPLATE_VIP,
} from '../utils/htmlGenerator';
import { DEFAULT_ESENTTIA_BANNER } from '../assets/bannerData';
import { X, RotateCcw, Palette, Image as ImageIcon, Check, RefreshCw } from 'lucide-react';

interface TemplateCustomizerModalProps {
  config: EmailTemplateConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: EmailTemplateConfig) => void;
}

export const TemplateCustomizerModal: React.FC<TemplateCustomizerModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<EmailTemplateConfig>({
    ...config,
    bannerImageBase64: config.bannerImageBase64 || DEFAULT_ESENTTIA_BANNER,
  });

  const handleReset = () => {
    const defaultPreset =
      form.processType === 'vip'
        ? TEMPLATE_VIP
        : form.processType === 'despachados'
        ? TEMPLATE_DESPACHADOS
        : form.processType === 'pendientes'
        ? TEMPLATE_PENDIENTES
        : TEMPLATE_FECHAS;
    setForm({ ...defaultPreset, bannerImageBase64: form.bannerImageBase64 || DEFAULT_ESENTTIA_BANNER });
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (typeof uploadEvent.target?.result === 'string') {
          setForm({ ...form, bannerImageBase64: uploadEvent.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Personalización de Plantilla de Correo
              </h2>
              <p className="text-xs text-slate-500">
                Ajusta el texto institucional, colores y canales de atención
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Saludo Inicial
              </label>
              <input
                type="text"
                value={form.greetingPrefix}
                onChange={(e) => setForm({ ...form, greetingPrefix: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Color de Encabezado de Tabla
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.tableHeaderBg}
                  onChange={(e) => setForm({ ...form, tableHeaderBg: e.target.value })}
                  className="w-9 h-9 p-1 rounded-lg border border-slate-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.tableHeaderBg}
                  onChange={(e) => setForm({ ...form, tableHeaderBg: e.target.value })}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Texto Introductorio
            </label>
            <textarea
              rows={2}
              value={form.introText}
              onChange={(e) => setForm({ ...form, introText: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Subtítulo previo a la Tabla (opcional, ej: Pedido(s) despachado(s):)
            </label>
            <input
              type="text"
              value={form.subtitleBeforeTable || ''}
              onChange={(e) => setForm({ ...form, subtitleBeforeTable: e.target.value })}
              placeholder="Pedido(s) despachado(s):"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Cláusula Logística y Despacho
            </label>
            <textarea
              rows={2}
              value={form.logisticsDisclaimer}
              onChange={(e) => setForm({ ...form, logisticsDisclaimer: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Texto de Cierre
            </label>
            <input
              type="text"
              value={form.closingText}
              onChange={(e) => setForm({ ...form, closingText: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          {/* Canales de atención */}
          <div className="pt-3 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Canales de Atención al Cliente (Firma)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  WhatsApp Business
                </label>
                <input
                  type="text"
                  value={form.supportChannels.whatsapp}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      supportChannels: { ...form.supportChannels, whatsapp: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Sitio Web
                </label>
                <input
                  type="text"
                  value={form.supportChannels.website}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      supportChannels: { ...form.supportChannels, website: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Línea Telefónica
                </label>
                <input
                  type="text"
                  value={form.supportChannels.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      supportChannels: { ...form.supportChannels, phone: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-600 block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={form.supportChannels.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      supportChannels: { ...form.supportChannels, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Banner Image Customizer */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
                Imagen Inferior del Correo (Firma / Imagen_final.png)
              </h3>
              <span className="text-[11px] text-slate-500">
                Se adjunta como <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">cid:logo_esenttia</code>
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Esta es la imagen institucional que se ubica en el pie de página de los correos después del bloque de atención. Por defecto utiliza la firma oficial de Esenttia.
            </p>
            {form.bannerImageBase64 ? (
              <div className="space-y-3">
                <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 inline-block max-w-full">
                  <img
                    src={form.bannerImageBase64}
                    alt="Firma inferior preview"
                    className="max-h-36 max-w-full rounded-lg border border-slate-200 object-contain bg-white"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold bg-blue-900 hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors">
                    Subir Nueva Imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bannerImageBase64: DEFAULT_ESENTTIA_BANNER })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-500" />
                    Restablecer Firma Oficial Esenttia
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bannerImageBase64: undefined })}
                    className="text-xs text-rose-600 hover:underline ml-2"
                  >
                    Quitar imagen
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer bg-slate-50 transition-colors">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">
                    Subir imagen de pie de página (.png, .jpg)
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Se mostrará en la parte inferior de cada correo agrupado
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, bannerImageBase64: DEFAULT_ESENTTIA_BANNER })}
                  className="text-xs text-blue-900 font-medium hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Cargar imagen institucional por defecto de Esenttia
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Valores por Defecto
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Guardar Plantilla
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
