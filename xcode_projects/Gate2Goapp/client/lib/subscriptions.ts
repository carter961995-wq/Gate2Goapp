import { Platform } from "react-native";

export const ENTITLEMENT_ID = "Gate2Go Pro";

export const PRODUCT_IDS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
  LIFETIME: "lifetime",
  SINGLE_DESIGN: "single_gate_design",
};

export type SubscriptionTier = "free" | "pro";

export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  expirationDate: string | null;
  willRenew: boolean;
  isLifetime: boolean;
}

const isDemoMode = Platform.OS === "web";

let isInitialized = false;

export async function initializePurchases(): Promise<void> {
  if (isInitialized) return;
  
  if (isDemoMode) {
    console.log("Running in demo mode - purchases will be simulated");
    isInitialized = true;
    return;
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const { LOG_LEVEL } = require("react-native-purchases");
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey: "demo_key" });
    isInitialized = true;
    console.log("RevenueCat initialized successfully");
  } catch (error) {
    console.log("RevenueCat not available, using demo mode");
    isInitialized = true;
  }
}

export async function getOfferings(): Promise<any> {
  if (isDemoMode) {
    return {
      identifier: "default",
      availablePackages: [
        { identifier: "monthly", product: { identifier: "monthly", priceString: "$9.99", price: 9.99 } },
        { identifier: "yearly", product: { identifier: "yearly", priceString: "$79.99", price: 79.99 } },
        { identifier: "lifetime", product: { identifier: "lifetime", priceString: "$199.99", price: 199.99 } },
      ],
    };
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error("Failed to get offerings:", error);
    return null;
  }
}

export async function purchasePackage(pkg: any): Promise<any> {
  if (isDemoMode) {
    return { entitlements: { active: { [ENTITLEMENT_ID]: { isActive: true } } } };
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("User cancelled purchase");
      return null;
    }
    console.error("Purchase failed:", error);
    throw error;
  }
}

export async function restorePurchases(): Promise<any> {
  if (isDemoMode) {
    return null;
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error("Failed to restore purchases:", error);
    throw error;
  }
}

export async function getCustomerInfo(): Promise<any> {
  if (isDemoMode) {
    return null;
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Failed to get customer info:", error);
    return null;
  }
}

export function checkEntitlement(customerInfo: any): boolean {
  if (!customerInfo) return false;
  return ENTITLEMENT_ID in (customerInfo.entitlements?.active || {});
}

export function getSubscriptionStatus(customerInfo: any): SubscriptionStatus {
  if (!customerInfo) {
    return {
      isActive: false,
      tier: "free",
      expirationDate: null,
      willRenew: false,
      isLifetime: false,
    };
  }

  const proEntitlement = customerInfo.entitlements?.active?.[ENTITLEMENT_ID];

  if (proEntitlement) {
    const isLifetime = proEntitlement.expirationDate === null;
    return {
      isActive: true,
      tier: "pro",
      expirationDate: proEntitlement.expirationDate,
      willRenew: proEntitlement.willRenew,
      isLifetime,
    };
  }

  return {
    isActive: false,
    tier: "free",
    expirationDate: null,
    willRenew: false,
    isLifetime: false,
  };
}

export function formatPrice(pkg: any): string {
  return pkg?.product?.priceString || "$0.00";
}

export function getPeriodLabel(pkg: any): string {
  const identifier = (pkg?.identifier || "").toLowerCase();
  if (identifier.includes("yearly") || identifier.includes("annual")) {
    return "per year";
  }
  if (identifier.includes("monthly")) {
    return "per month";
  }
  if (identifier.includes("lifetime")) {
    return "one-time";
  }
  if (identifier.includes("weekly")) {
    return "per week";
  }
  return "";
}

export async function presentPaywall(): Promise<{ purchased: boolean; customerInfo: any }> {
  if (isDemoMode) {
    return { purchased: true, customerInfo: { entitlements: { active: { [ENTITLEMENT_ID]: { isActive: true } } } } };
  }

  try {
    const RevenueCatUI = require("react-native-purchases-ui").default;
    const paywallResult = await RevenueCatUI.presentPaywall();
    
    if (paywallResult === "PURCHASED" || paywallResult === "RESTORED") {
      const customerInfo = await getCustomerInfo();
      return { purchased: true, customerInfo };
    }
    
    return { purchased: false, customerInfo: null };
  } catch (error) {
    console.error("Failed to present paywall:", error);
    return { purchased: false, customerInfo: null };
  }
}

export async function presentPaywallIfNeeded(): Promise<{ purchased: boolean; customerInfo: any }> {
  if (isDemoMode) {
    return { purchased: false, customerInfo: null };
  }

  try {
    const RevenueCatUI = require("react-native-purchases-ui").default;
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    
    if (paywallResult === "PURCHASED" || paywallResult === "RESTORED") {
      const customerInfo = await getCustomerInfo();
      return { purchased: true, customerInfo };
    }
    
    return { purchased: false, customerInfo: null };
  } catch (error) {
    console.error("Failed to present paywall:", error);
    return { purchased: false, customerInfo: null };
  }
}

export async function presentCustomerCenter(): Promise<void> {
  if (isDemoMode) {
    console.log("Customer center not available in demo mode");
    return;
  }

  try {
    const RevenueCatUI = require("react-native-purchases-ui").default;
    await RevenueCatUI.presentCustomerCenter();
  } catch (error) {
    console.error("Failed to present customer center:", error);
    throw error;
  }
}

export function addCustomerInfoUpdateListener(
  callback: (customerInfo: any) => void
): () => void {
  if (isDemoMode) {
    return () => {};
  }

  try {
    const Purchases = require("react-native-purchases").default;
    Purchases.addCustomerInfoUpdateListener(callback);
  } catch (error) {
    console.log("Customer info listener not available");
  }
  return () => {};
}

export async function logIn(userId: string): Promise<any> {
  if (isDemoMode) {
    return null;
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error("Failed to log in:", error);
    return null;
  }
}

export async function logOut(): Promise<any> {
  if (isDemoMode) {
    return null;
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error("Failed to log out:", error);
    return null;
  }
}

export async function purchaseSingleDesign(): Promise<{ success: boolean; customerInfo: any }> {
  if (isDemoMode) {
    return { success: true, customerInfo: null };
  }

  try {
    const Purchases = require("react-native-purchases").default;
    const offerings = await Purchases.getOfferings();
    const allPackages = offerings.current?.availablePackages || [];
    const singleDesignPackage = allPackages.find(
      (pkg: any) => pkg.product.identifier === PRODUCT_IDS.SINGLE_DESIGN
    );

    if (!singleDesignPackage) {
      console.error("Single design package not found");
      return { success: false, customerInfo: null };
    }

    const { customerInfo } = await Purchases.purchasePackage(singleDesignPackage);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("User cancelled purchase");
      return { success: false, customerInfo: null };
    }
    console.error("Single design purchase failed:", error);
    throw error;
  }
}

export const RevenueCatUI = isDemoMode ? null : (() => {
  try {
    return require("react-native-purchases-ui").default;
  } catch {
    return null;
  }
})();
