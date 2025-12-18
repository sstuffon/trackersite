# Add to Home Screen - iOS Instructions

## For Users (iPhone)

### Using Safari:
1. Open Safari on your iPhone
2. Navigate to: `https://sstuffon.github.io/trackersite/`
3. Tap the Share button (square with arrow pointing up)
4. Scroll down and tap "Add to Home Screen"
5. Customize the name if desired
6. Tap "Add"

### Using Chrome on iOS:
1. Open Chrome on your iPhone
2. Navigate to: `https://sstuffon.github.io/trackersite/`
3. Tap the Menu button (three dots)
4. Tap "Add to Home Screen"
5. Customize the name if desired
6. Tap "Add"

## Icon Requirements

To complete the setup, you need to add icon files:

1. **apple-touch-icon.png** (180x180px) - Place in `public/` directory
   - This is the icon that appears on the home screen
   - Should be a square PNG image
   - Recommended: Simple logo or app icon

2. **icon-192.png** and **icon-512.png** - Place in `public/` directory
   - For PWA manifest
   - 192x192px and 512x512px PNG images

## Creating Icons

You can create these icons using:
- Online tools like https://realfavicongenerator.net/
- Image editing software (Photoshop, GIMP, etc.)
- Or use a simple design tool

Once you have the icons, place them in the `public/` directory and they will be automatically included in the build.

## Current Status

✅ Meta tags added for iOS
✅ Manifest.json created
✅ "Add to Home Screen" functionality enabled
⏳ Icon files need to be added (see above)

The site will work without icons, but custom icons will make it look better on the home screen.

