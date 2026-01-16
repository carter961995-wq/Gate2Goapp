//
//  ContentView.swift
//  Gate2Go
//
//  Created by Logan Carter on 1/14/26.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    var body: some View {
        NavigationStack {
            ProjectsListView()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(Gate2GoSettings())
        .modelContainer(for: [ProjectModel.self, GateDesignModel.self], inMemory: true)
}
