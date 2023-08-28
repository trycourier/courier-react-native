#!/bin/bash

# Check if Homebrew is installed
if ! which brew >/dev/null 2>&1; then
    echo "⚠️ Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

echo "✅ Homebrew is installed.\n"

# Install the Github CLI
if ! brew list gh >/dev/null 2>&1; then
    echo "⚠️ GitHub CLI not found. Installing via Homebrew...\n"
    brew install gh
fi

echo "✅ GitHub CLI version $(gh --version) is installed.\n"

# Create Release
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
echo $PACKAGE_VERSION

# Bump the version
git add .
git commit -m "Bump" --no-verify
git push

# Add the tag
git tag $PACKAGE_VERSION
git push --tags

# gh release create
gh release create $NODE_VERSION --generate-notes

# Publish to npm
npm publish