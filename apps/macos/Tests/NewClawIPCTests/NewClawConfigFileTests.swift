import Foundation
import Testing
@testable import NewClaw

@Suite(.serialized)
struct NewClawConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("newclaw-config-\(UUID().uuidString)")
            .appendingPathComponent("newclaw.json")
            .path

        await TestIsolation.withEnvValues(["NEWCLAW_CONFIG_PATH": override]) {
            #expect(NewClawConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("newclaw-config-\(UUID().uuidString)")
            .appendingPathComponent("newclaw.json")
            .path

        await TestIsolation.withEnvValues(["NEWCLAW_CONFIG_PATH": override]) {
            NewClawConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(NewClawConfigFile.remoteGatewayPort() == 19999)
            #expect(NewClawConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(NewClawConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(NewClawConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("newclaw-config-\(UUID().uuidString)")
            .appendingPathComponent("newclaw.json")
            .path

        await TestIsolation.withEnvValues(["NEWCLAW_CONFIG_PATH": override]) {
            NewClawConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            NewClawConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = NewClawConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("newclaw-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "NEWCLAW_CONFIG_PATH": nil,
            "NEWCLAW_STATE_DIR": dir,
        ]) {
            #expect(NewClawConfigFile.stateDirURL().path == dir)
            #expect(NewClawConfigFile.url().path == "\(dir)/newclaw.json")
        }
    }
}
