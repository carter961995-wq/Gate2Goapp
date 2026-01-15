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
}

enum Material: String, CaseIterable, Codable, Hashable, Identifiable {
    case wood = "wood"
    case steel = "steel"
    case chainLink = "chain_link"
    case aluminumBasic = "aluminum_basic"

    var id: String { rawValue }
}

enum SubscriptionTier: String, Codable, Hashable, Identifiable {
    case essential
    case premium

    var id: String { rawValue }
}

struct Money: Codable, Hashable {
    var amountCents: Int
    var currency: String = "USD"
}

enum AddonType: String, Codable, Hashable, Identifiable {
    case keypad
    case dropRod = "drop_rod"
    case latch
    case opener

    var id: String { rawValue }
}

enum OpenerBrand: String, Codable, Hashable, Identifiable {
    case liftmaster
    case ghostControl = "ghost_control"
    case doorking

    var id: String { rawValue }
}

enum OpenerOperatorType: String, Codable, Hashable, Identifiable {
    case slide
    case swing
    case dualSwing = "dual_swing"

    var id: String { rawValue }
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

/// Codable JSON value so we can persist arbitrary `params` cleanly.
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

@Model
final class ProjectModel {
    @Attribute(.unique) var id: String
    var name: String
    var clientName: String?
    var clientPhone: String?
    var clientEmail: String?
    var notes: String?
    /// Local file path in app documents.
    var sitePhotoPath: String
    var createdAt: Date
    var updatedAt: Date

    init(id: String = UUID().uuidString,
         name: String,
         clientName: String? = nil,
         clientPhone: String? = nil,
         clientEmail: String? = nil,
         notes: String? = nil,
         sitePhotoPath: String,
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

    /// Persisted JSON to support “customize everything”.
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

