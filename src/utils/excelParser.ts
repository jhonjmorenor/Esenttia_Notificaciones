import * as XLSX from 'xlsx';
import {
  OrderItem,
  ClientGroup,
  ColumnValidationResult,
  SendReportItem,
  ProcessType,
} from '../types/mail';

export const REQUIRED_COLUMNS_FECHAS = [
  'REF. CLIENTE',
  'CLIENTE',
  'PEDIDO',
  'DESCRIPCION',
  'CANTIDAD',
  'FECHA',
  'CORREO DE NOTIFICACIÓN',
  'CORREO RESPALDO',
  'CORREO CC ADICIONAL',
  'ASUNTO',
];

export const REQUIRED_COLUMNS_PENDIENTES = [
  'REF. CLIENTE',
  'CLIENTE',
  'PEDIDO',
  'DESCRIPCION',
  'CANTIDAD',
  'CORREO DE NOTIFICACIÓN',
  'CORREO RESPALDO',
  'CORREO CC ADICIONAL',
  'ASUNTO',
];

export const REQUIRED_COLUMNS_DESPACHADOS = [
  'REF. CLIENTE',
  'CLIENTE',
  'PEDIDO',
  'DESCRIPCION',
  'CANTIDAD',
  'FECHA DESPACHO',
  'CORREO DE NOTIFICACIÓN',
  'CORREO RESPALDO',
  'CORREO CC ADICIONAL',
  'ASUNTO',
];

export const REQUIRED_COLUMNS_VIP = [
  'FECHA DE ENTREGA',
  'DOCUMENTO COMERCIAL',
  'POSICIÓN (SD)',
  'NOMBRE',
  'DESCRIPCIÓN DE POSICIÓN',
  'REMISIÓN',
  'CANTIDAD DE PEDIDO',
  'ESTADO DE CARTERA',
  'ESTADO DE INVENTARIO',
  'ESTADO DE ENVÍO',
  'PLACA',
  'TRANSPORTADOR',
  'NOMBRE CONTACTO 1',
  'CORREO CONTACTO 1',
  'NOMBRE CONTACTO 2',
  'CORREO CONTACTO 2',
  'NOMBRE COMERCIAL',
  'CORREO COMERCIAL',
  'ASUNTO',
];

export function cleanClientName(raw: any): string {
  if (raw === null || raw === undefined) return '';
  let str = String(raw);
  str = str.replace(/[()'"“”]/g, '');
  str = str.replace(/\s+/g, ' ');
  return str.trim().toUpperCase();
}

export function formatExcelDate(raw: any): string {
  if (!raw) return '';
  if (raw instanceof Date) {
    const d = String(raw.getDate()).padStart(2, '0');
    const m = String(raw.getMonth() + 1).padStart(2, '0');
    const y = raw.getFullYear();
    return `${d}/${m}/${y}`;
  }
  if (typeof raw === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(raw);
      if (parsed) {
        const d = String(parsed.d).padStart(2, '0');
        const m = String(parsed.m).padStart(2, '0');
        const y = parsed.y;
        return `${d}/${m}/${y}`;
      }
    } catch {
      // fallback
    }
  }

  const str = String(raw).trim();
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime()) && str.includes('-')) {
    const d = String(dateObj.getDate()).padStart(2, '0');
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const y = dateObj.getFullYear();
    return `${d}/${m}/${y}`;
  }

  return str;
}

export function normalizeHeader(h: string): string {
  return h
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove accents for resilient matching
}

export function detectProcessType(normalizedHeaders: string[]): ProcessType {
  const normList = normalizedHeaders.map(normalizeHeader);

  // VIP detection
  if (
    normList.some((h) => h.includes('DOCUMENTO COMERCIAL')) ||
    normList.some((h) => h.includes('POSICION') && h.includes('SD')) ||
    normList.some((h) => h.includes('CORREO COMERCIAL')) ||
    normList.some((h) => h.includes('CORREO_CC_FIJO'))
  ) {
    return 'vip';
  }

  // Despachados detection
  if (normList.some((h) => h.includes('DESPACH') || h.startsWith('FECHA DESPAC'))) {
    return 'despachados';
  }

  // Fechas detection
  if (normList.some((h) => h === 'FECHA')) {
    return 'fechas';
  }

  // Pendientes detection
  return 'pendientes';
}

export function validateColumns(
  headers: string[],
  targetProcess?: ProcessType
): ColumnValidationResult {
  const normalizedRaw = headers.map((h) => h.trim().toUpperCase());
  const effectiveProcess = targetProcess || detectProcessType(normalizedRaw);

  let required: string[] = [];
  if (effectiveProcess === 'vip') {
    required = REQUIRED_COLUMNS_VIP;
  } else if (effectiveProcess === 'despachados') {
    required = REQUIRED_COLUMNS_DESPACHADOS;
  } else if (effectiveProcess === 'pendientes') {
    required = REQUIRED_COLUMNS_PENDIENTES;
  } else {
    required = REQUIRED_COLUMNS_FECHAS;
  }

  const missing = required.filter((req) => {
    const normReq = normalizeHeader(req);
    return !normalizedRaw.some((h) => {
      const normH = normalizeHeader(h);
      if (normReq === 'FECHA DESPACHO') {
        return normH === 'FECHA DESPACHO' || normH.startsWith('FECHA DESPAC') || normH.includes('DESPACHO');
      }
      if (normReq === 'CORREO_CC_FIJO') {
        return normH === 'CORREO_CC_FIJO' || normH === 'CORREO CC FIJO';
      }
      if (normReq === 'CLIENTE') {
        return normH === 'CLIENTE' || normH === 'NOMBRE';
      }
      return normH === normReq;
    });
  });

  return {
    isValid: missing.length === 0,
    foundColumns: normalizedRaw,
    missingColumns: missing,
    detectedProcessType: effectiveProcess,
  };
}

export function parseExcelFile(
  data: ArrayBuffer,
  forcedProcessType?: ProcessType
): {
  groups: ClientGroup[];
  validation: ColumnValidationResult;
  totalRawRows: number;
  processType: ProcessType;
} {
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (rawRows.length === 0) {
    const emptyProcess = forcedProcessType || 'fechas';
    return {
      groups: [],
      validation: {
        isValid: false,
        foundColumns: [],
        missingColumns:
          emptyProcess === 'vip'
            ? REQUIRED_COLUMNS_VIP
            : emptyProcess === 'despachados'
            ? REQUIRED_COLUMNS_DESPACHADOS
            : emptyProcess === 'pendientes'
            ? REQUIRED_COLUMNS_PENDIENTES
            : REQUIRED_COLUMNS_FECHAS,
        detectedProcessType: emptyProcess,
      },
      totalRawRows: 0,
      processType: emptyProcess,
    };
  }

  const headerRow: string[] = (rawRows[0] || []).map((c: any) =>
    String(c || '').trim().toUpperCase()
  );

  const colIndexMap = new Map<string, number>();
  headerRow.forEach((colName, idx) => {
    if (colName && !colIndexMap.has(colName)) {
      colIndexMap.set(colName, idx);
    }
  });

  const normalizedKeys = Array.from(colIndexMap.keys());
  const processType = forcedProcessType || detectProcessType(normalizedKeys);
  const validation = validateColumns(normalizedKeys, processType);

  if (!validation.isValid) {
    return {
      groups: [],
      validation,
      totalRawRows: rawRows.length - 1,
      processType,
    };
  }

  // Value getter helper with flexible matching
  const getVal = (row: any[], targetColName: string): any => {
    const normTarget = normalizeHeader(targetColName);
    for (const [key, idx] of colIndexMap.entries()) {
      const normKey = normalizeHeader(key);
      if (normTarget === 'CLIENTE' && (normKey === 'CLIENTE' || normKey === 'NOMBRE')) {
        return idx < row.length ? row[idx] : '';
      }
      if (normTarget === 'NOMBRE' && (normKey === 'NOMBRE' || normKey === 'CLIENTE')) {
        return idx < row.length ? row[idx] : '';
      }
      if (normTarget === 'FECHA DESPACHO' && (normKey === 'FECHA DESPACHO' || normKey.startsWith('FECHA DESPAC') || normKey.includes('DESPACH'))) {
        return idx < row.length ? row[idx] : '';
      }
      if (normTarget === 'CORREO_CC_FIJO' && (normKey === 'CORREO_CC_FIJO' || normKey === 'CORREO CC FIJO')) {
        return idx < row.length ? row[idx] : '';
      }
      if (normKey === normTarget) {
        return idx < row.length ? row[idx] : '';
      }
    }
    return '';
  };

  let lastClient = '';
  const processedRows: any[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const r = rawRows[i];
    if (!r || r.length === 0) continue;

    // Client identifier is 'NOMBRE' in VIP, 'CLIENTE' in others
    const rawClient = processType === 'vip' ? getVal(r, 'NOMBRE') : getVal(r, 'CLIENTE');
    let clientClean = cleanClientName(rawClient);
    if (!clientClean && lastClient) {
      clientClean = lastClient; // ffill()
    } else if (clientClean) {
      lastClient = clientClean;
    }

    if (!clientClean) continue;

    if (processType === 'vip') {
      const docComercial = String(getVal(r, 'DOCUMENTO COMERCIAL') || '').trim();
      const posSd = String(getVal(r, 'POSICIÓN (SD)') || '').trim();
      const descPos = String(getVal(r, 'DESCRIPCIÓN DE POSICIÓN') || '').trim();
      const remision = String(getVal(r, 'REMISIÓN') || '').trim();
      const cantPedido = String(getVal(r, 'CANTIDAD DE PEDIDO') || '').trim();
      const fechaEntrega = formatExcelDate(getVal(r, 'FECHA DE ENTREGA'));
      const estCartera = String(getVal(r, 'ESTADO DE CARTERA') || '').trim();
      const estInventario = String(getVal(r, 'ESTADO DE INVENTARIO') || '').trim();
      const estEnvio = String(getVal(r, 'ESTADO DE ENVÍO') || '').trim();
      const placa = String(getVal(r, 'PLACA') || '').trim();
      const transportador = String(getVal(r, 'TRANSPORTADOR') || '').trim();

      const nomContacto1 = String(getVal(r, 'NOMBRE CONTACTO 1') || '').trim();
      const correoContacto1 = String(getVal(r, 'CORREO CONTACTO 1') || '').trim();
      const nomContacto2 = String(getVal(r, 'NOMBRE CONTACTO 2') || '').trim();
      const correoContacto2 = String(getVal(r, 'CORREO CONTACTO 2') || '').trim();

      const nomComercial = String(getVal(r, 'NOMBRE COMERCIAL') || '').trim();
      const correoComercial = String(getVal(r, 'CORREO COMERCIAL') || '').trim();
      // From Excel data as requested:
      const correoCcFijo = String(getVal(r, 'CORREO_CC_FIJO') || '').trim();
      const asunto = String(getVal(r, 'ASUNTO') || '')
        .replace(/^Asunto:\s*/i, '')
        .trim();

      processedRows.push({
        cliente: clientClean,
        refCliente: docComercial,
        pedido: docComercial,
        posicion: posSd,
        descripcion: descPos,
        remision,
        cantidad: cantPedido,
        fecha: fechaEntrega,
        estadoCartera: estCartera,
        estadoInventario: estInventario,
        estadoEnvio: estEnvio,
        placa,
        transportador,
        nomContacto1,
        correoContacto1,
        nomContacto2,
        correoContacto2,
        nomComercial,
        correoComercial,
        correoCcFijo,
        asunto,
        rowIndex: i + 1,
      });
    } else {
      // Standard rows (fechas, pendientes, despachados)
      let parsedFecha: string | undefined = undefined;
      if (processType === 'despachados') {
        parsedFecha = formatExcelDate(getVal(r, 'FECHA DESPACHO'));
      } else if (processType === 'fechas') {
        parsedFecha = formatExcelDate(getVal(r, 'FECHA'));
      }

      processedRows.push({
        cliente: clientClean,
        refCliente: String(getVal(r, 'REF. CLIENTE') || '').trim(),
        pedido: String(getVal(r, 'PEDIDO') || '').trim(),
        descripcion: String(getVal(r, 'DESCRIPCION') || '').trim(),
        cantidad: String(getVal(r, 'CANTIDAD') || '').trim(),
        fecha: parsedFecha,
        correoNotificacion: String(getVal(r, 'CORREO DE NOTIFICACIÓN') || '').trim(),
        correoRespaldo: String(getVal(r, 'CORREO RESPALDO') || '').trim(),
        correoCcAdicional: String(getVal(r, 'CORREO CC ADICIONAL') || '').trim(),
        asunto: String(getVal(r, 'ASUNTO') || '')
          .replace(/^Asunto:\s*/i, '')
          .trim(),
        rowIndex: i + 1,
      });
    }
  }

  // Sort rows: VIP by Nombre, Documento Comercial, Posición (SD)
  processedRows.sort((a, b) => {
    const cmp = a.cliente.localeCompare(b.cliente);
    if (cmp !== 0) return cmp;
    const cmpDoc = (a.pedido || '').localeCompare(b.pedido || '');
    if (cmpDoc !== 0) return cmpDoc;
    return (a.posicion || '').localeCompare(b.posicion || '');
  });

  // Group by client
  const clientMap = new Map<string, typeof processedRows>();
  for (const row of processedRows) {
    const list = clientMap.get(row.cliente) || [];
    list.push(row);
    clientMap.set(row.cliente, list);
  }

  const groups: ClientGroup[] = [];

  clientMap.forEach((rows, cliente) => {
    const firstRow = rows[0];

    const toSet = new Set<string>();
    const ccSet = new Set<string>();
    let contactName = '';

    if (processType === 'vip') {
      // Extract Contact Name from rows
      for (const r of rows) {
        if (r.nomContacto1) {
          contactName = r.nomContacto1;
          break;
        }
        if (r.nomContacto2) {
          contactName = r.nomContacto2;
          break;
        }
      }

      // TO recipients from Correo Contacto 1 & 2 across group
      for (const r of rows) {
        [r.correoContacto1, r.correoContacto2].forEach((raw) => {
          if (raw) {
            raw
              .split(/[;,]/)
              .map((c: string) => c.trim())
              .filter((c: string) => c.includes('@'))
              .forEach((c: string) => toSet.add(c));
          }
        });

        // CC recipients from Correo Comercial, fixed CC (jhon.moreno@konecta.com) & any custom CC
        [r.correoComercial, 'jhon.moreno@konecta.com', r.correoCcFijo].forEach((raw) => {
          if (raw) {
            raw
              .split(/[;,]/)
              .map((c: string) => c.trim())
              .filter((c: string) => c.includes('@'))
              .forEach((c: string) => ccSet.add(c));
          }
        });
      }
    } else {
      // Standard recipient parsing
      (firstRow.correoNotificacion || '')
        .split(/[;,]/)
        .map((c: string) => c.trim())
        .filter((c: string) => c.includes('@'))
        .forEach((c: string) => toSet.add(c));

      [firstRow.correoRespaldo, firstRow.correoCcAdicional].forEach((field) => {
        if (field) {
          field
            .split(/[;,]/)
            .map((c: string) => c.trim())
            .filter((c: string) => c.includes('@'))
            .forEach((c: string) => ccSet.add(c));
        }
      });
    }

    const items: OrderItem[] = rows.map((r) => ({
      refCliente: r.refCliente,
      pedido: r.pedido,
      posicion: r.posicion,
      descripcion: r.descripcion,
      remision: r.remision,
      cantidad: r.cantidad,
      fecha: r.fecha,
      estadoCartera: r.estadoCartera,
      estadoInventario: r.estadoInventario,
      estadoEnvio: r.estadoEnvio,
      placa: r.placa,
      transportador: r.transportador,
      contactoNombre: contactName,
      rawRowIndex: r.rowIndex,
    }));

    const toRecipients = Array.from(toSet);
    const hasValidEmail = toRecipients.length > 0;

    let defaultSubject = '';
    if (processType === 'vip') {
      defaultSubject = `ESENTTIA: Actualización de pedidos VIP - ${cliente}`;
    } else if (processType === 'despachados') {
      defaultSubject = `ESENTTIA: Notificación de Despacho Pedido - ${items.map((it) => it.pedido).slice(0, 2).join('-')}`;
    } else if (processType === 'pendientes') {
      defaultSubject = `ESENTTIA: Actualización de entrega pedido - ${items.map((it) => it.pedido).slice(0, 2).join('-')}`;
    } else {
      defaultSubject = `ESENTTIA: Nueva fecha de disponibilidad de inventario - ${cliente}`;
    }

    groups.push({
      id: `${processType}-${encodeURIComponent(cliente).slice(0, 32)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      cliente,
      contactoNombre: contactName || cliente,
      items,
      to: toRecipients,
      cc: Array.from(ccSet),
      asunto: firstRow.asunto || defaultSubject,
      hasValidEmail,
      status: hasValidEmail ? 'PENDIENTE' : 'SIN CORREO',
      errorDetails: hasValidEmail ? undefined : 'No hay correos válidos para este cliente en el archivo',
      processType,
    });
  });

  return {
    groups,
    validation,
    totalRawRows: processedRows.length,
    processType,
  };
}

export function generateSampleExcelData(type: ProcessType = 'fechas'): Uint8Array {
  if (type === 'vip') {
    // Exact schema and sample from the user's VIP image!
    const sampleHeaders = REQUIRED_COLUMNS_VIP;
    const sampleData = [
      sampleHeaders,
      [
        '15/10/2026',
        '90459898',
        '10',
        'AJOVER DARNEL S.A.S',
        'HOMOPOLIMERO 20H10NA BOLSAS 25 KG',
        '81200450',
        '3.000',
        'Liberado',
        'Asignado',
        'Despachado',
        'WOO383',
        'MATIC DE COLOMBIA',
        'Jhon Moreno',
        'jhon.moreno@konecta.com',
        'Carlos Restrepo',
        'operaciones@ajover.com',
        'Maria Gomez',
        'ejecutivo.comercial@esenttia.co',
        'jhon.moreno@konecta.com', // CORREO_CC_FIJO from Excel data as requested!
        'ESENTTIA: Actualización de pedidos VIP - AJOVER DARNEL S.A.S',
      ],
      [
        '15/10/2026',
        '90459898',
        '20',
        'AJOVER DARNEL S.A.S',
        'COPOLIMERO IMPACTO C015 BOLSAS 25 KG',
        '81200451',
        '2.000',
        'Liberado',
        'Asignado',
        'En Tránsito',
        'WOO383',
        'MATIC DE COLOMBIA',
        'Jhon Moreno',
        'jhon.moreno@konecta.com',
        '',
        '',
        'Maria Gomez',
        'ejecutivo.comercial@esenttia.co',
        'jhon.moreno@konecta.com',
        'ESENTTIA: Actualización de pedidos VIP - AJOVER DARNEL S.A.S',
      ],
      [
        '18/10/2026',
        '90460112',
        '10',
        'PLASTICOS NACIONALES VIP S.A.',
        'POLIPROPILENO RANDOM R020 BOLSAS 25 KG',
        '81200500',
        '5.000',
        'Liberado',
        'En Proceso',
        'Programado',
        'TLR490',
        'TRANSPORTE LOGISTICO DEL CARIBE',
        'Beatriz Pinzon',
        'compras@plasticosvip.co',
        '',
        '',
        'Andres Perez',
        'andres.perez@esenttia.co',
        'jhon.moreno@konecta.com',
        'ESENTTIA: Notificación Estatus Pedido VIP',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 16 }, // Fecha de Entrega
      { wch: 18 }, // Documento Comercial
      { wch: 14 }, // Posición (SD)
      { wch: 32 }, // Nombre
      { wch: 40 }, // Descripción de Posición
      { wch: 14 }, // Remisión
      { wch: 16 }, // Cantidad de Pedido
      { wch: 16 }, // Estado de Cartera
      { wch: 18 }, // Estado de Inventario
      { wch: 16 }, // Estado de Envío
      { wch: 12 }, // Placa
      { wch: 28 }, // Transportador
      { wch: 20 }, // Nombre Contacto 1
      { wch: 30 }, // Correo Contacto 1
      { wch: 20 }, // Nombre Contacto 2
      { wch: 30 }, // Correo Contacto 2
      { wch: 20 }, // Nombre Comercial
      { wch: 30 }, // Correo Comercial
      { wch: 30 }, // CORREO_CC_FIJO
      { wch: 55 }, // Asunto
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Envio_VIP');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  }

  if (type === 'despachados') {
    const sampleHeaders = REQUIRED_COLUMNS_DESPACHADOS;
    const sampleData = [
      sampleHeaders,
      [
        '',
        'LUXURY PLAST S.A.S.',
        '90460897',
        'COPOLIMERO I. 16C12NA BOLSAS 25 KG',
        '2.000',
        '13/10/2026',
        'jhon.moreno@konecta.com; despacho@luxuryplast.co',
        'gerencia@luxuryplast.co',
        'sac@esenttia.co',
        'ESENTTIA: Notificación de Despacho Pedido - 90460897',
      ],
      [
        '',
        'LUXURY PLAST S.A.S.',
        '90460897',
        'HOMOPOLIMERO 20H10NA BOLSAS 25 KG',
        '2.000',
        '13/10/2026',
        'jhon.moreno@konecta.com',
        'gerencia@luxuryplast.co',
        'sac@esenttia.co',
        'ESENTTIA: Notificación de Despacho Pedido - 90460897',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 14 },
      { wch: 38 },
      { wch: 14 },
      { wch: 42 },
      { wch: 12 },
      { wch: 16 },
      { wch: 45 },
      { wch: 30 },
      { wch: 25 },
      { wch: 60 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Envio_Despachado');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  }

  if (type === 'pendientes') {
    const sampleHeaders = REQUIRED_COLUMNS_PENDIENTES;
    const sampleData = [
      sampleHeaders,
      [
        'Y - 003 - 14849',
        'ABC GOTUPLAS S.A.S.',
        '90460995',
        'COPOLIMERO R. 45R60CD BOLSAS 25 KG',
        '2.000',
        'jhon.moreno@konecta.com; compras@gotuplas.com',
        'logistica@gotuplas.com',
        'sac@esenttia.co',
        'ESENTTIA: Actualización de entrega pedido - 90461031-90460995',
      ],
      [
        'Y - 003 - 14861',
        'ABC GOTUPLAS S.A.S.',
        '90461031',
        'HOMOPOLIMERO 11H01A BOLSAS 25 KG',
        '4.000',
        'jhon.moreno@konecta.com',
        'logistica@gotuplas.com',
        'sac@esenttia.co',
        'ESENTTIA: Actualización de entrega pedido - 90461031-90460995',
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    ws['!cols'] = [
      { wch: 18 },
      { wch: 38 },
      { wch: 14 },
      { wch: 42 },
      { wch: 12 },
      { wch: 45 },
      { wch: 30 },
      { wch: 25 },
      { wch: 60 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Envio_Pendientes');
    return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  }

  // Fechas template
  const sampleHeaders = REQUIRED_COLUMNS_FECHAS;
  const sampleData = [
    sampleHeaders,
    [
      'OC-22070',
      'INDUSTRIAS KENT Y SORRENTO S.A',
      '220034084',
      'MASTERBATCH ADITIVO MB 100',
      '100',
      '19/10/2026',
      'hon.moreno@konecta.com; compras@kentsorrento.com',
      'logistica@kentsorrento.com',
      'sac@esenttia.co',
      'ESENTTIA: Nueva fecha de asignación de inventario - 220034084 / OC-22070',
    ],
    [
      'OC-22071',
      'INDUSTRIAS KENT Y SORRENTO S.A',
      '220034085',
      'POLIPROPILENO HOMOPOLIMERO H030SG',
      '250',
      '22/10/2026',
      'hon.moreno@konecta.com',
      'logistica@kentsorrento.com',
      'sac@esenttia.co',
      'ESENTTIA: Nueva fecha de asignación de inventario - 220034085',
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 14 },
    { wch: 38 },
    { wch: 14 },
    { wch: 42 },
    { wch: 12 },
    { wch: 14 },
    { wch: 45 },
    { wch: 32 },
    { wch: 25 },
    { wch: 60 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Envio_Fechas');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

export function exportReportToExcel(report: SendReportItem[], processType?: ProcessType): void {
  const isVip = processType === 'vip' || report.some((r) => r.PROCESO === 'vip');

  const headers = isVip
    ? [
        'CLIENTE',
        'CORREOS',
        'CC',
        'ASUNTO',
        'TOTAL_FILAS',
        'TOTAL_DOCUMENTOS',
        'TOTAL_POSICIONES',
        'FECHA_ENVIO',
        'ESTADO',
        'ERROR',
        'PROCESO',
      ]
    : [
        'CLIENTE',
        'CORREOS',
        'CC',
        'ASUNTO',
        'TOTAL_PEDIDOS',
        'FECHA_ENVIO',
        'ESTADO',
        'ERROR',
        'PROCESO',
      ];

  const rows = report.map((r) => {
    if (isVip) {
      return [
        r.CLIENTE,
        r.CORREOS,
        r.CC,
        r.ASUNTO,
        r.TOTAL_FILAS || r.TOTAL_PEDIDOS,
        r.TOTAL_DOCUMENTOS || r.TOTAL_PEDIDOS,
        r.TOTAL_POSICIONES || r.TOTAL_PEDIDOS,
        r.FECHA_ENVIO,
        r.ESTADO,
        r.ERROR,
        (r.PROCESO || processType || 'vip').toUpperCase(),
      ];
    }
    return [
      r.CLIENTE,
      r.CORREOS,
      r.CC,
      r.ASUNTO,
      r.TOTAL_PEDIDOS,
      r.FECHA_ENVIO,
      r.ESTADO,
      r.ERROR,
      (r.PROCESO || processType || 'fechas').toUpperCase(),
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [
    { wch: 36 },
    { wch: 40 },
    { wch: 30 },
    { wch: 55 },
    { wch: 16 },
    { wch: 18 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 35 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte_Envios');

  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  
  let fileName = `Reporte_Envios_Fechas_${dateStr}.xlsx`;
  if (processType === 'vip') {
    fileName = `Reporte_Envios_VIP_${dateStr}.xlsx`;
  } else if (processType === 'despachados') {
    fileName = `Reporte_Envios_Despachado_${dateStr}.xlsx`;
  } else if (processType === 'pendientes') {
    fileName = `Reporte_Envios_Pendiente_${dateStr}.xlsx`;
  }

  XLSX.writeFile(wb, fileName);
}
