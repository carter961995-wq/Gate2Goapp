//
//  ProjectWorkspaceView.swift
//  Gate2Go
//

import SwiftUI
import SwiftData

struct ProjectWorkspaceView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var settings: Gate2GoSettings

    let projectId: String

    @Query private var projects: [ProjectModel]
    @Query private var designs: [GateDesignModel]

    @State private var draft = GateDesignDraft()
    @State private var isGenerating: Bool = false
    @State private var lastSavedDesignId: String?

    init(projectId: String) {
        self.projectId = projectId
        _projects = Query(filter: #Predicate<ProjectModel> { $0.id == projectId })
        _designs = Query(filter: #Predicate<GateDesignModel> { $0.projectId == projectId }, sort: \GateDesignModel.updatedAt, order: .reverse)
    }

    var project: ProjectModel? { projects.first }

    var body: some View {
        Group {
            if let project {
                TabView {
                    DesignTabView(
                        project: project,
                        draft: $draft,
                        isGenerating: $isGenerating,
                        onGenerate: { generatePhotoreal(project: project) },
                        onSaveVersion: { saveVersion(project: project) }
                    )
                    .tabItem { Label("Design", systemImage: "square.on.square") }

                    OptionsPriceTabView(
                        draft: $draft,
                        tier: settings.subscriptionTier
                    )
                    .tabItem { Label("Options + Price", systemImage: "dollarsign.circle") }
                }
                .navigationTitle(project.name)
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        NavigationLink(destination: DesignGalleryView(projectId: project.id)) {
                            Label("Gallery", systemImage: "square.grid.2x2")
                        }
                    }
                }
                .onAppear {
                    if draft.isFresh {
                        draft.applyDefaults(from: settings)
                        draft.basePriceCents = PricingCalculator.defaultBasePriceCents(
                            style: draft.gateStyle,
                            material: draft.material,
                            widthFeet: draft.widthFeet,
                            heightFeet: draft.heightFeet
                        )
                        draft.recomputeTotals()
                    }
                }
                .onChange(of: draft.gateStyle) { _, _ in draft.reseedBasePriceIfAuto() }
                .onChange(of: draft.material) { _, _ in draft.reseedBasePriceIfAuto() }
                .onChange(of: draft.widthFeet) { _, _ in draft.reseedBasePriceIfAuto() }
                .onChange(of: draft.heightFeet) { _, _ in draft.reseedBasePriceIfAuto() }
            } else {
                ContentUnavailableView("Project not found", systemImage: "questionmark.folder")
            }
        }
    }

    private func saveVersion(project: ProjectModel) {
        let now = Date()
        let design = GateDesignModel(
            projectId: project.id,
            gateStyle: draft.gateStyle,
            material: draft.material,
            widthFeet: draft.widthFeet,
            heightFeet: draft.heightFeet,
            params: draft.params,
            addons: draft.addons,
            basePriceCents: draft.basePriceCents,
            totalPriceCents: draft.totalPriceCents,
            generatedImagePath: draft.generatedImagePath,
            thumbnailPath: draft.thumbnailPath,
            selectedByClient: false,
            createdAt: now,
            updatedAt: now
        )
        modelContext.insert(design)
        project.updatedAt = now
        lastSavedDesignId = design.id
    }

    private func generatePhotoreal(project: ProjectModel) {
        guard !isGenerating else { return }
        isGenerating = true

        Task {
            defer { Task { @MainActor in isGenerating = false } }
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            await MainActor.run {
                draft.generatedImagePath = project.sitePhotoPath
                draft.thumbnailPath = project.sitePhotoPath
            }
        }
    }
}

struct GateDesignDraft: Hashable {
    var gateStyle: GateStyle = .singleSwing
    var material: Material = .steel
    var widthFeet: Double = 12
    var heightFeet: Double = 6

    var picketOrientation: GatePicketOrientation = .vertical
    var finialStyle: GateFinialStyle = .none
    var archStyle: GateArchStyle = .flat

    var params: [String: JSONValue] = [:]
    var addons: [AddonLineItem] = []

    var basePriceCents: Int = 0
    var totalPriceCents: Int = 0

    var laborCents: Int = 0
    var markupPercent: Double = 30
    var taxPercent: Double = 0

    var generatedImagePath: String?
    var thumbnailPath: String?

    var isFresh: Bool = true
    var isBasePriceAutoSeeded: Bool = true

    mutating func applyDefaults(from settings: Gate2GoSettings) {
        laborCents = settings.defaultLaborCents
        markupPercent = settings.defaultMarkupPercent
        taxPercent = settings.defaultTaxPercent
        isFresh = false
    }

    mutating func recomputeTotals() {
        totalPriceCents = PricingCalculator.totalPriceCents(
            base: basePriceCents,
            addons: addons,
            laborCents: laborCents,
            markupPercent: markupPercent,
            taxPercent: taxPercent
        )
    }

    mutating func reseedBasePriceIfAuto() {
        guard isBasePriceAutoSeeded else { return }
        basePriceCents = PricingCalculator.defaultBasePriceCents(
            style: gateStyle,
            material: material,
            widthFeet: widthFeet,
            heightFeet: heightFeet
        )
        recomputeTotals()
    }
}

private struct DesignTabView: View {
    let project: ProjectModel
    @Binding var draft: GateDesignDraft
    @Binding var isGenerating: Bool
    let onGenerate: () -> Void
    let onSaveVersion: () -> Void

    @EnvironmentObject private var settings: Gate2GoSettings

    private let columns = [GridItem(.adaptive(minimum: 160), spacing: 12)]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                LivePreviewCard(
                    widthFeet: draft.widthFeet,
                    heightFeet: draft.heightFeet,
                    style: draft.gateStyle,
                    material: draft.material,
                    picketOrientation: draft.picketOrientation,
                    finialStyle: draft.finialStyle,
                    archStyle: draft.archStyle
                )

                Group {
                    Text("Gate Style")
                        .font(.headline)
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(GateStyle.allCases) { style in
                            let locked = style.isPremium && settings.isPremiumLocked(.premium)
                            StyleCard(
                                style: style,
                                isSelected: draft.gateStyle == style,
                                isLocked: locked
                            ) {
                                guard !locked else { return }
                                draft.gateStyle = style
                            }
                        }
                    }
                }

                Group {
                    Text("Material")
                        .font(.headline)
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(Material.allCases) { material in
                            VisualCard(
                                title: material.displayName,
                                subtitle: nil,
                                systemImage: material.cardIcon,
                                isSelected: draft.material == material,
                                isLocked: false
                            ) {
                                draft.material = material
                            }
                        }
                    }
                }

                Group {
                    Text("Size")
                        .font(.headline)
                    HStack(spacing: 12) {
                        LabeledContent("Width (ft)") {
                            Stepper(value: $draft.widthFeet, in: 4...30, step: 1) {
                                Text("\(Int(draft.widthFeet))")
                                    .monospacedDigit()
                            }
                        }
                    }
                    HStack(spacing: 12) {
                        LabeledContent("Height (ft)") {
                            Stepper(value: $draft.heightFeet, in: 3...12, step: 1) {
                                Text("\(Int(draft.heightFeet))")
                                    .monospacedDigit()
                            }
                        }
                    }
                }
                .padding(14)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                Group {
                    Text("Customization")
                        .font(.headline)
                    
                    VStack(spacing: 12) {
                        HStack {
                            Text("Pickets")
                            Spacer()
                            Picker("Pickets", selection: $draft.picketOrientation) {
                                ForEach(GatePicketOrientation.allCases) { orientation in
                                    Text(orientation.displayName).tag(orientation)
                                }
                            }
                            .pickerStyle(.segmented)
                            .frame(width: 180)
                        }
                        
                        HStack {
                            Text("Top Style")
                            Spacer()
                            Picker("Arch", selection: $draft.archStyle) {
                                ForEach(GateArchStyle.allCases) { style in
                                    Text(style.displayName).tag(style)
                                }
                            }
                            .pickerStyle(.menu)
                        }
                        
                        if draft.material == .steel {
                            HStack {
                                Text("Finials")
                                Spacer()
                                Picker("Finials", selection: $draft.finialStyle) {
                                    ForEach(GateFinialStyle.allCases) { style in
                                        Text(style.displayName).tag(style)
                                    }
                                }
                                .pickerStyle(.menu)
                            }
                        }
                    }
                }
                .padding(14)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))

                VStack(spacing: 10) {
                    Button {
                        onGenerate()
                    } label: {
                        HStack {
                            if isGenerating {
                                ProgressView().padding(.trailing, 6)
                            }
                            Text("Photoreal Generate")
                                .font(.headline)
                            Spacer()
                            Image(systemName: "sparkles")
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(isGenerating)

                    Button {
                        onSaveVersion()
                    } label: {
                        HStack {
                            Text("Save Version")
                                .font(.headline)
                            Spacer()
                            Image(systemName: "square.and.arrow.down")
                        }
                    }
                    .buttonStyle(.bordered)
                }
            }
            .padding()
        }
        .onChange(of: draft.basePriceCents) { _, _ in
            draft.isBasePriceAutoSeeded = false
            draft.recomputeTotals()
        }
        .onChange(of: draft.addons) { _, _ in
            draft.recomputeTotals()
        }
    }
}

private struct OptionsPriceTabView: View {
    @Binding var draft: GateDesignDraft
    let tier: SubscriptionTier

    var body: some View {
        Form {
            Section("Add-ons") {
                Text("Add-ons coming soon: keypad, latch, drop rod, and openers.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }

            Section("Pricing") {
                HStack {
                    Text("Base price")
                    Spacer()
                    TextField("0", value: $draft.basePriceCents, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.numberPad)
                        .monospacedDigit()
                }
                HStack {
                    Text("Labor")
                    Spacer()
                    TextField("0", value: $draft.laborCents, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.numberPad)
                        .monospacedDigit()
                }
                HStack {
                    Text("Markup %")
                    Spacer()
                    TextField("30", value: $draft.markupPercent, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.decimalPad)
                        .monospacedDigit()
                }
                HStack {
                    Text("Tax %")
                    Spacer()
                    TextField("0", value: $draft.taxPercent, format: .number)
                        .multilineTextAlignment(.trailing)
                        .keyboardType(.decimalPad)
                        .monospacedDigit()
                }
            }
            .onChange(of: draft.laborCents) { _, _ in draft.recomputeTotals() }
            .onChange(of: draft.markupPercent) { _, _ in draft.recomputeTotals() }
            .onChange(of: draft.taxPercent) { _, _ in draft.recomputeTotals() }

            Section("Total") {
                Text(MoneyFormatting.dollarsString(cents: draft.totalPriceCents))
                    .font(.title3.bold())
                    .monospacedDigit()
            }

            Section {
                Button("Export Proposal (coming soon)") {}
            }
        }
    }
}

private struct LivePreviewCard: View {
    let widthFeet: Double
    let heightFeet: Double
    let style: GateStyle
    let material: Material
    var picketOrientation: GatePicketOrientation = .vertical
    var finialStyle: GateFinialStyle = .none
    var archStyle: GateArchStyle = .flat

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Live Preview")
                .font(.headline)
            
            GateDesignerView(
                widthFeet: widthFeet,
                heightFeet: heightFeet,
                material: material,
                gateStyle: style,
                picketOrientation: picketOrientation,
                finialStyle: finialStyle,
                archStyle: archStyle
            )
            
            HStack(spacing: 8) {
                Text(style.displayName)
                Text("•")
                Text(material.displayName)
                Text("•")
                Text("\(Int(widthFeet))' × \(Int(heightFeet))'")
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(.secondary)
        }
    }
}

private struct StyleCard: View {
    let style: GateStyle
    let isSelected: Bool
    let isLocked: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 0) {
                Image(style.imageName)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 100)
                    .clipped()
                
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(style.displayName)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.primary)
                        if style.isPremium {
                            Text("Premium")
                                .font(.caption2)
                                .foregroundStyle(.orange)
                        }
                    }
                    Spacer()
                    if isLocked {
                        Image(systemName: "lock.fill")
                            .foregroundStyle(.secondary)
                    } else if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.blue)
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
            }
            .background(isSelected ? Color.accentColor.opacity(0.1) : Color(uiColor: .systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
            .opacity(isLocked ? 0.6 : 1.0)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    NavigationStack {
        ProjectWorkspaceView(projectId: "p1")
            .environmentObject(Gate2GoSettings())
    }
    .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
