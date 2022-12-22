#!/bin/bash

# Check if gh is installed via brew
if ! command -v gh > /dev/null; then
  echo "gh is not installed. Installing now..."
  brew install gh
fi

# Login to github
gh auth login

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