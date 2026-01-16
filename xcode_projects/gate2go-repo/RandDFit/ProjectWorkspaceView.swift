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
                        NavigationLink(value: Route.gallery(project.id)) {
                            Label("Gallery", systemImage: "square.grid.2x2")
                        }
                    }
                }
                .onAppear {
                    // Seed defaults on first open (or when coming from New Project).
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

        // MVP: Generate a placeholder image and persist it as “generated”.
        Task {
            defer { Task { @MainActor in isGenerating = false } }
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            await MainActor.run {
                // Placeholder: we simply mark “generated” as the same photo for now.
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
                LivePreviewCard(photoPath: project.sitePhotoPath, style: draft.gateStyle, material: draft.material)

                Group {
                    Text("Gate Style")
                        .font(.headline)
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(GateStyle.allCases) { style in
                            let locked = style.isPremium && settings.isPremiumLocked(.premium)
                            GateStyleCard(
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
                Text("V1 add-ons are visual cards (keypad, latch, drop rod, and Premium openers).")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                NavigationLink("Open Add-ons (coming next)") {}
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
                Button("Export Proposal (coming next)") {}
            }
        }
    }
}

private struct LivePreviewCard: View {
    let photoPath: String?
    let style: GateStyle
    let material: Material

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Live Preview")
                .font(.headline)
            ZStack(alignment: .bottomLeading) {
                if let path = photoPath, let ui = FileStore.readUIImage(path: path) {
                    Image(uiImage: ui)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 220)
                        .clipped()
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(Color.accentColor.opacity(0.9), lineWidth: 2)
                                .padding(16)
                                .blendMode(.overlay)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                } else {
                    Image(style.imageName)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 220)
                        .clipped()
                        .overlay(
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(Color.accentColor.opacity(0.9), lineWidth: 2)
                                .padding(16)
                                .blendMode(.overlay)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }

                HStack(spacing: 8) {
                    Text(style.displayName)
                    Text("•")
                    Text(material.displayName)
                }
                .font(.caption.weight(.semibold))
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(.thinMaterial, in: Capsule())
                .padding(12)
            }
        }
    }
}

extension GateStyle {
    var cardTitle: String {
        switch self {
        case .cantileverSlide: return "Cantilever Slide"
        case .singleSwing: return "Single Swing"
        case .doubleSwing: return "Double Swing"
        case .rollGate: return "Roll Gate"
        case .overheadTrack: return "Overhead Track"
        case .verticalPivot: return "Vertical Pivot"
        }
    }

    var cardIcon: String {
        switch self {
        case .cantileverSlide: return "arrow.left.and.right.square"
        case .singleSwing: return "door.left.hand.open"
        case .doubleSwing: return "door.french.open"
        case .rollGate: return "rectangle.portrait.and.arrow.right"
        case .overheadTrack: return "arrow.up.and.down.square"
        case .verticalPivot: return "rotate.right"
        }
    }
}

extension Material {
    var cardTitle: String {
        switch self {
        case .wood: return "Wood"
        case .steel: return "Steel"
        case .chainLink: return "Chain Link"
        case .aluminumBasic: return "Aluminum (Basic)"
        }
    }

    var cardIcon: String {
        switch self {
        case .wood: return "leaf"
        case .steel: return "hammer"
        case .chainLink: return "link"
        case .aluminumBasic: return "square.3.layers.3d"
        }
    }
}

#Preview {
    NavigationStack {
        ProjectWorkspaceView(projectId: "p1")
            .environmentObject(Gate2GoSettings())
    }
    .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}

