import SwiftUI

struct PaywallView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    @State private var selectedTier: SubscriptionTier = .premium
    @State private var billing: Billing = .monthly

    enum Billing: String, CaseIterable, Identifiable {
        case monthly
        case yearly
        var id: String { rawValue }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Gate2Go")
                        .font(.largeTitle.bold())
                    Text("Start your 7‑day free trial. Choose Essential or Premium.")
                        .foregroundStyle(.secondary)
                }

                HStack(spacing: 12) {
                    VisualCard(
                        title: "Essential",
                        subtitle: "Core gate styles + Wood/Steel",
                        systemImage: "checkmark.seal",
                        isSelected: selectedTier == .essential
                    ) { selectedTier = .essential }

                    VisualCard(
                        title: "Premium",
                        subtitle: "Advanced styles/materials + openers",
                        systemImage: "sparkles",
                        isSelected: selectedTier == .premium
                    ) { selectedTier = .premium }
                }

                Picker("Billing", selection: $billing) {
                    ForEach(Billing.allCases) { b in
                        Text(b == .monthly ? "Monthly" : "Yearly").tag(b)
                    }
                }
                .pickerStyle(.segmented)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Includes")
                        .font(.headline)
                    VStack(alignment: .leading, spacing: 6) {
                        Label("Visual-card selection for every option", systemImage: "rectangle.grid.2x2")
                        Label("Live Preview + Photoreal Generate", systemImage: "photo.on.rectangle.angled")
                        Label("Projects + variants + export", systemImage: "doc.on.doc")
                    }
                    .foregroundStyle(.secondary)
                    .labelStyle(.titleAndIcon)
                }
                .padding(14)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                Button {
                    settings.subscriptionTier = selectedTier
                    settings.hasActiveSubscription = true
                } label: {
                    VStack(spacing: 2) {
                        Text("Start Free Trial")
                            .font(.headline)
                        Text(billing == .monthly ? "Then billed monthly (cancel anytime)" : "Then billed yearly (save vs monthly)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)

                Button("Restore Purchases") {
                    // MVP placeholder. StoreKit restore will set `hasActiveSubscription` and `subscriptionTier`.
                    settings.hasActiveSubscription = true
                }
                .frame(maxWidth: .infinity)
                .buttonStyle(.bordered)

                Text("Note: Billing + trial are store-managed in the full implementation. This MVP uses a local toggle so the rest of the app can be exercised end‑to‑end.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .padding(.top, 6)
            }
            .padding()
        }
        .navigationBarBackButtonHidden(true)
    }
}

#Preview {
    NavigationStack {
        PaywallView()
            .environmentObject(Gate2GoSettings())
    }
}

