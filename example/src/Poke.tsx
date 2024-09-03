import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';

interface Touch {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  animation: Animated.Value;
}

const TOUCH_TIMEOUT = 100; // ms

interface TouchIndicatorStyle {
  size?: number;
  color?: string;
}

interface TouchVisualizerProps {
  children: React.ReactNode;
  indicatorStyle?: TouchIndicatorStyle;
}

export const TouchVisualizer: React.FC<TouchVisualizerProps> = ({ children, indicatorStyle }) => {
  const [touches, setTouches] = useState<Touch[]>([]);

  const indicatorSize = indicatorStyle?.size || 50;
  const indicatorColor = indicatorStyle?.color || 'rgba(0, 122, 255, 0.5)'; // Default blue color

  useEffect(() => {
    const timer = setInterval(() => {
      setTouches(prevTouches => 
        prevTouches.filter(touch => Date.now() - touch.timestamp < TOUCH_TIMEOUT)
      );
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleTouch = (event: any) => {
    const newTouches = event.nativeEvent.touches.map((touch: any) => ({
      id: `${touch.identifier}-${Date.now()}`,
      x: touch.pageX,
      y: touch.pageY,
      timestamp: Date.now(),
      animation: new Animated.Value(1),
    }));

    newTouches.forEach((touch: Touch) => {
      Animated.timing(touch.animation, {
        toValue: 0,
        duration: TOUCH_TIMEOUT,
        useNativeDriver: true,
      }).start();
    });

    setTouches(prevTouches => [...prevTouches, ...newTouches]);
  };

  const touchIndicatorStyle = useMemo(() => ({
    position: 'absolute',
    width: indicatorSize,
    height: indicatorSize,
    borderRadius: indicatorSize / 2,
    backgroundColor: indicatorColor,
    zIndex: 9999,
  } as ViewStyle), [indicatorSize, indicatorColor]);

  return (
    <View 
      style={StyleSheet.absoluteFill} 
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouch}
    >
      {children}
      {touches.map(touch => (
        <Animated.View
          key={touch.id}
          style={[
            touchIndicatorStyle,
            {
              left: touch.x - indicatorSize / 2,
              top: touch.y - indicatorSize / 2,
              opacity: touch.animation,
              transform: [
                {
                  scale: touch.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};
