//
//  promptgenerator.swift
//  RandDFit
//
//  Created by Logan Carter on 1/9/26.
//

import Foundation

enum PromptUnit: String, Codable {
    case reps
    case seconds
}

struct ExerciseTemplate: Identifiable, Codable, Equatable {
    let id = UUID()
    let name: String
    let unit: PromptUnit

    let easy: ClosedRange<Int>
    let moderate: ClosedRange<Int>
    let hard: ClosedRange<Int>

    let formCue: String
    let easierOption: String?
}

struct PromptGenerator {

    static let templates: [ExerciseTemplate] = [
        .init(name: "Push-ups", unit: .reps,
              easy: 6...15, moderate: 12...25, hard: 20...45,
              formCue: "Body straight, chest to near the floor.",
              easierOption: "Knee push-ups or hands on a bench/wall"),

        .init(name: "Air squats", unit: .reps,
              easy: 10...25, moderate: 20...45, hard: 40...80,
              formCue: "Hips back, knees track over toes.",
              easierOption: "Chair squats (sit-to-stand)"),

        .init(name: "Burpees", unit: .reps,
              easy: 3...8, moderate: 6...15, hard: 12...25,
              formCue: "Smooth pace—don’t sprint the first rep.",
              easierOption: "Step back instead of jumping; skip the push-up"),

        .init(name: "Jumping jacks", unit: .reps,
              easy: 20...40, moderate: 35...70, hard: 60...120,
              formCue: "Light feet, steady breathing.",
              easierOption: "Step jacks (no jumping)"),

        .init(name: "Mountain climbers", unit: .reps,
              easy: 20...40, moderate: 35...80, hard: 70...140,
              formCue: "Hands under shoulders; drive knees fast.",
              easierOption: "Slow climbers or hands on a bench"),

        .init(name: "Reverse lunges", unit: .reps,
              easy: 8...16, moderate: 14...30, hard: 26...50,
              formCue: "Tall torso. Control the bottom.",
              easierOption: "Hold a wall/chair for balance"),

        .init(name: "High knees", unit: .seconds,
              easy: 15...30, moderate: 25...45, hard: 40...75,
              formCue: "Drive knees up; pump arms.",
              easierOption: "March in place fast (no jumping)"),

        .init(name: "Plank", unit: .seconds,
              easy: 20...40, moderate: 35...60, hard: 55...120,
              formCue: "Squeeze glutes; don’t sag.",
              easierOption: "Plank on knees or elevated plank")
    ]

    static func makeWorkout(allowedDifficulties: Set<Difficulty>, beginnerFriendly: Bool) -> Workout {
        let difficulty = allowedDifficulties.randomElement() ?? .moderate
        let template = templates.randomElement() ?? templates[0]

        let amount: Int = {
            switch difficulty {
            case .easy: return Int.random(in: template.easy)
            case .moderate: return Int.random(in: template.moderate)
            case .hard: return Int.random(in: template.hard)
            }
        }()

        let title: String = template.unit == .reps ? "\(amount) \(template.name)" : "\(amount)s \(template.name)"
        let mainLine: String = template.unit == .reps
            ? "Do \(amount) \(template.name.lowercased())."
            : "Do \(template.name.lowercased()) for \(amount) seconds."

        var steps: [String] = [mainLine, template.formCue]
        if beginnerFriendly, let easier = template.easierOption {
            steps.append("Beginner option: \(easier).")
        }
        steps.append("Done? Tap ✅ for the next one.")

        return Workout(title: title, minutes: 1, difficulty: difficulty, equipment: .none, steps: steps)
    }

    static func promptLine(allowedDifficulties: Set<Difficulty>, beginnerFriendly: Bool) -> String {
        let difficulty = allowedDifficulties.randomElement() ?? .moderate
        let template = templates.randomElement() ?? templates[0]
        let amount: Int = {
            switch difficulty {
            case .easy: return Int.random(in: template.easy)
            case .moderate: return Int.random(in: template.moderate)
            case .hard: return Int.random(in: template.hard)
            }
        }()
        let base = template.unit == .reps ? "\(amount) \(template.name)" : "\(amount)s \(template.name)"
        if beginnerFriendly, let easier = template.easierOption {
            return "\(base) (option: \(easier))"
        }
        return base
    }
}
