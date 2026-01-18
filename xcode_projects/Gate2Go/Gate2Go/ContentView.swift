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
            } else if !settings.hasAccessToDesign() {
                NavigationStack {
                    PaywallView()
                }
            } else {
                MainTabView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                ProjectsListView()
            }
            .tabItem {
                Label("Projects", systemImage: "folder.fill")
            }
            
            NavigationStack {
                SettingsView()
            }
            .tabItem {
                Label("Settings", systemImage: "gearshape.fill")
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(Gate2GoSettings())
        .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
