# Publishing Guide

This guide will help you publish your CLI package to npm.

## Prerequisites

1. **npm Account**: Create an account at [npmjs.com](https://www.npmjs.com)
2. **npm CLI**: Ensure npm is installed and updated
3. **Git Repository**: Your repository should be public on GitHub

## Steps to Publish

### 1. Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### 2. Update Package Information

Before publishing, update these fields in `package.json`:

```json
{
  "name": "@gufran/expo-boilerplate",
  "version": "1.0.0",
  "author": "Gufran Gaury <your-actual-email@example.com>",
  "description": "Your description"
}
```

**Important**: 
- For scoped packages (@gufran/...), you need to publish with public access
- Make sure the package name is available on npm

### 3. Test Locally

Before publishing, test your CLI locally:

```bash
cd cli-package
npm install
npm link
```

Then test it:

```bash
create-gufran-expo-app test-app
```

If it works, unlink it:

```bash
npm unlink -g
```

### 4. Publish to npm

#### For Scoped Packages (Recommended):

```bash
cd cli-package
npm publish --access public
```

#### For Unscoped Packages:

Change the package name in `package.json` to remove the scope:

```json
{
  "name": "create-gufran-expo-app",
  "bin": {
    "create-gufran-expo-app": "./bin/cli.js"
  }
}
```

Then publish:

```bash
npm publish
```

### 5. Verify Publication

Check your package on npm:

```
https://www.npmjs.com/package/@gufran/expo-boilerplate
```

Test the published package:

```bash
npx @gufran/expo-boilerplate my-test-app
```

## Publishing Updates

### 1. Update Version

Use semantic versioning:

```bash
# For bug fixes (1.0.0 -> 1.0.1)
npm version patch

# For new features (1.0.0 -> 1.1.0)
npm version minor

# For breaking changes (1.0.0 -> 2.0.0)
npm version major
```

### 2. Publish Update

```bash
npm publish --access public
```

## Alternative Package Names

If `@gufran/expo-boilerplate` is taken, consider these alternatives:

1. `@gufran/create-expo-app`
2. `create-gufran-expo-app` (unscoped)
3. `@yourusername/expo-boilerplate`
4. `gufran-expo-starter`
5. `expo-boilerplate-gufran`

## Usage After Publishing

Once published, users can create new projects with:

```bash
npx @gufran/expo-boilerplate my-app
```

or

```bash
npm create @gufran/expo-boilerplate my-app
```

or

```bash
yarn create @gufran/expo-boilerplate my-app
```

## Troubleshooting

### Error: Package name already exists

Choose a different package name and update:
- `package.json` -> `name` field
- `package.json` -> `bin` field
- `README.md` -> all usage examples

### Error: No permission to publish

Run `npm login` again and ensure you're using the correct account.

### Error: You must sign in

```bash
npm logout
npm login
```

## Best Practices

1. **Test Thoroughly**: Always test locally before publishing
2. **Version Control**: Commit changes before publishing
3. **Changelog**: Maintain a CHANGELOG.md for version history
4. **README**: Keep README.md updated with latest usage
5. **Git Tags**: Tag releases in git

```bash
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

## Unpublishing (Emergency Only)

If you need to unpublish (within 72 hours of publishing):

```bash
npm unpublish @gufran/expo-boilerplate@1.0.0
```

**Note**: Unpublishing is discouraged. Use `npm deprecate` instead:

```bash
npm deprecate @gufran/expo-boilerplate@1.0.0 "Use version 1.0.1 instead"
```

## Making Your Package Popular

1. Add badges to README (version, downloads, license)
2. Add keywords to package.json
3. Create good documentation
4. Share on social media and dev communities
5. Add examples and demos
6. Respond to issues quickly
7. Keep dependencies updated

## GitHub Repository Setup

Make sure your GitHub repo has:

1. Good README with examples
2. LICENSE file
3. .gitignore properly configured
4. Issues enabled
5. Topics/tags added
6. Description added

## Support

For help with npm publishing:
- [npm Documentation](https://docs.npmjs.com/)
- [npm Support](https://www.npmjs.com/support)
