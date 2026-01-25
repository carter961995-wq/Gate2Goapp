import SwiftUI

struct RenderPreviewCard: View {
    let title: String
    let generatedPath: String?
    let originalPath: String?

    @State private var showOriginal: Bool
    @State private var renderImage: UIImage?

    init(title: String, generatedPath: String?, originalPath: String?) {
        self.title = title
        self.generatedPath = generatedPath
        self.originalPath = originalPath
        _showOriginal = State(initialValue: generatedPath == nil && originalPath != nil)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(title)
                    .font(.headline)
                Spacer()
                if originalPath != nil {
                    Toggle("Original", isOn: $showOriginal)
                        .labelsHidden()
                }
            }

            Group {
                if let renderImage {
                    Image(uiImage: renderImage)
                        .resizable()
                        .scaledToFit()
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                } else {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(Color.secondary.opacity(0.12))
                        .frame(height: 240)
                        .overlay(
                            Text(placeholderText)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal, 16)
                        )
                }
            }
        }
        .padding(14)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .task(id: displayPath) {
            await loadImage()
        }
        .onChange(of: generatedPath) { _, newValue in
            if newValue != nil {
                showOriginal = false
            }
        }
        .onChange(of: originalPath) { _, newValue in
            if newValue == nil {
                showOriginal = false
            }
        }
    }

    private var displayPath: String? {
        showOriginal ? originalPath : generatedPath
    }

    private var placeholderText: String {
        if showOriginal {
            return "No jobsite photo available."
        }
        if originalPath == nil {
            return "Add a jobsite photo to enable photoreal renders."
        }
        return "Tap Photoreal Generate to create a render."
    }

    private func loadImage() async {
        guard let displayPath else {
            await MainActor.run { renderImage = nil }
            return
        }
        let image = await FileStore.readUIImageAsync(path: displayPath)
        guard !Task.isCancelled else { return }
        await MainActor.run {
            renderImage = image
        }
    }
}
