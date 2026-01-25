//
//  DesignGalleryView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import SwiftData

struct DesignGalleryView: View {
    let projectId: String
    
    @Query private var designs: [GateDesignModel]
    
    init(projectId: String) {
        self.projectId = projectId
        _designs = Query(filter: #Predicate<GateDesignModel> { $0.projectId == projectId }, sort: \GateDesignModel.createdAt, order: .reverse)
    }
    
    private let columns = [GridItem(.adaptive(minimum: 160), spacing: 12)]
    
    var body: some View {
        Group {
            if designs.isEmpty {
                ContentUnavailableView {
                    Label("No Saved Designs", systemImage: "square.grid.2x2")
                } description: {
                    Text("Save a design version from the workspace to see it here.")
                }
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(designs) { design in
                            NavigationLink(value: GalleryRoute.detail(designId: design.id, projectId: design.projectId)) {
                                DesignCard(design: design)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Design Gallery")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(for: GalleryRoute.self) { route in
            switch route {
            case .detail(let designId, let projectId):
                DesignDetailView(designId: designId, projectId: projectId)
            }
        }
    }
}

struct DesignCard: View {
    let design: GateDesignModel
    @State private var thumbnail: UIImage?
    
    var body: some View {
        VStack(spacing: 0) {
            ZStack(alignment: .topTrailing) {
                if let thumbnail {
                    Image(uiImage: thumbnail)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 100)
                        .clipped()
                } else {
                    Image(design.gateStyle.imageName)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 100)
                        .clipped()
                }
                
                if design.selectedByClient {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(.green)
                        .padding(8)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(design.gateStyle.displayName)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.primary)
                Text(design.material.displayName)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text(MoneyFormatting.dollarsString(cents: design.totalPriceCents))
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.blue)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(10)
        }
        .background(Color(uiColor: .systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .task(id: previewPath) {
            await loadThumbnail()
        }
    }

    private var previewPath: String? {
        design.thumbnailPath ?? design.generatedImagePath
    }

    private func loadThumbnail() async {
        guard let previewPath else {
            await MainActor.run { thumbnail = nil }
            return
        }
        let image = await FileStore.readUIImageAsync(path: previewPath)
        guard !Task.isCancelled else { return }
        await MainActor.run {
            thumbnail = image
        }
    }
}

private enum GalleryRoute: Hashable {
    case detail(designId: String, projectId: String)
}

#Preview {
    NavigationStack {
        DesignGalleryView(projectId: "p1")
    }
    .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
