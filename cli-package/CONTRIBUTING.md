# Contributing to @gufran/expo-boilerplate

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear, descriptive title
- Detailed steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, etc.)

### Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature has already been requested
- Provide a clear use case
- Explain why this would be useful
- Consider implementation details

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "Add: amazing new feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 📝 Code Guidelines

### JavaScript/Node.js Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code style
- Keep functions small and focused
- Handle errors appropriately

### CLI Tool Development

- Test commands thoroughly before submitting
- Ensure cross-platform compatibility (Windows, macOS, Linux)
- Add helpful error messages
- Keep output clean and informative

### Documentation

- Update README.md for new features
- Add comments for complex code
- Update CHANGELOG.md
- Include examples where helpful

## 🧪 Testing

Before submitting a PR:

1. **Test the CLI locally**
   ```bash
   cd cli-package
   npm link
   create-gufran-expo-app test-app
   ```

2. **Test on multiple platforms** (if possible)
   - macOS
   - Windows
   - Linux

3. **Test different scenarios**
   - With and without options
   - Error cases
   - Edge cases

4. **Clean up after testing**
   ```bash
   npm unlink -g
   ```

## 📋 Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran.git
   cd Boiler_Plat_Expo_-Gufran/cli-package
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Link for testing
   ```bash
   npm link
   ```

4. Make changes and test
   ```bash
   create-gufran-expo-app test-project
   ```

## 🔄 Commit Message Guidelines

Use clear commit messages:

- `Add: new feature or file`
- `Update: existing functionality`
- `Fix: bug fix`
- `Docs: documentation changes`
- `Style: formatting, no code change`
- `Refactor: code restructuring`
- `Test: adding tests`
- `Chore: maintenance tasks`

Examples:
```
Add: interactive mode for project creation
Fix: Windows path resolution issue
Update: improve error handling in createApp.js
Docs: add troubleshooting section to README
```

## 🌿 Branch Naming

Use descriptive branch names:
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

## 📦 Version Management

We follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features (backwards compatible)
- PATCH: Bug fixes

## 🔍 Code Review Process

1. All PRs require review before merging
2. Address review comments promptly
3. Keep PRs focused and small when possible
4. Update PR based on feedback

## 🎯 Priority Areas

We're especially interested in contributions for:

1. **Bug Fixes** - Always welcome
2. **Documentation** - Improvements and clarity
3. **Testing** - Better test coverage
4. **Platform Support** - Windows/Linux improvements
5. **Performance** - Speed optimizations
6. **Error Handling** - Better error messages
7. **Features** - Useful additions (discuss first)

## ⚠️ What NOT to Contribute

- Breaking changes without discussion
- Style changes without functionality improvements
- Large refactors without prior agreement
- Unrelated changes in a single PR
- Changes without testing

## 💡 Need Help?

- Open an issue for questions
- Check existing issues and PRs
- Review the documentation
- Ask in the discussions section

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution helps make this project better. Thank you for taking the time to contribute!

---

**Questions?** Open an issue or reach out to the maintainers.
