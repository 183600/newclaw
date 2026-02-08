#!/bin/bash
echo "Running simplified test verification..."
echo "======================================="

# Check if we can run individual test files successfully
echo "Testing individual test files..."

# Test 1: Line tests
echo "Running line tests..."
if timeout 30 pnpm vitest run --config vitest.unit.config.ts --no-coverage --maxWorkers=1 src/line/ --reporter=basic 2>/dev/null | grep -q "Test Files.*passed"; then
    echo "✅ Line tests: PASSED"
else
    echo "❌ Line tests: FAILED or TIMEOUT"
fi

# Test 2: Config tests (small subset)
echo "Running config tests..."
if timeout 30 pnpm vitest run --config vitest.unit.config.ts --no-coverage --maxWorkers=1 src/config/ --reporter=basic 2>/dev/null | grep -q "Test Files.*passed"; then
    echo "✅ Config tests: PASSED"
else
    echo "❌ Config tests: FAILED or TIMEOUT"
fi

# Test 3: Extension tests (small subset)
echo "Running extension tests..."
if timeout 30 pnpm vitest run --config vitest.extensions.config.ts --no-coverage --maxWorkers=1 extensions/memory-lancedb/ --reporter=basic 2>/dev/null | grep -q "Test Files.*passed"; then
    echo "✅ Extension tests: PASSED"
else
    echo "❌ Extension tests: FAILED or TIMEOUT"
fi

# Check build
echo "Checking build..."
if pnpm build >/dev/null 2>&1; then
    echo "✅ Build: PASSED"
else
    echo "❌ Build: FAILED"
fi

# Check type checking
echo "Checking types..."
if timeout 30 pnpm tsgo >/dev/null 2>&1; then
    echo "✅ Type checking: PASSED"
else
    echo "❌ Type checking: FAILED or TIMEOUT"
fi

echo "======================================="
echo "Test verification complete."