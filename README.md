# Crypt Cards: Google Play project

The game is plain HTML, CSS and JavaScript. Capacitor wraps it in an Android app. Nothing here needs the internet at play time (fonts are bundled).

```
src/            the game (index.html, css/, js/, fonts/)   <- edit here
www/            generated copy that goes into the app      (npm run build)
tests/          engine tests                               (npm test)
assets/         icon + splash sources                      (python3 store/make_assets.py)
store/          Play Store feature graphic, screenshots, LISTING.md (copy-paste text)
docs/           privacy-policy.html  (host it, Play needs a URL)
scripts/        patch-android.js  (portrait lock, version numbers, target-API check)
.github/        workflow that builds the signed .aab in the cloud
```

## Just want it on your phone? (test APK)
**Build test APK** in GitHub Actions builds only when asked: push a commit whose message starts with `[apk]` (or Actions -> Build test APK -> Run workflow). When it finishes, open the repo's **Releases -> Crypt Cards test APK** on your phone (signed in to GitHub), tap `crypt-cards-test.apk`, and allow installs from your browser when Android asks. It is debug-signed, so before installing a Play Store copy later, uninstall the test one.

## Before anything: change the app id
`capacitor.config.json` -> `appId` is currently `com.yourname.cryptcards`. Make it your own reverse-domain id, for example `com.janedoe.cryptcards`. **It can never change after the app is on Play.** Do this before the first build.

## Path A: no Android Studio (GitHub Actions)
1. Make a free GitHub account, create a **private** repo, upload this folder (keep `.github/`).
2. Create your upload key once (needs Java, or do it in any machine with `keytool`):
   `keytool -genkeypair -v -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`
   Keep the `.jks` file and its passwords safe and backed up. Do not commit it.
3. Repo -> Settings -> Secrets and variables -> Actions, add:
   `ANDROID_KEYSTORE_BASE64` (output of `base64 -w0 upload-keystore.jks`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (upload), `ANDROID_KEY_PASSWORD`.
4. Actions tab -> **Build Android release** -> Run workflow. Download the `.aab` from the run's artifacts.
5. Each new upload to Play needs a higher **versionCode** (the workflow asks for it).

## Path B: on your own computer
Needs Node 22, Java 21 and Android Studio (for the SDK).
```
npm install
npm run build
npx cap add android
npm run assets
npm run sync          # also applies portrait lock + version numbers
npm run open          # opens Android Studio; Build > Generate Signed App Bundle
```
Or `npm run bundle` then sign `android/app/build/outputs/bundle/release/app-release.aab` with `jarsigner` as in the workflow.

## Play Console checklist
- Developer account: US$25 one time, identity verification.
- **New personal accounts (created after 13 Nov 2023) must run a closed test with at least 12 testers opted in for 14 continuous days before applying for production.** Organization accounts are exempt. Budget about three weeks for the first launch.
- New apps must target **Android 16 (API 36)**. This project does (Capacitor 8); `scripts/patch-android.js` fails loudly if it ever drops below.
- Upload the `.aab` (not an apk). Let Google manage app signing (default); your keystore is only the upload key.
- Listing text and form answers: `store/LISTING.md`. Graphics: `store/feature-graphic-1024x500.png`, `store/screenshot-*.png` (1080x1920), icon 512x512 from `assets/icon-only.png` (resize to 512).
- Privacy policy: put `docs/privacy-policy.html` online (GitHub repo -> Settings -> Pages -> main /docs), replace the contact email in it, and paste the URL in Play Console.

## Things I could not test here
The workspace has no Android SDK, so the Android build, the launcher icons on a real device, and the Back button behavior are untested. Run Path A or B once and install the result on your phone (`adb install` of an apk, or an internal test track) before sending anything to testers. The web part (game, fonts, layout) and all engine tests were run.
