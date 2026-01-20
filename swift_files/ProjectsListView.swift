import SwiftUI
import SwiftData

struct ProjectsListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \ProjectModel.updatedAt, order: .reverse) private var projects: [ProjectModel]
    @State private var searchText = ""
    @State private var showNewProject = false
    
    var filteredProjects: [ProjectModel] {
        if searchText.isEmpty {
            return projects
        }
        return projects.filter { 
            $0.clientName.localizedCaseInsensitiveContains(searchText) ||
            $0.siteAddress.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        NavigationStack {
            Group {
                if projects.isEmpty {
                    emptyState
                } else {
                    projectsList
                }
            }
            .navigationTitle("Projects")
            .searchable(text: $searchText, prompt: "Search projects")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showNewProject = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showNewProject) {
                NewProjectView()
            }
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "folder.badge.plus")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            
            Text("No Projects Yet")
                .font(.title2.bold())
            
            Text("Create your first project to start designing gates.")
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            
            Button(action: { showNewProject = true }) {
                Text("Create Project")
                    .font(.headline)
                    .padding(.horizontal, 24)
                    .padding(.vertical, 12)
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(10)
            }
        }
        .padding()
    }
    
    private var projectsList: some View {
        List {
            ForEach(filteredProjects) { project in
                NavigationLink(destination: ProjectWorkspaceView(project: project)) {
                    ProjectCard(project: project)
                }
            }
            .onDelete(perform: deleteProjects)
        }
        .listStyle(.plain)
    }
    
    private func deleteProjects(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(filteredProjects[index])
        }
    }
}

struct ProjectCard: View {
    let project: ProjectModel
    
    var body: some View {
        HStack(spacing: 12) {
            if let photoData = project.sitePhotoData,
               let uiImage = UIImage(data: photoData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 60, height: 60)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
            } else {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Color(.systemGray5))
                    .frame(width: 60, height: 60)
                    .overlay(
                        Image(systemName: "photo")
                            .foregroundStyle(.secondary)
                    )
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(project.clientName.isEmpty ? "Untitled Project" : project.clientName)
                    .font(.headline)
                
                if !project.siteAddress.isEmpty {
                    Text(project.siteAddress)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                
                Text(project.updatedAt, style: .relative)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
            
            Spacer()
            
            if let designs = project.designs, !designs.isEmpty {
                Text("\(designs.count)")
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.1))
                    .foregroundStyle(.blue)
                    .cornerRadius(12)
            }
        }
        .padding(.vertical, 4)
    }
}

#Preview {
    ProjectsListView()
        .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
