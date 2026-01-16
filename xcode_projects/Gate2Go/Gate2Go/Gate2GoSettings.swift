//
//  Gate2GoSettings.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import Foundation

class Gate2GoSettings: ObservableObject {
    @Published var subscriptionTier: SubscriptionTier = .essential
    @Published var defaultLaborCents: Int = 50000
    @Published var defaultMarkupPercent: Double = 30
    @Published var defaultTaxPercent: Double = 0
    @Published var companyName: String = ""
    @Published var companyLogoPath: String?
    
    func isPremiumLocked(_ required: SubscriptionTier) -> Bool {
        if subscriptionTier == .premium { return false }
        return required == .premium
    }
}
