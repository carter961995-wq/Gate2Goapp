//
//  DesignDetailView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import SwiftData

struct DesignDetailView: View {
    let design: GateDesignModel
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Image(design.gateStyle.imageName)
                    .resizable()
                    .scaledToFill()
                    .frame(height: 250)
                    .clipped()
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                
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
                
                VStack(alignment: .leading, spacing: 12) {
                    Text("Pricing")
                        .font(.headline)
                    
                    HStack {
                        Text("Base Price")
                        Spacer()
                        Text(MoneyFormatting.dollarsString(cents: design.basePriceCents))
                            .foregroundStyle(.secondary)
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
                
                Text("Created \(design.createdAt, style: .date)")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            .padding()
        }
        .navigationTitle("Design Details")
        .navigationBarTitleDisplayMode(.inline)
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
    }
}
