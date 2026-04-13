import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { useAuthStore } from './useAuthStore';

export type PaymentMethod = 'Cash' | 'Online' | 'Debit Card' | 'Credit Card';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  payment_method: PaymentMethod;
  note: string | null;
  date: string;
  created_at: string;
}

export type SyncAction = 'INSERT' | 'UPDATE' | 'DELETE';

export interface SyncOperation {
  id: string; // unique ID for the queue item
  action: SyncAction;
  tableName: 'expenses';
  recordId: string;
  recordData: Partial<Expense> | null;
  timestamp: number;
}

interface ExpenseState {
  expenses: Expense[];
  syncQueue: SyncOperation[];
  monthlyBudget: number;
  
  // Actions
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'user_id'>) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'user_id'>>) => void;
  deleteExpense: (id: string) => void;
  setMonthlyBudget: (limit: number) => void;

  // Sync methods
  syncPending: () => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchBudget: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      syncQueue: [],
      monthlyBudget: 0,

      setExpenses: (expenses) => set({ expenses }),
      
      setMonthlyBudget: (limit) => {
        set({ monthlyBudget: limit });
        // Here we could also queue a sync for the budget, but for simplicity
        // let's sync it immediately if online, or handle via separate effect.
        const user = useAuthStore.getState().user;
        if (user) {
           supabase.from('budgets').upsert({ user_id: user.id, monthly_limit: limit }).then();
        }
      },

      addExpense: (expense) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        const newExpense: Expense = { ...expense, user_id: user.id, id: Date.now().toString() };
        
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          syncQueue: [
            ...state.syncQueue,
            {
              id: Date.now().toString(),
              action: 'INSERT',
              tableName: 'expenses',
              recordId: newExpense.id,
              recordData: newExpense,
              timestamp: Date.now(),
            }
          ]
        }));
        
        get().syncPending();
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...updates } : e)),
          syncQueue: [
            ...state.syncQueue,
            {
              id: Date.now().toString(),
              action: 'UPDATE',
              tableName: 'expenses',
              recordId: id,
              recordData: updates,
              timestamp: Date.now(),
            }
          ]
        }));
        
        get().syncPending();
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
          syncQueue: [
            ...state.syncQueue,
            {
              id: Date.now().toString(),
              action: 'DELETE',
              tableName: 'expenses',
              recordId: id,
              recordData: null,
              timestamp: Date.now(),
            }
          ]
        }));
        
        get().syncPending();
      },

      syncPending: async () => {
        const { syncQueue } = get();
        if (syncQueue.length === 0) return;

        // Note: In a real robust system, we would lock the queue and process items
        // one by one, handling failures gracefully. For this example, we process sequentially.
        
        let successCount = 0;
        
        for (const op of syncQueue) {
          try {
            if (op.action === 'INSERT' && op.recordData) {
              // Compatibility: Send both payment_method and category to satisfy old DB schemas
              const payload = { 
                ...op.recordData, 
                category: (op.recordData as any).payment_method || 'Cash' 
              };
              const { error } = await supabase.from(op.tableName).insert(payload as any);
              if (error) throw error;
            } else if (op.action === 'UPDATE' && op.recordData) {
              const payload = { 
                ...op.recordData, 
                category: (op.recordData as any).payment_method
              };
              const { error } = await supabase.from(op.tableName).update(payload as any).eq('id', op.recordId);
              if (error) throw error;
            } else if (op.action === 'DELETE') {
              const { error } = await supabase.from(op.tableName).delete().eq('id', op.recordId);
              if (error) throw error;
            }
            successCount++;
          } catch (e) {
            console.error('Sync failed for operation', op.id, e);
            break; // Stop syncing on first error, try again later
          }
        }

        if (successCount > 0) {
          set((state) => ({
            syncQueue: state.syncQueue.slice(successCount)
          }));
        }
      },

      fetchExpenses: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
            
          if (error) throw error;
          
          if (data) {
             const mappedExpenses = (data as any[]).map(e => ({
               ...e,
               // Compatibility: Map 'category' back to 'payment_method' if missing from server
               payment_method: e.payment_method || e.category || 'Cash'
             }));
             
             if (get().syncQueue.length === 0) {
               set({ expenses: mappedExpenses as Expense[] });
             }
          }
        } catch (e) {
          console.error("Error fetching expenses", e);
        }
      },

      fetchBudget: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        
        try {
          const { data, error } = await supabase
            .from('budgets')
            .select('monthly_limit')
            .eq('user_id', user.id)
            .single();
            
          if (!error && data) {
             set({ monthlyBudget: data.monthly_limit || 0 });
          }
        } catch (e) {
          console.error("Error fetching budget", e);
        }
      }
    }),
    {
      name: 'expense-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
