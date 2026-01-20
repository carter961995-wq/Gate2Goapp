import SwiftUI

struct ContentView: View {
    @EnvironmentObject var settings: Gate2GoSettings
    @State private var showPaywall = false
    
    var body: some View {
        Group {
            if !settings.hasCompletedOnboarding {
                OnboardingView()
            } else if !settings.isPremium && settings.singleDesignCredits == 0 {
                PaywallView()
            } else {
                MainTabView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            ProjectsListView()
                .tabItem {
                    Label("Projects", systemImage: "folder")
                }
            
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(Gate2GoSettings())
}
