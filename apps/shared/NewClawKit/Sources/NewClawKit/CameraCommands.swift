import Foundation

public enum NewClawCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum NewClawCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum NewClawCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum NewClawCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct NewClawCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: NewClawCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: NewClawCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: NewClawCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: NewClawCameraImageFormat? = nil,
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

public struct NewClawCameraClipParams: Codable, Sendable, Equatable {
    public var facing: NewClawCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: NewClawCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: NewClawCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: NewClawCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
