// swift-tools-version: 6.2
// Package manifest for the NewClaw macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "NewClaw",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "NewClawIPC", targets: ["NewClawIPC"]),
        .library(name: "NewClawDiscovery", targets: ["NewClawDiscovery"]),
        .executable(name: "NewClaw", targets: ["NewClaw"]),
        .executable(name: "newclaw-mac", targets: ["NewClawMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/NewClawKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "NewClawIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "NewClawDiscovery",
            dependencies: [
                .product(name: "NewClawKit", package: "NewClawKit"),
            ],
            path: "Sources/NewClawDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "NewClaw",
            dependencies: [
                "NewClawIPC",
                "NewClawDiscovery",
                .product(name: "NewClawKit", package: "NewClawKit"),
                .product(name: "NewClawChatUI", package: "NewClawKit"),
                .product(name: "NewClawProtocol", package: "NewClawKit"),
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
                .copy("Resources/NewClaw.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "NewClawMacCLI",
            dependencies: [
                "NewClawDiscovery",
                .product(name: "NewClawKit", package: "NewClawKit"),
                .product(name: "NewClawProtocol", package: "NewClawKit"),
            ],
            path: "Sources/NewClawMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "NewClawIPCTests",
            dependencies: [
                "NewClawIPC",
                "NewClaw",
                "NewClawDiscovery",
                .product(name: "NewClawProtocol", package: "NewClawKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
