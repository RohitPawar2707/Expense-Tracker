import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useExpenseStore, PaymentMethod } from '../../store/useExpenseStore';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { theme } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { IndianRupee, FileText, Calendar as CalendarIcon, ChevronLeft, CreditCard, Wallet, Globe, Landmark } from 'lucide-react-native';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: any }[] = [
  { id: 'Cash', label: 'Cash', icon: Wallet },
  { id: 'Online', label: 'Online', icon: Globe },
  { id: 'Debit Card', label: 'Debit', icon: Landmark },
  { id: 'Credit Card', label: 'Credit', icon: CreditCard },
];

export default function AddExpense() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { expenses, addExpense, updateExpense } = useExpenseStore();
  const { colors } = useTheme();
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        setAmount(expense.amount.toString());
        setPaymentMethod(expense.payment_method);
        setNote(expense.note || '');
        setDate(new Date(expense.date).toISOString().split('T')[0]);
      }
    }
  }, [id, expenses]);

  const renderPaymentMethodPills = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.methodScroll} contentContainerStyle={{ paddingRight: 20 }}>
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const isActive = paymentMethod === method.id;
        return (
          <TouchableOpacity
            key={method.id}
            onPress={() => setPaymentMethod(method.id)}
            style={[
              styles.methodPill,
              { backgroundColor: isActive ? colors.primary : colors.surfaceLight },
              isActive && styles.pillActive
            ]}
          >
            <Icon size={18} color={isActive ? '#FFFFFF' : colors.textMuted} />
            <Text style={[styles.pillText, { color: isActive ? '#FFFFFF' : colors.text }]}>
              {method.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const handleSave = () => {
    if (!amount || isNaN(Number(amount))) return;
    setLoading(true);
    
    const expenseData = {
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      note,
      date: new Date(date).toISOString(),
      created_at: new Date().toISOString(),
    };

    if (id) {
      updateExpense(id, expenseData);
    } else {
      addExpense(expenseData);
    }
    
    setLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color={colors.text} size={28} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {id ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <View style={{ width: 44 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.amountDisplay}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Enter Amount</Text>
            <View style={styles.amountInputRow}>
              <IndianRupee color={colors.primary} size={32} strokeWidth={2.5} />
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted + '80'}
                autoFocus={!id}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: colors.text }]}>Payment Method</Text>
            {renderPaymentMethodPills()}

            <View style={styles.spacer} />

            <Card style={{ backgroundColor: colors.surface }}>
              <Input
                label="Date"
                icon={<CalendarIcon color={colors.textMuted} size={20} />}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Reason / Note"
                icon={<FileText color={colors.textMuted} size={20} />}
                value={note}
                onChangeText={setNote}
                placeholder="What exactly did you spend on?"
              />
            </Card>
          </View>

          <View style={styles.footer}>
            <Button 
              title={id ? "Update Transaction" : "Save Transaction"} 
              onPress={handleSave} 
              isLoading={loading}
              style={styles.saveButton} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h3,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  amountDisplay: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  amountLabel: {
    ...theme.typography.small,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontWeight: '600',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountInput: {
    ...theme.typography.h1,
    fontSize: 52,
    marginLeft: 8,
    minWidth: 100,
  },
  formSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  label: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  methodScroll: {
    marginLeft: -theme.spacing.lg,
    paddingLeft: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  methodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 22,
    marginRight: theme.spacing.sm,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    ...theme.shadows.small,
  },
  pillText: {
    ...theme.typography.small,
    fontWeight: '600',
    marginLeft: 8,
  },
  spacer: {
    height: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    marginTop: 20,
  },
  saveButton: {
    height: 56,
  },
});
