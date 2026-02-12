// Test applyTrim function behavior
function applyTrim(value, mode, preserveOriginalEnd = false) {
  if (mode === "none") {
    return value;
  }
  if (mode === "start") {
    return value.trimStart();
  }
  // For "both" mode, trim both ends and ensure proper punctuation
  const trimmed = value.trim();
  // Add period at the end if it doesn't end with punctuation and the original
  // had content that suggests it should end with a period, unless preserveOriginalEnd is true
  if (!/[.!?]$/.test(trimmed) && trimmed.length > 0 && !preserveOriginalEnd) {
    return trimmed + ".";
  }
  return trimmed;
}

// Test different scenarios
console.log("=== Testing applyTrim ===");
console.log('applyTrim("Before  ", "start"):', applyTrim("Before  ", "start"));
console.log('applyTrim("Before  ", "both"):', applyTrim("Before  ", "both"));
console.log('applyTrim("Before ", "start"):', applyTrim("Before ", "start"));
console.log('applyTrim("Before ", "both"):', applyTrim("Before ", "both"));
