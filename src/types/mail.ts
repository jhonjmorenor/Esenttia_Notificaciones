export type ProcessType = 'fechas' | 'pendientes' | 'despachados' | 'vip';

export interface RawExcelRow {
  [key: string]: any;
}

export interface OrderItem {
  refCliente: string; // OC / Documento Comercial
  pedido: string;     // Pedido / Documento Comercial
  descripcion: string;// Material / Descripción de Posición
  cantidad: string;   // Cantidad
  fecha?: string;     // Fecha (disponibilidad, despacho o entrega)
  rawRowIndex: number;

  // VIP specific fields
  posicion?: string;       // Posición (SD)
  remision?: string;       // Remisión
  estadoCartera?: string;  // Estado de Cartera
  estadoInventario?: string;// Estado de Inventario
  estadoEnvio?: string;    // Estado de Envío
  placa?: string;          // Placa
  transportador?: string;  // Transportador
  contactoNombre?: string; // Nombre Contacto 1 o 2
}

export interface ClientGroup {
  id: string;
  cliente: string;
  contactoNombre?: string; // VIP contact name
  items: OrderItem[];
  to: string[];
  cc: string[];
  asunto: string;
  hasValidEmail: boolean;
  status: 'PENDIENTE' | 'ENVIADO' | 'PRUEBA' | 'SIN CORREO' | 'ERROR';
  errorDetails?: string;
  sentAt?: string;
  processType: ProcessType;
}

export interface ColumnValidationResult {
  isValid: boolean;
  foundColumns: string[];
  missingColumns: string[];
  detectedProcessType: ProcessType;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  senderName: string;
}

export interface EmailTemplateConfig {
  processType: ProcessType;
  title: string;
  description: string;
  companyName: string;
  greetingPrefix: string;
  introText: string;
  subtitleBeforeTable?: string;
  logisticsDisclaimer: string;
  closingText: string;
  supportChannels: {
    whatsapp: string;
    website: string;
    phone: string;
    email: string;
  };
  tableHeaderBg: string;
  tableHeaderColor: string;
  bannerImageBase64?: string;
}

export interface SendReportItem {
  CLIENTE: string;
  CORREOS: string;
  CC: string;
  ASUNTO: string;
  TOTAL_PEDIDOS: number;
  TOTAL_FILAS?: number;
  TOTAL_DOCUMENTOS?: number;
  TOTAL_POSICIONES?: number;
  FECHA_ENVIO: string;
  ESTADO: 'ENVIADO' | 'PRUEBA' | 'SIN CORREO' | 'ERROR';
  ERROR: string;
  PROCESO: ProcessType;
}
