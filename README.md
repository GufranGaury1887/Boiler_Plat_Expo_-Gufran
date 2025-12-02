# 🚀 React Native Expo Boilerplate

A production-ready, feature-rich React Native Expo boilerplate with TypeScript, state management, navigation, and comprehensive utilities.

## ✨ Features

### Core Technologies
- ⚡ **Expo SDK 54** - Latest Expo framework with new architecture enabled
- 🎯 **React 19** & **React Native 0.81** - Latest React ecosystem
- 📘 **TypeScript** - Full type safety
- 🎨 **Custom Fonts** - Outfit font family pre-configured

### State Management & Data Fetching
- 🗄️ **Zustand** - Lightweight state management
- 🔄 **TanStack Query (React Query)** - Server state management
- 💾 **MMKV** - Fast, efficient key-value storage
- 🔐 **Secure Storage** - Authentication and user data persistence

### Navigation
- 🧭 **React Navigation v7** - Native stack navigation
- 📱 **Safe Area Context** - Proper screen insets handling
- 🔄 **Stack-based Architecture**:
  - AuthStack (Login, Register, etc.)
  - MainStack (App screens)
  - MiddleStack (Intermediate flows)

### Backend Integration
- 🌐 **Axios** - HTTP client with interceptors
- 🔌 **SignalR** - Real-time communication
- 📡 **Network Info** - Online/offline detection
- 🐌 **Slow Connection Detection** - User-friendly network warnings

### Firebase Integration
- 🔥 **Firebase Cloud Messaging** - Push notifications
- 📲 **Notifee** - Local & remote notification handling
- 🔔 **Custom Notification Manager** - Centralized notification logic

### UI Components & Utilities
- 🎨 **Custom Component Library**:
  - Buttons, TextInputs, Icons
  - Image Picker with Azure Upload
  - OTP Input
  - Toast Messages
  - Loading States & Modals
  - Club & Team Cards
- 📐 **Responsive Scaling** - Device-independent sizing
- ⌨️ **Keyboard Controller** - Smart keyboard handling
- 👆 **Gesture Handler** - Smooth touch interactions
- 🖼️ **Image Zoom** - Built-in image zoom functionality

### Developer Experience
- 🐛 **Reactotron** - Debugging and development tools
- 🔍 **Sentry** - Error tracking and monitoring
- 🎯 **Path Aliases** - Clean imports with `@` prefixes
- 🔧 **Patch Package** - Custom package modifications
- 📝 **Comprehensive Scripts** - Build, run, and maintenance commands

### Additional Features
- 📷 **Camera & Gallery Access** - Image picker with permissions
- 💬 **Gifted Chat** - Pre-integrated chat functionality
- 📅 **Date Picker** - Custom date selection
- 🎨 **SVG Support** - SVG icons and images
- 📄 **HTML Rendering** - Render HTML content
- 🌐 **Multi-platform** - iOS, Android support

## 📁 Project Structure

```
├── android/                    # Android native code
├── ios/                       # iOS native code
├── src/
│   ├── assets/               # Images, fonts, icons
│   │   ├── fonts/           # Outfit font family
│   │   ├── icons/           # SVG icons
│   │   └── images/          # App images
│   ├── components/
│   │   └── common/          # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── TextInput.tsx
│   │       ├── ImagePicker.tsx
│   │       ├── AppLoader.tsx
│   │       ├── ToastConfig.tsx
│   │       └── ... (20+ components)
│   ├── config/              # App configuration
│   ├── constants/           # Constants & fonts
│   ├── contexts/            # React contexts
│   ├── hooks/              # Custom hooks
│   │   ├── useImageUpload.ts
│   │   └── index.ts
│   ├── navigation/         # Navigation setup
│   │   ├── RootNavigator.tsx
│   │   ├── AuthStack.tsx
│   │   ├── MainStack.tsx
│   │   └── MiddleStack.tsx
│   ├── providers/          # React providers
│   │   └── QueryProvider.tsx
│   ├── screens/           # App screens
│   ├── services/          # API & business logic
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   └── mainServices.ts
│   ├── stores/           # Zustand stores
│   │   └── authStore.ts
│   ├── types/           # TypeScript types
│   └── utils/          # Utility functions
│       ├── scaling.ts
│       ├── storage.ts
│       ├── permissions.ts
│       ├── validation.ts
│       ├── imagePicker.ts
│       ├── AzureUploaderService.ts
│       └── NotificationManager.ts
├── App.tsx             # App entry point
├── app.json           # Expo configuration
├── package.json       # Dependencies
└── tsconfig.json     # TypeScript config
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/GufranGaury1887/Boiler_Plat_Expo_-Gufran.git
cd Boiler_Plat_Expo_-Gufran
```

2. **Install dependencies**
```bash
npm install
```

3. **Install iOS Pods** (iOS only)
```bash
npm run pod
```

4. **Configure Firebase**
   - Add your `google-services.json` to `FirebaseFiles/` (Android)
   - Add your `GoogleService-Info.plist` to `FirebaseFiles/` (iOS)

5. **Configure Sentry** (Optional)
   - Update `SENTRY_SESSION_ID` in `src/constants/Constants.ts`

### Running the App

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Clear cache and restart
npm run clear
```

## 🔧 Available Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run pod        # Install iOS pods
npm run clear      # Clear cache and restart
npm run clean      # Clean Android build
npm run ar         # Build Android release APK
npm run adb-install # Install release APK on device
```

## 🎯 Path Aliases

The project uses TypeScript path aliases for cleaner imports:

```typescript
import { Button } from '@components/common';
import { useAuthStore } from '@stores';
import { api } from '@services';
import { Colors } from '@constants';
import { moderateScale } from '@utils/scaling';
import SVG from '@assets/icons';
```

## 🔐 Authentication Flow

The boilerplate includes a complete authentication system:

1. **Auth Store** (`authStore.ts`) - Manages user state
2. **Storage Service** - Persists auth tokens securely
3. **Auto-login** - Restores session on app launch
4. **API Interceptors** - Automatic token injection
5. **Auth Stack** - Login, Register, OTP screens

## 📱 Key Features Implementation

### Network Status Detection
```typescript
// Automatically detects:
- No internet connection (shows error screen)
- Slow connection (3G) - shows warning banner
```

### Image Upload System
```typescript
// Features:
- Camera & Gallery access
- Azure blob storage integration
- Upload progress tracking
- Background upload support
```

### Push Notifications
```typescript
// Integrated:
- Firebase Cloud Messaging
- Notifee for local notifications
- Custom notification manager
- iOS & Android permissions
```

### State Management
```typescript
// Zustand stores with:
- Persistent storage (MMKV)
- Type-safe actions
- DevTools integration (Reactotron)
```

## 🎨 Styling & Theming

- **Responsive Scaling**: Uses `moderateScale()` for device-independent sizing
- **Custom Fonts**: Outfit font family (Bold, SemiBold, Medium, Regular, Light)
- **Safe Areas**: Proper handling of notches and system UI
- **Constants**: Centralized colors, fonts, and sizes

## 🐛 Debugging

### Development Tools
- **Reactotron**: Enabled in dev mode for state inspection
- **Console Logs**: Hidden in production via `LogBox.ignoreAllLogs()`
- **Sentry**: Crash reporting in production builds

### Debug Commands
```bash
# React Native debugger
npx expo start --dev-client

# View device logs
npx react-native log-ios
npx react-native log-android
```

## 📦 Build & Release

### Android
```bash
# Generate release APK
npm run ar

# Install on connected device
npm run adb-install
```

### iOS
```bash
# Archive in Xcode
1. Open ios/ClubYakka.xcworkspace in Xcode
2. Product > Archive
3. Distribute App
```

## 🔧 Configuration Files

### Important Files to Customize
- `app.json` - App name, bundle ID, permissions
- `src/constants/Constants.ts` - API URLs, keys
- `src/config/` - Environment-specific configs
- `FirebaseFiles/` - Firebase credentials

## 📚 Dependencies Highlights

| Package | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management |
| `zustand` | Client state management |
| `react-native-mmkv` | Fast storage |
| `@react-navigation/native` | Navigation |
| `axios` | HTTP client |
| `@react-native-firebase/*` | Firebase integration |
| `@microsoft/signalr` | Real-time communication |
| `react-native-reanimated` | Smooth animations |
| `@sentry/react-native` | Error tracking |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Best Practices

- ✅ Use path aliases for imports
- ✅ Follow TypeScript strict mode
- ✅ Use custom hooks for reusable logic
- ✅ Implement proper error boundaries
- ✅ Handle loading and error states
- ✅ Use responsive scaling utilities
- ✅ Test on both iOS and Android
- ✅ Keep components small and focused
- ✅ Use constants for repeated values
- ✅ Document complex logic

## 🔒 Security Notes

- Never commit `.env` files or sensitive credentials
- Keep Firebase config files secure
- Use environment variables for API keys
- Implement proper API authentication
- Validate user inputs
- Use HTTPS for all API calls

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support & Issues

For issues, questions, or contributions:
- Create an issue in the repository
- Contact the maintainers
- Check existing documentation

---

**Built with ❤️ using React Native & Expo**
