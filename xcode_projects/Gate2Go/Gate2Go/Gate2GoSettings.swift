//
//  Gate2GoSettings.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import Foundation
import SwiftUI

class Gate2GoSettings: ObservableObject {
    @AppStorage("hasCompletedOnboarding") var hasCompletedOnboarding: Bool = false
    @AppStorage("hasActiveSubscription") var hasActiveSubscription: Bool = false
    @AppStorage("designCredits") var designCredits: Int = 0
    
    @Published var subscriptionTier: SubscriptionTier = .essential
    @Published var defaultLaborCents: Int = 50000
    @Published var defaultMarkupPercent: Double = 30
    @Published var defaultTaxPercent: Double = 0
    
    @AppStorage("companyName") var companyName: String = ""
    @AppStorage("companyPhone") var companyPhone: String = ""
    @AppStorage("companyEmail") var companyEmail: String = ""
    @Published var companyLogoData: Data?
    
    var companyLogo: UIImage? {
        get {
            guard let data = companyLogoData else { return nil }
            return UIImage(data: data)
        }
        set {
            companyLogoData = newValue?.jpegData(compressionQuality: 0.8)
        }
    }
    
    func isPremiumLocked(_ required: SubscriptionTier) -> Bool {
        if subscriptionTier == .premium { return false }
        return required == .premium
    }
    
    func hasAccessToDesign() -> Bool {
        return hasActiveSubscription || designCredits > 0
    }
    
    func useDesignCredit() {
        if designCredits > 0 {
            designCredits -= 1
        }
    }
    
    func addDesignCredit() {
        designCredits += 1
    }
    
    func resetAll() {
        hasCompletedOnboarding = false
        hasActiveSubscription = false
        designCredits = 0
        subscriptionTier = .essential
        companyName = ""
        companyPhone = ""
        companyEmail = ""
        companyLogoData = nil
    }
}
