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
import { useColors } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { CHECKLIST_ITEMS, ChecklistItem } from '@/constants/data';

type FilterType = 'all' | 'pending' | 'completed';

export default function ChecklistScreen() {
  const { data, toggleChecklistItem, getChecklistProgress } = useApp();
  const colors = useColors();
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
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return colors.success;
    if (percentage >= 50) return colors.warning;
    return colors.error;
  };

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
              <Text style={[styles.headerTitle, { color: colors.text }]}>Checklist de Cumplimiento</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {userType === 'contratista' ? 'Para Contratistas' : 
                 userType === 'beneficiario' ? 'Para Beneficiarios' : 'General'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Tu progreso</Text>
            <Text style={[styles.progressPercentage, { color: getStatusColor(progress.percentage) }]}>
              {progress.percentage}%
            </Text>
          </View>
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
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
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {progress.completed} de {progress.total} requisitos completados
          </Text>
        </View>

        <View style={styles.filterContainer}>
          <Filter color={colors.textSecondary} size={16} />
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: colors.surfaceSecondary }, filter === 'all' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary }, filter === 'all' && { color: colors.textOnPrimary }]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: colors.surfaceSecondary }, filter === 'pending' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary }, filter === 'pending' && { color: colors.textOnPrimary }]}>
              Pendientes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, { backgroundColor: colors.surfaceSecondary }, filter === 'completed' && { backgroundColor: colors.primary }]}
            onPress={() => setFilter('completed')}
          >
            <Text style={[styles.filterText, { color: colors.textSecondary }, filter === 'completed' && { color: colors.textOnPrimary }]}>
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
            <Text style={[styles.categoryTitle, { color: colors.primary }]}>{category}</Text>
            {items.map((item) => {
              const isCompleted = data.checklistState[item.id]?.completed;
              const isExpanded = expandedItems[item.id];
              
              return (
                <View key={item.id} style={[styles.itemContainer, { backgroundColor: colors.surface }]}>
                  <TouchableOpacity
                    style={styles.itemHeader}
                    onPress={() => toggleChecklistItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.itemCheckbox}>
                      {isCompleted ? (
                        <CheckCircle2 color={colors.success} size={24} />
                      ) : (
                        <Circle color={colors.textLight} size={24} />
                      )}
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.itemTitleRow}>
                        <Text style={[
                          styles.itemTitle, 
                          { color: colors.text },
                          isCompleted && { color: colors.textSecondary, textDecorationLine: 'line-through' }
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
                        <ChevronUp color={colors.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={colors.textSecondary} size={20} />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.itemDetails, { borderTopColor: colors.borderLight }]}>
                      <View style={styles.detailRow}>
                        <Info color={colors.primary} size={14} />
                        <Text style={[styles.detailLabel, { color: colors.primary }]}>¿Qué es esto?</Text>
                      </View>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.description}</Text>

                      <View style={styles.detailRow}>
                        <Scale color={colors.primary} size={14} />
                        <Text style={[styles.detailLabel, { color: colors.primary }]}>Fundamento legal</Text>
                      </View>
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.legalBasis}</Text>

                      <View style={styles.detailRow}>
                        <AlertTriangle color={colors.warning} size={14} />
                        <Text style={[styles.detailLabel, { color: colors.warning }]}>Consecuencias</Text>
                      </View>
                      <Text style={[styles.detailTextWarning, { color: colors.warningDark }]}>{item.consequence}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {Object.keys(groupedItems).length === 0 && (
          <View style={styles.emptyState}>
            <CheckCircle2 color={colors.success} size={48} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'pending' ? '¡Todo completado!' : 'Sin elementos'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
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
  },
  safeArea: {
    borderBottomWidth: 1,
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
  progressCard: {
    marginHorizontal: 16,
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
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
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
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500' as const,
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
    marginBottom: 12,
  },
  itemContainer: {
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
    flex: 1,
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
    marginLeft: 6,
  },
  detailText: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 20,
  },
  detailTextWarning: {
    fontSize: 13,
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
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
