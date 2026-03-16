//
//  PricingCalculator.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import Foundation

struct PricingCalculator {
    static func defaultBasePriceCents(style: GateStyle, material: Material, widthFeet: Double, heightFeet: Double, regionMultiplier: Double = 1.0) -> Int {
        let basePerSqFt: Double
        switch material {
        case .wood: basePerSqFt = 45
        case .steel: basePerSqFt = 65
        case .chainLink: basePerSqFt = 35
        case .aluminum: basePerSqFt = 55
        }
        
        let styleMultiplier: Double
        switch style {
        case .singleSwing: styleMultiplier = 1.0
        case .doubleSwing: styleMultiplier = 1.8
        case .rollGate: styleMultiplier = 1.3
        case .cantileverSlide: styleMultiplier = 1.6
        case .overheadTrack: styleMultiplier = 1.5
        case .verticalPivot: styleMultiplier = 1.7
        }
        
        let sqFt = widthFeet * heightFeet
        let dollars = sqFt * basePerSqFt * styleMultiplier * regionMultiplier
        return Int(dollars * 100)
    }
    
    static func totalPriceCents(base: Int, addons: [AddonLineItem], laborCents: Int, markupPercent: Double, taxPercent: Double) -> Int {
        let addonsCents = addons.reduce(0) { $0 + ($1.contractorCost.amountCents * $1.quantity) }
        let subtotal = Double(base + addonsCents + laborCents)
        let afterMarkup = subtotal * (1 + markupPercent / 100)
        let afterTax = afterMarkup * (1 + taxPercent / 100)
        return Int(afterTax)
    }
}
