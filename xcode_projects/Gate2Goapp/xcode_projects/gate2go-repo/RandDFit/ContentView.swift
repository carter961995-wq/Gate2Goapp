//
//  ContentView.swift
//  RandDFit
//
//  Created by Logan Carter on 1/9/26.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @EnvironmentObject private var settings: Gate2GoSettings

    var body: some View {
        NavigationStack {
            Group {
                if !settings.hasCompletedOnboarding {
                    OnboardingView()
                } else if !settings.hasActiveSubscription {
                    PaywallView()
                } else {
                    ProjectsListView()
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(Gate2GoSettings())
        .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
