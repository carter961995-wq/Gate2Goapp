import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import {
  RecoveryCase,
  RecoverySettings,
  RecoveryStep,
} from "@/types/recovery";
import * as storage from "@/lib/recovery-storage";

interface RecoveryContextType {
  settings: RecoverySettings;
  cases: RecoveryCase[];
  steps: RecoveryStep[];
  isLoading: boolean;
  updateSettings: (updates: Partial<RecoverySettings>) => Promise<void>;
  addCase: (recoveryCase: RecoveryCase) => Promise<void>;
  updateCase: (recoveryCase: RecoveryCase) => Promise<void>;
  removeCase: (caseId: string) => Promise<void>;
  addSteps: (steps: RecoveryStep[]) => Promise<void>;
  updateStep: (step: RecoveryStep) => Promise<void>;
  getCaseSteps: (caseId: string) => RecoveryStep[];
  refreshData: () => Promise<void>;
}

const defaultSettings: RecoverySettings = {
  hasCompletedOnboarding: false,
  hasAcceptedTerms: false,
  region: "Global",
  preferredLanguage: "English",
  allowNotifications: true,
  membershipTier: "starter",
  hasActiveSubscription: false,
  dataRetentionDays: 30,
};

const RecoveryContext = createContext<RecoveryContextType | undefined>(
  undefined
);

export function RecoveryProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RecoverySettings>(defaultSettings);
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [steps, setSteps] = useState<RecoveryStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      await storage.seedDemoCase();
      const [loadedSettings, loadedCases, loadedSteps] = await Promise.all([
        storage.getSettings(),
        storage.getCases(),
        storage.getSteps(),
      ]);
      setSettings(loadedSettings);
      setCases(
        loadedCases.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
      );
      setSteps(loadedSteps);
    } catch (error) {
      console.error("Failed to load recovery data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateSettings = useCallback(
    async (updates: Partial<RecoverySettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await storage.saveSettings(updates);
    },
    [settings]
  );

  const addCase = useCallback(async (recoveryCase: RecoveryCase) => {
    await storage.saveCase(recoveryCase);
    setCases((prev) => [recoveryCase, ...prev]);
  }, []);

  const updateCase = useCallback(async (recoveryCase: RecoveryCase) => {
    await storage.saveCase(recoveryCase);
    setCases((prev) =>
      prev.map((c) => (c.id === recoveryCase.id ? recoveryCase : c))
    );
  }, []);

  const removeCase = useCallback(async (caseId: string) => {
    await storage.deleteCase(caseId);
    setCases((prev) => prev.filter((c) => c.id !== caseId));
    setSteps((prev) => prev.filter((s) => s.caseId !== caseId));
  }, []);

  const addSteps = useCallback(async (newSteps: RecoveryStep[]) => {
    await storage.saveSteps(newSteps);
    setSteps((prev) => [...prev, ...newSteps]);
  }, []);

  const updateStep = useCallback(async (step: RecoveryStep) => {
    await storage.updateStep(step);
    setSteps((prev) => prev.map((s) => (s.id === step.id ? step : s)));
  }, []);

  const getCaseSteps = useCallback(
    (caseId: string) => steps.filter((step) => step.caseId === caseId),
    [steps]
  );

  return (
    <RecoveryContext.Provider
      value={{
        settings,
        cases,
        steps,
        isLoading,
        updateSettings,
        addCase,
        updateCase,
        removeCase,
        addSteps,
        updateStep,
        getCaseSteps,
        refreshData,
      }}
    >
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const context = useContext(RecoveryContext);
  if (!context) {
    throw new Error("useRecovery must be used within RecoveryProvider");
  }
  return context;
}
