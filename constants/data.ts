export const UMA_VALUE = 113.14;

export const USER_TYPES = {
  CONTRATISTA: 'contratista',
  BENEFICIARIO: 'beneficiario',
  TRABAJADOR: 'trabajador',
  GENERAL: 'general',
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES];

export interface DiagnosticQuestion {
  id: string;
  text: string;
  options: {
    value: string;
    label: string;
    score: number;
    isCritical?: boolean;
  }[];
  forUserTypes: UserType[];
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'repse_registro',
    text: '¿Tienes registro REPSE vigente?',
    options: [
      { value: 'si', label: 'Sí, vigente', score: 20 },
      { value: 'vencido', label: 'Sí, pero vencido', score: 5, isCritical: true },
      { value: 'no', label: 'No', score: 0, isCritical: true },
      { value: 'no_se', label: 'No sé qué es', score: 0, isCritical: true },
    ],
    forUserTypes: ['contratista'],
  },
  {
    id: 'contratos_activos',
    text: '¿Cuántos contratos activos tienes con clientes?',
    options: [
      { value: '0', label: '0', score: 0 },
      { value: '1-5', label: '1 a 5', score: 10 },
      { value: '6-20', label: '6 a 20', score: 10 },
      { value: '+20', label: 'Más de 20', score: 10 },
    ],
    forUserTypes: ['contratista'],
  },
  {
    id: 'imss_trabajadores',
    text: '¿Tus trabajadores están dados de alta en el IMSS?',
    options: [
      { value: 'todos', label: 'Todos', score: 20 },
      { value: 'algunos', label: 'Algunos', score: 5, isCritical: true },
      { value: 'ninguno', label: 'Ninguno', score: 0, isCritical: true },
      { value: 'no_se', label: 'No sé', score: 0, isCritical: true },
    ],
    forUserTypes: ['contratista'],
  },
  {
    id: 'contratos_escritos',
    text: '¿Tienes contratos por escrito con tus clientes?',
    options: [
      { value: 'si_todos', label: 'Sí, con todos', score: 15 },
      { value: 'si_algunos', label: 'Sí, con algunos', score: 5 },
      { value: 'no', label: 'No', score: 0, isCritical: true },
    ],
    forUserTypes: ['contratista'],
  },
  {
    id: 'icsoe_sisub',
    text: '¿Tienes al día tus obligaciones ICSOE y SISUB?',
    options: [
      { value: 'si', label: 'Sí, actualizados', score: 15 },
      { value: 'parcial', label: 'Parcialmente', score: 5 },
      { value: 'no', label: 'No', score: 0, isCritical: true },
      { value: 'no_se', label: 'No sé qué son', score: 0, isCritical: true },
    ],
    forUserTypes: ['contratista'],
  },
  {
    id: 'proveedor_repse',
    text: '¿Verificaste que tu proveedor tenga REPSE vigente?',
    options: [
      { value: 'si', label: 'Sí, lo verifiqué', score: 25 },
      { value: 'no', label: 'No lo verifiqué', score: 0, isCritical: true },
      { value: 'no_se', label: 'No sé qué es REPSE', score: 0, isCritical: true },
    ],
    forUserTypes: ['beneficiario'],
  },
  {
    id: 'actividad_principal',
    text: '¿Los servicios contratados forman parte de tu actividad principal?',
    options: [
      { value: 'no', label: 'No, son servicios complementarios', score: 25 },
      { value: 'si', label: 'Sí, son parte de mi giro', score: 0, isCritical: true },
      { value: 'no_seguro', label: 'No estoy seguro', score: 5 },
    ],
    forUserTypes: ['beneficiario'],
  },
  {
    id: 'documentacion_mensual',
    text: '¿Recibes documentación mensual del contratista?',
    options: [
      { value: 'si', label: 'Sí, completa', score: 25 },
      { value: 'parcial', label: 'Sí, pero incompleta', score: 10 },
      { value: 'no', label: 'No', score: 0, isCritical: true },
      { value: 'que_docs', label: '¿Qué documentación?', score: 0, isCritical: true },
    ],
    forUserTypes: ['beneficiario'],
  },
  {
    id: 'contratos_beneficiario',
    text: '¿Tienes contratos por escrito con tus proveedores de servicios?',
    options: [
      { value: 'si', label: 'Sí, con todos', score: 25 },
      { value: 'algunos', label: 'Con algunos', score: 10 },
      { value: 'no', label: 'No', score: 0, isCritical: true },
    ],
    forUserTypes: ['beneficiario'],
  },
];

export interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  description: string;
  legalBasis: string;
  consequence: string;
  forUserTypes: UserType[];
  priority: 'high' | 'medium' | 'low';
}

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'repse_vigente',
    category: 'Registro y Documentación',
    text: 'Registro REPSE vigente',
    description: 'Debes contar con tu registro ante la STPS actualizado y sin vencer.',
    legalBasis: 'Art. 15 LFT',
    consequence: 'Multa de 2,000 a 50,000 UMAs ($217,140 a $5,428,500 MXN)',
    forUserTypes: ['contratista'],
    priority: 'high',
  },
  {
    id: 'rfc_activo',
    category: 'Registro y Documentación',
    text: 'RFC activo ante el SAT',
    description: 'Tu Registro Federal de Contribuyentes debe estar activo.',
    legalBasis: 'CFF Art. 27',
    consequence: 'Imposibilidad de facturar y posibles multas fiscales',
    forUserTypes: ['contratista', 'beneficiario'],
    priority: 'high',
  },
  {
    id: 'contratos_escritos',
    category: 'Registro y Documentación',
    text: 'Contratos escritos con clientes/proveedores',
    description: 'Todos los servicios especializados deben estar formalizados por escrito.',
    legalBasis: 'Art. 15 LFT',
    consequence: 'Multa de 250 a 5,000 UMAs',
    forUserTypes: ['contratista', 'beneficiario'],
    priority: 'high',
  },
  {
    id: 'alta_imss',
    category: 'Obligaciones con Trabajadores',
    text: 'Alta IMSS de todos los trabajadores',
    description: 'Cada trabajador debe estar registrado ante el IMSS desde el primer día.',
    legalBasis: 'LSS Art. 15',
    consequence: 'Multa de 20 a 350 VSMG por trabajador',
    forUserTypes: ['contratista'],
    priority: 'high',
  },
  {
    id: 'contratos_individuales',
    category: 'Obligaciones con Trabajadores',
    text: 'Contratos individuales de trabajo',
    description: 'Cada trabajador debe tener contrato individual firmado.',
    legalBasis: 'Art. 24 LFT',
    consequence: 'El patrón asume todas las condiciones alegadas por el trabajador',
    forUserTypes: ['contratista'],
    priority: 'high',
  },
  {
    id: 'recibos_nomina',
    category: 'Obligaciones con Trabajadores',
    text: 'Recibos de nómina timbrados (CFDI)',
    description: 'Emitir recibos de nómina electrónicos por cada pago.',
    legalBasis: 'Art. 99 LFT',
    consequence: 'Multa de 50 a 5,000 UMAs',
    forUserTypes: ['contratista'],
    priority: 'medium',
  },
  {
    id: 'icsoe',
    category: 'Obligaciones de Información',
    text: 'ICSOE actualizado',
    description: 'Informe de Cumplimiento de Obligaciones presentado en tiempo.',
    legalBasis: 'Disposiciones REPSE',
    consequence: 'Posible cancelación del registro REPSE',
    forUserTypes: ['contratista'],
    priority: 'high',
  },
  {
    id: 'sisub',
    category: 'Obligaciones de Información',
    text: 'SISUB actualizado',
    description: 'Sistema de Información de Subcontratación al corriente.',
    legalBasis: 'Disposiciones REPSE',
    consequence: 'Multa de 250 a 2,500 UMAs',
    forUserTypes: ['contratista'],
    priority: 'high',
  },
  {
    id: 'verificar_repse_proveedor',
    category: 'Verificación de Proveedores',
    text: 'Verificación de REPSE del proveedor',
    description: 'Debes verificar que tu proveedor tenga REPSE vigente antes de contratar.',
    legalBasis: 'Art. 15 LFT',
    consequence: 'Responsabilidad solidaria por incumplimientos',
    forUserTypes: ['beneficiario'],
    priority: 'high',
  },
  {
    id: 'recibir_docs_mensuales',
    category: 'Verificación de Proveedores',
    text: 'Recepción de documentación mensual',
    description: 'Solicitar y resguardar comprobantes de cumplimiento cada mes.',
    legalBasis: 'Art. 15 LFT',
    consequence: 'Responsabilidad solidaria',
    forUserTypes: ['beneficiario'],
    priority: 'medium',
  },
];

export interface FineItem {
  id: string;
  name: string;
  description: string;
  minUMA: number;
  maxUMA: number;
  perWorker?: boolean;
  additionalConsequences?: string[];
}

export const FINES_CATALOG: FineItem[] = [
  {
    id: 'sin_repse',
    name: 'Sin registro REPSE',
    description: 'No contar con el registro vigente ante la STPS',
    minUMA: 2000,
    maxUMA: 50000,
    additionalConsequences: ['Cancelación del registro', 'Imposibilidad de prestar servicios'],
  },
  {
    id: 'contrato_sin_requisitos',
    name: 'Contrato sin requisitos legales',
    description: 'Contratos que no cumplen con los elementos del Art. 15 LFT',
    minUMA: 250,
    maxUMA: 5000,
  },
  {
    id: 'sin_imss',
    name: 'Trabajadores sin alta IMSS',
    description: 'No registrar a trabajadores ante el IMSS',
    minUMA: 250,
    maxUMA: 5000,
    perWorker: true,
    additionalConsequences: ['Pago de cuotas omitidas', 'Recargos y actualizaciones'],
  },
  {
    id: 'sin_icsoe_sisub',
    name: 'Sin ICSOE/SISUB actualizado',
    description: 'No cumplir con las obligaciones de información',
    minUMA: 250,
    maxUMA: 2500,
  },
  {
    id: 'subcontratacion_prohibida',
    name: 'Subcontratación prohibida',
    description: 'Subcontratar personal para actividad preponderante',
    minUMA: 2000,
    maxUMA: 50000,
    additionalConsequences: ['Los trabajadores se consideran del beneficiario', 'Delito fiscal (3-9 años de prisión)'],
  },
];

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'que_es_repse',
    question: '¿Qué es el REPSE?',
    answer: 'El Registro de Prestadoras de Servicios Especializados u Obras Especializadas (REPSE) es un registro obligatorio ante la Secretaría del Trabajo y Previsión Social (STPS) para empresas que prestan servicios especializados o ejecutan obras especializadas que no forman parte del objeto social ni de la actividad económica preponderante de la empresa beneficiaria.',
    category: 'Conceptos Básicos',
  },
  {
    id: 'costo_repse',
    question: '¿Cuánto cuesta el registro REPSE?',
    answer: 'El trámite de registro REPSE ante la STPS es COMPLETAMENTE GRATUITO. No debes pagar ninguna cantidad al gobierno. Si alguien te cobra por "gestionar" tu registro, desconfía y verifica directamente en repse.stps.gob.mx',
    category: 'Conceptos Básicos',
  },
  {
    id: 'renovacion_repse',
    question: '¿Cada cuánto debo renovar mi REPSE?',
    answer: 'El registro REPSE tiene una vigencia de 3 AÑOS a partir de la fecha de emisión. Debes renovarlo antes de que venza. Te recomendamos iniciar el trámite con al menos 60 días de anticipación para evitar contratiempos.',
    category: 'Conceptos Básicos',
  },
  {
    id: 'limpieza_subcontratar',
    question: '¿Puedo subcontratar servicios de limpieza?',
    answer: 'SÍ puedes subcontratar limpieza SIEMPRE QUE la limpieza NO sea tu actividad principal ni forme parte de tu objeto social. Por ejemplo: Una fábrica de muebles SÍ puede subcontratar limpieza. Una empresa de limpieza NO puede subcontratar a otra empresa de limpieza para hacer el mismo trabajo.',
    category: 'Casos Prácticos',
  },
  {
    id: 'diferencia_contratista_beneficiario',
    question: '¿Cuál es la diferencia entre Contratista y Beneficiario?',
    answer: 'CONTRATISTA: Es quien PRESTA los servicios especializados. Tiene trabajadores y registro REPSE. BENEFICIARIO: Es quien CONTRATA los servicios. Recibe el servicio y debe verificar que el contratista cumpla con sus obligaciones.',
    category: 'Conceptos Básicos',
  },
  {
    id: 'responsabilidad_solidaria',
    question: '¿Qué es la responsabilidad solidaria?',
    answer: 'Si el contratista no cumple con sus obligaciones laborales o fiscales, el beneficiario puede ser obligado a pagar. Por eso es crucial verificar el cumplimiento del contratista y conservar la documentación probatoria.',
    category: 'Conceptos Básicos',
  },
  {
    id: 'documentos_mensuales',
    question: '¿Qué documentos debo pedir mensualmente al contratista?',
    answer: 'Debes solicitar: 1) Comprobante de pago de cuotas IMSS, 2) Comprobante de pago de aportaciones INFONAVIT, 3) Declaración de ISR retenido a trabajadores, 4) CFDIs de nómina del personal asignado, 5) Constancia de situación fiscal vigente.',
    category: 'Documentación',
  },
  {
    id: 'que_pasa_inspeccion',
    question: '¿Qué pasa durante una inspección?',
    answer: 'El inspector se identifica, solicita documentación (REPSE, contratos, nóminas, IMSS), puede entrevistar trabajadores, verifica instalaciones y levanta acta. Tienes derecho a que esté presente un representante legal y a recibir copia del acta.',
    category: 'Inspecciones',
  },
];

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  type: 'template' | 'guide' | 'legal';
  icon: string;
  downloadUrl?: string;
}

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/rafaelejandrots-dot/rork-cumplimiento-repse-gratis/main';

export const DOCUMENTS: Document[] = [
  {
    id: 'contrato_servicios',
    title: 'Contrato de Servicios Especializados',
    description: 'Plantilla completa con todos los requisitos del Art. 15 LFT',
    category: 'Plantillas',
    type: 'template',
    icon: 'FileText',
    downloadUrl: `${GITHUB_RAW_BASE}/DOCUMENTO%201%20CONTRATO%20DE%20SERVICIOS%20ESPECIALIZADOS.docx`,
  },
  {
    id: 'contrato_individual',
    title: 'Contrato Individual de Trabajo',
    description: 'Formato para formalizar la relación laboral con trabajadores',
    category: 'Plantillas',
    type: 'template',
    icon: 'FileText',
    downloadUrl: `${GITHUB_RAW_BASE}/DOCUMENTO%202%20CONTRATO%20INDIVIDUAL%20DE%20TRABAJO.docx`,
  },
  {
    id: 'carta_entrega_docs',
    title: 'Carta de Entrega de Documentación',
    description: 'Formato para documentar la entrega mensual de información',
    category: 'Plantillas',
    type: 'template',
    icon: 'FileText',
    downloadUrl: `${GITHUB_RAW_BASE}/DOCUMENTO%203%20CARTA%20DE%20ENTREGA%20DE%20DOCUMENTACION.docx`,
  },
  {
    id: 'guia_repse_pasos',
    title: '¿Qué es el REPSE en 5 pasos?',
    description: 'Infografía explicativa del registro REPSE',
    category: 'Guías',
    type: 'guide',
    icon: 'BookOpen',
    downloadUrl: `${GITHUB_RAW_BASE}/Guia%201.pdf`,
  },
  {
    id: 'guia_inspeccion',
    title: 'Flujo de una Inspección STPS',
    description: 'Paso a paso de qué esperar durante una inspección',
    category: 'Guías',
    type: 'guide',
    icon: 'BookOpen',
    downloadUrl: `${GITHUB_RAW_BASE}/Guia%202.pdf`,
  },
  {
    id: 'guia_preparacion',
    title: 'Cómo prepararte en 24 horas',
    description: 'Guía de emergencia para inspección inminente',
    category: 'Guías',
    type: 'guide',
    icon: 'Clock',
    downloadUrl: `${GITHUB_RAW_BASE}/Guia%203.pdf`,
  },
  {
    id: 'art_15_lft',
    title: 'Artículos 12-15 de la LFT',
    description: 'Texto legal completo con explicaciones',
    category: 'Marco Legal',
    type: 'legal',
    icon: 'Scale',
    downloadUrl: `${GITHUB_RAW_BASE}/Marco%20legal%201.pdf`,
  },
  {
    id: 'tabla_multas',
    title: 'Tabla de Multas 2025',
    description: 'Catálogo actualizado de sanciones por incumplimiento',
    category: 'Marco Legal',
    type: 'legal',
    icon: 'AlertTriangle',
    downloadUrl: `${GITHUB_RAW_BASE}/Marco%20legal%202.pdf`,
  },
  {
    id: 'documentos_zip',
    title: 'Todos los Documentos (ZIP)',
    description: 'Descarga completa de plantillas, guías y marco legal',
    category: 'Plantillas',
    type: 'template',
    icon: 'FileText',
    downloadUrl: `${GITHUB_RAW_BASE}/Documentos.zip`,
  },
];
