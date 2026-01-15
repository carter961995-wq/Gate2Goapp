//
//  appstate.swift
//  RandDFit
//
//  Created by Logan Carter on 1/9/26.
//

import Foundation
import Combine

@MainActor
final class AppState: ObservableObject {
    @Published var currentWorkout: Workout = Workout(title: "Loading…", minutes: 1, difficulty: .easy, equipment: .none, steps: [])

    func generateWorkout(using settings: UserSettings) {
        let diffs = settings.allowedDifficulties.isEmpty ? Set(Difficulty.allCases) : settings.allowedDifficulties
        currentWorkout = PromptGenerator.makeWorkout(allowedDifficulties: diffs, beginnerFriendly: settings.beginnerFriendly)
    }

    func markDone(using settings: UserSettings) {
        generateWorkout(using: settings)
    }
}
