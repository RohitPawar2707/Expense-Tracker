import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { useExpenseStore } from '../../store/useExpenseStore';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { theme } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useThemeStore } from '../../store/useThemeStore';
import { supabase } from '../../services/supabase';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Papa from 'papaparse';
import { 
  LogOut, 
  Download, 
  IndianRupee, 
  Moon, 
  Sun, 
  Settings, 
  Database, 
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react-native';

export default function Profile() {
  const { user, signOut } = useAuthStore();
  const { expenses, monthlyBudget, setMonthlyBudget } = useExpenseStore();
  const { colors, isDark } = useTheme();
  const { setThemeMode } = useThemeStore();
  
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());
  const [savingBudget, setSavingBudget] = useState(false);

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  const handleSaveBudget = () => {
    const num = parseFloat(budgetInput);
    if (!isNaN(num)) {
      setSavingBudget(true);
      setMonthlyBudget(num);
      setTimeout(() => {
         setSavingBudget(false);
         Alert.alert('Success', 'Monthly budget updated successfully');
      }, 800);
    } else {
      Alert.alert('Error', 'Please enter a valid amount');
    }
  };

  const handleExportCSV = async () => {
    try {
      if (expenses.length === 0) {
        Alert.alert('No Data', 'You have no expenses to export.');
        return;
      }
      const dataToExport = expenses.map(e => ({
        Date: format(parseISO(e.date), 'yyyy-MM-dd HH:mm'),
        Amount: e.amount,
        'Payment Method': e.payment_method,
        Reason: e.note || '',
      }));
      const csv = Papa.unparse(dataToExport);
      const fileUri = `${FileSystem.documentDirectory}studybuddy_pro_expenses.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          signOut();
        }}
      ]
    );
  };
  
  const displayGreeting = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member';
  const userInitial = displayGreeting.charAt(0).toUpperCase();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{userInitial}</Text>
            <View style={[styles.badgeContainer, { backgroundColor: colors.success }]}>
              <ShieldCheck size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{displayGreeting}</Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings & Budget</Text>
          </View>
          
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.settingItem} onPress={toggleTheme} activeOpacity={0.7}>
              <View style={styles.settingLabelGroup}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary + '10' }]}>
                  {isDark ? <Sun size={18} color={colors.primary} /> : <Moon size={18} color={colors.primary} />}
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  Appearance Mode
                </Text>
              </View>
              <View style={styles.settingValueRow}>
                <Text style={[styles.settingValueText, { color: colors.textMuted }]}>{isDark ? 'Dark' : 'Light'}</Text>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.budgetSection}>
              <View style={styles.budgetHeaderRow}>
                <View style={styles.settingLabelGroup}>
                  <View style={[styles.iconCircle, { backgroundColor: colors.primary + '10' }]}>
                    <IndianRupee size={18} color={colors.primary} />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Monthly Budget</Text>
                </View>
                <Text style={[styles.currentBudgetText, { color: colors.primary }]}>{formatCurrency(monthlyBudget)}</Text>
              </View>
              
              <View style={styles.budgetInputContainer}>
                <Input
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="decimal-pad"
                  placeholder="Set limit"
                  style={[styles.budgetInput, { color: colors.text }]}
                  containerStyle={{ marginBottom: 0, flex: 1 }}
                />
                <Button 
                  title="Save" 
                  onPress={handleSaveBudget}
                  isLoading={savingBudget}
                  style={styles.updateButton}
                />
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database size={18} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Export</Text>
          </View>
          
          <Card style={[styles.card, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.settingItem} onPress={handleExportCSV} activeOpacity={0.7}>
              <View style={styles.settingLabelGroup}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primary + '10' }]}>
                  <Download size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Export Records</Text>
                  <Text style={[styles.settingSubLabel, { color: colors.textMuted }]}>Download as Excel/CSV</Text>
                </View>
              </View>
              <Zap size={18} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          </Card>
        </View>

        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '30' }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.danger} />
          <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out Securely</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textMuted }]}>STUDYBUDDY PRO • ULTRA PRO MAX</Text>
          <Text style={[styles.versionText, { color: colors.textMuted, marginTop: 4 }]}>Build v2.4.0 • 2026 Production</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: 'transparent', // Will be set by wrapper
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  name: {
    ...theme.typography.h2,
    fontWeight: '800',
    marginBottom: 4,
  },
  email: {
    ...theme.typography.body,
    opacity: 0.6,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginLeft: 10,
  },
  card: {
    padding: 0,
    borderRadius: 24,
    ...theme.shadows.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    marginRight: 8,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    opacity: 0.5,
  },
  budgetSection: {
    padding: 16,
    paddingTop: 20,
  },
  budgetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentBudgetText: {
    fontSize: 18,
    fontWeight: '800',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetInput: {
    height: 48,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 10,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.5,
  },
});
import { parseISO, format } from 'date-fns';
