#!/usr/bin/env node

// Simple test for stripReasoningTagsFromText function
import { stripReasoningTagsFromText } from "./dist/shared-Bb947WHB.js";

console.log("=== Testing stripReasoningTagsFromText ===");

// Test 1: think tags
const test1 = "This is think content
This is the actual response.";
console.log("Test 1 input:", JSON.stringify(test1));
console.log("Test 1 output:", JSON.stringify(stripReasoningTagsFromText(test1)));
console.log("Expected:", JSON.stringify("This is the actual response."));
console.log("");

// Test 2: trim none
const test2 = "  <thinking>Thinking</thinking>  Response content  ";
console.log("Test 2 input:", JSON.stringify(test2));
console.log("Test 2 output:", JSON.stringify(stripReasoningTagsFromText(test2, { trim: "none" })));
console.log("Expected:", JSON.stringify("  Response content  "));
console.log("");