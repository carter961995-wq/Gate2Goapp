export type GateStyle =
  | "cantilever_slide"
  | "single_swing"
  | "double_swing"
  | "roll_gate"
  | "overhead_track"
  | "vertical_pivot";

export type Material = "wood" | "steel" | "chain_link" | "aluminum_basic";

export type SubscriptionTier = "essential" | "premium";

export type AddonType = "keypad" | "latch" | "opener" | "hinges" | "wheels" | "lock";

export type OpenerBrand = "liftmaster" | "ghost_control" | "doorking";

export type OpenerOperatorType = "slide" | "swing" | "dual_swing";

export type PicketOrientation = "vertical" | "horizontal";

export type FinialStyle = "none" | "spear" | "ball" | "fleur_de_lis" | "pineapple" | "gothic";

export type ArchStyle = "flat" | "convex" | "concave" | "double_arch";

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
  hasCompletedAuth: boolean;
  hasCompletedOnboarding: boolean;
  hasActiveSubscription: boolean;
  subscriptionTier: SubscriptionTier;
  defaultMarkupPercent: number;
  defaultLaborCents: number;
  defaultTaxPercent: number;
  brandingCompanyName: string;
  brandingPhone: string;
  brandingEmail: string;
  brandingLogoUri: string;
  appleUserId: string;
  appleEmail: string;
  appleFullName: string;
  designCredits: number;
}

import cantileverImage from "../../assets/images/gates/modern_cantilever_sliding_gate.png";
import doubleSwingImage from "../../assets/images/gates/ornate_double_swing_iron_gates.png";
import singleSwingImage from "../../assets/images/gates/rustic_wooden_swing_gate.png";
import rollGateImage from "../../assets/images/gates/industrial_steel_roll_gate.png";
import overheadTrackImage from "../../assets/images/gates/modern_aluminum_slat_gate.png";
import verticalPivotImage from "../../assets/images/gates/vertical_pivot_security_gate.png";

export const GATE_STYLE_IMAGES: Record<GateStyle, any> = {
  cantilever_slide: cantileverImage,
  double_swing: doubleSwingImage,
  single_swing: singleSwingImage,
  roll_gate: rollGateImage,
  overhead_track: overheadTrackImage,
  vertical_pivot: verticalPivotImage,
};

export const GATE_STYLES: { value: GateStyle; label: string; icon: string; tier: SubscriptionTier }[] = [
  { value: "single_swing", label: "Single Swing", icon: "log-in", tier: "essential" },
  { value: "double_swing", label: "Double Swing", icon: "columns", tier: "essential" },
  { value: "roll_gate", label: "Roll Gate", icon: "arrow-right", tier: "essential" },
  { value: "cantilever_slide", label: "Cantilever Slide", icon: "maximize-2", tier: "premium" },
  { value: "overhead_track", label: "Overhead Track", icon: "arrow-up", tier: "premium" },
  { value: "vertical_pivot", label: "Vertical Pivot", icon: "rotate-cw", tier: "premium" },
];

export const MATERIALS: { value: Material; label: string; icon: string }[] = [
  { value: "wood", label: "Wood", icon: "box" },
  { value: "steel", label: "Steel", icon: "shield" },
  { value: "chain_link", label: "Chain Link", icon: "link" },
  { value: "aluminum_basic", label: "Aluminum", icon: "layers" },
];

export const ADDON_OPTIONS: { type: AddonType; label: string; icon: string; defaultCostCents: number }[] = [
  { type: "keypad", label: "Keypad", icon: "hash", defaultCostCents: 35000 },
  { type: "latch", label: "Latch", icon: "lock", defaultCostCents: 15000 },
  { type: "opener", label: "Gate Opener", icon: "zap", defaultCostCents: 85000 },
  { type: "hinges", label: "Heavy Duty Hinges", icon: "link-2", defaultCostCents: 25000 },
  { type: "wheels", label: "Wheels", icon: "circle", defaultCostCents: 18000 },
  { type: "lock", label: "Security Lock", icon: "shield", defaultCostCents: 12000 },
];

export const PICKET_ORIENTATIONS: { value: PicketOrientation; label: string }[] = [
  { value: "vertical", label: "Vertical Pickets" },
  { value: "horizontal", label: "Horizontal Slats" },
];

export const FINIAL_STYLES: { value: FinialStyle; label: string }[] = [
  { value: "none", label: "None" },
  { value: "spear", label: "Spear" },
  { value: "ball", label: "Ball" },
  { value: "fleur_de_lis", label: "Fleur-de-lis" },
  { value: "pineapple", label: "Pineapple" },
  { value: "gothic", label: "Gothic" },
];

export const ARCH_STYLES: { value: ArchStyle; label: string; description: string }[] = [
  { value: "flat", label: "Flat Top", description: "Standard flat top edge" },
  { value: "convex", label: "Arched", description: "Classic curved arch" },
  { value: "concave", label: "Concave", description: "Inward curving dip" },
  { value: "double_arch", label: "Double Arch", description: "Two arches for double gates" },
];
