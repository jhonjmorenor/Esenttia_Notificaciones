/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ClientGroup,
  ColumnValidationResult,
  SmtpConfig,
  EmailTemplateConfig,
  SendReportItem,
  ProcessType,
} from './types/mail';
import {
  parseExcelFile,
  generateSampleExcelData,
} from './utils/excelParser';
import {
  TEMPLATE_FECHAS,
  TEMPLATE_PENDIENTES,
  TEMPLATE_DESPACHADOS,
  TEMPLATE_VIP,
  generateEmailHtml,
} from './utils/htmlGenerator';
import { DEFAULT_ESENTTIA_BANNER } from './assets/bannerData';

import { Header } from './components/Header';
import { ExcelUploader } from './components/ExcelUploader';
import { GroupingPreview } from './components/GroupingPreview';
import { TemplateManager } from './components/TemplateManager';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { SmtpConfigModal } from './components/SmtpConfigModal';
import { TemplateCustomizerModal } from './components/TemplateCustomizerModal';
import { SendingProgressModal, SendingLogEntry } from './components/SendingProgressModal';
import { ReportViewer } from './components/ReportViewer';

const DEFAULT_SMTP: SmtpConfig = {
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  user: 'sac@esenttia.co',
  password: 'Propilco2026+++',
  senderName: 'Servicio al Cliente - Esenttia',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'upload' | 'groups' | 'templates' | 'reports'>('upload');
  const [activeProcess, setActiveProcess] = useState<ProcessType>('fechas');

  const [fileName, setFileName] = useState<string | null>(null);
  const [totalRawRows, setTotalRawRows] = useState<number>(0);
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [validation, setValidation] = useState<ColumnValidationResult | null>(null);

  // Modals & previews
  const [selectedGroupForPreview, setSelectedGroupForPreview] = useState<ClientGroup | null>(null);
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // SMTP config
  const [smtpConfig, setSmtpConfig] = useState<SmtpConfig>(() => {
    try {
      const saved = localStorage.getItem('automail_smtp_config');
      return saved ? JSON.parse(saved) : DEFAULT_SMTP;
    } catch {
      return DEFAULT_SMTP;
    }
  });

  // Template configs dictionary for all 4 processes
  const [templates, setTemplates] = useState<Record<ProcessType, EmailTemplateConfig>>(() => {
    try {
      const saved = localStorage.getItem('automail_templates_dict');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.despachados) {
          parsed.despachados = { ...TEMPLATE_DESPACHADOS, bannerImageBase64: DEFAULT_ESENTTIA_BANNER };
        }
        if (!parsed.vip) {
          parsed.vip = { ...TEMPLATE_VIP, bannerImageBase64: DEFAULT_ESENTTIA_BANNER };
        }
        return parsed;
      }
    } catch {
      // fallback
    }
    return {
      fechas: { ...TEMPLATE_FECHAS, bannerImageBase64: DEFAULT_ESENTTIA_BANNER },
      pendientes: { ...TEMPLATE_PENDIENTES, bannerImageBase64: DEFAULT_ESENTTIA_BANNER },
      despachados: { ...TEMPLATE_DESPACHADOS, bannerImageBase64: DEFAULT_ESENTTIA_BANNER },
      vip: { ...TEMPLATE_VIP, bannerImageBase64: DEFAULT_ESENTTIA_BANNER },
    };
  });

  const activeTemplateConfig = templates[activeProcess] || TEMPLATE_FECHAS;

  // Test mode: default to true for safety
  const [isTestMode, setIsTestMode] = useState<boolean>(true);

  // Reports
  const [reports, setReports] = useState<SendReportItem[]>(() => {
    try {
      const saved = localStorage.getItem('automail_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Batch execution states
  const [isSendingModalOpen, setIsSendingModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentClient, setCurrentClient] = useState('');
  const [logs, setLogs] = useState<SendingLogEntry[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const stopSignalRef = useRef(false);
  const pauseSignalRef = useRef(false);

  // Save configs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('automail_smtp_config', JSON.stringify(smtpConfig));
    } catch (e) {
      console.warn('Could not save smtp to localStorage', e);
    }
  }, [smtpConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('automail_templates_dict', JSON.stringify(templates));
    } catch (e) {
      console.warn('Could not save templates to localStorage', e);
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem('automail_reports', JSON.stringify(reports));
    } catch (e) {
      console.warn('Could not save reports to localStorage', e);
    }
  }, [reports]);

  // Handle uploaded file
  const handleFileLoaded = (buffer: ArrayBuffer, name: string, forcedProcess?: ProcessType) => {
    try {
      const parsed = parseExcelFile(buffer, forcedProcess);
      setGroups(parsed.groups);
      setValidation(parsed.validation);
      setTotalRawRows(parsed.totalRawRows);
      setFileName(name);

      if (parsed.processType !== activeProcess) {
        setActiveProcess(parsed.processType);
      }

      if (parsed.validation.isValid && parsed.groups.length > 0) {
        setCurrentTab('groups');
      }
    } catch (err) {
      console.error('Error parsing excel:', err);
    }
  };

  // Load sample dataset for either process
  const handleLoadSample = (type: ProcessType = activeProcess) => {
    setActiveProcess(type);
    const sampleBuffer = generateSampleExcelData(type);
    const sampleName =
      type === 'vip'
        ? 'Data_Envio_VIP_Act.xlsx'
        : type === 'despachados'
        ? 'Data_Envio_Despachado_Act.xlsx'
        : type === 'pendientes'
        ? 'Data_Envio_Pendientes_Act.xlsx'
        : 'Data_Envio_Fechas_Act.xlsx';
    handleFileLoaded(sampleBuffer.buffer as ArrayBuffer, sampleName, type);
  };

  // Preload initial sample on first launch if empty
  useEffect(() => {
    if (groups.length === 0) {
      handleLoadSample('fechas');
    }
  }, []);

  // Handle process change from UI
  const handleSelectProcess = (newProcess: ProcessType) => {
    setActiveProcess(newProcess);
  };

  // Single test email send handler
  const handleSendSingleTest = async (
    group: ClientGroup,
    targetEmail: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const templateToUse = templates[group.processType || activeProcess] || TEMPLATE_FECHAS;
      const htmlBody = generateEmailHtml(group, templateToUse, 'smtp');

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtp: smtpConfig,
          to: [targetEmail],
          cc: [],
          subject: `[PRUEBA] ${group.asunto}`,
          html: htmlBody,
          bannerBase64: templateToUse.bannerImageBase64 || DEFAULT_ESENTTIA_BANNER,
          isTestMode: false,
        }),
      });

      const data = await response.json();
      return data;
    } catch (err: unknown) {
      const error = err as Error;
      return {
        success: false,
        message: error.message || 'Error de comunicación con el servidor.',
      };
    }
  };

  // Start Batch Execution
  const handleStartBatch = async () => {
    if (groups.length === 0 || isProcessing) return;

    setIsSendingModalOpen(true);
    setIsProcessing(true);
    setIsPaused(false);
    setIsFinished(false);
    setCurrentIndex(0);
    setCurrentClient('');
    stopSignalRef.current = false;
    pauseSignalRef.current = false;

    const newLogs: SendingLogEntry[] = [];
    const executionReports: SendReportItem[] = [];

    const addLog = (
      client: string,
      type: 'info' | 'success' | 'warn' | 'error',
      message: string
    ) => {
      const time = new Date().toLocaleTimeString('es-CO');
      const entry: SendingLogEntry = { timestamp: time, client, type, message };
      newLogs.push(entry);
      setLogs([...newLogs]);
    };

    addLog(
      'Sistema',
      'info',
      `Iniciando lote de ${groups.length} clientes · Plantilla: [${activeProcess.toUpperCase()}] · ${
        isTestMode ? 'MODO PRUEBA' : 'MODO REAL (SMTP)'
      }`
    );

    const updatedGroups = [...groups];

    for (let i = 0; i < updatedGroups.length; i++) {
      if (stopSignalRef.current) {
        addLog('Sistema', 'warn', 'Proceso cancelado por el usuario.');
        break;
      }

      while (pauseSignalRef.current && !stopSignalRef.current) {
        await new Promise((r) => setTimeout(r, 500));
      }

      const grp = updatedGroups[i];
      setCurrentIndex(i + 1);
      setCurrentClient(grp.cliente);

      const uniqueOrdersCount = new Set(grp.items.map((it) => it.pedido)).size;
      const totalFilas = grp.items.length;
      const totalDocumentos = new Set(grp.items.map((it) => it.pedido).filter(Boolean)).size;
      const totalPosiciones = new Set(grp.items.map((it) => `${it.pedido}-${it.posicion || ''}`).filter(Boolean)).size;
      const nowFormatted = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // Validation check for recipient email
      if (!grp.hasValidEmail || grp.to.length === 0) {
        addLog(
          grp.cliente,
          'warn',
          `Cliente sin correo de notificación. Total pedidos: ${uniqueOrdersCount}. Omitiendo.`
        );

        grp.status = 'SIN CORREO';
        grp.errorDetails = 'Cliente sin correo de notificación';

        executionReports.push({
          CLIENTE: grp.cliente,
          CORREOS: '',
          CC: '',
          ASUNTO: '',
          TOTAL_PEDIDOS: uniqueOrdersCount,
          TOTAL_FILAS: totalFilas,
          TOTAL_DOCUMENTOS: totalDocumentos,
          TOTAL_POSICIONES: totalPosiciones,
          FECHA_ENVIO: nowFormatted,
          ESTADO: 'SIN CORREO',
          ERROR: 'Cliente sin correo de notificación',
          PROCESO: grp.processType || activeProcess,
        });

        setGroups([...updatedGroups]);
        continue;
      }

      // Prepare HTML for the specific template
      const templateToUse = templates[grp.processType || activeProcess] || TEMPLATE_FECHAS;
      const htmlBody = generateEmailHtml(grp, templateToUse, 'smtp');

      if (isTestMode) {
        addLog(
          grp.cliente,
          'info',
          `[SIMULACIÓN ${(grp.processType || activeProcess).toUpperCase()}] Enviar a ${grp.to.join(', ')} | CC: ${grp.cc.join(', ') || 'ninguno'} | Asunto: ${grp.asunto}`
        );

        await new Promise((r) => setTimeout(r, 800));

        grp.status = 'PRUEBA';
        grp.sentAt = nowFormatted;

        executionReports.push({
          CLIENTE: grp.cliente,
          CORREOS: grp.to.join(', '),
          CC: grp.cc.join(', '),
          ASUNTO: grp.asunto,
          TOTAL_PEDIDOS: uniqueOrdersCount,
          TOTAL_FILAS: totalFilas,
          TOTAL_DOCUMENTOS: totalDocumentos,
          TOTAL_POSICIONES: totalPosiciones,
          FECHA_ENVIO: nowFormatted,
          ESTADO: 'PRUEBA',
          ERROR: '',
          PROCESO: grp.processType || activeProcess,
        });

        addLog(grp.cliente, 'success', `Simulación de correo completada exitosamente.`);
        setGroups([...updatedGroups]);
      } else {
        addLog(
          grp.cliente,
          'info',
          `Conectando a SMTP para ${grp.to.join(', ')}...`
        );

        try {
          const resp = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              smtp: smtpConfig,
              to: grp.to,
              cc: grp.cc,
              subject: grp.asunto,
              html: htmlBody,
              bannerBase64: templateToUse.bannerImageBase64 || DEFAULT_ESENTTIA_BANNER,
              isTestMode: false,
            }),
          });

          const data = await resp.json();

          if (data.success) {
            grp.status = 'ENVIADO';
            grp.sentAt = nowFormatted;

            executionReports.push({
              CLIENTE: grp.cliente,
              CORREOS: grp.to.join(', '),
              CC: grp.cc.join(', '),
              ASUNTO: grp.asunto,
              TOTAL_PEDIDOS: uniqueOrdersCount,
              TOTAL_FILAS: totalFilas,
              TOTAL_DOCUMENTOS: totalDocumentos,
              TOTAL_POSICIONES: totalPosiciones,
              FECHA_ENVIO: nowFormatted,
              ESTADO: 'ENVIADO',
              ERROR: '',
              PROCESO: grp.processType || activeProcess,
            });

            addLog(grp.cliente, 'success', `Enviado satisfactoriamente.`);
          } else {
            throw new Error(data.message || 'Error en servidor de correo');
          }
        } catch (err: unknown) {
          const error = err as Error;
          grp.status = 'ERROR';
          grp.errorDetails = error.message;

          executionReports.push({
            CLIENTE: grp.cliente,
            CORREOS: grp.to.join(', '),
            CC: grp.cc.join(', '),
            ASUNTO: grp.asunto,
            TOTAL_PEDIDOS: uniqueOrdersCount,
            TOTAL_FILAS: totalFilas,
            TOTAL_DOCUMENTOS: totalDocumentos,
            TOTAL_POSICIONES: totalPosiciones,
            FECHA_ENVIO: nowFormatted,
            ESTADO: 'ERROR',
            ERROR: error.message,
            PROCESO: grp.processType || activeProcess,
          });

          addLog(grp.cliente, 'error', `Fallo al enviar: ${error.message}`);
        }

        setGroups([...updatedGroups]);
      }

      // Security pause between sends (2 to 4 seconds, matching python time.sleep(random.uniform(2, 4)))
      if (i < updatedGroups.length - 1 && !stopSignalRef.current) {
        const sleepMs = isTestMode
          ? 600
          : Math.floor(Math.random() * (4000 - 2000 + 1) + 2000);
        addLog('Seguridad', 'info', `Esperando ${(sleepMs / 1000).toFixed(1)}s antes del siguiente despacho...`);
        await new Promise((r) => setTimeout(r, sleepMs));
      }
    }

    addLog('Sistema', 'success', `🎯 Lote completado. ${executionReports.length} registros consolidados.`);
    setIsFinished(true);
    setIsProcessing(false);

    setReports((prev) => [...executionReports, ...prev]);
  };

  const handlePauseResume = () => {
    pauseSignalRef.current = !pauseSignalRef.current;
    setIsPaused(pauseSignalRef.current);
  };

  const handleStop = () => {
    stopSignalRef.current = true;
    pauseSignalRef.current = false;
    setIsPaused(false);
    setIsProcessing(false);
    setIsFinished(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar with Template switcher */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeProcess={activeProcess}
        onChangeProcess={handleSelectProcess}
        isTestMode={isTestMode}
        setIsTestMode={setIsTestMode}
        onOpenSmtpModal={() => setIsSmtpModalOpen(true)}
        onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
        totalGroups={groups.length}
        onStartBatch={handleStartBatch}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'upload' && (
          <ExcelUploader
            onFileLoaded={handleFileLoaded}
            fileName={fileName}
            totalRawRows={totalRawRows}
            validation={validation}
            activeProcess={activeProcess}
            onChangeProcess={handleSelectProcess}
            onLoadSample={handleLoadSample}
            onProceedToGroups={() => setCurrentTab('groups')}
            totalGroups={groups.length}
          />
        )}

        {currentTab === 'groups' && (
          <GroupingPreview
            groups={groups}
            totalRawRows={totalRawRows}
            onPreviewGroup={(grp) => setSelectedGroupForPreview(grp)}
            onStartBatch={handleStartBatch}
            isProcessing={isProcessing}
            isTestMode={isTestMode}
          />
        )}

        {currentTab === 'templates' && (
          <TemplateManager
            activeProcess={activeProcess}
            onSelectProcess={handleSelectProcess}
            onLoadSampleForProcess={handleLoadSample}
            onOpenCustomizer={() => setIsTemplateModalOpen(true)}
          />
        )}

        {currentTab === 'reports' && (
          <ReportViewer
            reports={reports}
            activeProcess={activeProcess}
            onClearReports={() => {
              if (window.confirm('¿Deseas vaciar el historial de reportes?')) {
                setReports([]);
              }
            }}
            onGoToUpload={() => setCurrentTab('upload')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <b>AutoMail Express</b> · Consolidación y Despacho Automatizado (Fechas y Pendientes)
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTab('templates')}
              className="hover:text-slate-800 transition-colors"
            >
              Módulo de Plantillas
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Personalizar Textos
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSmtpModalOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Configuración SMTP
            </button>
            <span aria-hidden="true">·</span>
            <span>Versión 2026</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <EmailPreviewModal
        group={selectedGroupForPreview}
        onClose={() => setSelectedGroupForPreview(null)}
        config={selectedGroupForPreview ? templates[selectedGroupForPreview.processType || activeProcess] : activeTemplateConfig}
        smtpConfig={smtpConfig}
        onSendSingleTest={handleSendSingleTest}
      />

      <SmtpConfigModal
        config={smtpConfig}
        isOpen={isSmtpModalOpen}
        onClose={() => setIsSmtpModalOpen(false)}
        onSave={(newCfg) => setSmtpConfig(newCfg)}
      />

      <TemplateCustomizerModal
        config={activeTemplateConfig}
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={(newCfg) => {
          setTemplates((prev) => ({
            ...prev,
            [activeProcess]: newCfg,
          }));
        }}
      />

      <SendingProgressModal
        isOpen={isSendingModalOpen}
        isProcessing={isProcessing}
        isPaused={isPaused}
        onPauseResume={handlePauseResume}
        onStop={handleStop}
        currentIndex={currentIndex}
        totalCount={groups.length}
        currentClient={currentClient}
        logs={logs}
        reports={reports}
        isFinished={isFinished}
        onClose={() => setIsSendingModalOpen(false)}
        onViewReportsTab={() => {
          setIsSendingModalOpen(false);
          setCurrentTab('reports');
        }}
        isTestMode={isTestMode}
        activeProcess={activeProcess}
      />
    </div>
  );
}
