import { GateStyle, Material, AddonLineItem } from "@/types/gate2go";

const MATERIAL_PRICE_PER_FOOT: Record<Material, number> = {
  wood: 22000,
  steel: 26000,
  chain_link: 18000,
  aluminum_basic: 24000,
};

const STYLE_MULTIPLIER: Record<GateStyle, number> = {
  single_swing: 1.0,
  double_swing: 1.35,
  roll_gate: 1.15,
  cantilever_slide: 1.55,
  overhead_track: 1.6,
  vertical_pivot: 1.75,
};

export function calculateBasePrice(
  style: GateStyle,
  material: Material,
  widthFeet: number,
  heightFeet: number
): number {
  const width = Math.max(4, Math.min(30, widthFeet));
  const height = Math.max(3, Math.min(12, heightFeet));
  const perFoot = MATERIAL_PRICE_PER_FOOT[material];
  const styleMultiplier = STYLE_MULTIPLIER[style];
  const heightMultiplier = 1.0 + (height - 4) * 0.06;
  const estimate = width * perFoot * styleMultiplier * heightMultiplier;
  return Math.round(estimate);
}

export function calculateTotalPrice(
  basePriceCents: number,
  addons: AddonLineItem[],
  laborCents: number,
  markupPercent: number,
  taxPercent: number
): number {
  const addonsCents = addons.reduce((total, item) => {
    const perUnit =
      item.contractorCost.amountCents > 0
        ? item.contractorCost.amountCents
        : item.nationalAvgPlaceholder?.amountCents ?? 0;
    return total + perUnit * Math.max(1, item.quantity);
  }, 0);

  const subtotal = Math.max(0, basePriceCents) + Math.max(0, addonsCents) + Math.max(0, laborCents);
  const withMarkup = subtotal * (1.0 + Math.max(0, markupPercent) / 100.0);
  const withTax = withMarkup * (1.0 + Math.max(0, taxPercent) / 100.0);
  return Math.round(withTax);
}

export function formatMoney(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}
