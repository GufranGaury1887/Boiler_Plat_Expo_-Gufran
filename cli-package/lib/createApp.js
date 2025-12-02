const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');
const validateProjectName = require('validate-npm-package-name');

/**
 * Execute command with proper error handling
 */
function executeCommand(command, options = {}) {
  try {
    execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return true;
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return false;
  }
}

/**
 * Check if command exists
 */
function commandExists(command) {
  try {
    execSync(`command -v ${command}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate project name
 */
function validateName(name) {
  const validation = validateProjectName(name);
  if (!validation.validForNewPackages) {
    const errors = [
      ...(validation.errors || []),
      ...(validation.warnings || [])
    ];
    throw new Error(`Invalid project name: ${errors.join(', ')}`);
  }
}

/**
 * Generate bundle identifier
 */
function generateBundleId(projectName, bundleIdPrefix) {
  const cleanName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${bundleIdPrefix}.${cleanName}`;
}

/**
 * Copy directory recursively
 */
function copyDirectory(src, dest, excludeDirs = []) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip excluded directories
    if (excludeDirs.includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath, excludeDirs);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Copy template files and update configurations
 */
function copyTemplateFiles(templatePath, projectPath, appName, bundleId) {
  // Directories to exclude from copying
  const excludeDirs = [
    'node_modules',
    '.git',
    'cli-package',
    'build',
    'ios/build',
    'android/build',
    'android/.gradle',
    '.expo',
    'dist',
    'Pods',
    'ios/Pods',
    '.idea',
    'ios/ClubYakka.xcworkspace/xcuserdata',
    'ios/ClubYakka.xcodeproj/xcuserdata'
  ];

  // Copy all files except excluded directories
  copyDirectory(templatePath, projectPath, excludeDirs);
}

/**
 * Main function to create the Expo app
 */
async function createExpoApp(projectName, options) {
  let appName = projectName;
  let bundleId = options.bundleId;

  // Prompt for project name and bundle ID if not provided
  if (!appName || !bundleId) {
    const responses = await prompts([
      {
        type: 'text',
        name: 'projectName',
        message: 'What is your project name?',
        initial: appName || 'my-expo-app',
        validate: (value) => {
          if (!value) return 'Project name is required';
          const validation = validateProjectName(value);
          if (!validation.validForNewPackages) {
            const errors = [
              ...(validation.errors || []),
              ...(validation.warnings || [])
            ];
            return errors.join(', ');
          }
          return true;
        }
      },
      {
        type: 'text',
        name: 'bundleId',
        message: 'What is your bundle identifier? (e.g., com.appname)',
        initial: (prev) => bundleId || generateBundleId(prev, 'com'),
        validate: (value) => {
          if (!value) return 'Bundle ID is required';
          if (!/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/i.test(value)) {
            return 'Invalid bundle ID format. Use format: com.company.appname';
          }
          return true;
        }
      }
    ]);

    if (!responses.projectName || !responses.bundleId) {
      console.log(chalk.red('\n❌ Project creation cancelled'));
      process.exit(1);
    }

    appName = responses.projectName;
    bundleId = responses.bundleId;
  }

  // Validate project name
  validateName(appName);

  const projectPath = path.resolve(process.cwd(), appName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`\n❌ Directory "${appName}" already exists!`));
    process.exit(1);
  }

  console.log(chalk.green(`\n✨ Creating a new Expo app: ${chalk.bold(appName)}`));
  console.log(chalk.cyan(`📦 Bundle ID: ${chalk.bold(bundleId)}\n`));

  // Check for Node.js
  let spinner = ora('Checking prerequisites...').start();
  if (!commandExists('node')) {
    spinner.fail('Node.js is not installed. Please install Node.js and try again.');
    process.exit(1);
  }
  spinner.succeed('Prerequisites check passed');

  // Create project directory
  spinner = ora('Creating project directory...').start();
  try {
    fs.mkdirSync(projectPath, { recursive: true });
    spinner.succeed('Project directory created');
  } catch (error) {
    spinner.fail('Failed to create project directory');
    throw error;
  }

  // Copy template files from the bundled template directory
  spinner = ora('Copying template files...').start();
  try {
    const templatePath = path.resolve(__dirname, '../template');
    
    if (!fs.existsSync(templatePath)) {
      throw new Error('Template files not found. The package may not have been installed correctly.');
    }
    
    copyTemplateFiles(templatePath, projectPath, appName, bundleId);
    spinner.succeed('Template files copied successfully');
  } catch (error) {
    spinner.fail('Failed to copy template files');
    throw error;
  }

  // Update package.json
  spinner = ora('Updating package.json...').start();
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    packageJson.name = appName;
    packageJson.version = '1.0.0';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    spinner.succeed('package.json updated');
  } else {
    spinner.warn('package.json not found, skipping update');
  }

  // Update app.json
  spinner = ora('Updating app.json...').start();
  const appJsonPath = path.join(projectPath, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
    if (appJson.expo) {
      appJson.expo.name = appName;
      appJson.expo.slug = appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      
      // Update bundle identifiers
      if (appJson.expo.ios) {
        appJson.expo.ios.bundleIdentifier = bundleId;
      } else {
        appJson.expo.ios = { bundleIdentifier: bundleId };
      }
      
      if (appJson.expo.android) {
        appJson.expo.android.package = bundleId;
      } else {
        appJson.expo.android = { package: bundleId };
      }
    }
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    spinner.succeed('app.json updated with bundle IDs');
  } else {
    spinner.warn('app.json not found, skipping update');
  }

  // Install dependencies
  if (!options.skipInstall) {
    const useYarn = !options.npm && commandExists('yarn');
    const packageManager = useYarn ? 'yarn' : 'npm';
    
    spinner = ora(`Installing dependencies with ${packageManager}...`).start();
    spinner.text = `Installing dependencies... This might take a few minutes ☕`;
    
    try {
      executeCommand(`cd "${projectPath}" && ${packageManager} install`);
      spinner.succeed('Dependencies installed successfully');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      console.log(chalk.yellow('\nYou can install dependencies later by running:'));
      console.log(chalk.cyan(`  cd ${appName} && ${packageManager} install\n`));
    }
  }

  // Initialize git
  if (!options.skipGit) {
    spinner = ora('Initializing git repository...').start();
    try {
      executeCommand(`cd "${projectPath}" && git init`, { silent: true });
      executeCommand(`cd "${projectPath}" && git add -A`, { silent: true });
      executeCommand(`cd "${projectPath}" && git commit -m "Initial commit from @gufran/expo-boilerplate"`, { silent: true });
      spinner.succeed('Git repository initialized');
    } catch (error) {
      spinner.warn('Git initialization skipped');
    }
  }

  // Success message
  console.log(chalk.green.bold('\n🎉 Success! Your Expo app is ready!\n'));
  console.log(chalk.cyan('📁 Project created at:'), chalk.bold(projectPath));
  console.log(chalk.cyan('\n📚 Next steps:\n'));
  console.log(chalk.white(`  ${chalk.bold('1.')} Navigate to your project:`));
  console.log(chalk.gray(`     cd ${appName}\n`));
  
  if (options.skipInstall) {
    console.log(chalk.white(`  ${chalk.bold('2.')} Install dependencies:`));
    console.log(chalk.gray(`     npm install\n`));
  }

  console.log(chalk.white(`  ${chalk.bold(options.skipInstall ? '3' : '2')}. Configure Firebase:`));
  console.log(chalk.gray(`     - Add your google-services.json to android/app/`));
  console.log(chalk.gray(`     - Add your GoogleService-Info.plist to ios/ClubYakka/\n`));

  console.log(chalk.white(`  ${chalk.bold(options.skipInstall ? '4' : '3')}. Install iOS dependencies:`));
  console.log(chalk.gray(`     cd ios && pod install && cd ..\n`));

  console.log(chalk.white(`  ${chalk.bold(options.skipInstall ? '5' : '4')}. Start the development server:`));
  console.log(chalk.gray(`     npm start\n`));

  console.log(chalk.white(`  ${chalk.bold(options.skipInstall ? '6' : '5')}. Run on device:`));
  console.log(chalk.gray(`     npm run android  ${chalk.dim('# For Android')}`));
  console.log(chalk.gray(`     npm run ios      ${chalk.dim('# For iOS')}\n`));

  console.log(chalk.cyan('📖 Features included:'));
  console.log(chalk.gray('   ✅ React Navigation with Authentication Flow'));
  console.log(chalk.gray('   ✅ Firebase Integration (Messaging, Analytics)'));
  console.log(chalk.gray('   ✅ Azure Blob Storage Upload'));
  console.log(chalk.gray('   ✅ TanStack Query for API Management'));
  console.log(chalk.gray('   ✅ TypeScript Configuration'));
  console.log(chalk.gray('   ✅ Zustand State Management'));
  console.log(chalk.gray('   ✅ Image Picker & Camera Integration'));
  console.log(chalk.gray('   ✅ Push Notifications with Notifee\n'));

  console.log(chalk.yellow('⚠️  Important:'));
  console.log(chalk.gray('   Remember to update your app.json with your own configuration'));
  console.log(chalk.gray('   and add your Firebase configuration files!\n'));

  console.log(chalk.magenta('💡 Happy coding! 🚀\n'));
}

module.exports = { createExpoApp };
