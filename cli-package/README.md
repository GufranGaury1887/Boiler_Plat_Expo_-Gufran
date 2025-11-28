# 🚀 @gufran/expo-boilerplate

![npm version](https://img.shields.io/npm/v/@gufran/expo-boilerplate.svg)
![downloads](https://img.shields.io/npm/dt/@gufran/expo-boilerplate.svg)
![license](https://img.shields.io/npm/l/@gufran/expo-boilerplate.svg)

**Ultimate Expo React Native Boilerplate** - A professionally configured Expo environment designed for production-ready applications. Skip the tedious setup and dive straight into building amazing features!

---

## ✨ Why Choose This Boilerplate?

This boilerplate provides a complete, production-ready setup with enterprise-grade features:

- 🔥 **Firebase Integration** - Authentication, Push Notifications, Analytics
- 🎨 **Professional UI** - Pre-built components and screens
- 🗂️ **Clean Architecture** - Organized folder structure that scales
- 💳 **Payment Ready** - Square In-App Payments integrated
- ☁️ **Cloud Storage** - Azure Blob Storage for file uploads
- 🔐 **Authentication Flow** - Complete auth screens and navigation
- 📱 **Native Features** - Camera, Image Picker, Permissions
- 🔔 **Push Notifications** - Notifee and Firebase Messaging
- 🌐 **API Management** - TanStack Query configured
- 📊 **State Management** - Zustand for efficient state handling
- 🎯 **TypeScript** - Full type safety

---

## 🚀 Quick Start

Create a new project with a single command:

```bash
npx @gufran/expo-boilerplate my-awesome-app
```

Or use npm directly:

```bash
npm create @gufran/expo-boilerplate my-awesome-app
```

With yarn:

```bash
yarn create @gufran/expo-boilerplate my-awesome-app
```

### Interactive Mode

Simply run without a project name to enter interactive mode:

```bash
npx @gufran/expo-boilerplate
```

---

## 📋 Command Options

```bash
npx @gufran/expo-boilerplate [project-name] [options]
```

### Options:

| Option | Description |
|--------|-------------|
| `--skip-install` | Skip automatic dependency installation |
| `--skip-git` | Skip git initialization |
| `--npm` | Use npm instead of yarn |
| `-h, --help` | Display help information |
| `-V, --version` | Display version number |

### Examples:

```bash
# Create project with npm
npx @gufran/expo-boilerplate my-app --npm

# Skip installation and git init
npx @gufran/expo-boilerplate my-app --skip-install --skip-git

# Quick setup
npx @gufran/expo-boilerplate my-app
```

---

## 📦 What's Included?

### 🎯 Core Technologies

- **Expo SDK 54** - Latest Expo framework
- **React Native 0.81** - Latest stable RN version
- **TypeScript** - Full type safety
- **React Navigation 7** - Native stack navigation

### 🔥 Firebase Services

- Firebase App & Messaging
- Push Notifications with Notifee
- Cloud Messaging
- Analytics ready

### 💾 State & Data Management

- **Zustand** - Lightweight state management
- **TanStack Query** - Server state management
- **MMKV** - Fast local storage
- **React Native Gesture Handler** - Smooth gestures

### 🎨 UI & Media

- Image Picker & Camera
- Image Zoom capabilities
- SVG support
- Reanimated animations
- Keyboard-aware scrolling

### 💳 Payment Integration

- Square In-App Payments
- Ready-to-use payment components

### ☁️ Cloud Services

- Azure Blob Storage integration
- Background file upload
- Progress tracking

### 🔐 Authentication

- Complete auth flow
- Context-based auth management
- Secure storage

---

## 📁 Project Structure

```
my-app/
├── src/
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable UI components
│   │   └── common/      # Common components
│   ├── config/          # App configuration
│   ├── constants/       # Constants, themes, strings
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation setup
│   │   ├── AuthStack.tsx
│   │   ├── MainStack.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/         # App screens
│   │   ├── auth/        # Authentication screens
│   │   ├── chat/        # Chat features
│   │   ├── clubs/       # Club management
│   │   ├── events/      # Events
│   │   └── ...
│   ├── services/        # API services
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── android/             # Android native code
├── ios/                 # iOS native code
├── FirebaseFiles/       # Firebase configuration files
└── assets/              # Root assets
```

---

## 🛠️ Setup Steps

### 1. Create Your Project

```bash
npx @gufran/expo-boilerplate my-app
cd my-app
```

### 2. Configure Firebase

Add your Firebase configuration files:

**For Android:**
```bash
# Add google-services.json to:
android/app/google-services.json
```

**For iOS:**
```bash
# Add GoogleService-Info.plist to:
ios/ClubYakka/GoogleService-Info.plist
```

### 3. Install iOS Dependencies

```bash
cd ios && pod install && cd ..
```

### 4. Update App Configuration

Edit `app.json` with your app details:

```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    },
    "android": {
      "package": "com.yourcompany.yourapp"
    }
  }
}
```

### 5. Start Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Metro bundler |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS device/simulator |
| `npm run web` | Run on web browser |
| `npm run pod` | Install iOS pods |
| `npm run clear` | Clear Metro cache |
| `npm run clean` | Clean Android build |

---

## 🎨 Key Features Explained

### Authentication Flow

Complete authentication system with:
- Login/Register screens
- OTP verification
- Password reset
- Protected routes
- Auth context management

### Navigation Structure

Three-level navigation:
1. **RootNavigator** - Entry point
2. **AuthStack** - Unauthenticated screens
3. **MainStack** - Authenticated screens

### API Integration

Pre-configured with:
- Axios for HTTP requests
- TanStack Query for caching
- Error handling
- Request/response interceptors

### File Upload

Background upload with:
- Azure Blob Storage integration
- Progress tracking
- Multiple file support
- Error handling

### Push Notifications

Complete notification system:
- Firebase Cloud Messaging
- Notifee for local notifications
- Permission handling
- Deep linking support

---

## 🔐 Environment Setup

Create `.env` file in root:

```env
API_BASE_URL=https://api.yourapp.com
AZURE_STORAGE_URL=your-azure-url
SQUARE_APPLICATION_ID=your-square-id
```

---

## 📱 Platform-Specific Notes

### iOS

- Requires Xcode 14+
- Run `pod install` after installing dependencies
- Configure signing in Xcode
- Update `Info.plist` with required permissions

### Android

- Requires Android Studio
- Update `google-services.json`
- Configure signing in `android/app/build.gradle`
- Set up keystore for release builds

---

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Type checking
npx tsc --noEmit
```

---

## 📚 Documentation

For detailed documentation on specific features:

- [Firebase Setup](./docs/firebase.md)
- [Azure Storage](./docs/azure-storage.md)
- [Navigation Guide](./docs/navigation.md)
- [API Services](./docs/api-services.md)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Issues

Found a bug? Please [open an issue](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran/issues) with a detailed description.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Gufran Gaury**

- GitHub: [@GufranGaury1887](https://github.com/GufranGaury1887)
- Repository: [Boiler_Plat_Expo_-Gufran](https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran)

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

## 📮 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**Built with ❤️ by Gufran Gaury**

*Happy Coding! 🚀*
