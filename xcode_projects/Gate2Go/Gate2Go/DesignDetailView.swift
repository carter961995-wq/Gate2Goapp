//
//  DesignDetailView.swift
//  Gate2Go
//

import SwiftUI
import SwiftData

struct DesignDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var settings: Gate2GoSettings
    let designId: String
    let projectId: String

    @Query private var designs: [GateDesignModel]
    @Query private var projects: [ProjectModel]
    @State private var isExporting: Bool = false
    
    init(designId: String, projectId: String) {
        self.designId = designId
        self.projectId = projectId
        _designs = Query(filter: #Predicate<GateDesignModel> { $0.id == designId })
        _projects = Query(filter: #Predicate<ProjectModel> { $0.id == projectId })
    }

    var design: GateDesignModel? {
        designs.first
    }

    var project: ProjectModel? {
        projects.first
    }
    
    var body: some View {
        Group {
            if let design {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        RenderPreviewCard(
                            title: "Render",
                            generatedPath: design.generatedImagePath,
                            originalPath: project?.sitePhotoPath
                        )
                        
                        // Client Selection Toggle
                        HStack {
                            HStack(spacing: 12) {
                                Image(systemName: design.selectedByClient ? "checkmark.seal.fill" : "checkmark.seal")
                                    .font(.title2)
                                    .foregroundStyle(design.selectedByClient ? .green : .secondary)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Selected by Client")
                                        .font(.subheadline.weight(.medium))
                                    Text(design.selectedByClient ? "Client chose this design" : "Mark as client's choice")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            Spacer()
                            Toggle("", isOn: Binding(
                                get: { design.selectedByClient },
                                set: { newValue in
                                    design.selectedByClient = newValue
                                    design.updatedAt = Date()
                                }
                            ))
                            .labelsHidden()
                            .tint(.green)
                        }
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Specifications")
                                .font(.headline)
                            
                            HStack {
                                Label("Style", systemImage: "door.left.hand.open")
                                Spacer()
                                Text(design.gateStyle.displayName)
                                    .foregroundStyle(.secondary)
                            }
                            
                            HStack {
                                Label("Material", systemImage: "hammer")
                                Spacer()
                                Text(design.material.displayName)
                                    .foregroundStyle(.secondary)
                            }
                            
                            HStack {
                                Label("Width", systemImage: "arrow.left.and.right")
                                Spacer()
                                Text("\(Int(design.widthFeet)) ft")
                                    .foregroundStyle(.secondary)
                            }
                            
                            HStack {
                                Label("Height", systemImage: "arrow.up.and.down")
                                Spacer()
                                Text("\(Int(design.heightFeet)) ft")
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        
                        // Add-ons Section
                        if !design.addons.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Add-ons")
                                    .font(.headline)
                                
                                ForEach(design.addons, id: \.id) { addon in
                                    HStack {
                                        Text(addon.title)
                                        Text("×\(addon.quantity)")
                                            .foregroundStyle(.secondary)
                                        Spacer()
                                        Text(MoneyFormatting.dollarsString(cents: addon.contractorCost.amountCents * addon.quantity))
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                            .padding()
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        }
                        
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Pricing")
                                .font(.headline)
                            
                            HStack {
                                Text("Base Price")
                                Spacer()
                                Text(MoneyFormatting.dollarsString(cents: design.basePriceCents))
                                    .foregroundStyle(.secondary)
                            }
                            
                            if !design.addons.isEmpty {
                                let addonsTotal = design.addons.reduce(0) { $0 + ($1.contractorCost.amountCents * $1.quantity) }
                                HStack {
                                    Text("Add-ons")
                                    Spacer()
                                    Text(MoneyFormatting.dollarsString(cents: addonsTotal))
                                        .foregroundStyle(.secondary)
                                }
                            }
                            
                            Divider()
                            
                            HStack {
                                Text("Total")
                                    .font(.headline)
                                Spacer()
                                Text(MoneyFormatting.dollarsString(cents: design.totalPriceCents))
                                    .font(.title3.bold())
                                    .foregroundStyle(.blue)
                            }
                        }
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                        
                        // Action Buttons
                        VStack(spacing: 12) {
                            Button {
                                duplicateDesign()
                            } label: {
                                HStack {
                                    Image(systemName: "doc.on.doc")
                                    Text("Duplicate Design")
                                        .font(.headline)
                                    Spacer()
                                }
                            }
                            .buttonStyle(.bordered)
                            
                            Button {
                                exportProposal()
                            } label: {
                                HStack {
                                    if isExporting {
                                        ProgressView()
                                            .padding(.trailing, 6)
                                    } else {
                                        Image(systemName: "doc.richtext")
                                    }
                                    Text("Export Proposal")
                                        .font(.headline)
                                    Spacer()
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .disabled(isExporting)
                        }
                        
                        Text("Created \(design.createdAt, style: .date)")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    .padding()
                }
                .navigationTitle("Design Details")
                .navigationBarTitleDisplayMode(.inline)
            } else {
                ContentUnavailableView("Design not found", systemImage: "questionmark.square")
            }
        }
    }
    
    private func duplicateDesign() {
        guard let design else { return }
        let now = Date()
        let copy = GateDesignModel(
            projectId: design.projectId,
            gateStyle: design.gateStyle,
            material: design.material,
            widthFeet: design.widthFeet,
            heightFeet: design.heightFeet,
            params: design.params,
            addons: design.addons,
            basePriceCents: design.basePriceCents,
            totalPriceCents: design.totalPriceCents,
            generatedImagePath: design.generatedImagePath,
            thumbnailPath: design.thumbnailPath,
            selectedByClient: false,
            createdAt: now,
            updatedAt: now
        )
        modelContext.insert(copy)
    }
    
    private func exportProposal() {
        guard let design = design, let project = project, !isExporting else { return }
        isExporting = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            ProposalGenerator.shareProposal(design: design, project: project, settings: settings)
            isExporting = false
        }
    }
}

#Preview {
    NavigationStack {
        DesignDetailView(designId: "d1", projectId: "p1")
            .environmentObject(Gate2GoSettings())
    }
}
