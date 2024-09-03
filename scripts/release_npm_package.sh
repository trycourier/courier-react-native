#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")/.." || exit 1

# Publish to NPM
echo "🚀 Publishing to NPM..."
yarn release

echo "✅ NPM package released successfully"