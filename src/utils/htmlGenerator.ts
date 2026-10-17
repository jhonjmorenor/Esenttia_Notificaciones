import { ClientGroup, EmailTemplateConfig, ProcessType, SendReportItem } from '../types/mail';
import { DEFAULT_ESENTTIA_BANNER } from '../assets/bannerData';

export const TEMPLATE_FECHAS: EmailTemplateConfig = {
  processType: 'fechas',
  title: 'Fechas de Disponibilidad',
  description: 'Notificación de nuevas fechas estimadas de inventario y pedidos',
  companyName: 'Esenttia',
  greetingPrefix: 'Buen día, apreciado(a):',
  introText: 'Nos permitimos informarle la nueva fecha de disponibilidad del material correspondiente al siguiente pedido:',
  logisticsDisclaimer: 'Agradecemos tener en cuenta que la fecha de entrega final podrá estar sujeta a condiciones logísticas adicionales, incluyendo la asignación de transporte y el estado de la malla vial.',
  closingText: 'Cualquier otra inquietud, por favor, comuníquese con nosotros.',
  supportChannels: {
    whatsapp: '(+57) 310 300 3353',
    website: 'www.esenttia.co',
    phone: '(+57 1) 5960210',
    email: 'servicioalcliente@esenttia.co',
  },
  tableHeaderBg: '#003366',
  tableHeaderColor: '#ffffff',
  bannerImageBase64: DEFAULT_ESENTTIA_BANNER,
};

export const TEMPLATE_PENDIENTES: EmailTemplateConfig = {
  processType: 'pendientes',
  title: 'Pendientes de Asignación',
  description: 'Notificación de materiales remisionados pendientes de vehículo y despacho',
  companyName: 'Esenttia',
  greetingPrefix: 'Buen día, apreciado(a):',
  introText: 'Con el fin de mantenerlo informado de manera oportuna, le notificamos una actualización con respecto al despacho del siguiente material:',
  logisticsDisclaimer: 'A la fecha, los materiales antes relacionados se encuentran remisionado(s) y pendientes de asignación de vehículo. Nuestro equipo está gestionando esta situación con prioridad, con el fin de cumplir con el despacho del producto en el menor tiempo posible.',
  closingText: 'Cualquier otra inquietud, por favor, comuníquese con nosotros.',
  supportChannels: {
    whatsapp: '(+57) 310 300 3353',
    website: 'www.esenttia.co',
    phone: '(+57 1) 5960210',
    email: 'servicioalcliente@esenttia.co',
  },
  tableHeaderBg: '#003366',
  tableHeaderColor: '#ffffff',
  bannerImageBase64: DEFAULT_ESENTTIA_BANNER,
};

export const TEMPLATE_DESPACHADOS: EmailTemplateConfig = {
  processType: 'despachados',
  title: 'Pedidos Despachados',
  description: 'Notificación de despacho efectivo de material con fecha de entrega/salida',
  companyName: 'Esenttia',
  greetingPrefix: 'Buen día, apreciado(a):',
  introText: 'Con el fin de mantenerlo informado de manera oportuna, le notificamos que se ha realizado el despacho del siguiente material asociado a su pedido:',
  subtitleBeforeTable: 'Pedido(s) despachado(s):',
  logisticsDisclaimer: '',
  closingText: 'Si tiene alguna inquietud adicional, no dude en comunicarse con nosotros.',
  supportChannels: {
    whatsapp: '(+57) 310 300 3353',
    website: 'www.esenttia.co',
    phone: '(+57 1) 5960210',
    email: 'servicioalcliente@esenttia.co',
  },
  tableHeaderBg: '#003366',
  tableHeaderColor: '#ffffff',
  bannerImageBase64: DEFAULT_ESENTTIA_BANNER,
};

export const TEMPLATE_VIP: EmailTemplateConfig = {
  processType: 'vip',
  title: 'Clientes VIP',
  description: 'Estatus integral de pedidos con 11 columnas logísticas para clientes corporativos VIP',
  companyName: 'Esenttia',
  greetingPrefix: 'Estimado/a',
  introText: 'Espero que se encuentre muy bien.\n\nCompartimos con usted la actualización del estatus de los pedidos, correspondientes a las entregas programadas.',
  subtitleBeforeTable: '',
  logisticsDisclaimer: '',
  closingText: 'Quedamos a su entera disposición en caso de que tenga alguna duda o requiera información adicional.',
  supportChannels: {
    whatsapp: '(+57) 310 300 3353',
    website: 'www.esenttia.co',
    phone: '(+57 1) 5960210',
    email: 'servicioalcliente@esenttia.co',
  },
  tableHeaderBg: '#003366',
  tableHeaderColor: '#ffffff',
  bannerImageBase64: DEFAULT_ESENTTIA_BANNER,
};

export const DEFAULT_TEMPLATES: Record<ProcessType, EmailTemplateConfig> = {
  fechas: TEMPLATE_FECHAS,
  pendientes: TEMPLATE_PENDIENTES,
  despachados: TEMPLATE_DESPACHADOS,
  vip: TEMPLATE_VIP,
};

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateEmailHtml(
  group: ClientGroup,
  config: EmailTemplateConfig,
  mode: 'smtp' | 'preview' = 'smtp'
): string {
  const currentProcess = config.processType || group.processType || 'fechas';

  // VIP Template Structure
  if (currentProcess === 'vip') {
    const contactName = group.contactoNombre || group.cliente;

    const tableRows = group.items
      .map(
        (item) => `
      <tr>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle;">${escapeHtml(item.fecha || '')}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle; font-family:monospace;">${escapeHtml(item.pedido)}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle;">${escapeHtml(item.posicion || '')}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:left; vertical-align:middle;">${escapeHtml(item.descripcion)}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle;">${escapeHtml(item.remision || '')}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle; font-weight:600;">${escapeHtml(item.cantidad)}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle;">${escapeHtml(item.estadoCartera || '')}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle;">${escapeHtml(item.estadoInventario || '')}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle;">${escapeHtml(item.estadoEnvio || '')}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:center; vertical-align:middle; font-family:monospace;">${escapeHtml(item.placa || '')}</td>
        <td style="padding:7px; border:1px solid #D5DDE5; text-align:left; vertical-align:middle;">${escapeHtml(item.transportador || '')}</td>
      </tr>`
      )
      .join('');

    let imageTag = '';
    const bannerImg = config.bannerImageBase64 || DEFAULT_ESENTTIA_BANNER;
    if (bannerImg) {
      if (mode === 'smtp') {
        imageTag = `
          <p style="margin-top:25px; margin-bottom:8px; font-size:11pt; color:#333333;">Atentamente,<br></p>
          <img src="cid:logo_esenttia" alt="Esenttia" style="width:800px; max-width:100%; height:auto; margin-top:10px; display:block; border-radius:4px;" />
        `;
      } else {
        imageTag = `
          <p style="margin-top:25px; margin-bottom:8px; font-size:11pt; color:#333333;">Atentamente,<br></p>
          <img src="${bannerImg}" alt="Esenttia" style="width:800px; max-width:100%; height:auto; margin-top:10px; display:block; border-radius:4px;" />
        `;
      }
    }

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(group.asunto || 'Estatus de pedidos Esenttia VIP')}</title>
</head>
<body style="font-family:Calibri,Arial,sans-serif; font-size:11pt; color:#333333; line-height:1.5; margin:0; padding:12px; background-color:#ffffff;">

  <p>
    Estimado/a <b>${escapeHtml(contactName)}</b>,
  </p>

  <p>
    Espero que se encuentre muy bien.
  </p>

  <p>
    Compartimos con usted la <b>actualización del estatus de los pedidos</b>, correspondientes a las entregas programadas.
  </p>

  <table style="border-collapse:collapse; width:100%; margin-top:15px; margin-bottom:20px; font-size:10pt;">
    <thead>
      <tr style="background-color:${config.tableHeaderBg}; color:${config.tableHeaderColor}; text-align:center;">
        <th style="padding:8px; border:1px solid #D5DDE5;">Fecha de entrega</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Documento comercial</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Posición (SD)</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Descripción de posición</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Remisión</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Cantidad de pedido</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Estado de cartera</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Estado de inventario</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Estado de envío</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Placa</th>
        <th style="padding:8px; border:1px solid #D5DDE5;">Transportador</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <p>
    ${escapeHtml(config.closingText)}
  </p>

  <p style="margin-top:15px;">
    <b>Canales de atención:</b>
  </p>

  <ul style="margin-top:10px; padding-left:20px; font-size:10.5pt; color:#334155; line-height:1.7;">
    ${config.supportChannels.whatsapp ? `<li>WhatsApp Business: <b>${escapeHtml(config.supportChannels.whatsapp)}</b></li>` : ''}
    ${config.supportChannels.website ? `<li>Sitio web: <a href="https://${escapeHtml(config.supportChannels.website.replace(/^https?:\/\//, ''))}" style="color:#0056b3; text-decoration:none;">${escapeHtml(config.supportChannels.website)}</a></li>` : ''}
    ${config.supportChannels.phone ? `<li>Línea telefónica: <b>${escapeHtml(config.supportChannels.phone)}</b></li>` : ''}
    ${config.supportChannels.email ? `<li>Correo electrónico: <a href="mailto:${escapeHtml(config.supportChannels.email)}" style="color:#0056b3; text-decoration:none;">${escapeHtml(config.supportChannels.email)}</a></li>` : ''}
  </ul>

  ${imageTag}

</body>
</html>`;
  }

  // Otherwise: standard 4 or 5 columns for Fechas, Pendientes, Despachados
  const tableRows = group.items
    .map((item) => {
      if (currentProcess === 'pendientes') {
        return `
    <tr style="text-align:center; border: 1px solid #cbd5e1;">
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 500;">${escapeHtml(item.refCliente)}</td>
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${escapeHtml(item.pedido)}</td>
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left;">${escapeHtml(item.descripcion)}</td>
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${escapeHtml(item.cantidad)}</td>
    </tr>`;
      } else {
        return `
    <tr style="text-align:center; border: 1px solid #cbd5e1;">
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 500;">${escapeHtml(item.refCliente)}</td>
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${escapeHtml(item.pedido)}</td>
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: left;">${escapeHtml(item.descripcion)}</td>
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1; font-weight: 600;">${escapeHtml(item.cantidad)}</td>
      <td style="padding: 8px 10px; border: 1px solid #cbd5e1;">${escapeHtml(item.fecha || '')}</td>
    </tr>`;
      }
    })
    .join('');

  let tableHeaderCols = '';
  if (currentProcess === 'pendientes') {
    tableHeaderCols = `
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">OC</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Pedido</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244; text-align: left;">Material</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Cantidad</th>
    `;
  } else if (currentProcess === 'despachados') {
    tableHeaderCols = `
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">OC</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Pedido</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244; text-align: left;">Material</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Cantidad</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Fecha Despachado</th>
    `;
  } else {
    tableHeaderCols = `
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">OC</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Pedido</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244; text-align: left;">Material</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Cantidad</th>
      <th style="padding: 10px; font-weight: 600; border: 1px solid #002244;">Fecha</th>
    `;
  }

  const subtitleHtml = config.subtitleBeforeTable
    ? `<p style="margin: 15px 0 10px 0; font-size: 11pt;"><b>${escapeHtml(config.subtitleBeforeTable)}</b></p>`
    : '';

  const disclaimerHtml = config.logisticsDisclaimer
    ? `<p style="margin: 0 0 16px 0; font-size: 10.5pt; color: #475569;">${escapeHtml(config.logisticsDisclaimer)}</p>`
    : '';

  let imageTag = '';
  const bannerImg = config.bannerImageBase64 || DEFAULT_ESENTTIA_BANNER;
  if (bannerImg) {
    if (mode === 'smtp') {
      imageTag = `
        <div style="margin-top: 25px;">
          <p style="margin: 0 0 10px 0; font-size: 11pt; color: #1e293b;">Atentamente,<br></p>
          <img src="cid:logo_esenttia" alt="Esenttia" style="width: 800px; max-width: 100%; height: auto; display: block; border-radius: 4px;" />
        </div>
      `;
    } else {
      imageTag = `
        <div style="margin-top: 25px;">
          <p style="margin: 0 0 10px 0; font-size: 11pt; color: #1e293b;">Atentamente,<br></p>
          <img src="${bannerImg}" alt="Esenttia" style="width: 800px; max-width: 100%; height: auto; display: block; border-radius: 4px;" />
        </div>
      `;
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(group.asunto || 'Notificación de pedidos')}</title>
</head>
<body style="font-family: Calibri, -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; margin: 0; padding: 24px; background-color: #ffffff;">

  <p style="margin: 0 0 16px 0; font-size: 11pt;">
    ${escapeHtml(config.greetingPrefix)} 
    <b style="color: #0f172a;">${escapeHtml(group.cliente)}</b>
  </p>

  <p style="margin: 0 0 20px 0; font-size: 11pt;">
    ${escapeHtml(config.introText)}
  </p>

  ${subtitleHtml}

  <table
    border="1"
    cellpadding="6"
    style="border-collapse: collapse; width: 100%; border: 1px solid #cbd5e1; margin-bottom: 24px;"
  >
    <thead>
      <tr style="background-color: ${config.tableHeaderBg}; color: ${config.tableHeaderColor}; text-align: center;">
        ${tableHeaderCols}
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  ${disclaimerHtml}

  <p style="margin: 0 0 16px 0; font-size: 11pt;">
    ${escapeHtml(config.closingText)}
  </p>

  <p style="margin: 20px 0 8px 0; font-size: 11pt;">
    <b>Canales de atención:</b>
  </p>

  <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 10.5pt; color: #334155; line-height: 1.7;">
    ${config.supportChannels.whatsapp ? `<li>WhatsApp Business: <b>${escapeHtml(config.supportChannels.whatsapp)}</b></li>` : ''}
    ${config.supportChannels.website ? `<li>Sitio web: <a href="https://${escapeHtml(config.supportChannels.website.replace(/^https?:\/\//, ''))}" style="color: #0056b3; text-decoration: none;">${escapeHtml(config.supportChannels.website)}</a></li>` : ''}
    ${config.supportChannels.phone ? `<li>Línea telefónica: <b>${escapeHtml(config.supportChannels.phone)}</b></li>` : ''}
    ${config.supportChannels.email ? `<li>Correo electrónico: <a href="mailto:${escapeHtml(config.supportChannels.email)}" style="color: #0056b3; text-decoration: none;">${escapeHtml(config.supportChannels.email)}</a></li>` : ''}
  </ul>

  ${imageTag}

</body>
</html>`;
}

export function generateReportEmailHtml(
  reports: SendReportItem[],
  processType: ProcessType,
  notes?: string,
  mode: 'smtp' | 'preview' = 'smtp'
): string {
  const processNames: Record<ProcessType, string> = {
    fechas: 'Fechas de Disponibilidad',
    pendientes: 'Pendientes de Asignación',
    despachados: 'Pedidos Despachados',
    vip: 'Clientes VIP (Estatus Integral)',
  };

  const processName = processNames[processType] || processType.toUpperCase();
  const now = new Date();
  const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const total = reports.length;
  const sentCount = reports.filter((r) => r.ESTADO === 'ENVIADO' || r.ESTADO === 'PRUEBA').length;
  const missingCount = reports.filter((r) => r.ESTADO === 'SIN CORREO').length;
  const errorCount = reports.filter((r) => r.ESTADO === 'ERROR').length;

  const notesHtml = notes && notes.trim()
    ? `<div style="margin: 0 0 20px 0; padding: 14px 18px; background-color: #f8fafc; border-left: 4px solid #003366; border-radius: 4px; font-size: 10.5pt; color: #334155;">
        <strong style="color: #0f172a;">Observaciones del despacho:</strong><br />
        ${escapeHtml(notes).replace(/\n/g, '<br />')}
      </div>`
    : '';

  const tableRows = reports.map((r) => {
    let statusBg = '#dcfce7';
    let statusColor = '#15803d';
    let statusText = r.ESTADO;

    if (r.ESTADO === 'SIN CORREO') {
      statusBg = '#fef3c7';
      statusColor = '#b45309';
    } else if (r.ESTADO === 'ERROR') {
      statusBg = '#fee2e2';
      statusColor = '#b91c1c';
    }

    const regCount = r.TOTAL_FILAS || r.TOTAL_PEDIDOS || 1;
    const detailOrError = r.ERROR || (r.ESTADO === 'SIN CORREO' ? 'Sin correo de contacto' : 'Notificación generada');

    return `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 9.5pt;">
        <td style="padding: 8px 10px; font-weight: bold; color: #0f172a;">${escapeHtml(r.CLIENTE)}</td>
        <td style="padding: 8px 10px; color: #334155;">${escapeHtml(r.CORREOS) || '<span style="color: #94a3b8; font-style: italic;">Sin correo</span>'}</td>
        <td style="padding: 8px 10px; color: #64748b;">${escapeHtml(r.CC) || '-'}</td>
        <td style="padding: 8px 10px; text-align: center; color: #334155;">${regCount}</td>
        <td style="padding: 8px 10px; text-align: center;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 8.5pt; font-weight: bold; background-color: ${statusBg}; color: ${statusColor};">
            ${escapeHtml(statusText)}
          </span>
        </td>
        <td style="padding: 8px 10px; color: #475569; font-size: 9pt;">${escapeHtml(detailOrError)}</td>
      </tr>
    `;
  }).join('');

  const imageSrc = mode === 'smtp' ? 'cid:logo_esenttia' : DEFAULT_ESENTTIA_BANNER;
  const imageTag = `<img src="${imageSrc}" alt="Esenttia" style="max-width: 650px; width: 100%; height: auto; display: block; margin-top: 24px; border: 0;" />`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reporte de Envíos - ${escapeHtml(processName)}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #1e293b; background-color: #ffffff; margin: 0; padding: 16px; line-height: 1.5;">

  <!-- Header Card -->
  <div style="background-color: #003366; color: #ffffff; padding: 20px 24px; border-radius: 8px; margin-bottom: 24px;">
    <div style="font-size: 10pt; text-transform: uppercase; letter-spacing: 1px; color: #93c5fd; font-weight: bold;">
      Auditoría y Trazabilidad de Notificaciones · Esenttia
    </div>
    <h1 style="margin: 6px 0 0 0; font-size: 18pt; font-weight: bold; color: #ffffff;">
      Reporte Oficial de Envíos de Correos
    </h1>
    <div style="margin-top: 8px; font-size: 10pt; color: #e2e8f0;">
      Proceso: <strong>${escapeHtml(processName)}</strong> &nbsp;|&nbsp; Fecha y hora de generación: <strong>${escapeHtml(dateFormatted)}</strong>
    </div>
  </div>

  <p style="margin: 0 0 16px 0; font-size: 11pt;">
    Buen día,
  </p>

  <p style="margin: 0 0 20px 0; font-size: 11pt;">
    A continuación se presenta el informe ejecutivo consolidado correspondiente a las notificaciones procesadas para el flujo de <strong>${escapeHtml(processName)}</strong>.
  </p>

  ${notesHtml}

  <!-- KPI Metrics Boxes -->
  <table cellpadding="0" cellspacing="8" style="width: 100%; margin-bottom: 24px; border-collapse: separate;">
    <tr>
      <td style="width: 25%; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 9.5pt; color: #475569; font-weight: bold;">Total Procesados</div>
        <div style="font-size: 18pt; font-weight: bold; color: #0f172a; margin-top: 4px;">${total}</div>
      </td>
      <td style="width: 25%; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 9.5pt; color: #166534; font-weight: bold;">Exitosos / Simulados</div>
        <div style="font-size: 18pt; font-weight: bold; color: #15803d; margin-top: 4px;">${sentCount}</div>
      </td>
      <td style="width: 25%; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 9.5pt; color: #92400e; font-weight: bold;">Sin Correo (Omitidos)</div>
        <div style="font-size: 18pt; font-weight: bold; color: #b45309; margin-top: 4px;">${missingCount}</div>
      </td>
      <td style="width: 25%; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; text-align: center;">
        <div style="font-size: 9.5pt; color: #991b1b; font-weight: bold;">Con Error</div>
        <div style="font-size: 18pt; font-weight: bold; color: #b91c1c; margin-top: 4px;">${errorCount}</div>
      </td>
    </tr>
  </table>

  <!-- Consolidated Records Table -->
  <table
    border="1"
    cellpadding="7"
    style="border-collapse: collapse; width: 100%; border: 1px solid #cbd5e1; margin-bottom: 24px;"
  >
    <thead>
      <tr style="background-color: #003366; color: #ffffff; text-align: left; font-size: 9.5pt;">
        <th style="padding: 10px; width: 24%;">Cliente</th>
        <th style="padding: 10px; width: 22%;">Destinatario(s)</th>
        <th style="padding: 10px; width: 18%;">En Copia (CC)</th>
        <th style="padding: 10px; width: 8%; text-align: center;">Reg.</th>
        <th style="padding: 10px; width: 12%; text-align: center;">Estado</th>
        <th style="padding: 10px; width: 16%;">Detalle / Observación</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <!-- Attachment notice banner -->
  <div style="margin: 0 0 24px 0; padding: 14px 18px; background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; font-size: 10.5pt; color: #166534;">
    <strong>📎 Archivo Excel adjunto:</strong> Se adjunta a este correo el informe oficial consolidado en formato Microsoft Excel (<code>.xlsx</code>) con todas las columnas auditables de cada cliente.
  </div>

  <p style="margin: 0 0 16px 0; font-size: 10.5pt; color: #475569;">
    Este correo fue generado automáticamente por la plataforma <strong>AutoMail Express</strong> de Esenttia.
  </p>

  ${imageTag}

</body>
</html>`;
}
