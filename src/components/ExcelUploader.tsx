import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Calendar,
  Truck,
  Check,
  Send,
  Crown,
} from 'lucide-react';
import { ColumnValidationResult, ProcessType } from '../types/mail';
import {
  REQUIRED_COLUMNS_FECHAS,
  REQUIRED_COLUMNS_PENDIENTES,
  REQUIRED_COLUMNS_DESPACHADOS,
  REQUIRED_COLUMNS_VIP,
  generateSampleExcelData,
} from '../utils/excelParser';

interface ExcelUploaderProps {
  onFileLoaded: (buffer: ArrayBuffer, fileName: string, forcedProcess?: ProcessType) => void;
  fileName: string | null;
  totalRawRows: number;
  validation: ColumnValidationResult | null;
  activeProcess: ProcessType;
  onChangeProcess: (process: ProcessType) => void;
  onLoadSample: (type: ProcessType) => void;
  onProceedToGroups: () => void;
  totalGroups: number;
}

export const ExcelUploader: React.FC<ExcelUploaderProps> = ({
  onFileLoaded,
  fileName,
  totalRawRows,
  validation,
  activeProcess,
  onChangeProcess,
  onLoadSample,
  onProceedToGroups,
  totalGroups,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (result instanceof ArrayBuffer) {
        onFileLoaded(result, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = (type: ProcessType) => {
    const buffer = generateSampleExcelData(type);
    const blob = new Blob([buffer.buffer as ArrayBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      type === 'vip'
        ? 'Plantilla_Envio_VIP_Esenttia.xlsx'
        : type === 'despachados'
        ? 'Plantilla_Envio_Despachado_Esenttia.xlsx'
        : type === 'pendientes'
        ? 'Plantilla_Envio_Pendientes_Esenttia.xlsx'
        : 'Plantilla_Envio_Fechas_Esenttia.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentRequiredColumns =
    activeProcess === 'vip'
      ? REQUIRED_COLUMNS_VIP
      : activeProcess === 'despachados'
      ? REQUIRED_COLUMNS_DESPACHADOS
      : activeProcess === 'pendientes'
      ? REQUIRED_COLUMNS_PENDIENTES
      : REQUIRED_COLUMNS_FECHAS;

  return (
    <div className="space-y-6">
      {/* Top Banner with Process Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
              Módulo de Carga Masiva
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Cargar archivo Excel con pedidos y clientes
            </h1>
            <p className="text-slate-600 text-xs mt-1.5 leading-relaxed">
              Sube el archivo Excel con las órdenes. La aplicación agrupará
              automáticamente los pedidos por cada <b>CLIENTE</b> usando la plantilla seleccionada.
            </p>
          </div>

          {/* Differentiated Template Selector Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => onChangeProcess('fechas')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeProcess === 'fechas'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-800" />
              <span>1. Fechas</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeProcess('pendientes')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeProcess === 'pendientes'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-600" />
              <span>2. Pendientes</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeProcess('despachados')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeProcess === 'despachados'
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Despachados</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeProcess('vip')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeProcess === 'vip'
                  ? 'bg-white text-purple-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-purple-700" />
              <span>4. Clientes VIP</span>
            </button>
          </div>
        </div>

        {/* Action Buttons row for the active template */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onLoadSample(activeProcess)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-semibold transition-colors border border-blue-200"
          >
            <Sparkles className="w-4 h-4 text-blue-700" />
            Cargar Datos Ejemplo ({activeProcess.toUpperCase()})
          </button>
          <button
            type="button"
            onClick={() => handleDownloadTemplate(activeProcess)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Descargar Plantilla ({activeProcess}.xlsx)
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-blue-600 bg-blue-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mb-4">
          <UploadCloud className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Arrastra tu archivo Excel aquí o haz clic para seleccionarlo
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Compatible con archivos de <b>Fechas</b>, <b>Pendientes</b>, <b>Despachados</b> o <b>VIP</b> (.xlsx, .xls, .csv)
        </p>

        {fileName && (
          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-800 border border-slate-200">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Archivo actual: <b>{fileName}</b></span>
            <span className="text-slate-400">·</span>
            <span>{totalRawRows} filas leídas</span>
            <span className="text-slate-400">·</span>
            <span className="uppercase text-[11px] font-bold text-blue-900">
              Plantilla: {activeProcess}
            </span>
          </div>
        )}
      </div>

      {/* Validation Checklist */}
      {validation && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
              )}
              <h3 className="text-sm font-semibold text-slate-900">
                {validation.isValid
                  ? `Estructura válida para Plantilla ${activeProcess.toUpperCase()} (${currentRequiredColumns.length}/${currentRequiredColumns.length} columnas)`
                  : `Faltan ${validation.missingColumns.length} columna(s) para la plantilla ${activeProcess.toUpperCase()}`}
              </h3>
            </div>

            {validation.isValid && totalGroups > 0 && (
              <button
                type="button"
                onClick={onProceedToGroups}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Revisar {totalGroups} Clientes Agrupados
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-xs text-slate-500 mb-4">
            Columnas requeridas para el proceso <b>{activeProcess.toUpperCase()}</b>:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {currentRequiredColumns.map((col) => {
              const isFound = validation.foundColumns.includes(col);
              return (
                <div
                  key={col}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium ${
                    isFound
                      ? 'bg-slate-50 border-slate-200 text-slate-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700 font-semibold'
                  }`}
                >
                  <span className="truncate" title={col}>
                    {col}
                  </span>
                  {isFound ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 ml-1" />
                  )}
                </div>
              );
            })}
          </div>

          {!validation.isValid && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center justify-between gap-3">
              <div>
                <b>Atención:</b> El archivo cargado no contiene las columnas necesarias para la
                plantilla activa ({activeProcess}).
                {validation.detectedProcessType !== activeProcess && (
                  <span>
                    {' '}
                    El archivo parece corresponder a la plantilla{' '}
                    <b>{validation.detectedProcessType.toUpperCase()}</b>.
                  </span>
                )}
              </div>
              {validation.detectedProcessType !== activeProcess && (
                <button
                  type="button"
                  onClick={() => onChangeProcess(validation.detectedProcessType)}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 rounded text-xs font-semibold whitespace-nowrap"
                >
                  Cambiar a {validation.detectedProcessType.toUpperCase()}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Differentiated summary banner */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
          Comparativa de las tres plantillas institucionales
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Calendar className="w-4 h-4 text-blue-900" />
              1. Fechas (5 Columnas)
            </div>
            <p>
              Informa la <b>nueva fecha de disponibilidad</b>. Incluye columna <b>FECHA</b> en Excel y tabla:
              OC, Pedido, Material, Cantidad, Fecha.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Truck className="w-4 h-4 text-amber-600" />
              2. Pendientes (4 Columnas)
            </div>
            <p>
              Informa materiales <b>remisionados pendientes de vehículo</b>. No lleva columna de fecha:
              OC, Pedido, Material, Cantidad.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Send className="w-4 h-4 text-emerald-600" />
              3. Despachados (5 Columnas)
            </div>
            <p>
              Informa el <b>despacho efectivo</b> del material. Incluye columna <b>FECHA DESPACHO</b> y tabla:
              OC, Pedido, Material, Cantidad, Fecha Despachado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
