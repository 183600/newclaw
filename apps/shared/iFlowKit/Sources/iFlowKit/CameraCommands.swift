import Foundation

public enum iFlowCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum iFlowCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum iFlowCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum iFlowCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct iFlowCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: iFlowCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: iFlowCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: iFlowCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: iFlowCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct iFlowCameraClipParams: Codable, Sendable, Equatable {
    public var facing: iFlowCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: iFlowCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: iFlowCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: iFlowCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
