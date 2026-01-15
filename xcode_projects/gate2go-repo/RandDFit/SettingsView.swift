import SwiftUI
import SwiftData

struct SettingsView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    @Environment(\.modelContext) private var modelContext
    @Query private var projects: [ProjectModel]
    @Query private var designs: [GateDesignModel]

    var body: some View {
        Form {
            Section("Subscription") {
                LabeledContent("Status") {
                    Text(settings.hasActiveSubscription ? "Active" : "Inactive")
                        .foregroundStyle(settings.hasActiveSubscription ? .green : .secondary)
                }
                LabeledContent("Tier") {
                    Text(settings.subscriptionTier == .premium ? "Premium" : "Essential")
                }

                Button("Restore Purchases") {
                    // MVP placeholder.
                    settings.hasActiveSubscription = true
                }

                if settings.hasActiveSubscription {
                    Button("End Subscription (MVP)") {
                        settings.hasActiveSubscription = false
                        settings.subscriptionTier = .essential
                    }
                    .foregroundStyle(.red)
                }
            }

            Section("Defaults") {
                LabeledContent("Markup %") {
                    TextField("30", value: $settings.defaultMarkupPercent, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.decimalPad)
                }
                LabeledContent("Labor (cents)") {
                    TextField("0", value: $settings.defaultLaborCents, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.numberPad)
                }
                LabeledContent("Tax %") {
                    TextField("0", value: $settings.defaultTaxPercent, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.decimalPad)
                }
            }

            Section("Branding (Proposal)") {
                TextField("Company name", text: $settings.brandingCompanyName)
                TextField("Phone", text: $settings.brandingPhone)
                TextField("Email", text: $settings.brandingEmail)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
            }

            Section("Data") {
                Button("Export Data (coming next)") {}
                Button("Delete All Data") {
                    for d in designs { modelContext.delete(d) }
                    for p in projects { modelContext.delete(p) }
                }
                .foregroundStyle(.red)
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        SettingsView()
            .environmentObject(Gate2GoSettings())
    }
    .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}

