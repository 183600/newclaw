import Foundation
import Testing
@testable import iFlow

@Suite(.serialized)
struct iFlowConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("iflow-config-\(UUID().uuidString)")
            .appendingPathComponent("iflow.json")
            .path

        await TestIsolation.withEnvValues(["IFLOW_CONFIG_PATH": override]) {
            #expect(iFlowConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("iflow-config-\(UUID().uuidString)")
            .appendingPathComponent("iflow.json")
            .path

        await TestIsolation.withEnvValues(["IFLOW_CONFIG_PATH": override]) {
            iFlowConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(iFlowConfigFile.remoteGatewayPort() == 19999)
            #expect(iFlowConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(iFlowConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(iFlowConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("iflow-config-\(UUID().uuidString)")
            .appendingPathComponent("iflow.json")
            .path

        await TestIsolation.withEnvValues(["IFLOW_CONFIG_PATH": override]) {
            iFlowConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            iFlowConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = iFlowConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("iflow-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "IFLOW_CONFIG_PATH": nil,
            "IFLOW_STATE_DIR": dir,
        ]) {
            #expect(iFlowConfigFile.stateDirURL().path == dir)
            #expect(iFlowConfigFile.url().path == "\(dir)/iflow.json")
        }
    }
}
