import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, Animated } from 'react-native';
import { theme } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'surface';
  isLoading?: boolean;
  textStyle?: any;
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  style, 
  textStyle,
  disabled,
  ...props 
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';
  const isSurface = variant === 'surface';
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceLight;
    if (isGhost) return 'transparent';
    if (isSurface) return colors.surfaceLight;
    if (isPrimary) return colors.primary;
    if (isDanger) return colors.danger;
    return colors.surface;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (isGhost) return colors.primaryLight;
    return isPrimary || isDanger ? '#FFFFFF' : colors.text;
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        style={[
          styles.button, 
          { backgroundColor: getBackgroundColor() },
          isGhost && [styles.ghostButton, { borderColor: colors.border }],
          style
        ]} 
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    ...theme.shadows.small,
  },
  ghostButton: {
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
  },
  text: {
    ...theme.typography.h3,
    fontWeight: '600',
  },
});
