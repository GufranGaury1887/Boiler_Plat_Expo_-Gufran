@echo off
REM Quick Test Script for @gufran/expo-boilerplate CLI (Windows)
REM This script tests the CLI tool locally before publishing

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   🧪 Testing @gufran/expo-boilerplate CLI                ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

set TEST_PROJECT_NAME=test-expo-app
set TEST_BUNDLE_ID=com.test.expoapp

echo 📦 Step 1: Installing CLI dependencies
cd /d "%~dp0"
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed
echo.

echo 🔗 Step 2: Linking CLI locally
call npm link
if %errorlevel% neq 0 (
    echo ❌ Failed to link CLI
    exit /b 1
)
echo ✅ CLI linked successfully
echo.

echo 🏗️  Step 3: Creating test project
cd ..
call create-gufran-expo-app %TEST_PROJECT_NAME% -b %TEST_BUNDLE_ID% --skip-install
if %errorlevel% neq 0 (
    echo ❌ Failed to create test project
    exit /b 1
)
echo ✅ Test project created
echo.

echo 🔍 Step 4: Verifying project structure
if not exist "%TEST_PROJECT_NAME%" (
    echo ❌ Project directory not found
    exit /b 1
)
echo ✅ Project directory exists

if not exist "%TEST_PROJECT_NAME%\package.json" (
    echo ❌ Missing: package.json
    exit /b 1
)
echo ✅ Found: package.json

if not exist "%TEST_PROJECT_NAME%\app.json" (
    echo ❌ Missing: app.json
    exit /b 1
)
echo ✅ Found: app.json

if not exist "%TEST_PROJECT_NAME%\App.tsx" (
    echo ❌ Missing: App.tsx
    exit /b 1
)
echo ✅ Found: App.tsx
echo.

echo 📝 Step 5: Verifying configurations
findstr /C:"\"name\": \"%TEST_PROJECT_NAME%\"" "%TEST_PROJECT_NAME%\package.json" >nul
if %errorlevel% equ 0 (
    echo ✅ package.json has correct project name
) else (
    echo ❌ package.json project name is incorrect
    exit /b 1
)

findstr /C:"\"bundleIdentifier\": \"%TEST_BUNDLE_ID%\"" "%TEST_PROJECT_NAME%\app.json" >nul
if %errorlevel% equ 0 (
    echo ✅ app.json has correct iOS bundle ID
) else (
    echo ❌ app.json iOS bundle ID is incorrect
    exit /b 1
)

findstr /C:"\"package\": \"%TEST_BUNDLE_ID%\"" "%TEST_PROJECT_NAME%\app.json" >nul
if %errorlevel% equ 0 (
    echo ✅ app.json has correct Android package name
) else (
    echo ❌ app.json Android package name is incorrect
    exit /b 1
)
echo.

echo 🧹 Step 6: Cleaning up
rmdir /s /q "%TEST_PROJECT_NAME%"
echo ✅ Test project removed
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║   ✅ All tests passed! CLI is working correctly!         ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo Next steps:
echo   1. Review the changes in createApp.js
echo   2. Update the version in package.json if needed
echo   3. Update CHANGELOG.md
echo   4. Run: npm publish --access public
echo.
echo To unlink the CLI after testing:
echo   npm unlink -g create-gufran-expo-app
echo.
pause
