import React from 'react';
import { Mail, Settings, FileSpreadsheet, RefreshCw, Send, Calendar, Truck, Layers, Crown } from 'lucide-react';
import { ProcessType } from '../types/mail';

interface HeaderProps {
  currentTab: 'upload' | 'groups' | 'templates' | 'reports';
  setCurrentTab: (tab: 'upload' | 'groups' | 'templates' | 'reports') => void;
  activeProcess: ProcessType;
  onChangeProcess: (process: ProcessType) => void;
  isTestMode: boolean;
  setIsTestMode: (val: boolean) => void;
  onOpenSmtpModal: () => void;
  onOpenTemplateModal: () => void;
  totalGroups: number;
  onStartBatch: () => void;
  isProcessing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  activeProcess,
  onChangeProcess,
  isTestMode,
  setIsTestMode,
  onOpenSmtpModal,
  onOpenTemplateModal,
  totalGroups,
  onStartBatch,
  isProcessing,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5 text-blue-200" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                AutoMail Express
              </span>
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                Consolidador de Envíos · Esenttia
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
            <button
              onClick={() => setCurrentTab('upload')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-xs uppercase tracking-wider font-semibold ${
                currentTab === 'upload'
                  ? 'border-blue-900 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              1. Cargar Archivo
            </button>
            <button
              onClick={() => setCurrentTab('groups')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                currentTab === 'groups'
                  ? 'border-blue-900 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              2. Grupos ({totalGroups})
            </button>
            <button
              onClick={() => setCurrentTab('templates')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                currentTab === 'templates'
                  ? 'border-blue-900 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Plantillas
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-2 border-b-2 text-xs uppercase tracking-wider font-semibold ${
                currentTab === 'reports'
                  ? 'border-blue-900 text-blue-950 font-bold'
                  : 'border-transparent text-slate-500'
              }`}
            >
              3. Reportes
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Process Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => onChangeProcess('fechas')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeProcess === 'fechas'
                    ? 'bg-white text-blue-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Plantilla Fechas de Disponibilidad"
              >
                <Calendar className="w-3 h-3 text-blue-700" />
                Fechas
              </button>
              <button
                type="button"
                onClick={() => onChangeProcess('pendientes')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeProcess === 'pendientes'
                    ? 'bg-white text-blue-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Plantilla Pendientes de Vehículo"
              >
                <Truck className="w-3 h-3 text-amber-600" />
                Pendientes
              </button>
              <button
                type="button"
                onClick={() => onChangeProcess('despachados')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeProcess === 'despachados'
                    ? 'bg-white text-blue-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Plantilla Pedidos Despachados"
              >
                <Send className="w-3 h-3 text-emerald-600" />
                Despachados
              </button>
              <button
                type="button"
                onClick={() => onChangeProcess('vip')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeProcess === 'vip'
                    ? 'bg-white text-purple-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Plantilla Clientes VIP"
              >
                <Crown className="w-3 h-3 text-purple-700" />
                VIP
              </button>
            </div>

            {/* Test vs Real mode switch */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setIsTestMode(true)}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                  isTestMode
                    ? 'bg-amber-100 text-amber-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Modo Prueba: Simula envíos sin despachar correos reales"
              >
                Prueba
              </button>
              <button
                type="button"
                onClick={() => setIsTestMode(false)}
                className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                  !isTestMode
                    ? 'bg-blue-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Modo Real: Despacha correos mediante servidor SMTP"
              >
                Real
              </button>
            </div>

            <button
              onClick={onOpenTemplateModal}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Personalizar textos de plantilla y firma"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSmtpModal}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Configuración de Servidor SMTP"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onStartBatch}
              disabled={totalGroups === 0 || isProcessing}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 shadow-xs ${
                totalGroups === 0 || isProcessing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isTestMode
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-900 hover:bg-blue-800 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {isTestMode ? 'Simular' : 'Enviar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
