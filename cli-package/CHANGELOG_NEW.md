# 🎉 New CLI Features - Major Update

## What's New in This Version

### ✨ Key Improvements

#### 1. **No More Git Clone** 🚀
- **Before**: CLI cloned the entire repository from GitHub
- **Now**: CLI copies files directly from the boilerplate template
- **Benefits**:
  - ⚡ Much faster project creation
  - 🔌 Works offline (no internet required)
  - 📦 Smaller package size
  - 🎯 More reliable and predictable

#### 2. **Bundle ID Configuration** 📱
- **New Feature**: Specify bundle identifier during project creation
- **Usage**: `npx @gufran/expo-boilerplate my-app -b com.company.app`
- **Interactive**: Prompts for bundle ID if not provided
- **Automatic**: Updates both iOS and Android bundle IDs in `app.json`

#### 3. **Enhanced Interactive Mode** 💬
- Prompts for project name
- Prompts for bundle identifier
- Validates both inputs
- Provides helpful error messages

## Breaking Changes

⚠️ **Important**: This version changes how projects are created

### Migration from Old Version

If you were using the old version:

**Old Way** (Git Clone):
```bash
npx @gufran/expo-boilerplate my-app
# Would clone from GitHub
```

**New Way** (Direct Copy):
```bash
npx @gufran/expo-boilerplate my-app -b com.mycompany.myapp
# Copies files directly, sets bundle ID
```

### What Stays the Same

- All existing command-line options still work
- `--skip-install` to skip dependency installation
- `--skip-git` to skip git initialization
- `--npm` to use npm instead of yarn
- Project structure remains identical
- All features and dependencies included

## New Command Options

### Bundle ID Option
```bash
-b, --bundle-id <bundleId>    Bundle identifier (e.g., com.company.appname)
```

### Usage Examples

#### 1. Full Command Line
```bash
npx @gufran/expo-boilerplate MyAwesomeApp -b com.mycompany.awesome
```

#### 2. Interactive Mode (Recommended)
```bash
npx @gufran/expo-boilerplate
# Will prompt for:
# - Project name
# - Bundle identifier
```

#### 3. With Additional Options
```bash
npx @gufran/expo-boilerplate MyApp -b com.company.myapp --npm --skip-git
```

#### 4. Project Name Only (Will Prompt for Bundle ID)
```bash
npx @gufran/expo-boilerplate MyApp
# Will prompt for bundle ID
```

## What Gets Updated Automatically

When you create a project, the CLI now updates:

### 1. package.json
```json
{
  "name": "your-project-name",
  "version": "1.0.0"
}
```

### 2. app.json
```json
{
  "expo": {
    "name": "your-project-name",
    "slug": "your-project-name",
    "ios": {
      "bundleIdentifier": "com.company.yourapp"
    },
    "android": {
      "package": "com.company.yourapp"
    }
  }
}
```

## Implementation Details

### File Copying Strategy

The new implementation:
1. Creates project directory
2. Copies all files from boilerplate template
3. Excludes unnecessary directories:
   - `node_modules`
   - `.git`
   - `cli-package`
   - `build` directories
   - IDE files
   - `Pods` (iOS dependencies)
4. Updates configuration files
5. Installs dependencies
6. Initializes git (optional)

### Bundle ID Validation

The CLI validates bundle IDs to ensure they follow the correct format:
- Must start with a letter
- Can contain letters, numbers, and dots
- Must have at least one dot (e.g., `com.company.app`)
- Case-insensitive validation
- Provides helpful error messages

### Project Name Validation

Uses npm package name validation:
- Checks for valid npm package name format
- Prevents reserved names
- Provides detailed error messages
- Ensures cross-platform compatibility

## Testing the New Version

### Local Testing

1. **Setup the CLI**:
   ```bash
   cd cli-package
   npm install
   npm link
   ```

2. **Test Interactive Mode**:
   ```bash
   create-gufran-expo-app
   ```

3. **Test with Options**:
   ```bash
   create-gufran-expo-app TestApp -b com.test.app
   ```

4. **Verify the Output**:
   ```bash
   cd TestApp
   cat package.json    # Check project name
   cat app.json        # Check bundle IDs
   ```

### What to Check

- ✅ Project name updated in `package.json`
- ✅ App name and slug updated in `app.json`
- ✅ iOS bundle identifier set correctly
- ✅ Android package name set correctly
- ✅ All source files copied
- ✅ CLI package not copied
- ✅ node_modules not copied
- ✅ Project installs dependencies successfully
- ✅ Project runs: `npm start`

## Advantages Over Previous Version

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| **Speed** | ~30-60 seconds | ~5-15 seconds |
| **Internet** | Required | Optional |
| **Reliability** | Depends on GitHub | Always works |
| **Bundle ID** | Manual setup | Automatic |
| **Configuration** | Manual editing | Automatic |
| **File Size** | Full git history | Only needed files |
| **Offline Use** | ❌ No | ✅ Yes |

## Future Enhancements

Planned features for future versions:

- [ ] Template variants (TypeScript only, JavaScript, minimal)
- [ ] Custom template URLs
- [ ] Pre-configured themes
- [ ] Database integration options
- [ ] Authentication providers selection
- [ ] Analytics provider selection

## Troubleshooting

### Issue: "Failed to copy template files"

**Solution**: Make sure you're running the CLI from a published npm package or properly linked local package.

### Issue: "Invalid bundle ID format"

**Solution**: Use format `com.company.appname` (lowercase letters, numbers, and dots only).

### Issue: "Project directory already exists"

**Solution**: Choose a different project name or remove the existing directory.

## Version Information

- **Previous Version**: 1.0.0 (Git Clone)
- **Current Version**: 2.0.0 (Direct Copy + Bundle ID)
- **Release Date**: December 2025

## Feedback

We'd love to hear your feedback on the new version!

- 🐛 Report bugs: [GitHub Issues](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran/issues)
- 💡 Suggest features: [GitHub Discussions](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran/discussions)
- ⭐ Star the repo if you find it useful!

---

**Happy Coding! 🚀**
