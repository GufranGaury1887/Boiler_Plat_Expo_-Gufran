const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const prompts = require('prompts');
const validateProjectName = require('validate-npm-package-name');

const REPO_URL = 'https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran.git';

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
 * Main function to create the Expo app
 */
async function createExpoApp(projectName, options) {
  let appName = projectName;

  // Prompt for project name if not provided
  if (!appName) {
    const response = await prompts({
      type: 'text',
      name: 'projectName',
      message: 'What is your project name?',
      initial: 'my-expo-app',
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
    });

    if (!response.projectName) {
      console.log(chalk.red('\n❌ Project creation cancelled'));
      process.exit(1);
    }

    appName = response.projectName;
  }

  // Validate project name
  validateName(appName);

  const projectPath = path.resolve(process.cwd(), appName);

  // Check if directory already exists
  if (fs.existsSync(projectPath)) {
    console.log(chalk.red(`\n❌ Directory "${appName}" already exists!`));
    process.exit(1);
  }

  console.log(chalk.green(`\n✨ Creating a new Expo app: ${chalk.bold(appName)}\n`));

  // Check for Git
  let spinner = ora('Checking prerequisites...').start();
  if (!commandExists('git')) {
    spinner.fail('Git is not installed. Please install Git and try again.');
    process.exit(1);
  }
  spinner.succeed('Prerequisites check passed');

  // Clone the repository
  spinner = ora('Cloning boilerplate repository...').start();
  try {
    executeCommand(`git clone --depth 1 ${REPO_URL} "${projectPath}"`, { silent: true });
    spinner.succeed('Repository cloned successfully');
  } catch (error) {
    spinner.fail('Failed to clone repository');
    throw error;
  }

  // Remove .git folder unless skip-git is specified
  if (!options.skipGit) {
    spinner = ora('Cleaning up git history...').start();
    const gitPath = path.join(projectPath, '.git');
    if (fs.existsSync(gitPath)) {
      fs.rmSync(gitPath, { recursive: true, force: true });
    }
    spinner.succeed('Git history cleaned');
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
    }
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    spinner.succeed('app.json updated');
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
  console.log(chalk.gray('   ✅ Square In-App Payments'));
  console.log(chalk.gray('   ✅ Image Picker & Camera Integration'));
  console.log(chalk.gray('   ✅ Push Notifications with Notifee\n'));

  console.log(chalk.yellow('⚠️  Important:'));
  console.log(chalk.gray('   Remember to update your app.json with your own configuration'));
  console.log(chalk.gray('   and add your Firebase configuration files!\n'));

  console.log(chalk.magenta('💡 Happy coding! 🚀\n'));
}

module.exports = { createExpoApp };
