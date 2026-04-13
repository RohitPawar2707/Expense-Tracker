import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { Expense, PaymentMethod } from '../store/useExpenseStore';
import { formatCurrency } from '../utils/currency';
import { Wallet, Globe, Landmark, CreditCard, ChevronRight } from 'lucide-react-native';

interface ExpenseItemProps {
  expense: Expense;
}

const getPaymentMethodIcon = (method: PaymentMethod, color: string, size: number) => {
  switch (method) {
    case 'Cash': return <Wallet color={color} size={size} />;
    case 'Online': return <Globe color={color} size={size} />;
    case 'Debit Card': return <Landmark color={color} size={size} />;
    case 'Credit Card': return <CreditCard color={color} size={size} />;
    default: return <Wallet color={color} size={size} />;
  }
};

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const { colors } = useTheme();
  const router = useRouter();
  
  const formattedDate = format(new Date(expense.date), 'hh:mm a');

  const handlePress = () => {
    router.push({
      pathname: '/add',
      params: { id: expense.id }
    });
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.container, { backgroundColor: colors.surface }]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
        {getPaymentMethodIcon(expense.payment_method, colors.primary, 24)}
      </View>
      <View style={styles.detailsContainer}>
        <Text style={[styles.paymentMethod, { color: colors.text }]}>{expense.payment_method}</Text>
        <Text style={[styles.note, { color: colors.textMuted }]} numberOfLines={1}>
          {expense.note ? expense.note : 'Miscellaneous'}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amount, { color: colors.text }]}>-{formatCurrency(expense.amount)}</Text>
        <Text style={[styles.date, { color: colors.textMuted }]}>{formattedDate}</Text>
      </View>
      <View style={styles.chevron}>
        <ChevronRight size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    ...theme.shadows.small,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  detailsContainer: {
    flex: 1,
  },
  paymentMethod: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  note: {
    ...theme.typography.small,
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  amount: {
    ...theme.typography.body,
    fontWeight: '800',
    marginBottom: 4,
  },
  date: {
    ...theme.typography.small,
  },
  chevron: {
    opacity: 0.5,
  },
});
