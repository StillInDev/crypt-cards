Test-only signing key for the sideload APK (`.github/workflows/apk.yml`). It is the standard
Android debug key format (password `android`) and is committed on purpose so every build is signed
the same way and installs as an update over the last one. It is not the Play upload key; never use it for Play.
