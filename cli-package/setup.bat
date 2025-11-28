@echo off
REM Setup script for Windows
REM Run this script to prepare the CLI package for testing

echo Setting up CLI package for development...

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js 18+ and try again.
    exit /b 1
)

echo Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed. Please install npm and try again.
    exit /b 1
)

echo npm found
npm --version

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

REM Link package for local testing
echo Linking package globally for testing...
call npm link

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to link package
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo You can now test the CLI by running:
echo   create-gufran-expo-app test-app
echo.
echo To unlink after testing:
echo   npm unlink -g
echo.
echo To publish to npm:
echo   1. Update version: npm version patch^|minor^|major
echo   2. Login to npm: npm login
echo   3. Publish: npm publish --access public
echo.
echo See PUBLISHING.md for detailed publishing instructions
echo.

pause
