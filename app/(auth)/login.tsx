import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Link } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { supabase } from '../../services/supabase';
import { theme } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Mail, Lock, Wallet } from 'lucide-react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Error', error.message);
    setLoading(false);
  }

  return (
    <ScreenWrapper>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          style={styles.container} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '15' }]}>
              <Wallet color={colors.primary} size={48} strokeWidth={1.5} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Sign in to manage your expenses.</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Input
              label="Email"
              icon={<Mail color={colors.textMuted} size={20} />}
              onChangeText={setEmail}
              value={email}
              placeholder="email@address.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              icon={<Lock color={colors.textMuted} size={20} />}
              onChangeText={setPassword}
              value={password}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
            />
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Sign In" 
                onPress={signInWithEmail} 
                isLoading={loading} 
              />
            </View>

            <Link href="/signup" style={styles.linkText}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                Don't have an account? <Text style={[styles.linkHighlight, { color: colors.primary }]}>Sign up</Text>
              </Text>
            </Link>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl * 1.5,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
  },
  formContainer: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  linkText: {
    textAlign: 'center',
    padding: theme.spacing.sm,
  },
  footerText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  linkHighlight: {
    fontWeight: '600',
  },
});
