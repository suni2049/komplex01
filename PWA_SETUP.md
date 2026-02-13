# PWA Setup Documentation

## Overview
KOMPLEX-01 is now fully configured as a Progressive Web App (PWA) and ready to be wrapped into an Android APK.

## What's Been Configured

### 1. PWA Icons
- **Location**: `/public/icons/`
- **Generated Icons**:
  - `icon-192.png` (192x192) - Standard app icon
  - `icon-512.png` (512x512) - High-res app icon
  - `icon-maskable-512.png` (512x512) - Maskable icon for Android adaptive icons

### 2. Web App Manifest
- **File**: `dist/manifest.webmanifest` (auto-generated during build)
- **Configuration**:
  - App name: KOMPLEX-01 — Training System
  - Display mode: `standalone` (full-screen app experience)
  - Orientation: `portrait` (locked to portrait mode)
  - Theme color: `#0A0A0A` (dark theme)
  - Categories: fitness, health, sports

### 3. Service Worker
- **File**: `dist/sw.js` (auto-generated during build)
- **Features**:
  - Offline support with precaching
  - Runtime caching for Google Fonts
  - Auto-update on new versions
  - Clean up outdated caches

### 4. Meta Tags (index.html)
Enhanced with comprehensive meta tags for:
- **iOS**: Apple touch icons, web app capable, status bar styling
- **Android**: Mobile web app capable
- **Microsoft**: Tile color and image

## How to Convert to APK

### Option 1: PWA Builder (Recommended for Beginners)
1. Build your production files: `npm run build`
2. Deploy the `dist` folder to a web server (must be HTTPS)
3. Go to [PWABuilder.com](https://www.pwabuilder.com/)
4. Enter your deployed URL
5. Click "Package For Stores"
6. Select Android and download the APK

### Option 2: Bubblewrap (Google's Official Tool)
```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Initialize the project (run in your deployed site's root URL)
bubblewrap init --manifest https://yourdomain.com/manifest.webmanifest

# Build the APK
bubblewrap build

# The APK will be in ./app-release-signed.apk
```

### Option 3: Capacitor (Full Native Integration)
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# Initialize Capacitor
npx cap init

# Add Android platform
npx cap add android

# Build your web app
npm run build

# Copy web assets to Android
npx cap copy android

# Open in Android Studio
npx cap open android

# Build APK in Android Studio
```

### Option 4: Trusted Web Activity (TWA)
Use Android Studio to create a TWA wrapper:
1. Install Android Studio
2. Create new project with "Basic Activity"
3. Add TWA dependencies in build.gradle
4. Configure Digital Asset Links
5. Build the APK

## Testing the PWA

### Test Locally
```bash
# Build the production version
npm run build

# Preview the production build
npm run preview
```

### Test PWA Features
1. Open Chrome DevTools
2. Go to "Application" tab
3. Check:
   - **Manifest**: Should show all app details
   - **Service Workers**: Should be registered and active
   - **Cache Storage**: Should show workbox caches
   - **Icons**: Should display all sizes

### Test Installation
1. Open your site in Chrome (mobile or desktop)
2. Look for the "Install" button in the address bar
3. Click to install the PWA
4. App should open in standalone mode

### Lighthouse PWA Audit
```bash
# Run Lighthouse audit
npx lighthouse https://your-deployed-url --view
```

Check that you get high scores for:
- Progressive Web App (should be 100)
- Performance
- Accessibility
- Best Practices

## Deployment Requirements

### For APK Wrapping, You Must:
1. **Deploy to HTTPS**: PWAs require HTTPS (localhost is exempt for testing)
2. **Valid SSL Certificate**: Use Let's Encrypt or your hosting provider's SSL
3. **Accessible Manifest**: Ensure `/manifest.webmanifest` is publicly accessible
4. **Accessible Service Worker**: Ensure `/sw.js` is publicly accessible

### Recommended Hosting Options
- **Vercel**: `npm install -g vercel && vercel --prod`
- **Netlify**: Drag & drop `dist` folder to app.netlify.com
- **GitHub Pages**: Push dist folder to gh-pages branch
- **Firebase Hosting**: `firebase deploy`

## File Structure
```
komplex01/
├── public/
│   ├── icons/               # PWA icons
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── icon-maskable-512.png
│   ├── icon.svg             # Source icon
│   └── favicon.svg
├── src/                     # Your React app
├── dist/                    # Built PWA (after npm run build)
│   ├── manifest.webmanifest # Auto-generated
│   ├── sw.js               # Service worker
│   ├── registerSW.js       # SW registration
│   └── ...
├── vite.config.ts          # PWA configuration
├── index.html              # Enhanced with PWA meta tags
└── generate-icons.js       # Icon generation script
```

## Maintenance

### Regenerating Icons
If you update the source icon (`public/icon.svg`):
```bash
node generate-icons.js
```

### Updating PWA Configuration
Edit `vite.config.ts` and rebuild:
```bash
npm run build
```

## Troubleshooting

### Service Worker Not Registering
- Ensure you're on HTTPS (or localhost)
- Check browser console for errors
- Clear cache and hard reload

### Manifest Not Loading
- Verify manifest.webmanifest is accessible
- Check for JSON syntax errors
- Ensure correct MIME type (application/manifest+json)

### Icons Not Showing
- Check icons exist in `/public/icons/`
- Verify paths in manifest match actual file locations
- Clear browser cache

### App Not Installable
- Run Lighthouse audit to see what's missing
- Ensure service worker is registered
- Check manifest has required fields (name, icons, start_url)

## Next Steps

1. **Deploy your app** to an HTTPS server
2. **Test the PWA** using Chrome DevTools
3. **Run Lighthouse audit** to ensure 100% PWA score
4. **Choose an APK builder** (PWABuilder recommended for quick start)
5. **Generate your APK**
6. **Test the APK** on an Android device
7. **(Optional) Publish** to Google Play Store

## Additional Resources

- [PWA Builder Documentation](https://docs.pwabuilder.com/)
- [Google PWA Guide](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Android TWA Guide](https://developer.chrome.com/docs/android/trusted-web-activity/)

---

**Note**: The current configuration is optimized for Android APK wrapping with:
- Standalone display mode
- Portrait orientation lock
- Comprehensive offline support
- Optimized caching strategies
- All required icons and meta tags
