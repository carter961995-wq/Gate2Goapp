import SwiftUI
import SwiftData

// MARK: - Gate Styles
enum GateStyle: String, CaseIterable, Codable {
    case singleSwing = "single_swing"
    case doubleSwing = "double_swing"
    case rollGate = "roll_gate"
    case cantileverSlide = "cantilever_slide"
    case overheadTrack = "overhead_track"
    case verticalPivot = "vertical_pivot"
    
    var displayName: String {
        switch self {
        case .singleSwing: return "Single Swing"
        case .doubleSwing: return "Double Swing"
        case .rollGate: return "Roll Gate"
        case .cantileverSlide: return "Cantilever Slide"
        case .overheadTrack: return "Overhead Track"
        case .verticalPivot: return "Vertical Pivot"
        }
    }
    
    var tier: ProductTier {
        switch self {
        case .singleSwing, .doubleSwing, .rollGate:
            return .essential
        case .cantileverSlide, .overheadTrack, .verticalPivot:
            return .premium
        }
    }
    
    var imageName: String {
        rawValue
    }
}

// MARK: - Materials
enum Material: String, CaseIterable, Codable {
    case wood
    case steel
    case chainLink = "chain_link"
    case aluminum
    
    var displayName: String {
        switch self {
        case .wood: return "Wood"
        case .steel: return "Steel"
        case .chainLink: return "Chain Link"
        case .aluminum: return "Aluminum"
        }
    }
    
    var tier: ProductTier {
        switch self {
        case .wood, .steel:
            return .essential
        case .chainLink, .aluminum:
            return .premium
        }
    }
    
    var icon: String {
        switch self {
        case .wood: return "leaf"
        case .steel: return "hammer"
        case .chainLink: return "link"
        case .aluminum: return "square.stack.3d.up"
        }
    }
}

// MARK: - Product Tier
enum ProductTier: String, Codable {
    case essential
    case premium
}

// MARK: - Design Parameters
enum PicketOrientation: String, CaseIterable, Codable {
    case vertical
    case horizontal
    case diagonal
    
    var displayName: String {
        rawValue.capitalized
    }
}

enum FinialStyle: String, CaseIterable, Codable {
    case none
    case spear
    case ball
    case fleurDeLis = "fleur_de_lis"
    
    var displayName: String {
        switch self {
        case .none: return "None"
        case .spear: return "Spear"
        case .ball: return "Ball"
        case .fleurDeLis: return "Fleur-de-Lis"
        }
    }
}

enum ArchStyle: String, CaseIterable, Codable {
    case flat
    case singleArch = "single_arch"
    case doubleArch = "double_arch"
    case concave
    
    var displayName: String {
        switch self {
        case .flat: return "Flat"
        case .singleArch: return "Single Arch"
        case .doubleArch: return "Double Arch"
        case .concave: return "Concave"
        }
    }
    
    var description: String {
        switch self {
        case .flat: return "Straight top edge"
        case .singleArch: return "Curved upward"
        case .doubleArch: return "Two curved sections"
        case .concave: return "Curved downward"
        }
    }
}

// MARK: - Add-ons
enum AddOnType: String, CaseIterable, Codable {
    case keypad
    case latch
    case gateOpener = "gate_opener"
    case hinges
    case wheels
    case lock
    
    var displayName: String {
        switch self {
        case .keypad: return "Keypad Entry"
        case .latch: return "Heavy Duty Latch"
        case .gateOpener: return "Automatic Opener"
        case .hinges: return "Commercial Hinges"
        case .wheels: return "Heavy Duty Wheels"
        case .lock: return "Security Lock"
        }
    }
    
    var icon: String {
        switch self {
        case .keypad: return "keyboard"
        case .latch: return "lock.open"
        case .gateOpener: return "gear"
        case .hinges: return "arrow.left.and.right"
        case .wheels: return "circle"
        case .lock: return "lock"
        }
    }
    
    var defaultPriceCents: Int {
        switch self {
        case .keypad: return 15000
        case .latch: return 5000
        case .gateOpener: return 75000
        case .hinges: return 8000
        case .wheels: return 12000
        case .lock: return 3500
        }
    }
}

struct AddOnLineItem: Codable, Identifiable, Hashable {
    var id = UUID()
    var type: AddOnType
    var quantity: Int
    var contractorCostCents: Int
    var customerPriceCents: Int
    
    init(type: AddOnType, quantity: Int = 1) {
        self.type = type
        self.quantity = quantity
        self.contractorCostCents = type.defaultPriceCents
        self.customerPriceCents = Int(Double(type.defaultPriceCents) * 1.3)
    }
}

// MARK: - SwiftData Models
@Model
final class ProjectModel {
    var id: UUID
    var clientName: String
    var clientPhone: String
    var clientEmail: String
    var siteAddress: String
    var sitePhotoData: Data?
    var notes: String
    var createdAt: Date
    var updatedAt: Date
    
    @Relationship(deleteRule: .cascade) var designs: [GateDesignModel]?
    
    init(clientName: String = "", clientPhone: String = "", clientEmail: String = "", siteAddress: String = "", notes: String = "") {
        self.id = UUID()
        self.clientName = clientName
        self.clientPhone = clientPhone
        self.clientEmail = clientEmail
        self.siteAddress = siteAddress
        self.notes = notes
        self.createdAt = Date()
        self.updatedAt = Date()
    }
}

@Model
final class GateDesignModel {
    var id: UUID
    var gateStyle: String
    var material: String
    var widthFeet: Int
    var heightFeet: Int
    var picketOrientation: String
    var finialStyle: String
    var archStyle: String
    var archHeight: Int
    var addonsData: Data?
    var basePriceCents: Int
    var laborCents: Int
    var markupPercent: Double
    var taxPercent: Double
    var totalPriceCents: Int
    var generatedImageData: Data?
    var selectedByClient: Bool
    var createdAt: Date
    var updatedAt: Date
    
    var project: ProjectModel?
    
    init() {
        self.id = UUID()
        self.gateStyle = GateStyle.singleSwing.rawValue
        self.material = Material.steel.rawValue
        self.widthFeet = 12
        self.heightFeet = 6
        self.picketOrientation = PicketOrientation.vertical.rawValue
        self.finialStyle = FinialStyle.none.rawValue
        self.archStyle = ArchStyle.flat.rawValue
        self.archHeight = 20
        self.basePriceCents = 0
        self.laborCents = 50000
        self.markupPercent = 30
        self.taxPercent = 0
        self.totalPriceCents = 0
        self.selectedByClient = false
        self.createdAt = Date()
        self.updatedAt = Date()
    }
    
    var addons: [AddOnLineItem] {
        get {
            guard let data = addonsData else { return [] }
            return (try? JSONDecoder().decode([AddOnLineItem].self, from: data)) ?? []
        }
        set {
            addonsData = try? JSONEncoder().encode(newValue)
        }
    }
}
