// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "iFlowKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "iFlowProtocol", targets: ["iFlowProtocol"]),
        .library(name: "iFlowKit", targets: ["iFlowKit"]),
        .library(name: "iFlowChatUI", targets: ["iFlowChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "iFlowProtocol",
            path: "Sources/iFlowProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "iFlowKit",
            dependencies: [
                "iFlowProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/iFlowKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "iFlowChatUI",
            dependencies: [
                "iFlowKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/iFlowChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "iFlowKitTests",
            dependencies: ["iFlowKit", "iFlowChatUI"],
            path: "Tests/iFlowKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
