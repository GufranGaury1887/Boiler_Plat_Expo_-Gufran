#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const { createExpoApp } = require('../lib/createApp');
const packageJson = require('../package.json');

console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Gufran's Expo Boilerplate Generator 🚀              ║
║                                                           ║
║   Create production-ready Expo apps in seconds!          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));

program
  .version(packageJson.version)
  .description('Create a new Expo app using Gufran\'s professional boilerplate')
  .argument('[project-name]', 'Name of your new project')
  .option('-b, --bundle-id <bundleId>', 'Bundle identifier (e.g., com.company.appname)')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-git', 'Skip git initialization')
  .option('--npm', 'Use npm instead of yarn')
  .action(async (projectName, options) => {
    try {
      await createExpoApp(projectName, options);
    } catch (error) {
      console.error(chalk.red('\n❌ Error creating project:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
