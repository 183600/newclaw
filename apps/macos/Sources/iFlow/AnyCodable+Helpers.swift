import iFlowKit
import iFlowProtocol
import Foundation

// Prefer the iFlowKit wrapper to keep gateway request payloads consistent.
typealias AnyCodable = iFlowKit.AnyCodable
typealias InstanceIdentity = iFlowKit.InstanceIdentity

extension AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: AnyCodable]? { self.value as? [String: AnyCodable] }
    var arrayValue: [AnyCodable]? { self.value as? [AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}

extension iFlowProtocol.AnyCodable {
    var stringValue: String? { self.value as? String }
    var boolValue: Bool? { self.value as? Bool }
    var intValue: Int? { self.value as? Int }
    var doubleValue: Double? { self.value as? Double }
    var dictionaryValue: [String: iFlowProtocol.AnyCodable]? { self.value as? [String: iFlowProtocol.AnyCodable] }
    var arrayValue: [iFlowProtocol.AnyCodable]? { self.value as? [iFlowProtocol.AnyCodable] }

    var foundationValue: Any {
        switch self.value {
        case let dict as [String: iFlowProtocol.AnyCodable]:
            dict.mapValues { $0.foundationValue }
        case let array as [iFlowProtocol.AnyCodable]:
            array.map(\.foundationValue)
        default:
            self.value
        }
    }
}
