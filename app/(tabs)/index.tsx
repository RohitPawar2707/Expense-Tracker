import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useExpenseStore } from '../../store/useExpenseStore';
import { useAuthStore } from '../../store/useAuthStore';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Card } from '../../components/Card';
import { ExpenseItem } from '../../components/ExpenseItem';
import { theme } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/currency';
import { isToday, isThisMonth, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import { ArrowRight, TrendingUp, Calendar } from 'lucide-react-native';

export default function Dashboard() {
  const { expenses, monthlyBudget, fetchExpenses, fetchBudget } = useExpenseStore();
  const { user } = useAuthStore();
  const { colors } = useTheme();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setRefreshing(true);
    await Promise.all([fetchExpenses(), fetchBudget()]);
    setRefreshing(false);
  };

  const { todayTotal, monthTotal, recentExpenses } = useMemo(() => {
    let today = 0, month = 0;
    
    expenses.forEach(e => {
      const date = parseISO(e.date);
      const amount = Number(e.amount);
      if (isToday(date)) today += amount;
      if (isThisMonth(date)) month += amount;
    });

    // Just take the top 3 for the home screen
    const recent = expenses.slice(0, 3);

    return { todayTotal: today, monthTotal: month, recentExpenses: recent };
  }, [expenses]);

  const remainingBudget = monthlyBudget - monthTotal;
  const budgetPercentage = monthlyBudget > 0 ? (monthTotal / monthlyBudget) * 100 : 0;
  const displayGreeting = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <ScreenWrapper>
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello, {displayGreeting}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>Master your finances today</Text>
        </View>

        <View style={styles.summarySection}>
          <Card style={[styles.mainCard, { backgroundColor: colors.primary }]}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}>
                <TrendingUp size={20} color={colors.primary} />
              </View>
              <Text style={styles.cardLabel}>Monthly Overview</Text>
            </View>
            
            <Text style={styles.mainAmount}>{formatCurrency(monthTotal)}</Text>
            
            {monthlyBudget > 0 && (
              <View style={styles.budgetProgress}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.progressLabel}>Budget Progress</Text>
                  <Text style={styles.progressValue}>{Math.round(budgetPercentage)}%</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${Math.min(budgetPercentage, 100)}%`, 
                        backgroundColor: budgetPercentage > 90 ? '#FB7185' : '#34D399' 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.remainingText}>
                  {remainingBudget >= 0 
                    ? `${formatCurrency(remainingBudget)} left to spend` 
                    : `Overspent by ${formatCurrency(Math.abs(remainingBudget))}`}
                </Text>
              </View>
            )}
          </Card>

          <View style={styles.todayCardWrapper}>
            <Card style={[styles.todayCard, { backgroundColor: colors.surface }]}>
              <View style={styles.todayHeader}>
                <Calendar size={18} color={colors.primary} />
                <Text style={[styles.todayLabel, { color: colors.textMuted }]}>Today's Spending</Text>
              </View>
              <Text style={[styles.todayAmount, { color: colors.text }]}>{formatCurrency(todayTotal)}</Text>
            </Card>
          </View>
        </View>

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <TouchableOpacity 
              style={styles.viewAllButton} 
              onPress={() => router.push('/history')}
            >
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {recentExpenses.length > 0 ? (
            recentExpenses.map((item) => (
              <ExpenseItem key={item.id} expense={item} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No recent activity</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: theme.spacing.xl * 2,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60, // Lowered greeting
    paddingBottom: theme.spacing.md,
  },
  greeting: {
    ...theme.typography.h1,
    fontSize: 28,
  },
  subtitle: {
    ...theme.typography.body,
    opacity: 0.6,
  },
  summarySection: {
    paddingHorizontal: theme.spacing.lg,
  },
  mainCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  mainAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    marginBottom: theme.spacing.lg,
  },
  budgetProgress: {
    marginTop: theme.spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
  },
  progressValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  remainingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  todayCardWrapper: {
    marginTop: theme.spacing.md,
  },
  todayCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  todayAmount: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 24,
  },
  historySection: {
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    fontWeight: '700',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...theme.typography.body,
  },
});
