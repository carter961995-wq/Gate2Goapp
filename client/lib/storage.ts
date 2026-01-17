import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Project,
  GateDesign,
  AppSettings,
  SubscriptionTier,
} from "@/types/gate2go";

const STORAGE_KEYS = {
  PROJECTS: "@gate2go/projects",
  DESIGNS: "@gate2go/designs",
  SETTINGS: "@gate2go/settings",
};

const DEFAULT_SETTINGS: AppSettings = {
  hasCompletedOnboarding: false,
  hasActiveSubscription: false,
  subscriptionTier: "essential",
  defaultMarkupPercent: 30,
  defaultLaborCents: 0,
  defaultTaxPercent: 0,
  brandingCompanyName: "",
  brandingPhone: "",
  brandingEmail: "",
  brandingLogoUri: "",
};

export async function getSettings(): Promise<AppSettings> {
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

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export async function getProjects(): Promise<Project[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function saveProject(project: Project): Promise<void> {
  try {
    const projects = await getProjects();
    const existingIndex = projects.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = project;
    } else {
      projects.push(project);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (error) {
    console.error("Failed to save project:", error);
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const projects = await getProjects();
    const filtered = projects.filter((p) => p.id !== projectId);
    await AsyncStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
    const designs = await getDesigns();
    const filteredDesigns = designs.filter((d) => d.projectId !== projectId);
    await AsyncStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(filteredDesigns));
  } catch (error) {
    console.error("Failed to delete project:", error);
  }
}

export async function getDesigns(): Promise<GateDesign[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DESIGNS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export async function getDesignsByProject(projectId: string): Promise<GateDesign[]> {
  const designs = await getDesigns();
  return designs.filter((d) => d.projectId === projectId);
}

export async function saveDesign(design: GateDesign): Promise<void> {
  try {
    const designs = await getDesigns();
    const existingIndex = designs.findIndex((d) => d.id === design.id);
    if (existingIndex >= 0) {
      designs[existingIndex] = design;
    } else {
      designs.push(design);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(designs));
  } catch (error) {
    console.error("Failed to save design:", error);
  }
}

export async function deleteDesign(designId: string): Promise<void> {
  try {
    const designs = await getDesigns();
    const filtered = designs.filter((d) => d.id !== designId);
    await AsyncStorage.setItem(STORAGE_KEYS.DESIGNS, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete design:", error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PROJECTS,
      STORAGE_KEYS.DESIGNS,
    ]);
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}

export function isPremiumLocked(
  tier: SubscriptionTier,
  requiredTier: SubscriptionTier,
  hasSubscription: boolean
): boolean {
  if (requiredTier === "essential") return false;
  return !(hasSubscription && tier === "premium");
}

export async function seedDemoProject(): Promise<Project | null> {
  const projects = await getProjects();
  const existingDemo = projects.find((p) => p.name === "Demo Gate Project");
  if (existingDemo) return existingDemo;
  
  const now = new Date().toISOString();
  const demoProject: Project = {
    id: `project_demo_${Date.now()}`,
    name: "Demo Gate Project",
    clientName: "Demo Client",
    sitePhotoUri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    createdAt: now,
    updatedAt: now,
  };
  
  await saveProject(demoProject);
  return demoProject;
}
