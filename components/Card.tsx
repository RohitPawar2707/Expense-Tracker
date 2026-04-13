import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
});
