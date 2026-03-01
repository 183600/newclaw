import Foundation

public enum NewClawChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(NewClawChatEventPayload)
    case agent(NewClawAgentEventPayload)
    case seqGap
}

public protocol NewClawChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> NewClawChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [NewClawChatAttachmentPayload]) async throws -> NewClawChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> NewClawChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<NewClawChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension NewClawChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "NewClawChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> NewClawChatSessionsListResponse {
        throw NSError(
            domain: "NewClawChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
