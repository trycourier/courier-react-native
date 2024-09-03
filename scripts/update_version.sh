#!/bin/bash

# Change to the root directory
cd "$(dirname "$0")/.." || { echo "Failed to change to root directory"; exit 1; }

# Function to read the current version from package.json
get_current_version() {
    node -p -e "require('./package.json').version"
}

# Function to update the version in package.json
update_version() {
    local new_version=$1

    # Update the version in package.json
    npm version "$new_version" --no-git-tag-version
}

# Main script execution

# Get the current version
current_version=$(get_current_version)
echo "Current version: $current_version"

# Parse the current version
IFS='.' read -ra version_parts <<< "$current_version"
major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}

# Suggest the next version (increment minor version)
suggested_version="$major.$((minor + 1)).0"
echo "Suggested next version: $suggested_version"

# Prompt the user for the new version
read -p "Enter the new version (or press Enter to use suggested version): " user_version
new_version=${user_version:-$suggested_version}

# Ask for confirmation
echo "You entered version $new_version"
read -p "Do you want to update the version in package.json to $new_version? (y/n): " confirmation

if [[ $confirmation == "y" || $confirmation == "Y" ]]; then
    update_version "$new_version"
    echo "Version updated to: $new_version"
else
    echo "Version update canceled."
fi