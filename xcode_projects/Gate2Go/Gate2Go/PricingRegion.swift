import Foundation

enum PricingRegion: String, CaseIterable, Identifiable {
    case national
    case northeast
    case southeast
    case midwest
    case southwest
    case mountainWest = "mountain_west"
    case westCoast = "west_coast"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .national: return "National Average"
        case .northeast: return "Northeast"
        case .southeast: return "Southeast"
        case .midwest: return "Midwest"
        case .southwest: return "Southwest"
        case .mountainWest: return "Mountain West"
        case .westCoast: return "West Coast"
        }
    }

    var multiplier: Double {
        switch self {
        case .national: return 1.0
        case .northeast: return 1.18
        case .southeast: return 0.95
        case .midwest: return 0.92
        case .southwest: return 0.97
        case .mountainWest: return 1.03
        case .westCoast: return 1.22
        }
    }
}
