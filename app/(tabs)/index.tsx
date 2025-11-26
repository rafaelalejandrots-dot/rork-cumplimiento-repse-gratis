import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  ClipboardCheck, 
  BookOpen, 
  Target, 
  FileText, 
  Calculator,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { data, getChecklistProgress, isLoading } = useApp();
  const progress = getChecklistProgress();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!data.hasSeenIntro) {
    return <Redirect href="/onboarding" />;
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return Colors.success;
    if (percentage >= 50) return Colors.warning;
    return Colors.error;
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 80) return CheckCircle2;
    if (percentage >= 50) return Clock;
    return AlertTriangle;
  };

  const StatusIcon = getStatusIcon(progress.percentage);

  const quickActions = [
    {
      id: 'diagnostic',
      title: 'Diagnóstico',
      subtitle: '¿Estoy en regla?',
      icon: Search,
      color: Colors.primary,
      onPress: () => router.push('/diagnostic' as any),
    },
    {
      id: 'checklist',
      title: 'Checklist',
      subtitle: 'Verificar cumplimiento',
      icon: ClipboardCheck,
      color: Colors.secondary,
      onPress: () => router.push('/checklist'),
    },
    {
      id: 'learn',
      title: 'Aprender',
      subtitle: 'Guías y FAQ',
      icon: BookOpen,
      color: '#8B5CF6',
      onPress: () => router.push('/learn'),
    },
    {
      id: 'calculator',
      title: 'Calculadora',
      subtitle: 'Estimar multas',
      icon: Calculator,
      color: Colors.error,
      onPress: () => router.push('/calculator'),
    },
  ];

  const menuItems = [
    {
      id: 'documents',
      title: 'Biblioteca de Documentos',
      description: 'Plantillas, guías y marco legal',
      icon: FileText,
      onPress: () => router.push('/documents'),
    },
    {
      id: 'simulator',
      title: 'Simulador de Inspección',
      description: 'Practica antes de una inspección real',
      icon: Target,
      onPress: () => router.push('/simulator' as any),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kh81cpscyz517q0o05up7' }}
                style={styles.logo}
                resizeMode="contain"
              />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Cumplimiento REPSE</Text>
                <Text style={styles.headerSubtitle}>Tu guía de subcontratación</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data.userType && (
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(progress.percentage) + '20' }]}>
                <StatusIcon color={getStatusColor(progress.percentage)} size={24} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>Tu cumplimiento</Text>
                <Text style={styles.statusType}>
                  {data.userType === 'contratista' ? 'Contratista' : 
                   data.userType === 'beneficiario' ? 'Beneficiario' : 'General'}
                </Text>
              </View>
              <View style={styles.statusPercentage}>
                <Text style={[styles.percentageText, { color: getStatusColor(progress.percentage) }]}>
                  {progress.percentage}%
                </Text>
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
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
              {progress.completed} de {progress.total} requisitos cumplidos
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>¿Qué necesitas hacer hoy?</Text>
        
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                <action.icon color={action.color} size={24} />
              </View>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
              <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Herramientas</Text>
        
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
              disabled={false}
            >
              <View style={styles.menuItemIcon}>
                <item.icon color={Colors.primary} size={22} />
              </View>
              <View style={styles.menuItemContent}>
                <View style={styles.menuItemHeader}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </View>
                <Text style={styles.menuItemDescription}>{item.description}</Text>
              </View>
              <ChevronRight color={Colors.textLight} size={20} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>100% Gratuito • Sin Registro</Text>
          <Text style={styles.infoText}>
            Tus datos se guardan solo en tu dispositivo. No recopilamos información personal.
          </Text>
        </View>

        <View style={styles.legalNotice}>
          <AlertTriangle color={Colors.textLight} size={14} />
          <Text style={styles.legalText}>
            Esta app es informativa. No sustituye asesoría legal profesional.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textOnPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    marginTop: -10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
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
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  statusType: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusPercentage: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surfaceSecondary,
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
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  quickActionCard: {
    width: '50%',
    padding: 6,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.warningDark,
  },
  menuItemDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.primaryLight + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '30',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  legalText: {
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
