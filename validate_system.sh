#!/bin/bash

# Quick Validation Script for MCP Orchestrator
# Validates data isolation and query support

echo "🔍 MCP Orchestrator - Quick Validation"
echo "======================================"

echo ""
echo "🧪 Running Data Isolation Test..."
npx ts-node test_data_isolation.ts | tail -10

echo ""
echo "🧪 Running Full Support Test..."
npx ts-node test_full_support.ts | tail -15

echo ""
echo "🏗️ Building Project..."
npm run build

echo ""
echo "✅ Validation Complete"
echo "If all tests pass, the system maintains:"
echo "  - Zero data contamination"
echo "  - Full query support (email, phone, name)"
echo "  - Real data only (no fallbacks)"
echo "  - Production readiness"
