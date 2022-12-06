# Install Github CLI if needed
brew install gh
gh auth login

# Create Release
PACKAGE_VERSION=$(node -p -e "require('./package.json').version")
echo $PACKAGE_VERSION

# Bump the version
git add .
git commit -m "Bump"
git push

# Add the tag
git tag $PACKAGE_VERSION
git push --tags

# gh release create
gh release create $NODE_VERSION --generate-notes

# Publish to npm
npm publish