# Install Github CLI if needed
brew install gh
gh auth login

# Get notes
echo "\n"
read -p "What is new in this version: " NOTES

# Create Release
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
echo $PACKAGE_VERSION

# Add the tag
git tag $PACKAGE_VERSION
git push --tags

# gh release create
gh release create $NODE_VERSION --notes $NOTES

# Publish to npm
npm publish