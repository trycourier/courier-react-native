#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

# Pack the build
echo "📦 Packing the build..."
yarn prepack

# Publish to NPM
echo "🚀 Publishing to NPM..."
npm publish

echo "✅ NPM package released successfully"