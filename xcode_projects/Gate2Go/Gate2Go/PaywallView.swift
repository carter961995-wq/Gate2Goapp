//
//  PaywallView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/18/26.
//

import SwiftUI

struct PaywallView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    @Environment(\.dismiss) private var dismiss
    @State private var showError = false
    @State private var errorMessage = ""
    
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
                // TODO: Integrate RevenueCat when ready
                settings.hasActiveSubscription = true
                settings.subscriptionTier = .premium
                dismiss()
            } label: {
                Text("Activate Pro (Demo)")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
            }
            .buttonStyle(.borderedProminent)
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
                // TODO: Integrate RevenueCat when ready
                settings.addDesignCredit()
                dismiss()
            } label: {
                Text("Add 1 Credit (Demo)")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
            }
            .buttonStyle(.bordered)
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
            // TODO: Integrate RevenueCat restore
            errorMessage = "RevenueCat not configured yet"
            showError = true
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
}

#Preview {
    PaywallView()
        .environmentObject(Gate2GoSettings())
}
