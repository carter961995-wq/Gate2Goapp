export type GateStyle =
  | "cantilever_slide"
  | "single_swing"
  | "double_swing"
  | "roll_gate"
  | "overhead_track"
  | "vertical_pivot";

export type Material = "wood" | "steel" | "chain_link" | "aluminum_basic";

export type SubscriptionTier = "essential" | "premium";

export type AddonType = "keypad" | "drop_rod" | "latch" | "opener";

export type OpenerBrand = "liftmaster" | "ghost_control" | "doorking";

export type OpenerOperatorType = "slide" | "swing" | "dual_swing";

export interface Money {
  amountCents: number;
  currency: string;
}

export interface AddonLineItem {
  id: string;
  type: AddonType;
  title: string;
  brand?: OpenerBrand;
  operatorType?: OpenerOperatorType;
  quantity: number;
  contractorCost: Money;
  nationalAvgPlaceholder?: Money;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
  sitePhotoUri: string;
  createdAt: string;
  updatedAt: string;
}

export interface GateDesign {
  id: string;
  projectId: string;
  gateStyle: GateStyle;
  material: Material;
  widthFeet: number;
  heightFeet: number;
  params: Record<string, unknown>;
  addons: AddonLineItem[];
  basePriceCents: number;
  totalPriceCents: number;
  generatedImageUri?: string;
  thumbnailUri?: string;
  selectedByClient: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GateDesignDraft {
  gateStyle: GateStyle;
  material: Material;
  widthFeet: number;
  heightFeet: number;
  params: Record<string, unknown>;
  addons: AddonLineItem[];
  basePriceCents: number;
  totalPriceCents: number;
  laborCents: number;
  markupPercent: number;
  taxPercent: number;
  generatedImageUri?: string;
  thumbnailUri?: string;
}

export interface AppSettings {
  hasCompletedOnboarding: boolean;
  hasActiveSubscription: boolean;
  subscriptionTier: SubscriptionTier;
  defaultMarkupPercent: number;
  defaultLaborCents: number;
  defaultTaxPercent: number;
  brandingCompanyName: string;
  brandingPhone: string;
  brandingEmail: string;
}

export const GATE_STYLES: { value: GateStyle; label: string; icon: string; tier: SubscriptionTier }[] = [
  { value: "single_swing", label: "Single Swing", icon: "log-in", tier: "essential" },
  { value: "double_swing", label: "Double Swing", icon: "columns", tier: "essential" },
  { value: "roll_gate", label: "Roll Gate", icon: "arrow-right", tier: "essential" },
  { value: "cantilever_slide", label: "Cantilever Slide", icon: "maximize-2", tier: "premium" },
  { value: "overhead_track", label: "Overhead Track", icon: "arrow-up", tier: "premium" },
  { value: "vertical_pivot", label: "Vertical Pivot", icon: "rotate-cw", tier: "premium" },
];

export const MATERIALS: { value: Material; label: string; icon: string; tier: SubscriptionTier }[] = [
  { value: "wood", label: "Wood", icon: "box", tier: "essential" },
  { value: "steel", label: "Steel", icon: "shield", tier: "essential" },
  { value: "chain_link", label: "Chain Link", icon: "link", tier: "premium" },
  { value: "aluminum_basic", label: "Aluminum", icon: "layers", tier: "premium" },
];

export const ADDON_OPTIONS: { type: AddonType; label: string; defaultCostCents: number }[] = [
  { type: "keypad", label: "Keypad", defaultCostCents: 35000 },
  { type: "latch", label: "Latch", defaultCostCents: 15000 },
  { type: "drop_rod", label: "Drop Rod", defaultCostCents: 12000 },
  { type: "opener", label: "Gate Opener", defaultCostCents: 85000 },
];
