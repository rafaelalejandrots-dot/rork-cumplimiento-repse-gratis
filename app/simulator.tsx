import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Briefcase,
  Star,
  FileText,
  MessageSquare,
  Eye,
  RotateCcw,
  Target,
  User,
  Shield,
  AlertOctagon,
  Check,
  Minus,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { SimulatorProvider, useSimulator } from '@/contexts/SimulatorContext';
import {
  INSPECTION_TYPES,
  INSPECTOR_DIALOGUES,
} from '@/constants/simulator';

function SimulatorContent() {
  const router = useRouter();
  const {
    phase,
    inspectionType,
    inspectionConfig,
    currentDialogueIndex,
    documentResults,
    currentQuestionIndex,
    currentQuestion,
    verificationResults,
    simulationResult,
    actionItems,
    startTime,
    relevantDocuments,
    relevantQuestions,
    relevantVerificationPoints,
    resetSimulator,
    selectInspectionType,
    selectProfile,
    advanceDialogue,
    startDocumentPhase,
    handleDocumentResponse,
    startInterrogationPhase,
    handleQuestionAnswer,
    handleVerificationResponse,
    showResults,
    showActionPlan,
    toggleActionComplete,
  } = useSimulator();

  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (startTime && phase !== 'results' && phase !== 'action-plan' && phase !== 'selection' && phase !== 'profile') {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, phase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        size={14}
        color={i < difficulty ? Colors.warning : Colors.border}
        fill={i < difficulty ? Colors.warning : 'transparent'}
      />
    ));
  };

  const currentDialogue = useMemo(() => {
    if (!inspectionType) return null;
    const phaseDialogues = INSPECTOR_DIALOGUES.filter(
      d => d.type === inspectionType && d.phase === phase
    );
    return phaseDialogues[0]?.messages || [];
  }, [inspectionType, phase]);

  const renderSelectionPhase = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Simulador de Inspección</Text>
      <Text style={styles.stepDescription}>
        Elige el tipo de inspección que deseas simular
      </Text>

      <View style={styles.cardsContainer}>
        {INSPECTION_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.inspectionCard, { borderLeftColor: type.color }]}
            onPress={() => selectInspectionType(type.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>{type.icon}</Text>
              <View style={styles.difficultyContainer}>
                {getDifficultyStars(type.difficulty)}
              </View>
            </View>
            <Text style={styles.cardTitle}>{type.name}</Text>
            <Text style={styles.cardSubtitle}>{type.subtitle}</Text>
            <Text style={styles.cardDescription}>{type.description}</Text>
            <View style={styles.cardFooter}>
              <View style={styles.cardMeta}>
                <Clock size={14} color={Colors.textSecondary} />
                <Text style={styles.cardMetaText}>{type.duration} min</Text>
              </View>
              <ChevronRight size={20} color={Colors.textLight} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>
          Si es tu primera vez, comienza con la opción Constatación REPSE para familiarizarte.
        </Text>
      </View>
    </ScrollView>
  );

  const renderProfilePhase = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => resetSimulator()}>
        <ChevronLeft size={20} color={Colors.primary} />
        <Text style={styles.backText}>Cambiar tipo</Text>
      </TouchableOpacity>

      <Text style={styles.stepTitle}>¿Cuál es tu rol?</Text>
      <Text style={styles.stepDescription}>
        Selecciona tu perfil para personalizar la simulación
      </Text>

      <View style={styles.profileCardsContainer}>
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => selectProfile('contratista')}
          activeOpacity={0.7}
        >
          <View style={[styles.profileIcon, { backgroundColor: Colors.primary + '15' }]}>
            <Building2 color={Colors.primary} size={32} />
          </View>
          <Text style={styles.profileTitle}>CONTRATISTA</Text>
          <Text style={styles.profileDescription}>
            Presto servicios especializados a otras empresas
          </Text>
          <View style={styles.profileExamples}>
            <Text style={styles.exampleText}>Limpieza, Mantenimiento, Seguridad, IT</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => selectProfile('beneficiario')}
          activeOpacity={0.7}
        >
          <View style={[styles.profileIcon, { backgroundColor: Colors.secondary + '15' }]}>
            <Briefcase color={Colors.secondary} size={32} />
          </View>
          <Text style={styles.profileTitle}>BENEFICIARIO</Text>
          <Text style={styles.profileDescription}>
            Contrato servicios especializados de otras empresas
          </Text>
          <View style={styles.profileExamples}>
            <Text style={styles.exampleText}>Fábricas, Hoteles, Corporativos</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderIntroPhase = () => {
    const dialogues = currentDialogue || [];
    const currentMessage = dialogues[currentDialogueIndex] || '';
    const isLastMessage = currentDialogueIndex >= dialogues.length - 1;

    return (
      <View style={styles.introContainer}>
        <View style={styles.inspectorSection}>
          <View style={styles.inspectorAvatar}>
            <User color={Colors.textOnPrimary} size={40} />
          </View>
          <View style={styles.inspectorBadge}>
            <Shield size={12} color={Colors.primary} />
            <Text style={styles.inspectorBadgeText}>Inspector Federal</Text>
          </View>
        </View>

        <View style={styles.credentialCard}>
          <Text style={styles.credentialHeader}>SECRETARÍA DEL TRABAJO Y PREVISIÓN SOCIAL</Text>
          <Text style={styles.credentialName}>Insp. Federal Miguel Hernández</Text>
          <Text style={styles.credentialId}>STPS-2024-00123</Text>
          <Text style={styles.credentialVigencia}>Vigente hasta: 31/12/2025</Text>
        </View>

        <View style={styles.dialogueBubble}>
          <Text style={styles.dialogueText}>{currentMessage}</Text>
          <View style={styles.dialogueFooter}>
            <Text style={styles.dialogueTime}>{formatTime(elapsedTime)}</Text>
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Grabando acta</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            if (isLastMessage) {
              startDocumentPhase();
            } else {
              advanceDialogue();
            }
          }}
        >
          <Text style={styles.continueButtonText}>
            {isLastMessage ? 'Comenzar Revisión Documental' : 'Continuar'}
          </Text>
          <ChevronRight size={20} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDocumentsPhase = () => {
    const documentsAnswered = documentResults.length;
    const totalDocuments = relevantDocuments.length;
    const progress = totalDocuments > 0 ? (documentsAnswered / totalDocuments) * 100 : 0;

    return (
      <View style={styles.phaseContainer}>
        <View style={styles.phaseHeader}>
          <View style={styles.phaseBadge}>
            <FileText size={16} color={Colors.primary} />
            <Text style={styles.phaseBadgeText}>Fase 1: Revisión Documental</Text>
          </View>
          <View style={styles.timerBadge}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{documentsAnswered} de {totalDocuments} documentos</Text>
        </View>

        <ScrollView style={styles.documentsScroll} showsVerticalScrollIndicator={false}>
          {relevantDocuments.map((doc) => {
            const result = documentResults.find(r => r.documentId === doc.id);
            const isAnswered = !!result;

            return (
              <View
                key={doc.id}
                style={[
                  styles.documentCard,
                  isAnswered && (result.presented ? styles.documentPresented : styles.documentMissing),
                ]}
              >
                <View style={styles.documentHeader}>
                  <Text style={styles.documentIcon}>{doc.icon}</Text>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName}>{doc.name}</Text>
                    <View style={styles.documentMeta}>
                      <View style={[
                        styles.obligatoryBadge,
                        { backgroundColor: doc.obligatory ? Colors.errorLight : Colors.warningLight }
                      ]}>
                        <Text style={[
                          styles.obligatoryText,
                          { color: doc.obligatory ? Colors.error : Colors.warningDark }
                        ]}>
                          {doc.obligatory ? 'Obligatorio' : 'Recomendado'}
                        </Text>
                      </View>
                      <Text style={styles.legalBasis}>{doc.legalBasis}</Text>
                    </View>
                  </View>
                </View>

                {!isAnswered ? (
                  <View style={styles.documentActions}>
                    <TouchableOpacity
                      style={[styles.docActionButton, styles.docPresentButton]}
                      onPress={() => handleDocumentResponse(doc.id, true)}
                    >
                      <Check size={16} color={Colors.success} />
                      <Text style={[styles.docActionText, { color: Colors.success }]}>Tengo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.docActionButton, styles.docMissingButton]}
                      onPress={() => handleDocumentResponse(doc.id, false)}
                    >
                      <X size={16} color={Colors.error} />
                      <Text style={[styles.docActionText, { color: Colors.error }]}>No tengo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.documentResult}>
                    {result.presented ? (
                      <View style={styles.resultBadge}>
                        <CheckCircle2 size={16} color={Colors.success} />
                        <Text style={[styles.resultText, { color: Colors.success }]}>Presentado</Text>
                      </View>
                    ) : (
                      <View style={styles.resultBadge}>
                        <XCircle size={16} color={Colors.error} />
                        <Text style={[styles.resultText, { color: Colors.error }]}>Faltante</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {documentsAnswered === totalDocuments && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={startInterrogationPhase}
          >
            <Text style={styles.continueButtonText}>Continuar a Interrogatorio</Text>
            <ChevronRight size={20} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderInterrogationPhase = () => {
    if (!currentQuestion) return null;

    const progress = ((currentQuestionIndex + 1) / relevantQuestions.length) * 100;

    return (
      <View style={styles.phaseContainer}>
        <View style={styles.phaseHeader}>
          <View style={styles.phaseBadge}>
            <MessageSquare size={16} color={Colors.primary} />
            <Text style={styles.phaseBadgeText}>Fase 2: Interrogatorio</Text>
          </View>
          <View style={styles.timerBadge}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Pregunta {currentQuestionIndex + 1} de {relevantQuestions.length}
          </Text>
        </View>

        <View style={styles.inspectorMini}>
          <View style={styles.inspectorAvatarSmall}>
            <User color={Colors.textOnPrimary} size={20} />
          </View>
          <View style={styles.questionBubble}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          </View>
        </View>

        <ScrollView style={styles.answersScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.answersContainer}>
            {currentQuestion.options?.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.answerCard}
                onPress={() => handleQuestionAnswer(option.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.answerText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => handleQuestionAnswer(null)}
          >
            <Text style={styles.skipText}>Prefiero no responder</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderVerificationPhase = () => {
    const verificationAnswered = verificationResults.length;
    const totalPoints = relevantVerificationPoints.length;
    const progress = totalPoints > 0 ? (verificationAnswered / totalPoints) * 100 : 0;

    return (
      <View style={styles.phaseContainer}>
        <View style={styles.phaseHeader}>
          <View style={styles.phaseBadge}>
            <Eye size={16} color={Colors.primary} />
            <Text style={styles.phaseBadgeText}>Fase 3: Constatación Física</Text>
          </View>
          <View style={styles.timerBadge}>
            <Clock size={14} color={Colors.textSecondary} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{verificationAnswered} de {totalPoints} puntos</Text>
        </View>

        <View style={styles.verificationInfo}>
          <Eye size={20} color={Colors.primary} />
          <Text style={styles.verificationInfoText}>
            El inspector realiza un recorrido por las instalaciones para verificar las condiciones reales.
          </Text>
        </View>

        <ScrollView style={styles.verificationScroll} showsVerticalScrollIndicator={false}>
          {relevantVerificationPoints.map((point) => {
            const result = verificationResults.find(r => r.pointId === point.id);
            const isAnswered = !!result;

            return (
              <View
                key={point.id}
                style={[
                  styles.verificationCard,
                  isAnswered && styles.verificationAnswered,
                ]}
              >
                <View style={styles.verificationHeader}>
                  <Text style={styles.verificationIcon}>{point.icon}</Text>
                  <Text style={styles.verificationTitle}>{point.title}</Text>
                </View>
                <Text style={styles.verificationQuestion}>{point.question}</Text>

                {!isAnswered ? (
                  <View style={styles.verificationActions}>
                    <TouchableOpacity
                      style={[styles.verifyButton, styles.verifyComplies]}
                      onPress={() => handleVerificationResponse(point.id, 'complies')}
                    >
                      <Check size={16} color={Colors.success} />
                      <Text style={[styles.verifyText, { color: Colors.success }]}>Cumple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.verifyButton, styles.verifyNotComplies]}
                      onPress={() => handleVerificationResponse(point.id, 'notComplies')}
                    >
                      <X size={16} color={Colors.error} />
                      <Text style={[styles.verifyText, { color: Colors.error }]}>No cumple</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.verifyButton, styles.verifyNA]}
                      onPress={() => handleVerificationResponse(point.id, 'notApplicable')}
                    >
                      <Minus size={16} color={Colors.textSecondary} />
                      <Text style={[styles.verifyText, { color: Colors.textSecondary }]}>N/A</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.verificationResult}>
                    {result.status === 'complies' && (
                      <View style={[styles.verifyResultBadge, { backgroundColor: Colors.successLight }]}>
                        <CheckCircle2 size={14} color={Colors.success} />
                        <Text style={[styles.verifyResultText, { color: Colors.success }]}>Cumple</Text>
                      </View>
                    )}
                    {result.status === 'notComplies' && (
                      <View style={[styles.verifyResultBadge, { backgroundColor: Colors.errorLight }]}>
                        <XCircle size={14} color={Colors.error} />
                        <Text style={[styles.verifyResultText, { color: Colors.error }]}>No cumple</Text>
                      </View>
                    )}
                    {result.status === 'notApplicable' && (
                      <View style={[styles.verifyResultBadge, { backgroundColor: Colors.surfaceSecondary }]}>
                        <Minus size={14} color={Colors.textSecondary} />
                        <Text style={[styles.verifyResultText, { color: Colors.textSecondary }]}>N/A</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {verificationAnswered === totalPoints && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={showResults}
          >
            <Text style={styles.continueButtonText}>Ver Resultados</Text>
            <ChevronRight size={20} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderResultsPhase = () => {
    if (!simulationResult) return null;

    const { score, levelColor, levelText, infractions, totalFineMin, totalFineMax, hasCrimeRisk, hasREPSECancellationRisk } = simulationResult;
    const graveInfractions = infractions.filter(i => i.isGrave);
    const minorInfractions = infractions.filter(i => !i.isGrave);

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.resultsContent}>
        <View style={[styles.resultHeader, { backgroundColor: levelColor + '15' }]}>
          <View style={[styles.scoreCircle, { backgroundColor: levelColor }]}>
            {score >= 80 ? (
              <CheckCircle2 color={Colors.textOnPrimary} size={32} />
            ) : score >= 60 ? (
              <Clock color={Colors.textOnPrimary} size={32} />
            ) : (
              <XCircle color={Colors.textOnPrimary} size={32} />
            )}
          </View>
          <Text style={styles.resultTitle}>Simulación Completada</Text>
          <Text style={[styles.resultScore, { color: levelColor }]}>{score}/100</Text>
          <Text style={[styles.resultLevel, { color: levelColor }]}>{levelText}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <FileText size={20} color={Colors.primary} />
            <Text style={styles.statValue}>{simulationResult.documentsPresented}/{simulationResult.documentsPresented + simulationResult.documentsMissing}</Text>
            <Text style={styles.statLabel}>Documentos</Text>
          </View>
          <View style={styles.statCard}>
            <MessageSquare size={20} color={Colors.secondary} />
            <Text style={styles.statValue}>{simulationResult.questionsCorrect}/{relevantQuestions.length}</Text>
            <Text style={styles.statLabel}>Respuestas OK</Text>
          </View>
          {relevantVerificationPoints.length > 0 && (
            <View style={styles.statCard}>
              <Eye size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>{simulationResult.verificationComplied}/{relevantVerificationPoints.length}</Text>
              <Text style={styles.statLabel}>Verificación</Text>
            </View>
          )}
        </View>

        {graveInfractions.length > 0 && (
          <View style={styles.infractionsSection}>
            <View style={styles.sectionHeader}>
              <AlertOctagon size={18} color={Colors.error} />
              <Text style={[styles.sectionTitle, { color: Colors.error }]}>
                Infracciones Graves ({graveInfractions.length})
              </Text>
            </View>
            {graveInfractions.map((inf, index) => (
              <View key={inf.id} style={styles.infractionCard}>
                <Text style={styles.infractionNumber}>{index + 1}</Text>
                <View style={styles.infractionContent}>
                  <Text style={styles.infractionDesc}>{inf.description}</Text>
                  <Text style={styles.infractionBasis}>{inf.legalBasis}</Text>
                  <Text style={styles.infractionFine}>
                    Multa: ${inf.fineMin.toLocaleString()} - ${inf.fineMax.toLocaleString()} MXN
                  </Text>
                  {inf.isCrime && (
                    <View style={styles.crimeBadge}>
                      <AlertTriangle size={12} color={Colors.error} />
                      <Text style={styles.crimeText}>Riesgo de delito fiscal</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {minorInfractions.length > 0 && (
          <View style={styles.infractionsSection}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={18} color={Colors.warning} />
              <Text style={[styles.sectionTitle, { color: Colors.warningDark }]}>
                Infracciones Menores ({minorInfractions.length})
              </Text>
            </View>
            {minorInfractions.map((inf, index) => (
              <View key={inf.id} style={[styles.infractionCard, styles.infractionMinor]}>
                <Text style={[styles.infractionNumber, { backgroundColor: Colors.warningLight, color: Colors.warningDark }]}>{index + 1}</Text>
                <View style={styles.infractionContent}>
                  <Text style={styles.infractionDesc}>{inf.description}</Text>
                  <Text style={styles.infractionBasis}>{inf.legalBasis}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {infractions.length === 0 && (
          <View style={styles.noInfractionsCard}>
            <CheckCircle2 size={40} color={Colors.success} />
            <Text style={styles.noInfractionsTitle}>¡Excelente!</Text>
            <Text style={styles.noInfractionsText}>
              No se detectaron infracciones en esta simulación.
            </Text>
          </View>
        )}

        {totalFineMax > 0 && (
          <View style={styles.totalFinesCard}>
            <Text style={styles.totalFinesTitle}>MULTAS POTENCIALES TOTALES</Text>
            <Text style={styles.totalFinesAmount}>
              ${totalFineMin.toLocaleString()} - ${totalFineMax.toLocaleString()} MXN
            </Text>
            {hasREPSECancellationRisk && (
              <View style={styles.riskBadge}>
                <AlertOctagon size={14} color={Colors.error} />
                <Text style={styles.riskText}>Riesgo de cancelación REPSE</Text>
              </View>
            )}
            {hasCrimeRisk && (
              <View style={styles.riskBadge}>
                <AlertTriangle size={14} color={Colors.error} />
                <Text style={styles.riskText}>Posible delito fiscal (3-9 años prisión)</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.primaryActionButton} onPress={showActionPlan}>
            <Target size={20} color={Colors.textOnPrimary} />
            <Text style={styles.primaryActionText}>Ver Plan de Acción</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryActionButton} onPress={resetSimulator}>
            <RotateCcw size={18} color={Colors.primary} />
            <Text style={styles.secondaryActionText}>Repetir Simulación</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderActionPlanPhase = () => {
    const completedActions = actionItems.filter(a => a.completed).length;
    const totalActions = actionItems.length;
    const progress = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'urgent': return Colors.error;
        case 'high': return Colors.warning;
        case 'medium': return Colors.secondary;
        default: return Colors.success;
      }
    };

    const getPriorityLabel = (priority: string) => {
      switch (priority) {
        case 'urgent': return 'URGENTE';
        case 'high': return 'ALTA';
        case 'medium': return 'MEDIA';
        default: return 'BAJA';
      }
    };

    return (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.actionPlanContent}>
        <View style={styles.actionPlanHeader}>
          <Target size={24} color={Colors.primary} />
          <Text style={styles.actionPlanTitle}>Plan de Acción</Text>
          <Text style={styles.actionPlanSubtitle}>
            Sigue estos pasos para corregir las deficiencias detectadas
          </Text>
        </View>

        <View style={styles.actionProgress}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: Colors.success }]} />
          </View>
          <Text style={styles.actionProgressText}>
            {completedActions} de {totalActions} completadas
          </Text>
        </View>

        {actionItems.length === 0 ? (
          <View style={styles.noActionsCard}>
            <CheckCircle2 size={40} color={Colors.success} />
            <Text style={styles.noActionsTitle}>¡Todo en orden!</Text>
            <Text style={styles.noActionsText}>
              No se requieren acciones correctivas.
            </Text>
          </View>
        ) : (
          actionItems.map((action, index) => (
            <View
              key={action.id}
              style={[
                styles.actionCard,
                action.completed && styles.actionCompleted,
              ]}
            >
              <View style={styles.actionHeader}>
                <View style={styles.actionNumberContainer}>
                  <Text style={[styles.actionNumber, { backgroundColor: getPriorityColor(action.priority) }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.actionTitleContainer}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(action.priority) + '20' }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(action.priority) }]}>
                      {getPriorityLabel(action.priority)}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.actionDescription}>{action.description}</Text>

              <View style={styles.actionSteps}>
                <Text style={styles.stepsTitle}>Cómo hacerlo:</Text>
                {action.steps.map((step, stepIndex) => (
                  <View key={stepIndex} style={styles.stepItem}>
                    <Text style={styles.stepNumber}>{stepIndex + 1}.</Text>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{action.estimatedTime}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaText}>{action.estimatedCost}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.completeButton, action.completed && styles.completeButtonDone]}
                onPress={() => toggleActionComplete(action.id)}
              >
                {action.completed ? (
                  <>
                    <CheckCircle2 size={18} color={Colors.success} />
                    <Text style={[styles.completeText, { color: Colors.success }]}>Completada</Text>
                  </>
                ) : (
                  <>
                    <Check size={18} color={Colors.textSecondary} />
                    <Text style={styles.completeText}>Marcar como completada</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => {
              setElapsedTime(0);
              resetSimulator();
            }}
          >
            <RotateCcw size={18} color={Colors.primary} />
            <Text style={styles.secondaryActionText}>Nueva Simulación</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tertiaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.tertiaryText}>Volver al Inicio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    switch (phase) {
      case 'selection':
        return renderSelectionPhase();
      case 'profile':
        return renderProfilePhase();
      case 'intro':
        return renderIntroPhase();
      case 'documents':
        return renderDocumentsPhase();
      case 'interrogation':
        return renderInterrogationPhase();
      case 'verification':
        return renderVerificationPhase();
      case 'results':
        return renderResultsPhase();
      case 'action-plan':
        return renderActionPlanPhase();
      default:
        return null;
    }
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
              onPress={() => {
                resetSimulator();
                router.back();
              }}
            >
              <X color={Colors.textOnPrimary} size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {phase === 'selection' ? 'Simulador' : inspectionConfig?.name || 'Simulador'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

export default function SimulatorScreen() {
  return (
    <SimulatorProvider>
      <SimulatorContent />
    </SimulatorProvider>
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
  cardsContainer: {
    gap: 16,
  },
  inspectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 32,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primaryLight + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: Colors.primary,
    marginLeft: 4,
  },
  profileCardsContainer: {
    gap: 16,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0px 2px 8px rgba(0,0,0,0.08)' },
    }),
  },
  profileIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  profileDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  profileExamples: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  exampleText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  introContainer: {
    flex: 1,
    padding: 20,
  },
  inspectorSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  inspectorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  inspectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  inspectorBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  credentialCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  credentialHeader: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  credentialName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  credentialId: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  credentialVigencia: {
    fontSize: 11,
    color: Colors.textLight,
  },
  dialogueBubble: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dialogueText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  dialogueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  dialogueTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  recordingText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textOnPrimary,
  },
  phaseContainer: {
    flex: 1,
    padding: 20,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  phaseBadgeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  documentsScroll: {
    flex: 1,
    marginBottom: 16,
  },
  documentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  documentPresented: {
    borderColor: Colors.success,
    backgroundColor: Colors.successLight + '30',
  },
  documentMissing: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight + '30',
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  obligatoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  obligatoryText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  legalBasis: {
    fontSize: 11,
    color: Colors.textLight,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  docActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  docPresentButton: {
    backgroundColor: Colors.successLight,
  },
  docMissingButton: {
    backgroundColor: Colors.errorLight,
  },
  docActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  documentResult: {
    alignItems: 'flex-start',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  inspectorMini: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  inspectorAvatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionBubble: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  answersScroll: {
    flex: 1,
  },
  answersContainer: {
    gap: 12,
  },
  answerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  answerText: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  verificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight + '10',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  verificationInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  verificationScroll: {
    flex: 1,
    marginBottom: 16,
  },
  verificationCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verificationAnswered: {
    backgroundColor: Colors.surfaceSecondary,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  verificationIcon: {
    fontSize: 20,
  },
  verificationTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  verificationQuestion: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  verificationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  verifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  verifyComplies: {
    backgroundColor: Colors.successLight,
  },
  verifyNotComplies: {
    backgroundColor: Colors.errorLight,
  },
  verifyNA: {
    backgroundColor: Colors.surfaceSecondary,
  },
  verifyText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  verificationResult: {
    alignItems: 'flex-start',
  },
  verifyResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  verifyResultText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  resultsContent: {
    padding: 20,
  },
  resultHeader: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: '800' as const,
  },
  resultLevel: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0px 1px 4px rgba(0,0,0,0.05)' },
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  infractionsSection: {
    marginBottom: 20,
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
  infractionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.errorLight + '50',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infractionMinor: {
    backgroundColor: Colors.warningLight + '50',
  },
  infractionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    color: Colors.textOnPrimary,
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    overflow: 'hidden',
  },
  infractionContent: {
    flex: 1,
  },
  infractionDesc: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  infractionBasis: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infractionFine: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  crimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  crimeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.error,
  },
  noInfractionsCard: {
    backgroundColor: Colors.successLight + '30',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  noInfractionsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.success,
    marginTop: 12,
    marginBottom: 4,
  },
  noInfractionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  totalFinesCard: {
    backgroundColor: Colors.errorLight + '30',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  totalFinesTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.error,
    marginBottom: 8,
  },
  totalFinesAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.error,
    marginBottom: 12,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  riskText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: '500' as const,
  },
  actionButtonsContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryActionButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textOnPrimary,
  },
  secondaryActionButton: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  tertiaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  tertiaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  actionPlanContent: {
    padding: 20,
  },
  actionPlanHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionPlanTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  actionPlanSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionProgress: {
    marginBottom: 24,
  },
  actionProgressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  noActionsCard: {
    backgroundColor: Colors.successLight + '30',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  noActionsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.success,
    marginTop: 12,
    marginBottom: 4,
  },
  noActionsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 6px rgba(0,0,0,0.06)' },
    }),
  },
  actionCompleted: {
    opacity: 0.6,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionNumberContainer: {
    marginRight: 12,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    color: Colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '700' as const,
    textAlign: 'center',
    lineHeight: 28,
    overflow: 'hidden',
  },
  actionTitleContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionSteps: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  stepsTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 10,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  stepNumber: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 6,
    minWidth: 16,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    gap: 6,
  },
  completeButtonDone: {
    backgroundColor: Colors.successLight,
  },
  completeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
});
