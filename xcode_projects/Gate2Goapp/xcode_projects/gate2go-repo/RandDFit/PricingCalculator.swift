import Foundation

enum PricingCalculator {
    static func defaultBasePriceCents(style: GateStyle, material: Material, widthFeet: Double, heightFeet: Double) -> Int {
        // MVP heuristic: simple estimate to seed editable pricing inputs.
        let width = max(4, min(30, widthFeet))
        let height = max(3, min(12, heightFeet))

        let perFoot: Double = {
            switch material {
            case .wood: return 220_00
            case .steel: return 260_00
            case .chainLink: return 180_00
            case .aluminumBasic: return 240_00
            }
        }()

        let styleMultiplier: Double = {
            switch style {
            case .singleSwing: return 1.0
            case .doubleSwing: return 1.35
            case .rollGate: return 1.15
            case .cantileverSlide: return 1.55
            case .overheadTrack: return 1.6
            case .verticalPivot: return 1.75
            }
        }()

        // A tiny height influence so a 12' gate seeds higher than a 4' gate.
        let heightMultiplier = 1.0 + ((height - 4) * 0.06)
        let est = width * perFoot * styleMultiplier * heightMultiplier
        return Int(est.rounded())
    }

    static func totalPriceCents(base: Int, addons: [AddonLineItem], laborCents: Int, markupPercent: Double, taxPercent: Double) -> Int {
        let addonsCents = addons.reduce(0) { partial, item in
            let perUnit = item.contractorCost.amountCents > 0
                ? item.contractorCost.amountCents
                : (item.nationalAvgPlaceholder?.amountCents ?? 0)
            return partial + (perUnit * max(1, item.quantity))
        }
        let subtotal = max(0, base) + max(0, addonsCents) + max(0, laborCents)
        let withMarkup = Double(subtotal) * (1.0 + max(0, markupPercent) / 100.0)
        let withTax = withMarkup * (1.0 + max(0, taxPercent) / 100.0)
        return Int(withTax.rounded())
    }
}

