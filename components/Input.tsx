import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, style, ...props }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        { backgroundColor: colors.surface, borderColor: colors.border },
        error ? { borderColor: colors.danger } : null,
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    height: 56,
  },
  iconContainer: {
    paddingLeft: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    ...theme.typography.body,
    height: '100%',
  },
  errorText: {
    ...theme.typography.small,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
