//
//  DesignDetailView.swift
//  Gate2Go
//

import SwiftUI
import SwiftData

struct DesignDetailView: View {
    @Environment(\.modelContext) private var modelContext
    @EnvironmentObject private var settings: Gate2GoSettings
    let design: GateDesignModel
    
    @Query private var projects: [ProjectModel]
    @State private var isExporting: Bool = false
    
    var project: ProjectModel? {
        projects.first { $0.id == design.projectId }
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Image(design.gateStyle.imageName)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 250)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                
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
    }
    
    private func duplicateDesign() {
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
        guard let project = project, !isExporting else { return }
        isExporting = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            ProposalGenerator.shareProposal(design: design, project: project, settings: settings)
            isExporting = false
        }
    }
}

#Preview {
    NavigationStack {
        DesignDetailView(design: GateDesignModel(
            projectId: "p1",
            gateStyle: .singleSwing,
            material: .steel,
            widthFeet: 12,
            heightFeet: 6,
            basePriceCents: 468000,
            totalPriceCents: 673920
        ))
        .environmentObject(Gate2GoSettings())
    }
}
