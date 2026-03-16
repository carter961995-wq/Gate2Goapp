//
//  NewProjectView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import SwiftData
import PhotosUI

struct NewProjectView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var projectName: String = ""
    @State private var clientName: String = ""
    @State private var clientPhone: String = ""
    @State private var clientEmail: String = ""
    @State private var notes: String = ""

    @State private var pickedPhotoItem: PhotosPickerItem?
    @State private var photoPath: String?
    @State private var photoPreview: Image?

    @State private var workspaceDestination: WorkspaceDestination?

    var body: some View {
        Form {
            Section("Jobsite Photo (optional)") {
                VStack(alignment: .leading, spacing: 12) {
                    PhotosPicker(selection: $pickedPhotoItem, matching: .images) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(Color.secondary.opacity(0.12))
                            if let photoPreview {
                                photoPreview
                                    .resizable()
                                    .scaledToFill()
                                    .clipped()
                                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                            } else {
                                VStack(spacing: 10) {
                                    Image(systemName: "photo.on.rectangle")
                                        .font(.title2)
                                    Text("Tap to add jobsite photo")
                                        .font(.headline)
                                        .foregroundStyle(.secondary)
                                    Text("Or start designing without a photo")
                                        .font(.caption)
                                        .foregroundStyle(.tertiary)
                                }
                            }
                        }
                        .frame(height: 200)
                    }
                }
            }

            Section("Project") {
                TextField("Project name", text: $projectName)
                TextField("Notes", text: $notes, axis: .vertical)
                    .lineLimit(3...6)
            }

            Section("Client (optional)") {
                TextField("Client name", text: $clientName)
                TextField("Phone", text: $clientPhone)
                    .keyboardType(.phonePad)
                TextField("Email", text: $clientEmail)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
            }

            Section {
                Button("Create Project") { createProject() }
                    .disabled(!canCreate)
            }
        }
        .navigationTitle("New Project")
        .navigationBarTitleDisplayMode(.inline)
        .task(id: pickedPhotoItem) { await loadPhoto() }
        .navigationDestination(item: $workspaceDestination) { destination in
            ProjectWorkspaceView(projectId: destination.id)
        }
    }

    private var canCreate: Bool {
        !projectName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func loadPhoto() async {
        guard let pickedPhotoItem else { return }
        do {
            if let data = try await pickedPhotoItem.loadTransferable(type: Data.self),
               let ui = UIImage(data: data) {
                let fileName = "project_\(UUID().uuidString).jpg"
                let path = try FileStore.writeJPEG(ui, fileName: fileName, subdirectory: "projects/photos")
                await MainActor.run {
                    photoPath = path
                    photoPreview = Image(uiImage: ui)
                }
            }
        } catch {
            await MainActor.run {
                photoPath = nil
                photoPreview = nil
            }
        }
    }

    private func createProject() {
        let now = Date()
        let p = ProjectModel(
            name: projectName.trimmingCharacters(in: .whitespacesAndNewlines),
            clientName: clientName.nilIfEmpty,
            clientPhone: clientPhone.nilIfEmpty,
            clientEmail: clientEmail.nilIfEmpty,
            notes: notes.nilIfEmpty,
            sitePhotoPath: photoPath,
            createdAt: now,
            updatedAt: now
        )
        modelContext.insert(p)
        workspaceDestination = WorkspaceDestination(id: p.id)
    }
}

private struct WorkspaceDestination: Hashable {
    let id: String
}

private extension String {
    var nilIfEmpty: String? {
        let t = trimmingCharacters(in: .whitespacesAndNewlines)
        return t.isEmpty ? nil : t
    }
}

#Preview {
    NavigationStack {
        NewProjectView()
    }
    .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
