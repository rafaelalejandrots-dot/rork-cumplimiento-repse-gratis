import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  TextInput,
  Modal,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calculator, 
  AlertTriangle,
  CheckSquare,
  Square,
  Info,
  TrendingDown,
  Edit3,
  X
} from 'lucide-react-native';
import { useColors } from '@/contexts/ThemeContext';
import { FINES_CATALOG, UMA_VALUE, FineItem } from '@/constants/data';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CalculatorScreen() {
  const colors = useColors();
  const [selectedFines, setSelectedFines] = useState<Record<string, boolean>>({});
  const [workerCount, setWorkerCount] = useState(1);
  const [customUMA, setCustomUMA] = useState(UMA_VALUE);
  const [showUMAModal, setShowUMAModal] = useState(false);
  const [tempUMA, setTempUMA] = useState(UMA_VALUE.toString());

  const toggleFine = (fineId: string) => {
    setSelectedFines(prev => ({
      ...prev,
      [fineId]: !prev[fineId],
    }));
  };

  const increaseWorkers = () => setWorkerCount(prev => prev + 1);
  const decreaseWorkers = () => setWorkerCount(prev => Math.max(1, prev - 1));

  const handleSaveUMA = () => {
    const parsed = parseFloat(tempUMA.replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) {
      setCustomUMA(parsed);
    }
    setShowUMAModal(false);
  };

  const handleResetUMA = () => {
    setCustomUMA(UMA_VALUE);
    setTempUMA(UMA_VALUE.toString());
    setShowUMAModal(false);
  };

  const calculation = useMemo(() => {
    let minUMA = 0;
    let maxUMA = 0;
    const selectedItems: FineItem[] = [];
    const additionalConsequences: string[] = [];

    FINES_CATALOG.forEach(fine => {
      if (selectedFines[fine.id]) {
        selectedItems.push(fine);
        const multiplier = fine.perWorker ? workerCount : 1;
        minUMA += fine.minUMA * multiplier;
        maxUMA += fine.maxUMA * multiplier;
        if (fine.additionalConsequences) {
          additionalConsequences.push(...fine.additionalConsequences);
        }
      }
    });

    return {
      minUMA,
      maxUMA,
      minMXN: minUMA * customUMA,
      maxMXN: maxUMA * customUMA,
      selectedItems,
      additionalConsequences: [...new Set(additionalConsequences)],
    };
  }, [selectedFines, workerCount, customUMA]);

  const hasPerWorkerFine = FINES_CATALOG.some(f => selectedFines[f.id] && f.perWorker);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kh81cpscyz517q0o05up7' }}
              style={[styles.logo, { backgroundColor: colors.surfaceSecondary }]}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Calculadora de Multas</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Estima el riesgo económico</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.umaInfo, { backgroundColor: colors.primary + '20' }]}
          onPress={() => {
            setTempUMA(customUMA.toString());
            setShowUMAModal(true);
          }}
          activeOpacity={0.7}
        >
          <Info color={colors.primary} size={14} />
          <Text style={[styles.umaText, { color: colors.primary }]}>
            UMA Diario: {formatCurrency(customUMA)}
          </Text>
          <Edit3 color={colors.primary} size={14} />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Selecciona las infracciones</Text>
        
        {FINES_CATALOG.map((fine) => {
          const isSelected = selectedFines[fine.id];
          
          return (
            <TouchableOpacity
              key={fine.id}
              style={[
                styles.fineCard, 
                { backgroundColor: colors.surface },
                isSelected && { borderColor: colors.error + '40', backgroundColor: colors.errorLight }
              ]}
              onPress={() => toggleFine(fine.id)}
              activeOpacity={0.7}
            >
              <View style={styles.fineCheckbox}>
                {isSelected ? (
                  <CheckSquare color={colors.error} size={22} />
                ) : (
                  <Square color={colors.textLight} size={22} />
                )}
              </View>
              <View style={styles.fineContent}>
                <Text style={[styles.fineName, { color: colors.text }]}>{fine.name}</Text>
                <Text style={[styles.fineDescription, { color: colors.textSecondary }]}>{fine.description}</Text>
                <View style={styles.fineRange}>
                  <Text style={[styles.fineRangeText, { color: colors.error }]}>
                    {fine.minUMA.toLocaleString()} - {fine.maxUMA.toLocaleString()} UMAs
                  </Text>
                  {fine.perWorker && (
                    <View style={[styles.perWorkerBadge, { backgroundColor: colors.warningLight }]}>
                      <Text style={[styles.perWorkerText, { color: colors.warningDark }]}>Por trabajador</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {hasPerWorkerFine && (
          <View style={[styles.workerCountCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.workerCountLabel, { color: colors.text }]}>Número de trabajadores afectados:</Text>
            <View style={styles.workerCountControls}>
              <TouchableOpacity 
                style={[styles.countButton, { backgroundColor: colors.primary }]} 
                onPress={decreaseWorkers}
              >
                <Text style={[styles.countButtonText, { color: colors.textOnPrimary }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.workerCountValue, { color: colors.text }]}>{workerCount}</Text>
              <TouchableOpacity 
                style={[styles.countButton, { backgroundColor: colors.primary }]} 
                onPress={increaseWorkers}
              >
                <Text style={[styles.countButtonText, { color: colors.textOnPrimary }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {calculation.selectedItems.length > 0 && (
          <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.error + '30' }]}>
            <View style={styles.resultHeader}>
              <Calculator color={colors.error} size={24} />
              <Text style={[styles.resultTitle, { color: colors.text }]}>Multa Estimada</Text>
            </View>

            <View style={[styles.resultAmounts, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>En UMAs:</Text>
                <Text style={[styles.resultUMA, { color: colors.text }]}>
                  {calculation.minUMA.toLocaleString()} - {calculation.maxUMA.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.resultDivider, { backgroundColor: colors.border }]} />
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Mínimo:</Text>
                <Text style={[styles.resultMXN, { color: colors.error }]}>{formatCurrency(calculation.minMXN)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>Máximo:</Text>
                <Text style={[styles.resultMXN, styles.resultMax, { color: colors.error }]}>
                  {formatCurrency(calculation.maxMXN)}
                </Text>
              </View>
            </View>

            {calculation.additionalConsequences.length > 0 && (
              <View style={[styles.consequencesSection, { borderTopColor: colors.border }]}>
                <View style={styles.consequencesHeader}>
                  <AlertTriangle color={colors.warning} size={16} />
                  <Text style={[styles.consequencesTitle, { color: colors.warningDark }]}>Consecuencias adicionales:</Text>
                </View>
                {calculation.additionalConsequences.map((consequence, index) => (
                  <Text key={index} style={[styles.consequenceItem, { color: colors.textSecondary }]}>
                    • {consequence}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {calculation.selectedItems.length === 0 && (
          <View style={styles.emptyResult}>
            <TrendingDown color={colors.textLight} size={48} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin infracciones seleccionadas</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Selecciona las infracciones para calcular el riesgo de multa.
            </Text>
          </View>
        )}

        <View style={[styles.disclaimerCard, { backgroundColor: colors.warningLight }]}>
          <AlertTriangle color={colors.warningDark} size={16} />
          <Text style={[styles.disclaimerText, { color: colors.warningDark }]}>
            Este cálculo es estimado. El monto real depende de diversos factores como 
            reincidencia, tamaño de la empresa y criterio de la autoridad.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showUMAModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUMAModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Valor del UMA Diario</Text>
              <TouchableOpacity
                onPress={() => setShowUMAModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Modifica el valor del UMA para calcular multas con valores actualizados.
            </Text>

            <View style={[styles.inputContainer, { backgroundColor: colors.surfaceSecondary, borderColor: colors.primary }]}>
              <Text style={[styles.inputPrefix, { color: colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.umaInput, { color: colors.text }]}
                value={tempUMA}
                onChangeText={setTempUMA}
                keyboardType="decimal-pad"
                placeholder="113.14"
                placeholderTextColor={colors.textLight}
                selectTextOnFocus
              />
              <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>MXN</Text>
            </View>

            <Text style={[styles.umaHint, { color: colors.textLight }]}>
              Valor oficial 2025: ${UMA_VALUE.toFixed(2)} MXN
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={handleResetUMA}
              >
                <Text style={[styles.resetButtonText, { color: colors.textSecondary }]}>Restaurar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveUMA}
              >
                <Text style={[styles.saveButtonText, { color: colors.textOnPrimary }]}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    borderBottomWidth: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  umaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 10,
  },
  umaText: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  umaInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700' as const,
    paddingVertical: 14,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  umaHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  fineCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
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
  fineCheckbox: {
    marginRight: 12,
    marginTop: 2,
  },
  fineContent: {
    flex: 1,
  },
  fineName: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  fineDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  fineRange: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  fineRangeText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  perWorkerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  perWorkerText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  workerCountCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0,0,0,0.06)',
      },
    }),
  },
  workerCountLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 12,
  },
  workerCountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  countButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countButtonText: {
    fontSize: 24,
    fontWeight: '600' as const,
  },
  workerCountValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    minWidth: 60,
    textAlign: 'center',
  },
  resultCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(239, 68, 68, 0.15)',
      },
    }),
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  resultAmounts: {
    borderRadius: 12,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultLabel: {
    fontSize: 14,
  },
  resultUMA: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  resultDivider: {
    height: 1,
    marginVertical: 8,
  },
  resultMXN: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  resultMax: {
    fontSize: 22,
  },
  consequencesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  consequencesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  consequencesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  consequenceItem: {
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 8,
  },
  emptyResult: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
