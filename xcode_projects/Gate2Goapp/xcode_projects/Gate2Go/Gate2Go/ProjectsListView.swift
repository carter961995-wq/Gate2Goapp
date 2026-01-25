//
//  ProjectsListView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import SwiftData

struct ProjectsListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \ProjectModel.updatedAt, order: .reverse) private var projects: [ProjectModel]
    @State private var searchText: String = ""
    
    var filteredProjects: [ProjectModel] {
        if searchText.isEmpty {
            return projects
        }
        return projects.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }
    
    var body: some View {
        Group {
            if projects.isEmpty {
                ContentUnavailableView {
                    Label("No Projects", systemImage: "folder")
                } description: {
                    Text("Create your first gate project to get started.")
                } actions: {
                    NavigationLink("New Project", destination: NewProjectView())
                        .buttonStyle(.borderedProminent)
                }
            } else {
                List {
                    ForEach(filteredProjects) { project in
                        NavigationLink(destination: ProjectWorkspaceView(projectId: project.id)) {
                            ProjectRow(project: project)
                        }
                    }
                    .onDelete(perform: deleteProjects)
                }
                .searchable(text: $searchText, prompt: "Search projects")
            }
        }
        .navigationTitle("Projects")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink(destination: NewProjectView()) {
                    Label("New", systemImage: "plus")
                }
            }
        }
    }
    
    private func deleteProjects(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(filteredProjects[index])
        }
    }
}

struct ProjectRow: View {
    let project: ProjectModel
    
    var body: some View {
        HStack(spacing: 12) {
            if let path = project.sitePhotoPath, let ui = FileStore.readUIImage(path: path) {
                Image(uiImage: ui)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 60, height: 60)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color.secondary.opacity(0.2))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: "photo")
                            .foregroundStyle(.secondary)
                    )
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(project.name)
                    .font(.headline)
                if let clientName = project.clientName {
                    Text(clientName)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Text(project.updatedAt, style: .date)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    NavigationStack {
        ProjectsListView()
    }
    .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
