# Quick Start Guide

This guide will help you get started with your new Expo app created from the boilerplate.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** or **yarn** package manager
- **Git** installed
- **Xcode** (for iOS development on Mac)
- **Android Studio** (for Android development)

## 🚀 Creating Your First App

### Step 1: Create the Project

```bash
npx @gufran/expo-boilerplate my-awesome-app
cd my-awesome-app
```

### Step 2: Understand the Structure

Your project has this structure:

```
my-awesome-app/
├── src/
│   ├── screens/         # Your app screens
│   ├── navigation/      # Navigation configuration
│   ├── components/      # Reusable components
│   ├── services/        # API services
│   └── utils/           # Helper functions
├── android/             # Android native files
├── ios/                 # iOS native files
└── app.json            # Expo configuration
```

### Step 3: Configure Firebase

#### Android Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Add an Android app
4. Download `google-services.json`
5. Place it in: `android/app/google-services.json`

#### iOS Setup

1. In Firebase Console, add an iOS app
2. Download `GoogleService-Info.plist`
3. Place it in: `ios/ClubYakka/GoogleService-Info.plist`

### Step 4: Install Dependencies

If you skipped installation during creation:

```bash
npm install
```

For iOS, also install pods:

```bash
cd ios && pod install && cd ..
```

### Step 5: Update Configuration

Edit `app.json`:

```json
{
  "expo": {
    "name": "My Awesome App",
    "slug": "my-awesome-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.myapp",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.myapp",
      "versionCode": 1
    }
  }
}
```

### Step 6: Run Your App

Start the Metro bundler:

```bash
npm start
```

In a new terminal, run on your platform:

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 🔧 Common Customizations

### Change App Name

1. Update `app.json`:
```json
{
  "expo": {
    "name": "Your New Name"
  }
}
```

2. Update `package.json`:
```json
{
  "name": "your-new-name"
}
```

### Change App Icon

Replace these files:
- `assets/icon.png` (1024x1024)
- `assets/adaptive-icon.png` (Android)

### Change Splash Screen

Replace:
- `assets/splash.png` (1242x2436)

### Update App Colors

Edit `src/constants/theme.ts`:

```typescript
export const colors = {
  primary: '#your-color',
  secondary: '#your-color',
  // ... other colors
};
```

## 🎯 Your First Feature

Let's add a simple screen:

### 1. Create a New Screen

Create `src/screens/MyNewScreen.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyNewScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My New Screen!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default MyNewScreen;
```

### 2. Add to Navigation

Edit `src/navigation/MainStack.tsx`:

```typescript
import MyNewScreen from '../screens/MyNewScreen';

// Add to the stack
<Stack.Screen 
  name="MyNewScreen" 
  component={MyNewScreen}
  options={{ title: 'My Screen' }}
/>
```

### 3. Navigate to It

From any screen:

```typescript
import { useNavigation } from '@react-navigation/native';

const MyComponent = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('MyNewScreen');
  };

  return (
    <Button title="Go to My Screen" onPress={handlePress} />
  );
};
```

## 🌐 Making API Calls

### 1. Create API Service

Edit `src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
});

export const fetchUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};
```

### 2. Use in Component

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../services/api';

const MyScreen = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error!</Text>;

  return (
    <View>
      {data.map(user => (
        <Text key={user.id}>{user.name}</Text>
      ))}
    </View>
  );
};
```

## 💾 Using Storage

```typescript
import { storage } from '../utils/storage';

// Save data
storage.set('user', { name: 'John', id: 1 });

// Get data
const user = storage.getString('user');

// Remove data
storage.delete('user');

// Clear all
storage.clearAll();
```

## 🔔 Push Notifications

The boilerplate includes notification setup. To test:

1. Ensure Firebase is configured
2. Request permissions:

```typescript
import { NotificationManager } from '../utils/NotificationManager';

const requestPermission = async () => {
  const hasPermission = await NotificationManager.requestPermission();
  if (hasPermission) {
    const token = await NotificationManager.getToken();
    console.log('FCM Token:', token);
  }
};
```

## 📸 Image Picker

```typescript
import { pickImage } from '../utils/imagePicker';

const handlePickImage = async () => {
  const result = await pickImage();
  if (result) {
    console.log('Selected image:', result.uri);
    // Use the image
  }
};
```

## 🐛 Debugging

### View Logs

```bash
# iOS Simulator
npx react-native log-ios

# Android Emulator
npx react-native log-android
```

### Clear Cache

```bash
npm run clear
```

### Clean Build (Android)

```bash
npm run clean
```

## 📱 Building for Production

### Android

```bash
cd android
./gradlew assembleRelease
cd ..
```

Find APK at: `android/app/build/outputs/apk/release/app-release.apk`

### iOS

1. Open `ios/ClubYakka.xcworkspace` in Xcode
2. Select your device/simulator
3. Product -> Archive
4. Follow distribution steps

## 🆘 Getting Help

### Common Issues

**Metro bundler won't start:**
```bash
npm run clear
```

**Android build fails:**
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**iOS build fails:**
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

**Dependencies issues:**
```bash
rm -rf node_modules
npm install
```

## 📚 Next Steps

1. ✅ Customize your app's colors and theme
2. ✅ Add your API endpoints
3. ✅ Configure Firebase properly
4. ✅ Add your own screens and features
5. ✅ Set up environment variables
6. ✅ Configure app signing for production

## 🎓 Learning Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TanStack Query](https://tanstack.com/query)

## 💡 Tips

1. **Use TypeScript** - Get better autocomplete and fewer bugs
2. **Test on Real Devices** - Emulators don't show everything
3. **Keep Dependencies Updated** - But test after updates
4. **Follow React Native Patterns** - Check official docs
5. **Use Version Control** - Commit often

---

**Need more help?** Check the [full README](./README.md) or open an issue on GitHub!

Happy coding! 🚀
