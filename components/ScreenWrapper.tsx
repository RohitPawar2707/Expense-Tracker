import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, ViewProps } from 'react-native';
import { theme } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ 
  children, 
  useSafeArea = true,
  style,
  ...props 
}) => {
  const { colors, isDark } = useTheme();
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container style={[styles.container, { backgroundColor: colors.background }, style]} {...props}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
