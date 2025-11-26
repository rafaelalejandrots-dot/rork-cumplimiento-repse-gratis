import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Info,
  Scale,
  Filter
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { CHECKLIST_ITEMS, ChecklistItem } from '@/constants/data';

type FilterType = 'all' | 'pending' | 'completed';

export default function ChecklistScreen() {
  const { data, toggleChecklistItem, getChecklistProgress } = useApp();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterType>('all');
  const progress = getChecklistProgress();

  const userType = data.userType || 'general';

  const groupedItems = useMemo(() => {
    const relevantItems = CHECKLIST_ITEMS.filter(
      item => item.forUserTypes.includes(userType)
    );

    let filteredItems = relevantItems;
    if (filter === 'pending') {
      filteredItems = relevantItems.filter(item => !data.checklistState[item.id]?.completed);
    } else if (filter === 'completed') {
      filteredItems = relevantItems.filter(item => data.checklistState[item.id]?.completed);
    }

    const groups: Record<string, ChecklistItem[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [userType, filter, data.checklistState]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return Colors.error;
      case 'medium': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return Colors.success;
    if (percentage >= 50) return Colors.warning;
    return Colors.error;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Image
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kh81cpscyz517q0o05up7' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Checklist de Cumplimiento</Text>
              <Text style={styles.headerSubtitle}>
                {userType === 'contratista' ? 'Para Contratistas' : 
                 userType === 'beneficiario' ? 'Para Beneficiarios' : 'General'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tu progreso</Text>
            <Text style={[styles.progressPercentage, { color: getStatusColor(progress.percentage) }]}>
              {progress.percentage}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progress.percentage}%`,
                  backgroundColor: getStatusColor(progress.percentage)
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {progress.completed} de {progress.total} requisitos completados
          </Text>
        </View>

        <View style={styles.filterContainer}>
          <Filter color={Colors.textSecondary} size={16} />
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'pending' && styles.filterButtonActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
              Pendientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
              Completados
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedItems).map(([category, items]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {items.map((item) => {
              const isCompleted = data.checklistState[item.id]?.completed;
              const isExpanded = expandedItems[item.id];
              
              return (
                <View key={item.id} style={styles.itemContainer}>
                  <TouchableOpacity
                    style={styles.itemHeader}
                    onPress={() => toggleChecklistItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemCheckbox}>
                      {isCompleted ? (
                        <CheckCircle2 color={Colors.success} size={24} />
                      ) : (
                        <Circle color={Colors.textLight} size={24} />
                      )}
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.itemTitleRow}>
                        <Text style={[
                          styles.itemTitle, 
                          isCompleted && styles.itemTitleCompleted
                        ]}>
                          {item.text}
                        </Text>
                        {item.priority === 'high' && !isCompleted && (
                          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
                            <AlertTriangle color={getPriorityColor(item.priority)} size={12} />
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.expandButton}
                      onPress={() => toggleExpanded(item.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp color={Colors.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={Colors.textSecondary} size={20} />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.itemDetails}>
                      <View style={styles.detailRow}>
                        <Info color={Colors.primary} size={14} />
                        <Text style={styles.detailLabel}>¿Qué es esto?</Text>
                      </View>
                      <Text style={styles.detailText}>{item.description}</Text>

                      <View style={styles.detailRow}>
                        <Scale color={Colors.primary} size={14} />
                        <Text style={styles.detailLabel}>Fundamento legal</Text>
                      </View>
                      <Text style={styles.detailText}>{item.legalBasis}</Text>

                      <View style={styles.detailRow}>
                        <AlertTriangle color={Colors.warning} size={14} />
                        <Text style={styles.detailLabel}>Consecuencias</Text>
                      </View>
                      <Text style={styles.detailTextWarning}>{item.consequence}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {Object.keys(groupedItems).length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircle2 color={Colors.success} size={48} />
            <Text style={styles.emptyTitle}>
              {filter === 'pending' ? '¡Todo completado!' : 'Sin elementos'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'pending' 
                ? 'Has completado todos los requisitos del checklist.' 
                : 'No hay elementos para mostrar con el filtro seleccionado.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textOnPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 12,
  },
  itemContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
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
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  itemCheckbox: {
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    flex: 1,
  },
  itemTitleCompleted: {
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  priorityBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  expandButton: {
    padding: 4,
    marginLeft: 8,
  },
  itemDetails: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginLeft: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    paddingLeft: 20,
  },
  detailTextWarning: {
    fontSize: 13,
    color: Colors.warningDark,
    lineHeight: 18,
    paddingLeft: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
