import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import { UserType, CHECKLIST_ITEMS } from '@/constants/data';

const STORAGE_KEY = 'cumplimiento_repse_data';

export interface DiagnosticResult {
  score: number;
  maxScore: number;
  criticalIssues: string[];
  warnings: string[];
  compliant: string[];
  userType: UserType;
  completedAt: string;
  answers: Record<string, string>;
}

export interface ChecklistState {
  [itemId: string]: {
    completed: boolean;
    completedAt?: string;
    notes?: string;
  };
}

export interface AppData {
  userType: UserType | null;
  diagnosticResult: DiagnosticResult | null;
  checklistState: ChecklistState;
  lastUpdated: string;
  hasSeenIntro: boolean;
}

const defaultAppData: AppData = {
  userType: null,
  diagnosticResult: null,
  checklistState: {},
  lastUpdated: new Date().toISOString(),
  hasSeenIntro: false,
};

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<AppData>(defaultAppData);

  const dataQuery = useQuery({
    queryKey: ['appData'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AppData;
          return parsed;
        }
        return defaultAppData;
      } catch (error) {
        console.log('Error loading data from AsyncStorage:', error);
        return defaultAppData;
      }
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (dataQuery.data) {
      setLocalData(dataQuery.data);
    }
  }, [dataQuery.data]);

  const { mutate: saveData } = useMutation({
    mutationFn: async (newData: AppData) => {
      const dataToSave = { ...newData, lastUpdated: new Date().toISOString() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      return dataToSave;
    },
    onSuccess: (savedData) => {
      setLocalData(savedData);
      queryClient.setQueryData(['appData'], savedData);
    },
  });

  const setUserType = useCallback((type: UserType) => {
    const newData = { ...localData, userType: type };
    saveData(newData);
  }, [localData, saveData]);

  const saveDiagnosticResult = useCallback((result: DiagnosticResult) => {
    const newData = { ...localData, diagnosticResult: result, userType: result.userType };
    saveData(newData);
  }, [localData, saveData]);

  const toggleChecklistItem = useCallback((itemId: string) => {
    const currentState = localData.checklistState[itemId];
    const newChecklistState = {
      ...localData.checklistState,
      [itemId]: {
        completed: !currentState?.completed,
        completedAt: !currentState?.completed ? new Date().toISOString() : undefined,
        notes: currentState?.notes,
      },
    };
    const newData = { ...localData, checklistState: newChecklistState };
    saveData(newData);
  }, [localData, saveData]);

  const updateChecklistNotes = useCallback((itemId: string, notes: string) => {
    const currentState = localData.checklistState[itemId] || { completed: false };
    const newChecklistState = {
      ...localData.checklistState,
      [itemId]: { ...currentState, notes },
    };
    const newData = { ...localData, checklistState: newChecklistState };
    saveData(newData);
  }, [localData, saveData]);

  const clearAllData = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setLocalData(defaultAppData);
    queryClient.setQueryData(['appData'], defaultAppData);
  }, [queryClient]);

  const getChecklistProgress = useCallback(() => {
    const userType = localData.userType || 'general';
    const relevantItems = CHECKLIST_ITEMS.filter(
      item => item.forUserTypes.includes(userType) || item.forUserTypes.includes('general' as UserType)
    );
    const completedCount = relevantItems.filter(
      item => localData.checklistState[item.id]?.completed
    ).length;
    return {
      completed: completedCount,
      total: relevantItems.length,
      percentage: relevantItems.length > 0 ? Math.round((completedCount / relevantItems.length) * 100) : 0,
    };
  }, [localData.userType, localData.checklistState]);

  const exportData = useCallback(() => {
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: localData,
    }, null, 2);
  }, [localData]);

  const completeIntro = useCallback(() => {
    setLocalData(prev => {
      const newData = { ...prev, hasSeenIntro: true };
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  return {
    data: localData,
    isLoading: dataQuery.isLoading,
    setUserType,
    saveDiagnosticResult,
    toggleChecklistItem,
    updateChecklistNotes,
    clearAllData,
    getChecklistProgress,
    exportData,
    completeIntro,
  };
});
