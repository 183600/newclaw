// Test the env module fix
import {
  logAcceptedEnvOption,
  _resetLoggedEnvForTesting,
  normalizeZaiEnv,
} from "./src/infra/env.js";

// Mock process.env for testing
const originalEnv = process.env;
process.env = { ...originalEnv };

// Test 1: Basic logging
console.log("Test 1: Basic logging");
_resetLoggedEnvForTesting();
process.env.TEST_OPTION = "test-value";
logAcceptedEnvOption({
  key: "TEST_OPTION",
  description: "Test option",
});

// Test 2: Don't log the same key twice
console.log("\nTest 2: Don't log the same key twice");
logAcceptedEnvOption({
  key: "TEST_OPTION",
  description: "Test option",
});

// Test 3: Don't log empty values
console.log("\nTest 3: Don't log empty values");
_resetLoggedEnvForTesting();
process.env.EMPTY_VALUE = "";
logAcceptedEnvOption({
  key: "EMPTY_VALUE",
  description: "Empty value",
});

// Test 4: Test normalizeZaiEnv
console.log("\nTest 4: Test normalizeZaiEnv");
process.env.Z_AI_API_KEY = "test-key";
process.env.ZAI_API_KEY = "";
normalizeZaiEnv();
console.log("ZAI_API_KEY after normalizeZaiEnv:", process.env.ZAI_API_KEY);

// Restore process.env
process.env = originalEnv;
