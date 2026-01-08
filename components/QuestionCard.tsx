import React, { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  withDelay,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface QuestionCardProps {
  question: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  index: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onSwipeLeft,
  onSwipeRight,
  index,
}) => {
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;

  // Розмір картки адаптивний
  const cardWidth = isTablet ? 500 : width * 0.9;
  const cardHeight = isTablet ? 600 : height * 0.7;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);

  // Gesture handler для свайпів
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX / 10;
    })
    .onEnd((event) => {
      const shouldDismiss = Math.abs(event.translationX) > width * 0.3;
      
      if (shouldDismiss) {
        // Haptic feedback
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);

        // Анімація виходу
        translateX.value = withTiming(event.translationX > 0 ? width * 1.5 : -width * 1.5, {
          duration: 300,
        });
        translateY.value = withTiming(event.translationY * 1.2, {
          duration: 300,
        });
        rotate.value = withTiming(event.translationX > 0 ? 30 : -30, {
          duration: 300,
        });
        
        // Callback після анімації з reset позиції
        setTimeout(() => {
          // Reset позиції картки
          translateX.value = 0;
          translateY.value = 0;
          rotate.value = 0;
          
          // Викликаємо callback
          if (event.translationX > 0) {
            runOnJS(onSwipeRight)();
          } else {
            runOnJS(onSwipeLeft)();
          }
        }, 300);
      } else {
        // Повернення на місце
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));



  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.cardContainer,
          animatedCardStyle,
          {
            width: cardWidth,
            height: cardHeight,
          },
        ]}
      >
        <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
          {/* Контент */}
          <Animated.View style={styles.contentContainer}>
            <Animated.Text style={styles.questionText}>
              {question}
            </Animated.Text>

            {/* Підказка для свайпу */}
            <Text style={styles.swipeHint}>
              ← Свайпніть → для наступного
            </Text>
          </Animated.View>

          {/* Glassmorphism overlay */}
          <View style={styles.glassOverlay} />
        </BlurView>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  questionNumber: {
    fontSize: 16,
    color: '#ff006e',
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 40,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '400',
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 30,
  },
});
