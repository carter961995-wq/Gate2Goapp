//
//  SettingsView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import PhotosUI

struct SettingsView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    @State private var showingImagePicker = false
    @State private var selectedItem: PhotosPickerItem?
    @State private var showResetConfirmation = false
    
    var body: some View {
        Form {
            subscriptionSection
            
            companyBrandingSection
            
            defaultPricingSection
            
            aboutSection
            
            resetSection
        }
        .navigationTitle("Settings")
        .alert("Reset App", isPresented: $showResetConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Reset", role: .destructive) {
                settings.resetAll()
            }
        } message: {
            Text("This will clear all data including projects, designs, and settings. You'll see the onboarding screens again.")
        }
    }
    
    private var subscriptionSection: some View {
        Section {
            if settings.hasActiveSubscription {
                HStack {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(.green)
                    Text("Gate2Go Pro Active")
                        .font(.headline)
                }
                
                Text("You have unlimited access to all features")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else if settings.designCredits > 0 {
                HStack {
                    Image(systemName: "ticket.fill")
                        .foregroundStyle(.blue)
                    Text("\(settings.designCredits) Design Credit\(settings.designCredits == 1 ? "" : "s")")
                        .font(.headline)
                }
                
                Text("Use credits to save gate designs")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                HStack {
                    Image(systemName: "lock.fill")
                        .foregroundStyle(.orange)
                    Text("No Active Subscription")
                }
                
                NavigationLink(destination: PaywallView()) {
                    Text("Upgrade to Pro")
                        .foregroundStyle(.blue)
                }
            }
            
            Picker("Tier", selection: $settings.subscriptionTier) {
                Text("Essential").tag(SubscriptionTier.essential)
                Text("Premium").tag(SubscriptionTier.premium)
            }
            .pickerStyle(.segmented)
        } header: {
            Text("Subscription")
        }
    }
    
    private var companyBrandingSection: some View {
        Section {
            HStack {
                if let logoData = settings.companyLogoData,
                   let uiImage = UIImage(data: logoData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                } else {
                    Image(systemName: "building.2.fill")
                        .font(.title)
                        .foregroundStyle(.secondary)
                        .frame(width: 60, height: 60)
                        .background(Color(.systemGray5))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                
                PhotosPicker(selection: $selectedItem, matching: .images) {
                    Text(settings.companyLogoData == nil ? "Add Logo" : "Change Logo")
                }
                .onChange(of: selectedItem) { _, newItem in
                    Task {
                        if let data = try? await newItem?.loadTransferable(type: Data.self) {
                            settings.companyLogoData = data
                        }
                    }
                }
                
                if settings.companyLogoData != nil {
                    Spacer()
                    Button("Remove", role: .destructive) {
                        settings.companyLogoData = nil
                        selectedItem = nil
                    }
                    .font(.caption)
                }
            }
            
            TextField("Company Name", text: $settings.companyName)
            
            HStack {
                Image(systemName: "phone.fill")
                    .foregroundStyle(.secondary)
                    .frame(width: 24)
                TextField("Phone Number", text: $settings.companyPhone)
                    .keyboardType(.phonePad)
            }
            
            HStack {
                Image(systemName: "envelope.fill")
                    .foregroundStyle(.secondary)
                    .frame(width: 24)
                TextField("Email Address", text: $settings.companyEmail)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
            }
        } header: {
            Text("Company Branding")
        } footer: {
            Text("Your branding appears on PDF proposals sent to clients.")
        }
    }
    
    private var defaultPricingSection: some View {
        Section {
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
        } header: {
            Text("Default Pricing")
        }
    }
    
    private var aboutSection: some View {
        Section {
            HStack {
                Text("Version")
                Spacer()
                Text("1.0.1")
                    .foregroundStyle(.secondary)
            }
        } header: {
            Text("About")
        }
    }
    
    private var resetSection: some View {
        Section {
            Button(role: .destructive) {
                showResetConfirmation = true
            } label: {
                HStack {
                    Spacer()
                    Text("Reset Entire App")
                    Spacer()
                }
            }
        } footer: {
            Text("Clears all projects, designs, and settings. Use this if you want to start fresh.")
        }
    }
}

#Preview {
    NavigationStack {
        SettingsView()
            .environmentObject(Gate2GoSettings())
    }
}
