import React from 'react';
import { ProcessType } from '../types/mail';
import {
  REQUIRED_COLUMNS_FECHAS,
  REQUIRED_COLUMNS_PENDIENTES,
  REQUIRED_COLUMNS_DESPACHADOS,
  REQUIRED_COLUMNS_VIP,
  generateSampleExcelData,
} from '../utils/excelParser';
import {
  TEMPLATE_FECHAS,
  TEMPLATE_PENDIENTES,
  TEMPLATE_DESPACHADOS,
  TEMPLATE_VIP,
} from '../utils/htmlGenerator';
import {
  Calendar,
  Truck,
  Download,
  Sparkles,
  Table,
  Check,
  Send,
  Crown,
} from 'lucide-react';

interface TemplateManagerProps {
  activeProcess: ProcessType;
  onSelectProcess: (type: ProcessType) => void;
  onLoadSampleForProcess: (type: ProcessType) => void;
  onOpenCustomizer: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  activeProcess,
  onSelectProcess,
  onLoadSampleForProcess,
  onOpenCustomizer,
}) => {
  const handleDownload = (type: ProcessType) => {
    const buffer = generateSampleExcelData(type);
    const blob = new Blob([buffer.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    if (type === 'vip') {
      a.download = 'Plantilla_Data_Envio_VIP_Act.xlsx';
    } else if (type === 'despachados') {
      a.download = 'Plantilla_Data_Envio_Despachado_Act.xlsx';
    } else if (type === 'pendientes') {
      a.download = 'Plantilla_Data_Envio_Pendientes_Act.xlsx';
    } else {
      a.download = 'Plantilla_Data_Envio_Fechas_Act.xlsx';
    }
    a.click();
    URL.revokeObjectURL(url);
  };

  const templatesList = [
    {
      id: 'fechas' as ProcessType,
      title: '1. Plantilla Fechas',
      icon: Calendar,
      file: 'Data_Envio_Fechas_Act.xlsx',
      reportFile: 'Reporte_Envios_Fechas.xlsx',
      badgeColor: 'bg-blue-900',
      description:
        'Notifica la nueva fecha estimada de disponibilidad de material/inventario para pedidos.',
      columns: REQUIRED_COLUMNS_FECHAS,
      tableFormat: '[OC] · [Pedido] · [Material] · [Cantidad] · [Fecha]',
      intro: TEMPLATE_FECHAS.introText,
    },
    {
      id: 'pendientes' as ProcessType,
      title: '2. Plantilla Pendientes',
      icon: Truck,
      file: 'Data_Envio_Pendientes_Act.xlsx',
      reportFile: 'Reporte_Envios_Pendiente.xlsx',
      badgeColor: 'bg-amber-600',
      description:
        'Notifica materiales que ya se encuentran remisionados pero pendientes de asignación de vehículo.',
      columns: REQUIRED_COLUMNS_PENDIENTES,
      tableFormat: '[OC] · [Pedido] · [Material] · [Cantidad]',
      intro: TEMPLATE_PENDIENTES.introText,
    },
    {
      id: 'despachados' as ProcessType,
      title: '3. Plantilla Despachados',
      icon: Send,
      file: 'Data_Envio_Despachado_Act.xlsx',
      reportFile: 'Reporte_Envios_Despachado.xlsx',
      badgeColor: 'bg-emerald-700',
      description:
        'Notifica que el material ya fue despachado efectivamente con su respectiva Fecha Despacho.',
      columns: REQUIRED_COLUMNS_DESPACHADOS,
      tableFormat: '[OC] · [Pedido] · [Material] · [Cantidad] · [Fecha Despachado]',
      intro: TEMPLATE_DESPACHADOS.introText,
    },
    {
      id: 'vip' as ProcessType,
      title: '4. Plantilla VIP',
      icon: Crown,
      file: 'Data_Envio_VIP_Act.xlsx',
      reportFile: 'Reporte_Envios_VIP.xlsx',
      badgeColor: 'bg-purple-900',
      description:
        'Estatus integral para clientes corporativos VIP con 11 columnas logísticas (Cartera, Inventario, Placa, Transportador, etc.).',
      columns: REQUIRED_COLUMNS_VIP,
      tableFormat: '[Fecha] · [Doc. Comercial] · [Posición] · [Descripción] · [Remisión] · [Cantidad] · [Cartera] · [Inventario] · [Envío] · [Placa] · [Transportador]',
      intro: 'Estimado/a [Contacto], Espero que se encuentre muy bien. Compartimos con usted la actualización del estatus de los pedidos...',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            Módulo de Gestión de Plantillas
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Plantillas Diferenciadas de Envío Esenttia
          </h1>
          <p className="text-slate-600 text-xs mt-1 max-w-2xl leading-relaxed">
            Esenttia cuenta con 4 flujos logísticos distintos. Selecciona la plantilla correspondiente
            para validar automáticamente las columnas exactas, generar la tabla adecuada y descargar el reporte oficial.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCustomizer}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-200 self-start md:self-auto"
        >
          Editar Textos y Firma
        </button>
      </div>

      {/* Grid of the 4 Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {templatesList.map((tpl) => {
          const Icon = tpl.icon;
          const isActive = activeProcess === tpl.id;

          return (
            <div
              key={tpl.id}
              className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col ${
                isActive
                  ? 'border-blue-900 ring-2 ring-blue-900/10 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Card Top */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 ${
                        tpl.id === 'vip'
                          ? 'bg-purple-900'
                          : tpl.id === 'despachados'
                          ? 'bg-emerald-700'
                          : tpl.id === 'pendientes'
                          ? 'bg-amber-600'
                          : 'bg-blue-900'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900 truncate">{tpl.title}</h3>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">
                        {tpl.file}
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-0.5 shrink-0">
                      <Check className="w-3 h-3" /> Activa
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectProcess(tpl.id)}
                      className="text-[10px] font-semibold text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 hover:bg-slate-50 transition-colors shrink-0"
                    >
                      Activar
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed min-h-[34px]">
                  {tpl.description}
                </p>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3 flex-1 text-xs">
                <div>
                  <div className="font-semibold text-slate-700 mb-1 flex items-center gap-1 text-[11px]">
                    <Table className="w-3 h-3 text-blue-900" />
                    Columnas ({tpl.columns.length}):
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {tpl.columns.map((col) => (
                      <span
                        key={col}
                        className={`text-[9px] px-1 py-0.5 rounded font-mono ${
                          col.includes('FECHA') || col.includes('CARTERA') || col.includes('PLACA')
                            ? 'bg-blue-100 text-blue-900 font-bold border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-0.5 text-[11px]">
                    Estructura Tabla:
                  </span>
                  <div className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 font-mono text-[9px] leading-tight line-clamp-2">
                    {tpl.tableFormat}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-0.5 text-[11px]">
                    Reporte Exportable:
                  </span>
                  <span className="text-slate-600 font-mono text-[10px] block truncate">
                    {tpl.reportFile}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleDownload(tpl.id)}
                  className="flex items-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-medium border border-slate-200 transition-colors"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  Descargar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectProcess(tpl.id);
                    onLoadSampleForProcess(tpl.id);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-[10px] font-semibold transition-colors shadow-xs"
                >
                  <Sparkles className="w-3 h-3 text-blue-200" />
                  Ejemplo
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
