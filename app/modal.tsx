import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { ScreenWrapper } from '../components/ScreenWrapper';

export default function ModalScreen() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Settings & Info</Text>
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        
        <View style={styles.content}>
          <Text style={[styles.text, { color: colors.text }]}>
            This Expense Tracker was redesigned to be Ultra Pro Max with a premium PhonePe-style theme.
          </Text>
          <Text style={[styles.text, { color: colors.textMuted, marginTop: 10 }]}>
            Version 1.0.0
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.md,
  },
  separator: {
    height: 1,
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    textAlign: 'center',
  },
  text: {
    ...theme.typography.body,
    textAlign: 'center',
  },
});
