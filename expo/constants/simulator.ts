import { UMA_VALUE } from './data';

export type InspectionType = 'extraordinaria' | 'ordinaria' | 'constatacion';
export type ProfileType = 'contratista' | 'beneficiario';
export type SimulatorPhase = 'selection' | 'profile' | 'intro' | 'documents' | 'interrogation' | 'verification' | 'results' | 'action-plan';

export interface InspectionTypeConfig {
  id: InspectionType;
  name: string;
  subtitle: string;
  description: string;
  difficulty: number;
  duration: number;
  icon: string;
  color: string;
  phases: SimulatorPhase[];
  documentsRequired: number;
  questionsCount: number;
  preparationTime: number;
}

export const INSPECTION_TYPES: InspectionTypeConfig[] = [
  {
    id: 'extraordinaria',
    name: 'EXTRAORDINARIA',
    subtitle: 'Sin previo aviso',
    description: 'La más exigente. El inspector llega sin previo aviso y debes tener toda la documentación lista.',
    difficulty: 5,
    duration: 60,
    icon: '🚨',
    color: '#EF4444',
    phases: ['selection', 'profile', 'intro', 'documents', 'interrogation', 'verification', 'results', 'action-plan'],
    documentsRequired: 10,
    questionsCount: 10,
    preparationTime: 0,
  },
  {
    id: 'ordinaria',
    name: 'ORDINARIA',
    subtitle: 'Con citatorio 24h antes',
    description: 'Recibes notificación 24 horas antes. Tienes tiempo para preparar documentación.',
    difficulty: 3,
    duration: 45,
    icon: '⏰',
    color: '#F59E0B',
    phases: ['selection', 'profile', 'intro', 'documents', 'interrogation', 'verification', 'results', 'action-plan'],
    documentsRequired: 8,
    questionsCount: 8,
    preparationTime: 1440,
  },
  {
    id: 'constatacion',
    name: 'CONSTATACIÓN REPSE',
    subtitle: 'Visita programada',
    description: 'Visita de verificación para registro o renovación REPSE. Más enfocada en documentación.',
    difficulty: 2,
    duration: 30,
    icon: '✅',
    color: '#10B981',
    phases: ['selection', 'profile', 'intro', 'documents', 'interrogation', 'results', 'action-plan'],
    documentsRequired: 6,
    questionsCount: 6,
    preparationTime: 2880,
  },
];

export interface SimulatorDocument {
  id: string;
  name: string;
  category: string;
  obligatory: boolean;
  icon: string;
  legalBasis: string;
  verifications: string[];
  points: number;
  fineIfMissing: { min: number; max: number; unit: string; perWorker?: boolean };
  forProfiles: ProfileType[];
  forInspectionTypes: InspectionType[];
}

export const SIMULATOR_DOCUMENTS: SimulatorDocument[] = [
  {
    id: 'repse',
    name: 'Aviso de Registro REPSE',
    category: 'Registro',
    obligatory: true,
    icon: '📋',
    legalBasis: 'Art. 15 LFT',
    verifications: ['Vigencia no vencida', 'Código QR legible', 'Actividades registradas', 'Folio visible'],
    points: 15,
    fineIfMissing: { min: 2000, max: 50000, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'contratos_servicios',
    name: 'Contratos con Beneficiarios',
    category: 'Contratos',
    obligatory: true,
    icon: '📄',
    legalBasis: 'Art. 12-15 LFT',
    verifications: ['Por escrito', 'Nombre de beneficiario', 'Número de trabajadores', 'Vigencia clara', 'Objeto del servicio', 'Firmado por ambas partes'],
    points: 12,
    fineIfMissing: { min: 250, max: 5000, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'altas_imss',
    name: 'Altas IMSS de Trabajadores',
    category: 'Seguridad Social',
    obligatory: true,
    icon: '🏥',
    legalBasis: 'Art. 132 fracc. XXIV LFT',
    verifications: ['Todos los trabajadores dados de alta', 'Salarios correctos', 'Fechas de alta correspondientes'],
    points: 15,
    fineIfMissing: { min: 250, max: 5000, unit: 'UMAs', perWorker: true },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'nomina',
    name: 'Recibos de Nómina',
    category: 'Pagos',
    obligatory: true,
    icon: '💰',
    legalBasis: 'Art. 132 LFT',
    verifications: ['Último mes completo', 'Firmas o comprobante digital', 'Deducciones legales', 'Salario igual o superior a contrato'],
    points: 10,
    fineIfMissing: { min: 250, max: 2500, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'icsoe',
    name: 'Acuses ICSOE (últimos 3)',
    category: 'Información',
    obligatory: true,
    icon: '📊',
    legalBasis: 'Art. Quinto Disposiciones REPSE',
    verifications: ['Últimos 3 períodos cuatrimestrales', 'Número de contratos declarados', 'Número de trabajadores coincide'],
    points: 8,
    fineIfMissing: { min: 250, max: 2500, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'sisub',
    name: 'Declaraciones SISUB',
    category: 'Información',
    obligatory: true,
    icon: '📈',
    legalBasis: 'Art. Quinto Disposiciones REPSE',
    verifications: ['Actualizado al período actual', 'Contratos vigentes declarados'],
    points: 8,
    fineIfMissing: { min: 250, max: 2500, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'contratos_individuales',
    name: 'Contratos Individuales de Trabajo',
    category: 'Contratos',
    obligatory: true,
    icon: '📝',
    legalBasis: 'Art. 24-26 LFT',
    verifications: ['Por escrito', 'Nombre del trabajador', 'Puesto y funciones', 'Salario especificado', 'Vigencia', 'Firmado por ambas partes'],
    points: 10,
    fineIfMissing: { min: 250, max: 5000, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'capacitacion',
    name: 'Constancias de Capacitación',
    category: 'Capacitación',
    obligatory: false,
    icon: '🎓',
    legalBasis: 'Art. 132 fracc. XV LFT',
    verifications: ['Acorde a actividad especializada', 'Fecha reciente (último año)', 'Firmadas por capacitador'],
    points: 5,
    fineIfMissing: { min: 250, max: 2500, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'rfc',
    name: 'RFC Activo',
    category: 'Fiscal',
    obligatory: true,
    icon: '🏛️',
    legalBasis: 'Disposiciones REPSE',
    verifications: ['Constancia de situación fiscal', 'Activo (no suspendido)', 'Coincide con razón social'],
    points: 5,
    fineIfMissing: { min: 2000, max: 10000, unit: 'UMAs' },
    forProfiles: ['contratista', 'beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'cedula_sua',
    name: 'Cédula de Determinación SUA',
    category: 'Seguridad Social',
    obligatory: true,
    icon: '📑',
    legalBasis: 'LSS Art. 15-A',
    verifications: ['Período actual', 'Número de trabajadores coincide', 'Pagos al corriente'],
    points: 7,
    fineIfMissing: { min: 250, max: 2500, unit: 'UMAs' },
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'verificacion_repse_proveedor',
    name: 'Verificación REPSE del Proveedor',
    category: 'Verificación',
    obligatory: true,
    icon: '🔍',
    legalBasis: 'Art. 15 LFT',
    verifications: ['Consulta en portal REPSE', 'Vigencia verificada', 'Actividades corresponden al servicio'],
    points: 15,
    fineIfMissing: { min: 2000, max: 50000, unit: 'UMAs' },
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'contrato_proveedor',
    name: 'Contrato con Proveedor',
    category: 'Contratos',
    obligatory: true,
    icon: '📄',
    legalBasis: 'Art. 15 LFT',
    verifications: ['Por escrito', 'Objeto del servicio claro', 'Número de trabajadores', 'Firmado por ambas partes'],
    points: 12,
    fineIfMissing: { min: 250, max: 5000, unit: 'UMAs' },
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'documentacion_mensual',
    name: 'Documentación Mensual del Contratista',
    category: 'Verificación',
    obligatory: true,
    icon: '📁',
    legalBasis: 'Art. Décimo Tercero-C Disposiciones REPSE',
    verifications: ['CFDI de nómina', 'Comprobantes IMSS', 'Comprobantes INFONAVIT', 'Declaración ISR'],
    points: 10,
    fineIfMissing: { min: 250, max: 5000, unit: 'UMAs' },
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
];

export interface SimulatorQuestion {
  id: string;
  category: string;
  type: 'multiple' | 'open';
  obligatory: boolean;
  text: string;
  options?: SimulatorQuestionOption[];
  legalBasis: string;
  forProfiles: ProfileType[];
  forInspectionTypes: InspectionType[];
}

export interface SimulatorQuestionOption {
  id: string;
  text: string;
  correct: boolean | 'partial';
  points: number;
  observation?: string;
  isInfraction?: boolean;
  isGraveInfraction?: boolean;
  isCrime?: boolean;
}

export const SIMULATOR_QUESTIONS: SimulatorQuestion[] = [
  {
    id: 'q1',
    category: 'Identificación',
    type: 'multiple',
    obligatory: true,
    text: '¿Cuenta con registro REPSE vigente?',
    options: [
      { id: 'a', text: 'Sí, está vigente', correct: true, points: 10 },
      { id: 'b', text: 'Sí, pero está vencido', correct: false, points: -15, observation: 'CRÍTICO: REPSE vencido - Multa 2,000-50,000 UMAs', isGraveInfraction: true },
      { id: 'c', text: 'No tengo registro REPSE', correct: false, points: -20, observation: 'CRÍTICO: Sin REPSE - Subcontratación ilegal', isGraveInfraction: true, isCrime: true },
      { id: 'd', text: 'No sé qué es eso', correct: false, points: -20, observation: 'CRÍTICO: Opera sin registro', isGraveInfraction: true },
    ],
    legalBasis: 'Art. 15 LFT',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'q2',
    category: 'Trabajadores',
    type: 'multiple',
    obligatory: true,
    text: '¿Cuántos contratos activos tiene con empresas beneficiarias?',
    options: [
      { id: 'a', text: 'Ninguno', correct: false, points: -15, observation: 'Sin contratos pero presta servicios - Irregular', isInfraction: true },
      { id: 'b', text: '1-5 contratos', correct: true, points: 5 },
      { id: 'c', text: '6-20 contratos', correct: true, points: 5 },
      { id: 'd', text: 'Más de 20 contratos', correct: true, points: 5 },
    ],
    legalBasis: 'Art. 15 LFT - Contratos por escrito',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'q3',
    category: 'Contratos',
    type: 'multiple',
    obligatory: true,
    text: '¿Sus contratos con beneficiarios están por escrito y firmados por ambas partes?',
    options: [
      { id: 'a', text: 'Sí, todos están por escrito y firmados', correct: true, points: 10 },
      { id: 'b', text: 'Algunos sí, otros no', correct: false, points: -5, observation: 'Contratos incompletos', isInfraction: true },
      { id: 'c', text: 'Solo son acuerdos verbales', correct: false, points: -15, observation: 'CRÍTICO: Sin contratos escritos', isGraveInfraction: true },
      { id: 'd', text: 'Tengo contratos pero sin firmar', correct: false, points: -8, observation: 'Contratos sin formalizar', isInfraction: true },
    ],
    legalBasis: 'Art. 15 LFT - Requisito de contrato escrito',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'q4',
    category: 'Seguridad Social',
    type: 'multiple',
    obligatory: true,
    text: '¿Todos sus trabajadores están dados de alta en el IMSS?',
    options: [
      { id: 'a', text: 'Sí, todos están dados de alta', correct: true, points: 10 },
      { id: 'b', text: 'La mayoría sí, algunos no', correct: false, points: -12, observation: 'GRAVE: Trabajadores sin seguridad social', isGraveInfraction: true },
      { id: 'c', text: 'Solo algunos están dados de alta', correct: false, points: -15, observation: 'GRAVE: Mayoría sin IMSS - Multa por c/trabajador', isGraveInfraction: true },
      { id: 'd', text: 'No, ninguno está en IMSS', correct: false, points: -20, observation: 'CRÍTICO: Ningún trabajador asegurado - Delito', isGraveInfraction: true, isCrime: true },
    ],
    legalBasis: 'Art. 132 fracc. XXIV LFT',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'q5',
    category: 'Información',
    type: 'multiple',
    obligatory: true,
    text: '¿Ha presentado las declaraciones ICSOE y SISUB correspondientes?',
    options: [
      { id: 'a', text: 'Sí, estoy al corriente', correct: true, points: 8 },
      { id: 'b', text: 'Tengo algunas pendientes', correct: false, points: -5, observation: 'Declaraciones atrasadas', isInfraction: true },
      { id: 'c', text: 'No sé qué son esas declaraciones', correct: false, points: -10, observation: 'GRAVE: Incumplimiento obligaciones informativas', isGraveInfraction: true },
      { id: 'd', text: 'No he presentado ninguna', correct: false, points: -12, observation: 'CRÍTICO: Sin declaraciones informativas', isGraveInfraction: true },
    ],
    legalBasis: 'Art. Quinto Disposiciones REPSE',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'q6',
    category: 'Actividades',
    type: 'multiple',
    obligatory: true,
    text: '¿Las actividades que realizan sus trabajadores corresponden a las registradas en su REPSE?',
    options: [
      { id: 'a', text: 'Sí, corresponden exactamente', correct: true, points: 10 },
      { id: 'b', text: 'Algunas sí, otras no', correct: false, points: -10, observation: 'INCONSISTENCIA: Presta servicios no registrados', isInfraction: true },
      { id: 'c', text: 'No estoy seguro', correct: false, points: -8, observation: 'Desconoce actividades registradas', isInfraction: true },
    ],
    legalBasis: 'Verificación de objeto social',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'q7',
    category: 'Identificación',
    type: 'multiple',
    obligatory: false,
    text: '¿Sus trabajadores portan identificación visible de su empresa?',
    options: [
      { id: 'a', text: 'Sí, todos portan gafete/uniforme', correct: true, points: 5 },
      { id: 'b', text: 'Algunos sí, otros no', correct: 'partial', points: 2, observation: 'Identificación irregular' },
      { id: 'c', text: 'No portan identificación', correct: false, points: -5, observation: 'Sin identificación de trabajadores', isInfraction: true },
    ],
    legalBasis: 'Art. Octavo Disposiciones REPSE',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'q8',
    category: 'Capacitación',
    type: 'multiple',
    obligatory: false,
    text: '¿Proporciona capacitación a sus trabajadores acorde a los servicios especializados?',
    options: [
      { id: 'a', text: 'Sí, capacitación regular documentada', correct: true, points: 5 },
      { id: 'b', text: 'Sí, pero sin documentación', correct: 'partial', points: 2, observation: 'Capacitación sin constancias' },
      { id: 'c', text: 'Capacitación ocasional', correct: 'partial', points: 1 },
      { id: 'd', text: 'No proporciono capacitación', correct: false, points: -5, observation: 'Sin programa de capacitación', isInfraction: true },
    ],
    legalBasis: 'Art. 132 fracc. XV LFT',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'q9',
    category: 'Subcontratación',
    type: 'multiple',
    obligatory: true,
    text: '¿Usted a su vez subcontrata personal de otras empresas para prestar sus servicios?',
    options: [
      { id: 'a', text: 'No, todos mis trabajadores son empleados directos', correct: true, points: 10 },
      { id: 'b', text: 'Sí, subcontrato algunos servicios especializados', correct: 'partial', points: 0 },
      { id: 'c', text: 'Sí, subcontrato la mayoría de mi personal', correct: false, points: -15, observation: 'GRAVE: Cascada de subcontratación prohibida', isGraveInfraction: true },
    ],
    legalBasis: 'Prohibición de subcontratación en cascada',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'q10',
    category: 'Nómina',
    type: 'multiple',
    obligatory: true,
    text: '¿Los salarios pagados a sus trabajadores coinciden con lo declarado ante el IMSS?',
    options: [
      { id: 'a', text: 'Sí, coinciden exactamente', correct: true, points: 10 },
      { id: 'b', text: 'Hay pequeñas diferencias', correct: false, points: -5, observation: 'Discrepancia salarial', isInfraction: true },
      { id: 'c', text: 'No coinciden', correct: false, points: -15, observation: 'GRAVE: Salarios no coinciden - Posible evasión', isGraveInfraction: true, isCrime: true },
    ],
    legalBasis: 'LSS Art. 27-30',
    forProfiles: ['contratista'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'b1',
    category: 'Verificación',
    type: 'multiple',
    obligatory: true,
    text: '¿Verificó que su proveedor cuente con registro REPSE vigente antes de contratarlo?',
    options: [
      { id: 'a', text: 'Sí, verifiqué su REPSE vigente', correct: true, points: 10 },
      { id: 'b', text: 'No verifiqué', correct: false, points: -15, observation: 'GRAVE: No verificó REPSE - Responsabilidad solidaria', isGraveInfraction: true },
      { id: 'c', text: 'No sé si tiene REPSE', correct: false, points: -15, observation: 'CRÍTICO: Contrata sin verificar legalidad', isGraveInfraction: true },
    ],
    legalBasis: 'Art. 15 LFT - Obligación de verificar REPSE',
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'b2',
    category: 'Actividad',
    type: 'multiple',
    obligatory: true,
    text: '¿Los servicios contratados forman parte de su actividad económica principal?',
    options: [
      { id: 'a', text: 'No, es servicio especializado ajeno a mi actividad', correct: true, points: 10 },
      { id: 'b', text: 'Sí, forma parte de mi actividad principal', correct: false, points: -20, observation: 'CRÍTICO: Subcontratación prohibida de actividad core', isGraveInfraction: true, isCrime: true },
      { id: 'c', text: 'No estoy seguro', correct: false, points: -10, observation: 'Desconoce naturaleza de la relación', isInfraction: true },
    ],
    legalBasis: 'Art. 13 LFT - Prohibición de subcontratar actividad preponderante',
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'b3',
    category: 'Documentación',
    type: 'multiple',
    obligatory: true,
    text: '¿Recibe mensualmente la documentación obligatoria de su proveedor (CFDI, comprobantes IMSS/INFONAVIT)?',
    options: [
      { id: 'a', text: 'Sí, recibo todo mensualmente', correct: true, points: 10 },
      { id: 'b', text: 'Recibo algunos documentos', correct: 'partial', points: 3, observation: 'Documentación incompleta' },
      { id: 'c', text: 'No recibo documentación', correct: false, points: -12, observation: 'GRAVE: Sin documentación de respaldo fiscal', isGraveInfraction: true },
      { id: 'd', text: 'No sabía que debía recibirla', correct: false, points: -10, observation: 'Desconoce obligaciones como beneficiario', isInfraction: true },
    ],
    legalBasis: 'Art. Décimo Tercero-C Disposiciones REPSE',
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
  {
    id: 'b4',
    category: 'Contratos',
    type: 'multiple',
    obligatory: true,
    text: '¿Tiene contrato por escrito con su proveedor de servicios?',
    options: [
      { id: 'a', text: 'Sí, contrato completo y firmado', correct: true, points: 8 },
      { id: 'b', text: 'Tengo contrato pero incompleto', correct: 'partial', points: 3, observation: 'Contrato sin requisitos completos' },
      { id: 'c', text: 'Solo acuerdo verbal', correct: false, points: -12, observation: 'GRAVE: Sin contrato escrito', isGraveInfraction: true },
    ],
    legalBasis: 'Art. 15 LFT - Contrato por escrito obligatorio',
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria', 'constatacion'],
  },
  {
    id: 'b5',
    category: 'Identificación',
    type: 'multiple',
    obligatory: false,
    text: '¿Los trabajadores del contratista están identificados visiblemente en su centro de trabajo?',
    options: [
      { id: 'a', text: 'Sí, portan identificación distintiva', correct: true, points: 5 },
      { id: 'b', text: 'Algunos sí, otros no', correct: 'partial', points: 2 },
      { id: 'c', text: 'No portan identificación', correct: false, points: -5, observation: 'Trabajadores sin identificación del contratista', isInfraction: true },
    ],
    legalBasis: 'Art. Octavo Disposiciones REPSE',
    forProfiles: ['beneficiario'],
    forInspectionTypes: ['extraordinaria', 'ordinaria'],
  },
];

export interface VerificationPoint {
  id: string;
  title: string;
  icon: string;
  question: string;
  points: { complies: number; notComplies: number; notApplicable: number };
  observationIfNotComplies: string;
  legalBasis: string;
  isInfraction: boolean;
  isGraveInfraction?: boolean;
  isCrime?: boolean;
  forProfiles: ProfileType[];
}

export const VERIFICATION_POINTS: VerificationPoint[] = [
  {
    id: 'r1',
    title: 'Trabajadores identificados',
    icon: '👔',
    question: '¿Los trabajadores del contratista portan gafete/uniforme que los identifique?',
    points: { complies: 5, notComplies: -5, notApplicable: 0 },
    observationIfNotComplies: 'Trabajadores sin identificación visible del contratista',
    legalBasis: 'Art. Octavo Disposiciones REPSE',
    isInfraction: true,
    forProfiles: ['contratista', 'beneficiario'],
  },
  {
    id: 'r2',
    title: 'Número de trabajadores',
    icon: '👥',
    question: '¿El número de trabajadores presentes coincide con lo declarado?',
    points: { complies: 8, notComplies: -10, notApplicable: 0 },
    observationIfNotComplies: 'INCONSISTENCIA: Número de trabajadores no coincide',
    legalBasis: 'Verificación de consistencia',
    isInfraction: true,
    isGraveInfraction: true,
    forProfiles: ['contratista', 'beneficiario'],
  },
  {
    id: 'r3',
    title: 'Actividades realizadas',
    icon: '⚙️',
    question: '¿Las actividades corresponden a las descritas en el contrato?',
    points: { complies: 10, notComplies: -15, notApplicable: 0 },
    observationIfNotComplies: 'GRAVE: Trabajadores realizan actividades diferentes',
    legalBasis: 'Art. 13-15 LFT',
    isInfraction: true,
    isGraveInfraction: true,
    forProfiles: ['contratista', 'beneficiario'],
  },
  {
    id: 'r4',
    title: 'Actividad principal',
    icon: '🏭',
    question: '¿Los trabajadores NO realizan actividades de la actividad principal del beneficiario?',
    points: { complies: 10, notComplies: -20, notApplicable: 0 },
    observationIfNotComplies: 'CRÍTICO: Subcontratación prohibida - Actividad core',
    legalBasis: 'Art. 13 LFT',
    isInfraction: true,
    isGraveInfraction: true,
    isCrime: true,
    forProfiles: ['beneficiario'],
  },
  {
    id: 'r5',
    title: 'Condiciones de seguridad',
    icon: '🦺',
    question: '¿Los trabajadores cuentan con equipo de protección personal adecuado?',
    points: { complies: 5, notComplies: -8, notApplicable: 0 },
    observationIfNotComplies: 'Sin equipo de protección personal',
    legalBasis: 'Art. 132 fracc. XVI LFT',
    isInfraction: true,
    forProfiles: ['contratista', 'beneficiario'],
  },
];

export interface InspectorDialogue {
  phase: string;
  type: InspectionType;
  messages: string[];
}

export const INSPECTOR_DIALOGUES: InspectorDialogue[] = [
  {
    phase: 'intro',
    type: 'extraordinaria',
    messages: [
      'Buenos días. Soy inspector federal del trabajo.',
      'Vengo a realizar una inspección EXTRAORDINARIA en materia de subcontratación.',
      'Favor de mostrarme su identificación oficial y la de la persona que atenderá la inspección.',
      '¿Es usted el patrón, representante legal o persona autorizada para atender esta diligencia?',
    ],
  },
  {
    phase: 'intro',
    type: 'ordinaria',
    messages: [
      'Buenos días. Soy inspector federal del trabajo.',
      'Vengo a realizar la inspección ORDINARIA programada mediante citatorio.',
      '¿Recibieron el citatorio con 24 horas de anticipación?',
      'Procedemos a iniciar la inspección. Favor de identificarse.',
    ],
  },
  {
    phase: 'intro',
    type: 'constatacion',
    messages: [
      'Buenos días. Soy inspector federal del trabajo.',
      'Vengo a realizar la visita de CONSTATACIÓN REPSE.',
      'Procedemos a verificar la información de su registro.',
    ],
  },
  {
    phase: 'documents',
    type: 'extraordinaria',
    messages: [
      'Ahora procederé a solicitar la documentación requerida.',
      'Deberá presentar los documentos de manera inmediata.',
      'Cualquier documento faltante será registrado en el acta.',
    ],
  },
  {
    phase: 'documents',
    type: 'ordinaria',
    messages: [
      'Procedamos con la revisión documental.',
      'Confío en que tuvieron tiempo para preparar la documentación.',
    ],
  },
  {
    phase: 'documents',
    type: 'constatacion',
    messages: [
      'Verificaremos la documentación relacionada con su registro REPSE.',
    ],
  },
  {
    phase: 'interrogation',
    type: 'extraordinaria',
    messages: [
      'Ahora realizaré algunas preguntas.',
      'Responda con la verdad. Proporcionar información falsa es una falta grave.',
    ],
  },
  {
    phase: 'interrogation',
    type: 'ordinaria',
    messages: [
      'Procedamos con el interrogatorio.',
      'Responda con la verdad para que todo quede debidamente asentado.',
    ],
  },
  {
    phase: 'interrogation',
    type: 'constatacion',
    messages: [
      'Tengo algunas preguntas sobre su operación.',
    ],
  },
  {
    phase: 'verification',
    type: 'extraordinaria',
    messages: [
      'Realizaré un recorrido por las instalaciones.',
      'Verificaré las condiciones reales de trabajo.',
    ],
  },
  {
    phase: 'verification',
    type: 'ordinaria',
    messages: [
      'Procederé a constatar físicamente algunos aspectos.',
    ],
  },
  {
    phase: 'close_ok',
    type: 'extraordinaria',
    messages: [
      'La inspección ha concluido sin observaciones graves.',
      'Se emitirá acta en los próximos días hábiles.',
    ],
  },
  {
    phase: 'close_ok',
    type: 'ordinaria',
    messages: [
      'La inspección ha concluido satisfactoriamente.',
      'Recibirá copia del acta.',
    ],
  },
  {
    phase: 'close_ok',
    type: 'constatacion',
    messages: [
      'La visita de constatación ha concluido.',
      'Su registro REPSE se encuentra en orden.',
    ],
  },
  {
    phase: 'close_infractions',
    type: 'extraordinaria',
    messages: [
      'Se detectaron infracciones durante la inspección.',
      'Se emitirá acta circunstanciada con las observaciones y posibles sanciones.',
      'Tiene derecho a presentar pruebas en los plazos establecidos.',
    ],
  },
  {
    phase: 'close_infractions',
    type: 'ordinaria',
    messages: [
      'Se detectaron algunas irregularidades.',
      'Se asentarán en el acta correspondiente.',
    ],
  },
  {
    phase: 'close_infractions',
    type: 'constatacion',
    messages: [
      'Se detectaron observaciones que deberá corregir.',
      'Recibirá notificación con los plazos para subsanar.',
    ],
  },
];

export function calculateFineAmount(minUMA: number, maxUMA: number): { min: number; max: number } {
  return {
    min: Math.round(minUMA * UMA_VALUE),
    max: Math.round(maxUMA * UMA_VALUE),
  };
}

export function getComplianceLevel(score: number, maxScore: number): { level: string; color: string; text: string } {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (percentage >= 80) return { level: 'alto', color: '#10B981', text: 'Excelente cumplimiento' };
  if (percentage >= 60) return { level: 'medio', color: '#F59E0B', text: 'Cumplimiento regular' };
  return { level: 'bajo', color: '#EF4444', text: 'Cumplimiento deficiente' };
}
