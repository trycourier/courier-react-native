import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Easing } from 'react-native';

interface Touch {
  id: string;
  x: number;
  y: number;
  timestamp: number;
  animation: Animated.Value;
}

interface TouchIndicatorStyle {
  size?: number;
  color?: string;
}

interface PokeContextType {
  setEnabled: (enabled: boolean) => void;
  setIndicatorStyle: (style: TouchIndicatorStyle) => void;
  setTouchTimeout: (timeout: number) => void;
}

const PokeContext = createContext<PokeContextType | undefined>(undefined);

export const usePoke = () => {
  const context = useContext(PokeContext);
  if (!context) {
    throw new Error('usePoke must be used within a PokeProvider');
  }
  return context;
};

interface PokeProviderProps {
  children: React.ReactNode;
  initialEnabled?: boolean;
  initialIndicatorStyle?: TouchIndicatorStyle;
  initialTouchTimeout?: number;
}

export const Poke: React.FC<PokeProviderProps> = ({
  children,
  initialEnabled = true,
  initialIndicatorStyle,
  initialTouchTimeout = 150,
}) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [indicatorStyle, setIndicatorStyle] = useState<TouchIndicatorStyle>(initialIndicatorStyle || {});
  const [touchTimeout, setTouchTimeout] = useState(initialTouchTimeout);

  const contextValue = useMemo(() => ({
    setEnabled,
    setIndicatorStyle,
    setTouchTimeout,
  }), []);

  return (
    <PokeContext.Provider value={contextValue}>
      <TouchIndicator
        enabled={enabled}
        indicatorStyle={indicatorStyle}
        touchTimeout={touchTimeout}
      >
        {children}
      </TouchIndicator>
    </PokeContext.Provider>
  );
};

interface TouchIndicatorProps {
  children: React.ReactNode;
  indicatorStyle?: TouchIndicatorStyle;
  enabled: boolean;
  touchTimeout: number;
}

const TouchIndicator: React.FC<TouchIndicatorProps> = ({ 
  children, 
  indicatorStyle, 
  enabled, 
  touchTimeout
}) => {
  const [latestTouch, setLatestTouch] = useState<Touch | null>(null);

  const indicatorSize = indicatorStyle?.size || 50;
  const indicatorColor = indicatorStyle?.color || 'rgba(0, 122, 255, 0.4)'; // Default blue color

  useEffect(() => {
    if (latestTouch) {
      const timer = setTimeout(() => {
        setLatestTouch(null);
      }, touchTimeout);

      return () => clearTimeout(timer);
    }
    return () => {}; // Add this line
  }, [latestTouch, touchTimeout]);

  const handleTouch = (event: any) => {
    if (!enabled) return;
    const touch = event.nativeEvent.touches[0]; // Get only the latest touch
    if (touch) {
      const newTouch: Touch = {
        id: `${touch.identifier}-${Date.now()}`,
        x: touch.pageX,
        y: touch.pageY,
        timestamp: Date.now(),
        animation: new Animated.Value(1),
      };

      Animated.timing(newTouch.animation, {
        toValue: 0,
        duration: touchTimeout,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();

      setLatestTouch(newTouch);
    }
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
      {enabled && latestTouch && (
        <Animated.View
          key={latestTouch.id}
          style={[
            touchIndicatorStyle,
            {
              left: latestTouch.x - indicatorSize / 2,
              top: latestTouch.y - indicatorSize / 2,
              opacity: latestTouch.animation,
            },
          ]}
        />
      )}
    </View>
  );
};
