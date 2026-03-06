import Foundation

public enum iFlowChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(iFlowChatEventPayload)
    case agent(iFlowAgentEventPayload)
    case seqGap
}

public protocol iFlowChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> iFlowChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [iFlowChatAttachmentPayload]) async throws -> iFlowChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> iFlowChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<iFlowChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension iFlowChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "iFlowChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> iFlowChatSessionsListResponse {
        throw NSError(
            domain: "iFlowChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
