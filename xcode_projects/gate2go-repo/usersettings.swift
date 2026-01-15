//
//  usersettings.swift
//  RandDFit
//
//  Created by Logan Carter on 1/9/26.
//

import Foundation
import SwiftUI
import Combine

final class UserSettings: ObservableObject {
    @AppStorage("hasOnboarded") var hasOnboarded: Bool = false
    
    @AppStorage("difficultyCSV") private var difficultyCSV: String = "easy,moderate"
    @AppStorage("promptsPerDay") var promptsPerDay: Int = 4
    @AppStorage("startHour") var startHour: Int = 6
    @AppStorage("endHour") var endHour: Int = 19
    @AppStorage("beginnerFriendly") var beginnerFriendly: Bool = true
    
    var allowedDifficulties: Set<Difficulty> {
        get {
            let parts = difficultyCSV.split(separator: ",").map { String($0) }
            let diffs = parts.compactMap { Difficulty(rawValue: $0) }
            return Set(diffs.isEmpty ? Difficulty.allCases : diffs)
        }
        set {
            let csv = newValue.map { $0.rawValue }.sorted().joined(separator: ",")
            difficultyCSV = csv.isEmpty ? "easy,moderate,hard" : csv
        }
    }
    
}
