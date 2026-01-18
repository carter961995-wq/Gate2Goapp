import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";
import RevenueCatUI from "react-native-purchases-ui";
import { Platform } from "react-native";

const REVENUECAT_API_KEY = "test_QFkJlWYThrqwwutnCvNtxdmRFGp";

export const ENTITLEMENT_ID = "Gate2Go Pro";

export const PRODUCT_IDS = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
  LIFETIME: "lifetime",
};

export type SubscriptionTier = "free" | "pro";

export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  expirationDate: string | null;
  willRenew: boolean;
  isLifetime: boolean;
}

let isInitialized = false;

export async function initializePurchases(): Promise<void> {
  if (isInitialized) return;

  if (!REVENUECAT_API_KEY) {
    console.warn("RevenueCat API key not configured. Subscriptions will not work.");
    return;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    isInitialized = true;
    console.log("RevenueCat initialized successfully");
  } catch (error) {
    console.error("Failed to initialize RevenueCat:", error);
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error("Failed to get offerings:", error);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
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

export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error("Failed to restore purchases:", error);
    throw error;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error("Failed to get customer info:", error);
    return null;
  }
}

export function checkEntitlement(customerInfo: CustomerInfo | null): boolean {
  if (!customerInfo) return false;
  return ENTITLEMENT_ID in customerInfo.entitlements.active;
}

export function getSubscriptionStatus(customerInfo: CustomerInfo | null): SubscriptionStatus {
  if (!customerInfo) {
    return {
      isActive: false,
      tier: "free",
      expirationDate: null,
      willRenew: false,
      isLifetime: false,
    };
  }

  const proEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];

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

export function formatPrice(pkg: PurchasesPackage): string {
  return pkg.product.priceString;
}

export function getPeriodLabel(pkg: PurchasesPackage): string {
  const identifier = pkg.identifier.toLowerCase();
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

export async function presentPaywall(): Promise<{ purchased: boolean; customerInfo: CustomerInfo | null }> {
  try {
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

export async function presentPaywallIfNeeded(): Promise<{ purchased: boolean; customerInfo: CustomerInfo | null }> {
  try {
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
  try {
    await RevenueCatUI.presentCustomerCenter();
  } catch (error) {
    console.error("Failed to present customer center:", error);
    throw error;
  }
}

export function addCustomerInfoUpdateListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {};
}

export async function logIn(userId: string): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (error) {
    console.error("Failed to log in:", error);
    return null;
  }
}

export async function logOut(): Promise<CustomerInfo | null> {
  try {
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (error) {
    console.error("Failed to log out:", error);
    return null;
  }
}

export { RevenueCatUI };
