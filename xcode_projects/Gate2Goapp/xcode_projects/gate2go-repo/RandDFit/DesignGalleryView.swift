import SwiftUI
import SwiftData

struct DesignGalleryView: View {
    let projectId: String

    @Query private var designs: [GateDesignModel]

    private let columns = [GridItem(.adaptive(minimum: 160), spacing: 12)]

    init(projectId: String) {
        self.projectId = projectId
        _designs = Query(filter: #Predicate<GateDesignModel> { $0.projectId == projectId }, sort: \GateDesignModel.updatedAt, order: .reverse)
    }

    var body: some View {
        ScrollView {
            if designs.isEmpty {
                ContentUnavailableView("No Designs Yet", systemImage: "square.grid.2x2", description: Text("Save a version from the Design tab to see it here."))
                    .padding(.top, 60)
            } else {
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(designs) { design in
                        NavigationLink(value: Route.designDetail(designId: design.id, projectId: design.projectId)) {
                            DesignTile(design: design)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
        }
        .navigationTitle("Design Gallery")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct DesignTile: View {
    let design: GateDesignModel

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ZStack(alignment: .topTrailing) {
                if let path = design.thumbnailPath, let ui = FileStore.readUIImage(path: path) {
                    Image(uiImage: ui)
                        .resizable()
                        .scaledToFill()
                        .frame(height: 120)
                        .clipped()
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                } else {
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .fill(Color.secondary.opacity(0.12))
                        .frame(height: 120)
                        .overlay(Image(systemName: "photo").foregroundStyle(.secondary))
                }

                if design.selectedByClient {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundStyle(.green)
                        .padding(10)
                }
            }

            Text("\(design.gateStyle.cardTitle) • \(design.material.cardTitle)")
                .font(.subheadline.weight(.semibold))
                .lineLimit(2)

            Text("Total: \(MoneyFormatting.dollarsString(cents: design.totalPriceCents))")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(12)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

#Preview {
    NavigationStack {
        DesignGalleryView(projectId: "p1")
    }
    .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}

