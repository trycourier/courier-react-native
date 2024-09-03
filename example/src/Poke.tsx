import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface Touch {
  id: number;
  x: number;
  y: number;
  timestamp: number;
}

const TOUCH_TIMEOUT = 500; // ms

export const TouchVisualizer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [touches, setTouches] = useState<Touch[]>([]);

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
      id: touch.identifier,
      x: touch.pageX,
      y: touch.pageY,
      timestamp: Date.now(),
    }));
    setTouches(prevTouches => [...prevTouches, ...newTouches]);
  };

  return (
    <View 
      style={StyleSheet.absoluteFill} 
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleTouch}
    >
      {children}
      {touches.map(touch => (
        <View
          key={touch.id}
          style={[
            styles.touchIndicator,
            { left: touch.x - 25, top: touch.y - 25 }
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  touchIndicator: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
    zIndex: 9999,
  },
});
