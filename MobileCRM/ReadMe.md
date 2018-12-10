# Resco Mobile CRM JSDev Edition
Offline HTML development/debugging version of Resco Mobile CRM app.
This version of app opens a port for Javascript debugger and allows the HTML root overriding. Don't use in production!!!
## Android
### Installation

* Allow "Unknown Sources" on your Android device in Settings / Security
* Copy the APK to your device via USB (e.g. to Downloads folder)
* Locate the APK on your device (e.g. Downloads app)
* Tap on it and follow instructions (might be specific for particular devices)
 
### Installation using ADB (Android SDK)

	adb install MobileCRM_JSDev.apk

### Overriding Offline HTML root

JSDev application can be configured to take Offline HTML files from custom URL instead of local app storage using following URL:

	mobilecrm://htmlRoot?set=http://192.168.0.1:8080
	(where http://192.168.0.1:8080 is URL of your local or remote web server containing the development copy of your Offline HTML files)

It's possible to open this URL also via ADB:

	adb shell am start -a android.intent.action.VIEW -d mobilecrm://htmlRoot?set=http://192.168.0.1:8080

## Windows desktop
Install the MSI and use Mobile CRM Integration tool to override the HTML root to your solution files.

## iOS
## iPhone Simulator
### Installing the JSDev build

* Open Xcode menu Xcode / Open Developer Tool / iOS Simulator
* Unzip iPhone Simulator app
* Open Terminal and type command:

	xcrun simctl install booted MobileCrm.app

### Locating the application data
Applications installed on iOS Simulator have the app data mounted to the MacOS file system.
To locate the Mobile CRM app data Offline HTML root folder, go to following folder:

	~/Library/Developer/CoreSimulator/Devices/{Simulator-ID}/data/Containers/Data/Application/{Application-ID}/Documents/WWW
	where:
		{Simulator-ID} can be found by command: 	xcrun simctl list | grep Booted
		{Application-ID} must be found by searching one of your files, e.g. JSBridge.js

### Overriding Offline HTML root

JSDev application can be configured to take Offline HTML files from custom URL instead of local app storage using following URL:
	mobilecrm://htmlRoot?set=http://192.168.0.1:8080
	(where http://192.168.0.1:8080 is URL of  local or remote web server containing the development copy of your Offline HTML files)

It's possible to open this URL also using Xcode command line tools:
	xcrun simctl openurl booted mobilecrm://htmlRoot?set=http://192.168.0.1:8080

## iPhone/iPad

### Installing the JSDev build
* Create iOS Developer account at https://developer.apple.com
* Create Wildcard App ID for bundle ID "*" (Identifiers / App IDs)
* Create iOS app development provisioning profile for this AppID and download it (as Wildcard.mobileprovision file)

* Log in to your account from Xcode (Preferences / Accounts)
* Create iOS Development signing identity (View Details button)
 
* Download iResign tool from https://www.resco.net/downloads/iReSign.app.zip
* Unzip it and run it
* Provide the path to IPA, path to Wildcard.mobileprovision file and choose your development signing identity
* Resign the IPA and deploy it via iTunes or Xcode/Devices.

### Overriding Offline HTML root
JSDev application can be configured to take Offline HTML files from custom URL instead of local app storage using following URL:

	mobilecrm://htmlRoot?set=http://192.168.0.1:8080
	(where http://192.168.0.1:8080 is URL of your local or remote web server containing the development copy of your Offline HTML files)
