import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  RecoveryCase,
  RecoverySettings,
  RecoveryStep,
} from "@/types/recovery";
import { buildRecoveryPlan } from "@/lib/recovery-plan";

const STORAGE_KEYS = {
  SETTINGS: "@saferestore/settings",
  CASES: "@saferestore/cases",
  STEPS: "@saferestore/steps",
};

const DEFAULT_SETTINGS: RecoverySettings = {
  hasCompletedOnboarding: false,
  hasAcceptedTerms: false,
  region: "Global",
  preferredLanguage: "English",
  allowNotifications: true,
  membershipTier: "starter",
  hasActiveSubscription: false,
  dataRetentionDays: 30,
};

export async function getSettings(): Promise<RecoverySettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(
  settings: Partial<RecoverySettings>
): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export async function getCases(): Promise<RecoveryCase[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CASES);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveCase(recoveryCase: RecoveryCase): Promise<void> {
  try {
    const cases = await getCases();
    const existingIndex = cases.findIndex((c) => c.id === recoveryCase.id);
    if (existingIndex >= 0) {
      cases[existingIndex] = recoveryCase;
    } else {
      cases.push(recoveryCase);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  } catch (error) {
    console.error("Failed to save case:", error);
  }
}

export async function deleteCase(caseId: string): Promise<void> {
  try {
    const cases = await getCases();
    const filtered = cases.filter((c) => c.id !== caseId);
    await AsyncStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(filtered));
    const steps = await getSteps();
    const filteredSteps = steps.filter((s) => s.caseId !== caseId);
    await AsyncStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(filteredSteps));
  } catch (error) {
    console.error("Failed to delete case:", error);
  }
}

export async function getSteps(): Promise<RecoveryStep[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STEPS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function getStepsByCase(caseId: string): Promise<RecoveryStep[]> {
  const steps = await getSteps();
  return steps.filter((step) => step.caseId === caseId);
}

export async function saveSteps(steps: RecoveryStep[]): Promise<void> {
  try {
    const existing = await getSteps();
    const merged = [...existing, ...steps];
    await AsyncStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(merged));
  } catch (error) {
    console.error("Failed to save steps:", error);
  }
}

export async function updateStep(step: RecoveryStep): Promise<void> {
  try {
    const steps = await getSteps();
    const index = steps.findIndex((s) => s.id === step.id);
    if (index >= 0) {
      steps[index] = step;
      await AsyncStorage.setItem(STORAGE_KEYS.STEPS, JSON.stringify(steps));
    }
  } catch (error) {
    console.error("Failed to update step:", error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CASES,
      STORAGE_KEYS.STEPS,
    ]);
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}

export async function resetAllSettings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error("Failed to reset settings:", error);
  }
}

export async function seedDemoCase(): Promise<RecoveryCase | null> {
  const cases = await getCases();
  const existingDemo = cases.find((c) => c.title === "Demo Recovery Case");
  if (existingDemo) return existingDemo;

  const now = new Date().toISOString();
  const demoCase: RecoveryCase = {
    id: `case_demo_${Date.now()}`,
    title: "Demo Recovery Case",
    ownerName: "Jamie Rivera",
    ownerEmail: "jamie@example.com",
    deviceModel: "iPhone 13 Pro",
    iosVersion: "iOS 17.3",
    damageType: "screen",
    devicePowersOn: true,
    knowsPasscode: true,
    hasAppleIdAccess: true,
    hasBackup: true,
    lastBackupDate: "2026-01-20",
    consentConfirmed: true,
    status: "verification",
    priority: "standard",
    createdAt: now,
    updatedAt: now,
    notes: "Screen is unresponsive but device powers on.",
    aiSummary:
      "Device powers on with passcode available. Prioritize Quick Start transfer and verify latest iCloud backup.",
  };

  await saveCase(demoCase);
  const existingSteps = await getStepsByCase(demoCase.id);
  if (existingSteps.length === 0) {
    const planTemplates = buildRecoveryPlan(demoCase);
    const planSteps: RecoveryStep[] = planTemplates.map((step, index) => ({
      id: `step_${demoCase.id}_${index}`,
      caseId: demoCase.id,
      title: step.title,
      description: step.description,
      category: step.category,
      actionUrl: step.actionUrl,
      status: index === 0 ? "in_progress" : "todo",
    }));
    await saveSteps(planSteps);
  }
  return demoCase;
}
