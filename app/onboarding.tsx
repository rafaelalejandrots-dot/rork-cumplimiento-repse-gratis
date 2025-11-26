import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
  FlatList,
  ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield,
  ClipboardCheck,
  Target,
  Calculator,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ color: string; size: number }>;
  gradient: readonly [string, string, string];
  accentColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Cumplimiento REPSE',
    subtitle: 'Tu guía gratuita',
    description: 'La herramienta más completa para cumplir con la Ley Federal del Trabajo en materia de subcontratación.',
    icon: Shield,
    gradient: [Colors.primary, Colors.primaryLight, '#4A6FA5'] as const,
    accentColor: '#63B3ED',
  },
  {
    id: '2',
    title: 'Diagnóstico Inteligente',
    subtitle: 'Conoce tu situación',
    description: 'Responde un breve cuestionario y obtén un diagnóstico personalizado de tu nivel de cumplimiento.',
    icon: ClipboardCheck,
    gradient: ['#0F766E', '#14B8A6', '#2DD4BF'] as const,
    accentColor: '#5EEAD4',
  },
  {
    id: '3',
    title: 'Simulador de Inspección',
    subtitle: 'Prepárate para lo real',
    description: 'Practica con escenarios reales y aprende qué documentos necesitas tener listos.',
    icon: Target,
    gradient: ['#7C3AED', '#8B5CF6', '#A78BFA'] as const,
    accentColor: '#C4B5FD',
  },
  {
    id: '4',
    title: 'Calculadora de Multas',
    subtitle: 'Evita sanciones',
    description: 'Estima el costo de las infracciones y toma acciones preventivas para proteger tu empresa.',
    icon: Calculator,
    gradient: ['#DC2626', '#EF4444', '#F87171'] as const,
    accentColor: '#FECACA',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { completeIntro } = useApp();
  const router = useRouter();

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const handleComplete = useCallback(() => {
    completeIntro();
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 50);
  }, [completeIntro, router]);

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ 
        index: nextIndex,
        animated: true 
      });
    } else {
      handleComplete();
    }
  }, [currentIndex, handleComplete]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const renderSlide = useCallback(({ item }: { item: OnboardingSlide }) => {
    const IconComponent = item.icon;
    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient}
          style={styles.slideGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.slideContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <View style={[styles.iconInner, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <IconComponent color="#FFFFFF" size={56} />
                  </View>
                </View>
                <View style={styles.sparkleContainer}>
                  <Sparkles color={item.accentColor} size={20} />
                </View>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }, []);

  const renderPagination = useCallback(() => (
    <View style={styles.pagination}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            currentIndex === index && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  ), [currentIndex]);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        scrollEventThrottle={16}
      />

      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.bottomGradient}
        >
          <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
            {renderPagination()}

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipButtonText}>Omitir</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>
                  {currentIndex === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
                </Text>
                <ArrowRight color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/kh81cpscyz517q0o05up7' }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.logoText}>100% Gratuito • Sin Registro</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  slide: {
    width,
    height,
  },
  slideGradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 200,
  },
  iconContainer: {
    marginBottom: 48,
    position: 'relative',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 320,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    paddingTop: 40,
  },
  bottomSafeArea: {
    paddingHorizontal: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  skipButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.8)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
