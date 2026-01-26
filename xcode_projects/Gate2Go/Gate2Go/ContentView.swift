//
//  ContentView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @EnvironmentObject private var settings: Gate2GoSettings
    
    var body: some View {
        Group {
            if !settings.hasCompletedOnboarding {
                OnboardingView()
            } else {
                MainTabView()
            }
        }
    }
}

struct MainTabView: View {
    @State private var selection: MainTab = .projects

    var body: some View {
        TabView(selection: $selection) {
            NavigationStack {
                ProjectsListView()
            }
            .tabItem {
                Label("Projects", systemImage: "folder.fill")
            }
            .tag(MainTab.projects)
            
            NavigationStack {
                SettingsView(selectedTab: $selection)
            }
            .tabItem {
                Label("Settings", systemImage: "gearshape.fill")
            }
            .tag(MainTab.settings)
        }
    }
}

enum MainTab: Hashable {
    case projects
    case settings
}

#Preview {
    ContentView()
        .environmentObject(Gate2GoSettings())
        .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
