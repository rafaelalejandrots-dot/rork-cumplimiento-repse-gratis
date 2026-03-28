import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Search,
  BookOpen,
  Lightbulb,
  Scale,
  FileQuestion
} from 'lucide-react-native';
import { useColors } from '@/contexts/ThemeContext';
import { FAQ_ITEMS } from '@/constants/data';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Conceptos Básicos': return BookOpen;
    case 'Casos Prácticos': return Lightbulb;
    case 'Documentación': return Scale;
    case 'Inspecciones': return FileQuestion;
    default: return HelpCircle;
  }
};

export default function LearnScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Conceptos Básicos': return colors.primary;
      case 'Casos Prácticos': return '#8B5CF6';
      case 'Documentación': return colors.success;
      case 'Inspecciones': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const categories = [...new Set(FAQ_ITEMS.map(item => item.category))];

  const filteredItems = FAQ_ITEMS.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedItems = filteredItems.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {} as Record<string, typeof FAQ_ITEMS>);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
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
              <Text style={[styles.headerTitle, { color: colors.text }]}>Centro de Aprendizaje</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Preguntas frecuentes y guías</Text>
            </View>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Search color={colors.textLight} size={18} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar preguntas..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              { backgroundColor: colors.surfaceSecondary },
              !selectedCategory && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryChipText,
              { color: colors.textSecondary },
              !selectedCategory && { color: colors.textOnPrimary }
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categories.map((category) => {
            const IconComponent = getCategoryIcon(category);
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.surfaceSecondary },
                  isSelected && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <IconComponent 
                  color={isSelected ? colors.textOnPrimary : colors.textSecondary} 
                  size={14} 
                />
                <Text style={[
                  styles.categoryChipText,
                  { color: colors.textSecondary },
                  isSelected && { color: colors.textOnPrimary }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedItems).map(([category, items]) => {
          const IconComponent = getCategoryIcon(category);
          const categoryColor = getCategoryColor(category);
          
          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '15' }]}>
                  <IconComponent color={categoryColor} size={18} />
                </View>
                <Text style={[styles.categoryTitle, { color: categoryColor }]}>
                  {category}
                </Text>
              </View>

              {items.map((item) => {
                const isExpanded = expandedItems[item.id];
                
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.faqCard, { backgroundColor: colors.surface }]}
                    onPress={() => toggleExpanded(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.faqHeader}>
                      <HelpCircle color={colors.primary} size={18} />
                      <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.question}</Text>
                      {isExpanded ? (
                        <ChevronUp color={colors.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={colors.textSecondary} size={20} />
                      )}
                    </View>
                    
                    {isExpanded && (
                      <View style={[styles.faqAnswer, { borderTopColor: colors.borderLight }]}>
                        <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{item.answer}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {Object.keys(groupedItems).length === 0 && (
          <View style={styles.emptyState}>
            <HelpCircle color={colors.textLight} size={48} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin resultados</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No se encontraron preguntas que coincidan con tu búsqueda.
            </Text>
          </View>
        )}

        <View style={[styles.helpCard, { backgroundColor: colors.warningLight }]}>
          <Lightbulb color={colors.warning} size={20} />
          <View style={styles.helpContent}>
            <Text style={[styles.helpTitle, { color: colors.warningDark }]}>¿No encuentras lo que buscas?</Text>
            <Text style={[styles.helpText, { color: colors.textSecondary }]}>
              Próximamente tendremos un asistente con IA para responder tus preguntas específicas.
            </Text>
          </View>
        </View>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  categoriesContainer: {
    maxHeight: 44,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  categoryChipText: {
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
  categorySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  faqCard: {
    borderRadius: 12,
    marginBottom: 10,
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
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  faqAnswer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 22,
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
  helpCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
