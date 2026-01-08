import React, { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, Animated } from 'react-native';

export const AnimatedBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  
  // Стан для градієнта
  const [gradientOffsetX] = useState(new Animated.Value(0));
  const [gradientOffsetY] = useState(new Animated.Value(0));

  useEffect(() => {
    // Проста анімація градієнта
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(gradientOffsetX, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientOffsetX, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(gradientOffsetY, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientOffsetY, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start();
  }, []);

  const backgroundColor = gradientOffsetY.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1a0000', '#2a0a0a'],
  });

  return (
    <Animated.View style={[styles.canvas, { backgroundColor }]} />
  );
};

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
  },
});
