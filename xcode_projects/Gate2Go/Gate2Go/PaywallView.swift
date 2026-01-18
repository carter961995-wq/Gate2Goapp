//
//  PaywallView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/18/26.
//

import SwiftUI
import RevenueCat
import RevenueCatUI

struct PaywallView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    @State private var isLoadingPaywall = false
    @State private var isLoadingSinglePurchase = false
    @State private var showError = false
    @State private var errorMessage = ""
    
    private let singleDesignProductId = "single_gate_design"
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Text("Choose Your Option")
                    .font(.largeTitle.bold())
                    .padding(.top, 24)
                
                Text("Design professional gates and create proposals for your clients.")
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                
                proSubscriptionCard
                
                divider
                
                singleDesignCard
                
                restoreButton
            }
            .padding()
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }
    
    private var proSubscriptionCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 12) {
                Image(systemName: "star.fill")
                    .font(.title2)
                    .foregroundStyle(.blue)
                    .frame(width: 48, height: 48)
                    .background(Color.blue.opacity(0.15))
                    .clipShape(Circle())
                
                VStack(alignment: .leading, spacing: 2) {
                    Text("Gate2Go Pro")
                        .font(.headline)
                    Text("For contractors and professionals")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                featureRow("All gate styles and materials")
                featureRow("Visual designer with live preview")
                featureRow("Unlimited projects and proposals")
                featureRow("Priority support")
            }
            
            Button {
                presentRevenueCatPaywall()
            } label: {
                if isLoadingPaywall {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                } else {
                    Text("View Pro Plans")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoadingPaywall)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.blue, lineWidth: 2)
        )
    }
    
    private var singleDesignCard: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 12) {
                Image(systemName: "house.fill")
                    .font(.title2)
                    .foregroundStyle(.green)
                    .frame(width: 48, height: 48)
                    .background(Color.green.opacity(0.15))
                    .clipShape(Circle())
                
                VStack(alignment: .leading, spacing: 2) {
                    HStack {
                        Text("Single Design")
                            .font(.headline)
                        Spacer()
                        Text("$2.99")
                            .font(.headline)
                            .foregroundStyle(.green)
                    }
                    Text("Perfect for homeowners")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                featureRow("Create 1 complete gate design")
                featureRow("Generate professional PDF proposal")
                featureRow("Share with your client")
            }
            
            Button {
                purchaseSingleDesign()
            } label: {
                if isLoadingSinglePurchase {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                } else {
                    Text("Buy Single Design - $2.99")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                }
            }
            .buttonStyle(.bordered)
            .disabled(isLoadingSinglePurchase)
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
    
    private var divider: some View {
        HStack {
            Rectangle()
                .fill(Color(.systemGray4))
                .frame(height: 1)
            Text("or")
                .font(.caption)
                .foregroundStyle(.secondary)
            Rectangle()
                .fill(Color(.systemGray4))
                .frame(height: 1)
        }
    }
    
    private var restoreButton: some View {
        Button("Restore Purchases") {
            restorePurchases()
        }
        .foregroundStyle(.blue)
        .padding(.top)
    }
    
    private func featureRow(_ text: String) -> some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark")
                .font(.caption)
                .foregroundStyle(.green)
                .frame(width: 20, height: 20)
                .background(Color.green.opacity(0.15))
                .clipShape(Circle())
            Text(text)
                .font(.subheadline)
        }
    }
    
    private func presentRevenueCatPaywall() {
        isLoadingPaywall = true
        
        Task {
            do {
                let offerings = try await Purchases.shared.offerings()
                
                await MainActor.run {
                    isLoadingPaywall = false
                    
                    if let _ = offerings.current {
                        // Present RevenueCat paywall
                        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                           let rootVC = windowScene.windows.first?.rootViewController {
                            let paywallVC = PaywallViewController()
                            paywallVC.delegate = PaywallDelegateHandler.shared
                            PaywallDelegateHandler.shared.settings = settings
                            rootVC.present(paywallVC, animated: true)
                        }
                    } else {
                        errorMessage = "No subscription options available"
                        showError = true
                    }
                }
            } catch {
                await MainActor.run {
                    isLoadingPaywall = false
                    errorMessage = error.localizedDescription
                    showError = true
                }
            }
        }
    }
    
    private func purchaseSingleDesign() {
        isLoadingSinglePurchase = true
        
        Task {
            do {
                let products = try await Purchases.shared.products([singleDesignProductId])
                
                guard let product = products.first else {
                    await MainActor.run {
                        isLoadingSinglePurchase = false
                        errorMessage = "Product not found"
                        showError = true
                    }
                    return
                }
                
                let (_, customerInfo, _) = try await Purchases.shared.purchase(product: product)
                
                await MainActor.run {
                    isLoadingSinglePurchase = false
                    settings.addDesignCredit()
                }
            } catch {
                await MainActor.run {
                    isLoadingSinglePurchase = false
                    if (error as NSError).code != 1 { // Not user cancelled
                        errorMessage = error.localizedDescription
                        showError = true
                    }
                }
            }
        }
    }
    
    private func restorePurchases() {
        Task {
            do {
                let customerInfo = try await Purchases.shared.restorePurchases()
                
                await MainActor.run {
                    if customerInfo.entitlements["Gate2Go Pro"]?.isActive == true {
                        settings.hasActiveSubscription = true
                        settings.subscriptionTier = .premium
                    }
                }
            } catch {
                await MainActor.run {
                    errorMessage = "Unable to restore purchases"
                    showError = true
                }
            }
        }
    }
}

class PaywallDelegateHandler: NSObject, PaywallViewControllerDelegate {
    static let shared = PaywallDelegateHandler()
    var settings: Gate2GoSettings?
    
    func paywallViewController(_ controller: PaywallViewController,
                                didFinishPurchasingWith customerInfo: CustomerInfo) {
        if customerInfo.entitlements["Gate2Go Pro"]?.isActive == true {
            settings?.hasActiveSubscription = true
            settings?.subscriptionTier = .premium
        }
        controller.dismiss(animated: true)
    }
}

#Preview {
    PaywallView()
        .environmentObject(Gate2GoSettings())
}
