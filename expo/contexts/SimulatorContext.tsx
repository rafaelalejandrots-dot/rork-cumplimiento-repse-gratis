import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import {
  InspectionType,
  ProfileType,
  SimulatorPhase,
  INSPECTION_TYPES,
  SIMULATOR_DOCUMENTS,
  SIMULATOR_QUESTIONS,
  VERIFICATION_POINTS,
  calculateFineAmount,
  getComplianceLevel,
  SimulatorDocument,
  SimulatorQuestion,
  VerificationPoint,
} from '@/constants/simulator';
import { UMA_VALUE } from '@/constants/data';

const SIMULATOR_STORAGE_KEY = 'simulator_history';

export interface DocumentResult {
  documentId: string;
  presented: boolean;
  valid: boolean;
  points: number;
  observation?: string;
}

export interface QuestionResult {
  questionId: string;
  answerId: string | null;
  points: number;
  observation?: string;
  isInfraction: boolean;
  isGraveInfraction: boolean;
  isCrime: boolean;
}

export interface VerificationResult {
  pointId: string;
  status: 'complies' | 'notComplies' | 'notApplicable' | null;
  points: number;
  observation?: string;
}

export interface Infraction {
  id: string;
  description: string;
  legalBasis: string;
  isGrave: boolean;
  isCrime: boolean;
  fineMin: number;
  fineMax: number;
  fineUnit: string;
}

export interface SimulationResult {
  id: string;
  date: string;
  inspectionType: InspectionType;
  profile: ProfileType;
  score: number;
  maxScore: number;
  percentage: number;
  level: string;
  levelColor: string;
  levelText: string;
  documentResults: DocumentResult[];
  questionResults: QuestionResult[];
  verificationResults: VerificationResult[];
  infractions: Infraction[];
  totalFineMin: number;
  totalFineMax: number;
  documentsPresented: number;
  documentsMissing: number;
  questionsCorrect: number;
  questionsIncorrect: number;
  questionsSkipped: number;
  verificationComplied: number;
  verificationNotComplied: number;
  hasCrimeRisk: boolean;
  hasREPSECancellationRisk: boolean;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  steps: string[];
  estimatedTime: string;
  estimatedCost: string;
  points: number;
  fineAvoided?: { min: number; max: number };
  completed: boolean;
}

export const [SimulatorProvider, useSimulator] = createContextHook(() => {
  const queryClient = useQueryClient();
  
  const [phase, setPhase] = useState<SimulatorPhase>('selection');
  const [inspectionType, setInspectionType] = useState<InspectionType | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [workerCount, setWorkerCount] = useState<string>('1-10');
  const [hasREPSE, setHasREPSE] = useState<string>('');
  
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [documentResults, setDocumentResults] = useState<DocumentResult[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const historyQuery = useQuery({
    queryKey: ['simulatorHistory'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(SIMULATOR_STORAGE_KEY);
        return stored ? JSON.parse(stored) as SimulationResult[] : [];
      } catch (error) {
        console.log('Error loading simulator history:', error);
        return [];
      }
    },
    staleTime: Infinity,
  });

  const { mutate: saveResult } = useMutation({
    mutationFn: async (result: SimulationResult) => {
      const history = historyQuery.data || [];
      const newHistory = [result, ...history].slice(0, 10);
      await AsyncStorage.setItem(SIMULATOR_STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    },
    onSuccess: (newHistory) => {
      queryClient.setQueryData(['simulatorHistory'], newHistory);
    },
  });

  const inspectionConfig = useMemo(() => {
    return INSPECTION_TYPES.find(t => t.id === inspectionType);
  }, [inspectionType]);

  const relevantDocuments = useMemo((): SimulatorDocument[] => {
    if (!profile || !inspectionType) return [];
    return SIMULATOR_DOCUMENTS.filter(
      doc => doc.forProfiles.includes(profile) && doc.forInspectionTypes.includes(inspectionType)
    );
  }, [profile, inspectionType]);

  const relevantQuestions = useMemo((): SimulatorQuestion[] => {
    if (!profile || !inspectionType) return [];
    return SIMULATOR_QUESTIONS.filter(
      q => q.forProfiles.includes(profile) && q.forInspectionTypes.includes(inspectionType)
    );
  }, [profile, inspectionType]);

  const relevantVerificationPoints = useMemo((): VerificationPoint[] => {
    if (!profile || !inspectionType) return [];
    if (!inspectionConfig?.phases.includes('verification')) return [];
    return VERIFICATION_POINTS.filter(v => v.forProfiles.includes(profile));
  }, [profile, inspectionType, inspectionConfig]);

  const currentQuestion = useMemo(() => {
    return relevantQuestions[currentQuestionIndex] || null;
  }, [relevantQuestions, currentQuestionIndex]);

  const resetSimulator = useCallback(() => {
    setPhase('selection');
    setInspectionType(null);
    setProfile(null);
    setCompanyName('');
    setWorkerCount('1-10');
    setHasREPSE('');
    setCurrentDialogueIndex(0);
    setDocumentResults([]);
    setCurrentQuestionIndex(0);
    setQuestionResults([]);
    setVerificationResults([]);
    setSimulationResult(null);
    setActionItems([]);
    setStartTime(null);
  }, []);

  const selectInspectionType = useCallback((type: InspectionType) => {
    setInspectionType(type);
    setPhase('profile');
  }, []);

  const selectProfile = useCallback((profileType: ProfileType) => {
    setProfile(profileType);
    setPhase('intro');
    setStartTime(new Date());
  }, []);

  const advanceDialogue = useCallback(() => {
    setCurrentDialogueIndex(prev => prev + 1);
  }, []);

  const startDocumentPhase = useCallback(() => {
    setPhase('documents');
    setCurrentDialogueIndex(0);
  }, []);

  const handleDocumentResponse = useCallback((documentId: string, presented: boolean, valid: boolean = true) => {
    const document = relevantDocuments.find(d => d.id === documentId);
    if (!document) return;

    let points = 0;
    let observation: string | undefined;

    if (presented && valid) {
      points = document.points;
    } else if (presented && !valid) {
      points = Math.floor(document.points * 0.5);
      observation = 'Documento con observaciones';
    } else {
      points = document.obligatory ? -document.points : 0;
      observation = document.obligatory 
        ? `Falta documento obligatorio: ${document.name}`
        : `Documento recomendado no presentado`;
    }

    const result: DocumentResult = {
      documentId,
      presented,
      valid,
      points,
      observation,
    };

    setDocumentResults(prev => {
      const filtered = prev.filter(r => r.documentId !== documentId);
      return [...filtered, result];
    });
  }, [relevantDocuments]);

  const startInterrogationPhase = useCallback(() => {
    setPhase('interrogation');
    setCurrentDialogueIndex(0);
    setCurrentQuestionIndex(0);
  }, []);

  const handleQuestionAnswer = useCallback((answerId: string | null) => {
    const question = currentQuestion;
    if (!question) return;

    let points = 0;
    let observation: string | undefined;
    let isInfraction = false;
    let isGraveInfraction = false;
    let isCrime = false;

    if (answerId && question.options) {
      const option = question.options.find(o => o.id === answerId);
      if (option) {
        points = option.points;
        observation = option.observation;
        isInfraction = option.isInfraction || false;
        isGraveInfraction = option.isGraveInfraction || false;
        isCrime = option.isCrime || false;
      }
    } else {
      points = -2;
      observation = 'Pregunta no respondida';
    }

    const result: QuestionResult = {
      questionId: question.id,
      answerId,
      points,
      observation,
      isInfraction,
      isGraveInfraction,
      isCrime,
    };

    setQuestionResults(prev => [...prev, result]);
    
    if (currentQuestionIndex < relevantQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (inspectionConfig?.phases.includes('verification')) {
        startVerificationPhase();
      } else {
        calculateFinalResult();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, currentQuestionIndex, relevantQuestions.length, inspectionConfig]);

  const startVerificationPhase = useCallback(() => {
    setPhase('verification');
    setCurrentDialogueIndex(0);
  }, []);

  const handleVerificationResponse = useCallback((
    pointId: string, 
    status: 'complies' | 'notComplies' | 'notApplicable'
  ) => {
    const point = relevantVerificationPoints.find(p => p.id === pointId);
    if (!point) return;

    let points = 0;
    let observation: string | undefined;

    if (status === 'complies') {
      points = point.points.complies;
    } else if (status === 'notComplies') {
      points = point.points.notComplies;
      observation = point.observationIfNotComplies;
    } else {
      points = point.points.notApplicable;
    }

    const result: VerificationResult = {
      pointId,
      status,
      points,
      observation,
    };

    setVerificationResults(prev => {
      const filtered = prev.filter(r => r.pointId !== pointId);
      return [...filtered, result];
    });
  }, [relevantVerificationPoints]);

  const calculateFinalResult = useCallback(() => {
    if (!inspectionType || !profile) return;

    let totalScore = 0;
    let maxScore = 0;
    const infractions: Infraction[] = [];
    let hasCrimeRisk = false;
    let hasREPSECancellationRisk = false;

    relevantDocuments.forEach(doc => {
      maxScore += doc.points;
      const result = documentResults.find(r => r.documentId === doc.id);
      if (result) {
        totalScore += result.points;
        if (!result.presented && doc.obligatory) {
          const fine = calculateFineAmount(doc.fineIfMissing.min, doc.fineIfMissing.max);
          infractions.push({
            id: `doc_${doc.id}`,
            description: `Falta documento: ${doc.name}`,
            legalBasis: doc.legalBasis,
            isGrave: doc.obligatory,
            isCrime: false,
            fineMin: fine.min,
            fineMax: fine.max,
            fineUnit: doc.fineIfMissing.unit,
          });
          if (doc.id === 'repse') {
            hasREPSECancellationRisk = true;
          }
        }
      }
    });

    relevantQuestions.forEach(q => {
      if (q.options) {
        const maxOptionScore = Math.max(...q.options.filter(o => o.correct === true).map(o => o.points));
        maxScore += maxOptionScore > 0 ? maxOptionScore : 10;
      }
      const result = questionResults.find(r => r.questionId === q.id);
      if (result) {
        totalScore += result.points;
        if (result.isInfraction || result.isGraveInfraction) {
          infractions.push({
            id: `q_${q.id}`,
            description: result.observation || 'Infracción detectada',
            legalBasis: q.legalBasis,
            isGrave: result.isGraveInfraction,
            isCrime: result.isCrime,
            fineMin: result.isGraveInfraction ? 2000 * UMA_VALUE : 250 * UMA_VALUE,
            fineMax: result.isGraveInfraction ? 50000 * UMA_VALUE : 5000 * UMA_VALUE,
            fineUnit: 'MXN',
          });
          if (result.isCrime) hasCrimeRisk = true;
          if (result.isGraveInfraction && q.id === 'q1') hasREPSECancellationRisk = true;
        }
      }
    });

    relevantVerificationPoints.forEach(vp => {
      maxScore += vp.points.complies;
      const result = verificationResults.find(r => r.pointId === vp.id);
      if (result) {
        totalScore += result.points;
        if (result.status === 'notComplies') {
          infractions.push({
            id: `v_${vp.id}`,
            description: result.observation || vp.observationIfNotComplies,
            legalBasis: vp.legalBasis,
            isGrave: vp.isGraveInfraction || false,
            isCrime: vp.isCrime || false,
            fineMin: vp.isGraveInfraction ? 2000 * UMA_VALUE : 250 * UMA_VALUE,
            fineMax: vp.isGraveInfraction ? 50000 * UMA_VALUE : 5000 * UMA_VALUE,
            fineUnit: 'MXN',
          });
          if (vp.isCrime) hasCrimeRisk = true;
        }
      }
    });

    const normalizedScore = Math.max(0, Math.min(100, Math.round((totalScore / maxScore) * 100)));
    const compliance = getComplianceLevel(normalizedScore, 100);

    const totalFineMin = infractions.reduce((sum, inf) => sum + inf.fineMin, 0);
    const totalFineMax = infractions.reduce((sum, inf) => sum + inf.fineMax, 0);

    const documentsPresented = documentResults.filter(r => r.presented).length;
    const documentsMissing = relevantDocuments.length - documentsPresented;
    const questionsCorrect = questionResults.filter(r => r.points > 0).length;
    const questionsIncorrect = questionResults.filter(r => r.points < 0).length;
    const questionsSkipped = relevantQuestions.length - questionResults.length;
    const verificationComplied = verificationResults.filter(r => r.status === 'complies').length;
    const verificationNotComplied = verificationResults.filter(r => r.status === 'notComplies').length;

    const result: SimulationResult = {
      id: `sim_${Date.now()}`,
      date: new Date().toISOString(),
      inspectionType,
      profile,
      score: normalizedScore,
      maxScore: 100,
      percentage: normalizedScore,
      level: compliance.level,
      levelColor: compliance.color,
      levelText: compliance.text,
      documentResults,
      questionResults,
      verificationResults,
      infractions,
      totalFineMin,
      totalFineMax,
      documentsPresented,
      documentsMissing,
      questionsCorrect,
      questionsIncorrect,
      questionsSkipped,
      verificationComplied,
      verificationNotComplied,
      hasCrimeRisk,
      hasREPSECancellationRisk,
    };

    setSimulationResult(result);
    generateActionPlan(result);
    saveResult(result);
    setPhase('results');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    inspectionType, profile, relevantDocuments, relevantQuestions, relevantVerificationPoints,
    documentResults, questionResults, verificationResults, saveResult
  ]);

  const generateActionPlan = useCallback((result: SimulationResult) => {
    const actions: ActionItem[] = [];

    const missingREPSE = result.documentResults.find(
      r => r.documentId === 'repse' && !r.presented
    );
    if (missingREPSE || result.hasREPSECancellationRisk) {
      actions.push({
        id: 'get_repse',
        title: 'Obtener/Renovar Registro REPSE',
        description: 'Sin registro REPSE no puedes operar legalmente. Es tu prioridad número 1.',
        priority: 'urgent',
        steps: [
          'Ingresa a https://repse.stps.gob.mx',
          'Crea una cuenta con tu RFC y e.firma',
          'Completa el formulario con datos de tu empresa',
          'Adjunta documentos requeridos',
          'Espera resolución (5-10 días hábiles)',
          'Descarga tu aviso de registro',
        ],
        estimatedTime: '2-3 semanas',
        estimatedCost: 'Gratuito',
        points: 20,
        fineAvoided: { min: 217000, max: 5428000 },
        completed: false,
      });
    }

    const missingContracts = result.documentResults.find(
      r => (r.documentId === 'contratos_servicios' || r.documentId === 'contrato_proveedor') && !r.presented
    );
    if (missingContracts) {
      actions.push({
        id: 'formalize_contracts',
        title: 'Formalizar Contratos por Escrito',
        description: 'Todos los contratos deben estar por escrito y firmados.',
        priority: 'high',
        steps: [
          'Usa plantilla de contrato en sección Documentos',
          'Completa datos de ambas partes',
          'Especifica claramente el servicio',
          'Firma con tu cliente',
          'Guarda copias físicas y digitales',
        ],
        estimatedTime: '1-2 días por contrato',
        estimatedCost: 'Gratuito',
        points: 12,
        fineAvoided: { min: 27000, max: 543000 },
        completed: false,
      });
    }

    const imssIssue = result.questionResults.find(
      r => r.questionId === 'q4' && r.isGraveInfraction
    );
    if (imssIssue) {
      actions.push({
        id: 'register_imss',
        title: 'Dar de Alta a Trabajadores en IMSS',
        description: 'Tienes trabajadores sin seguridad social. Esto es GRAVE.',
        priority: 'urgent',
        steps: [
          'Obtén tu registro patronal IMSS',
          'Reúne datos de trabajadores (CURP, RFC)',
          'Ingresa a IMSS Digital Patrón',
          'Registra movimientos de alta',
          'Genera cédula de determinación',
          'Paga cuotas obrero-patronales',
        ],
        estimatedTime: '1 semana',
        estimatedCost: '~30% del salario mensual',
        points: 15,
        fineAvoided: { min: 27000, max: 543000 },
        completed: false,
      });
    }

    const icsoeSisubIssue = result.questionResults.find(
      r => r.questionId === 'q5' && (r.isInfraction || r.isGraveInfraction)
    );
    if (icsoeSisubIssue) {
      actions.push({
        id: 'update_icsoe_sisub',
        title: 'Actualizar ICSOE y SISUB',
        description: 'Tus declaraciones informativas no están al corriente.',
        priority: 'high',
        steps: [
          'Ingresa al portal REPSE',
          'Presenta ICSOE de períodos pendientes',
          'Actualiza información en SISUB',
          'Guarda acuses de presentación',
        ],
        estimatedTime: '1-2 días',
        estimatedCost: 'Gratuito',
        points: 8,
        fineAvoided: { min: 27000, max: 271000 },
        completed: false,
      });
    }

    actions.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setActionItems(actions);
  }, []);

  const showResults = useCallback(() => {
    calculateFinalResult();
  }, [calculateFinalResult]);

  const showActionPlan = useCallback(() => {
    setPhase('action-plan');
  }, []);

  const toggleActionComplete = useCallback((actionId: string) => {
    setActionItems(prev => prev.map(item => 
      item.id === actionId ? { ...item, completed: !item.completed } : item
    ));
  }, []);

  return {
    phase,
    inspectionType,
    inspectionConfig,
    profile,
    companyName,
    workerCount,
    hasREPSE,
    currentDialogueIndex,
    documentResults,
    currentQuestionIndex,
    currentQuestion,
    questionResults,
    verificationResults,
    simulationResult,
    actionItems,
    startTime,
    relevantDocuments,
    relevantQuestions,
    relevantVerificationPoints,
    history: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    
    setCompanyName,
    setWorkerCount,
    setHasREPSE,
    resetSimulator,
    selectInspectionType,
    selectProfile,
    advanceDialogue,
    startDocumentPhase,
    handleDocumentResponse,
    startInterrogationPhase,
    handleQuestionAnswer,
    startVerificationPhase,
    handleVerificationResponse,
    showResults,
    showActionPlan,
    toggleActionComplete,
  };
});
