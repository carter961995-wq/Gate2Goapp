//
//  SettingsView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    
    var body: some View {
        Form {
            Section("Subscription") {
                Picker("Tier", selection: $settings.subscriptionTier) {
                    Text("Essential").tag(SubscriptionTier.essential)
                    Text("Premium").tag(SubscriptionTier.premium)
                }
                .pickerStyle(.segmented)
            }
            
            Section("Default Pricing") {
                HStack {
                    Text("Default Labor")
                    Spacer()
                    TextField("0", value: $settings.defaultLaborCents, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.numberPad)
                        .frame(width: 100)
                }
                HStack {
                    Text("Default Markup %")
                    Spacer()
                    TextField("30", value: $settings.defaultMarkupPercent, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.decimalPad)
                        .frame(width: 100)
                }
                HStack {
                    Text("Default Tax %")
                    Spacer()
                    TextField("0", value: $settings.defaultTaxPercent, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.decimalPad)
                        .frame(width: 100)
                }
            }
            
            Section("Company") {
                TextField("Company Name", text: $settings.companyName)
            }
            
            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text("1.0.0")
                        .foregroundStyle(.secondary)
                }
            }
        }
        .navigationTitle("Settings")
    }
}

#Preview {
    NavigationStack {
        SettingsView()
            .environmentObject(Gate2GoSettings())
    }
}
