#!/bin/bash

# Setup script for local testing and development
# Run this script to prepare the CLI package for testing

set -e

echo "🔧 Setting up CLI package for development..."

# Navigate to cli-package directory
cd "$(dirname "$0")"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Make CLI executable
echo "🔐 Making CLI executable..."
chmod +x bin/cli.js

# Test the package structure
echo "🧪 Testing package structure..."
if [ ! -f "bin/cli.js" ]; then
    echo "❌ bin/cli.js not found!"
    exit 1
fi

if [ ! -f "lib/createApp.js" ]; then
    echo "❌ lib/createApp.js not found!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

echo "✅ Package structure is valid"

# Link package for local testing
echo "🔗 Linking package globally for testing..."
npm link

echo ""
echo "🎉 Setup complete!"
echo ""
echo "You can now test the CLI by running:"
echo "  create-gufran-expo-app test-app"
echo ""
echo "To unlink after testing:"
echo "  npm unlink -g"
echo ""
echo "To publish to npm:"
echo "  1. Update version: npm version patch|minor|major"
echo "  2. Login to npm: npm login"
echo "  3. Publish: npm publish --access public"
echo ""
echo "📚 See PUBLISHING.md for detailed publishing instructions"
echo ""
