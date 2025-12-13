import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  TextInput,
  Image,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  FileText, 
  BookOpen, 
  Scale, 
  Clock,
  AlertTriangle,
  Search,
  Download,
  ExternalLink
} from 'lucide-react-native';
import { useColors } from '@/contexts/ThemeContext';
import { DOCUMENTS, Document } from '@/constants/data';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'FileText': return FileText;
    case 'BookOpen': return BookOpen;
    case 'Scale': return Scale;
    case 'Clock': return Clock;
    case 'AlertTriangle': return AlertTriangle;
    default: return FileText;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'template': return 'Plantilla';
    case 'guide': return 'Guía';
    case 'legal': return 'Legal';
    default: return 'Documento';
  }
};

export default function DocumentsScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'template': return colors.primary;
      case 'guide': return '#8B5CF6';
      case 'legal': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const categories = [...new Set(DOCUMENTS.map(doc => doc.category))];

  const filteredDocuments = DOCUMENTS.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    if (!groups[doc.category]) {
      groups[doc.category] = [];
    }
    groups[doc.category].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  const handleDocumentPress = async (doc: Document) => {
    console.log('Opening document:', doc.id);
    
    if (!doc.downloadUrl) {
      Alert.alert('No disponible', 'Este documento no tiene enlace de descarga.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(doc.downloadUrl);
      if (supported) {
        await Linking.openURL(doc.downloadUrl);
      } else {
        Alert.alert('Error', 'No se puede abrir el enlace en este dispositivo.');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert('Error', 'Ocurrió un error al abrir el documento.');
    }
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
              <Text style={[styles.headerTitle, { color: colors.text }]}>Biblioteca de Documentos</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Plantillas, guías y marco legal</Text>
            </View>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.surfaceSecondary }]}>
          <Search color={colors.textLight} size={18} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar documentos..."
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
              Todos
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                { backgroundColor: colors.surfaceSecondary },
                selectedCategory === category && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                { color: colors.textSecondary },
                selectedCategory === category && { color: colors.textOnPrimary }
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedDocuments).map(([category, docs]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { color: colors.primary }]}>{category}</Text>
            {docs.map((doc) => {
              const IconComponent = getIconComponent(doc.icon);
              const typeColor = getTypeColor(doc.type);
              
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[styles.documentCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleDocumentPress(doc)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.documentIcon, { backgroundColor: typeColor + '15' }]}>
                    <IconComponent color={typeColor} size={22} />
                  </View>
                  <View style={styles.documentContent}>
                    <View style={styles.documentHeader}>
                      <Text style={[styles.documentTitle, { color: colors.text }]}>{doc.title}</Text>
                      <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                          {getTypeLabel(doc.type)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.documentDescription, { color: colors.textSecondary }]}>{doc.description}</Text>
                  </View>
                  <View style={styles.documentAction}>
                    {doc.type === 'template' ? (
                      <Download color={colors.primary} size={18} />
                    ) : (
                      <ExternalLink color={colors.textSecondary} size={18} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {Object.keys(groupedDocuments).length === 0 && (
          <View style={styles.emptyState}>
            <FileText color={colors.textLight} size={48} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin resultados</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No se encontraron documentos que coincidan con tu búsqueda.
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
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
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
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
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
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentContent: {
    flex: 1,
    marginLeft: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  documentDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  documentAction: {
    marginLeft: 12,
    padding: 4,
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
