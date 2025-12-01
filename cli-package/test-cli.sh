#!/bin/bash

# Quick Test Script for @gufran/expo-boilerplate CLI
# This script tests the CLI tool locally before publishing

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🧪 Testing @gufran/expo-boilerplate CLI                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
TEST_PROJECT_NAME="test-expo-app"
TEST_BUNDLE_ID="com.test.expoapp"

echo -e "${CYAN}📦 Step 1: Installing CLI dependencies${NC}"
cd "$(dirname "$0")"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${CYAN}🔗 Step 2: Linking CLI locally${NC}"
npm link
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to link CLI${NC}"
    exit 1
fi
echo -e "${GREEN}✅ CLI linked successfully${NC}"
echo ""

echo -e "${CYAN}🏗️  Step 3: Creating test project${NC}"
cd ..
create-gufran-expo-app "$TEST_PROJECT_NAME" -b "$TEST_BUNDLE_ID" --skip-install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create test project${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Test project created${NC}"
echo ""

echo -e "${CYAN}🔍 Step 4: Verifying project structure${NC}"

# Check if directory exists
if [ ! -d "$TEST_PROJECT_NAME" ]; then
    echo -e "${RED}❌ Project directory not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Project directory exists${NC}"

# Check critical files
FILES_TO_CHECK=(
    "$TEST_PROJECT_NAME/package.json"
    "$TEST_PROJECT_NAME/app.json"
    "$TEST_PROJECT_NAME/App.tsx"
    "$TEST_PROJECT_NAME/src/index.ts"
    "$TEST_PROJECT_NAME/android/app/build.gradle"
    "$TEST_PROJECT_NAME/ios/Podfile"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        exit 1
    fi
done
echo ""

echo -e "${CYAN}📝 Step 5: Verifying configurations${NC}"

# Check package.json
if grep -q "\"name\": \"$TEST_PROJECT_NAME\"" "$TEST_PROJECT_NAME/package.json"; then
    echo -e "${GREEN}✅ package.json has correct project name${NC}"
else
    echo -e "${RED}❌ package.json project name is incorrect${NC}"
    exit 1
fi

# Check app.json
if grep -q "\"name\": \"$TEST_PROJECT_NAME\"" "$TEST_PROJECT_NAME/app.json"; then
    echo -e "${GREEN}✅ app.json has correct project name${NC}"
else
    echo -e "${RED}❌ app.json project name is incorrect${NC}"
    exit 1
fi

if grep -q "\"bundleIdentifier\": \"$TEST_BUNDLE_ID\"" "$TEST_PROJECT_NAME/app.json"; then
    echo -e "${GREEN}✅ app.json has correct iOS bundle ID${NC}"
else
    echo -e "${RED}❌ app.json iOS bundle ID is incorrect${NC}"
    exit 1
fi

if grep -q "\"package\": \"$TEST_BUNDLE_ID\"" "$TEST_PROJECT_NAME/app.json"; then
    echo -e "${GREEN}✅ app.json has correct Android package name${NC}"
else
    echo -e "${RED}❌ app.json Android package name is incorrect${NC}"
    exit 1
fi
echo ""

echo -e "${CYAN}🧹 Step 6: Cleaning up${NC}"
rm -rf "$TEST_PROJECT_NAME"
echo -e "${GREEN}✅ Test project removed${NC}"
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║   ✅ All tests passed! CLI is working correctly!         ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo "  1. Review the changes in createApp.js"
echo "  2. Update the version in package.json if needed"
echo "  3. Update CHANGELOG.md"
echo "  4. Run: npm publish --access public"
echo ""
echo -e "${YELLOW}To unlink the CLI after testing:${NC}"
echo "  npm unlink -g create-gufran-expo-app"
echo ""
