import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useExpenseStore, PaymentMethod } from '../../store/useExpenseStore';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Card } from '../../components/Card';
import { theme } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { formatCurrency } from '../../utils/currency';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { format, subDays, parseISO, isSameDay } from 'date-fns';
import { ChartPie, TrendingUp, Wallet, Landmark } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

const METHOD_COLORS: Record<PaymentMethod, string> = {
  'Cash': '#10B981', // Emerald
  'Online': '#3B82F6', // Blue
  'Debit Card': '#8B5CF6', // Violet
  'Credit Card': '#F43F5E', // Rose
};

export default function Reports() {
  const { expenses } = useExpenseStore();
  const { colors } = useTheme();

  const { pieData, barData, totalSum, topMethod } = useMemo(() => {
    // Pie Data (Payment Method wise)
    const methodTotals: Record<string, number> = {};
    let sum = 0;

    expenses.forEach(e => {
      const amount = Number(e.amount);
      if (!methodTotals[e.payment_method]) methodTotals[e.payment_method] = 0;
      methodTotals[e.payment_method] += amount;
      sum += amount;
    });

    const pie = Object.keys(methodTotals).map(method => ({
      value: methodTotals[method],
      color: METHOD_COLORS[method as PaymentMethod] || colors.primary,
      text: `${((methodTotals[method] / (sum || 1)) * 100).toFixed(0)}%`,
    }));

    // Find Top Method
    const entries = Object.entries(methodTotals);
    const top = entries.length > 0 
      ? entries.reduce((a, b) => a[1] > b[1] ? a : b) 
      : null;

    // Bar Data (Last 7 days trend)
    const bar = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayExpenses = expenses.filter(e => isSameDay(parseISO(e.date), date));
      const dayTotal = dayExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
      
      bar.push({
        value: dayTotal,
        label: format(date, 'EE').charAt(0), // M, T, W...
        frontColor: colors.primary,
      });
    }

    return { pieData: pie, barData: bar, totalSum: sum, topMethod: top };
  }, [expenses, colors.primary]);

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Financial Analysis</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
              <TrendingUp size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Spent</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCurrency(totalSum)}</Text>
          </Card>
          
          <Card style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBox, { backgroundColor: colors.success + '15' }]}>
              <Wallet size={20} color={colors.success} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Top Method</Text>
            <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>
              {topMethod ? topMethod[0] : 'N/A'}
            </Text>
          </Card>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <ChartPie size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Distribution</Text>
          </View>
          
          {pieData.length > 0 ? (
            <View style={styles.chartContainer}>
              <PieChart
                data={pieData}
                donut
                radius={80}
                innerRadius={55}
                innerCircleColor={colors.surface}
                centerLabelComponent={() => (
                  <View style={styles.centerLabel}>
                    <Text style={[styles.centerText, { color: colors.textMuted }]}>Methods</Text>
                  </View>
                )}
              />
              <View style={styles.legendContainer}>
                {Object.keys(METHOD_COLORS).map(method => {
                  const hasData = expenses.some(e => e.payment_method === method);
                  if (!hasData) return null;
                  return (
                    <View key={method} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: METHOD_COLORS[method as PaymentMethod] }]} />
                      <Text style={[styles.legendText, { color: colors.text }]}>{method}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No data available</Text>
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Weekly Trend</Text>
          </View>
          <View style={styles.barChartContainer}>
            <BarChart
              data={barData}
              barWidth={22}
              noOfSections={3}
              barBorderRadius={4}
              frontColor={colors.primary}
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
              height={150}
              width={screenWidth - 100}
            />
          </View>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 20,
    marginBottom: 10,
  },
  title: {
    ...theme.typography.h2,
    fontWeight: '800',
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    marginBottom: theme.spacing.lg,
    padding: 20,
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    ...theme.typography.h3,
    fontWeight: '700',
    marginLeft: 8,
  },
  chartContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  centerLabel: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  legendContainer: {
    marginLeft: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  barChartContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  emptyContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    opacity: 0.6,
  },
});
