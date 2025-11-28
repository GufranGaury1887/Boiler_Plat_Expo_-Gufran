# 🚀 Complete Setup Guide for @gufran/expo-boilerplate

This is your complete guide to setting up, testing, and publishing your CLI tool.

---

## 📁 Project Structure

```
cli-package/
├── bin/
│   └── cli.js              # Main CLI entry point
├── lib/
│   └── createApp.js        # Core logic for creating apps
├── package.json            # Package configuration
├── index.js                # Package entry point
├── README.md               # Main documentation
├── PUBLISHING.md           # How to publish to npm
├── QUICKSTART.md           # Quick start guide
├── CONTRIBUTING.md         # Contribution guidelines
├── CHANGELOG.md            # Version history
├── LICENSE                 # MIT License
├── .gitignore              # Git ignore rules
├── .npmignore              # npm ignore rules
├── setup.sh                # Unix/Mac setup script
└── setup.bat               # Windows setup script
```

---

## 🎯 Step-by-Step Setup

### Step 1: Test Locally

#### On macOS/Linux:

```bash
cd cli-package
chmod +x setup.sh
./setup.sh
```

#### On Windows:

```cmd
cd cli-package
setup.bat
```

#### Or manually:

```bash
cd cli-package
npm install
chmod +x bin/cli.js
npm link
```

### Step 2: Test the CLI

Create a test project:

```bash
# Using the linked command
create-gufran-expo-app my-test-app

# Or with options
create-gufran-expo-app my-test-app --skip-install

# Interactive mode
create-gufran-expo-app
```

### Step 3: Verify the Test Project

```bash
cd my-test-app
ls -la

# Should see:
# - src/
# - android/
# - ios/
# - package.json
# - app.json
# - etc.
```

### Step 4: Clean Up Test

```bash
# Remove test project
cd ..
rm -rf my-test-app

# Unlink CLI (when done testing)
npm unlink -g
```

---

## 📦 Publishing to npm

### Prerequisites

1. **npm Account**: Create at [npmjs.com](https://www.npmjs.com/signup)
2. **Email Verified**: Verify your npm email
3. **2FA Enabled**: Enable two-factor authentication (recommended)

### Option 1: Publish as Scoped Package (Recommended)

#### Step 1: Login to npm

```bash
npm login
```

Enter:
- Username
- Password
- Email
- OTP (if 2FA enabled)

#### Step 2: Verify Package Name

The package is currently named `@gufran/expo-boilerplate`. To use this:
- You need the `@gufran` scope available
- Or change to your own scope: `@yourusername/expo-boilerplate`

To change scope, edit `package.json`:

```json
{
  "name": "@yourusername/expo-boilerplate",
  "bin": {
    "create-yourusername-expo-app": "./bin/cli.js"
  }
}
```

#### Step 3: Publish

```bash
cd cli-package
npm publish --access public
```

#### Step 4: Verify Publication

```bash
npm view @gufran/expo-boilerplate
```

Or visit: `https://www.npmjs.com/package/@gufran/expo-boilerplate`

#### Step 5: Test Published Package

```bash
npx @gufran/expo-boilerplate test-app
```

### Option 2: Publish as Unscoped Package

#### Edit package.json:

```json
{
  "name": "create-gufran-expo-app",
  "bin": {
    "create-gufran-expo-app": "./bin/cli.js"
  }
}
```

#### Publish:

```bash
npm publish
```

#### Test:

```bash
npx create-gufran-expo-app my-app
```

---

## 🔄 Publishing Updates

### 1. Make Changes

Edit your code, fix bugs, add features.

### 2. Update Version

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### 3. Update CHANGELOG.md

Document your changes:

```markdown
## [1.0.1] - 2025-11-28

### Fixed
- Fixed Windows path resolution
- Improved error messages

### Changed
- Updated dependencies
```

### 4. Publish Update

```bash
npm publish --access public
```

### 5. Create Git Tag

```bash
git add .
git commit -m "Release v1.0.1"
git tag -a v1.0.1 -m "Version 1.0.1"
git push origin main
git push origin v1.0.1
```

---

## 🧪 Testing Checklist

Before publishing, test these scenarios:

### Basic Tests

- [ ] `npx @gufran/expo-boilerplate my-app` - Default creation
- [ ] `npx @gufran/expo-boilerplate my-app --npm` - Using npm
- [ ] `npx @gufran/expo-boilerplate my-app --skip-install` - Skip install
- [ ] `npx @gufran/expo-boilerplate my-app --skip-git` - Skip git
- [ ] `npx @gufran/expo-boilerplate` - Interactive mode

### Error Handling

- [ ] Creating with existing directory name
- [ ] Creating with invalid project name
- [ ] Running without internet connection
- [ ] Interrupting during installation

### Platform Tests

- [ ] macOS
- [ ] Windows
- [ ] Linux (if possible)

### Created Project Tests

- [ ] `package.json` has correct name
- [ ] `app.json` is updated correctly
- [ ] Dependencies install successfully
- [ ] Project runs: `npm start`
- [ ] Android build: `npm run android`
- [ ] iOS build: `npm run ios`

---

## 🎨 Customization Options

### Change Package Name

Edit `cli-package/package.json`:

```json
{
  "name": "your-package-name",
  "bin": {
    "your-command-name": "./bin/cli.js"
  }
}
```

Update everywhere it appears:
- README.md
- PUBLISHING.md
- QUICKSTART.md

### Change Repository URL

Edit `cli-package/lib/createApp.js`:

```javascript
const REPO_URL = 'https://github.com/YourUsername/YourRepo.git';
```

### Add Custom Options

Edit `cli-package/bin/cli.js`:

```javascript
program
  .option('--template <template>', 'Template to use')
  .option('--your-option', 'Your custom option');
```

Then handle in `createApp.js`:

```javascript
if (options.yourOption) {
  // Your custom logic
}
```

---

## 📊 After Publishing

### 1. Update Repository README

Add badges to your main repository README:

```markdown
# Boiler_Plat_Expo_-Gufran

[![npm version](https://img.shields.io/npm/v/@gufran/expo-boilerplate.svg)](https://www.npmjs.com/package/@gufran/expo-boilerplate)
[![npm downloads](https://img.shields.io/npm/dt/@gufran/expo-boilerplate.svg)](https://www.npmjs.com/package/@gufran/expo-boilerplate)
[![license](https://img.shields.io/npm/l/@gufran/expo-boilerplate.svg)](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran/blob/main/LICENSE)

## Quick Start

\`\`\`bash
npx @gufran/expo-boilerplate my-app
\`\`\`
```

### 2. Share Your Package

- Post on Twitter/X
- Share on Reddit (r/reactnative, r/expo)
- Post on Dev.to
- Share on LinkedIn
- Add to awesome-react-native lists

### 3. Monitor Usage

Check npm stats:
```bash
npm view @gufran/expo-boilerplate
```

### 4. Respond to Issues

- Check GitHub issues regularly
- Respond to questions
- Fix bugs promptly
- Consider feature requests

---

## 🔧 Maintenance

### Regular Tasks

1. **Update Dependencies**
   ```bash
   cd cli-package
   npm update
   npm audit fix
   ```

2. **Test After Updates**
   ```bash
   npm link
   create-gufran-expo-app test-app
   ```

3. **Keep Boilerplate Updated**
   - Update main repository regularly
   - Keep dependencies current
   - Fix security issues
   - Add new features

4. **Update Documentation**
   - Keep README accurate
   - Update examples
   - Add new features to docs
   - Fix typos and errors

---

## 🐛 Troubleshooting

### "Package name already taken"

Choose a different name:
- `@yourscope/expo-boilerplate`
- `create-yourname-expo-app`
- `expo-starter-yourname`

### "Permission denied"

On Unix/macOS:
```bash
chmod +x bin/cli.js
```

### "Command not found after npm link"

Try:
```bash
npm unlink -g
npm link
```

Or check PATH:
```bash
echo $PATH
which create-gufran-expo-app
```

### "Module not found"

Ensure dependencies are installed:
```bash
cd cli-package
npm install
```

---

## 📈 Success Metrics

Track your package's success:

1. **npm Downloads**: Check weekly/monthly downloads
2. **GitHub Stars**: Monitor repository stars
3. **Issues**: Number and quality of issues
4. **Forks**: Developers forking your repo
5. **Community**: Discussions and contributions

---

## 🎓 Best Practices

1. **Version Consistently**: Follow semantic versioning
2. **Document Changes**: Keep CHANGELOG.md updated
3. **Test Thoroughly**: Test before each release
4. **Respond Quickly**: Address issues promptly
5. **Stay Updated**: Keep dependencies current
6. **Listen to Users**: Consider feedback
7. **Maintain Quality**: Don't rush releases

---

## 📚 Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

---

## ✅ Final Checklist

Before publishing for the first time:

- [ ] All files created and tested
- [ ] Dependencies installed
- [ ] CLI tested locally with `npm link`
- [ ] Test project created successfully
- [ ] Test project runs without errors
- [ ] README.md is complete and accurate
- [ ] CHANGELOG.md has initial entry
- [ ] LICENSE file is present
- [ ] .npmignore excludes unnecessary files
- [ ] package.json has correct information
- [ ] Logged into npm: `npm login`
- [ ] Ready to publish: `npm publish --access public`

---

## 🎉 You're Ready!

Your CLI tool is complete and ready to publish. Follow the steps above, and you'll have a professional npm package that helps developers scaffold new Expo projects in seconds!

**Good luck! 🚀**

---

**Need help?** Open an issue or check the documentation files in this directory.
