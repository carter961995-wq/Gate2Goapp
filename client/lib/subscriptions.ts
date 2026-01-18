import Purchases, {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  LOG_LEVEL,
} from "react-native-purchases";
import { Platform } from "react-native";

const REVENUECAT_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "";
const REVENUECAT_API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "";

export const ENTITLEMENT_ID = "premium";

export const PRODUCT_IDS = {
  ESSENTIAL_MONTHLY: "gate2go_essential_monthly",
  ESSENTIAL_YEARLY: "gate2go_essential_yearly",
  PREMIUM_MONTHLY: "gate2go_premium_monthly",
  PREMIUM_YEARLY: "gate2go_premium_yearly",
};

export type SubscriptionTier = "free" | "essential" | "premium";

export interface SubscriptionStatus {
  isActive: boolean;
  tier: SubscriptionTier;
  expirationDate: string | null;
  willRenew: boolean;
}

let isInitialized = false;

export async function initializePurchases(): Promise<void> {
  if (isInitialized) return;

  const apiKey = Platform.OS === "ios" ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;

  if (!apiKey) {
    console.warn("RevenueCat API key not configured. Subscriptions will not work.");
    return;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    await Purchases.configure({ apiKey });
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

export function getSubscriptionStatus(customerInfo: CustomerInfo | null): SubscriptionStatus {
  if (!customerInfo) {
    return {
      isActive: false,
      tier: "free",
      expirationDate: null,
      willRenew: false,
    };
  }

  const premiumEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID];
  const essentialEntitlement = customerInfo.entitlements.active["essential"];

  if (premiumEntitlement) {
    return {
      isActive: true,
      tier: "premium",
      expirationDate: premiumEntitlement.expirationDate,
      willRenew: premiumEntitlement.willRenew,
    };
  }

  if (essentialEntitlement) {
    return {
      isActive: true,
      tier: "essential",
      expirationDate: essentialEntitlement.expirationDate,
      willRenew: essentialEntitlement.willRenew,
    };
  }

  return {
    isActive: false,
    tier: "free",
    expirationDate: null,
    willRenew: false,
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
  if (identifier.includes("weekly")) {
    return "per week";
  }
  return "";
}

export function addCustomerInfoUpdateListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => {};
}
