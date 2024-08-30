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

# Suggest the next version
suggested_version=$(npm version patch --no-git-tag-version)
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