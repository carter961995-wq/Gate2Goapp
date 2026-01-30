import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  AppSettings,
  Project,
  GateDesign,
  SubscriptionTier,
} from "@/types/gate2go";
import * as storage from "@/lib/storage";
import * as subscriptions from "@/lib/subscriptions";

interface AppContextType {
  settings: AppSettings;
  projects: Project[];
  designs: GateDesign[];
  isLoading: boolean;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  removeProject: (projectId: string) => Promise<void>;
  addDesign: (design: GateDesign) => Promise<void>;
  updateDesign: (design: GateDesign) => Promise<void>;
  removeDesign: (designId: string) => Promise<void>;
  getProjectDesigns: (projectId: string) => GateDesign[];
  isPremiumLocked: (requiredTier: SubscriptionTier) => boolean;
  refreshData: () => Promise<void>;
  offerings: any;
  customerInfo: any;
  purchasePackage: (pkg: any) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  subscriptionStatus: subscriptions.SubscriptionStatus;
  refreshSubscriptionStatus: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  hasCompletedAuth: false,
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
  appleUserId: "",
  appleEmail: "",
  appleFullName: "",
  designCredits: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [projects, setProjects] = useState<Project[]>([]);
  const [designs, setDesigns] = useState<GateDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState<any>(null);

  const subscriptionStatus = subscriptions.getSubscriptionStatus(customerInfo);

  const refreshData = useCallback(async () => {
    try {
      await storage.seedDemoProject();
      const [loadedSettings, loadedProjects, loadedDesigns] = await Promise.all([
        storage.getSettings(),
        storage.getProjects(),
        storage.getDesigns(),
      ]);
      setSettings(loadedSettings);
      setProjects(loadedProjects.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
      setDesigns(loadedDesigns.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initSubscriptions = useCallback(async () => {
    try {
      await subscriptions.initializePurchases();
      const [loadedOfferings, loadedCustomerInfo] = await Promise.all([
        subscriptions.getOfferings(),
        subscriptions.getCustomerInfo(),
      ]);
      setOfferings(loadedOfferings);
      setCustomerInfo(loadedCustomerInfo);

      subscriptions.addCustomerInfoUpdateListener((info) => {
        setCustomerInfo(info);
      });
    } catch (error) {
      console.error("Failed to initialize subscriptions:", error);
    }
  }, []);

  useEffect(() => {
    refreshData();
    initSubscriptions();
  }, [refreshData, initSubscriptions]);

  const purchasePackage = useCallback(async (pkg: any): Promise<boolean> => {
    try {
      const info = await subscriptions.purchasePackage(pkg);
      if (info) {
        setCustomerInfo(info);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Purchase failed:", error);
      return false;
    }
  }, []);

  const restorePurchasesHandler = useCallback(async (): Promise<boolean> => {
    try {
      const info = await subscriptions.restorePurchases();
      if (info) {
        setCustomerInfo(info);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Restore failed:", error);
      return false;
    }
  }, []);

  const refreshSubscriptionStatus = useCallback(async () => {
    try {
      const info = await subscriptions.getCustomerInfo();
      setCustomerInfo(info);
    } catch (error) {
      console.error("Failed to refresh subscription status:", error);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await storage.saveSettings(updates);
  }, [settings]);

  const addProject = useCallback(async (project: Project) => {
    await storage.saveProject(project);
    setProjects((prev) => [project, ...prev]);
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    await storage.saveProject(project);
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? project : p))
    );
  }, []);

  const removeProject = useCallback(async (projectId: string) => {
    await storage.deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setDesigns((prev) => prev.filter((d) => d.projectId !== projectId));
  }, []);

  const addDesign = useCallback(async (design: GateDesign) => {
    await storage.saveDesign(design);
    setDesigns((prev) => [design, ...prev]);
  }, []);

  const updateDesign = useCallback(async (design: GateDesign) => {
    await storage.saveDesign(design);
    setDesigns((prev) =>
      prev.map((d) => (d.id === design.id ? design : d))
    );
  }, []);

  const removeDesign = useCallback(async (designId: string) => {
    await storage.deleteDesign(designId);
    setDesigns((prev) => prev.filter((d) => d.id !== designId));
  }, []);

  const getProjectDesigns = useCallback(
    (projectId: string) => designs.filter((d) => d.projectId === projectId),
    [designs]
  );

  const isPremiumLocked = useCallback(
    (requiredTier: SubscriptionTier) =>
      storage.isPremiumLocked(
        settings.subscriptionTier,
        requiredTier,
        settings.hasActiveSubscription
      ),
    [settings.subscriptionTier, settings.hasActiveSubscription]
  );

  return (
    <AppContext.Provider
      value={{
        settings,
        projects,
        designs,
        isLoading,
        updateSettings,
        addProject,
        updateProject,
        removeProject,
        addDesign,
        updateDesign,
        removeDesign,
        getProjectDesigns,
        isPremiumLocked,
        refreshData,
        offerings,
        customerInfo,
        purchasePackage,
        restorePurchases: restorePurchasesHandler,
        subscriptionStatus,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
