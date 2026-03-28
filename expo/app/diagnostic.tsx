import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  Briefcase,
  User,
  HelpCircle,
  RotateCcw
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp, DiagnosticResult } from '@/contexts/AppContext';
import { 
  DIAGNOSTIC_QUESTIONS, 
  UserType, 
  USER_TYPES 
} from '@/constants/data';

type Step = 'user-type' | 'questions' | 'result' | 'worker-info' | 'general-info';

const userTypeOptions = [
  {
    type: USER_TYPES.CONTRATISTA,
    title: 'Contratista',
    description: 'Presto servicios especializados a otras empresas',
    icon: Building2,
    color: Colors.primary,
  },
  {
    type: USER_TYPES.BENEFICIARIO,
    title: 'Beneficiario',
    description: 'Contrato servicios especializados de otras empresas',
    icon: Briefcase,
    color: Colors.secondary,
  },
  {
    type: USER_TYPES.TRABAJADOR,
    title: 'Trabajador',
    description: 'Quiero verificar mi situación laboral',
    icon: User,
    color: '#8B5CF6',
  },
  {
    type: USER_TYPES.GENERAL,
    title: 'Información General',
    description: 'Solo quiero aprender sobre el tema',
    icon: HelpCircle,
    color: Colors.textSecondary,
  },
];

export default function DiagnosticScreen() {
  const router = useRouter();
  const { saveDiagnosticResult } = useApp();
  
  const [step, setStep] = useState<Step>('user-type');
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const questions = useMemo(() => {
    if (!selectedUserType) return [];
    return DIAGNOSTIC_QUESTIONS.filter(q => 
      q.forUserTypes.includes(selectedUserType)
    );
  }, [selectedUserType]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleUserTypeSelect = (type: UserType) => {
    setSelectedUserType(type);
    if (type === USER_TYPES.TRABAJADOR) {
      setStep('worker-info');
      return;
    }
    if (type === USER_TYPES.GENERAL) {
      setStep('general-info');
      return;
    }
    setStep('questions');
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResult(value);
    }
  };

  const calculateResult = (lastAnswerValue: string) => {
    const finalAnswers = { ...answers, [currentQuestion.id]: lastAnswerValue };
    
    let score = 0;
    let maxScore = 0;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const compliant: string[] = [];

    questions.forEach(question => {
      const answerValue = finalAnswers[question.id];
      const selectedOption = question.options.find(o => o.value === answerValue);
      
      const questionMaxScore = Math.max(...question.options.map(o => o.score));
      maxScore += questionMaxScore;
      
      if (selectedOption) {
        score += selectedOption.score;
        
        if (selectedOption.isCritical) {
          criticalIssues.push(question.text);
        } else if (selectedOption.score < questionMaxScore && selectedOption.score > 0) {
          warnings.push(question.text);
        } else if (selectedOption.score === questionMaxScore) {
          compliant.push(question.text);
        }
      }
    });

    const diagnosticResult: DiagnosticResult = {
      score,
      maxScore,
      criticalIssues,
      warnings,
      compliant,
      userType: selectedUserType!,
      completedAt: new Date().toISOString(),
      answers: finalAnswers,
    };

    setResult(diagnosticResult);
    saveDiagnosticResult(diagnosticResult);
    setStep('result');
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep('user-type');
      setSelectedUserType(null);
      setAnswers({});
    }
  };

  const handleRestart = () => {
    setStep('user-type');
    setSelectedUserType(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  const getResultLevel = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return { level: 'high', label: 'ALTO', color: Colors.success };
    if (percentage >= 50) return { level: 'medium', label: 'MEDIO', color: Colors.warning };
    return { level: 'low', label: 'BAJO', color: Colors.error };
  };

  const renderUserTypeSelection = () => (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>¿Cuál es tu situación?</Text>
      <Text style={styles.stepDescription}>
        Selecciona tu perfil para personalizar el diagnóstico
      </Text>

      <View style={styles.optionsContainer}>
        {userTypeOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            style={styles.userTypeCard}
            onPress={() => handleUserTypeSelect(option.type)}
            activeOpacity={0.7}
          >
            <View style={[styles.userTypeIcon, { backgroundColor: option.color + '15' }]}>
              <option.icon color={option.color} size={28} />
            </View>
            <View style={styles.userTypeContent}>
              <Text style={styles.userTypeTitle}>{option.title}</Text>
              <Text style={styles.userTypeDescription}>{option.description}</Text>
            </View>
            <ChevronRight color={Colors.textLight} size={20} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[styles.progressFill, { width: `${progress}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} de {questions.length}
          </Text>
        </View>

        <ScrollView 
          style={styles.questionScroll}
          contentContainerStyle={styles.questionScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.questionText}>{currentQuestion.text}</Text>

          <View style={styles.answersContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.answerCard,
                  answers[currentQuestion.id] === option.value && styles.answerCardSelected
                ]}
                onPress={() => handleAnswer(currentQuestion.id, option.value)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.answerText,
                  answers[currentQuestion.id] === option.value && styles.answerTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={handlePrevious}
          >
            <ChevronLeft color={Colors.primary} size={20} />
            <Text style={styles.navButtonText}>Anterior</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWorkerInfo = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.infoContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
          <User color="#8B5CF6" size={40} />
        </View>
        <Text style={styles.infoTitle}>Información para Trabajadores</Text>
        <Text style={styles.infoSubtitle}>
          Como trabajador, tienes derechos específicos bajo la reforma de subcontratación
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>✅ Tus Derechos</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>• Debes estar contratado directamente por tu patrón real</Text>
          <Text style={styles.infoItem}>• Acceso a seguridad social (IMSS)</Text>
          <Text style={styles.infoItem}>• Participación en las utilidades (PTU)</Text>
          <Text style={styles.infoItem}>• Antigüedad reconocida</Text>
          <Text style={styles.infoItem}>• Prestaciones de ley completas</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>🔍 Cómo Verificar tu Situación</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>1. Revisa que tu contrato sea con la empresa donde trabajas físicamente</Text>
          <Text style={styles.infoItem}>2. Verifica tu alta en el IMSS con tu número de seguridad social</Text>
          <Text style={styles.infoItem}>3. Confirma que tu patrón registrado en el IMSS sea tu empleador real</Text>
          <Text style={styles.infoItem}>4. Consulta el REPSE si trabajas para una empresa de servicios especializados</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>⚠️ Señales de Alerta</Text>
        <View style={[styles.infoCard, { backgroundColor: Colors.warning + '10' }]}>
          <Text style={styles.infoItem}>• Tu contrato es con una empresa diferente a donde trabajas</Text>
          <Text style={styles.infoItem}>• Cambios frecuentes de "razón social" sin cambiar de trabajo</Text>
          <Text style={styles.infoItem}>• No recibes recibos de nómina timbrados</Text>
          <Text style={styles.infoItem}>• Tu salario registrado en IMSS es menor al real</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>📞 ¿Dónde Denunciar?</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>• PROFEDET: 800 911 7877 (gratuito)</Text>
          <Text style={styles.infoItem}>• STPS: Inspección del Trabajo</Text>
          <Text style={styles.infoItem}>• IMSS: Para verificar tu alta correcta</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.primaryButtonText}>Entendido</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleRestart}
        >
          <RotateCcw color={Colors.primary} size={18} />
          <Text style={styles.secondaryButtonText}>Cambiar Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderGeneralInfo = () => (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.infoContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: Colors.textSecondary + '20' }]}>
          <HelpCircle color={Colors.textSecondary} size={40} />
        </View>
        <Text style={styles.infoTitle}>Información General REPSE</Text>
        <Text style={styles.infoSubtitle}>
          Conoce los aspectos básicos de la reforma de subcontratación
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>📋 ¿Qué es el REPSE?</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            El Registro de Prestadoras de Servicios Especializados u Obras Especializadas (REPSE) es un padrón obligatorio de la STPS donde deben registrarse las empresas que prestan servicios especializados.
          </Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>📅 Fechas Importantes</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>• 23 de abril 2021: Publicación de la reforma</Text>
          <Text style={styles.infoItem}>• 24 de abril 2021: Entrada en vigor</Text>
          <Text style={styles.infoItem}>• 1 de septiembre 2021: Inicio de operaciones del REPSE</Text>
          <Text style={styles.infoItem}>• Renovación: Cada 3 años</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>🎯 ¿A Quién Aplica?</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>• Empresas que prestan servicios especializados</Text>
          <Text style={styles.infoItem}>• Empresas que ejecutan obras especializadas</Text>
          <Text style={styles.infoItem}>• Empresas que contratan estos servicios (beneficiarios)</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoSectionTitle}>⚖️ Sanciones por Incumplimiento</Text>
        <View style={[styles.infoCard, { backgroundColor: Colors.error + '10' }]}>
          <Text style={styles.infoItem}>• Multas de 2,000 a 50,000 UMA</Text>
          <Text style={styles.infoItem}>• Responsabilidad solidaria en obligaciones laborales</Text>
          <Text style={styles.infoItem}>• No deducibilidad fiscal de los servicios</Text>
          <Text style={styles.infoItem}>• Posible configuración de delito de defraudación fiscal</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.primaryButtonText}>Entendido</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleRestart}
        >
          <RotateCcw color={Colors.primary} size={18} />
          <Text style={styles.secondaryButtonText}>Cambiar Perfil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderResult = () => {
    if (!result) return null;

    const { level, label, color } = getResultLevel(result.score, result.maxScore);
    const percentage = Math.round((result.score / result.maxScore) * 100);

    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.resultContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.resultHeader, { backgroundColor: color + '15' }]}>
          <View style={[styles.resultBadge, { backgroundColor: color }]}>
            {level === 'high' ? (
              <CheckCircle2 color={Colors.textOnPrimary} size={32} />
            ) : level === 'medium' ? (
              <Clock color={Colors.textOnPrimary} size={32} />
            ) : (
              <XCircle color={Colors.textOnPrimary} size={32} />
            )}
          </View>
          <Text style={styles.resultTitle}>Tu Nivel de Cumplimiento</Text>
          <Text style={[styles.resultLevel, { color }]}>{label}</Text>
          <Text style={[styles.resultPercentage, { color }]}>{percentage}%</Text>
        </View>

        {result.criticalIssues.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.sectionHeader}>
              <XCircle color={Colors.error} size={18} />
              <Text style={[styles.sectionTitle, { color: Colors.error }]}>
                Hallazgos Críticos
              </Text>
            </View>
            {result.criticalIssues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <View style={[styles.issueDot, { backgroundColor: Colors.error }]} />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        {result.warnings.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.sectionHeader}>
              <AlertTriangle color={Colors.warning} size={18} />
              <Text style={[styles.sectionTitle, { color: Colors.warningDark }]}>
                Requieren Atención
              </Text>
            </View>
            {result.warnings.map((warning, index) => (
              <View key={index} style={styles.issueItem}>
                <View style={[styles.issueDot, { backgroundColor: Colors.warning }]} />
                <Text style={styles.issueText}>{warning}</Text>
              </View>
            ))}
          </View>
        )}

        {result.compliant.length > 0 && (
          <View style={styles.resultSection}>
            <View style={styles.sectionHeader}>
              <CheckCircle2 color={Colors.success} size={18} />
              <Text style={[styles.sectionTitle, { color: Colors.success }]}>
                Aspectos en Orden
              </Text>
            </View>
            {result.compliant.map((item, index) => (
              <View key={index} style={styles.issueItem}>
                <View style={[styles.issueDot, { backgroundColor: Colors.success }]} />
                <Text style={styles.issueText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Ver Plan de Acción</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleRestart}
          >
            <RotateCcw color={Colors.primary} size={18} />
            <Text style={styles.secondaryButtonText}>Repetir Diagnóstico</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <X color={Colors.textOnPrimary} size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Diagnóstico Rápido</Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {step === 'user-type' && renderUserTypeSelection()}
        {step === 'questions' && renderQuestion()}
        {step === 'result' && renderResult()}
        {step === 'worker-info' && renderWorkerInfo()}
        {step === 'general-info' && renderGeneralInfo()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textOnPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  userTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
      },
    }),
  },
  userTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTypeContent: {
    flex: 1,
    marginLeft: 14,
  },
  userTypeTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userTypeDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  questionContainer: {
    flex: 1,
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 0,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  questionScroll: {
    flex: 1,
  },
  questionScrollContent: {
    padding: 20,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 24,
    lineHeight: 30,
  },
  answersContainer: {
    gap: 12,
  },
  answerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 18,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  answerCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  answerText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  answerTextSelected: {
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  navigationButtons: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  resultContent: {
    padding: 20,
  },
  resultHeader: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  resultBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  resultLevel: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  resultPercentage: {
    fontSize: 48,
    fontWeight: '800' as const,
  },
  resultSection: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 4px rgba(0,0,0,0.05)',
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  issueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 10,
  },
  issueText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textOnPrimary,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  infoContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 4px rgba(0,0,0,0.05)',
      },
    }),
  },
  infoItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});
