# create-gufran-expo-app

[![npm version](https://img.shields.io/npm/v/create-gufran-expo-app.svg)](https://www.npmjs.com/package/create-gufran-expo-app)
[![npm downloads](https://img.shields.io/npm/dt/create-gufran-expo-app.svg)](https://www.npmjs.com/package/create-gufran-expo-app)
[![license](https://img.shields.io/npm/l/create-gufran-expo-app.svg)](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran/blob/main/LICENSE)

A CLI tool to create production-ready Expo React Native apps with Firebase, Navigation, TypeScript, and more. Works offline - no git clone needed!

## Features

- 🔥 **Firebase Integration** - Authentication, Push Notifications, Analytics
- 🗂️ **Clean Architecture** - Organized folder structure that scales
- ☁️ **Azure Blob Storage** - File uploads with progress tracking
- 🔐 **Authentication Flow** - Complete auth screens and navigation
- 📱 **Native Features** - Camera, Image Picker, Permissions
- 🔔 **Push Notifications** - Notifee and Firebase Messaging
- 🌐 **API Management** - TanStack Query configured
- 📊 **State Management** - Zustand for efficient state handling
- 🎯 **TypeScript** - Full type safety

## Quick Start

```bash
npx create-gufran-expo-app my-app
```

## Installation

You don't need to install anything globally. Just use `npx`:

```bash
npx create-gufran-expo-app my-app
```

Or install globally:

```bash
npm install -g create-gufran-expo-app
create-gufran-expo-app my-app
```

## Usage

### Basic Usage

```bash
npx create-gufran-expo-app my-app
```

### With Bundle ID

```bash
npx create-gufran-expo-app my-app --bundle-id com.mycompany.myapp
```

### Interactive Mode

```bash
npx create-gufran-expo-app
# Will prompt for project name and bundle ID
```

### Options

| Option | Description |
|--------|-------------|
| `-b, --bundle-id <id>` | Bundle identifier (e.g., com.myapp) |
| `--skip-install` | Skip automatic dependency installation |
| `--skip-git` | Skip git initialization |
| `--npm` | Use npm instead of yarn |
| `-h, --help` | Display help information |
| `-V, --version` | Display version number |

## Project Structure

```
my-app/
├── src/
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable UI components
│   ├── config/          # App configuration
│   ├── constants/       # Constants, themes, strings
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation setup
│   ├── screens/         # App screens
│   ├── services/        # API services
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── android/             # Android native code
├── ios/                 # iOS native code
├── FirebaseFiles/       # Firebase config samples
└── assets/              # Root assets
```

## After Project Creation

### 1. Navigate to your project

```bash
cd my-app
```

### 2. Configure Firebase

Add your Firebase configuration files:

- **Android**: Copy `google-services.json` to `android/app/`
- **iOS**: Copy `GoogleService-Info.plist` to `ios/YourApp/`

### 3. Install iOS dependencies

```bash
cd ios && pod install && cd ..
```

### 4. Start development

```bash
npm start        # Start Metro bundler
npm run android  # Run on Android
npm run ios      # Run on iOS
```

## Tech Stack

| Category | Technologies |
|----------|-------------|
| Framework | Expo SDK 54, React Native 0.81 |
| Language | TypeScript |
| Navigation | React Navigation 7 |
| State | Zustand, TanStack Query |
| Storage | MMKV |
| Backend | Firebase, Azure Blob Storage |
| Notifications | Notifee, FCM |

## Requirements

- Node.js >= 18.0.0
- For iOS: Xcode 14+, CocoaPods
- For Android: Android Studio, JDK 17

## License

MIT © [Gufran Gaury](https://github.com/GufranGaury1887)

## Links

- [GitHub Repository](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran)
- [Report Issues](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran/issues)
