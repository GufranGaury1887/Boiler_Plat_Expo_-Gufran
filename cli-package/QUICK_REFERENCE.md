# 🚀 Quick Reference Card

## Installation & Usage

### Quick Start
```bash
npx @gufran/expo-boilerplate
```

### With Options
```bash
npx @gufran/expo-boilerplate MyApp -b com.company.myapp
```

---

## Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `-b, --bundle-id` | Set bundle identifier | `-b com.company.app` |
| `--npm` | Use npm instead of yarn | `--npm` |
| `--skip-install` | Skip dependency installation | `--skip-install` |
| `--skip-git` | Skip git initialization | `--skip-git` |
| `-h, --help` | Show help | `-h` |
| `-V, --version` | Show version | `-V` |

---

## Testing Locally

### Setup
```bash
cd cli-package
npm install
npm link
```

### Test
```bash
create-gufran-expo-app TestApp -b com.test.app
```

### Automated Test
```bash
./test-cli.sh          # macOS/Linux
test-cli.bat           # Windows
```

### Cleanup
```bash
npm unlink -g
```

---

## What Gets Updated

### Automatic Updates:
- ✅ `package.json` → project name
- ✅ `app.json` → name, slug
- ✅ `app.json` → iOS bundleIdentifier
- ✅ `app.json` → Android package

---

## Publishing

### 1. Test
```bash
cd cli-package
./test-cli.sh
```

### 2. Publish
```bash
npm login
npm publish --access public
```

### 3. Verify
```bash
npm view @gufran/expo-boilerplate
```

---

## Created Project

### Run Development Server
```bash
npm start
```

### Run on Android
```bash
npm run android
```

### Run on iOS
```bash
npm run ios
```

### Install iOS Pods
```bash
cd ios && pod install && cd ..
```

---

## Bundle ID Format

### Valid Examples:
- `com.company.app`
- `com.mycompany.myapp`
- `io.github.username`

### Invalid Examples:
- `myapp` (no dots)
- `com..app` (empty segment)
- `123.app` (starts with number)

---

## Files Modified

1. `cli-package/lib/createApp.js` - Main logic
2. `cli-package/bin/cli.js` - CLI entry
3. `cli-package/package.json` - Version 2.0.0
4. `cli-package/README.md` - Documentation

---

## Files Created

1. `IMPLEMENTATION_SUMMARY.md` - Complete summary
2. `CHANGELOG_NEW.md` - What's new
3. `test-cli.sh` - Test script (Unix)
4. `test-cli.bat` - Test script (Windows)

---

## Key Changes

| Feature | Change |
|---------|--------|
| **File Source** | Git clone → Direct copy |
| **Speed** | 30-60s → 5-15s |
| **Offline** | ❌ → ✅ |
| **Bundle ID** | Manual → Automatic |
| **Version** | 1.0.0 → 2.0.0 |

---

## Troubleshooting

### Issue: Package name taken
**Fix**: Use scoped name `@username/package-name`

### Issue: CLI not found
**Fix**: Run `npm link` again in cli-package directory

### Issue: Invalid bundle ID
**Fix**: Use format `com.company.appname`

---

## Documentation

📚 **Full Docs**: See `IMPLEMENTATION_SUMMARY.md`
📖 **Setup Guide**: See `SETUP_GUIDE.md`
📋 **Changes**: See `CHANGELOG_NEW.md`
📝 **Usage**: See `README.md`

---

**Ready to publish? Run `./test-cli.sh` first! ✅**
