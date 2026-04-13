import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { supabase } from '../../services/supabase';
import { theme } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { Mail, Lock, User } from 'lucide-react-native';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  async function signUpWithEmail() {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: fullName,
        }
      }
    });

    if (error) {
       Alert.alert('Error', error.message);
    } else if (data?.session === null) {
       Alert.alert('Success', 'Please check your inbox for email verification!');
       router.replace('/login');
    } else {
       // Auto logged in
    }
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
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Start tracking your expenses today.</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Input
              label="Full Name"
              icon={<User color={colors.textMuted} size={20} />}
              onChangeText={setFullName}
              value={fullName}
              placeholder="John Doe"
              autoCapitalize="words"
            />
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
                title="Sign Up" 
                onPress={signUpWithEmail} 
                isLoading={loading} 
              />
            </View>

            <Link href="/login" style={styles.linkText}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                Already have an account? <Text style={[styles.linkHighlight, { color: colors.primary }]}>Sign in</Text>
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
