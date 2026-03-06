// swift-tools-version: 6.2
// Package manifest for the iFlow macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "iFlow",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "iFlowIPC", targets: ["iFlowIPC"]),
        .library(name: "iFlowDiscovery", targets: ["iFlowDiscovery"]),
        .executable(name: "iFlow", targets: ["iFlow"]),
        .executable(name: "iflow-mac", targets: ["iFlowMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/iFlowKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "iFlowIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "iFlowDiscovery",
            dependencies: [
                .product(name: "iFlowKit", package: "iFlowKit"),
            ],
            path: "Sources/iFlowDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "iFlow",
            dependencies: [
                "iFlowIPC",
                "iFlowDiscovery",
                .product(name: "iFlowKit", package: "iFlowKit"),
                .product(name: "iFlowChatUI", package: "iFlowKit"),
                .product(name: "iFlowProtocol", package: "iFlowKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/iFlow.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "iFlowMacCLI",
            dependencies: [
                "iFlowDiscovery",
                .product(name: "iFlowKit", package: "iFlowKit"),
                .product(name: "iFlowProtocol", package: "iFlowKit"),
            ],
            path: "Sources/iFlowMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "iFlowIPCTests",
            dependencies: [
                "iFlowIPC",
                "iFlow",
                "iFlowDiscovery",
                .product(name: "iFlowProtocol", package: "iFlowKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
