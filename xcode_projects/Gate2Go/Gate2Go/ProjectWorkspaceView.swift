//
//  ProjectWorkspaceView.swift
//  Gate2Go
//

import SwiftUI
import SwiftData
import UIKit
import Foundation
import PhotosUI

struct ProjectWorkspaceView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var settings: Gate2GoSettings

    let projectId: String

    @Query private var projects: [ProjectModel]
    @Query private var designs: [GateDesignModel]

    @State private var draft = GateDesignDraft()
    @State private var isGenerating: Bool = false
    @State private var lastSavedDesignId: String?
    @State private var showGenerateError: Bool = false
    @State private var generateErrorMessage: String?

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
                .alert("Photoreal Generate Failed", isPresented: $showGenerateError) {
                    Button("OK") { }
                } message: {
                    Text(generateErrorMessage ?? "Please try again.")
                }
                .onAppear {
                    if draft.isFresh {
                        draft.applyDefaults(from: settings)
                        draft.basePriceCents = PricingCalculator.defaultBasePriceCents(
                            style: draft.gateStyle,
                            material: draft.material,
                            widthFeet: draft.widthFeet,
                            heightFeet: draft.heightFeet,
                            regionMultiplier: settings.pricingRegion.multiplier
                        )
                        draft.recomputeTotals()
                    }
                }
                .onChange(of: draft.gateStyle) { _, _ in
                    draft.reseedBasePriceIfAuto(regionMultiplier: settings.pricingRegion.multiplier)
                }
                .onChange(of: draft.material) { _, _ in
                    draft.reseedBasePriceIfAuto(regionMultiplier: settings.pricingRegion.multiplier)
                }
                .onChange(of: draft.widthFeet) { _, _ in
                    draft.reseedBasePriceIfAuto(regionMultiplier: settings.pricingRegion.multiplier)
                }
                .onChange(of: draft.heightFeet) { _, _ in
                    draft.reseedBasePriceIfAuto(regionMultiplier: settings.pricingRegion.multiplier)
                }
            } else {
                ContentUnavailableView("Project not found", systemImage: "questionmark.folder")
            }
        }
    }

    private func saveVersion(project: ProjectModel) {
        let now = Date()
        var params = draft.params
        params["latchStyle"] = .string(draft.latchStyle.rawValue)
        params["cutoutMode"] = .string(draft.cutoutMode.rawValue)
        params["cutoutPlacement"] = .string(draft.cutoutPlacement.rawValue)
        if !draft.cutoutText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            params["cutoutText"] = .string(draft.cutoutText)
        }
        if let path = draft.cutoutImagePath {
            params["cutoutImagePath"] = .string(path)
        }
        if !draft.cutoutDescription.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            params["cutoutDescription"] = .string(draft.cutoutDescription)
        }
        let design = GateDesignModel(
            projectId: project.id,
            gateStyle: draft.gateStyle,
            material: draft.material,
            widthFeet: draft.widthFeet,
            heightFeet: draft.heightFeet,
            params: params,
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
            let prompt = await MainActor.run { buildPrompt(project: project) }
            if let generatedPath = await generateAIImage(prompt: prompt) {
                await MainActor.run {
                    draft.generatedImagePath = generatedPath
                    draft.thumbnailPath = generatedPath
                }
            } else if let fallbackPath = await generateRenderPath(project: project) {
                await MainActor.run {
                    draft.generatedImagePath = fallbackPath
                    draft.thumbnailPath = fallbackPath
                }
            } else {
                await MainActor.run {
                    generateErrorMessage = "Unable to generate an image right now."
                    showGenerateError = true
                }
            }
        }
    }

    private func generateAIImage(prompt: String) async -> String? {
        let baseURL = await ImageGenerationConfig.baseURL
        let url = baseURL.appendingPathComponent("api/images/generate")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let authToken = await ImageGenerationConfig.authToken
        if !authToken.isEmpty {
            request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        }

        let body = ImageGenerateRequest(prompt: prompt, size: "1024x1024")
        guard let payload = try? JSONEncoder().encode(body) else { return nil }
        request.httpBody = payload

        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let httpResponse = response as? HTTPURLResponse else { return nil }
            guard (200...299).contains(httpResponse.statusCode) else {
                let message = String(data: data, encoding: .utf8)
                await MainActor.run {
                    generateErrorMessage = message?.isEmpty == false ? message : "Server error (\(httpResponse.statusCode))."
                    showGenerateError = true
                }
                return nil
            }

            let decoded = try JSONDecoder().decode(ImageGenerateResponse.self, from: data)
            guard decoded.success, let imageUrl = decoded.imageUrl else {
                let message = decoded.error ?? decoded.message ?? "Image generation failed."
                await MainActor.run {
                    generateErrorMessage = message
                    showGenerateError = true
                }
                return nil
            }
            guard let imageData = decodeDataURL(imageUrl), let image = UIImage(data: imageData) else { return nil }
            let scaled = resizeImageIfNeeded(image, maxDimension: 1600)
            let fileName = "render-\(UUID().uuidString).jpg"
            return try? FileStore.writeJPEG(scaled, fileName: fileName, subdirectory: "projects/renders")
        } catch {
            await MainActor.run {
                generateErrorMessage = error.localizedDescription
                showGenerateError = true
            }
            return nil
        }
    }

    private func decodeDataURL(_ value: String) -> Data? {
        guard let comma = value.firstIndex(of: ",") else { return nil }
        let base64 = String(value[value.index(after: comma)...])
        return Data(base64Encoded: base64, options: .ignoreUnknownCharacters)
    }

    @MainActor
    private func buildPrompt(project: ProjectModel) -> String {
        var components: [String] = []
        components.append("Photorealistic driveway gate render")
        components.append("\(draft.gateStyle.displayName) gate")
        components.append("material: \(draft.material.displayName)")
        components.append("size: \(Int(draft.widthFeet)) ft wide by \(Int(draft.heightFeet)) ft tall")
        components.append("pickets: \(draft.picketOrientation.displayName)")
        components.append("top style: \(draft.archStyle.displayName)")
        if draft.material == .steel {
            components.append("finials: \(draft.finialStyle.displayName)")
        }
        if draft.latchStyle != .none {
            components.append("latch style: \(draft.latchStyle.displayName)")
        }
        let hardwareDetails = buildHardwareDetails()
        if !hardwareDetails.isEmpty {
            components.append("include visible hardware: \(hardwareDetails.joined(separator: \", \"))")
        }
        let cutoutDetails = buildCutoutDetails()
        if !cutoutDetails.isEmpty {
            components.append(cutoutDetails)
        }
        if let name = project.name.isEmpty ? nil : project.name {
            components.append("project: \(name)")
        }
        components.append("natural lighting, realistic shadows, no watermarks")
        return components.joined(separator: ", ")
    }

    @MainActor
    private func buildHardwareDetails() -> [String] {
        var details: [String] = []
        for addon in draft.addons {
            switch addon.type {
            case .keypad:
                details.append("keypad entry")
            case .dropRod:
                details.append("drop rod")
            case .latch:
                details.append("latch hardware")
            case .opener:
                if let type = addon.operatorType {
                    details.append("\(type.displayName.lowercased()) gate opener")
                } else {
                    details.append("gate opener")
                }
            }
        }
        return details
    }

    @MainActor
    private func buildCutoutDetails() -> String {
        guard draft.cutoutMode != .none else { return "" }
        let placement = draft.cutoutPlacement.displayName.lowercased()
        var parts: [String] = []
        if (draft.cutoutMode == .text || draft.cutoutMode == .textAndImage),
           !draft.cutoutText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            parts.append("custom plasma cut text '\(draft.cutoutText)' at \(placement)")
        }
        if draft.cutoutMode == .image || draft.cutoutMode == .textAndImage {
            let description = draft.cutoutDescription.trimmingCharacters(in: .whitespacesAndNewlines)
            if !description.isEmpty {
                parts.append("custom plasma cut image of \(description) at \(placement)")
            } else {
                parts.append("custom plasma cut image at \(placement)")
            }
        }
        return parts.joined(separator: " and ")
    }

    private func generateRenderPath(project: ProjectModel) async -> String? {
        let gateImage = await loadGateImage()
        let basePhoto: UIImage?
        if let path = project.sitePhotoPath {
            basePhoto = await FileStore.readUIImageAsync(path: path)
        } else {
            basePhoto = nil
        }
        let scaledBasePhoto = basePhoto.map { resizeImageIfNeeded($0, maxDimension: 1600) }

        let renderedImage: UIImage?
        if let scaledBasePhoto, let gateImage {
            renderedImage = compositeGate(on: scaledBasePhoto, gate: gateImage)
        } else {
            renderedImage = gateImage ?? scaledBasePhoto
        }

        guard let renderedImage else { return nil }
        let fileName = "render-\(UUID().uuidString).jpg"
        return try? FileStore.writeJPEG(renderedImage, fileName: fileName, subdirectory: "projects/renders")
    }

    private func loadGateImage() async -> UIImage? {
        if let assetImage = UIImage(named: draft.gateStyle.imageName) {
            return assetImage
        }
        return await MainActor.run { renderGatePreview() }
    }

    @MainActor
    private func renderGatePreview() -> UIImage? {
        let preview = GateDesignerView(
            widthFeet: draft.widthFeet,
            heightFeet: draft.heightFeet,
            material: draft.material,
            gateStyle: draft.gateStyle,
            picketOrientation: draft.picketOrientation,
            finialStyle: draft.finialStyle,
            archStyle: draft.archStyle
        )
        let renderer = ImageRenderer(content: preview)
        renderer.scale = UIScreen.main.scale
        return renderer.uiImage
    }

    private func compositeGate(on basePhoto: UIImage, gate: UIImage) -> UIImage {
        let baseSize = basePhoto.size
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: baseSize, format: format)
        return renderer.image { context in
            basePhoto.draw(in: CGRect(origin: .zero, size: baseSize))

            let maxGateWidth = baseSize.width * 0.75
            let maxGateHeight = baseSize.height * 0.55
            let widthScale = maxGateWidth / gate.size.width
            let heightScale = maxGateHeight / gate.size.height
            let scale = min(widthScale, heightScale)
            let gateSize = CGSize(width: gate.size.width * scale, height: gate.size.height * scale)
            let gateOrigin = CGPoint(
                x: (baseSize.width - gateSize.width) / 2,
                y: baseSize.height - gateSize.height - baseSize.height * 0.08
            )

            context.cgContext.setShadow(offset: CGSize(width: 0, height: 6), blur: 12, color: UIColor.black.withAlphaComponent(0.3).cgColor)
            gate.draw(in: CGRect(origin: gateOrigin, size: gateSize), blendMode: .normal, alpha: 0.92)
        }
    }

    private func resizeImageIfNeeded(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let maxSide = max(image.size.width, image.size.height)
        guard maxSide > maxDimension else { return image }
        let scale = maxDimension / maxSide
        let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        format.opaque = true
        let renderer = UIGraphicsImageRenderer(size: newSize, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
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
    var latchStyle: LatchStyle = .standard
    var cutoutMode: CutoutMode = .none
    var cutoutPlacement: CutoutPlacement = .center
    var cutoutText: String = ""
    var cutoutImagePath: String?
    var cutoutDescription: String = ""

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

    mutating func reseedBasePriceIfAuto(regionMultiplier: Double) {
        guard isBasePriceAutoSeeded else { return }
        basePriceCents = PricingCalculator.defaultBasePriceCents(
            style: gateStyle,
            material: material,
            widthFeet: widthFeet,
            heightFeet: heightFeet,
            regionMultiplier: regionMultiplier
        )
        recomputeTotals()
    }
}

private struct ImageGenerateRequest: Encodable {
    let prompt: String
    let size: String
}

private struct ImageGenerateResponse: Decodable {
    let success: Bool
    let imageUrl: String?
    let error: String?
    let message: String?
}

private struct DesignTabView: View {
    let project: ProjectModel
    @Binding var draft: GateDesignDraft
    @Binding var isGenerating: Bool
    let onGenerate: () -> Void
    let onSaveVersion: () -> Void

    @EnvironmentObject private var settings: Gate2GoSettings

    @State private var cutoutPickerItem: PhotosPickerItem?
    @State private var cutoutPreview: Image?

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

                Group {
                    Text("Hardware & Cutouts")
                        .font(.headline)

                    VStack(spacing: 12) {
                        HStack {
                            Text("Latch Style")
                            Spacer()
                            Picker("Latch Style", selection: $draft.latchStyle) {
                                ForEach(LatchStyle.allCases) { style in
                                    Text(style.displayName).tag(style)
                                }
                            }
                            .pickerStyle(.menu)
                        }

                        HStack {
                            Text("Cutout Type")
                            Spacer()
                            Picker("Cutout Type", selection: $draft.cutoutMode) {
                                ForEach(CutoutMode.allCases) { mode in
                                    Text(mode.displayName).tag(mode)
                                }
                            }
                            .pickerStyle(.menu)
                        }

                        if draft.cutoutMode != .none {
                            HStack {
                                Text("Placement")
                                Spacer()
                                Picker("Placement", selection: $draft.cutoutPlacement) {
                                    ForEach(CutoutPlacement.allCases) { placement in
                                        Text(placement.displayName).tag(placement)
                                    }
                                }
                                .pickerStyle(.segmented)
                                .frame(maxWidth: 240)
                            }
                        }

                        if draft.cutoutMode == .text || draft.cutoutMode == .textAndImage {
                            TextField("Initials or short text", text: $draft.cutoutText)
                                .textInputAutocapitalization(.characters)
                                .autocorrectionDisabled()
                        }

                        if draft.cutoutMode == .image || draft.cutoutMode == .textAndImage {
                            PhotosPicker(selection: $cutoutPickerItem, matching: .images) {
                                Text(draft.cutoutImagePath == nil ? "Add Cutout Image" : "Change Cutout Image")
                            }

                            if let cutoutPreview {
                                cutoutPreview
                                    .resizable()
                                    .scaledToFit()
                                    .frame(height: 120)
                                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            }

                            TextField("Image description (optional)", text: $draft.cutoutDescription)
                                .autocorrectionDisabled()

                            if draft.cutoutImagePath != nil {
                                Button("Remove Cutout Image", role: .destructive) {
                                    draft.cutoutImagePath = nil
                                    cutoutPreview = nil
                                    cutoutPickerItem = nil
                                }
                                .font(.caption)
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

                RenderPreviewCard(
                    title: "Photoreal Preview",
                    generatedPath: draft.generatedImagePath,
                    originalPath: project.sitePhotoPath
                )
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
        .task(id: cutoutPickerItem) {
            await loadCutoutImageFromPicker()
        }
        .task(id: draft.cutoutImagePath) {
            await loadCutoutPreview()
        }
    }

    private func loadCutoutImageFromPicker() async {
        guard let cutoutPickerItem else { return }
        do {
            if let data = try await cutoutPickerItem.loadTransferable(type: Data.self),
               let uiImage = UIImage(data: data) {
                let fileName = "cutout-\(UUID().uuidString).jpg"
                let path = try FileStore.writeJPEG(uiImage, fileName: fileName, subdirectory: "projects/cutouts")
                await MainActor.run {
                    draft.cutoutImagePath = path
                    cutoutPreview = Image(uiImage: uiImage)
                }
            }
        } catch {
            await MainActor.run {
                cutoutPickerItem = nil
            }
        }
    }

    private func loadCutoutPreview() async {
        guard let path = draft.cutoutImagePath else {
            await MainActor.run { cutoutPreview = nil }
            return
        }
        let image = await FileStore.readUIImageAsync(path: path)
        await MainActor.run {
            if let image {
                cutoutPreview = Image(uiImage: image)
            } else {
                cutoutPreview = nil
            }
        }
    }
}

private struct OptionsPriceTabView: View {
    @Binding var draft: GateDesignDraft
    let tier: SubscriptionTier
    @EnvironmentObject private var settings: Gate2GoSettings

    var body: some View {
        Form {
            Section("Add-ons") {
                AddOnPickerView(addons: $draft.addons, gateStyle: draft.gateStyle)
            }

            Section("Pricing") {
                Picker("Pricing Region", selection: Binding(
                    get: { settings.pricingRegion },
                    set: { settings.pricingRegion = $0 }
                )) {
                    ForEach(PricingRegion.allCases) { region in
                        Text(region.displayName).tag(region)
                    }
                }

                HStack {
                    Text("Regional average")
                    Spacer()
                    Text(MoneyFormatting.dollarsString(cents: regionalAverageCents))
                        .foregroundStyle(.secondary)
                        .monospacedDigit()
                }

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
            .onChange(of: settings.pricingRegion) { _, _ in
                if draft.isBasePriceAutoSeeded {
                    draft.reseedBasePriceIfAuto(regionMultiplier: settings.pricingRegion.multiplier)
                }
            }

            Section("Total") {
                Text(MoneyFormatting.dollarsString(cents: draft.totalPriceCents))
                    .font(.title3.bold())
                    .monospacedDigit()
            }
        }
    }

    private var regionalAverageCents: Int {
        PricingCalculator.defaultBasePriceCents(
            style: draft.gateStyle,
            material: draft.material,
            widthFeet: draft.widthFeet,
            heightFeet: draft.heightFeet,
            regionMultiplier: settings.pricingRegion.multiplier
        )
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
