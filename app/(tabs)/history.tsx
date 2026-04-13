import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useExpenseStore, Expense } from '../../store/useExpenseStore';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { ExpenseItem } from '../../components/ExpenseItem';
import { theme } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { isToday, isYesterday, parseISO, format, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Search, SlidersHorizontal, X } from 'lucide-react-native';

type FilterType = 'All' | 'Today' | 'Yesterday' | 'Specific';

export default function HistoryScreen() {
  const { expenses } = useExpenseStore();
  const { colors } = useTheme();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedDate, setSelectedDate] = useState<string>(''); // YYYY-MM-DD
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExpenses = useMemo(() => {
    let result = expenses;

    if (activeFilter === 'Today') {
      result = expenses.filter(e => isToday(parseISO(e.date)));
    } else if (activeFilter === 'Yesterday') {
      result = expenses.filter(e => isYesterday(parseISO(e.date)));
    } else if (activeFilter === 'Specific' && selectedDate) {
      result = expenses.filter(e => {
        try {
          return isSameDay(parseISO(e.date), parseISO(selectedDate));
        } catch {
          return false;
        }
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => 
        (e.note || '').toLowerCase().includes(q) ||
        (e.payment_method || '').toLowerCase().includes(q) ||
        e.amount.toString().includes(q) ||
        format(parseISO(e.date), 'MMM do yyyy').toLowerCase().includes(q)
      );
    }

    return result;
  }, [expenses, activeFilter, selectedDate, searchQuery]);

  const handleDateSelect = (dateStr: string) => {
    // Basic auto-correction or helper can be added here
    setSelectedDate(dateStr);
    if (dateStr.length >= 10) setActiveFilter('Specific');
  };

  const clearDateFilter = () => {
    setSelectedDate('');
    setActiveFilter('All');
  };

  const tabs: FilterType[] = ['All', 'Today', 'Yesterday'];

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
          <TouchableOpacity 
            onPress={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchQuery('');
            }}
            style={[styles.iconButton, { backgroundColor: colors.surfaceLight }]}
          >
            {isSearching ? <X size={20} color={colors.text} /> : <Search size={20} color={colors.text} />}
          </TouchableOpacity>
        </View>

        {isSearching && (
          <View style={[styles.searchBar, { backgroundColor: colors.surfaceLight }]}>
            <Search size={18} color={colors.primary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search note, date, or amount..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => {
                  setActiveFilter(tab);
                  setSelectedDate('');
                }}
                style={[
                  styles.tab,
                  activeFilter === tab && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
              >
                <Text style={[styles.tabText, { color: activeFilter === tab ? '#FFFFFF' : colors.textMuted }]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
            
            <View
              style={[
                styles.tab,
                styles.calendarTab,
                { backgroundColor: activeFilter === 'Specific' ? colors.primary : colors.surfaceLight }
              ]}
            >
              <CalendarIcon size={16} color={activeFilter === 'Specific' ? '#FFFFFF' : colors.textMuted} />
              <TextInput
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={selectedDate}
                onChangeText={handleDateSelect}
                style={[styles.dateInput, { color: activeFilter === 'Specific' ? '#FFFFFF' : colors.text }]}
                keyboardType="numeric"
                maxLength={10}
              />
              {selectedDate ? (
                <TouchableOpacity onPress={clearDateFilter} style={styles.clearDateBtn}>
                  <X size={14} color={activeFilter === 'Specific' ? '#FFFFFF' : colors.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((item) => (
            <ExpenseItem key={item.id} expense={item} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: colors.surfaceLight }]}>
              <Search size={40} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Results Found</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {searchQuery 
                ? `We couldn't find anything matching "${searchQuery}"`
                : "No transactions recorded for this period."}
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    fontWeight: '800',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.lg,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: 10,
  },
  tabsScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
    marginRight: 8,
    backgroundColor: 'transparent',
  },
  calendarTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  dateInput: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    padding: 0,
    minWidth: 70,
  },
  clearDateBtn: {
    padding: 4,
    marginLeft: 4,
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    ...theme.typography.body,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 20,
  },
});
