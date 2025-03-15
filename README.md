# HelpKit React Native SDK

<p align="center">
  <img src="https://public.helpkit.co/helpkit_logo_white_with_tagline.png" width="250" alt="HelpKit Logo">
</p>

<p align="center">
  <strong>The Notion-powered help center & support solution for React Native apps</strong>
</p>

<p align="center">
  <a href="https://helpkit.so">Website</a> •
  <a href="https://support.helpkit.so">Documentation</a> •
  <a href="mailto:developers@helpkit.so">Support</a>
</p>

[![npm version](https://img.shields.io/npm/v/@helpkit/helpkit-help-center-react-native.svg)](https://www.npmjs.com/package/@helpkit/helpkit-help-center-react-native)

## Overview

HelpKit provides a seamless way to integrate a customizable help center and support experience into your React Native application. HelpKit is powered by Notion as the backend for writing your help articles. The SDK handles all the complexity of rendering help articles, categories, and contact forms while maintaining your app's look and feel.

## Features

- 📱 Native help center with customizable appearance
- 📝 Use Notion for writing help articles
- 🧭 Category & article browsing
- 📬 Integrated contact form
- 🔍 Search functionality
- 🌐 Multi-language support
- 🤖 AI-powered support (optional)

## Installation

```bash
# Using npm
npm install @helpkit/helpkit-help-center-react-native

# Using yarn
yarn add @helpkit/helpkit-help-center-react-native

# Using Expo
expo install @helpkit/helpkit-help-center-react-native react-native-webview react-native-safe-area-context
```

### Required dependencies

This package depends on:

- `react-native-webview`
- `react-native-safe-area-context`

If your project doesn't have them already, install them:

```bash
# Using npm
npm install react-native-webview react-native-safe-area-context

# Using yarn
yarn add react-native-webview react-native-safe-area-context
```

### Try the Example App

This repository includes a fully functional Expo example app that demonstrates all SDK features. To run the example:

```bash
# Clone the repository
git clone https://github.com/HelpkitHQ/helpkit-help-center-react-native.git

# Navigate to the example directory
cd helpkit-react-native-sdk/example

# Install dependencies
npm install
# or with yarn
yarn install

# Start the Expo development server
npx expo start
```

The example app shows all SDK features in action, including opening help articles, categories, the contact form, and setting different language versions.

## Basic Setup

### 1. Add the HelpKit component to your app's root

Place the `HelpKit` component near the root of your application, such as in your `_layout.tsx` file for Expo Router-based apps:

```jsx
import { HelpKit } from '@helpkit/helpkit-help-center-react-native'

// Inside your root component
return (
  <>
    {/* Your app components */}
    <HelpKit projectId="YOUR_PROJECT_ID" />
  </>
)
```

Example with Expo Router:

```jsx
function RootLayoutNav() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <HelpKit projectId="YOUR_PROJECT_ID" />
    </ThemeProvider>
  )
}
```

### 2. Access the help center from anywhere in your app

Once set up, you can trigger the help center from anywhere in your app:

```jsx
import { HelpKitSDK } from '@helpkit/helpkit-help-center-react-native'

// Open the help center
HelpKitSDK.open()
```

## Usage Examples

### Opening the Help Center

```jsx
import { HelpKitSDK } from '@helpkit/helpkit-help-center-react-native'

const openHelpCenter = () => {
  HelpKitSDK.open()
}

// In your component
<Button title="Help Center" onPress={openHelpCenter} />
```

### Opening the Contact Form

```jsx
HelpKitSDK.openContact()
```

### Opening a Specific Article

```jsx
// Open an article using its ID
HelpKitSDK.openArticle('YOUR_ARTICLE_ID')
```

### Opening a Specific Category

```jsx
// Open a category using its ID
HelpKitSDK.openCategory('YOUR_CATEGORY_ID')
```

### Setting a Different Language Version

```jsx
// Switch to a different language version
HelpKitSDK.setVersion('de')
HelpKitSDK.open()

// Switch back to the default version
HelpKitSDK.setVersion('')
HelpKitSDK.open()
```

### Pre-filling Contact Form Fields

```jsx
// Pre-fill the contact form with user information
HelpKitSDK.setContactFields({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Support Request',
  metadata: JSON.stringify({
    platform: 'ios',
    version: '15.0',
    brand: 'Apple',
    model: 'iPhone',
    appVersion: '1.0.0',
    timestamp: new Date().toISOString(),
  }),
})

// Then open the contact form
HelpKitSDK.openContact()
```

## Configuration Options

When initializing the HelpKit component, you can provide various configuration options:

```jsx
<HelpKit
  projectId="YOUR_PROJECT_ID"
  config={{
    // Using a static string
    headerTitle: 'Custom Menu Bar Title',
    // OR using a function for i18n support
    headerTitle: () => i18n.t('helpCenter'),
    version: 'de',
    debug: true,
  }}
/>
```

### Internationalization (i18n) Support

HelpKit supports internationalization for the modal header title through a function prop:

```jsx
// Example with i18n-js
import * as i18n from 'i18n-js'
<HelpKit
  projectId="your-project"
  config={{
    headerTitle: () => i18n.t('helpCenter'),
  }}
/>
```

This function will be called each time the component renders, ensuring the title always displays in the current language.

### Available Config Options

| Option        | Type               | Description                                                                                                                  |
| ------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `headerTitle` | string or function | Custom title for the help center modal header. Can be a static string or a function that returns a string (for i18n support) |
| `version`     | string             | Default language version (e.g., 'en', 'de')                                                                                  |
| `debug`       | boolean            | Enable debug logs                                                                                                            |

## API Reference

### HelpKit Component

```jsx
<HelpKit projectId="YOUR_PROJECT_ID" config={options} />
```

| Prop        | Type   | Required | Description                          |
| ----------- | ------ | -------- | ------------------------------------ |
| `projectId` | string | Yes      | Your HelpKit project name identifier |
| `config`    | object | No       | Configuration options                |

### HelpKitSDK Methods

| Method                     | Parameters                                     | Description                   |
| -------------------------- | ---------------------------------------------- | ----------------------------- |
| `open()`                   | `options?: HelpKitOptions`                     | Opens the help center home    |
| `openContact()`            | `options?: HelpKitOptions`                     | Opens the contact form        |
| `openArticle(articleId)`   | `articleId: string, options?: HelpKitOptions`  | Opens a specific article      |
| `openCategory(categoryId)` | `categoryId: string, options?: HelpKitOptions` | Opens a specific category     |
| `setVersion(version)`      | `version: string`                              | Sets the project version      |
| `setContactFields(fields)` | `fields: ContactFields`                        | Pre-fills contact form fields |
| `close()`                  | -                                              | Closes the help center modal  |

### ContactFields Interface

```typescript
interface ContactFields {
  name?: string
  email?: string
  subject?: string
  metadata?: string // Needs to be a string | JSON stringify objects for metadata
}
```

## Getting Help

- Visit our [help center](https://support.helpkit.so)
- Report issues on [GitHub](https://github.com/HelpkitHQ/helpkit-help-center-react-native/issues)

## License

This project has a custom license - see the LICENSE file for details.

---

Created with ❤️ by [HelpKit](https://www.helpkit.so) – Show us support by ⭐️ this project if it helped you!
