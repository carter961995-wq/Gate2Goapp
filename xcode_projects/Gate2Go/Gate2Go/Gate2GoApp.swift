//
//  Gate2GoApp.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import SwiftData
import RevenueCat

@main
struct Gate2GoApp: App {
    @StateObject private var settings = Gate2GoSettings()

    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            ProjectModel.self,
            GateDesignModel.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()
    
    init() {
        configureRevenueCat()
    }
    
    private func configureRevenueCat() {
        Purchases.logLevel = .debug
        Purchases.configure(withAPIKey: "appl_YOUR_REVENUECAT_API_KEY")
        
        Purchases.shared.getCustomerInfo { customerInfo, error in
            if let customerInfo = customerInfo {
                DispatchQueue.main.async {
                    if customerInfo.entitlements["Gate2Go Pro"]?.isActive == true {
                        self.settings.hasActiveSubscription = true
                        self.settings.subscriptionTier = .premium
                    }
                }
            }
        }
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(settings)
        }
        .modelContainer(sharedModelContainer)
    }
}
