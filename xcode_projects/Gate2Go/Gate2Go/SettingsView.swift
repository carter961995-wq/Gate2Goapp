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
    @EnvironmentObject private var authManager: AuthManager
    @Binding var selectedTab: MainTab
    @State private var showingImagePicker = false
    @State private var selectedItem: PhotosPickerItem?
    @State private var showResetConfirmation = false
    @State private var showDeleteAccountConfirmation = false
    
    var body: some View {
        Form {
            subscriptionSection

            accountSection
            
            companyBrandingSection
            
            defaultPricingSection
            
            aboutSection
            
            resetSection
        }
        .navigationTitle("Settings")
        .navigationBarBackButtonHidden(true)
        .alert("Reset App", isPresented: $showResetConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Reset", role: .destructive) {
                settings.resetAll()
            }
        } message: {
            Text("This will clear all data including projects, designs, and settings. You'll see the onboarding screens again.")
        }
        .alert("Delete Account", isPresented: $showDeleteAccountConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                Task { await authManager.deleteAccount() }
            }
        } message: {
            Text("This will permanently delete your account. Local projects will remain on this device.")
        }
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    selectedTab = .projects
                } label: {
                    Label("Back", systemImage: "chevron.left")
                }
            }
            ToolbarItemGroup(placement: .keyboard) {
                Spacer()
                Button("Done") {
                    dismissKeyboard()
                }
            }
        }
    }
    
    private var subscriptionSection: some View {
        Section {
            HStack {
                Image(systemName: "checkmark.seal.fill")
                    .foregroundStyle(.green)
                Text("All Features Enabled")
                    .font(.headline)
            }
            Text("Subscriptions are not required to use Gate2Go.")
                .font(.caption)
                .foregroundStyle(.secondary)
        } header: {
            Text("Access")
        }
    }

    private var accountSection: some View {
        Section {
            if authManager.isAuthenticated {
                if let email = authManager.userEmail {
                    Text(email)
                        .font(.subheadline)
                } else {
                    Text("Signed in")
                        .font(.subheadline)
                }

                Button("Sign Out") {
                    authManager.signOut()
                }

                Button("Delete Account", role: .destructive) {
                    showDeleteAccountConfirmation = true
                }
            } else if authManager.isGuest {
                Text("Using Gate2Go as Guest")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Button("Sign in or Create Account") {
                    authManager.beginSignIn()
                }
            } else {
                Button("Sign in or Create Account") {
                    authManager.beginSignIn()
                }
            }

            if let error = authManager.errorMessage {
                Text(error)
                    .font(.caption)
                    .foregroundStyle(.red)
            }
        } header: {
            Text("Account")
        } footer: {
            if authManager.isGuest {
                Text("Sign in to access your account on other devices.")
            }
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
                    .textInputAutocapitalization(.never)
            }
        } header: {
            Text("Company Branding")
        } footer: {
            Text("Your branding appears on PDF proposals sent to clients.")
        }
    }
    
    private var defaultPricingSection: some View {
        Section {
            Picker("Pricing Region", selection: Binding(
                get: { settings.pricingRegion },
                set: { settings.pricingRegion = $0 }
            )) {
                ForEach(PricingRegion.allCases) { region in
                    Text(region.displayName).tag(region)
                }
            }

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

    private func dismissKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

#Preview {
    NavigationStack {
        SettingsView(selectedTab: .constant(.settings))
            .environmentObject(Gate2GoSettings())
            .environmentObject(AuthManager())
    }
}
