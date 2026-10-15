import React, { useState } from 'react';
import {
  ClientGroup,
  OrderItem,
  EmailTemplateConfig,
} from '../types/mail';
import {
  Search,
  Eye,
  ChevronDown,
  ChevronRight,
  Mail,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Building,
  Package,
} from 'lucide-react';

interface GroupingPreviewProps {
  groups: ClientGroup[];
  totalRawRows: number;
  onPreviewGroup: (group: ClientGroup) => void;
  onStartBatch: () => void;
  isProcessing: boolean;
  isTestMode: boolean;
}

export const GroupingPreview: React.FC<GroupingPreviewProps> = ({
  groups,
  totalRawRows,
  onPreviewGroup,
  onStartBatch,
  isProcessing,
  isTestMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'NO_EMAIL' | 'SENT'>('ALL');
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const totalValid = groups.filter((g) => g.hasValidEmail).length;
  const totalMissing = groups.filter((g) => !g.hasValidEmail).length;
  const totalSent = groups.filter((g) => g.status === 'ENVIADO' || g.status === 'PRUEBA').length;

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.items.some((item) =>
        item.pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.refCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (!matchesSearch) return false;

    if (statusFilter === 'VALID') return group.hasValidEmail;
    if (statusFilter === 'NO_EMAIL') return !group.hasValidEmail;
    if (statusFilter === 'SENT') return group.status === 'ENVIADO' || group.status === 'PRUEBA';

    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedGroupId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Líneas de Pedido (Excel)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono-tabular">
            {totalRawRows}
          </div>
          <div className="text-xs text-slate-400 mt-1">Registros procesados</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Clientes Agrupados</div>
          <div className="text-2xl font-bold text-blue-900 mt-1 font-mono-tabular">
            {groups.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">Consolidados únicos</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Listos para Enviar</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono-tabular">
            {totalValid}
          </div>
          <div className="text-xs text-slate-400 mt-1">Con correo de notificación</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Sin Correo Válido</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono-tabular">
            {totalMissing}
          </div>
          <div className="text-xs text-slate-400 mt-1">Se reportan como excepción</div>
        </div>
      </div>

      {/* Control Bar: Search & Interactive Filter Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, pedido, OC o descripción..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todos ({groups.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('VALID')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'VALID'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Con Correo ({totalValid})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('NO_EMAIL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              statusFilter === 'NO_EMAIL'
                ? 'bg-white text-amber-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sin Correo ({totalMissing})
          </button>
          {totalSent > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('SENT')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                statusFilter === 'SENT'
                  ? 'bg-white text-blue-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enviados ({totalSent})
            </button>
          )}
        </div>

        {/* Start Button */}
        <button
          type="button"
          onClick={onStartBatch}
          disabled={totalValid === 0 || isProcessing}
          className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors shadow-xs ${
            totalValid === 0 || isProcessing
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isTestMode
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-blue-900 hover:bg-blue-800 text-white'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          {isTestMode ? `Simular ${totalValid} Envíos` : `Despachar ${totalValid} Correos`}
        </button>
      </div>

      {/* Client Groups List */}
      <div className="space-y-3">
        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Building className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No se encontraron clientes</h3>
            <p className="text-xs text-slate-500 mt-1">
              Prueba cambiando los filtros o el término de búsqueda.
            </p>
          </div>
        ) : (
          filteredGroups.map((group) => {
            const isExpanded = expandedGroupId === group.id;

            return (
              <div
                key={group.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-colors"
              >
                {/* Main Client Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(group.id)}
                      className="mt-0.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {group.cliente}
                        </h3>

                        {/* Status text cleanly formatted without pill box */}
                        <div className="flex items-center gap-1.5 text-xs">
                          {group.status === 'ENVIADO' && (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Enviado
                            </span>
                          )}
                          {group.status === 'PRUEBA' && (
                            <span className="text-blue-700 font-medium flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Simulado
                            </span>
                          )}
                          {group.status === 'SIN CORREO' && (
                            <span className="text-amber-700 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Sin correo
                            </span>
                          )}
                          {group.status === 'ERROR' && (
                            <span className="text-rose-700 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Error en envío
                            </span>
                          )}
                          {group.status === 'PENDIENTE' && (
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Pendiente
                            </span>
                          )}
                          <span className="text-slate-300" aria-hidden="true">·</span>
                          <span className="text-slate-500 font-mono-tabular">
                            {group.items.length} {group.items.length === 1 ? 'pedido' : 'pedidos'}
                          </span>
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <div className="mt-2 text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div>
                          <span className="text-slate-400 font-medium mr-1">Para:</span>
                          {group.to.length > 0 ? (
                            <span className="text-slate-800 font-mono text-[11px]">
                              {group.to.join(', ')}
                            </span>
                          ) : (
                            <span className="text-amber-700 italic">No especificado</span>
                          )}
                        </div>

                        {group.cc.length > 0 && (
                          <div>
                            <span className="text-slate-400 font-medium mr-1">CC:</span>
                            <span className="text-slate-600 font-mono text-[11px]">
                              {group.cc.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-slate-500 truncate">
                        <span className="text-slate-400 font-medium mr-1">Asunto:</span>
                        <span>{group.asunto}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this group */}
                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => onPreviewGroup(group)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      Vista Previa Correo
                    </button>
                  </div>
                </div>

                {/* Expanded items table */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-900" />
                      Líneas consolidadas para este correo ({group.items.length})
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                      {group.processType === 'vip' ? (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-purple-900 text-white border-b border-purple-950 text-center">
                              <th className="py-2 px-2 font-semibold">Fecha Entrega</th>
                              <th className="py-2 px-2 font-semibold">Doc. Comercial</th>
                              <th className="py-2 px-2 font-semibold">Posición (SD)</th>
                              <th className="py-2 px-2 font-semibold text-left">Descripción Posición</th>
                              <th className="py-2 px-2 font-semibold">Remisión</th>
                              <th className="py-2 px-2 font-semibold">Cantidad</th>
                              <th className="py-2 px-2 font-semibold">Cartera</th>
                              <th className="py-2 px-2 font-semibold">Inventario</th>
                              <th className="py-2 px-2 font-semibold">Envío</th>
                              <th className="py-2 px-2 font-semibold">Placa</th>
                              <th className="py-2 px-2 font-semibold text-left">Transportador</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-center">
                            {group.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-purple-50/50">
                                <td className="py-2 px-2 font-mono-tabular text-slate-700">{item.fecha || '—'}</td>
                                <td className="py-2 px-2 font-mono font-medium text-slate-900">{item.pedido}</td>
                                <td className="py-2 px-2 font-mono text-slate-700">{item.posicion || '—'}</td>
                                <td className="py-2 px-2 text-left text-slate-800 max-w-xs truncate" title={item.descripcion}>
                                  {item.descripcion}
                                </td>
                                <td className="py-2 px-2 font-mono text-slate-700">{item.remision || '—'}</td>
                                <td className="py-2 px-2 font-mono-tabular font-bold text-slate-900">{item.cantidad}</td>
                                <td className="py-2 px-2 text-slate-700">{item.estadoCartera || '—'}</td>
                                <td className="py-2 px-2 text-slate-700">{item.estadoInventario || '—'}</td>
                                <td className="py-2 px-2 text-slate-700">{item.estadoEnvio || '—'}</td>
                                <td className="py-2 px-2 font-mono text-slate-700">{item.placa || '—'}</td>
                                <td className="py-2 px-2 text-left text-slate-800 truncate max-w-xs">{item.transportador || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                              <th className="py-2 px-3 font-semibold">OC (Ref. Cliente)</th>
                              <th className="py-2 px-3 font-semibold">Pedido</th>
                              <th className="py-2 px-3 font-semibold">Descripción de Material</th>
                              <th className="py-2 px-3 font-semibold text-right">Cantidad</th>
                              {group.processType !== 'pendientes' && (
                                <th className="py-2 px-3 font-semibold text-center">
                                  {group.processType === 'despachados' ? 'Fecha Despachado' : 'Fecha Disponibilidad'}
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-medium text-slate-800">{item.refCliente || '—'}</td>
                                <td className="py-2 px-3 font-mono text-slate-700">{item.pedido}</td>
                                <td className="py-2 px-3 text-slate-800 max-w-xs truncate" title={item.descripcion}>
                                  {item.descripcion}
                                </td>
                                <td className="py-2 px-3 text-right font-mono-tabular font-semibold text-slate-900">
                                  {item.cantidad}
                                </td>
                                {group.processType !== 'pendientes' && (
                                  <td className="py-2 px-3 text-center font-mono-tabular text-slate-700">
                                    {item.fecha || '—'}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
