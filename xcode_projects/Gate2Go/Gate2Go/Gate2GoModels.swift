//
//  Gate2GoModels.swift
//  Gate2Go
//

import Foundation
import SwiftData

enum GateStyle: String, CaseIterable, Codable, Hashable, Identifiable {
    case cantileverSlide = "cantilever_slide"
    case singleSwing = "single_swing"
    case doubleSwing = "double_swing"
    case rollGate = "roll_gate"
    case overheadTrack = "overhead_track"
    case verticalPivot = "vertical_pivot"

    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .cantileverSlide: return "Cantilever Slide"
        case .singleSwing: return "Single Swing"
        case .doubleSwing: return "Double Swing"
        case .rollGate: return "Roll Gate"
        case .overheadTrack: return "Overhead Track"
        case .verticalPivot: return "Vertical Pivot"
        }
    }
    
    var imageName: String {
        return rawValue
    }
    
    var isPremium: Bool {
        switch self {
        case .cantileverSlide, .overheadTrack, .verticalPivot: return true
        case .singleSwing, .doubleSwing, .rollGate: return false
        }
    }
}

extension GateStyle {
    var defaultOpenerType: OpenerOperatorType {
        switch self {
        case .singleSwing: return .swing
        case .doubleSwing: return .dualSwing
        case .cantileverSlide: return .cantileverSlide
        case .rollGate: return .rollGate
        case .overheadTrack: return .overheadTrack
        case .verticalPivot: return .verticalPivot
        }
    }
}

enum Material: String, CaseIterable, Codable, Hashable, Identifiable {
    case wood = "wood"
    case steel = "steel"
    case chainLink = "chain_link"
    case aluminum = "aluminum"

    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .wood: return "Wood"
        case .steel: return "Steel"
        case .chainLink: return "Chain Link"
        case .aluminum: return "Aluminum"
        }
    }
    
    var cardIcon: String {
        switch self {
        case .wood: return "leaf"
        case .steel: return "hammer"
        case .chainLink: return "link"
        case .aluminum: return "square.3.layers.3d"
        }
    }
}

struct Money: Codable, Hashable {
    var amountCents: Int
    var currency: String = "USD"
}

enum AddonType: String, CaseIterable, Codable, Hashable, Identifiable {
    case keypad
    case dropRod = "drop_rod"
    case latch
    case opener

    var id: String { rawValue }
    
    var displayName: String {
        switch self {
        case .keypad: return "Keypad"
        case .dropRod: return "Drop Rod"
        case .latch: return "Latch"
        case .opener: return "Gate Opener"
        }
    }
}

enum OpenerBrand: String, CaseIterable, Codable, Hashable, Identifiable {
    case liftmaster
    case ghostControl = "ghost_control"
    case doorking

    var id: String { rawValue }
}

enum OpenerOperatorType: String, CaseIterable, Codable, Hashable, Identifiable {
    case swing
    case dualSwing = "dual_swing"
    case cantileverSlide = "cantilever_slide"
    case rollGate = "roll_gate"
    case overheadTrack = "overhead_track"
    case verticalPivot = "vertical_pivot"

    var id: String { rawValue }
}

extension OpenerOperatorType {
    var displayName: String {
        switch self {
        case .swing: return "Single Swing"
        case .dualSwing: return "Dual Swing"
        case .cantileverSlide: return "Cantilever Slide"
        case .rollGate: return "Roll Gate"
        case .overheadTrack: return "Overhead Track"
        case .verticalPivot: return "Vertical Pivot"
        }
    }

    var defaultCostCents: Int {
        switch self {
        case .swing: return 110_000
        case .dualSwing: return 250_000
        case .cantileverSlide, .rollGate: return 300_000
        case .overheadTrack: return 200_000
        case .verticalPivot: return 420_000
        }
    }
}

struct AddonLineItem: Identifiable, Codable, Hashable {
    var id: String
    var type: AddonType
    var title: String

    var brand: OpenerBrand?
    var operatorType: OpenerOperatorType?

    var quantity: Int
    var contractorCost: Money
    var nationalAvgPlaceholder: Money?
    var notes: String?

    init(id: String = UUID().uuidString,
         type: AddonType,
         title: String,
         brand: OpenerBrand? = nil,
         operatorType: OpenerOperatorType? = nil,
         quantity: Int = 1,
         contractorCost: Money,
         nationalAvgPlaceholder: Money? = nil,
         notes: String? = nil) {
        self.id = id
        self.type = type
        self.title = title
        self.brand = brand
        self.operatorType = operatorType
        self.quantity = quantity
        self.contractorCost = contractorCost
        self.nationalAvgPlaceholder = nationalAvgPlaceholder
        self.notes = notes
    }
}

enum JSONValue: Codable, Hashable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case object([String: JSONValue])
    case array([JSONValue])
    case null

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let b = try? container.decode(Bool.self) {
            self = .bool(b)
        } else if let d = try? container.decode(Double.self) {
            self = .number(d)
        } else if let s = try? container.decode(String.self) {
            self = .string(s)
        } else if let o = try? container.decode([String: JSONValue].self) {
            self = .object(o)
        } else if let a = try? container.decode([JSONValue].self) {
            self = .array(a)
        } else {
            self = .null
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .string(let s): try container.encode(s)
        case .number(let d): try container.encode(d)
        case .bool(let b): try container.encode(b)
        case .object(let o): try container.encode(o)
        case .array(let a): try container.encode(a)
        case .null: try container.encodeNil()
        }
    }
}

// Designer customization enums
enum GatePicketOrientation: String, CaseIterable, Codable, Identifiable {
    case vertical, horizontal
    var id: String { rawValue }
    var displayName: String { rawValue.capitalized }
}

enum GateFinialStyle: String, CaseIterable, Codable, Identifiable {
    case none, spear, ball, fleurDeLis, trident
    var id: String { rawValue }
    var displayName: String {
        switch self {
        case .none: return "None"
        case .spear: return "Spear"
        case .ball: return "Ball"
        case .fleurDeLis: return "Fleur-de-lis"
        case .trident: return "Trident"
        }
    }
}

enum GateArchStyle: String, CaseIterable, Codable, Identifiable {
    case flat, convex, concave, doubleArch
    var id: String { rawValue }
    var displayName: String {
        switch self {
        case .flat: return "Flat"
        case .convex: return "Arched Up"
        case .concave: return "Arched Down"
        case .doubleArch: return "Double Arch"
        }
    }
}

enum LatchStyle: String, CaseIterable, Codable, Identifiable {
    case none
    case standard
    case magnetic
    case keyed
    case thumb
    case custom

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .none: return "None"
        case .standard: return "Standard"
        case .magnetic: return "Magnetic"
        case .keyed: return "Keyed"
        case .thumb: return "Thumb Latch"
        case .custom: return "Custom"
        }
    }
}

enum CutoutMode: String, CaseIterable, Codable, Identifiable {
    case none
    case text
    case image
    case textAndImage = "text_and_image"

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .none: return "None"
        case .text: return "Text"
        case .image: return "Image"
        case .textAndImage: return "Text + Image"
        }
    }
}

enum CutoutPlacement: String, CaseIterable, Codable, Identifiable {
    case center
    case topRail = "top_rail"
    case crest

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .center: return "Center"
        case .topRail: return "Top Rail"
        case .crest: return "Crest"
        }
    }
}

@Model
final class ProjectModel {
    @Attribute(.unique) var id: String
    var name: String
    var clientName: String?
    var clientPhone: String?
    var clientEmail: String?
    var notes: String?
    var sitePhotoPath: String?
    var createdAt: Date
    var updatedAt: Date

    init(id: String = UUID().uuidString,
         name: String,
         clientName: String? = nil,
         clientPhone: String? = nil,
         clientEmail: String? = nil,
         notes: String? = nil,
         sitePhotoPath: String? = nil,
         createdAt: Date = Date(),
         updatedAt: Date = Date()) {
        self.id = id
        self.name = name
        self.clientName = clientName
        self.clientPhone = clientPhone
        self.clientEmail = clientEmail
        self.notes = notes
        self.sitePhotoPath = sitePhotoPath
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

@Model
final class GateDesignModel {
    @Attribute(.unique) var id: String
    var projectId: String

    var gateStyleRaw: String
    var materialRaw: String

    var widthFeet: Double
    var heightFeet: Double

    var paramsData: Data
    var addonsData: Data

    var basePriceCents: Int
    var totalPriceCents: Int

    var generatedImagePath: String?
    var thumbnailPath: String?

    var selectedByClient: Bool
    var createdAt: Date
    var updatedAt: Date

    init(id: String = UUID().uuidString,
         projectId: String,
         gateStyle: GateStyle,
         material: Material,
         widthFeet: Double,
         heightFeet: Double,
         params: [String: JSONValue] = [:],
         addons: [AddonLineItem] = [],
         basePriceCents: Int,
         totalPriceCents: Int,
         generatedImagePath: String? = nil,
         thumbnailPath: String? = nil,
         selectedByClient: Bool = false,
         createdAt: Date = Date(),
         updatedAt: Date = Date()) {
        self.id = id
        self.projectId = projectId
        self.gateStyleRaw = gateStyle.rawValue
        self.materialRaw = material.rawValue
        self.widthFeet = widthFeet
        self.heightFeet = heightFeet
        self.paramsData = (try? JSONEncoder().encode(params)) ?? Data()
        self.addonsData = (try? JSONEncoder().encode(addons)) ?? Data()
        self.basePriceCents = basePriceCents
        self.totalPriceCents = totalPriceCents
        self.generatedImagePath = generatedImagePath
        self.thumbnailPath = thumbnailPath
        self.selectedByClient = selectedByClient
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

extension GateDesignModel {
    var gateStyle: GateStyle {
        get { GateStyle(rawValue: gateStyleRaw) ?? .singleSwing }
        set { gateStyleRaw = newValue.rawValue }
    }

    var material: Material {
        get { Material(rawValue: materialRaw) ?? .steel }
        set { materialRaw = newValue.rawValue }
    }

    var params: [String: JSONValue] {
        get { (try? JSONDecoder().decode([String: JSONValue].self, from: paramsData)) ?? [:] }
        set { paramsData = (try? JSONEncoder().encode(newValue)) ?? Data() }
    }

    var addons: [AddonLineItem] {
        get { (try? JSONDecoder().decode([AddonLineItem].self, from: addonsData)) ?? [] }
        set { addonsData = (try? JSONEncoder().encode(newValue)) ?? Data() }
    }
}

// Type aliases for compatibility
typealias Project = ProjectModel
typealias GateDesign = GateDesignModel
