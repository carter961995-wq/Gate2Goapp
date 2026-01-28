# Gate2Go Android (React Native)

This folder is intended to live as its own repo for the Google Play app. It stays
separate from the iOS/App Store codebase.

## Package + app identity
- App name: Gate2Go
- Android applicationId/namespace: com.gate2go.app
- Min SDK: 24 (Android 7.0)

## Quick start
1. Install deps: `npm install`
2. Start Metro: `npm start`
3. Run Android: `npm run android`

## Firebase (Android)
1. In Firebase Console, add an Android app with package `com.gate2go.app`.
2. Download `google-services.json` into `android/app/`.
3. Add the Google Services Gradle plugin:
   - In `android/build.gradle`, add the latest
     `classpath("com.google.gms:google-services:<latest>")`.
   - In `android/app/build.gradle`, add
     `apply plugin: "com.google.gms.google-services"`.
4. Sync and rebuild.

## Release checklist (Play Store)
- Enable Play App Signing in Play Console.
- Generate an upload keystore and configure release signing in
  `android/app/build.gradle`.
- Bump `versionCode` and `versionName` for each release.
- Build the AAB: `cd android && ./gradlew bundleRelease`.
- Upload `app-release.aab` to an internal testing track first.

## Split into a standalone repo
This folder is ready to be its own repository. To extract:

```sh
cd gate2go-android
git init
git add .
git commit -m "Initial Gate2Go Android app"
git branch -M main
git remote add origin <YOUR_NEW_REPO_URL>
git push -u origin main
```

## React Native docs
- Environment setup: https://reactnative.dev/docs/set-up-your-environment
- Troubleshooting: https://reactnative.dev/docs/troubleshooting
